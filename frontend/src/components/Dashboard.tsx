
import * as React from 'react';
import { useState, useEffect } from 'react';
import { Employee, Department, Status } from '../types';
import Dialog from './ui/Dialog';
import Select from './ui/Select';
import Calendar from './ui/Calendar';
import { DEPARTMENTS } from '../constants';

interface DashboardProps {
  employees: Employee[];
  onUpdateEmployee: (id: string, data: any) => void;
  onViewAll: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ employees, onUpdateEmployee, onViewAll }) => {
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editEmployee, setEditEmployee] = useState<any>(null);

  const statusOptions = [
    { value: 'Active', label: 'Active' },
    { value: 'On Leave', label: 'On Leave' },
    { value: 'Terminated', label: 'Terminated' }
  ];

  const handleDownloadReport = () => {
    const activeCount = employees.filter(e => e.status === 'Active').length;
    const leaveCount = employees.filter(e => e.status === 'On Leave').length;
    
    // Department breakdown
    const deptMap: Record<string, number> = {};
    employees.forEach(e => {
        deptMap[e.department] = (deptMap[e.department] || 0) + 1;
    });

    const reportWindow = window.open('', '_blank');
    if (!reportWindow) return;

    const html = `
      <html>
        <head>
          <title>HRMS Lite - Organization Report</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
          <style>
            body { font-family: 'Inter', sans-serif; }
            @media print {
              .no-print { display: none; }
              body { padding: 0; background: white; }
            }
          </style>
        </head>
        <body class="bg-gray-50 p-10">
          <div class="max-w-4xl mx-auto bg-white p-12 shadow-xl border border-gray-100 rounded-2xl">
            <div class="flex justify-between items-start border-b-2 border-slate-900 pb-8 mb-8">
              <div>
                <h1 class="text-3xl font-bold text-slate-900">Organization Report</h1>
                <p class="text-slate-500 mt-1 font-medium">HRMS Lite AI Assistant Product</p>
              </div>
              <div class="text-right">
                <p class="text-sm font-bold text-slate-900 uppercase tracking-widest">Confidential</p>
                <p class="text-sm text-slate-400 mt-1">${new Date().toLocaleDateString()}</p>
              </div>
            </div>

            <div class="grid grid-cols-3 gap-6 mb-12">
              <div class="bg-slate-50 p-6 rounded-xl border border-slate-100">
                <p class="text-xs font-bold text-slate-400 uppercase">Headcount</p>
                <p class="text-3xl font-bold text-slate-900 mt-2">${employees.length}</p>
              </div>
              <div class="bg-slate-50 p-6 rounded-xl border border-slate-100">
                <p class="text-xs font-bold text-slate-400 uppercase">Active</p>
                <p class="text-3xl font-bold text-emerald-600 mt-2">${activeCount}</p>
              </div>
              <div class="bg-slate-50 p-6 rounded-xl border border-slate-100">
                <p class="text-xs font-bold text-slate-400 uppercase">Attendance</p>
                <p class="text-3xl font-bold text-blue-600 mt-2">${Math.round((activeCount / employees.length) * 100) || 0}%</p>
              </div>
            </div>

            <div class="mb-12">
              <h2 class="text-lg font-bold text-slate-900 mb-4 border-l-4 border-slate-900 pl-3">Departmental Breakdown</h2>
              <div class="grid grid-cols-2 gap-4">
                ${Object.entries(deptMap).map(([dept, count]) => `
                  <div class="flex justify-between py-2 border-b border-gray-100">
                    <span class="text-sm font-medium text-slate-600">${dept}</span>
                    <span class="text-sm font-bold text-slate-900">${count} Members</span>
                  </div>
                `).join('')}
              </div>
            </div>

            <div class="mb-12">
              <h2 class="text-lg font-bold text-slate-900 mb-4 border-l-4 border-slate-900 pl-3">Employee Roster</h2>
              <table class="w-full text-left text-sm">
                <thead>
                  <tr class="bg-slate-900 text-white">
                    <th class="p-3 rounded-tl-lg">Name</th>
                    <th class="p-3">Role</th>
                    <th class="p-3">Department</th>
                    <th class="p-3 rounded-tr-lg">Joined</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  ${employees.map(emp => `
                    <tr>
                      <td class="p-3 font-semibold">${emp.fullName}</td>
                      <td class="p-3 text-slate-500">${emp.role}</td>
                      <td class="p-3">${emp.department}</td>
                      <td class="p-3 text-slate-400">${emp.joinedDate}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>

            <div class="mt-20 pt-8 border-t border-gray-100 text-center">
              <p class="text-xs text-slate-400 font-medium italic">End of Automated Organization Report - Generated by HRMS Lite Intelligence</p>
            </div>

            <div class="fixed bottom-8 right-8 no-print">
               <button onclick="window.print()" class="bg-slate-900 text-white px-8 py-3 rounded-full font-bold shadow-2xl hover:bg-slate-800 transition-all flex items-center gap-2">
                 <span>Print Report / Save as PDF</span>
               </button>
            </div>
          </div>
        </body>
      </html>
    `;

    reportWindow.document.write(html);
    reportWindow.document.close();
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editEmployee) return;

    onUpdateEmployee(editEmployee.id, {
      fullName: editEmployee.fullName,
      email: editEmployee.email,
      role: editEmployee.role,
      department: editEmployee.department,
      status: editEmployee.status,
      location: editEmployee.location,
      avatar: editEmployee.avatar,
      joinedDate: editEmployee.joinedDate
    });
    setIsEditModalOpen(false);
    setSelectedEmployee(null);
  };

  const handleEditClick = () => {
    if (selectedEmployee) {
      setEditEmployee({ ...selectedEmployee });
      setIsEditModalOpen(true);
    }
  };

  const activeEmployees = employees.filter(e => e.status === 'Active').length;
  const leaveEmployees = employees.filter(e => e.status === 'On Leave').length;
  const attendanceRate = Math.round((activeEmployees / employees.length) * 100) || 0;

  return (
    <div className="animate-in fade-in duration-500 pb-10">
      <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">Dashboard</h1>
          <p className="mt-2 text-base text-slate-500 font-medium">Overview of your workforce metrics and daily activities.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleDownloadReport}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm active:scale-95"
          >
            <span className="material-symbols-outlined text-xl">download</span>
            <span>Download Report</span>
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="mb-10 grid gap-6 sm:grid-cols-3">
        <div className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm border border-slate-100 transition-all hover:shadow-md hover:border-slate-200 z-0 hover:z-10">
          <div className="absolute top-0 right-0 p-4 opacity-50">
             <div className="h-16 w-16 rounded-full bg-blue-50"></div>
          </div>
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Workforce</p>
          <div className="mt-4 flex items-baseline gap-2">
            <h3 className="text-4xl font-bold text-slate-900 tracking-tight">{employees.length}</h3>
            <span className="text-sm font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center">
                <span className="material-symbols-outlined text-sm mr-0.5">trending_up</span> 4%
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-400">vs. last month</p>
        </div>
        
        <div className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm border border-slate-100 transition-all hover:shadow-md hover:border-slate-200 z-0 hover:z-10">
           <div className="absolute top-0 right-0 p-4 opacity-50">
             <div className="h-16 w-16 rounded-full bg-purple-50"></div>
          </div>
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Attendance Rate</p>
          <div className="mt-4 flex items-baseline gap-2">
            <h3 className="text-4xl font-bold text-slate-900 tracking-tight">{attendanceRate}%</h3>
            <span className="text-sm font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">Stable</span>
          </div>
          <div className="mt-3 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
             <div className="h-full bg-slate-900 rounded-full" style={{ width: `${attendanceRate}%` }}></div>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm border border-slate-100 transition-all hover:shadow-md hover:border-slate-200 z-0 hover:z-10">
           <div className="absolute top-0 right-0 p-4 opacity-50">
             <div className="h-16 w-16 rounded-full bg-amber-50"></div>
          </div>
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">On Leave Today</p>
          <div className="mt-4 flex items-baseline gap-2">
            <h3 className="text-4xl font-bold text-slate-900 tracking-tight">{leaveEmployees}</h3>
            <span className="text-sm font-semibold text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md">Active</span>
          </div>
          <div className="mt-3 flex -space-x-2">
              {employees.filter(e => e.status === 'On Leave').slice(0, 3).map(e => (
                   <img key={e.id} src={e.avatar} alt={e.fullName} className="h-6 w-6 rounded-full border-2 border-white ring-1 ring-slate-100 object-cover" />
              ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Team Table - Full Width */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h2 className="text-lg font-bold text-slate-900">Quick Team View</h2>
            <button 
                onClick={onViewAll}
                className="text-sm font-bold text-indigo-600 hover:text-indigo-700 hover:underline transition-all"
            >
                View All
            </button>
            </div>
            <div className="overflow-x-auto flex-1 custom-scrollbar">
            <table className="w-full text-left text-sm border-collapse">
                <thead className="bg-slate-50/50">
                <tr className="text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                    <th className="px-6 py-4">Employee</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Action</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                {employees.slice(0, 5).map((emp) => (
                    <tr key={emp.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                        <img alt={emp.fullName} className="h-10 w-10 rounded-full object-cover shadow-sm" src={emp.avatar}/>
                        <div>
                            <div className="font-semibold text-slate-900">{emp.fullName}</div>
                            <div className="text-xs text-slate-500 font-medium">{emp.role}</div>
                        </div>
                        </div>
                    </td>
                    <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ring-2 ring-white shadow-sm ${emp.status === 'Active' ? 'bg-emerald-500' : emp.status === 'On Leave' ? 'bg-amber-400' : 'bg-rose-500'}`}></div>
                        <span className="text-xs font-medium text-slate-600">{emp.status}</span>
                        </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                        <button 
                            onClick={() => setSelectedEmployee(emp)}
                            className="text-slate-400 hover:text-indigo-600 transition-colors p-2 rounded-xl hover:bg-indigo-50"
                            title="View Profile"
                        >
                           <span className="material-symbols-outlined text-[22px]">visibility</span>
                        </button>
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
            </div>
        </div>
      </div>

       {/* View Profile Dialog */}
       <Dialog
        isOpen={!!selectedEmployee}
        onClose={() => setSelectedEmployee(null)}
        title="Employee Profile"
        description="View team member information."
      >
          {selectedEmployee && (
              <div className="py-2">
                  <div className="flex items-center gap-3 mb-4 relative">
                      <img src={selectedEmployee.avatar} alt={selectedEmployee.fullName} className="h-16 w-16 rounded-full object-cover shadow-lg border-2 border-white shrink-0" />
                      <div className="min-w-0 flex-1">
                          <p className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider mb-0.5">{selectedEmployee.id}</p>
                          <h3 className="text-base font-bold text-slate-900 truncate">{selectedEmployee.fullName}</h3>
                          <p className="text-xs text-slate-500 font-medium truncate">{selectedEmployee.role}</p>
                          <span className={`mt-1 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              selectedEmployee.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 
                              selectedEmployee.status === 'On Leave' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                          }`}>
                              {selectedEmployee.status}
                          </span>
                      </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2.5 mb-3">
                      <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                          <p className="text-[10px] text-slate-400 font-medium uppercase">Department</p>
                          <p className="text-xs font-semibold text-slate-900 mt-0.5 truncate">{selectedEmployee.department}</p>
                      </div>
                      <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                          <p className="text-[10px] text-slate-400 font-medium uppercase">Location</p>
                          <p className="text-xs font-semibold text-slate-900 mt-0.5 truncate">{selectedEmployee.location || 'Remote'}</p>
                      </div>
                      <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                          <p className="text-[10px] text-slate-400 font-medium uppercase">Date Joined</p>
                          <p className="text-xs font-semibold text-slate-900 mt-0.5">{selectedEmployee.joinedDate}</p>
                      </div>
                      <div className="col-span-2 p-2 bg-slate-50 rounded-lg border border-slate-100">
                          <p className="text-[10px] text-slate-400 font-medium uppercase">Email</p>
                          <p className="text-xs font-semibold text-slate-900 mt-0.5 truncate">{selectedEmployee.email}</p>
                      </div>
                  </div>

                  {/* Attendance Cards */}
                  <div className="grid grid-cols-3 gap-2 mb-3">
                      <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-center">
                          <p className="text-[10px] text-emerald-600 font-medium uppercase">Present</p>
                          <p className="text-lg font-bold text-emerald-700 mt-1">0</p>
                      </div>
                      <div className="p-3 bg-rose-50 rounded-lg border border-rose-200 text-center">
                          <p className="text-[10px] text-rose-600 font-medium uppercase">Absent</p>
                          <p className="text-lg font-bold text-rose-700 mt-1">0</p>
                      </div>
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 text-center">
                          <p className="text-[10px] text-blue-600 font-medium uppercase">On Leave</p>
                          <p className="text-lg font-bold text-blue-700 mt-1">0</p>
                      </div>
                  </div>

                  <div className="flex justify-end">
                      <button 
                        onClick={() => setSelectedEmployee(null)}
                        className="px-4 py-1.5 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 text-xs"
                      >
                          Close
                      </button>
                  </div>
              </div>
          )}
      </Dialog>

      {/* Edit Employee Dialog */}
      <Dialog 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Employee"
        description="Modify team member details."
      >
        {editEmployee && (
            <form onSubmit={handleEditSubmit}>
                <div className="grid gap-3 py-3">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="relative group cursor-pointer overflow-hidden rounded-full h-14 w-14 bg-slate-50 border-2 border-dashed border-slate-300 hover:border-slate-400 hover:bg-slate-100 transition-all flex items-center justify-center shrink-0">
                            <img src={editEmployee.avatar} alt="Preview" className="h-full w-full object-cover" />
                            <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <span className="material-symbols-outlined text-lg text-white">add_a_photo</span>
                            </div>
                            <input 
                                type="file" 
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        const reader = new FileReader();
                                        reader.onloadend = () => {
                                            setEditEmployee({ ...editEmployee, avatar: reader.result as string });
                                        };
                                        reader.readAsDataURL(file);
                                    }
                                }}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="text-xs font-semibold text-slate-900">Profile Photo</label>
                            <p className="text-[10px] text-slate-500 mt-0.5">JPG, PNG or GIF</p>
                        </div>
                    </div>

                    <div className="space-y-2.5">
                        <div>
                            <label className="text-xs font-medium text-slate-700 mb-1 block">Full Name</label>
                            <input 
                                required
                                value={editEmployee.fullName}
                                onChange={e => setEditEmployee({...editEmployee, fullName: e.target.value})}
                                className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10" 
                            />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-slate-700 mb-1 block">Email</label>
                            <input 
                                required
                                type="email"
                                value={editEmployee.email}
                                onChange={e => setEditEmployee({...editEmployee, email: e.target.value})}
                                className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10" 
                            />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-slate-700 mb-1 block">Role</label>
                            <input 
                                required
                                value={editEmployee.role}
                                onChange={e => setEditEmployee({...editEmployee, role: e.target.value})}
                                className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10" 
                            />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-slate-700 mb-1 block">Department</label>
                            <Select 
                                value={editEmployee.department}
                                onChange={(val) => setEditEmployee({...editEmployee, department: val})}
                                options={DEPARTMENTS.map(d => ({value: d, label: d}))}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-slate-700 mb-1 block">Status</label>
                            <Select 
                                value={editEmployee.status}
                                onChange={(val) => setEditEmployee({...editEmployee, status: val})}
                                options={statusOptions}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-slate-700 mb-1 block">Location</label>
                            <input 
                                value={editEmployee.location}
                                onChange={e => setEditEmployee({...editEmployee, location: e.target.value})}
                                className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10" 
                            />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-slate-700 mb-1 block">Joined Date</label>
                            <Calendar value={editEmployee.joinedDate} onChange={(d) => setEditEmployee({...editEmployee, joinedDate: d})} />
                        </div>
                    </div>
                </div>
                <div className="flex justify-end gap-2 mt-3">
                    <button 
                        type="button"
                        onClick={() => setIsEditModalOpen(false)}
                        className="rounded-lg border border-slate-200 bg-white px-4 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit"
                        className="rounded-lg bg-slate-900 px-5 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
                    >
                        Save Changes
                    </button>
                </div>
            </form>
        )}
      </Dialog>
    </div>
  );
};

export default Dashboard;
