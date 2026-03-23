import React, { useState } from 'react';
import { 
  Search, 
  FileDown, 
  MessageSquare, 
  FileText, 
  Calendar, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight,
  Filter,
  TrendingUp,
  AlertCircle,
  Clock,
  ArrowUpRight,
  Printer,
  Share2,
  Mail,
  Phone,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { motion } from 'motion/react';

interface LedgerOutstanding {
  id: string;
  no: string;
  name: string;
  group: string;
  areaCity: string;
  mobile: string;
  creditLimit: number;
  outstanding: number;
  status: 'within-limit' | 'exceeded';
}

const mockData: LedgerOutstanding[] = [
  { id: '1', no: '01', name: 'Apex Solutions Inc.', group: 'Sundry Debtors', areaCity: 'North / Chicago', mobile: '+1 202-555-0143', creditLimit: 50000, outstanding: 42350, status: 'within-limit' },
  { id: '2', no: '02', name: 'Global Logistics Co.', group: 'Sundry Debtors', areaCity: 'South / Miami', mobile: '+1 305-555-0892', creditLimit: 25000, outstanding: 28900, status: 'exceeded' },
  { id: '3', no: '03', name: 'Metro Builders Ltd.', group: 'Sundry Debtors', areaCity: 'Central / Denver', mobile: '+1 720-555-0612', creditLimit: 100000, outstanding: 15400, status: 'within-limit' },
  { id: '4', no: '04', name: 'Zodiac Infotech', group: 'Sundry Debtors', areaCity: 'West / Seattle', mobile: '+1 206-555-0994', creditLimit: 10000, outstanding: 11250, status: 'exceeded' },
  { id: '5', no: '05', name: 'Pioneer Retailers', group: 'Sundry Debtors', areaCity: 'East / Boston', mobile: '+1 617-555-0322', creditLimit: 30000, outstanding: 2800, status: 'within-limit' },
];

export const MultipleLedgerOutstanding: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="flex flex-col h-[calc(100vh-112px)] bg-slate-50 dark:bg-slate-950 overflow-hidden relative">
      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="p-8 max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Left Side: Table & Filters */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Header Section */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Multiple Ledger Outstanding</h1>
                <p className="text-sm text-slate-500 font-medium tracking-tight italic">Real-time multi-dimensional view of accounts receivable and credit risk.</p>
              </div>
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all">
                  <MessageSquare size={16} fill="currentColor" />
                  Bulk WhatsApp
                </button>
                <button className="flex items-center gap-2 px-6 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-black uppercase tracking-widest shadow-sm hover:bg-slate-50 transition-all">
                  <FileDown size={16} />
                  PDF
                </button>
                <button className="flex items-center gap-2 px-6 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-black uppercase tracking-widest shadow-sm hover:bg-slate-50 transition-all">
                  <FileText size={16} />
                  Excel
                </button>
              </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">LEDGER GROUP</label>
                  <div className="relative">
                    <select className="w-full pl-4 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold outline-none appearance-none cursor-pointer">
                      <option>Sundry Debtors</option>
                      <option>Sundry Creditors</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">AREA</label>
                  <div className="relative">
                    <select className="w-full pl-4 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold outline-none appearance-none cursor-pointer">
                      <option>All Areas</option>
                      <option>North Zone</option>
                      <option>South Zone</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">SALES PERSON</label>
                  <div className="relative">
                    <select className="w-full pl-4 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold outline-none appearance-none cursor-pointer">
                      <option>All Personnel</option>
                      <option>John Doe</option>
                      <option>Jane Smith</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">CATEGORY</label>
                  <div className="relative">
                    <select className="w-full pl-4 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold outline-none appearance-none cursor-pointer">
                      <option>All Categories</option>
                      <option>Premium</option>
                      <option>Standard</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">DATE AS OF</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input 
                      type="text" 
                      defaultValue="10/27/2023"
                      className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">MIN BALANCE</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">$</span>
                    <input 
                      type="text" 
                      defaultValue="500"
                      className="w-full pl-7 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Table Section */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
                    <th className="px-6 py-5">NO.</th>
                    <th className="px-6 py-5">LEDGER NAME</th>
                    <th className="px-6 py-5">GROUP</th>
                    <th className="px-6 py-5">AREA / CITY</th>
                    <th className="px-6 py-5">MOBILE NO</th>
                    <th className="px-6 py-5 text-right">CREDIT LIMIT</th>
                    <th className="px-6 py-5 text-right">OUTSTANDING</th>
                    <th className="px-6 py-5 text-center">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                  {mockData.map((ledger) => (
                    <tr key={ledger.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                      <td className="px-6 py-5 text-sm font-medium text-slate-400">{ledger.no}</td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer">{ledger.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-xs font-bold text-slate-500">{ledger.group}</td>
                      <td className="px-6 py-5 text-xs font-bold text-slate-500">{ledger.areaCity}</td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-slate-500">{ledger.mobile}</span>
                          <button className="text-emerald-500 hover:scale-110 transition-transform">
                            <MessageSquare size={14} fill="currentColor" />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-sm font-bold text-slate-400 text-right">$ {ledger.creditLimit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td className="px-6 py-5 text-sm font-black text-slate-900 dark:text-white text-right">$ {ledger.outstanding.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td className="px-6 py-5">
                        <div className="flex justify-center">
                          <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest text-center leading-tight ${
                            ledger.status === 'within-limit' 
                              ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' 
                              : 'bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400'
                          }`}>
                            {ledger.status === 'within-limit' ? 'WITHIN\nLIMIT' : 'EXCEEDED'}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-400 font-bold italic">Showing 1 to 5 of 142 ledgers</p>
              <div className="flex items-center gap-2">
                <button className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"><ChevronLeft size={16} /></button>
                <button className="w-8 h-8 bg-emerald-500 text-white rounded-lg text-xs font-black shadow-sm">1</button>
                <button className="w-8 h-8 flex items-center justify-center text-slate-600 dark:text-slate-300 rounded-lg text-xs font-bold hover:bg-slate-100 transition-all">2</button>
                <button className="w-8 h-8 flex items-center justify-center text-slate-600 dark:text-slate-300 rounded-lg text-xs font-bold hover:bg-slate-100 transition-all">3</button>
                <button className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"><ChevronRight size={16} /></button>
              </div>
            </div>
          </div>

          {/* Right Side: Sidebar Analysis */}
          <div className="space-y-6">
            
            {/* Aging Summary Card */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
                <TrendingUp className="text-emerald-500" size={20} />
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">AGING SUMMARY</h3>
              </div>
              <div className="p-6 space-y-6">
                <p className="text-[10px] text-slate-400 font-bold italic">Outstanding by age groups</p>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                      <span className="text-emerald-600">0-30 DAYS</span>
                      <span className="text-emerald-600">$45,200</span>
                    </div>
                    <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: '75%' }}
                        className="h-full bg-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                      <span className="text-blue-600">31-60 DAYS</span>
                      <span className="text-blue-600">$18,400</span>
                    </div>
                    <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: '35%' }}
                        className="h-full bg-blue-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                      <span className="text-orange-600">61-90 DAYS</span>
                      <span className="text-orange-600">$9,200</span>
                    </div>
                    <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: '20%' }}
                        className="h-full bg-orange-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                      <span className="text-rose-600">90+ DAYS</span>
                      <span className="text-rose-600">$27,550</span>
                    </div>
                    <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: '45%' }}
                        className="h-full bg-rose-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Analysis Card */}
            <div className="bg-emerald-50/30 dark:bg-emerald-900/10 rounded-3xl border border-emerald-100 dark:border-emerald-900/20 p-6 space-y-6">
              <h3 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest">QUICK ANALYSIS</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">AVG Overdue</span>
                  <span className="text-sm font-black text-slate-900 dark:text-white">42 Days</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">Risk Ratio</span>
                  <span className="text-sm font-black text-rose-600">14.2% High</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">Pending Reminders</span>
                  <span className="text-sm font-black text-slate-900 dark:text-white">12 Customers</span>
                </div>
              </div>

              <button className="w-full py-3 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20">
                Generate Statement
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Summary Bar */}
      <div className="bg-amber-400 dark:bg-amber-500 px-8 py-6 flex items-center justify-between shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
        <div className="flex items-center gap-16">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-amber-900/60 uppercase tracking-widest mb-1">TOTAL LEDGERS</span>
            <p className="text-2xl font-black text-amber-900">142</p>
          </div>
          <div className="w-px h-10 bg-amber-900/10" />
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-amber-900/60 uppercase tracking-widest mb-1">TOTAL CREDIT LIMIT</span>
            <p className="text-2xl font-black text-amber-900">$2,450,000.00</p>
          </div>
        </div>

        <div className="flex items-center gap-16">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black text-amber-900/60 uppercase tracking-widest mb-1">OVERALL AVG COLLECTION</span>
            <p className="text-2xl font-black text-amber-900">38.5%</p>
          </div>
          <div className="w-px h-10 bg-amber-900/10" />
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black text-amber-900/60 uppercase tracking-widest mb-1 text-right">TOTAL OUTSTANDING AMOUNT</span>
            <p className="text-4xl font-black text-slate-900">$100,350.00</p>
          </div>
        </div>
      </div>
    </div>
  );
};
