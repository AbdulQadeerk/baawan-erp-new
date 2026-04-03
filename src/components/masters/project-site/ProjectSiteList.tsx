import React, { useState, useEffect, useCallback } from 'react';
import { 
  Building2, 
  Search, 
  Plus, 
  RefreshCw, 
  Settings2,
  Trash2,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { projectSiteApi, type ProjectSiteRecord, type ProjectSiteSearchPayload } from '../../../services/project-site.service';
import { toast } from '../../../lib/toast';

interface ProjectSiteListProps {
  onCreateNew?: () => void;
  onEdit?: (id: number) => void;
  pendingSave?: { record: ProjectSiteRecord; isUpdate: boolean } | null;
  onPendingSaveConsumed?: () => void;
}

const PAGE_SIZE = 50;

export const ProjectSiteList: React.FC<ProjectSiteListProps> = ({
  onCreateNew,
  onEdit,
  pendingSave,
  onPendingSaveConsumed
}) => {
  const [sites, setSites] = useState<ProjectSiteRecord[]>([]);
  const [filteredSites, setFilteredSites] = useState<ProjectSiteRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  // Searches
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Delete Modals
  const [deleteTarget, setDeleteTarget] = useState<ProjectSiteRecord | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  // Sync Saved changes
  useEffect(() => {
    if (!pendingSave) return;
    const { record, isUpdate } = pendingSave;
    if (isUpdate) {
      setSites(prev => prev.map(s => s.id === record.id ? { ...s, ...record } : s));
    } else {
      setSites(prev => [record, ...prev]);
    }
    onPendingSaveConsumed?.();
  }, [pendingSave]);

  useEffect(() => {
    let result = [...sites];
    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      result = result.filter(s => 
        (s.name && s.name.toLowerCase().includes(q)) || 
        (s.city && s.city.toLowerCase().includes(q))
      );
    }
    setFilteredSites(result);
    setCurrentPage(1);
  }, [sites, searchText]);

  const fetchData = useCallback(async (overridingText?: string | null) => {
    setIsLoading(true);
    try {
      const q = overridingText !== undefined ? overridingText : (searchText || null);
      const payload: ProjectSiteSearchPayload = {
        isSync: false,
        text: q
      };
      const data = await projectSiteApi.search(payload);
      setSites(data.list || []);
    } catch (err: any) {
      if (!err?._processedByInterceptor) {
        toast.error('Failed to load project sites.');
      }
      setSites([]);
    } finally {
      setIsLoading(false);
    }
  }, [searchText]);

  const handleSearch = () => fetchData();
  const handleClear = () => {
    setSearchText('');
    fetchData(null);
  };

  const handleDelete = async (record: ProjectSiteRecord) => {
    try {
      await projectSiteApi.delete(record.id);
      toast.success('Project Site deleted successfully.', 'Deleted');
      setSites(prev => prev.filter(s => s.id !== record.id));
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
      const payload: ProjectSiteSearchPayload = {
        isSync: false,
        text: searchText.trim() || null
      };
      const blob = await projectSiteApi.exportToExcel(payload);
      if (blob.size) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.setAttribute('download', 'ProjectSiteList.xlsx');
        a.click();
        URL.revokeObjectURL(url);
      } else {
        toast.info('No data available to export.');
      }
    } catch (err: any) {
      if (!err?._processedByInterceptor) {
        toast.info('Export failed.');
      }
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = async () => {
    setIsPrinting(true);
    try {
      const payload: ProjectSiteSearchPayload = {
        isSync: false,
        text: searchText.trim() || null
      };
      const data = await projectSiteApi.print(payload);
      const listData = data?.list || [];
      if (listData.length > 0) {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(`
            <html><head><title>Project Sites Records</title>
            <style>body{font-family:sans-serif;padding:20px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:8px}th{background:#f5f5f5}</style>
            </head><body>
            <h2>Project Sites Records</h2>
            <table>
            <thead><tr><th>Name</th><th>City</th><th>State</th><th>Area</th><th>Mobile</th></tr></thead>
            <tbody>
            ${listData.map((r: any) => `<tr><td>${r.name || ''}</td><td>${r.city || ''}</td><td>${r.state || ''}</td><td>${r.area || ''}</td><td>${r.mobile || ''}</td></tr>`).join('')}
            </tbody></table></body></html>
          `);
          printWindow.document.close();
          printWindow.print();
        }
      } else {
        toast.info('No data find for printing.');
      }
    } catch (err: any) {
      if (!err?._processedByInterceptor) {
        toast.info('Print extraction failed.');
      }
    } finally {
      setIsPrinting(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(filteredSites.length / PAGE_SIZE));
  const paginatedSites = filteredSites.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6 flex flex-col gap-6">
      
      {/* Header & Tool Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white dark:bg-slate-900 p-4 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-4">
          <div className="bg-amber-500 p-2.5 rounded-2xl shadow-lg shadow-amber-500/20">
            <Building2 size={22} className="text-white" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
                Project Sites List
              </h1>
              <span className="px-2.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-md">
                Management
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 lg:gap-3">
          
          <div className="relative w-full sm:w-64 group">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-600 transition-colors">
              <Search size={16} />
            </span>
            <input
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold focus:ring-2 focus:ring-amber-600/20 focus:border-amber-600 outline-none transition-all shadow-sm"
              placeholder="Search by Name or City..."
              type="text"
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
            />
          </div>

          <button onClick={handleSearch} disabled={isLoading} className="p-2.5 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition shadow-sm active:scale-95 disabled:opacity-50">
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
          </button>

          <button onClick={handleClear} className="p-2.5 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-300 dark:hover:bg-slate-600 transition shadow-sm active:scale-95" title="Clear">
            <RefreshCw size={18} />
          </button>

          {onCreateNew && (
            <button onClick={onCreateNew} className="p-2.5 bg-amber-600 text-white rounded-xl hover:bg-amber-700 shadow-sm active:scale-95 shadow-amber-600/20" title="Create Project Site">
              <Plus size={18} strokeWidth={3} />
            </button>
          )}

          <button onClick={handleExport} disabled={isExporting} className="p-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 shadow-sm active:scale-95 disabled:opacity-50 shadow-emerald-600/20" title="Export Excel">
            {isExporting ? <Loader2 size={18} className="animate-spin" /> : <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="3" x2="21" y1="9" y2="9"/><line x1="3" x2="21" y1="15" y2="15"/><line x1="9" x2="9" y1="9" y2="21"/><line x1="15" x2="15" y1="9" y2="21"/></svg>}
          </button>
        </div>
      </div>

      {/* Main Grid table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-auto custom-scrollbar" style={{ maxHeight: '60vh' }}>
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="sticky top-0 z-10">
              <tr className="bg-slate-50 dark:bg-slate-800/90 border-b border-slate-200 dark:border-slate-800">
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 w-36 text-center">Actions</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Site Name</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Location Profile</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Contact / GST</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {isLoading && (
                <tr>
                  <td colSpan={4} className="text-center py-16">
                    <div className="flex items-center justify-center gap-3 text-slate-400">
                      <Loader2 className="animate-spin" size={24} />
                      <span className="text-sm font-bold uppercase tracking-widest">Loading...</span>
                    </div>
                  </td>
                </tr>
              )}
              
              {!isLoading && paginatedSites.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-16 text-slate-400">
                    <Building2 size={40} className="mx-auto opacity-30 mb-2" />
                    <span className="text-sm font-bold uppercase tracking-widest">No project sites found.</span>
                  </td>
                </tr>
              )}

              {!isLoading && paginatedSites.map(site => (
                <tr key={site.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                  <td className="px-6 py-4 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-3 opacity-60 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => onEdit?.(site.id)} className="text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 p-2 rounded-xl transition" title="Edit Site"><Settings2 size={18} /></button>
                      <button onClick={() => setDeleteTarget(site)} className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 p-2 rounded-xl transition" title="Delete Site"><Trash2 size={18} /></button>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-black text-slate-800 dark:text-slate-200 text-sm whitespace-nowrap">{site.name}</div>
                    <div className="text-[10px] font-bold text-slate-400 mt-0.5">{site.area || '-'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin size={14} className="text-amber-500 shrink-0" />
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {site.city}{site.city && site.state ? ', ' : ''}{site.state}
                      </span>
                    </div>
                    {site.pinCode && <span className="text-[10px] font-black bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500">PIN: {site.pinCode}</span>}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs font-black text-slate-700 dark:text-slate-300">{site.contact_Person || 'N/A'}</div>
                    <div className="text-[10px] font-bold text-slate-500 mt-1">{site.mobile ? `+${site.mobile}` : 'No phone'}</div>
                    {site.gstNo && (
                      <div className="text-[10px] uppercase font-black tracking-wider text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-md inline-block mt-1">
                        {site.gstNo}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Area */}
        <div className="px-8 py-5 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-10">
            <SummaryStat label="Total Records" value={String(sites.length)} />
            <SummaryStat label="Filtered" value={String(filteredSites.length)} color="text-amber-600" />
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

      <AnimatePresence>
        {deleteTarget && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteTarget(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/50 dark:border-slate-700/50 w-full max-w-md mx-4 p-8">
              <div className="flex flex-col items-center text-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center"><AlertTriangle className="text-rose-600" size={28} /></div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-wider">Confirm Delete</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Are you sure you want to completely remove <strong>{deleteTarget.name}</strong>?</p>
                <div className="flex items-center gap-4 mt-4 w-full">
                  <button onClick={() => setDeleteTarget(null)} className="flex-1 px-6 py-3 bg-slate-100 dark:bg-slate-800 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition">Cancel</button>
                  <button onClick={() => handleDelete(deleteTarget)} className="flex-1 px-6 py-3 bg-rose-600 rounded-2xl text-xs font-black uppercase tracking-widest text-white hover:bg-rose-700 transition shadow-lg shadow-rose-600/20">Delete</button>
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
