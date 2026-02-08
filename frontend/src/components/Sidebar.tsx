import * as React from 'react';
import { motion } from 'framer-motion';

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
      <aside className={`fixed top-0 left-0 z-50 h-[100dvh] w-64 overflow-y-auto overflow-x-hidden overscroll-contain transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 md:w-16 md:py-8 md:h-auto md:overflow-visible bg-white/95 backdrop-blur-xl md:backdrop-blur-none md:bg-white/10 border-r border-slate-200/60`}>
        {/* Fluid Background Animations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ 
            x: [0, 20, -10, 0], 
            y: [0, -15, 10, 0], 
            scale: [1, 1.2, 0.8, 1] 
          }}
          transition={{ 
            duration: 8, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br from-blue-400/40 to-purple-400/40 blur-xl pointer-events-none"
        />
        <motion.div 
          animate={{ 
            x: [0, -15, 25, 0], 
            y: [0, 20, -10, 0], 
            scale: [1, 0.7, 1.3, 1] 
          }}
          transition={{ 
            duration: 10, 
            repeat: Infinity, 
            ease: "easeInOut", 
            delay: 2 
          }}
          className="absolute top-1/2 -left-8 w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-400/35 to-pink-400/35 blur-lg pointer-events-none"
        />
        <motion.div 
          animate={{ 
            x: [0, 10, -20, 0], 
            y: [0, -25, 15, 0], 
            scale: [1, 1.1, 0.9, 1] 
          }}
          transition={{ 
            duration: 12, 
            repeat: Infinity, 
            ease: "easeInOut", 
            delay: 4 
          }}
          className="absolute bottom-10 right-1/2 w-28 h-28 rounded-full bg-gradient-to-bl from-emerald-400/38 to-cyan-400/38 blur-xl pointer-events-none"
        />
        
        {/* Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-50/10 to-transparent pointer-events-none"></div>
        </div>

        <div className="relative z-10 flex flex-col h-full md:items-center p-5 md:p-0">
          {/* Mobile close row */}
          <div className="flex items-center justify-between md:justify-center md:mb-8 w-full">
            <button 
              onClick={() => {
                onGoHome();
                onClose?.(); // Close sidebar on mobile after home click
              }}
              className="mb-2 flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-xl shadow-slate-900/20 hover:scale-105 transition-transform active:scale-95 md:mb-0 md:h-12 md:w-12 cursor-pointer"
            >
              <span className="material-symbols-outlined text-2xl">blur_on</span>
            </button>
            <button className="md:hidden text-slate-600" onClick={onClose} aria-label="Close menu">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <nav className="flex flex-1 flex-col gap-4 w-full md:items-center md:mt-8 md:ml-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  onClose?.(); // Close sidebar on mobile after selection
                }}
                className={`group relative flex items-center h-12 w-full md:w-12 md:justify-center rounded-2xl transition-all duration-300 px-4 md:px-0 ${
                  activeTab === item.id 
                    ? 'bg-white text-slate-900 shadow-md ring-1 ring-slate-200/60' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/70 md:text-slate-400 md:hover:text-slate-600 md:hover:bg-white/50'
                }`}
              >
                <span className="material-symbols-outlined text-[24px] mr-3 md:mr-0">{item.icon}</span>
                <span className="text-sm font-medium md:hidden">{item.label}</span>
                {activeTab === item.id && (
                  <div className="absolute -left-3 top-1/2 -translate-y-1/2 h-8 w-1.5 rounded-r-full bg-slate-900 hidden md:block"></div>
                )}
                
                {/* Tooltip - Fixed positioning */}
                <div className="hidden md:block absolute left-full ml-6 top-1/2 -translate-y-1/2 rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none whitespace-nowrap z-[9999] shadow-xl border border-slate-700">
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