import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

interface DateRangePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (from: string, to: string) => void;
  initialFrom?: string;
  initialTo?: string;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({ 
  isOpen, 
  onClose, 
  onApply,
  initialFrom = '01/02/2026',
  initialTo = '18/02/2026'
}) => {
  const [fromDate, setFromDate] = useState(initialFrom);
  const [toDate, setToDate] = useState(initialTo);

  const presets = [
    { label: 'Yesterday', date: '17/02/2026' },
    { label: 'Today', date: '18/02/2026', active: true },
    { label: 'Last Week', date: '09/02/2026 - 15/02/2026' },
    { label: 'This Week', date: '16/02/2026 - 18/02/2026' },
    { label: 'Last Month', date: '01/01/2026 - 31/01/2026' },
    { label: 'This Month', date: '01/02/2026 - 18/02/2026' },
    { label: 'Last Quarter', date: '01/10/2025 - 31/12/2025' },
    { label: 'This Quarter', date: '01/01/2026 - 31/03/2026' },
    { label: 'Last Year', date: '01/04/2024 - 31/03/2025' },
    { label: 'This Year', date: '01/04/2025 - 31/03/2026' },
    { label: 'Last 30 Days', date: '19/01/2026 - 18/02/2026' },
    { label: 'Last 60 Days', date: '20/12/2025 - 18/02/2026' },
    { label: 'Last 12 Months', date: '18/02/2025 - 18/02/2026' },
  ];

  if (!isOpen) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="absolute top-[calc(100%+8px)] right-0 lg:right-[calc(16.66%+12px)] z-[60] w-full max-w-[640px] bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col md:flex-row ring-1 ring-black/5"
    >
      {/* Sidebar Presets */}
      <div className="w-full md:w-56 border-r border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 p-2 overflow-y-auto max-h-[480px] custom-scrollbar">
        <div className="space-y-0.5">
          {presets.map((preset, i) => (
            <button 
              key={i}
              type="button"
              className={`w-full text-left p-3 rounded-lg transition-colors group ${
                preset.active 
                  ? 'bg-white dark:bg-slate-800 border-l-4 border-brand-red shadow-sm' 
                  : 'hover:bg-white dark:hover:bg-slate-800'
              }`}
            >
              <span className={`block text-sm font-semibold ${preset.active ? 'text-brand-red' : 'text-slate-700 dark:text-slate-200'}`}>
                {preset.label}
              </span>
              <span className="block text-[11px] text-slate-400 dark:text-slate-500">
                {preset.date}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Calendar Area */}
      <div className="flex-1 p-6 flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <button type="button" className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
            <ChevronLeft size={18} className="text-slate-400" />
          </button>
          <div className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            February 2026
          </div>
          <button type="button" className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
            <ChevronRight size={18} className="text-slate-400" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
            <div key={day} className="text-center text-[10px] font-bold text-slate-400 uppercase">{day}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {/* Previous month days */}
          {[25, 26, 27, 28, 29, 30, 31].map(day => (
            <button key={`prev-${day}`} type="button" className="h-9 flex items-center justify-center text-sm text-slate-300 dark:text-slate-600 cursor-default">
              {day}
            </button>
          ))}
          
          {/* Current month days */}
          {Array.from({ length: 28 }, (_, i) => i + 1).map(day => {
            const isStart = day === 1;
            const isEnd = day === 18;
            const isInRange = day > 1 && day < 18;

            return (
              <button 
                key={day} 
                type="button"
                className={`h-9 flex items-center justify-center text-sm transition-all relative ${
                  isStart || isEnd 
                    ? 'font-semibold text-white bg-brand-red rounded-full shadow-sm z-10' 
                    : isInRange
                    ? 'font-medium text-slate-700 dark:text-slate-200 bg-brand-red/10 dark:bg-brand-red/20'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full'
                }`}
              >
                {day}
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-auto pt-6 flex items-center justify-between border-t border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <div className="bg-slate-50 dark:bg-slate-900 px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 text-xs font-semibold">
              {fromDate}
            </div>
            <span className="text-slate-400">—</span>
            <div className="bg-slate-50 dark:bg-slate-900 px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 text-xs font-semibold">
              {toDate}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            >
              Cancel
            </button>
            <button 
              type="button"
              onClick={() => onApply(fromDate, toDate)}
              className="px-5 py-2 text-xs font-bold bg-brand-red text-white rounded-lg shadow-md hover:opacity-90 transition-all"
            >
              Apply Range
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
