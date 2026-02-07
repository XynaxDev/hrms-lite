
import React, { useState, useRef, useEffect } from 'react';

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  isSearchable?: boolean;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
}

const Select: React.FC<SelectProps> = ({ 
  value, 
  onChange, 
  options, 
  placeholder = "Select...",
  isSearchable = false,
  searchValue = '',
  onSearchChange
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [openUp, setOpenUp] = useState(false);
  const [localSearch, setLocalSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

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
    if (isOpen && isSearchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, isSearchable]);

  const selectedLabel = options.find(opt => opt.value === value)?.label || placeholder;
  const searchTerm = isSearchable ? (onSearchChange ? searchValue : localSearch) : '';

  const computeDropdownDirection = () => {
    const el = containerRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const viewportH = window.innerHeight;

    const approxDropdownH = isSearchable ? 320 : 260;
    const spaceBelow = viewportH - rect.bottom;
    const spaceAbove = rect.top;

    setOpenUp(spaceBelow < approxDropdownH && spaceAbove > spaceBelow);
  };

  const handleToggle = () => {
    if (!isOpen) computeDropdownDirection();
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={handleToggle}
        className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-w-[180px]"
      >
        <span className="block truncate text-slate-700">{selectedLabel}</span>
        <span className="material-symbols-outlined text-slate-400 text-lg">unfold_more</span>
      </button>

      {isOpen && (
        <div className={`absolute z-[100] max-h-60 w-full min-w-[180px] overflow-hidden rounded-md border border-slate-200 bg-white text-slate-950 shadow-md animate-in fade-in zoom-in-95 duration-200 flex flex-col ${openUp ? 'bottom-full mb-1' : 'top-full mt-1'}`}>
          {isSearchable && (
            <div className="border-b border-slate-200 p-2">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Type a name..."
                  value={searchTerm}
                  onChange={(e) => {
                    if (onSearchChange) {
                      onSearchChange(e.target.value);
                    } else {
                      setLocalSearch(e.target.value);
                    }
                  }}
                  className="w-full h-9 pl-9 pr-3 bg-slate-50 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-300 transition-all font-medium"
                />
              </div>
            </div>
          )}
          <div className="p-1 overflow-auto">
            {options
              .filter(opt => {
                if (!isSearchable || !searchTerm) return true;
                return opt.label.toLowerCase().includes(searchTerm.toLowerCase());
              })
              .map((option) => (
              <div
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                  if (onSearchChange) onSearchChange('');
                  setLocalSearch('');
                }}
                className={`relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-slate-100 hover:text-slate-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 ${
                  value === option.value ? 'bg-slate-100' : ''
                }`}
              >
                {value === option.value && (
                  <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                    <span className="material-symbols-outlined text-sm font-bold">check</span>
                  </span>
                )}
                <span className="font-medium text-slate-700">{option.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Select;
