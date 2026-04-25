/**
 * DateRangeSelector — React equivalent of Angular's DateRangeSelectorComponent
 * Angular: src/app/shared/date-range-selector/date-range-selector.component.ts
 */
import React, { useState, useRef, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { useAuth } from '../lib/auth-context';
import { formatDateDMY } from './utils/formatters';

interface DateRangeSelectorProps {
  onRangeSelect: (range: { fromDate: string; toDate: string }) => void;
}

export const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({ onRangeSelect }) => {
  const { company } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatDateYMD = (d: Date) => {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };

  const calculateRange = (rangeType: string): { from: Date; to: Date } => {
    const today = new Date();
    let fromDate = new Date();
    let toDate = new Date();

    switch (rangeType) {
      case 'yesterday':
        fromDate.setDate(today.getDate() - 1);
        toDate = new Date(fromDate);
        break;
      case 'lastWeek':
        fromDate.setDate(today.getDate() - 7 - today.getDay() + 1);
        toDate.setDate(today.getDate() - today.getDay());
        break;
      case 'lastMonth':
        fromDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        toDate = new Date(today.getFullYear(), today.getMonth(), 0);
        break;
      case 'lastQuarter':
        const quarter = Math.floor(today.getMonth() / 3);
        fromDate = new Date(today.getFullYear(), quarter * 3 - 3, 1);
        toDate = new Date(today.getFullYear(), quarter * 3, 0);
        break;
      case 'lastYear':
        if (company?.currentFYStarts && company?.currentFYEnds) {
          const cyStart = new Date(company.currentFYStarts);
          const cyEnd = new Date(company.currentFYEnds);
          fromDate = new Date(cyStart.getFullYear() - 1, cyStart.getMonth(), cyStart.getDate());
          toDate = new Date(cyEnd.getFullYear() - 1, cyEnd.getMonth(), cyEnd.getDate());
        } else {
          fromDate = new Date(today.getFullYear() - 2, 3, 1);
          toDate = new Date(today.getFullYear() - 1, 2, 31);
        }
        break;
      case 'today':
        fromDate = new Date();
        toDate = new Date();
        break;
      case 'thisWeek':
        fromDate.setDate(today.getDate() - today.getDay() + 1);
        toDate = new Date();
        break;
      case 'thisMonth':
        fromDate = new Date(today.getFullYear(), today.getMonth(), 1);
        toDate = new Date();
        break;
      case 'thisQuarter':
        fromDate = new Date(today.getFullYear(), Math.floor(today.getMonth() / 3) * 3, 1);
        toDate = new Date();
        break;
      case 'thisYear':
        if (company?.currentFYStarts && company?.currentFYEnds) {
          fromDate = new Date(company.currentFYStarts);
          toDate = new Date(company.currentFYEnds);
        } else {
          fromDate = new Date(today.getFullYear() - 1, 3, 1);
          toDate = new Date(today.getFullYear(), 2, 31);
        }
        break;
      case 'last30Days':
        fromDate.setDate(today.getDate() - 30);
        toDate = new Date();
        break;
      case 'last60Days':
        fromDate.setDate(today.getDate() - 60);
        toDate = new Date();
        break;
      case 'last12Months':
        fromDate = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
        toDate = new Date();
        break;
    }

    return { from: fromDate, to: toDate };
  };

  const getDisplayRange = (rangeType: string): string => {
    const { from, to } = calculateRange(rangeType);
    const fromStr = formatDateDMY(from);
    const toStr = formatDateDMY(to);
    return fromStr === toStr ? fromStr : `${fromStr} - ${toStr}`;
  };

  const handleSelect = (rangeType: string) => {
    const { from, to } = calculateRange(rangeType);
    onRangeSelect({
      fromDate: formatDateYMD(from),
      toDate: formatDateYMD(to),
    });
    setIsOpen(false);
  };

  const RangeButton = ({ type, label }: { type: string; label: string }) => (
    <button
      onClick={() => handleSelect(type)}
      className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
    >
      <div className="font-semibold text-slate-700 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400">{label}</div>
      <div className="text-[10px] text-slate-400 mt-0.5">{getDisplayRange(type)}</div>
    </button>
  );

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm"
        title="Date Range"
      >
        <Calendar size={18} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-[400px] bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 p-4 z-50">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <RangeButton type="yesterday" label="Yesterday" />
              <RangeButton type="lastWeek" label="Last Week" />
              <RangeButton type="lastMonth" label="Last Month" />
              <RangeButton type="lastQuarter" label="Last Quarter" />
              <RangeButton type="lastYear" label="Last Year" />
            </div>
            <div className="space-y-1">
              <RangeButton type="today" label="Today" />
              <RangeButton type="thisWeek" label="This Week" />
              <RangeButton type="thisMonth" label="This Month" />
              <RangeButton type="thisQuarter" label="This Quarter" />
              <RangeButton type="thisYear" label="This Year" />
            </div>
          </div>
          
          <div className="my-3 border-t border-slate-100 dark:border-slate-800"></div>
          
          <div className="grid grid-cols-3 gap-2">
            <RangeButton type="last30Days" label="Last 30 Days" />
            <RangeButton type="last60Days" label="Last 60 Days" />
            <RangeButton type="last12Months" label="Last 12 Months" />
          </div>
        </div>
      )}
    </div>
  );
};
