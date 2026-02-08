import * as React from 'react';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { AttendanceRecord, Employee } from '../types';
import { fetchAttendance, markAttendance, updateAttendance } from '../services/api';
import Calendar from './ui/Calendar';
import Dialog from './ui/Dialog';
import Select from './ui/Select';
import { formatDemoId } from '../utils/demoFormat';

interface AttendanceProps {
  employees: Employee[];
  onToast: (msg: string, type: 'success' | 'error') => void;
}

const getAvatarSrc = (avatar?: string) => {
  const v = (avatar || '').trim();
  if (v) return v;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><rect width="128" height="128" rx="64" fill="#0F172A"/><circle cx="64" cy="52" r="20" fill="#334155"/><path d="M24 118c8-26 28-38 40-38s32 12 40 38" fill="#334155"/></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

const Attendance: React.FC<AttendanceProps> = ({ employees, onToast }) => {
  const getTodayLocal = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const [date, setDate] = useState(getTodayLocal());
  const [isAutoToday, setIsAutoToday] = useState(true);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  
  // Edit State
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null);
  const [editStatus, setEditStatus] = useState('Present');
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Mark Attendance State
  const [isMarkingOpen, setIsMarkingOpen] = useState(false);
  const [markSearch, setMarkSearch] = useState('');
  const [markStatus, setMarkStatus] = useState('Present');
  const [markSelected, setMarkSelected] = useState<Set<string>>(new Set());
  const [isBulkMarking, setIsBulkMarking] = useState(false);
  const [listSearch, setListSearch] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  const getEmployeeAvatarForRecord = useCallback(
    (employeeId: string, recordAvatar?: string) => {
      const emp = employees.find((e) => e.id === employeeId);
      return getAvatarSrc(emp?.avatar || recordAvatar);
    },
    [employees]
  );

  const handleDateChange = useCallback((nextDate: string) => {
    setDate(nextDate);
    const today = getTodayLocal();
    setIsAutoToday(nextDate === today);
    setCurrentPage(1);
  }, []);

  useEffect(() => {
    if (!isAutoToday) return;

    const tick = () => {
      const today = getTodayLocal();
      setDate(prev => (prev === today ? prev : today));
    };

    tick();

    const onFocus = () => tick();
    const onVisibility = () => {
      if (!document.hidden) tick();
    };

    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibility);

    const now = new Date();
    const nextMidnight = new Date(now);
    nextMidnight.setHours(24, 0, 0, 0);
    const msUntilMidnight = nextMidnight.getTime() - now.getTime();

    const id = window.setTimeout(() => {
      tick();
      const intervalId = window.setInterval(tick, 60_000);
      (window as any).__attendanceMidnightIntervalId = intervalId;
    }, msUntilMidnight);

    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibility);
      window.clearTimeout(id);
      const intervalId = (window as any).__attendanceMidnightIntervalId;
      if (intervalId) window.clearInterval(intervalId);
      (window as any).__attendanceMidnightIntervalId = undefined;
    };
  }, [isAutoToday]);

  const loadAttendance = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchAttendance(date);
      setRecords(data.attendance_records || []);
    } catch (error) {
      console.error('Error loading attendance:', error);
    } finally {
      setIsLoading(false);
    }
  }, [date]);

  useEffect(() => {
    loadAttendance();
  }, [loadAttendance]);

  useEffect(() => {
    const mql = window.matchMedia('(max-width: 640px)');
    const apply = () => setIsMobile(!!mql.matches);
    apply();
    if ('addEventListener' in mql) {
      mql.addEventListener('change', apply);
      return () => mql.removeEventListener('change', apply);
    }
    (mql as any).addListener?.(apply);
    return () => (mql as any).removeListener?.(apply);
  }, []);

  useEffect(() => {
    if (editingRecord) setEditStatus(editingRecord.status);
  }, [editingRecord]);

  const handleEditSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;

    setIsUpdating(true);
    try {
      await updateAttendance(editingRecord.id, { status: editStatus });
      onToast('Attendance updated!', 'success');
      window.dispatchEvent(new CustomEvent('attendance:updated'));
      setEditingRecord(null);
      loadAttendance();
    } catch (error) {
      onToast('Error updating attendance', 'error');
    } finally {
      setIsUpdating(false);
    }
  }, [editStatus, editingRecord, loadAttendance, onToast]);

  const handleBulkMark = useCallback(async (employeeIds: string[], status: string) => {
    if (!employeeIds.length) return;

    setIsBulkMarking(true);
    try {
      for (const id of employeeIds) {
        await markAttendance(id, status, date);
      }
      onToast('Logged successfully!', 'success');
      window.dispatchEvent(new CustomEvent('attendance:updated'));
      setIsMarkingOpen(false);
      setMarkSearch('');
      setMarkSelected(new Set());
      setMarkStatus('Present');
      loadAttendance();
    } catch (error) {
      onToast('Error marking attendance', 'error');
    } finally {
      setIsBulkMarking(false);
    }
  }, [date, loadAttendance, onToast]);

  const stats = useMemo(() => {
    return [
      { label: 'Present', value: records.filter(r => r.status === 'Present').length, color: 'text-emerald-600', bg: 'bg-emerald-50', icon: 'check_circle' },
      { label: 'On Leave', value: records.filter(r => r.status === 'On Leave').length, color: 'text-blue-600', bg: 'bg-blue-50', icon: 'flight' },
      { label: 'Absent', value: records.filter(r => r.status === 'Absent').length, color: 'text-rose-600', bg: 'bg-rose-50', icon: 'cancel' },
    ];
  }, [records]);

  const handleExport = useCallback(() => {
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
  }, [date, records]);

  const filteredRecords = useMemo(() => {
    const q = (listSearch || '').trim().toLowerCase();
    if (!q) return records;
    return records.filter(r => {
      const id = (r.employeeId || '').toLowerCase();
      const name = (r.employeeName || '').toLowerCase();
      const role = (r.role || '').toLowerCase();
      return id.includes(q) || name.includes(q) || role.includes(q);
    });
  }, [listSearch, records]);

  // Pagination Logic
  const indexOfLastItem = useMemo(() => currentPage * itemsPerPage, [currentPage, itemsPerPage]);
  const indexOfFirstItem = useMemo(() => indexOfLastItem - itemsPerPage, [indexOfLastItem, itemsPerPage]);
  const currentRecords = useMemo(() => filteredRecords.slice(indexOfFirstItem, indexOfLastItem), [filteredRecords, indexOfFirstItem, indexOfLastItem]);
  const totalPages = useMemo(() => Math.ceil(filteredRecords.length / itemsPerPage), [itemsPerPage, filteredRecords.length]);

  const markedEmployeeIds = useMemo(() => new Set(records.map(r => r.employeeId)), [records]);
  const availableEmployees = useMemo(() => {
    const q = (markSearch || '').trim().toLowerCase();
    return employees.filter(e => {
      if (markedEmployeeIds.has(e.id)) return false;
      if (!q) return true;
      return (e.fullName || '').toLowerCase().includes(q) || (e.id || '').toLowerCase().includes(q);
    });
  }, [employees, markSearch, markedEmployeeIds]);

  const toggleMarkSelected = useCallback((employeeId: string) => {
    setMarkSelected(prev => {
      const next = new Set(prev);
      if (next.has(employeeId)) next.delete(employeeId);
      else next.add(employeeId);
      return next;
    });
  }, []);

  const clearMarkSelected = useCallback(() => {
    setMarkSelected(new Set());
  }, []);

  const selectAllAvailable = useCallback(() => {
    setMarkSelected(new Set(availableEmployees.map(e => e.id)));
  }, [availableEmployees]);

  const markSelectedEmployees = useCallback(async () => {
    const ids = Array.from(markSelected);
    await handleBulkMark(ids, markStatus);
  }, [handleBulkMark, markSelected, markStatus]);

  const markAllAvailable = useCallback(async (status: string) => {
    const ids = availableEmployees.map(e => e.id);
    await handleBulkMark(ids, status);
  }, [availableEmployees, handleBulkMark]);

  const renderMarkAttendanceContent = () => (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Search</label>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
            <input
              value={markSearch}
              onChange={(e) => setMarkSearch(e.target.value)}
              placeholder="Search by name or employee id"
              className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm font-semibold text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
            />
          </div>
          <button
            type="button"
            onClick={() => setMarkSearch((v) => v)}
            className="h-11 px-4 rounded-xl border border-slate-200 bg-white text-xs font-black uppercase tracking-widest text-slate-700 hover:bg-slate-50"
          >
            Search
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="text-[11px] font-black uppercase tracking-widest text-slate-400">
          Selected: <span className="text-slate-900">{markSelected.size}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={selectAllAvailable}
            disabled={availableEmployees.length === 0}
            className="h-9 px-3 rounded-xl border border-slate-200 bg-white text-[11px] font-black uppercase tracking-widest text-slate-700 hover:bg-slate-50 disabled:opacity-40"
          >
            Select all
          </button>
          <button
            type="button"
            onClick={clearMarkSelected}
            disabled={markSelected.size === 0}
            className="h-9 px-3 rounded-xl border border-slate-200 bg-white text-[11px] font-black uppercase tracking-widest text-slate-700 hover:bg-slate-50 disabled:opacity-40"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 overflow-hidden">
        <div className="max-h-72 overflow-auto custom-scrollbar bg-white">
          {availableEmployees.length === 0 ? (
            <div className="p-4 text-sm text-slate-500">All employees have been marked for today.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {availableEmployees.map((e) => {
                const checked = markSelected.has(e.id);
                return (
                  <label
                    key={e.id}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleMarkSelected(e.id)}
                      className="h-4 w-4 rounded border-slate-300 text-slate-900"
                    />
                    <img
                      src={getAvatarSrc(e.avatar)}
                      alt={e.fullName}
                      className="h-10 w-10 rounded-full object-cover border border-slate-100"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-bold text-slate-900 truncate">{e.fullName}</div>
                      <div className="text-[11px] font-mono font-bold text-slate-400 truncate">{formatDemoId(e.id)}</div>
                    </div>
                  </label>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Status</label>
        <Select
          value={markStatus}
          onChange={(val) => setMarkStatus(val)}
          position="up"
          options={[
            { value: 'Present', label: 'Present' },
            { value: 'Absent', label: 'Absent' },
            { value: 'On Leave', label: 'On Leave' },
          ]}
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => markAllAvailable('Present')}
          disabled={availableEmployees.length === 0 || isBulkMarking}
          className="h-10 rounded-xl bg-emerald-600 text-white text-xs font-black uppercase tracking-widest hover:bg-emerald-700 disabled:opacity-50"
        >
          Mark all present
        </button>
        <button
          type="button"
          onClick={() => markAllAvailable('Absent')}
          disabled={availableEmployees.length === 0 || isBulkMarking}
          className="h-10 rounded-xl bg-rose-600 text-white text-xs font-black uppercase tracking-widest hover:bg-rose-700 disabled:opacity-50"
        >
          Mark all absent
        </button>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={() => {
            setIsMarkingOpen(false);
            setMarkSearch('');
            setMarkSelected(new Set());
            setMarkStatus('Present');
          }}
          className="h-10 px-6 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={markSelectedEmployees}
          disabled={markSelected.size === 0 || isBulkMarking}
          className="h-10 px-6 rounded-xl bg-slate-900 text-sm font-bold text-white hover:bg-slate-800 transition-all disabled:opacity-50 shadow-lg shadow-slate-900/10"
        >
          {isBulkMarking ? 'Marking...' : 'Mark selected'}
        </button>
      </div>
    </div>
  );

  const handlePrevPage = useCallback(() => {
    setCurrentPage(p => (p > 1 ? p - 1 : p));
  }, []);

  const handleNextPage = useCallback(() => {
    setCurrentPage(p => (p < totalPages ? p + 1 : p));
  }, [totalPages]);

  return (
    <div className="animate-in fade-in duration-500 pb-10">
      <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">Attendance</h1>
          <p className="mt-2 text-base text-slate-500 font-medium tracking-tight">Daily check-in logs and performance data.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="w-56">
             <Calendar value={date} onChange={handleDateChange} />
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
        <div className="px-6 pt-5 pb-4 border-b border-slate-100 bg-slate-50/40">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-xs">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
              <input
                value={listSearch}
                onChange={(e) => {
                  setListSearch(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search name / id / role"
                className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm font-semibold text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
              />
            </div>
            <div className="text-[11px] font-black uppercase tracking-widest text-slate-400">
              Total: <span className="text-slate-900">{filteredRecords.length}</span>
            </div>
          </div>
        </div>

        {filteredRecords.length > 0 ? (
          <>
            <div className="overflow-x-auto custom-scrollbar flex-1">
              <table className="w-full text-left text-sm border-collapse">
                <thead className="bg-slate-50/50">
                  <tr className="border-b border-slate-100">
                    <th className="px-6 py-5 font-semibold text-slate-400 text-xs uppercase tracking-widest">ID</th>
                    <th className="px-6 py-5 font-semibold text-slate-400 text-xs uppercase tracking-widest">Employee</th>
                    <th className="px-6 py-5 font-semibold text-slate-400 text-xs uppercase tracking-widest">Date</th>
                    <th className="px-6 py-5 font-semibold text-slate-400 text-xs uppercase tracking-widest">Status</th>
                    <th className="px-6 py-5 font-semibold text-slate-400 text-xs uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {currentRecords.map((record) => (
                    <tr key={record.id} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs font-bold text-slate-600">{formatDemoId(record.employeeId)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img src={getEmployeeAvatarForRecord(record.employeeId, record.avatar)} alt={record.employeeName} className="h-10 w-10 rounded-full object-cover border border-slate-100 shadow-sm" />
                          <div>
                            <div className="font-bold text-slate-900">{record.employeeName}</div>
                            <div className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-wider">{formatDemoId(record.employeeId)}</div>
                            <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">{record.role}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-bold text-slate-600">{record.date}</span>
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
                  Showing <span className="text-slate-900">{Math.min(indexOfFirstItem + 1, filteredRecords.length)}</span> - <span className="text-slate-900">{Math.min(indexOfLastItem, filteredRecords.length)}</span> of {filteredRecords.length}
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

      {/* Mark Attendance (Desktop Dialog) */}
      {!isMobile ? (
        <Dialog
          isOpen={isMarkingOpen}
          onClose={() => {
            setIsMarkingOpen(false);
            setMarkSearch('');
            setMarkSelected(new Set());
            setMarkStatus('Present');
          }}
          title="Mark Attendance"
          description={`Logging workforce presence for ${date}`}
        >
          {renderMarkAttendanceContent()}
        </Dialog>
      ) : null}

      {/* Mark Attendance (Mobile Bottom Drawer) */}
      {isMobile ? (
        <div className={`fixed inset-0 z-[9999] ${isMarkingOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
          <div
            className={`absolute inset-0 bg-black/30 transition-opacity ${isMarkingOpen ? 'opacity-100' : 'opacity-0'}`}
            onClick={() => {
              setIsMarkingOpen(false);
              setMarkSearch('');
              setMarkSelected(new Set());
              setMarkStatus('Present');
            }}
          />
          <div
            className={`absolute inset-x-0 bottom-0 max-h-[90dvh] rounded-t-3xl bg-white border-t border-slate-100 shadow-2xl transition-transform duration-200 ${isMarkingOpen ? 'translate-y-0' : 'translate-y-full'}`}
          >
            <div className="px-5 pt-4 pb-2 border-b border-slate-100">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-lg font-bold text-slate-900 truncate">Mark Attendance</div>
                  <div className="text-xs text-slate-500 font-medium truncate">Logging workforce presence for {date}</div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsMarkingOpen(false);
                    setMarkSearch('');
                    setMarkSelected(new Set());
                    setMarkStatus('Present');
                  }}
                  className="text-slate-400 hover:text-slate-600 transition-colors p-2 rounded-xl hover:bg-slate-100"
                >
                  <span className="material-symbols-outlined text-xl">close</span>
                </button>
              </div>
            </div>
            <div className="px-5 overflow-y-auto custom-scrollbar">
              {renderMarkAttendanceContent()}
            </div>
          </div>
        </div>
      ) : null}

      {/* Edit Attendance Dialog (Simulated for this demo) */}
      <Dialog
        isOpen={!!editingRecord}
        onClose={() => setEditingRecord(null)}
        title="Update Entry"
        description={`Modifying record for ${editingRecord?.employeeName}`}
      >
        <form onSubmit={handleEditSubmit} className="space-y-6 py-4">
          <div className="space-y-1">
            <div className="text-xs font-black text-slate-400 uppercase tracking-widest">Record</div>
            <div className="text-sm font-bold text-slate-900">
              {editingRecord?.employeeName}
              {editingRecord?.employeeId ? <span className="text-slate-400 font-semibold"> · {formatDemoId(editingRecord.employeeId)}</span> : null}
            </div>
            <div className="text-xs text-slate-500 font-medium">Date: {editingRecord?.date}</div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Status</label>
            <Select
              value={editStatus}
              onChange={(val) => setEditStatus(val)}
              position="up"
              options={[
                { value: 'Present', label: 'Present' },
                { value: 'Absent', label: 'Absent' },
                { value: 'On Leave', label: 'On Leave' },
              ]}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setEditingRecord(null)}
              className="h-10 px-6 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUpdating || !editingRecord}
              className="h-10 px-8 rounded-xl bg-slate-900 text-sm font-bold text-white hover:bg-slate-800 transition-all disabled:opacity-50 shadow-lg shadow-slate-900/10"
            >
              {isUpdating ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Dialog>
    </div>
  );
};

export default React.memo(Attendance);
