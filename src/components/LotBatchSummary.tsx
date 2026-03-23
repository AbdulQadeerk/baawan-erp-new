import React from 'react';
import { 
  Search, 
  RefreshCw, 
  Download, 
  FileText, 
  Package, 
  MapPin, 
  QrCode, 
  AlertTriangle, 
  XCircle,
  ChevronLeft,
  ChevronRight,
  Printer,
  Table
} from 'lucide-react';
import { motion } from 'motion/react';
import { BatchSummary } from '../types';

const mockData: BatchSummary[] = [
  { id: '1', itemCode: 'ITM-4029', itemName: 'Premium Cotton Spindle', brand: 'Tex-World', batchNo: 'BTCH-2201-A', mfgDate: '12-Jan-2023', expDate: '12-Jan-2025', openingQty: 1200, inwardQty: 450, outwardQty: 200, closingQty: 1450 },
  { id: '2', itemCode: 'ITM-9912', itemName: 'Industrial Grade Glue', brand: 'Fix-All', batchNo: 'BTCH-5512-B', mfgDate: '01-Aug-2023', expDate: '15-May-2024', openingQty: 500, inwardQty: 0, outwardQty: 50, closingQty: 450, status: 'expiring-soon' },
  { id: '3', itemCode: 'ITM-1003', itemName: 'Synthetic Polyester Webbing', brand: 'DuraStraps', batchNo: 'BTCH-8821-X', mfgDate: '10-Mar-2024', expDate: '10-Mar-2026', openingQty: 0, inwardQty: 2500, outwardQty: 1200, closingQty: 1300 },
  { id: '4', itemCode: 'ITM-2250', itemName: 'Organic Solvent 500ml', brand: 'BioChem', batchNo: 'BTCH-1009-Z', mfgDate: '15-Jan-2022', expDate: '01-Jan-2024', openingQty: 120, inwardQty: 0, outwardQty: 0, closingQty: 120, status: 'expired' },
  { id: '5', itemCode: 'ITM-7704', itemName: 'Steel Fastener M8', brand: 'IronGrip', batchNo: 'BTCH-4456-M', mfgDate: '05-May-2023', expDate: '05-May-2028', openingQty: 5000, inwardQty: 1500, outwardQty: 3000, closingQty: 3500 },
  { id: '6', itemCode: 'ITM-3341', itemName: 'Nylon Thread Black (1000m)', brand: 'SmoothSew', batchNo: 'BTCH-2290-K', mfgDate: '18-Sep-2023', expDate: '18-Sep-2026', openingQty: 800, inwardQty: 200, outwardQty: 150, closingQty: 850 },
];

export const LotBatchSummary: React.FC = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 space-y-6 max-w-[1600px] mx-auto"
    >
      {/* Page Header & Filter Section */}
      <section className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Lot / Batch Summary Report</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-bold uppercase tracking-wider opacity-60">Detailed inventory monitoring by batch and stock location.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95">
              <Search size={18} />
              Search
            </button>
            <button className="flex items-center gap-2 px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-black text-xs uppercase tracking-widest rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95">
              <RefreshCw size={18} />
              Clear
            </button>
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-2"></div>
            <button className="p-3 bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-xl hover:bg-emerald-100 transition-all border border-emerald-100 dark:border-emerald-900/50 active:scale-90" title="Export to Excel">
              <Table size={20} />
            </button>
            <button className="p-3 bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400 rounded-xl hover:bg-rose-100 transition-all border border-rose-100 dark:border-rose-900/50 active:scale-90" title="Export to PDF">
              <FileText size={20} />
            </button>
          </div>
        </div>
        
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50/50 dark:bg-slate-800/30">
          <FilterInput label="Item Name / Item Code" icon={<Package size={18} />} placeholder="Search item code or name..." />
          <FilterInput label="Batch / Lot No." icon={<QrCode size={18} />} placeholder="Enter batch number..." />
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Stock Place</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <MapPin size={18} />
              </span>
              <select className="w-full pl-12 pr-10 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all appearance-none cursor-pointer text-sm font-bold outline-none">
                <option>All Warehouses</option>
                <option>Main Warehouse - Zone A</option>
                <option>Retail Store - Mumbai</option>
                <option>Distribution Center - Pune</option>
                <option>Cold Storage Unit 2</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Data Table Container */}
      <section className="flex-1 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
        <div className="overflow-x-auto custom-scrollbar flex-1">
          <table className="w-full text-sm border-collapse min-w-[1200px]">
            <thead className="sticky top-0 z-20">
              <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 border-b border-slate-200 dark:border-slate-800">
                <th className="px-6 py-5 text-left font-black uppercase tracking-[0.2em] text-[10px] w-20">Sr No.</th>
                <th className="px-6 py-5 text-left font-black uppercase tracking-[0.2em] text-[10px]">Item Code</th>
                <th className="px-6 py-5 text-left font-black uppercase tracking-[0.2em] text-[10px]">Item Name</th>
                <th className="px-6 py-5 text-left font-black uppercase tracking-[0.2em] text-[10px]">Brand</th>
                <th className="px-6 py-5 text-left font-black uppercase tracking-[0.2em] text-[10px]">Batch / Lot No.</th>
                <th className="px-6 py-5 text-left font-black uppercase tracking-[0.2em] text-[10px]">Mfg. Date</th>
                <th className="px-6 py-5 text-left font-black uppercase tracking-[0.2em] text-[10px]">Exp. Date</th>
                <th className="px-6 py-5 text-right font-black uppercase tracking-[0.2em] text-[10px]">Opening Qty</th>
                <th className="px-6 py-5 text-right font-black uppercase tracking-[0.2em] text-[10px]">Inward Qty</th>
                <th className="px-6 py-5 text-right font-black uppercase tracking-[0.2em] text-[10px]">Outward Qty</th>
                <th className="px-6 py-5 text-right font-black uppercase tracking-[0.2em] text-[10px]">Closing Qty</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {mockData.map((row, index) => (
                <tr key={row.id} className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group ${
                  row.status === 'expired' ? 'bg-rose-50/30 dark:bg-rose-900/10' : 
                  row.status === 'expiring-soon' ? 'bg-amber-50/30 dark:bg-amber-900/10' : ''
                }`}>
                  <td className="px-6 py-4 text-slate-400 font-bold">{index + 1}</td>
                  <td className="px-6 py-4 font-black uppercase tracking-tight text-slate-900 dark:text-white">{row.itemCode}</td>
                  <td className="px-6 py-4 text-slate-900 dark:text-slate-100 font-bold">{row.itemName}</td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400 font-medium">{row.brand}</td>
                  <td className="px-6 py-4">
                    <span className="bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 font-mono text-[11px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest">
                      {row.batchNo}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400 font-medium">{row.mfgDate}</td>
                  <td className="px-6 py-4">
                    <div className={`flex items-center gap-2 font-black ${
                      row.status === 'expired' ? 'text-rose-600' : 
                      row.status === 'expiring-soon' ? 'text-amber-600' : 'text-slate-600 dark:text-slate-400'
                    }`}>
                      {row.status === 'expired' && <XCircle size={16} />}
                      {row.status === 'expiring-soon' && <AlertTriangle size={16} />}
                      {row.expDate}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right font-black text-slate-900 dark:text-white">{row.openingQty.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right font-black text-emerald-600">{row.inwardQty.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right font-black text-rose-600">{row.outwardQty.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right font-black text-blue-600 text-lg underline decoration-2 underline-offset-4">{row.closingQty.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Grand Totals Footer */}
        <div className="bg-amber-50 dark:bg-slate-800/80 border-t border-amber-100 dark:border-slate-700 px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <span className="bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-[0.2em]">Grand Totals</span>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Showing 6 batches from All Stock Places</p>
            </div>
            <div className="flex flex-wrap gap-8 md:gap-12 justify-end">
              <TotalStat label="Total Opening" value="7,620.00" color="text-slate-600 dark:text-slate-300" />
              <TotalStat label="Total Inward" value="4,650.00" color="text-emerald-600" />
              <TotalStat label="Total Outward" value="4,600.00" color="text-rose-600" />
              <div className="flex flex-col items-end bg-white dark:bg-slate-900 px-6 py-3 rounded-2xl border border-amber-200 dark:border-slate-700 shadow-sm">
                <span className="text-[9px] uppercase font-black text-blue-600 tracking-[0.2em] mb-1">Total Closing</span>
                <span className="text-2xl font-black text-blue-600">7,670.00</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pagination / Status Legend */}
      <section className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-10">
        <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest">
          <div className="flex items-center gap-2.5">
            <span className="w-4 h-4 rounded-md bg-rose-100 border border-rose-200 dark:bg-rose-900/30 dark:border-rose-800"></span>
            <span className="text-slate-500">Expired Stock</span>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="w-4 h-4 rounded-md bg-amber-100 border border-amber-200 dark:bg-amber-900/30 dark:border-amber-800"></span>
            <span className="text-slate-500">Expiring in 30 Days</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <PaginationButton icon={<ChevronLeft size={20} />} disabled />
          <div className="flex items-center gap-2">
            <button className="w-10 h-10 bg-blue-600 text-white text-xs font-black rounded-xl shadow-lg shadow-blue-600/20">1</button>
            <button className="w-10 h-10 text-slate-600 dark:text-slate-400 hover:text-blue-600 text-xs font-black transition-all">2</button>
            <button className="w-10 h-10 text-slate-600 dark:text-slate-400 hover:text-blue-600 text-xs font-black transition-all">3</button>
          </div>
          <PaginationButton icon={<ChevronRight size={20} />} />
        </div>
      </section>

      {/* Footer Credit */}
      <footer className="py-6 text-center text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] opacity-40">
        © 2024 baawan.com ERP v4.2.0 • Lot/Batch Management Suite
      </footer>
    </motion.div>
  );
};

const FilterInput = ({ label, icon, placeholder }: { label: string, icon: React.ReactNode, placeholder: string }) => (
  <div className="flex flex-col gap-2">
    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">{label}</label>
    <div className="relative">
      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
        {icon}
      </span>
      <input 
        className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all text-sm font-bold outline-none placeholder:text-slate-400" 
        placeholder={placeholder} 
        type="text"
      />
    </div>
  </div>
);

const TotalStat = ({ label, value, color }: { label: string, value: string, color: string }) => (
  <div className="flex flex-col items-end min-w-max">
    <span className="text-[9px] uppercase font-black text-slate-400 tracking-[0.2em] mb-1">{label}</span>
    <span className={`text-xl font-black ${color}`}>{value}</span>
  </div>
);

const PaginationButton = ({ icon, disabled = false }: { icon: React.ReactNode, disabled?: boolean }) => (
  <button 
    disabled={disabled}
    className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-90 shadow-sm"
  >
    {icon}
  </button>
);
