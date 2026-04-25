/**
 * AppAccordion — React equivalent of Angular's AppAccordionComponent
 * Angular: src/app/shared/app-accordion/app-accordion.component.ts
 *
 * Recursive tree accordion for displaying hierarchical financial data
 * (Trial Balance, Chart of Accounts, etc.) with Opening/Debit/Credit/Closing columns.
 */
import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Folder } from 'lucide-react';

interface AccordionItem {
  NAME: string;
  ISGROUP?: boolean;
  OPENINGBAL?: number;
  DEBIT?: number;
  CREDIT?: number;
  isActive?: boolean;
  childNodeData?: AccordionItem[];
  groupInfo?: { isCr?: boolean };
  processedOpeningBalance?: number;
  processedDebit?: number;
  processedCredit?: number;
  processedClosingBalance?: number;
  openingDrCr?: string;
  closingDrCr?: string;
  [key: string]: any;
}

interface AppAccordionProps {
  item: AccordionItem;
  showOpeningBalance?: boolean;
  showDebit?: boolean;
  showCredit?: boolean;
  precision?: number;
  isDataLoading?: boolean;
  onItemSelected?: (item: AccordionItem) => void;
  depth?: number;
}

// Hash string to generate deterministic hue
const hashString = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
};

const fmt = (n: number | undefined, precision = 2) => {
  const v = Math.abs(n ?? 0);
  return v.toLocaleString('en-IN', { minimumFractionDigits: precision, maximumFractionDigits: precision });
};

export const AppAccordion: React.FC<AppAccordionProps> = ({
  item,
  showOpeningBalance = false,
  showDebit = false,
  showCredit = false,
  precision = 2,
  isDataLoading = false,
  onItemSelected,
  depth = 0,
}) => {
  const [expanded, setExpanded] = useState(item.isActive || false);

  const toggle = () => {
    setExpanded(!expanded);
    onItemSelected?.(item);
  };

  const openingBalance = item.processedOpeningBalance ?? Math.abs(item.OPENINGBAL || 0);
  const debit = item.processedDebit ?? Math.abs(item.DEBIT || 0);
  const credit = item.processedCredit ?? Math.abs(item.CREDIT || 0);
  const closingBalance = item.processedClosingBalance ?? Math.abs((item.OPENINGBAL || 0) + (item.DEBIT || 0) + (item.CREDIT || 0));

  const openingDrCr = item.openingDrCr || ((item.OPENINGBAL || 0) >= 0 ? 'Cr' : 'Dr');
  const closingDrCr = item.closingDrCr || (((item.OPENINGBAL || 0) + (item.DEBIT || 0) + (item.CREDIT || 0)) >= 0 ? 'Cr' : 'Dr');

  const hue = hashString(item.NAME) % 360;
  const bgColor = depth > 0 ? `hsl(${hue}, 70%, 95%)` : undefined;

  return (
    <div className="w-full" style={{ background: bgColor }}>
      {/* Row */}
      <div
        className={`flex items-center w-full border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer text-sm ${expanded ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={toggle}
      >
        {/* Name */}
        <div className="flex-1 flex items-center gap-1.5 py-2 pr-2 min-w-0">
          {item.ISGROUP && (
            expanded ? <ChevronDown size={14} className="text-blue-600 flex-shrink-0" /> : <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
          )}
          <Folder size={13} className="text-emerald-500 flex-shrink-0" />
          <span className="font-semibold text-blue-700 dark:text-blue-400 hover:underline truncate">{item.NAME}</span>
        </div>

        {/* Opening Balance */}
        {showOpeningBalance && (
          <div className="w-[130px] text-right px-2 py-2 text-slate-700 dark:text-slate-300 flex-shrink-0">
            {fmt(openingBalance, precision)} <span className="text-xs text-slate-400 ml-0.5">{openingDrCr}</span>
          </div>
        )}

        {/* Debit */}
        {showDebit && (
          <div className="w-[120px] text-right px-2 py-2 text-slate-700 dark:text-slate-300 flex-shrink-0">
            {fmt(debit, precision)}
          </div>
        )}

        {/* Credit */}
        {showCredit && (
          <div className="w-[120px] text-right px-2 py-2 text-slate-700 dark:text-slate-300 flex-shrink-0">
            {fmt(credit, precision)}
          </div>
        )}

        {/* Closing Balance */}
        <div className="w-[140px] text-right px-2 py-2 font-bold text-slate-800 dark:text-slate-200 flex-shrink-0">
          {fmt(closingBalance, precision)} <span className="text-xs text-slate-400 ml-0.5">{closingDrCr}</span>
        </div>
      </div>

      {/* Loading indicator */}
      {expanded && isDataLoading && (
        <div className="pl-8 py-2 text-xs text-blue-600 dark:text-blue-400 font-medium animate-pulse">Loading...</div>
      )}

      {/* Children */}
      {expanded && item.childNodeData?.map((child, i) => (
        <AppAccordion
          key={`${child.NAME}-${i}`}
          item={child}
          showOpeningBalance={showOpeningBalance}
          showDebit={showDebit}
          showCredit={showCredit}
          precision={precision}
          onItemSelected={onItemSelected}
          depth={depth + 1}
        />
      ))}
    </div>
  );
};
