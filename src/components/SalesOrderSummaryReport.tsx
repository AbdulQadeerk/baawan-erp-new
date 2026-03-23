import React from 'react';
import { 
  Search, 
  Calendar, 
  ChevronDown, 
  FileSpreadsheet, 
  FileDown, 
  ChevronRight, 
  User, 
  Box, 
  Eraser, 
  ChevronLeft, 
  ChevronsLeft, 
  ChevronsRight 
} from 'lucide-react';
import { motion } from 'motion/react';

interface SORow {
  srNo: string;
  soDate: string;
  soNo: string;
  partyName: string;
  itemName: string;
  brand: string;
  unit: string;
  qty: number;
  rate: number;
  discPercent: number;
  discAmt: number;
  taxable: number;
}

const soData: SORow[] = [
  { srNo: '01', soDate: '12 Oct 2023', soNo: 'SO-2023-001', partyName: 'Global Tech Solutions Inc.', itemName: 'Ultra-High Fiber Optic Cable 100m', brand: 'NexLink', unit: 'Roll', qty: 50, rate: 1200.00, discPercent: 5.0, discAmt: 3000.00, taxable: 57000.00 },
  { srNo: '02', soDate: '14 Oct 2023', soNo: 'SO-2023-002', partyName: 'Modern Retailers Pvt Ltd', itemName: 'Wireless Router Pro v2', brand: 'CyberHub', unit: 'Pcs', qty: 200, rate: 850.00, discPercent: 10.0, discAmt: 17000.00, taxable: 153000.00 },
  { srNo: '03', soDate: '15 Oct 2023', soNo: 'SO-2023-003', partyName: 'Apex Construction', itemName: 'Industrial Steel Brackets L-Size', brand: 'IronForge', unit: 'Kg', qty: 1200, rate: 45.00, discPercent: 0.0, discAmt: 0.00, taxable: 54000.00 },
  { srNo: '04', soDate: '16 Oct 2023', soNo: 'SO-2023-004', partyName: 'Delta Systems', itemName: 'Cat6 Ethernet Patch Cable 5m', brand: 'NexLink', unit: 'Pcs', qty: 500, rate: 12.50, discPercent: 2.5, discAmt: 156.25, taxable: 6093.75 },
  { srNo: '05', soDate: '18 Oct 2023', soNo: 'SO-2023-005', partyName: 'Innova Labs', itemName: 'Server Rack 42U Heavy Duty', brand: 'TechRack', unit: 'Unit', qty: 2, rate: 45000.00, discPercent: 0.0, discAmt: 0.00, taxable: 90000.00 },
];

export const SalesOrderSummaryReport: React.FC = () => {
  return (
    <div className="flex flex-col h-[calc(100vh-112px)] bg-slate-50 dark:bg-slate-950 overflow-hidden">
      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="p-8 max-w-[1600px] mx-auto space-y-6">
          {/* Breadcrumbs & Header */}
          <div className="flex items-center justify-between">
            <div className="space-y-4">
              <nav className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                <span>Home</span>
                <ChevronRight size={12} />
                <span>Reports</span>
                <ChevronRight size={12} />
                <span className="text-slate-900 dark:text-white">Sales Order Summary</span>
              </nav>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Sales Order (SO) Summary Report</h1>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-bold shadow-sm hover:bg-emerald-700 transition-all">
                <FileSpreadsheet size={18} />
                Excel
              </button>
              <button className="flex items-center gap-2 px-6 py-2.5 bg-rose-600 text-white rounded-lg text-sm font-bold shadow-sm hover:bg-rose-700 transition-all">
                <FileDown size={18} />
                PDF
              </button>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">PARTY NAME</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text" 
                  placeholder="Search customer..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">ITEM NAME</label>
              <div className="relative">
                <Box className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text" 
                  placeholder="Search product..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">BRANCH</label>
              <div className="relative group">
                <select className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none">
                  <option>All Branches</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-slate-600" size={16} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">DATE RANGE</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text" 
                  defaultValue="01/10/2023 - 31/10/2023"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button className="flex-1 py-2.5 bg-amber-400 text-amber-950 rounded-xl text-sm font-black uppercase tracking-widest hover:bg-amber-500 transition-all flex items-center justify-center gap-2">
                <Search size={18} />
                Apply
              </button>
              <button className="w-12 h-12 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-xl flex items-center justify-center hover:bg-slate-200 transition-all">
                <Eraser size={20} />
              </button>
            </div>
          </div>

          {/* Table Section */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
                  <th className="px-4 py-5">SR NO.</th>
                  <th className="px-4 py-5">SO DATE</th>
                  <th className="px-4 py-5">SO NO.</th>
                  <th className="px-4 py-5">PARTY NAME</th>
                  <th className="px-4 py-5">ITEM NAME</th>
                  <th className="px-4 py-5">BRAND</th>
                  <th className="px-4 py-5">UNIT</th>
                  <th className="px-4 py-5 text-right">QTY</th>
                  <th className="px-4 py-5 text-right">RATE</th>
                  <th className="px-4 py-5 text-right">DISC %</th>
                  <th className="px-4 py-5 text-right">DISC AMT</th>
                  <th className="px-4 py-5 text-right">TAXABLE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {soData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                    <td className="px-4 py-5 text-sm font-medium text-slate-500">{row.srNo}</td>
                    <td className="px-4 py-5 text-sm font-medium text-slate-500">{row.soDate}</td>
                    <td className="px-4 py-5">
                      <span className="text-sm font-bold text-amber-600 hover:underline cursor-pointer">{row.soNo}</span>
                    </td>
                    <td className="px-4 py-5 text-sm font-bold text-slate-900 dark:text-white">{row.partyName}</td>
                    <td className="px-4 py-5 text-sm font-medium text-slate-600 dark:text-slate-400">{row.itemName}</td>
                    <td className="px-4 py-5 text-sm font-medium text-slate-500">{row.brand}</td>
                    <td className="px-4 py-5 text-sm font-medium text-slate-500">{row.unit}</td>
                    <td className="px-4 py-5 text-sm font-black text-slate-900 dark:text-white text-right">{row.qty.toLocaleString()}</td>
                    <td className="px-4 py-5 text-sm font-bold text-slate-500 text-right">{row.rate.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td className="px-4 py-5 text-sm font-bold text-slate-500 text-right">{row.discPercent.toFixed(1)}%</td>
                    <td className="px-4 py-5 text-sm font-bold text-slate-500 text-right">{row.discAmt.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td className="px-4 py-5 text-sm font-black text-slate-900 dark:text-white text-right">{row.taxable.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary Bar */}
          <div className="bg-amber-400 dark:bg-amber-500 p-6 rounded-2xl flex items-center justify-end gap-16">
            <div className="flex flex-col items-end">
              <p className="text-[10px] font-black text-amber-900/60 uppercase tracking-widest mb-1">TOTAL QUANTITY</p>
              <p className="text-2xl font-black text-amber-900">1,952.00</p>
            </div>
            <div className="w-px h-10 bg-amber-900/10" />
            <div className="flex flex-col items-end">
              <p className="text-[10px] font-black text-amber-900/60 uppercase tracking-widest mb-1">TOTAL TAXABLE VALUE</p>
              <p className="text-2xl font-black text-amber-900">₹ 360,093.75</p>
            </div>
            <div className="w-px h-10 bg-amber-900/10" />
            <div className="flex flex-col items-end">
              <p className="text-[10px] font-black text-amber-900/60 uppercase tracking-widest mb-1">OVERALL GRAND TOTAL</p>
              <p className="text-2xl font-black text-amber-900">₹ 415,365.00</p>
            </div>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400 font-medium italic">Showing <span className="font-bold text-slate-600 dark:text-slate-300">1 - 5</span> of <span className="font-bold text-slate-600 dark:text-slate-300">124</span> results</p>
            <div className="flex items-center gap-2">
              <button className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"><ChevronsLeft size={20} /></button>
              <button className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"><ChevronLeft size={20} /></button>
              <button className="w-10 h-10 bg-amber-400 text-amber-950 rounded-lg text-sm font-bold shadow-sm">1</button>
              <button className="w-10 h-10 flex items-center justify-center text-slate-600 dark:text-slate-300 rounded-lg text-sm font-bold hover:bg-slate-100 transition-all">2</button>
              <button className="w-10 h-10 flex items-center justify-center text-slate-600 dark:text-slate-300 rounded-lg text-sm font-bold hover:bg-slate-100 transition-all">3</button>
              <button className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"><ChevronRight size={20} /></button>
              <button className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"><ChevronsRight size={20} /></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
