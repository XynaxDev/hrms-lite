
import React, { useState, useRef, useEffect } from 'react';

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  isSearchable?: boolean;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  position?: 'auto' | 'up' | 'down';
  maxVisibleOptions?: number;
}

const Select: React.FC<SelectProps> = ({ 
  value, 
  onChange, 
  options, 
  placeholder = "Select...",
  isSearchable = false,
  searchValue = '',
  onSearchChange,
  position = 'auto',
  maxVisibleOptions
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [openUp, setOpenUp] = useState(false);
  const [localSearch, setLocalSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties | undefined>(undefined);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setMenuStyle(undefined);
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

    const approxDropdownH = isSearchable ? 380 : 320;
    const spaceBelow = viewportH - rect.bottom;
    const spaceAbove = rect.top;

    const forcedUp = position === 'up';
    const forcedDown = position === 'down';
    const autoUp = spaceBelow < approxDropdownH && spaceAbove > spaceBelow;
    const nextOpenUp = forcedUp ? true : forcedDown ? false : autoUp;
    setOpenUp(nextOpenUp);

    const width = rect.width;
    const left = rect.left;
    const rightOverflow = left + width - window.innerWidth;
    const clampedLeft = rightOverflow > 0 ? Math.max(8, left - rightOverflow - 8) : Math.max(8, left);
    const shouldUp = nextOpenUp;
    const top = shouldUp ? undefined : rect.bottom + 4;
    const bottom = shouldUp ? window.innerHeight - rect.top + 4 : undefined;
    const optionRowPx = 34;
    const cappedByCount =
      typeof maxVisibleOptions === 'number' && maxVisibleOptions > 0
        ? maxVisibleOptions * optionRowPx + (isSearchable ? 56 : 16)
        : undefined;

    const naturalMax = Math.min(isSearchable ? 420 : 340, Math.max(220, (shouldUp ? spaceAbove : spaceBelow) - 16));
    const maxH = cappedByCount ? Math.min(naturalMax, cappedByCount) : naturalMax;

    setMenuStyle({
      position: 'fixed',
      left: clampedLeft,
      width,
      top,
      bottom,
      maxHeight: maxH,
    });
  };

  const handleToggle = () => {
    if (!isOpen) {
      computeDropdownDirection();
      setIsOpen(true);
      return;
    }
    setIsOpen(false);
    setMenuStyle(undefined);
  };

  useEffect(() => {
    if (!isOpen) return;
    const onRecalc = () => computeDropdownDirection();
    onRecalc();
    window.addEventListener('resize', onRecalc);
    window.addEventListener('scroll', onRecalc, true);
    return () => {
      window.removeEventListener('resize', onRecalc);
      window.removeEventListener('scroll', onRecalc, true);
    };
  }, [isOpen, isSearchable, position]);

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

      {isOpen && menuStyle && (
        <div
          className="z-[9999] overflow-hidden rounded-md border border-slate-200 bg-white text-slate-950 shadow-md animate-in fade-in zoom-in-95 duration-200 flex flex-col"
          style={menuStyle}
        >
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
          <div className="p-1 overflow-auto custom-scrollbar">
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
