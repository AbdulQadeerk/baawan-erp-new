import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, 
  Plus, 
  RefreshCw, 
  FileText, 
  Edit3, 
  Trash2, 
  Eye, 
  ChevronLeft, 
  ChevronRight, 
  Loader2, 
  AlertTriangle,
  UserCircle2,
  Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  salesPersonApi, 
  type SalesPersonRecord, 
  type SalesPersonSearchPayload 
} from '../../../services/sales-person.service';
import { SalesPersonDetailsModal } from './SalesPersonDetailsModal';
import { toast } from '../../../lib/toast';

interface SalesPersonListProps {
  onCreateNew?: () => void;
  onEdit?: (id: number) => void;
  pendingSave?: { record: SalesPersonRecord; isUpdate: boolean } | null;
  onPendingSaveConsumed?: () => void;
}

const PAGE_SIZE = 50;

export const SalesPersonList: React.FC<SalesPersonListProps> = ({ 
  onCreateNew, 
  onEdit, 
  pendingSave, 
  onPendingSaveConsumed 
}) => {
  const [salesPersons, setSalesPersons] = useState<SalesPersonRecord[]>([]);
  const [filteredSalesPersons, setFilteredSalesPersons] = useState<SalesPersonRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  // Search Context
  const [searchText, setSearchText] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Modals
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailRecordId, setDetailRecordId] = useState<number | null>(null);

  // Delete
  const [deleteTarget, setDeleteTarget] = useState<SalesPersonRecord | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  // Sync saved changes
  useEffect(() => {
    if (!pendingSave) return;
    const { record, isUpdate } = pendingSave;
    if (isUpdate) {
      setSalesPersons(prev => prev.map(s => s.user_ID === record.user_ID ? { ...s, ...record } : s));
    } else {
      setSalesPersons(prev => [record, ...prev]);
    }
    onPendingSaveConsumed?.();
  }, [pendingSave]);

  // Client-side filtering logic
  useEffect(() => {
    let result = [...salesPersons];
    if (searchText.trim()) {
      const term = searchText.trim().toLowerCase();
      result = result.filter(s => 
        s.first_Name?.toLowerCase().includes(term) || 
        s.lastname?.toLowerCase().includes(term) ||
        s.email_ID?.toLowerCase().includes(term) ||
        s.mobileNo?.toLowerCase().includes(term)
      );
    }
    setFilteredSalesPersons(result);
    setCurrentPage(1);
  }, [salesPersons, searchText]);

  const fetchData = useCallback(async (textOverride?: string | null) => {
    setIsLoading(true);
    try {
      // Basic search maps simply to firstName for API payload simplicity based on legacy
      const searchVal = textOverride !== undefined ? textOverride : (searchText.trim() || null);
      const payload: SalesPersonSearchPayload = {
        isSync: false,
        firstName: searchVal
      };
      
      const data = await salesPersonApi.search(payload);
      setSalesPersons(data.list || []);
    } catch (err: any) {
      if (!err?._processedByInterceptor) {
        toast.error('Failed to load records.');
      }
      setSalesPersons([]);
    } finally {
      setIsLoading(false);
    }
  }, [searchText]);

  const handleSearch = () => fetchData();

  const handleClear = () => {
    setSearchText('');
    fetchData(null);
  };

  const handleDelete = async (person: SalesPersonRecord) => {
    try {
      await salesPersonApi.delete(person.user_ID);
      toast.success('Record deleted successfully.', 'Success');
      setSalesPersons(prev => prev.filter(s => s.user_ID !== person.user_ID));
      setDeleteTarget(null);
    } catch (err: any) {
      if (!err?._processedByInterceptor) {
        toast.info(err?.message || 'Delete failed.', 'Info');
      }
      setDeleteTarget(null);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const payload: SalesPersonSearchPayload = {
        isSync: false,
        firstName: searchText.trim() || null
      };
      const blob = await salesPersonApi.exportToExcel(payload);
      if (blob.size) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.setAttribute('download', 'SalesPersonExport.xlsx');
        a.click();
        URL.revokeObjectURL(url);
      } else {
        toast.info('No data found to export.', 'Info');
      }
    } catch (err: any) {
      if (!err?._processedByInterceptor) {
        toast.info('Export failed.', 'Info');
      }
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = async () => {
    setIsPrinting(true);
    try {
      const payload: SalesPersonSearchPayload = {
        isSync: false,
        firstName: searchText.trim() || null
      };
      const data = await salesPersonApi.print(payload);
      if (data?.list?.length) {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(`
            <html><head><title>Sales Person Listings</title>
            <style>body{font-family:sans-serif;padding:20px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f5f5f5}</style>
            </head><body>
            <h2>Sales Person Listings</h2>
            <table><thead><tr><th>First Name</th><th>Last Name</th><th>Email</th><th>Mobile No</th></tr></thead><tbody>
            ${data.list.map((r: any) => `<tr><td>${r.first_Name || ''}</td><td>${r.lastname || ''}</td><td>${r.email_ID || ''}</td><td>${r.mobileNo || ''}</td></tr>`).join('')}
            </tbody></table></body></html>
          `);
          printWindow.document.close();
          printWindow.print();
        }
      } else {
        toast.info('No data found to print.', 'Info');
      }
    } catch (err: any) {
      if (!err?._processedByInterceptor) {
        toast.info('Print failed.', 'Info');
      }
    } finally {
      setIsPrinting(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(filteredSalesPersons.length / PAGE_SIZE));
  const paginatedPersons = filteredSalesPersons.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6 flex flex-col gap-6">
      
      {/* Header & Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white dark:bg-slate-900 p-4 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-4">
          <div className="bg-violet-500 p-2.5 rounded-2xl shadow-lg shadow-violet-500/20">
            <UserCircle2 size={22} className="text-white" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
                Sales Person Listings
              </h1>
              <span className="px-2.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-md">
                Management
              </span>
            </div>
          </div>
        </div>

        {/* Toolbar aligned to right */}
        <div className="flex flex-wrap items-center gap-2 lg:gap-3">
          
          {/* Search Input */}
          <div className="relative w-full sm:w-64 group">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-violet-600 transition-colors">
              <Search size={16} />
            </span>
            <input
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold focus:ring-2 focus:ring-violet-600/20 focus:border-violet-600 outline-none transition-all shadow-sm"
              placeholder="Search Name..."
              type="text"
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
            />
          </div>

          {/* Search Button */}
          <button
            onClick={handleSearch}
            disabled={isLoading}
            className="p-2.5 bg-violet-600 text-white rounded-xl hover:bg-violet-700 transition-all shadow-sm active:scale-95 disabled:opacity-50"
            title="Search"
          >
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
          </button>

          {/* Refresh Button */}
          <button
            onClick={handleClear}
            className="p-2.5 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-300 dark:hover:bg-slate-600 transition-all shadow-sm active:scale-95"
            title="Clear & Refresh"
          >
            <RefreshCw size={18} />
          </button>

          {/* Create Button */}
          {onCreateNew && (
            <button
              onClick={onCreateNew}
              className="p-2.5 bg-violet-600 text-white rounded-xl hover:bg-violet-700 transition-all shadow-sm active:scale-95 shadow-violet-600/20"
              title="Create New"
            >
              <Plus size={18} strokeWidth={3} />
            </button>
          )}

          {/* Export Button */}
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="p-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all shadow-sm active:scale-95 disabled:opacity-50 shadow-emerald-600/20"
            title="Export to Excel"
          >
            {isExporting ? <Loader2 size={18} className="animate-spin" /> : <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="3" x2="21" y1="9" y2="9"/><line x1="3" x2="21" y1="15" y2="15"/><line x1="9" x2="9" y1="9" y2="21"/><line x1="15" x2="15" y1="9" y2="21"/></svg>}
          </button>

          {/* Print Button */}
          <button
            onClick={handlePrint}
            disabled={isPrinting}
            className="p-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all shadow-sm active:scale-95 disabled:opacity-50 shadow-emerald-600/20"
            title="Print PDF"
          >
            {isPrinting ? <Loader2 size={18} className="animate-spin" /> : <FileText size={18} />}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-auto custom-scrollbar" style={{ maxHeight: '60vh' }}>
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="sticky top-0 z-10">
              <tr className="bg-slate-50 dark:bg-slate-800/90 border-b border-slate-200 dark:border-slate-800">
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 w-36 text-center">
                  Actions
                </th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                  First Name
                </th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                  Last Name
                </th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                  Email
                </th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                  Mobile No
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {isLoading && (
                <tr>
                  <td colSpan={5} className="text-center py-16">
                    <div className="flex items-center justify-center gap-3 text-slate-400">
                      <Loader2 className="animate-spin" size={24} />
                      <span className="text-sm font-bold uppercase tracking-widest">Loading...</span>
                    </div>
                  </td>
                </tr>
              )}

              {!isLoading && paginatedPersons.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-16">
                    <div className="flex flex-col items-center gap-3 text-slate-400">
                      <Users size={40} className="opacity-30" />
                      <span className="text-sm font-bold uppercase tracking-widest">No matching records</span>
                    </div>
                  </td>
                </tr>
              )}

              {!isLoading && paginatedPersons.map(person => (
                <tr key={person.user_ID} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                  <td className="px-6 py-4 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-3 opacity-60 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setDetailRecordId(person.user_ID); setDetailModalOpen(true); }} className="text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 p-2 rounded-xl transition-all active:scale-90" title="View Details"><Eye size={18} /></button>
                      <button onClick={() => onEdit?.(person.user_ID)} className="text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 p-2 rounded-xl transition-all active:scale-90" title="Edit"><Edit3 size={18} /></button>
                      <button onClick={() => setDeleteTarget(person)} className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 p-2 rounded-xl transition-all active:scale-90" title="Delete"><Trash2 size={18} /></button>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-black text-slate-800 dark:text-slate-200 uppercase tracking-tight text-sm">
                    {person.first_Name}
                  </td>
                  <td className="px-6 py-4 font-black text-slate-600 dark:text-slate-400 text-sm">
                    {person.lastname}
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-500 dark:text-slate-400 text-sm">
                    {person.email_ID}
                  </td>
                  <td className="px-6 py-4 font-mono font-bold text-slate-600 dark:text-slate-400 text-sm">
                    {person.mobileNo}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-10">
            <SummaryStat label="Total Rows" value={String(salesPersons.length)} />
            <SummaryStat label="Filtered" value={String(filteredSalesPersons.length)} color="text-violet-600" />
          </div>
          {totalPages > 1 && (
            <div className="flex items-center gap-4">
              <PaginationButton icon={<ChevronLeft size={20} />} disabled={currentPage <= 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))} />
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400 px-2">{currentPage} / {totalPages}</span>
              </div>
              <PaginationButton icon={<ChevronRight size={20} />} disabled={currentPage >= totalPages} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} />
            </div>
          )}
        </div>
      </div>

      <SalesPersonDetailsModal isOpen={detailModalOpen} onClose={() => setDetailModalOpen(false)} recordId={detailRecordId} />

      <AnimatePresence>
        {deleteTarget && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteTarget(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/50 dark:border-slate-700/50 w-full max-w-md mx-4 p-8">
              <div className="flex flex-col items-center text-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center"><AlertTriangle className="text-rose-600" size={28} /></div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-wider">Confirm Delete</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Are you sure you want to delete <strong className="text-slate-700 dark:text-slate-200">{deleteTarget.first_Name} {deleteTarget.lastname}</strong>? This action cannot be undone.</p>
                <div className="flex items-center gap-4 mt-4 w-full">
                  <button onClick={() => setDeleteTarget(null)} className="flex-1 px-6 py-3 bg-slate-100 dark:bg-slate-800 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95">Cancel</button>
                  <button onClick={() => handleDelete(deleteTarget)} className="flex-1 px-6 py-3 bg-rose-600 rounded-2xl text-xs font-black uppercase tracking-widest text-white hover:bg-rose-700 transition-all active:scale-95 shadow-lg shadow-rose-600/20">Delete</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const SummaryStat = ({ label, value, color = 'text-slate-800 dark:text-white' }: { label: string; value: string; color?: string }) => (
  <div className="flex items-center gap-3">
    <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">{label}:</span>
    <span className={`px-5 py-1.5 bg-white dark:bg-slate-700 rounded-xl text-xs font-black shadow-sm border border-slate-100 dark:border-slate-800 ${color}`}>{value}</span>
  </div>
);

const PaginationButton = ({ icon, disabled = false, onClick }: { icon: React.ReactNode; disabled?: boolean; onClick?: () => void }) => (
  <button disabled={disabled} onClick={onClick} className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-90 shadow-sm">{icon}</button>
);
