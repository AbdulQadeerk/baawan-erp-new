import React, { useState } from 'react';
import { 
  Calendar, 
  Warehouse, 
  Filter, 
  Download, 
  Printer, 
  FileText, 
  ChevronRight, 
  ChevronLeft,
  Plus,
  Minus,
  RotateCcw,
  LayoutGrid,
  History,
  TrendingUp,
  BarChart3,
  Search
} from 'lucide-react';
import { motion } from 'motion/react';

const ledgerData = [
  { date: '01 Oct 2023', time: '10:45 AM', type: 'OPENING BALANCE', docNo: 'N/A', particulars: 'Brought Forward from Sep', inward: 1200, outward: 0, balance: 1200, typeColor: 'bg-blue-100 text-blue-700' },
  { date: '04 Oct 2023', time: '02:30 PM', type: 'PURCHASE', docNo: 'PUR-23-4501', particulars: 'Acme Textile Mills Ltd.', inward: 300, outward: 0, balance: 1500, typeColor: 'bg-slate-100 text-slate-700' },
  { date: '08 Oct 2023', time: '11:15 AM', type: 'SALES INVOICE', docNo: 'INV-99201', particulars: 'Urban Threads Boutique', inward: 0, outward: 150, balance: 1350, typeColor: 'bg-amber-100 text-amber-700' },
  { date: '12 Oct 2023', time: '04:00 PM', type: 'INTER-WH TRANSFER', docNo: 'TRF-7712', particulars: 'To: Delhi Dist. Hub', inward: 0, outward: 100, balance: 1250, typeColor: 'bg-purple-100 text-purple-700' },
  { date: '18 Oct 2023', time: '09:30 AM', type: 'PURCHASE', docNo: 'PUR-23-4612', particulars: 'Silk & Cotton Corp', inward: 150, outward: 0, balance: 1400, typeColor: 'bg-slate-100 text-slate-700' },
  { date: '25 Oct 2023', time: '05:20 PM', type: 'ADJUSTMENT', docNo: 'ADJ-0041', particulars: 'Inventory Wastage', inward: 0, outward: 50, balance: 1350, typeColor: 'bg-rose-100 text-rose-700' },
];

export const ItemStockLedger: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Detailed Stock Ledger');

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 space-y-6 max-w-[1600px] mx-auto"
    >
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium">
        <span>Reports</span>
        <ChevronRight size={14} />
        <span>Inventory Reports</span>
        <ChevronRight size={14} />
        <span className="text-slate-900 dark:text-white font-bold">Item Stock Ledger</span>
      </nav>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white">
            <LayoutGrid size={24} />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Premium Cotton Fabric</h2>
              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest rounded-md border border-emerald-200">IN STOCK</span>
            </div>
            <div className="flex items-center gap-4 mt-1 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <span>SKU: <span className="text-slate-900 dark:text-white">BAA-COT-001</span></span>
              <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
              <span>HSN: <span className="text-slate-900 dark:text-white">5208</span></span>
              <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
              <span>Category: <span className="text-slate-900 dark:text-white">Textiles</span></span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <button className="p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border-r border-slate-200 dark:border-slate-800"><FileText size={18} className="text-slate-500" /></button>
            <button className="p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border-r border-slate-200 dark:border-slate-800"><LayoutGrid size={18} className="text-slate-500" /></button>
            <button className="p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"><Printer size={18} className="text-slate-500" /></button>
          </div>
          <button className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all">
            <Download size={18} />
            Export Full Report
          </button>
        </div>
      </div>

      {/* Filters Card */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-6 items-end">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Date Range</label>
            <div className="relative">
              <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <select className="w-full pl-12 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold focus:ring-4 focus:ring-blue-600/10 outline-none appearance-none cursor-pointer">
                <option>Oct 01, 2023 - Oct 31, 2023</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Warehouse / Stock Place</label>
            <div className="relative">
              <Warehouse size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <select className="w-full pl-12 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold focus:ring-4 focus:ring-blue-600/10 outline-none appearance-none cursor-pointer">
                <option>All Locations</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Transaction Type</label>
            <div className="relative">
              <Filter size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <select className="w-full pl-12 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold focus:ring-4 focus:ring-blue-600/10 outline-none appearance-none cursor-pointer">
                <option>All Transactions</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="flex-1 px-6 py-2.5 bg-slate-900 dark:bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:opacity-90 transition-all">
              Apply Filters
            </button>
            <button className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-xl hover:bg-slate-200 transition-all flex items-center justify-center">
              <RotateCcw size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard label="Opening Stock" value="1,200" unit="m" subtext="As of Oct 1st, 2023" icon={<History className="text-slate-400" />} />
        <SummaryCard label="Total Inward (+)" value="450" unit="m" subtext="+ 12% vs last month" icon={<Plus className="text-emerald-500" />} trend="+12%" />
        <SummaryCard label="Total Outward (-)" value="300" unit="m" subtext="↘ 5% vs last month" icon={<Minus className="text-rose-500" />} trend="-5%" />
        <SummaryCard label="Closing Stock" value="1,350" unit="m" subtext="Current Value: ₹270,000" icon={<TrendingUp className="text-blue-500" />} highlight />
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-8">
          {['Detailed Stock Ledger', 'Batch-wise Details', 'Warehouse Statistics', 'Ageing Analysis'].map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 text-sm font-bold transition-all relative ${activeTab === tab ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {tab}
              {activeTab === tab && (
                <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Date</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Voucher Type</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Document No</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Particulars</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Inward Qty</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Outward Qty</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {ledgerData.map((row, i) => (
                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">{row.date}</span>
                      <span className="text-[10px] text-slate-400 font-medium">{row.time}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest ${row.typeColor}`}>
                      {row.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-black ${row.docNo === 'N/A' ? 'text-slate-400 italic' : 'text-blue-600 hover:underline cursor-pointer'}`}>
                      {row.docNo}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs font-bold text-slate-600 dark:text-slate-400">{row.particulars}</td>
                  <td className="px-6 py-4 text-xs font-black text-right text-emerald-600">{row.inward > 0 ? `+ ${row.inward.toLocaleString()}` : '0'}</td>
                  <td className="px-6 py-4 text-xs font-black text-right text-rose-600">{row.outward > 0 ? `- ${row.outward.toLocaleString()}` : '0'}</td>
                  <td className="px-6 py-4 text-xs font-black text-right text-slate-900 dark:text-white">{row.balance.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-900 text-white">
                <td colSpan={4} className="px-6 py-4 text-xs font-black uppercase tracking-[0.2em] text-right">Period Totals:</td>
                <td className="px-6 py-4 text-xs font-black text-right text-emerald-400">+ 450</td>
                <td className="px-6 py-4 text-xs font-black text-right text-rose-400">- 300</td>
                <td className="px-6 py-4 text-xs font-black text-right bg-blue-600">1,350</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Footer / Pagination */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Showing 1 to 6 of 124 transactions</p>
        <div className="flex items-center gap-2">
          <PaginationButton icon={<ChevronLeft size={18} />} />
          <button className="w-9 h-9 bg-blue-600 text-white rounded-xl text-xs font-black">1</button>
          <button className="w-9 h-9 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all">2</button>
          <button className="w-9 h-9 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all">3</button>
          <span className="px-2 text-slate-400">...</span>
          <button className="w-9 h-9 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all">21</button>
          <PaginationButton icon={<ChevronRight size={18} />} />
        </div>
      </div>
    </motion.div>
  );
};

const SummaryCard = ({ label, value, unit, subtext, icon, trend, highlight = false }: any) => (
  <div className={`p-6 rounded-2xl border transition-all relative overflow-hidden group ${highlight ? 'bg-blue-50/50 border-blue-200 dark:bg-blue-900/10 dark:border-blue-800' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'}`}>
    <div className="flex items-start justify-between mb-4">
      <div className="space-y-1">
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</p>
        <div className="flex items-baseline gap-1">
          <h4 className="text-3xl font-black text-slate-900 dark:text-white">{value}</h4>
          <span className="text-sm font-bold text-slate-400">{unit}</span>
        </div>
      </div>
      <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl group-hover:scale-110 transition-transform">
        {icon}
      </div>
    </div>
    <div className="flex items-center gap-2">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{subtext}</p>
      {trend && (
        <span className={`text-[10px] font-black ${trend.startsWith('+') ? 'text-emerald-500' : 'text-rose-500'}`}>
          {trend}
        </span>
      )}
    </div>
    <div className="absolute right-[-10%] bottom-[-10%] opacity-[0.03] pointer-events-none">
      {icon}
    </div>
  </div>
);

const PaginationButton = ({ icon, disabled = false }: any) => (
  <button 
    disabled={disabled}
    className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-90"
  >
    {icon}
  </button>
);
