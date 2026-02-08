import * as React from 'react';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { DEPARTMENTS } from '../constants';
import Select from './ui/Select';
import Dialog from './ui/Dialog';
import Calendar from './ui/Calendar';
import { Employee, Department } from '../types';
import { fetchAttendanceSummary } from '../services/api';
import { formatDemoEmail, formatDemoId } from '../utils/demoFormat';

interface EmployeesProps {
  employees: Employee[];
  onAddEmployee: (employee: Employee) => void;
  onUpdateEmployee: (id: string, employee: any) => void;
  onDeleteEmployee: (id: string) => void;
}

const getAvatarSrc = (avatar?: string) => {
  const v = (avatar || '').trim();
  if (v) return v;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><rect width="128" height="128" rx="64" fill="#0F172A"/><circle cx="64" cy="52" r="20" fill="#334155"/><path d="M24 118c8-26 28-38 40-38s32 12 40 38" fill="#334155"/></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

const StatCard = React.memo(function StatCard({ stat }: { stat: any }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
       <div>
          <span className={`text-3xl font-bold ${stat.color} block tracking-tighter`}>{stat.value}</span>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1 block">{stat.label}</span>
       </div>
       <div className={`h-14 w-14 rounded-2xl flex items-center justify-center ${stat.bg}`}>
          <span className={`material-symbols-outlined text-2xl ${stat.iconColor}`}>{stat.icon}</span>
       </div>
    </div>
  );
});

const EmployeeCard = React.memo(function EmployeeCard({
  emp,
  empAttendance,
  onView,
  onAskDelete,
  onEdit,
}: {
  emp: Employee;
  empAttendance: any;
  onView: (emp: Employee) => void;
  onAskDelete: (id: string) => void;
  onEdit: (emp: Employee) => void;
}) {
  return (
    <div className="group relative flex flex-col items-center rounded-2xl border border-slate-100 bg-white p-6 text-center shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 z-0 hover:z-10">
        {/* Attendance Days Badge (top-left, properly positioned) */}
        <div className="absolute left-2 top-2 flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-1 shadow-md z-10">
          <span className="material-symbols-outlined text-emerald-600 text-xs">check_circle</span>
          <span className="text-[10px] font-black text-emerald-700">{empAttendance.present || 0}d</span>
        </div>
        {/* Action buttons (eye, delete) */}
        <div className="absolute right-2 top-2 flex gap-1.5 z-10">
          <div className="relative group/action">
            <button 
              onClick={() => onView(emp)} 
              className="h-8 w-8 inline-flex items-center justify-center text-slate-500 hover:text-blue-600 transition-colors rounded-full hover:bg-blue-50 bg-white shadow-sm"
              aria-label="View Profile"
            >
              <span className="material-symbols-outlined text-sm">visibility</span>
            </button>
            <div className="pointer-events-none absolute right-0 top-full mt-2 hidden whitespace-nowrap rounded-lg bg-slate-900/90 px-3 py-1.5 text-[11px] font-semibold text-white shadow-lg backdrop-blur-sm group-hover/action:block">
              View profile
            </div>
          </div>

          <div className="relative group/action">
            <button 
              onClick={() => onAskDelete(emp.id)}
              className="h-8 w-8 inline-flex items-center justify-center text-slate-500 hover:text-rose-600 transition-colors rounded-full hover:bg-rose-50 bg-white shadow-sm"
              aria-label="Delete Employee"
            >
              <span className="material-symbols-outlined text-sm">delete</span>
            </button>
            <div className="pointer-events-none absolute right-0 top-full mt-2 hidden whitespace-nowrap rounded-lg bg-slate-900/90 px-3 py-1.5 text-[11px] font-semibold text-white shadow-lg backdrop-blur-sm group-hover/action:block">
              Delete employee
            </div>
          </div>
        </div>

        <div className="relative mb-4">
          <img src={getAvatarSrc(emp.avatar)} alt={emp.fullName} className="h-24 w-24 rounded-full object-cover shadow-lg ring-4 ring-slate-50 transition-transform group-hover:scale-105" />
          <div className={`absolute bottom-0 right-0 h-5 w-5 rounded-full border-[3px] border-white ${emp.status === 'Active' ? 'bg-emerald-500' : emp.status === 'Inactive' ? 'bg-slate-400' : 'bg-rose-500'}`} />
        </div>
        
        <p className="text-xs text-slate-400 font-mono font-bold uppercase tracking-wider mb-1">{formatDemoId(emp.id)}</p>
        <h3 className="text-base font-bold text-slate-900">{emp.fullName}</h3>
        <p className="text-sm text-slate-500 mb-1 font-medium">{emp.role}</p>
        <span className="mb-4 inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
          {emp.department}
        </span>
        
        <div className="mt-auto w-full space-y-3 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-center gap-2 text-xs text-slate-500 font-medium">
            <span className="material-symbols-outlined text-sm text-slate-400">location_on</span>
            <span>{emp.location || 'Remote'}</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs text-slate-500 font-medium">
            <span className="material-symbols-outlined text-sm text-slate-400">calendar_month</span>
            <span>Joined {emp.joinedDate}</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs text-slate-500 font-medium">
            <span className="material-symbols-outlined text-sm text-slate-400">mail</span>
            <span className="truncate max-w-[150px]">{formatDemoEmail(emp.id, emp.email)}</span>
          </div>
          
          <button 
            onClick={() => onEdit(emp)}
            className="w-full rounded-lg bg-slate-900 text-white py-2 text-xs font-bold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">edit</span>
            Edit Profile
          </button>
        </div>
    </div>
  );
});

const Employees: React.FC<EmployeesProps> = ({ employees, onAddEmployee, onUpdateEmployee, onDeleteEmployee }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');

  const getNextEmployeeId = useCallback(() => {
    let max = 0;
    for (const e of employees || []) {
      const raw = (e?.id || '').toString().trim();
      const m = raw.match(/^EMP[_-]?(\d+)$/i);
      if (!m) continue;
      const n = parseInt(m[1], 10);
      if (!Number.isFinite(n)) continue;
      if (n > max) max = n;
    }
    const next = max + 1;
    return `EMP_${String(next).padStart(2, '0')}`;
  }, [employees]);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [employeeToDelete, setEmployeeToDelete] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [editEmployee, setEditEmployee] = useState<any>(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  
  const [attendanceSummary, setAttendanceSummary] = useState<any>(null);

  useEffect(() => {
    const loadAttendanceSummary = async () => {
      try {
        const data = await fetchAttendanceSummary();
        setAttendanceSummary(data.summary);
      } catch (error) {
        console.error('Error loading attendance summary:', error);
      }
    };
    loadAttendanceSummary();

    const handleFocus = () => loadAttendanceSummary();
    const handleAttendanceUpdated = () => loadAttendanceSummary();
    window.addEventListener('focus', handleFocus);
    window.addEventListener('attendance:updated', handleAttendanceUpdated as EventListener);
    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('attendance:updated', handleAttendanceUpdated as EventListener);
    };
  }, []);

  const attendanceById = useMemo(() => {
    const map = new Map<string, any>();
    for (const s of attendanceSummary || []) {
      const id = (s?.id ?? '').toString().trim().toLowerCase();
      if (!id) continue;
      map.set(id, s);
    }
    return map;
  }, [attendanceSummary]);
  
  const [newEmployee, setNewEmployee] = useState<{
    fullName: string;
    email: string;
    role: string;
    department: string;
    status: string;
    location: string;
    avatarUrl: string;
    joinedDate: string;
    id: string;
  }>({
    fullName: '',
    email: '',
    role: '',
    department: DEPARTMENTS[0],
    status: 'Active',
    location: '',
    avatarUrl: '',
    joinedDate: (() => {
      const d = new Date();
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    })(),
    id: ''
  });

  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const matchesSearch = emp.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            emp.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDept = selectedDept === 'All' || emp.department === selectedDept;

      let matchesDate = true;
      if (filterStartDate) {
        matchesDate = matchesDate && emp.joinedDate >= filterStartDate;
      }
      if (filterEndDate) {
        matchesDate = matchesDate && emp.joinedDate <= filterEndDate;
      }

      return matchesSearch && matchesDept && matchesDate;
    });
  }, [employees, filterEndDate, filterStartDate, searchTerm, selectedDept]);

  const indexOfLastItem = useMemo(() => currentPage * itemsPerPage, [currentPage, itemsPerPage]);
  const indexOfFirstItem = useMemo(() => indexOfLastItem - itemsPerPage, [indexOfLastItem, itemsPerPage]);
  const currentEmployees = useMemo(() => filteredEmployees.slice(indexOfFirstItem, indexOfLastItem), [filteredEmployees, indexOfFirstItem, indexOfLastItem]);
  const totalPages = useMemo(() => Math.ceil(filteredEmployees.length / itemsPerPage), [filteredEmployees.length, itemsPerPage]);

  const stats = useMemo(() => {
    return [
      { 
        label: 'Total Employees', 
        value: employees.length, 
        color: 'text-slate-900',
        bg: 'bg-slate-50',
        icon: 'groups',
        iconColor: 'text-slate-900'
      },
      { 
        label: 'Active', 
        value: employees.filter(e => e.status === 'Active').length,
        color: 'text-emerald-600',
        bg: 'bg-emerald-50',
        icon: 'check_circle',
        iconColor: 'text-emerald-600'
      },
      { 
        label: 'Inactive', 
        value: employees.filter(e => e.status === 'Inactive').length,
        color: 'text-slate-600',
        bg: 'bg-slate-50',
        icon: 'pause_circle',
        iconColor: 'text-slate-600'
      },
      { 
        label: 'Terminated', 
        value: employees.filter(e => e.status === 'Terminated').length,
        color: 'text-rose-600',
        bg: 'bg-rose-50',
        icon: 'block',
        iconColor: 'text-rose-600'
      },
    ];
  }, [employees]);

  const handlePrevPage = useCallback(() => {
    setCurrentPage(p => (p > 1 ? p - 1 : p));
  }, []);

  const handleNextPage = useCallback(() => {
    setCurrentPage(p => (p < totalPages ? p + 1 : p));
  }, [totalPages]);

  const handleOpenAdd = useCallback(() => setIsAddModalOpen(true), []);

  const handleSearchChange = useCallback((val: string) => {
    setSearchTerm(val);
    setCurrentPage(1);
  }, []);

  const handleDeptChange = useCallback((val: string) => {
    setSelectedDept(val);
    setCurrentPage(1);
  }, []);

  const handleClearDates = useCallback(() => {
    setFilterStartDate('');
    setFilterEndDate('');
  }, []);

  const handleAskDelete = useCallback((id: string) => {
    if (id && id.trim() !== '') {
      setEmployeeToDelete(id);
    } else {
      alert('Cannot delete: Employee ID is missing!');
    }
  }, []);

  const handleViewProfile = useCallback((emp: Employee) => setSelectedEmployee(emp), []);

  const handleEditProfile = useCallback((emp: Employee) => {
    setEditEmployee({ ...emp });
    setIsEditModalOpen(true);
  }, []);

  const handleAddSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    const employeeToAdd: any = {
      id: (newEmployee.id || '').trim() || getNextEmployeeId(),
      fullName: newEmployee.fullName,
      email: newEmployee.email,
      role: newEmployee.role,
      department: newEmployee.department as Department,
      status: 'Active',
      location: newEmployee.location || 'Remote',
      avatar: newEmployee.avatarUrl || '',
      joinedDate: newEmployee.joinedDate || new Date().toISOString().split('T')[0]
    };

    onAddEmployee(employeeToAdd);
    setIsAddModalOpen(false);
    
    setNewEmployee({
        fullName: '',
        email: '',
        role: '',
        department: DEPARTMENTS[0],
        status: 'Active',
        location: '',
        avatarUrl: '',
        joinedDate: new Date().toISOString().split('T')[0],
        id: ''
    });
  }, [getNextEmployeeId, newEmployee, onAddEmployee]);

  const confirmDelete = useCallback(() => {
    if (employeeToDelete) {
      onDeleteEmployee(employeeToDelete);
      setEmployeeToDelete(null);
    }
  }, [employeeToDelete, onDeleteEmployee]);

  const handleAvatarChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              setNewEmployee({ ...newEmployee, avatarUrl: reader.result as string });
          };
          reader.readAsDataURL(file);
      }
  }, [newEmployee]);

  const handleEditSubmit = useCallback((e: React.FormEvent) => {
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
    setEditEmployee(null);
  }, [editEmployee, onUpdateEmployee]);

  const deptOptions = [
    { value: 'All', label: 'All Departments' },
    ...DEPARTMENTS.map(dept => ({ value: dept, label: dept }))
  ];

  const statusOptions = [
    { value: 'Active', label: 'Active' },
    { value: 'Inactive', label: 'Inactive' },
    { value: 'Terminated', label: 'Terminated' }
  ];

  return (
    <div className="pb-10">
      <div className="mb-6 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">Employees</h1>
          <p className="mt-2 text-base text-slate-500 font-medium">Manage your team members and roles.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto">
          <div className="relative group w-full sm:w-auto sm:flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-600 transition-colors">search</span>
            <input 
              type="text" 
              placeholder="Search people..." 
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9 pr-4 py-2.5 h-10 w-full bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300 transition-all shadow-sm"
            />
          </div>
          
          <div className="w-full sm:w-48">
            <Select 
              value={selectedDept} 
              onChange={handleDeptChange}
              options={deptOptions} 
            />
          </div>
          
          <button 
            onClick={handleOpenAdd}
            className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 h-10 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition-all active:scale-95 hover:-translate-y-0.5 whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-lg">add</span>
            <span>Add Employee</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        {stats.map((stat) => (
          <StatCard key={stat.label} stat={stat} />
        ))}
      </div>

      <div className="relative z-30 mb-10 flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-4 bg-white/70 backdrop-blur-md p-4 rounded-2xl border border-white/20 shadow-lg shadow-slate-900/5">
        <div className="flex items-center gap-2 text-sm text-slate-600 font-semibold min-w-fit">
          <span className="material-symbols-outlined text-xl">filter_list</span>
          <span>Joined Date:</span>
        </div>
        <div className="flex w-full sm:w-auto items-center gap-3 flex-wrap">
          <div className="relative z-[200] w-full sm:w-40">
            <Calendar value={filterStartDate} onChange={setFilterStartDate} />
          </div>
          <span className="hidden sm:inline-flex items-center justify-center text-slate-500 font-bold text-lg flex-shrink-0 px-1">→</span>
          <div className="relative z-[200] w-full sm:w-40">
            <Calendar value={filterEndDate} onChange={setFilterEndDate} />
          </div>
        </div>
        {(filterStartDate || filterEndDate) && (
          <button 
            onClick={handleClearDates}
            className="flex items-center gap-1 text-xs text-rose-500 hover:text-rose-700 font-bold px-3 py-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 transition-colors ml-2"
          >
            <span className="material-symbols-outlined text-sm">close</span>
            Clear
          </button>
        )}
      </div>

      <div className="min-h-[400px]">
        {currentEmployees.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {currentEmployees.map((emp) => {
                const empAttendance = attendanceById.get((emp.id || '').toLowerCase()) || { present: 0, absent: 0, on_leave: 0 };
                return (
                  <EmployeeCard
                    key={emp.id}
                    emp={emp}
                    empAttendance={empAttendance}
                    onView={handleViewProfile}
                    onAskDelete={handleAskDelete}
                    onEdit={handleEditProfile}
                  />
                );
              })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
             <span className="material-symbols-outlined text-4xl mb-2">person_search</span>
             <p className="text-sm font-medium">No employees found.</p>
          </div>
        )}
      </div>

      <div className="pt-8 pb-4 px-4 mt-auto flex items-center justify-between border-t border-slate-100 bg-white rounded-b-2xl">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            Showing <span className="text-slate-900">{filteredEmployees.length > 0 ? indexOfFirstItem + 1 : 0}</span> - <span className="text-slate-900">{Math.min(indexOfLastItem, filteredEmployees.length)}</span> of <span className="text-slate-900">{filteredEmployees.length}</span>
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
            disabled={currentPage === totalPages || totalPages === 0}
            className="h-9 px-4 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-widest hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all bg-white shadow-sm"
            >
            Next
            </button>
        </div>
      </div>

      <Dialog 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Employee"
        description="Enter employee details."
      >
        <form onSubmit={handleAddSubmit}>
            <div className="grid gap-3 py-3">
                <div className="flex items-center gap-3 mb-1">
                    <div className="relative group cursor-pointer overflow-hidden rounded-full h-14 w-14 bg-slate-50 border-2 border-dashed border-slate-300 hover:border-slate-400 hover:bg-slate-100 transition-all flex items-center justify-center shrink-0">
                        {newEmployee.avatarUrl ? (
                            <img src={newEmployee.avatarUrl} alt="Preview" className="h-full w-full object-cover" />
                        ) : (
                            <span className="material-symbols-outlined text-xl text-slate-400">add_a_photo</span>
                        )}
                        <input 
                            type="file" 
                            accept="image/*"
                            onChange={handleAvatarChange}
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
                        <label className="text-xs font-medium text-slate-700 mb-1 block">Employee ID</label>
                        <input 
                            required
                            value={newEmployee.id}
                            onChange={e => setNewEmployee({...newEmployee, id: e.target.value})}
                            className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10" 
                            placeholder="#EMP-001"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-medium text-slate-700 mb-1 block">Full Name</label>
                        <input 
                            required
                            value={newEmployee.fullName}
                            onChange={e => setNewEmployee({...newEmployee, fullName: e.target.value})}
                            className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10" 
                            placeholder="Jane Doe"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-medium text-slate-700 mb-1 block">Email</label>
                        <input 
                            required
                            type="email"
                            value={newEmployee.email}
                            onChange={e => setNewEmployee({...newEmployee, email: e.target.value})}
                            className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10" 
                            placeholder="jane@example.com"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-medium text-slate-700 mb-1 block">Role</label>
                        <input 
                            required
                            value={newEmployee.role}
                            onChange={e => setNewEmployee({...newEmployee, role: e.target.value})}
                            className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10" 
                            placeholder="Product Designer"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-medium text-slate-700 mb-1 block">Department</label>
                        <Select 
                            value={newEmployee.department}
                            onChange={(val) => setNewEmployee({...newEmployee, department: val})}
                            options={DEPARTMENTS.map(d => ({value: d, label: d}))}
                        />
                    </div>
                    <div>
                        <label className="text-xs font-medium text-slate-700 mb-1 block">Location</label>
                        <input 
                            value={newEmployee.location}
                            onChange={e => setNewEmployee({...newEmployee, location: e.target.value})}
                            className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10" 
                            placeholder="New York, USA"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-medium text-slate-700 mb-1 block">Joined Date</label>
                        <Calendar value={newEmployee.joinedDate} onChange={(d) => setNewEmployee({...newEmployee, joinedDate: d})} />
                    </div>
                </div>
            </div>
            <div className="flex justify-end gap-2 mt-3">
                <button 
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="h-10 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                    Cancel
                </button>
                <button 
                    type="submit"
                    className="h-10 rounded-lg bg-slate-900 px-5 text-sm font-semibold text-white hover:bg-slate-800"
                >
                    Add Employee
                </button>
            </div>
        </form>
      </Dialog>

      <Dialog
        isOpen={!!employeeToDelete}
        onClose={() => setEmployeeToDelete(null)}
        title="Remove Employee"
      >
         <div className="py-1">
            <div className="flex items-center gap-3 mb-3 p-3 bg-rose-50 rounded-lg border border-rose-100">
               <div className="h-8 w-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                  <span className="material-symbols-outlined text-lg">warning</span>
               </div>
               <div>
                  <h4 className="text-xs font-bold text-rose-800">Irreversible Action</h4>
                  <p className="text-[10px] text-rose-600 mt-0.5">Permanently deletes employee data.</p>
               </div>
            </div>
            <p className="text-xs text-slate-600 mb-3">Are you sure you want to delete this employee?</p>
            
            <div className="flex justify-end gap-2">
               <button 
                  onClick={() => setEmployeeToDelete(null)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 text-xs font-medium hover:bg-slate-50"
               >
                  Cancel
               </button>
               <button 
                  onClick={confirmDelete}
                  className="px-4 py-2 rounded-lg bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700"
               >
                  Delete
               </button>
            </div>
         </div>
      </Dialog>

      <Dialog
        isOpen={!!selectedEmployee && !isEditModalOpen}
        onClose={() => setSelectedEmployee(null)}
        title="Employee Profile"
        description="View team member information."
      >
          {selectedEmployee && (
              <div className="py-2">
                    <div className="flex items-center gap-3 mb-4 relative">
                        <img src={getAvatarSrc(selectedEmployee.avatar)} alt={selectedEmployee.fullName} className="h-16 w-16 rounded-full object-cover shadow-lg border-2 border-white shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider mb-0.5">{formatDemoId(selectedEmployee.id)}</p>
                        <h3 className="text-base font-bold text-slate-900 truncate">{selectedEmployee.fullName}</h3>
                        <p className="text-xs text-slate-500 font-medium truncate">{selectedEmployee.role}</p>
                        <span className={`mt-1 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          selectedEmployee.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 
                          selectedEmployee.status === 'Inactive' ? 'bg-slate-100 text-slate-700' : 'bg-rose-100 text-rose-700'
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
                        <p className="text-xs font-semibold text-slate-900 mt-0.5 truncate">{formatDemoEmail(selectedEmployee.id, selectedEmployee.email)}</p>
                      </div>
                      {/* Always show attendance cards, even if all are zero */}
                      {(() => {
                      const att = attendanceById.get((selectedEmployee.id || '').toLowerCase()) || { present: 0, absent: 0, on_leave: 0 };
                      return <>
                        <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-200">
                          <p className="text-[10px] text-emerald-600 font-medium uppercase">Present</p>
                          <p className="text-lg font-bold text-emerald-700 mt-0.5">{att.present}</p>
                        </div>
                        <div className="p-2 bg-rose-50 rounded-lg border border-rose-200">
                          <p className="text-[10px] text-rose-600 font-medium uppercase">Absent</p>
                          <p className="text-lg font-bold text-rose-700 mt-0.5">{att.absent}</p>
                        </div>
                        <div className="p-2 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="text-[10px] text-blue-600 font-medium uppercase">On Leave</p>
                          <p className="text-lg font-bold text-blue-700 mt-0.5">{att.on_leave}</p>
                        </div>
                      </>;
                      })()}
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

      <Dialog 
        isOpen={isEditModalOpen} 
        onClose={() => {
          setIsEditModalOpen(false);
          setEditEmployee(null);
        }}
        title="Edit Employee"
        description="Modify team member details."
      >
        {editEmployee && (
            <form onSubmit={handleEditSubmit}>
                <div className="grid gap-3 py-3">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="relative group cursor-pointer overflow-hidden rounded-full h-14 w-14 bg-slate-50 border-2 border-dashed border-slate-300 hover:border-slate-400 hover:bg-slate-100 transition-all flex items-center justify-center shrink-0">
                            <img src={getAvatarSrc(editEmployee.avatar)} alt="Preview" className="h-full w-full object-cover" />
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
                            <Calendar value={editEmployee.joinedDate} onChange={() => {}} disabled />
                        </div>
                    </div>
                </div>
                <div className="flex justify-end gap-2 mt-3">
                    <button 
                        type="button"
                        onClick={() => {
                          setIsEditModalOpen(false);
                          setEditEmployee(null);
                        }}
                        className="h-10 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit"
                        className="h-10 rounded-lg bg-slate-900 px-5 text-sm font-semibold text-white hover:bg-slate-800"
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

export default Employees;