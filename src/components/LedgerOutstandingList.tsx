import React, { useState, useEffect } from 'react';
import { 
  Search, 
  RefreshCw, 
  Download, 
  FileText, 
  Plus, 
  Filter, 
  ChevronLeft, 
  ChevronRight,
  Printer,
  Layers,
  Banknote,
  Receipt,
  Loader2
} from 'lucide-react';
import { motion } from 'motion/react';
import { reportService } from '../services/api';

interface OutstandingItem {
  id?: string;
  docNo?: string;
  date?: string;
  partyName?: string;
  refNo?: string;
  taxableValue?: number;
  grandTotal?: number;
  status?: string;
  billNo?: string;
  invDate?: string;
  amount?: number;
  pendingAmount?: number;
  ledgerName?: string;
  poNo?: string;
}

export const LedgerOutstandingList: React.FC = () => {
  const [data, setData] = useState<OutstandingItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    fromDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    toDate: new Date().toISOString().split('T')[0],
    partyName: '',
    billNo: '',
  });

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        ledgers: "",
        detailed: true,
        ageDetailed: false,
        fromDate: filters.fromDate,
        toDate: filters.toDate,
        allPayments: true,
        allReceipts: true,
        isOverDueOnBillDate: false,
        includeChild: true,
        branchId: 0
      };
      
      const result = await reportService.getLedgerOutstanding(params) as any;
      const items = Array.isArray(result) ? result : (result.data || []);
      setData(items);
    } catch (err: any) {
      console.error('Error fetching outstanding report:', err);
      setError(err.message || 'Failed to load outstanding report.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSearch = () => {
    fetchData();
  };

  const totalTaxable = data.reduce((sum, item) => sum + (item.taxableValue || 0), 0);
  const totalGrand = data.reduce((sum, item) => sum + (item.grandTotal || item.pendingAmount || 0), 0);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 space-y-6 max-w-[1600px] mx-auto"
    >
      {/* Page Title & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <nav className="flex items-center gap-2 text-xs text-slate-500 mb-2 uppercase tracking-widest font-bold">
            <span>Reports</span>
            <ChevronRight size={14} />
            <span>Ledger</span>
            <ChevronRight size={14} />
            <span className="text-slate-900 dark:text-white font-bold">Outstanding Report</span>
          </nav>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Ledger Outstanding</h2>
          <p className="text-sm text-slate-500 font-bold uppercase tracking-wider opacity-60">Real-time outstanding balance tracking and bill management.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm active:scale-95">
            <Download size={16} className="text-emerald-600" />
            Excel
          </button>
          <button className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm active:scale-95">
            <FileText size={16} className="text-rose-600" />
            PDF
          </button>
          <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95">
            <Plus size={16} />
            New Entry
          </button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-6 items-end">
          <FilterInput 
            label="Search Bill No" 
            placeholder="e.g. INV-2023-001" 
            icon={<Search size={16} />} 
            value={filters.billNo}
            onChange={(val) => setFilters(prev => ({ ...prev, billNo: val }))}
          />
          <FilterInput 
            label="Party Name" 
            placeholder="Enter party name..." 
            value={filters.partyName}
            onChange={(val) => setFilters(prev => ({ ...prev, partyName: val }))}
          />
          <div className="flex flex-col gap-2 lg:col-span-1">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Date Range</label>
            <div className="flex items-center gap-2">
              <input 
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 outline-none transition-all" 
                type="date"
                value={filters.fromDate}
                onChange={(e) => setFilters(prev => ({ ...prev, fromDate: e.target.value }))}
              />
              <span className="text-slate-400 font-bold text-xs uppercase">to</span>
              <input 
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 outline-none transition-all" 
                type="date"
                value={filters.toDate}
                onChange={(e) => setFilters(prev => ({ ...prev, toDate: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Report Type</label>
            <select className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 outline-none appearance-none cursor-pointer transition-all">
              <option>Outstanding Only</option>
              <option>All Transactions</option>
              <option>Overdue Only</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handleSearch}
              disabled={loading}
              className="flex-1 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 active:scale-95 disabled:opacity-50"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Filter size={16} />}
              Search
            </button>
            <button 
              onClick={() => {
                setFilters({
                  fromDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
                  toDate: new Date().toISOString().split('T')[0],
                  partyName: '',
                  billNo: '',
                });
                fetchData();
              }}
              className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-xl hover:bg-slate-200 transition-all flex items-center justify-center active:scale-90"
            >
              <RefreshCw size={18} />
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-sm font-bold">
          {error}
        </div>
      )}

      {/* Table Content */}
      <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden flex flex-col min-h-[400px]">
        <div className="overflow-x-auto custom-scrollbar flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800">
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] w-16 text-center">Sr.</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] min-w-[120px]">Date</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] min-w-[150px]">Bill No.</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] min-w-[250px]">Party Name</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Ref No.</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">P.O. No.</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-right">Taxable Value</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-right">Grand Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <Loader2 size={40} className="text-blue-600 animate-spin" />
                      <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Fetching outstanding data...</p>
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-40">
                      <FileText size={48} className="text-slate-300" />
                      <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No outstanding records found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                data.map((row, index) => (
                  <tr key={row.id || index} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                    <td className="px-6 py-4 text-xs text-slate-400 text-center font-bold">{String(index + 1).padStart(2, '0')}</td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-tight">
                      {row.date || row.invDate || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-sm font-black text-blue-600 hover:underline uppercase tracking-tight">
                        {row.docNo || row.billNo || '-'}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight">
                          {row.partyName || row.ledgerName || '-'}
                        </span>
                        {row.status === 'gst-not-updated' && (
                          <span className="px-2 py-0.5 rounded-full bg-rose-100 text-[9px] font-black text-rose-700 uppercase tracking-widest border border-rose-200">GST not updated</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">{row.refNo || '-'}</td>
                    <td className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">{row.poNo || '-'}</td>
                    <td className="px-6 py-4 text-sm font-bold text-right text-slate-700 dark:text-slate-300">
                      ₹ {(row.taxableValue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-sm font-black text-right text-slate-900 dark:text-white">
                      ₹ {(row.grandTotal || row.pendingAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/30 flex items-center justify-between border-t border-slate-200 dark:border-slate-800">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Showing {data.length} entries
          </p>
          <div className="flex gap-2">
            <PaginationButton icon={<ChevronLeft size={18} />} disabled />
            <button className="w-9 h-9 flex items-center justify-center rounded-xl bg-blue-600 text-white font-black text-xs shadow-lg shadow-blue-600/20">1</button>
            <PaginationButton icon={<ChevronRight size={18} />} disabled />
          </div>
        </div>
      </div>

      {/* Summary Footer Bar */}
      <footer className="bg-yellow-50 dark:bg-slate-800/95 border border-yellow-200 dark:border-slate-700 p-6 rounded-3xl shadow-xl backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-around gap-8">
          <SummaryStat icon={<Layers className="text-yellow-600" size={20} />} label="Total Rows" value={data.length.toString()} />
          <div className="w-px h-8 bg-yellow-200 dark:bg-slate-700"></div>
          <SummaryStat icon={<Banknote className="text-emerald-600" size={20} />} label="Total Taxable Value" value={`₹ ${totalTaxable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`} />
          <div className="w-px h-8 bg-yellow-200 dark:bg-slate-700"></div>
          <SummaryStat icon={<Receipt className="text-blue-600" size={20} />} label="Overall Grand Total" value={`₹ ${totalGrand.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`} />
          <div className="flex-1 flex justify-end">
            <button className="bg-slate-900 dark:bg-blue-600 text-white dark:text-white px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:opacity-90 transition-all flex items-center gap-2 shadow-lg">
              <Printer size={18} />
              Print Summary
            </button>
          </div>
        </div>
      </footer>
    </motion.div>
  );
};

const FilterInput = ({ label, placeholder, icon, value, onChange }: { label: string, placeholder: string, icon?: React.ReactNode, value: string, onChange: (val: string) => void }) => (
  <div className="flex flex-col gap-2">
    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</label>
    <div className="relative">
      {icon && <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">{icon}</span>}
      <input 
        className={`w-full ${icon ? 'pl-12' : 'px-4'} pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 outline-none transition-all`} 
        placeholder={placeholder} 
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  </div>
);

const SummaryStat = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) => (
  <div className="flex items-center gap-4">
    <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
      {icon}
    </div>
    <div>
      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</p>
      <p className="text-xl font-black text-slate-900 dark:text-white leading-tight mt-0.5">{value}</p>
    </div>
  </div>
);

const PaginationButton = ({ icon, disabled = false }: { icon: React.ReactNode, disabled?: boolean }) => (
  <button 
    disabled={disabled}
    className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-90"
  >
    {icon}
  </button>
);
