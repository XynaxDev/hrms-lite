import * as React from 'react';
import { useState, useRef, useEffect } from 'react';

interface CalendarProps {
  value: string; // YYYY-MM-DD
  onChange: (date: string) => void;
  position?: 'up' | 'down' | 'auto';
}

const Calendar: React.FC<CalendarProps> = ({ value, onChange, position = 'auto' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dropDirection, setDropDirection] = useState<'up' | 'down'>('down');
  
  // Parse initial date
  const initialDate = value ? new Date(value) : new Date();
  const [viewDate, setViewDate] = useState(initialDate);

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const handleDateClick = (day: number) => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    onChange(formattedDate);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && containerRef.current) {
      if (position === 'auto') {
        const rect = containerRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        setDropDirection(spaceBelow < 350 ? 'up' : 'down');
      } else {
        setDropDirection(position as 'up' | 'down');
      }
    }
  }, [isOpen, position]);

  const renderCalendarDays = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const daysCount = daysInMonth(year, month);
    const startDay = firstDayOfMonth(year, month);
    const days = [];

    // Empty cells for previous month
    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-8 w-8" />);
    }

    // Days of current month
    for (let i = 1; i <= daysCount; i++) {
      const currentDateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const isSelected = currentDateString === value;
      
      days.push(
        <button
          key={currentDateString}
          onClick={() => handleDateClick(i)}
          className={`h-8 w-8 rounded-full text-sm font-medium transition-colors flex items-center justify-center
            ${isSelected 
              ? 'bg-slate-900 text-white' 
              : 'text-slate-700 hover:bg-slate-100'
            }`}
        >
          {i}
        </button>
      );
    }
    return days;
  };

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-all shadow-sm active:scale-95 w-full min-w-[180px]"
      >
        <span className="material-symbols-outlined text-slate-500 text-lg">calendar_today</span>
        <span>{value || 'Select Date'}</span>
      </button>

      {isOpen && (
        <div 
          className={`absolute z-[100] w-72 rounded-2xl border border-slate-200 bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200 p-4 ${
            dropDirection === 'up' ? 'bottom-full mb-2' : 'top-full mt-2'
          }`}
          style={{ left: 0 }}
        >
          <div className="flex items-center justify-between mb-4">
            <button onClick={handlePrevMonth} className="p-1 hover:bg-slate-100 rounded-full text-slate-500">
              <span className="material-symbols-outlined text-lg">chevron_left</span>
            </button>
            <span className="font-semibold text-slate-900 text-sm">
              {monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}
            </span>
            <button onClick={handleNextMonth} className="p-1 hover:bg-slate-100 rounded-full text-slate-500">
              <span className="material-symbols-outlined text-lg">chevron_right</span>
            </button>
          </div>
          
          <div className="grid grid-cols-7 gap-1 mb-2 text-center">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, idx) => (
              <span key={idx} className="text-xs font-bold text-slate-400">{d}</span>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-1 place-items-center">
            {renderCalendarDays()}
          </div>
          
          <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between">
             <button 
                onClick={() => {
                   onChange('');
                   setIsOpen(false);
                }}
                className="text-xs text-slate-500 hover:text-slate-900 font-medium"
             >
                Clear
             </button>
             <button 
                onClick={() => {
                   const today = new Date();
                   const str = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
                   onChange(str);
                   setIsOpen(false);
                }}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
             >
                Today
             </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;