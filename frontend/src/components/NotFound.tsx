import * as React from 'react';
import { motion } from 'framer-motion';

interface NotFoundProps {
  onBack: () => void;
}

const NotFound: React.FC<NotFoundProps> = ({ onBack }) => {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[120px] -z-10"></div>
      <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-indigo-500/5 rounded-full blur-[80px] -z-10 animate-blob"></div>
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative"
      >
        {/* Floating Number */}
        <h1 className="text-[180px] font-black leading-none tracking-tighter text-slate-900/10 select-none">
          404
        </h1>
        
        {/* Abstract Icon */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <motion.div 
               animate={{ 
                 y: [0, -15, 0],
                 rotate: [0, 5, -5, 0]
               }}
               transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
               className="h-32 w-32 rounded-[2.5rem] bg-slate-950 flex items-center justify-center shadow-2xl shadow-blue-500/20"
            >
                <span className="material-symbols-outlined text-white text-6xl">blur_off</span>
            </motion.div>
        </div>
      </motion.div>

      <div className="mt-12 max-w-md">
        <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Lost in the Workforce?</h2>
        <p className="text-slate-500 leading-relaxed font-medium mb-10">
          The requested resource has either been moved to another department or exists in a parallel workspace. Let's get you back to headquarters.
        </p>

        <button 
          onClick={onBack}
          className="group relative inline-flex items-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold transition-all hover:bg-slate-800 hover:shadow-2xl hover:shadow-slate-900/20 active:scale-95"
        >
          <span className="material-symbols-outlined transition-transform group-hover:-translate-x-1">arrow_back</span>
          <span>Return to Dashboard</span>
        </button>
      </div>

      {/* Subtle Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] pointer-events-none -z-20"></div>
    </div>
  );
};

export default NotFound;
