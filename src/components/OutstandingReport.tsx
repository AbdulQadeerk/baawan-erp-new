import React from 'react';
import { 
  MessageSquare, 
  FileText, 
  FileSpreadsheet, 
  Search, 
  ChevronLeft, 
  ChevronRight,
  BarChart3,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  ArrowUpDown
} from 'lucide-react';
import { motion } from 'motion/react';
import { OutstandingLedger } from '../types';

const mockData: OutstandingLedger[] = [
  { id: '01', name: 'Apex Solutions Inc.', group: 'Sundry Debtors', areaCity: 'North / Chicago', mobile: '+1 202-555-0143', creditLimit: 50000, outstanding: 42350, status: 'within-limit' },
  { id: '02', name: 'Global Logistics Co.', group: 'Sundry Debtors', areaCity: 'South / Miami', mobile: '+1 305-555-0892', creditLimit: 25000, outstanding: 28900, status: 'exceeded' },
  { id: '03', name: 'Metro Builders Ltd.', group: 'Sundry Debtors', areaCity: 'Central / Denver', mobile: '+1 720-555-0612', creditLimit: 100000, outstanding: 15400, status: 'within-limit' },
  { id: '04', name: 'Zodiac Infotech', group: 'Sundry Debtors', areaCity: 'West / Seattle', mobile: '+1 206-555-0994', creditLimit: 10000, outstanding: 11250, status: 'exceeded' },
  { id: '05', name: 'Pioneer Retailers', group: 'Sundry Debtors', areaCity: 'East / Boston', mobile: '+1 617-555-0322', creditLimit: 30000, outstanding: 2800, status: 'within-limit' },
];

export const OutstandingReport: React.FC = () => {
  return (
    <div className="flex flex-col min-h-[calc(100vh-104px)]">
      <div className="flex-1 flex overflow-hidden">
        {/* Main Content */}
        <div className="flex-1 overflow-y-auto pb-24 custom-scrollbar">
          <div className="px-6 py-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Multiple Ledger Outstanding</h1>
              <p className="text-slate-500 text-sm mt-1">Real-time multi-dimensional view of accounts receivable and credit risk.</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white font-bold rounded-lg shadow-sm hover:brightness-95 transition-all text-sm">
                <MessageSquare size={18} /> Bulk WhatsApp
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-lg shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all text-sm">
                <FileText size={18} /> PDF
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-lg shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all text-sm">
                <FileSpreadsheet size={18} /> Excel
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="mx-6 p-4 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <FilterSelect label="Ledger Group" options={['Sundry Debtors', 'Sundry Creditors', 'Loans & Advances']} />
            <FilterSelect label="Area" options={['All Areas', 'North Zone', 'South Zone', 'Central Metro']} />
            <FilterSelect label="Sales Person" options={['All Personnel', 'John Smith', 'Sarah Parker', 'David Miller']} />
            <FilterSelect label="Category" options={['All Categories', 'Corporate', 'Retail', 'Wholesale']} />
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Date As Of</label>
              <input className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:ring-emerald-500 focus:border-emerald-500 dark:text-white" type="date" defaultValue="2023-10-27"/>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Min Balance</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">$</span>
                <input className="w-full pl-7 rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:ring-emerald-500 focus:border-emerald-500 dark:text-white" placeholder="500" type="number"/>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="m-6 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                    <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider w-12 text-center">No.</th>
                    <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-emerald-500">
                      <div className="flex items-center gap-1">Ledger Name <ArrowUpDown size={12} /></div>
                    </th>
                    <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Group</th>
                    <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Area / City</th>
                    <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Mobile No</th>
                    <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Credit Limit</th>
                    <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Outstanding</th>
                    <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {mockData.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-4 text-xs text-slate-400 text-center">{row.id}</td>
                      <td className="px-4 py-4 font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer">{row.name}</td>
                      <td className="px-4 py-4 text-xs text-slate-600 dark:text-slate-400">{row.group}</td>
                      <td className="px-4 py-4 text-xs text-slate-600 dark:text-slate-400">{row.areaCity}</td>
                      <td className="px-4 py-4 text-xs text-slate-600 dark:text-slate-400">
                        <div className="flex items-center gap-2">
                          {row.mobile}
                          <MessageSquare size={14} className="text-emerald-500 cursor-pointer" />
                        </div>
                      </td>
                      <td className="px-4 py-4 text-xs font-mono text-right text-slate-600 dark:text-slate-400">${row.creditLimit.toLocaleString()}</td>
                      <td className={`px-4 py-4 text-sm font-black text-right ${row.status === 'exceeded' ? 'text-red-600' : 'text-slate-900 dark:text-white'}`}>
                        ${row.outstanding.toLocaleString()}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className={`px-2 py-1 text-[10px] font-bold rounded uppercase tracking-tighter border ${
                          row.status === 'within-limit' 
                            ? 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800' 
                            : 'bg-red-100 text-red-600 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800'
                        }`}>
                          {row.status === 'within-limit' ? 'Within Limit' : 'Exceeded'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800 flex items-center justify-between border-t border-slate-200 dark:border-slate-700">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Showing 1 to 5 of 142 ledgers</p>
              <div className="flex gap-2">
                <button className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded disabled:opacity-30"><ChevronLeft size={14} /></button>
                <button className="px-2 py-1 bg-emerald-500 text-white text-[10px] font-bold rounded">1</button>
                <button className="px-2 py-1 hover:bg-slate-200 dark:hover:bg-slate-700 text-[10px] font-bold rounded text-slate-600 dark:text-slate-400">2</button>
                <button className="px-2 py-1 hover:bg-slate-200 dark:hover:bg-slate-700 text-[10px] font-bold rounded text-slate-600 dark:text-slate-400">3</button>
                <button className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"><ChevronRight size={14} /></button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="w-80 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col hidden xl:flex">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800">
            <h3 className="font-black text-slate-900 dark:text-white flex items-center gap-2 uppercase tracking-tighter">
              <BarChart3 size={18} className="text-emerald-500" /> Aging Summary
            </h3>
            <p className="text-xs text-slate-500 mt-1 font-bold uppercase tracking-wider opacity-60">Outstanding by age groups</p>
          </div>
          <div className="flex-1 p-6 flex flex-col gap-8 overflow-y-auto custom-scrollbar">
            <div className="space-y-6">
              <AgingBar label="0-30 Days" value={45200} color="bg-emerald-500" percentage={75} />
              <AgingBar label="31-60 Days" value={18400} color="bg-blue-500" percentage={40} />
              <AgingBar label="61-90 Days" value={9200} color="bg-orange-400" percentage={25} />
              <AgingBar label="90+ Days" value={27550} percentage={55} color="bg-red-500" />
            </div>

            <div className="p-4 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-xl border border-emerald-500/20">
              <h4 className="text-[10px] font-black text-slate-800 dark:text-slate-100 uppercase mb-3 tracking-widest">Quick Analysis</h4>
              <div className="flex flex-col gap-2">
                <AnalysisRow label="AVG Overdue" value="42 Days" />
                <AnalysisRow label="Risk Ratio" value="14.2% High" valueColor="text-red-600" />
                <AnalysisRow label="Pending Reminders" value="12 Customers" />
              </div>
              <button className="w-full mt-4 py-2 bg-slate-900 dark:bg-white dark:text-slate-900 text-white text-xs font-bold rounded-lg hover:opacity-90 transition-opacity">
                Generate Statement
              </button>
            </div>
          </div>
          <div className="p-6 bg-slate-50 dark:bg-slate-800/50">
            <div className="flex items-center gap-3">
              <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="w-3/4 h-full bg-emerald-500"></div>
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider">75% Target Recovery</span>
            </div>
          </div>
        </aside>
      </div>

      {/* Footer Summary */}
      <footer className="fixed bottom-0 w-full z-40 bg-yellow-400 text-slate-900 px-6 py-4 shadow-[0_-4px_15px_-3px_rgba(0,0,0,0.1)] flex items-center justify-between border-t-2 border-yellow-500/50">
        <div className="flex items-center gap-12">
          <SummaryItem label="Total Ledgers" value="142" />
          <div className="w-px h-8 bg-slate-900/10" />
          <SummaryItem label="Total Credit Limit" value="$2,450,000.00" />
        </div>
        <div className="flex items-center gap-12 text-right">
          <div className="flex flex-col pr-12 border-r border-slate-900/10">
            <span className="text-[10px] uppercase font-black tracking-widest opacity-60">Overall Avg Collection</span>
            <span className="text-xl font-black leading-none">38.5%</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-black tracking-widest opacity-60">Total Outstanding Amount</span>
            <span className="text-3xl font-black leading-none tracking-tighter">$100,350.00</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

const FilterSelect = ({ label, options }: { label: string, options: string[] }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{label}</label>
    <select className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:ring-emerald-500 focus:border-emerald-500 dark:text-white outline-none py-2 px-3">
      {options.map(opt => <option key={opt}>{opt}</option>)}
    </select>
  </div>
);

const AgingBar = ({ label, value, color, percentage }: { label: string, value: number, color: string, percentage: number }) => (
  <div className="relative pt-1">
    <div className="flex mb-2 items-center justify-between">
      <div>
        <span className={`text-[10px] font-bold inline-block py-1 px-2 uppercase rounded-full ${color.replace('bg-', 'text-')} ${color.replace('bg-', 'bg-')}/10`}>
          {label}
        </span>
      </div>
      <div className="text-right">
        <span className={`text-xs font-black ${color.replace('bg-', 'text-')}`}>${value.toLocaleString()}</span>
      </div>
    </div>
    <div className="overflow-hidden h-2 text-xs flex rounded-full bg-slate-100 dark:bg-slate-800">
      <div className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${color}`} style={{ width: `${percentage}%` }}></div>
    </div>
  </div>
);

const AnalysisRow = ({ label, value, valueColor = 'text-slate-900 dark:text-white' }: { label: string, value: string, valueColor?: string }) => (
  <div className="flex justify-between text-[11px] py-1.5 border-b border-slate-200/50 dark:border-slate-700/50 last:border-0">
    <span className="text-slate-500 font-medium">{label}</span>
    <span className={`font-bold ${valueColor}`}>{value}</span>
  </div>
);

const SummaryItem = ({ label, value }: { label: string, value: string }) => (
  <div className="flex flex-col">
    <span className="text-[10px] uppercase font-black tracking-widest opacity-60">{label}</span>
    <span className="text-xl font-black leading-none">{value}</span>
  </div>
);
