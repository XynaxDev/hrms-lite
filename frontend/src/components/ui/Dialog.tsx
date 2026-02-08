import * as React from 'react';
import { useEffect } from 'react';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
}

const Dialog: React.FC<DialogProps> = ({ isOpen, onClose, title, description, children }) => {
  useEffect(() => {
    if (isOpen) {
      // Calculate scrollbar width
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      
      // Apply overflow hidden and padding to body to prevent layout shift
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    } else {
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = '0px';
    }
    return () => {
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = '0px';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-auto">
      {/* Backdrop - covers entire screen, but does NOT highlight sidebar or chat bubble */}
      <div 
        className="absolute inset-0 bg-black/30 backdrop-blur-none"
        onClick={onClose}
        style={{ pointerEvents: 'auto' }}
      />
      {/* Dialog Container - constrained width, always topmost */}
      <div className="relative z-10 w-full max-w-md mx-4 max-h-[95dvh] overflow-hidden bg-white rounded-2xl shadow-2xl flex flex-col">
        {/* Header */}
        {(title || description) && (
          <div className="sticky top-0 bg-white border-b border-slate-100 px-5 py-3 rounded-t-2xl">
            <div className="flex items-start justify-between">
              <div>
                {title && <h2 className="text-lg font-bold text-slate-900">{title}</h2>}
                {description && <p className="text-sm text-slate-500 mt-1">{description}</p>}
              </div>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-100"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>
          </div>
        )}
        
        {/* Content */}
        <div className="px-5 py-3 overflow-y-auto flex-1">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Dialog;