/**
 * HRMS Lite | Professional Frontend Core
 * AUTHOR: Akash Kumar
 * PROJECT_ID: [AUTHENTIC_MINT_ID: HRMS-AK-2026-X9]
 * (C) 2026 HRMS Enterprise Systems
 */
import * as React from 'react';
import { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import Sidebar from './components/Sidebar';
import LandingPage from './components/LandingPage';
import Toast from './components/ui/Toast';
import { fetchEmployees, createEmployee, deleteEmployee, updateEmployee } from './services/api';
import { Employee } from './types';

const Dashboard = React.lazy(() => import('./components/Dashboard'));
const Employees = React.lazy(() => import('./components/Employees'));
const Attendance = React.lazy(() => import('./components/Attendance'));
const ChatBot = React.lazy(() => import('./components/ChatBot'));

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

  const loadEmployees = useCallback(async () => {
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
  }, []);

  const handleAddEmployee = useCallback(async (newEmp: any) => {
    try {
      const created = await createEmployee(newEmp);
      setEmployees(prev => [created, ...prev]);
      setToast({ message: 'Employee added successfully!', type: 'success' });
    } catch (error) {
      setToast({ message: (error as Error).message, type: 'error' });
    }
  }, []);

  const handleUpdateEmployee = useCallback(async (id: string, updatedData: any) => {
    try {
      const updated = await updateEmployee(id, updatedData);
      setEmployees(prev => prev.map(e => e.id === id ? updated : e));
      setToast({ message: 'Employee updated successfully!', type: 'success' });
    } catch (error) {
      setToast({ message: (error as Error).message, type: 'error' });
    }
  }, []);

  const handleDeleteEmployee = useCallback(async (id: string) => {
    console.log('Delete request for employee ID:', id);
    try {
      await deleteEmployee(id);
      setEmployees(prev => prev.filter(e => e.id !== id));
      setToast({ message: 'Employee removed successfully.', type: 'success' });
    } catch (error) {
      console.error('Delete error:', error);
      setToast({ message: (error as Error).message || 'Failed to delete employee.', type: 'error' });
    }
  }, []);

  const handleViewAllEmployees = useCallback(() => {
    setActiveTab('employees');
  }, []);

  const handleToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type });
  }, []);

  const mainContent = useMemo(() => {
    if (isLoading && isAppEntered) {
      return (
        <div className="flex h-full items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-900 border-t-transparent"></div>
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard
            employees={employees}
            onUpdateEmployee={handleUpdateEmployee}
            onViewAll={handleViewAllEmployees}
          />
        );
      case 'employees':
        return (
          <Employees
            employees={employees}
            onAddEmployee={handleAddEmployee}
            onUpdateEmployee={handleUpdateEmployee}
            onDeleteEmployee={handleDeleteEmployee}
          />
        );
      case 'attendance':
        return (
          <Attendance
            employees={employees}
            onToast={handleToast}
          />
        );
      default:
        return (
          <Dashboard
            employees={employees}
            onUpdateEmployee={handleUpdateEmployee}
            onViewAll={handleViewAllEmployees}
          />
        );
    }
  }, [activeTab, employees, handleAddEmployee, handleDeleteEmployee, handleToast, handleUpdateEmployee, handleViewAllEmployees, isAppEntered, isLoading]);

  const handleGoHome = useCallback(() => {
    setIsAppEntered(false);
    setActiveTab('dashboard');
  }, []);

  const handleSidebarTabChange = useCallback((tab: string) => {
    setActiveTab(tab);
    setIsMobileSidebarOpen(false);
  }, []);

  const handleSidebarGoHome = useCallback(() => {
    handleGoHome();
    setIsMobileSidebarOpen(false);
  }, [handleGoHome]);

  if (!isAppEntered) {
      return <LandingPage onEnter={() => setIsAppEntered(true)} />;
  }

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-slate-50 selection:bg-slate-900 selection:text-white md:flex">
      {/* Sidebar - Desktop: static in flex, Mobile: fixed overlay (doesn't take space) */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={handleSidebarTabChange}
        onGoHome={handleSidebarGoHome}
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* Mobile backdrop overlay - appears behind sidebar */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/40 md:hidden" 
          onClick={() => setIsMobileSidebarOpen(false)} 
        />
      )}
      
      {/* Main content area - full width on mobile, flex-1 on desktop */}
      <div className="w-full h-full flex flex-col min-w-0 overflow-hidden md:flex-1">
        {/* Mobile navbar - only visible on mobile */}
        <div className="md:hidden sticky top-0 z-20 flex items-center justify-between px-4 py-3 bg-white/80 backdrop-blur-xl border-b border-slate-200/60">
          <div className="flex items-center gap-2 cursor-pointer" onClick={handleGoHome}>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-md">
              <span className="material-symbols-outlined text-xl">blur_on</span>
            </div>
            <span className="text-sm font-black uppercase tracking-[0.15em] text-slate-900">HRMS Lite</span>
          </div>
          <button 
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors active:scale-95"
            onClick={() => setIsMobileSidebarOpen(true)}
            aria-label="Open menu"
          >
            <span className="material-symbols-outlined text-[22px]">menu</span>
          </button>
        </div>

        {/* Scrollable main content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar flex flex-col">
          <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-10 py-4 sm:py-6 lg:py-10 flex-1">
            <Suspense fallback={
              <div className="flex h-full items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-900 border-t-transparent"></div>
              </div>
            }>
              {mainContent}
            </Suspense>
          </div>
          
          <footer className="mt-auto px-10 py-10 border-t border-slate-200 bg-white">
            <div className="mx-auto w-full max-w-[1400px] flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="flex flex-col items-center md:items-start gap-2">
                <div className="flex items-center gap-2 text-slate-900 cursor-pointer hover:opacity-80 transition-opacity" onClick={handleGoHome}>
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
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar { scrollbar-width: thin; scrollbar-color: rgba(15,23,42,0.28) transparent; }
        .custom-scrollbar::-webkit-scrollbar { width: 10px; height: 10px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(15,23,42,0.22);
          border-radius: 999px;
          border: 3px solid transparent;
          background-clip: content-box;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(15,23,42,0.35); background-clip: content-box; }
      ` }} />

      <Suspense fallback={null}>
        <ChatBot />
      </Suspense>
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