import * as React from 'react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onGoHome: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onGoHome, isOpen = false, onClose }) => {
  const menuItems = [
    { id: 'dashboard', icon: 'grid_view', label: 'Dashboard' },
    { id: 'employees', icon: 'groups', label: 'Employees' },
    { id: 'attendance', icon: 'calendar_month', label: 'Attendance' },
  ];

  return (
    <>
      <aside className={`fixed top-0 left-0 z-40 h-full w-64 transform transition-transform duration-300 md:static md:translate-x-0 md:w-16 md:flex md:py-8 md:h-auto md:ml-4 ${isOpen ? 'translate-x-0' : '-translate-x-full'} bg-white md:bg-white border-r border-slate-200/60`}>
        <div className="flex flex-col h-full md:items-center p-6 md:p-0">
          {/* Mobile close row */}
          <div className="flex items-center justify-between md:justify-center md:mb-6 w-full">
            <button 
              onClick={onGoHome}
              className="mb-2 flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-xl shadow-slate-900/20 hover:scale-105 transition-transform active:scale-95 md:mb-0 md:h-12 md:w-12"
            >
              <span className="material-symbols-outlined text-2xl">blur_on</span>
            </button>
            <button className="md:hidden text-slate-600" onClick={onClose} aria-label="Close menu">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <nav className="flex flex-1 flex-col gap-6 w-full md:items-center md:mt-6">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`group relative flex items-center justify-center h-12 w-full md:w-12 rounded-2xl transition-all duration-300 px-4 md:px-0 ${
                  activeTab === item.id 
                    ? 'bg-white text-slate-900 shadow-md ring-1 ring-slate-200/60' 
                    : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'
                }`}
              >
                <span className="material-symbols-outlined text-[24px]">{item.icon}</span>
                {activeTab === item.id && (
                  <div className="absolute -left-3 top-1/2 -translate-y-1/2 h-8 w-1.5 rounded-r-full bg-slate-900 hidden md:block"></div>
                )}
                
                {/* Tooltip */}
                <div className="hidden md:block absolute left-full ml-3 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-lg translate-x-[-5px] group-hover:translate-x-0">
                    {item.label}
                </div>
              </button>
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
