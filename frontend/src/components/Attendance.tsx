import * as React from 'react';
import { useState, useEffect } from 'react';
import { AttendanceRecord, Employee } from '../types';
import { fetchAttendance, markAttendance } from '../services/api';
import Calendar from './ui/Calendar';
import Dialog from './ui/Dialog';
import Select from './ui/Select';

interface AttendanceProps {
  employees: Employee[];
  onToast: (msg: string, type: 'success' | 'error') => void;
}

const Attendance: React.FC<AttendanceProps> = ({ employees, onToast }) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  
  // Edit State
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null);
  
  // Mark Attendance State
  const [isMarkingOpen, setIsMarkingOpen] = useState(false);
  const [markSearch, setMarkSearch] = useState('');
  const [markData, setMarkData] = useState({ employeeId: '', status: 'Present' });

  useEffect(() => {
    loadAttendance();
  }, [date]);

  const loadAttendance = async () => {
    setIsLoading(true);
    try {
      const data = await fetchAttendance(date);
      setRecords(data.attendance_records || []);
    } catch (error) {
      console.error('Error loading attendance:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!markData.employeeId) return;
    
    try {
      await markAttendance(markData.employeeId, markData.status, date);
      onToast('Logged successfully!', 'success');
      setIsMarkingOpen(false);
      loadAttendance();
      setMarkData({ employeeId: '', status: 'Present' });
    } catch (error) {
      onToast('Error marking attendance', 'error');
    }
  };

  const stats = [
    { label: 'Present', value: records.filter(r => r.status === 'Present').length, color: 'text-emerald-600', bg: 'bg-emerald-50', icon: 'check_circle' },
    { label: 'On Leave', value: records.filter(r => r.status === 'On Leave').length, color: 'text-blue-600', bg: 'bg-blue-50', icon: 'flight' },
    { label: 'Absent', value: records.filter(r => r.status === 'Absent').length, color: 'text-rose-600', bg: 'bg-rose-50', icon: 'cancel' },
  ];

  const handleExport = () => {
      const headers = "ID,Employee Name,Role,Date,Status\n";
      const rows = records.map(r => {
        const name = r.employeeName || 'Unknown';
        return `${r.id},"${name}",${r.role},"${r.date}",${r.status}`;
      }).join("\n");
      const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(headers + rows);
      const link = document.createElement("a");
      link.href = csvContent;
      link.download = `attendance_${date}.csv`;
      link.click();
  };

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRecords = records.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(records.length / itemsPerPage);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div className="animate-in fade-in duration-500 pb-10">
      <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">Attendance</h1>
          <p className="mt-2 text-base text-slate-500 font-medium tracking-tight">Daily check-in logs and performance data.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="w-56">
             <Calendar value={date} onChange={setDate} />
          </div>
          <button 
            onClick={() => setIsMarkingOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 active:scale-95"
          >
            <span className="material-symbols-outlined text-xl">how_to_reg</span>
            <span>Mark Attendance</span>
          </button>
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-all shadow-sm active:scale-95"
          >
            <span className="material-symbols-outlined text-xl">download</span>
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow z-0 hover:z-10">
             <div>
                <span className={`text-3xl font-bold ${stat.color} block tracking-tighter`}>{stat.value}</span>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1 block">{stat.label}</span>
             </div>
             <div className={`h-14 w-14 rounded-2xl flex items-center justify-center ${stat.bg}`}>
                <span className={`material-symbols-outlined text-2xl ${stat.color}`}>{stat.icon}</span>
             </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
        {records.length > 0 ? (
          <>
            <div className="overflow-x-auto custom-scrollbar flex-1">
              <table className="w-full text-left text-sm border-collapse">
                <thead className="bg-slate-50/50">
                  <tr className="border-b border-slate-100">
                    <th className="px-6 py-5 font-semibold text-slate-400 text-xs uppercase tracking-widest">ID</th>
                    <th className="px-6 py-5 font-semibold text-slate-400 text-xs uppercase tracking-widest">Employee</th>
                    <th className="px-6 py-5 font-semibold text-slate-400 text-xs uppercase tracking-widest">Status</th>
                    <th className="px-6 py-5 font-semibold text-slate-400 text-xs uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {currentRecords.map((record) => (
                    <tr key={record.id} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs font-bold text-slate-600">{record.employeeId}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img src={record.avatar} alt={record.employeeName} className="h-10 w-10 rounded-full object-cover border border-slate-100 shadow-sm" />
                          <div>
                            <div className="font-bold text-slate-900">{record.employeeName}</div>
                            <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">{record.role}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-black uppercase tracking-wider
                          ${record.status === 'Present' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 
                            record.status === 'On Leave' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                            'bg-rose-50 text-rose-700 border border-rose-100'
                          }`}>
                          {record.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                            onClick={() => setEditingRecord(record)}
                            className="p-2 rounded-lg text-slate-400 hover:text-slate-900 transition-colors"
                        >
                          <span className="material-symbols-outlined text-lg">edit</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="px-6 py-4 border-t border-slate-100 bg-white/80 backdrop-blur-sm flex items-center justify-between mt-auto">
               <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  Showing <span className="text-slate-900">{indexOfFirstItem + 1}</span> - <span className="text-slate-900">{Math.min(indexOfLastItem, records.length)}</span> of {records.length}
               </span>
               <div className="flex items-center gap-2">
                  <button 
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                    className="h-9 px-4 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-widest hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all bg-white shadow-sm"
                  >
                    Prev
                  </button>
                  <button 
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className="h-9 px-4 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-widest hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all bg-white shadow-sm"
                  >
                    Next
                  </button>
               </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50/10 gap-4">
             <div className="h-24 w-24 rounded-full bg-white shadow-xl shadow-slate-200/50 flex items-center justify-center mb-2 border border-slate-100">
                <span className="material-symbols-outlined text-4xl text-slate-200">calendar_today</span>
             </div>
             <div className="text-center">
                <p className="font-black text-slate-900 text-lg tracking-tight">Timeline Empty</p>
                <p className="text-sm text-slate-400 max-w-[240px] mt-1 font-medium leading-relaxed">No attendance logs recorded for {date}. Start by marking team activity.</p>
             </div>
             <button 
               onClick={() => setIsMarkingOpen(true)}
               className="mt-2 text-sm font-bold text-slate-900 hover:scale-105 transition-transform bg-slate-100 px-6 py-2.5 rounded-xl border border-slate-200"
             >
                Initialize Logs
             </button>
          </div>
        )}
      </div>

      {/* Mark Attendance Dialog */}
      <Dialog
        isOpen={isMarkingOpen}
        onClose={() => {
          setIsMarkingOpen(false);
          setMarkSearch('');
        }}
        title="Mark Attendance"
        description={`Logging workforce presence for ${date}`}
      >
        <form onSubmit={handleMarkSubmit} className="space-y-6 py-4">
            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Select Employee</label>
                    {(() => {
                        // Get employee IDs that already have attendance for this date
                        const markedEmployeeIds = records.map(r => r.employeeId);
                        
                        const filtered = employees.filter(e => 
                            !markedEmployeeIds.includes(e.id) && // Exclude already marked employees
                            (e.fullName.toLowerCase().includes(markSearch.toLowerCase()) || 
                            e.id.toLowerCase().includes(markSearch.toLowerCase()))
                        );
                        const selectedOptions = [
                            { value: '', label: 'Select a member...' },
                            ...filtered.map(e => ({ value: e.id, label: `${e.fullName} (${e.id})` }))
                        ];
                        return (
                            <div>
                                <Select 
                                    value={markData.employeeId}
                                    onChange={(val) => setMarkData({...markData, employeeId: val})}
                                    options={selectedOptions}
                                    searchValue={markSearch}
                                    onSearchChange={setMarkSearch}
                                    isSearchable={true}
                                />
                                {markSearch && filtered.length === 0 && (
                                    <p className="text-xs text-slate-400 mt-2 pl-1">No available employees found matching "{markSearch}"</p>
                                )}
                                {filtered.length === 0 && !markSearch && (
                                    <p className="text-xs text-slate-500 mt-2 pl-1">All employees have been marked for today</p>
                                )}
                            </div>
                        );
                    })()}
                </div>
            </div>
            <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Activity Status</label>
                <Select 
                    value={markData.status}
                    onChange={(val) => setMarkData({...markData, status: val})}
                    options={[
                        { value: 'Present', label: 'Present' },
                        { value: 'Absent', label: 'Absent' },
                        { value: 'On Leave', label: 'On Leave' }
                    ]}
                />
            </div>
            <div className="flex justify-end gap-3 pt-4">
                <button
                    type="button"
                    onClick={() => setIsMarkingOpen(false)}
                    className="h-10 px-6 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={!markData.employeeId}
                    className="h-10 px-8 rounded-xl bg-slate-900 text-sm font-bold text-white hover:bg-slate-800 transition-all disabled:opacity-50 shadow-lg shadow-slate-900/10"
                >
                    Mark Attendance
                </button>
            </div>
        </form>
      </Dialog>

      {/* Edit Attendance Dialog (Simulated for this demo) */}
      <Dialog
        isOpen={!!editingRecord}
        onClose={() => setEditingRecord(null)}
        title="Update Entry"
        description={`Modifying record for ${editingRecord?.employeeName}`}
      >
        {/* Simplified edit for now */}
        <div className="py-6 text-center">
            <p className="text-sm text-slate-500 font-medium">Detailed record modification is coming soon to the administrative console.</p>
            <button 
                onClick={() => setEditingRecord(null)}
                className="mt-6 h-10 px-8 rounded-xl bg-slate-100 text-slate-900 text-sm font-bold hover:bg-slate-200 transition-all"
            >
                Understood
            </button>
        </div>
      </Dialog>
    </div>
  );
};

export default Attendance;
