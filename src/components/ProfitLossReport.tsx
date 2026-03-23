import React, { useState } from 'react';
import { 
  RefreshCw, 
  ChevronDown, 
  FileText, 
  FileSpreadsheet, 
  Mail, 
  Plus, 
  Minus,
  TrendingUp,
  Lightbulb,
  Bell,
  Search,
  LayoutGrid,
  Calendar
} from 'lucide-react';
import { motion } from 'motion/react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip,
  Legend
} from 'recharts';

const expenseData = [
  { name: 'COGS', value: 2.27, color: '#2563eb' },
  { name: 'OPERATING', value: 0.58, color: '#3b82f6' },
  { name: 'TAX & OTHER', value: 0.51, color: '#93c5fd' },
];

interface PLRow {
  particulars: string;
  amount: number;
  percent: number;
  type: 'header' | 'item' | 'total';
  isNegative?: boolean;
}

const plData: PLRow[] = [
  { particulars: 'INCOME', amount: 0, percent: 0, type: 'header' },
  { particulars: 'Sales Revenue', amount: 4250000, percent: 100.0, type: 'item' },
  { particulars: 'Service Income', amount: 840000, percent: 19.8, type: 'item' },
  { particulars: 'Other Operating Income', amount: 12500, percent: 0.3, type: 'item' },
  { particulars: 'DIRECT EXPENSES (COGS)', amount: 0, percent: 0, type: 'header' },
  { particulars: 'Raw Material Consumption', amount: 1850000, percent: 43.5, type: 'item', isNegative: true },
  { particulars: 'Direct Labor Costs', amount: 420000, percent: 9.9, type: 'item', isNegative: true },
  { particulars: 'GROSS PROFIT', amount: 2832500, percent: 66.6, type: 'total' },
  { particulars: 'OPERATING EXPENSES', amount: 0, percent: 0, type: 'header' },
  { particulars: 'Administrative Salaries', amount: 310000, percent: 7.3, type: 'item', isNegative: true },
  { particulars: 'Marketing & Sales', amount: 185000, percent: 4.4, type: 'item', isNegative: true },
  { particulars: 'IT & Infrastructure', amount: 92400, percent: 2.2, type: 'item', isNegative: true },
  { particulars: 'EBITDA', amount: 2245100, percent: 52.8, type: 'total' },
  { particulars: 'Interest Expense', amount: 45000, percent: 1.1, type: 'item', isNegative: true },
  { particulars: 'Corporate Income Tax', amount: 460000, percent: 10.8, type: 'item', isNegative: true },
];

export const ProfitLossReport: React.FC = () => {
  const [viewType, setViewType] = useState<'standard' | 'comparison'>('standard');

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-[1600px] mx-auto p-6 space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Profit & Loss Statement</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Interactive vertical analysis for corporate reporting</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
            <button 
              onClick={() => setViewType('standard')}
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${
                viewType === 'standard' 
                  ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
              }`}
            >
              Standard
            </button>
            <button 
              onClick={() => setViewType('comparison')}
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${
                viewType === 'comparison' 
                  ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
              }`}
            >
              Comparison
            </button>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-200">
                <Calendar size={14} /> FY 2023-24 <ChevronDown size={14} />
              </button>
            </div>
            <div className="relative">
              <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-200">
                <LayoutGrid size={14} /> All Branches <ChevronDown size={14} />
              </button>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors">
              <RefreshCw size={14} /> Refresh Data
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main P&L Table */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">Particulars</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400 text-right">Amount (USD)</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400 text-right">% of Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                {plData.map((row, i) => (
                  <tr key={i} className={`
                    ${row.type === 'header' ? 'bg-slate-50/50 dark:bg-slate-800/30' : ''}
                    ${row.type === 'total' ? 'bg-emerald-50/30 dark:bg-emerald-900/10' : ''}
                  `}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {row.type === 'item' && (
                          <div className="p-1 bg-slate-100 dark:bg-slate-800 rounded text-slate-400">
                            <Plus size={10} />
                          </div>
                        )}
                        <span className={`text-sm ${
                          row.type === 'header' ? 'font-bold text-blue-600 dark:text-blue-400 text-[10px] uppercase tracking-wider' : 
                          row.type === 'total' ? 'font-bold text-emerald-700 dark:text-emerald-400' :
                          'text-slate-700 dark:text-slate-200'
                        }`}>
                          {row.particulars}
                        </span>
                      </div>
                    </td>
                    <td className={`px-6 py-4 text-sm text-right ${
                      row.type === 'total' ? 'font-bold text-emerald-700 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-200'
                    }`}>
                      {row.amount === 0 ? '' : (row.isNegative ? `($${row.amount.toLocaleString()}.00)` : `$${row.amount.toLocaleString()}.00`)}
                    </td>
                    <td className={`px-6 py-4 text-sm text-right ${
                      row.type === 'total' ? 'font-bold text-emerald-700 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'
                    }`}>
                      {row.percent === 0 ? '' : `${row.percent.toFixed(1)}%`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="bg-blue-600 p-6 flex items-center justify-between text-white">
            <span className="text-xl font-bold uppercase tracking-tight">Net Profit</span>
            <div className="text-right">
              <span className="text-2xl font-black">$1,740,100.00</span>
              <span className="ml-4 text-lg font-medium opacity-80">40.9%</span>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Financial Health */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp size={18} className="text-blue-600" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">Financial Health</h3>
            </div>
            
            <div className="flex flex-col items-center justify-center py-4">
              <p className="text-xs text-slate-400 mb-4">Net Profit Margin</p>
              <div className="relative w-48 h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { value: 40.9, color: '#2563eb' },
                        { value: 59.1, color: '#f1f5f9' }
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={85}
                      startAngle={225}
                      endAngle={-45}
                      paddingAngle={0}
                      dataKey="value"
                      stroke="none"
                    >
                      <Cell fill="#2563eb" />
                      <Cell fill="#f1f5f9" className="dark:fill-slate-800" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-black text-slate-800 dark:text-white">40.9%</span>
                  <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mt-1">Healthy</span>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 italic mt-2">+5.2% vs. Previous Year</p>
            </div>
          </div>

          {/* Expenses Breakdown */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-xs font-bold text-slate-800 dark:text-white mb-6 uppercase tracking-wider">Expenses Breakdown</h3>
            <div className="space-y-6">
              {expenseData.map((item, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                    <span className="text-slate-800 dark:text-white">{item.name}</span>
                    <span className="text-slate-400">${item.value}M</span>
                  </div>
                  <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(item.value / 3.36) * 100}%` }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Smart Insight */}
          <div className="bg-amber-50 dark:bg-amber-900/10 p-6 rounded-xl border border-amber-100 dark:border-amber-900/30">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb size={18} className="text-amber-500" />
              <h3 className="text-sm font-bold text-amber-800 dark:text-amber-400">Smart Insight</h3>
            </div>
            <p className="text-xs text-amber-700 dark:text-amber-500/80 leading-relaxed">
              Your 'Raw Material' costs have increased by 8% this quarter. Consider negotiating supplier contracts to maintain gross margins.
            </p>
          </div>

          {/* Share Report */}
          <div className="space-y-3">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Share Report</p>
            <div className="grid grid-cols-2 gap-3">
              <button className="flex items-center justify-center gap-2 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-200">
                <FileText size={14} /> PDF
              </button>
              <button className="flex items-center justify-center gap-2 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-200">
                <FileSpreadsheet size={14} className="text-emerald-600" /> Excel
              </button>
            </div>
            <button className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors">
              <Mail size={16} /> Email to Stakeholders
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
