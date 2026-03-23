import React, { useState } from 'react';
import { 
  FileText, 
  Calendar, 
  MapPin, 
  Clock, 
  ChevronDown,
  Mail,
  ArrowUpRight,
  FileSpreadsheet,
  Send,
  Search
} from 'lucide-react';
import { motion } from 'motion/react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const agingData = [
  { name: '0-30 Days', value: 45.0, color: '#10b981' },
  { name: '31-60 Days', value: 25.0, color: '#f59e0b' },
  { name: '61-90 Days', value: 15.0, color: '#f97316' },
  { name: '91+ Days', value: 15.0, color: '#ef4444' },
];

const mockData = [
  { 
    ledgerName: 'Acme Corporation', 
    billDate: '2023-08-15', 
    billNo: 'INV-8821', 
    dueDate: '2023-09-14', 
    overdue: 43, 
    buckets: { '0-30': 0, '31-60': 12450 } 
  },
  { 
    ledgerName: 'Global Tech Industries', 
    billDate: '2023-05-10', 
    billNo: 'INV-7742', 
    dueDate: '2023-06-09', 
    overdue: 140, 
    buckets: { '0-30': 0, '31-60': 0 } 
  },
  { 
    ledgerName: 'Zenith Retailers', 
    billDate: '2023-10-01', 
    billNo: 'INV-9901', 
    dueDate: '2023-10-31', 
    overdue: 0, 
    buckets: { '0-30': 8200, '31-60': 0 } 
  },
  { 
    ledgerName: 'Harbor Logistics', 
    billDate: '2023-07-20', 
    billNo: 'INV-8210', 
    dueDate: '2023-08-19', 
    overdue: 69, 
    buckets: { '0-30': 0, '31-60': 0 } 
  },
  { 
    ledgerName: 'Starlight Medias', 
    billDate: '2023-06-15', 
    billNo: 'INV-7995', 
    dueDate: '2023-07-15', 
    overdue: 104, 
    buckets: { '0-30': 0, '31-60': 0 } 
  },
];

export const AgingAnalysisReport: React.FC = () => {
  const [asOnDate, setAsOnDate] = useState('2023-10-27');

  return (
    <div className="flex flex-col h-[calc(100vh-112px)] bg-slate-50 dark:bg-slate-950 overflow-hidden relative">
      {/* Main Scrollable Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
        <div className="max-w-[1600px] mx-auto space-y-8">
          
          {/* Header Section */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Aging Analysis Detail</h1>
              <p className="text-sm text-slate-500 font-medium tracking-tight italic">Comprehensive bill-wise outstanding receivables and payables report</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-6 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-black uppercase tracking-widest shadow-sm hover:bg-slate-50 transition-all">
                <FileText size={16} />
                PDF
              </button>
              <button className="flex items-center gap-2 px-6 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-black uppercase tracking-widest shadow-sm hover:bg-slate-50 transition-all">
                <FileSpreadsheet size={16} className="text-emerald-500" />
                Export to Excel
              </button>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">AS ON DATE</label>
                <div className="relative">
                  <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <input 
                    type="text" 
                    value={asOnDate}
                    onChange={(e) => setAsOnDate(e.target.value)}
                    className="w-full pl-4 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">LEDGER GROUP</label>
                <div className="relative">
                  <select className="w-full pl-4 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold outline-none appearance-none cursor-pointer">
                    <option>All Groups</option>
                    <option>Sundry Debtors</option>
                    <option>Sundry Creditors</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">LEDGER NAME</label>
                <div className="relative">
                  <select className="w-full pl-4 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold outline-none appearance-none cursor-pointer">
                    <option>Select Ledger</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">AREA / ZONE</label>
                <div className="relative">
                  <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <select className="w-full pl-4 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold outline-none appearance-none cursor-pointer">
                    <option>All Zones</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">AGING BUCKETS</label>
                <div className="relative">
                  <Clock className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <select className="w-full pl-4 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold outline-none appearance-none cursor-pointer">
                    <option>15 Day Intervals</option>
                    <option>30 Day Intervals</option>
                  </select>
                </div>
              </div>
            </div>
            <button className="px-8 py-2.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-500/20 transition-all">
              Apply Filters
            </button>
          </div>

          {/* Table & Sidebar Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Table Area */}
            <div className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
                    <th className="px-6 py-5">LEDGER NAME</th>
                    <th className="px-6 py-5">BILL DATE</th>
                    <th className="px-6 py-5">BILL NO</th>
                    <th className="px-6 py-5">DUE DATE</th>
                    <th className="px-6 py-5">OVERDUE</th>
                    <th className="px-6 py-5 text-right">0-30 DAYS</th>
                    <th className="px-6 py-5 text-right">31-60 DAYS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                  {mockData.map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                      <td className="px-6 py-5 text-sm font-black text-slate-900 dark:text-white">{row.ledgerName}</td>
                      <td className="px-6 py-5 text-xs font-bold text-slate-500">{row.billDate}</td>
                      <td className="px-6 py-5 text-xs font-black text-emerald-600 dark:text-emerald-400">{row.billNo}</td>
                      <td className="px-6 py-5 text-xs font-bold text-slate-500">{row.dueDate}</td>
                      <td className="px-6 py-5">
                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                          row.overdue === 0 
                            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' 
                            : row.overdue > 90
                            ? 'bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400'
                            : 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400'
                        }`}>
                          {row.overdue === 0 ? 'Current' : `${row.overdue} Days`}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-sm font-bold text-slate-900 dark:text-white text-right">
                        {row.buckets['0-30'] > 0 ? `$ ${row.buckets['0-30'].toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '—'}
                      </td>
                      <td className="px-6 py-5 text-sm font-bold text-slate-900 dark:text-white text-right">
                        {row.buckets['31-60'] > 0 ? `$ ${row.buckets['31-60'].toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Sidebar Area */}
            <div className="space-y-6">
              {/* Total Receivables Card */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">TOTAL RECEIVABLES</p>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white">$458,200.00</h2>
                <div className="flex items-center gap-1 mt-2 text-emerald-500 font-black text-[10px] uppercase tracking-widest">
                  <ArrowUpRight size={14} /> +12.5% vs last month
                </div>
              </div>

              {/* Aging Mix Chart */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white mb-6">AGING MIX %</h3>
                <div className="h-64 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={agingData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {agingData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">DEBT</span>
                    <span className="text-xl font-black text-slate-900 dark:text-white">$458k</span>
                  </div>
                </div>
                <div className="mt-6 space-y-3">
                  {agingData.map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-slate-500 dark:text-slate-400">{item.name}</span>
                      </div>
                      <span className="text-slate-900 dark:text-white">{item.value.toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reminders Sent */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white mb-6">REMINDERS SENT</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl">
                      <Mail size={16} className="text-slate-400" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">Acme Corporation</p>
                      <p className="text-[10px] text-slate-400 font-bold italic">Sent 2 hours ago by Felix</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl">
                      <Mail size={16} className="text-slate-400" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">Harbor Logistics</p>
                      <p className="text-[10px] text-slate-400 font-bold italic">Sent Yesterday at 4:12 PM</p>
                    </div>
                  </div>
                </div>
                <button className="w-full mt-8 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-100 transition-all">
                  View All Actions
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Summary Bar */}
      <div className="bg-amber-400 dark:bg-amber-500 px-8 py-6 flex items-center justify-between shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
        <div className="flex items-center gap-16">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-amber-900/60 uppercase tracking-widest mb-1">TOTAL OUTSTANDING</span>
            <p className="text-2xl font-black text-amber-900">$210,450.00</p>
          </div>
          <div className="w-px h-10 bg-amber-900/10" />
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-amber-900/60 uppercase tracking-widest mb-1">0-30 DAYS</span>
            <p className="text-2xl font-black text-amber-900">$85,320.00</p>
          </div>
          <div className="w-px h-10 bg-amber-900/10" />
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-amber-900/60 uppercase tracking-widest mb-1">31-60 DAYS</span>
            <p className="text-2xl font-black text-amber-900">$62,100.00</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 px-8 py-3 bg-emerald-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all">
            <Send size={16} fill="currentColor" />
            Send Follow-up
          </button>
        </div>
      </div>
    </div>
  );
};
