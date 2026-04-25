import React, { useState } from 'react';
import { 
  Search, 
  RefreshCw, 
  FileSpreadsheet, 
  FileText, 
  Package, 
  MapPin, 
  QrCode, 
  AlertTriangle, 
  XCircle,
  Loader2,
  Table,
  AlertCircle
} from 'lucide-react';
import { motion } from 'motion/react';
import { reportApi } from '../services/report.service';

export const LotBatchSummary: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState({
    itemCodeOrName: '',
    batchNo: '',
  });

  const getFormattedFilters = () => {
    return {
      // For general query we'll pass whatever the user types as name for now
      name: filters.itemCodeOrName || null,
      mfgCode: filters.batchNo || null,
      // Leaving out full matrix of filters to keep UI clean, sending null for rest
      brand: null,
      category: null,
      sizes: null,
      type: null,
      itemGroup: null,
      item_CodeTxt: null,
      itemId: null,
      usedFor: null,
      spId: null,
      fromDate: null,
      toDate: null,
    };
  };

  const submitReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await reportApi.batchStockSummary(getFormattedFilters());
      setData(result || []);
      if (!result || result.length === 0) {
        setError('No data found for the selected criteria.');
      }
    } catch (err: any) {
      console.error('Error fetching report:', err);
      setData([]);
      setError(err?.message || 'Failed to load report data.');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    setExportLoading(true);
    try {
      const exportData = await reportApi.currentStockExport(getFormattedFilters()); // Note: using currentStockExport as legacy app did
      if (exportData) {
        const a = document.createElement('a');
        const objectUrl = URL.createObjectURL(exportData);
        a.href = objectUrl;
        a.setAttribute('download', 'lot-batch-summary.xlsx');
        a.click();
        URL.revokeObjectURL(objectUrl);
      }
    } catch (e) {
      console.error('Export error:', e);
    } finally {
      setExportLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      itemCodeOrName: '',
      batchNo: '',
    });
    setData([]);
    setError(null);
  };

  const formatNumber = (val: any) => {
    if (val == null || val === '') return '';
    const n = parseFloat(val);
    return isNaN(n) ? val : n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatDate = (val: string) => {
    if (!val) return '';
    const date = new Date(val);
    if (isNaN(date.getTime())) return val;
    const d = date.getDate().toString().padStart(2, '0');
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const y = date.getFullYear();
    return `${d}/${m}/${y}`;
  };

  const totalQty = data.reduce((s, i) => s + (parseFloat(i.Qty) || 0), 0);

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
            <button 
              onClick={submitReport}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95 disabled:opacity-70"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
              Search
            </button>
            <button 
              onClick={clearFilters}
              className="flex items-center gap-2 px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-black text-xs uppercase tracking-widest rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95"
            >
              <RefreshCw size={18} />
              Clear
            </button>
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-2"></div>
            <button 
              onClick={handleExport}
              disabled={exportLoading}
              className="p-3 bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-xl hover:bg-emerald-100 transition-all border border-emerald-100 dark:border-emerald-900/50 active:scale-90 disabled:opacity-70" 
              title="Export to Excel"
            >
              {exportLoading ? <Loader2 size={20} className="animate-spin" /> : <Table size={20} />}
            </button>
          </div>
        </div>
        
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-slate-50/50 dark:bg-slate-800/30">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Item Name</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <Package size={18} />
              </span>
              <input 
                className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all text-sm font-bold outline-none placeholder:text-slate-400" 
                placeholder="Search item name..." 
                value={filters.itemCodeOrName}
                onChange={(e) => setFilters({ ...filters, itemCodeOrName: e.target.value })}
                type="text"
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Batch / Lot No.</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <QrCode size={18} />
              </span>
              <input 
                className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all text-sm font-bold outline-none placeholder:text-slate-400" 
                placeholder="Enter batch number..." 
                value={filters.batchNo}
                onChange={(e) => setFilters({ ...filters, batchNo: e.target.value })}
                type="text"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Data Table Container */}
      <section className="flex-1 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
        <div className="overflow-x-auto custom-scrollbar flex-1 max-h-[calc(100vh-420px)]">
          <table className="w-full text-sm border-collapse min-w-[1600px]">
            <thead className="sticky top-0 z-20">
              <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 border-b border-slate-200 dark:border-slate-800 whitespace-nowrap">
                <th className="px-6 py-5 text-left font-black uppercase tracking-[0.2em] text-[10px] w-20">Sr No.</th>
                <th className="px-6 py-5 text-left font-black uppercase tracking-[0.2em] text-[10px]">Item Code</th>
                <th className="px-6 py-5 text-left font-black uppercase tracking-[0.2em] text-[10px]">Item Name</th>
                <th className="px-6 py-5 text-left font-black uppercase tracking-[0.2em] text-[10px]">Brand</th>
                <th className="px-6 py-5 text-left font-black uppercase tracking-[0.2em] text-[10px]">Category</th>
                <th className="px-6 py-5 text-left font-black uppercase tracking-[0.2em] text-[10px]">Batch / Lot No.</th>
                <th className="px-6 py-5 text-left font-black uppercase tracking-[0.2em] text-[10px]">Mfg. Date</th>
                <th className="px-6 py-5 text-left font-black uppercase tracking-[0.2em] text-[10px]">Exp. Date</th>
                <th className="px-6 py-5 text-right font-black uppercase tracking-[0.2em] text-[10px]">Stock (Qty)</th>
                <th className="px-6 py-5 text-right font-black uppercase tracking-[0.2em] text-[10px]">Rate</th>
                <th className="px-6 py-5 text-left font-black uppercase tracking-[0.2em] text-[10px]">Doc No.</th>
                <th className="px-6 py-5 text-left font-black uppercase tracking-[0.2em] text-[10px]">Date</th>
                <th className="px-6 py-5 text-left font-black uppercase tracking-[0.2em] text-[10px]">Party Name</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={13} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 size={24} className="animate-spin text-blue-600" />
                      <span className="text-xs text-slate-500 font-medium">Fetching summary...</span>
                    </div>
                  </td>
                </tr>
              ) : error && !data.length ? (
                <tr>
                  <td colSpan={13} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <AlertCircle size={24} className="text-rose-500" />
                      <span className="text-xs text-rose-500 font-medium">{error}</span>
                    </div>
                  </td>
                </tr>
              ) : !data.length ? (
                <tr>
                  <td colSpan={13} className="px-6 py-12 text-center text-sm text-slate-400">
                    Use the filters above to generate the report.
                  </td>
                </tr>
              ) : (
                data.map((row, index) => {
                  const isExpired = row.ExpDate && new Date(row.ExpDate) < new Date();
                  
                  return (
                    <tr key={index} className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group ${
                      isExpired ? 'bg-rose-50/30 dark:bg-rose-900/10' : ''
                    }`}>
                      <td className="px-6 py-4 text-slate-400 font-bold">{index + 1}</td>
                      <td className="px-6 py-4 font-black uppercase tracking-tight text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">{row.ItemCode}</td>
                      <td className="px-6 py-4 text-slate-900 dark:text-slate-100 font-bold">{row.ItemName}</td>
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400 font-medium">{row.ItemBrand}</td>
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400 font-medium">{row.ItemCategory}</td>
                      <td className="px-6 py-4">
                        <span className="bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 font-mono text-[11px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest">
                          {row.MfgCode || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400 font-medium">{formatDate(row.MfgDate)}</td>
                      <td className="px-6 py-4">
                        <div className={`flex items-center gap-2 font-black ${
                          isExpired ? 'text-rose-600' : 'text-slate-600 dark:text-slate-400'
                        }`}>
                          {isExpired && <XCircle size={16} />}
                          {formatDate(row.ExpDate)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right font-black text-blue-600 text-lg decoration-2">{formatNumber(row.Qty)}</td>
                      <td className="px-6 py-4 text-right font-bold text-slate-500">{formatNumber(row.Rate)}</td>
                      <td className="px-6 py-4 font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">{row.BillNo}</td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400 font-medium">{formatDate(row.InvDate)}</td>
                      <td className="px-6 py-4 text-slate-900 dark:text-slate-100 font-medium">{row.PartyName}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Grand Totals Footer */}
        <div className="bg-amber-50 dark:bg-slate-800/80 border-t border-amber-100 dark:border-slate-700 px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <span className="bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-[0.2em]">Summary</span>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Showing {data.length} records</p>
            </div>
            <div className="flex flex-wrap gap-8 md:gap-12 justify-end">
              <div className="flex flex-col items-end bg-white dark:bg-slate-900 px-6 py-3 rounded-2xl border border-amber-200 dark:border-slate-700 shadow-sm">
                <span className="text-[9px] uppercase font-black text-blue-600 tracking-[0.2em] mb-1">Total Stock (Qty)</span>
                <span className="text-2xl font-black text-blue-600">{formatNumber(totalQty)}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Credit */}
      <footer className="py-6 text-center text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] opacity-40">
        © 2024 baawan.com ERP v4.2.0 • Lot/Batch Management Suite
      </footer>
    </motion.div>
  );
};
