import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface CalendarProps {
  value: string; // YYYY-MM-DD
  onChange: (date: string) => void;
  position?: 'up' | 'down' | 'auto';
  disabled?: boolean;
}

const Calendar: React.FC<CalendarProps> = ({ value, onChange, position = 'auto', disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropDirection, setDropDirection] = useState<'up' | 'down'>('down');
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
  
  // Parse initial date
  const parseLocalYMD = (ymd: string) => {
    const [y, m, d] = ymd.split('-').map(Number);
    if (!y || !m || !d) return new Date();
    return new Date(y, m - 1, d);
  };

  const initialDate = value ? parseLocalYMD(value) : new Date();
  const [viewDate, setViewDate] = useState(initialDate);

  useEffect(() => {
    if (!value) return;
    setViewDate(parseLocalYMD(value));
  }, [value]);

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const handleDateClick = (day: number) => {
    if (disabled) return;
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    onChange(formattedDate);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const inAnchor = !!containerRef.current?.contains(target);
      const inDropdown = !!dropdownRef.current?.contains(target);
      if (!inAnchor && !inDropdown) setIsOpen(false);
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

  useEffect(() => {
    if (!isOpen) {
      setAnchorRect(null);
      return;
    }

    const update = () => {
      if (!containerRef.current) return;
      setAnchorRect(containerRef.current.getBoundingClientRect());
    };

    update();
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [isOpen]);

  const renderCalendarDays = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const daysCount = daysInMonth(year, month);
    const startDay = firstDayOfMonth(year, month);
    const today = new Date();
    const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const days = [];

    // Empty cells for previous month
    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-8 w-8" />);
    }

    // Days of current month
    for (let i = 1; i <= daysCount; i++) {
      const currentDateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const isSelected = currentDateString === value;
      const isToday = currentDateString === todayString;
      
      days.push(
        <button
          key={currentDateString}
          onClick={() => handleDateClick(i)}
          className={`h-8 w-8 rounded-full text-sm font-medium transition-colors flex items-center justify-center
            ${isSelected 
              ? 'bg-slate-900 text-white' 
              : isToday
                ? 'bg-slate-900/10 text-slate-900 ring-2 ring-slate-900/15 hover:bg-slate-900/15'
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
    <div className={isOpen ? 'relative z-[9999]' : 'relative'} ref={containerRef}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-all shadow-sm active:scale-95 w-full min-w-[180px]"
      >
        <span className="material-symbols-outlined text-slate-500 text-lg">calendar_today</span>
        <span>{value || 'Select Date'}</span>
      </button>

      {isOpen && anchorRect && typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={dropdownRef}
            className="fixed z-[10000] w-72 rounded-2xl border border-slate-200 bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200 p-4"
            style={{
              left: Math.max(8, Math.min(anchorRect.left, window.innerWidth - 8 - 288)),
              top:
                dropDirection === 'up'
                  ? Math.max(8, anchorRect.top - 8 - 340)
                  : Math.min(window.innerHeight - 8 - 340, anchorRect.bottom + 8),
            }}
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
                className="text-xs text-slate-500 hover:text-slate-900 font-medium px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
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
          </div>,
          document.body
        )}
    </div>
  );
};

export default Calendar;