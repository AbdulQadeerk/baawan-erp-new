import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronRight, 
  Upload, 
  Download, 
  Mail, 
  FileText, 
  Table, 
  Info, 
  CheckCircle2,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Activity
} from 'lucide-react';
import { motion } from 'motion/react';

interface BalanceRow {
  id: string;
  description: string;
  current: string;
  previous: string;
  change: string;
  isPositive: boolean;
  isHeader?: boolean;
  isSubHeader?: boolean;
  isTotal?: boolean;
  children?: BalanceRow[];
  isOpen?: boolean;
}

const initialData: BalanceRow[] = [
  {
    id: 'assets',
    description: 'ASSETS',
    current: '',
    previous: '',
    change: '',
    isPositive: true,
    isHeader: true,
    children: [
      {
        id: 'current-assets',
        description: 'Current Assets',
        current: '$ 1,240,000.00',
        previous: '$ 1,100,000.00',
        change: '+12.7%',
        isPositive: true,
        isSubHeader: true,
        isOpen: true,
        children: [
          { id: 'cash', description: 'Cash & Equivalents', current: '$ 450,000.00', previous: '$ 410,000.00', change: '+9.7%', isPositive: true },
          { id: 'receivables', description: 'Accounts Receivable', current: '$ 790,000.00', previous: '$ 690,000.00', change: '+14.4%', isPositive: true },
        ]
      },
      {
        id: 'fixed-assets',
        description: 'Fixed Assets',
        current: '$ 4,500,000.00',
        previous: '$ 4,550,000.00',
        change: '-1.1%',
        isPositive: false,
        isSubHeader: true,
      },
      {
        id: 'investments',
        description: 'Investments',
        current: '$ 300,000.00',
        previous: '$ 250,000.00',
        change: '+20.0%',
        isPositive: true,
        isSubHeader: true,
      }
    ]
  }
];

export const BalanceSheet: React.FC = () => {
  const [data, setData] = useState<BalanceRow[]>(initialData);
  const [viewType, setViewType] = useState<'summary' | 'detailed'>('summary');

  return (
    <div className="flex h-[calc(100vh-112px)] overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Main Report Area */}
      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Balance Sheet</h1>
              <p className="text-sm text-slate-500 font-medium">Financial Year Ending Dec 2023 • Consolidated View</p>
            </div>
            <button className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all">
              <Upload size={18} className="rotate-180" />
              Export
            </button>
          </div>

          {/* Filters Bar */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-4">
              <FilterButton icon={<Calendar size={16} />} label="As of: Dec 31, 2023" />
              <FilterButton icon={<Layers size={16} />} label="All Divisions" />
              <FilterButton icon={<Activity size={16} />} label="Vs: Last Year" />
            </div>
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button 
                onClick={() => setViewType('summary')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${viewType === 'summary' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500'}`}
              >
                Summary
              </button>
              <button 
                onClick={() => setViewType('detailed')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${viewType === 'detailed' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500'}`}
              >
                Detailed
              </button>
            </div>
          </div>

          {/* Report Table */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
                  <th className="px-8 py-5">Account Description</th>
                  <th className="px-8 py-5 text-right">Current Period (USD)</th>
                  <th className="px-8 py-5 text-right">Previous Period (USD)</th>
                  <th className="px-8 py-5 text-center">Change %</th>
                </tr>
              </thead>
              <tbody>
                {/* Assets Section */}
                <SectionHeader icon={<Activity size={18} className="text-blue-600" />} title="ASSETS" />
                <ReportRow 
                  description="Current Assets" 
                  current="$ 1,240,000.00" 
                  previous="$ 1,100,000.00" 
                  change="+12.7%" 
                  isPositive={true} 
                  isSubHeader 
                  hasChildren
                />
                <ReportRow description="Cash & Equivalents" current="$ 450,000.00" previous="$ 410,000.00" change="+9.7%" isPositive={true} isChild />
                <ReportRow description="Accounts Receivable" current="$ 790,000.00" previous="$ 690,000.00" change="+14.4%" isPositive={true} isChild />
                
                <ReportRow description="Fixed Assets" current="$ 4,500,000.00" previous="$ 4,550,000.00" change="-1.1%" isPositive={false} isSubHeader />
                <ReportRow description="Investments" current="$ 300,000.00" previous="$ 250,000.00" change="+20.0%" isPositive={true} isSubHeader />
                
                <tr className="bg-slate-50/50 dark:bg-slate-800/30">
                  <td className="px-8 py-6 text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">TOTAL ASSETS</td>
                  <td className="px-8 py-6 text-sm font-black text-slate-900 dark:text-white text-right">$ 6,040,000.00</td>
                  <td className="px-8 py-6 text-sm font-black text-slate-400 dark:text-slate-500 text-right">$ 5,900,000.00</td>
                  <td className="px-8 py-6 text-center">
                    <span className="text-xs font-bold text-emerald-600">+2.4%</span>
                  </td>
                </tr>

                {/* Equity & Liabilities Section */}
                <SectionHeader icon={<Layers size={18} className="text-amber-500" />} title="EQUITY & LIABILITIES" />
                <ReportRow description="Current Liabilities" current="$ 850,000.00" previous="$ 900,000.00" change="-5.5%" isPositive={false} isSubHeader />
                <ReportRow description="Long-term Debt" current="$ 2,100,000.00" previous="$ 2,000,000.00" change="+5.0%" isPositive={true} isSubHeader />
                <ReportRow description="Total Equity" current="$ 3,090,000.00" previous="$ 3,000,000.00" change="+3.0%" isPositive={true} isSubHeader />
              </tbody>
            </table>

            {/* Footer */}
            <div className="p-8 bg-slate-50/30 dark:bg-slate-800/10 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Equity & Liabilities</p>
                <p className="text-3xl font-black text-slate-900 dark:text-white">$ 6,040,000.00</p>
              </div>
              <div className="flex items-center gap-2 px-6 py-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl">
                <CheckCircle2 size={20} className="text-emerald-500" />
                <span className="text-xs font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">Balance Sheet is Balanced</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Insights */}
      <div className="w-96 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-y-auto p-8 custom-scrollbar space-y-8">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight mb-6">
            <Activity size={18} className="text-blue-600" />
            Liquidity Insights
          </h3>
          
          <div className="space-y-8">
            <InsightGauge label="Current Ratio" value="1.45" target="1.2+" color="text-blue-600" percentage={75} />
            <InsightGauge label="Debt-to-Equity" value="0.95" target="1.0" color="text-amber-500" percentage={60} />
          </div>
        </div>

        <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-4">
            <Info size={16} className="text-blue-600" />
            <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest">Analysis</span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Liquidity is strong, but debt-to-equity ratio has increased by <span className="text-rose-500 font-bold">5%</span> since last quarter. Monitoring is recommended.
          </p>
        </div>

        <div className="space-y-3">
          <ActionLink icon={<FileText className="text-rose-500" />} label="Download PDF" subLabel="Official Financial Report" />
          <ActionLink icon={<Table className="text-emerald-500" />} label="Export to Excel" subLabel="Editable Ledger Data" />
          <ActionLink icon={<Mail className="text-blue-500" />} label="Share via Email" subLabel="Secure Direct Link" />
        </div>
      </div>
    </div>
  );
};

const FilterButton = ({ icon, label }: { icon: React.ReactNode, label: string }) => (
  <button className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all group">
    <span className="text-blue-600">{icon}</span>
    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{label}</span>
    <ChevronDown size={14} className="text-slate-400 group-hover:text-slate-600" />
  </button>
);

const SectionHeader = ({ icon, title }: { icon: React.ReactNode, title: string }) => (
  <tr className="bg-slate-50/30 dark:bg-slate-800/10">
    <td colSpan={4} className="px-8 py-4">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center">
          {icon}
        </div>
        <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">{title}</span>
      </div>
    </td>
  </tr>
);

const ReportRow = ({ description, current, previous, change, isPositive, isSubHeader, hasChildren, isChild }: any) => (
  <tr className={`group transition-colors ${isSubHeader ? 'bg-white dark:bg-slate-900' : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/30'}`}>
    <td className={`px-8 py-4 ${isChild ? 'pl-16' : ''}`}>
      <div className="flex items-center gap-3">
        {isSubHeader && (
          <div className="w-5 h-5 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
            {hasChildren ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          </div>
        )}
        <span className={`text-sm ${isSubHeader ? 'font-bold text-slate-900 dark:text-white' : 'text-slate-500 italic'}`}>
          {description}
        </span>
      </div>
    </td>
    <td className={`px-8 py-4 text-sm text-right ${isSubHeader ? 'font-bold text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
      {current}
    </td>
    <td className="px-8 py-4 text-sm text-slate-400 dark:text-slate-500 text-right">
      {previous}
    </td>
    <td className="px-8 py-4 text-center">
      <span className={`text-[10px] font-black px-2 py-0.5 rounded ${isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
        {change}
      </span>
    </td>
  </tr>
);

const InsightGauge = ({ label, value, target, color, percentage }: any) => (
  <div className="flex flex-col items-center text-center">
    <div className="relative w-32 h-32 mb-4">
      <svg className="w-full h-full" viewBox="0 0 100 100">
        <circle className="text-slate-100 dark:text-slate-800 stroke-current" strokeWidth="8" fill="transparent" r="40" cx="50" cy="50" />
        <circle 
          className={`${color} stroke-current`} 
          strokeWidth="8" 
          strokeDasharray={251.2} 
          strokeDashoffset={251.2 - (251.2 * percentage) / 100} 
          strokeLinecap="round" 
          fill="transparent" 
          r="40" 
          cx="50" 
          cy="50" 
          transform="rotate(-90 50 50)"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-black text-slate-900 dark:text-white leading-none">{value}</span>
        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">Target: {target}</span>
      </div>
    </div>
    <h4 className="text-xs font-bold text-slate-900 dark:text-white">{label}</h4>
    <p className="text-[10px] text-slate-500 mt-1">Measuring ability to pay short-term obligations.</p>
  </div>
);

const ActionLink = ({ icon, label, subLabel }: any) => (
  <button className="w-full flex items-center gap-4 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl hover:shadow-md transition-all group">
    <div className="w-10 h-10 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <div className="text-left">
      <p className="text-sm font-bold text-slate-900 dark:text-white">{label}</p>
      <p className="text-[10px] text-slate-500 font-medium">{subLabel}</p>
    </div>
  </button>
);
