/**
 * HRMS Lite | Professional Frontend Core
 * AUTHOR: Akash Kumar
 * PROJECT_ID: [AUTHENTIC_MINT_ID: HRMS-AK-2026-X9]
 * (C) 2026 HRMS Enterprise Systems
 */
import * as React from 'react';
import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ChatBot from './components/ChatBot';
import Employees from './components/Employees';
import Attendance from './components/Attendance';
import LandingPage from './components/LandingPage';
import Toast from './components/ui/Toast';
import { fetchEmployees, createEmployee, deleteEmployee, updateEmployee } from './services/api';
import { Employee } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAppEntered, setIsAppEntered] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (isAppEntered) {
      loadEmployees();
    }
  }, [isAppEntered]);

  const loadEmployees = async () => {
    setIsLoading(true);
    try {
      const data = await fetchEmployees();
      console.log('Loaded employees:', data.employees);
      if (!data.employees || data.employees.length === 0) {
        console.warn('No employees returned from API');
      }
      setEmployees(data.employees);
    } catch (error) {
      console.error("Error loading employees:", error);
      setToast({ message: 'Failed to load employees', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddEmployee = async (newEmp: any) => {
    try {
      const created = await createEmployee(newEmp);
      setEmployees(prev => [created, ...prev]);
      setToast({ message: 'Employee added successfully!', type: 'success' });
    } catch (error) {
      setToast({ message: (error as Error).message, type: 'error' });
    }
  };

  const handleUpdateEmployee = async (id: string, updatedData: any) => {
    try {
      const updated = await updateEmployee(id, updatedData);
      setEmployees(prev => prev.map(e => e.id === id ? updated : e));
      setToast({ message: 'Employee updated successfully!', type: 'success' });
    } catch (error) {
      setToast({ message: (error as Error).message, type: 'error' });
    }
  };

  const handleDeleteEmployee = async (id: string) => {
    console.log('Delete request for employee ID:', id);
    try {
      await deleteEmployee(id);
      setEmployees(prev => prev.filter(e => e.id !== id));
      setToast({ message: 'Employee removed successfully.', type: 'success' });
    } catch (error) {
      console.error('Delete error:', error);
      setToast({ message: (error as Error).message || 'Failed to delete employee.', type: 'error' });
    }
  };

  const renderContent = () => {
    if (isLoading && isAppEntered) {
      return (
        <div className="flex h-full items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-900 border-t-transparent"></div>
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return <Dashboard 
                  employees={employees} 
                  onUpdateEmployee={handleUpdateEmployee}
                  onViewAll={() => setActiveTab('employees')}
                />;
      case 'employees':
        return <Employees 
                  employees={employees} 
                  onAddEmployee={handleAddEmployee}
                  onUpdateEmployee={handleUpdateEmployee}
                  onDeleteEmployee={handleDeleteEmployee} 
                />;
      case 'attendance':
        return <Attendance 
                  employees={employees} 
                  onToast={(msg, type) => setToast({ message: msg, type })} 
                />;
      default:
        return <Dashboard 
                  employees={employees} 
                  onUpdateEmployee={handleUpdateEmployee} 
                  onViewAll={() => setActiveTab('employees')}
                />;
    }
  };

  const handleGoHome = () => {
    setIsAppEntered(false);
    setActiveTab('dashboard');
  };

  if (!isAppEntered) {
      return <LandingPage onEnter={() => setIsAppEntered(true)} />;
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50 selection:bg-slate-900 selection:text-white">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={(tab) => { setActiveTab(tab); setIsMobileSidebarOpen(false); }} 
        onGoHome={() => { handleGoHome(); setIsMobileSidebarOpen(false); }}
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />
      
      <main className="flex h-full flex-1 flex-col overflow-y-auto relative z-10 custom-scrollbar md:pl-4">
        <header className="sticky top-4 z-30 flex h-14 items-center justify-between border border-slate-200/20 bg-white/50 px-4 backdrop-blur-xl md:hidden mx-4 rounded-xl shadow-sm">
          <div className="flex items-center gap-2" onClick={handleGoHome}>
            <span className="material-symbols-outlined text-slate-900">blur_on</span>
            <span className="font-bold text-slate-900">HRMS Lite</span>
          </div>
          <button className="text-slate-600" onClick={() => setIsMobileSidebarOpen(true)} aria-label="Open menu">
            <span className="material-symbols-outlined">menu</span>
          </button>
        </header>

        {/* Mobile overlay when sidebar open */}
        {isMobileSidebarOpen && (
          <div className="fixed inset-0 z-30 bg-black/40 md:hidden" onClick={() => setIsMobileSidebarOpen(false)} />
        )}

        <div className="mx-auto w-full max-w-[1400px] p-6 lg:p-10 flex-1">
          {renderContent()}
        </div>
        
        <footer className="mt-auto px-10 py-10 border-t border-slate-200 bg-white">
           <div className="mx-auto w-full max-w-[1400px] flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="flex flex-col items-center md:items-start gap-2">
                <div className="flex items-center gap-2 text-slate-900">
                  <span className="material-symbols-outlined text-2xl font-black">blur_on</span>
                  <span className="text-sm font-black uppercase tracking-[0.2em]">HRMS Lite</span>
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-[11px] text-slate-400 font-medium tracking-tight">© 2026 HRMS Enterprise Systems. All rights reserved.</p>
                  <p className="text-[9px] text-slate-300 font-bold uppercase tracking-[0.3em]">Engineered with passion by Akash Kumar</p>
                </div>
              </div>

              <div className="flex flex-col items-center md:items-end gap-4">
                  <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-full border border-slate-100 w-fit">
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                      <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Network Stable</span>
                  </div>
                  
                  <div className="flex items-center gap-6">
                      <a href="mailto:akashkumar.cs27@gmail.com" className="text-slate-400 hover:text-slate-900 transition-all hover:scale-110 flex items-center justify-center h-9 w-9 rounded-full bg-slate-50 border border-slate-100 shadow-sm hover:shadow-md">
                          <span className="material-symbols-outlined text-[20px]">mail</span>
                      </a>
                      <a href="https://github.com/XynaxDev" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-slate-900 transition-all hover:scale-110 flex items-center justify-center h-9 w-9 rounded-full bg-slate-50 border border-slate-100 shadow-sm hover:shadow-md">
                          <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                            <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
                          </svg>
                      </a>
                  </div>
              </div>
           </div>
        </footer>
      </main>

      <ChatBot />
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
    </div>
  );
};

export default App;
