import * as React from 'react';
import { useEffect } from 'react';

export interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[200] pointer-events-none px-6 w-full max-w-md">
      <div className={`pointer-events-auto flex items-center gap-4 px-5 py-4 rounded-2xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] border-2 transition-all animate-in fade-in zoom-in-95 slide-in-from-top-4 duration-300 ${
        type === 'success' 
          ? 'bg-white border-emerald-500/20 text-slate-900' 
          : 'bg-white border-rose-500/20 text-slate-900'
      }`}>
        <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
          type === 'success' ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' : 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
        }`}>
          <span className="material-symbols-outlined text-lg font-bold">
            {type === 'success' ? 'check_circle' : 'error'}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-bold tracking-tight">{type === 'success' ? 'Success' : 'Attention'}</p>
          <p className="text-[12px] opacity-70 font-medium truncate">{message}</p>
        </div>
        <button 
          onClick={onClose} 
          className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-900/5 hover:text-slate-900 transition-all ml-2"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>
      </div>
    </div>
  );
};

export default Toast;
