import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Plus,
  Printer,
  Download,
  Edit3,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  Filter,
  RefreshCw,
  Warehouse,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  stockPlaceApi,
  type StockPlaceRecord,
  type StockPlaceSearchPayload,
} from '../../../services/stock-place.service';
import { StockPlaceDetailsModal } from './StockPlaceDetailsModal';
import { toast } from '../../../lib/toast';

interface StockPlaceListProps {
  onCreateNew?: () => void;
  onEdit?: (id: number) => void;
  pendingSave?: { record: StockPlaceRecord; isUpdate: boolean } | null;
  onPendingSaveConsumed?: () => void;
}

const PAGE_SIZE = 50;

export const StockPlaceList: React.FC<StockPlaceListProps> = ({
  onCreateNew,
  onEdit,
  pendingSave,
  onPendingSaveConsumed,
}) => {
  // ─── State ──────────────────────────────────────────────────────────────────
  const [places, setPlaces] = useState<StockPlaceRecord[]>([]);
  const [filteredPlaces, setFilteredPlaces] = useState<StockPlaceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  // Search
  const [searchName, setSearchName] = useState('');
  const [searchArea, setSearchArea] = useState('');
  const [searchCity, setSearchCity] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Details Modal
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailRecordId, setDetailRecordId] = useState<number | null>(null);

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<StockPlaceRecord | null>(null);

  // ─── Load data on mount ─────────────────────────────────────────────────────
  useEffect(() => {
    fetchData();
  }, []);

  // ─── Consume pendingSave (auto-update after create/update) ──────────────────
  useEffect(() => {
    if (!pendingSave) return;

    const { record, isUpdate } = pendingSave;

    if (isUpdate) {
      setPlaces(prev =>
        prev.map(c =>
          c.sp_ID === record.sp_ID ? { ...c, ...record } : c
        )
      );
    } else {
      setPlaces(prev => [record, ...prev]);
    }

    onPendingSaveConsumed?.();
  }, [pendingSave]);

  // ─── Client-side filter (Optional) ──────────────────────────────────────────
  useEffect(() => {
    // We already fetch via API based on filters, so client side filtering is 
    // minimal unless the user just typed and didn't hit 'Search'. 
    // To match Angular exactly, search action triggers the network request.
    setFilteredPlaces(places);
    setCurrentPage(1);
  }, [places]);

  // ─── API Calls ──────────────────────────────────────────────────────────────
  const fetchData = useCallback(
    async (override?: { name?: string, area?: string, city?: string }) => {
      setIsLoading(true);
      try {
        const payload: StockPlaceSearchPayload = {
          isSync: false,
          name: override?.name !== undefined ? override.name : (searchName.trim() || null),
          area: override?.area !== undefined ? override.area : (searchArea.trim() || null),
          city: override?.city !== undefined ? override.city : (searchCity.trim() || null),
        };
        const data = await stockPlaceApi.search(payload);
        setPlaces(data.list ?? []);
      } catch (err: any) {
        if (!err?._processedByInterceptor) {
          toast.error('Failed to load stock places.');
        }
        setPlaces([]);
      } finally {
        setIsLoading(false);
      }
    },
    [searchName, searchArea, searchCity]
  );

  const handleSearch = () => fetchData();

  const handleClear = () => {
    setSearchName('');
    setSearchArea('');
    setSearchCity('');
    fetchData({ name: '', area: '', city: '' });
  };

  const handleDelete = async (place: StockPlaceRecord) => {
    try {
      await stockPlaceApi.delete(place.sp_ID);
      toast.success('Record deleted successfully.', 'Success');
      setPlaces(prev => prev.filter(c => c.sp_ID !== place.sp_ID));
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
      const payload: StockPlaceSearchPayload = {
        isSync: false,
        name: searchName.trim() || null,
        area: searchArea.trim() || null,
        city: searchCity.trim() || null,
      };
      const blob = await stockPlaceApi.exportToExcel(payload);
      if (blob.size) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.setAttribute('download', 'StockPlaceExport.xlsx');
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
      const payload: StockPlaceSearchPayload = {
        isSync: false,
        name: searchName.trim() || null,
        area: searchArea.trim() || null,
        city: searchCity.trim() || null,
      };
      const data = await stockPlaceApi.print(payload);
      if (data?.list?.length) {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(`
            <html><head><title>Stock Place List</title>
            <style>body{font-family:sans-serif;padding:20px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f5f5f5}</style>
            </head><body>
            <h2>Stock Place List</h2>
            <table><thead><tr>
              <th>Name</th>
              <th>Code</th>
              <th>Area</th>
              <th>City</th>
              <th>Phone</th>
            </tr></thead><tbody>
            ${data.list
              .map(
                (r: any) =>
                  `<tr>
                    <td>${r.name || ''}</td>
                    <td>${r.code || ''}</td>
                    <td>${r.area || ''}</td>
                    <td>${r.city || ''}</td>
                    <td>${r.phone || ''}</td>
                   </tr>`
              )
              .join('')}
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

  // ─── Pagination ─────────────────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(filteredPlaces.length / PAGE_SIZE));
  const paginatedPlaces = filteredPlaces.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 flex flex-col gap-6"
    >
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-600/20">
              <Warehouse size={24} className="text-white" />
            </div>
            Stock Place Listings
          </h1>
          <p className="text-sm text-slate-500 font-bold uppercase tracking-widest opacity-60 mt-1">
            Manage and track your warehouse locations globally.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          {onCreateNew && (
            <button
              onClick={onCreateNew}
              className="flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 active:scale-95 transition-all shadow-lg shadow-blue-600/20"
            >
              <Plus size={18} /> Create
            </button>
          )}
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm active:scale-95 disabled:opacity-50"
          >
            {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            Export
          </button>
          <button
            onClick={handlePrint}
            disabled={isPrinting}
            className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm active:scale-95 disabled:opacity-50"
          >
            {isPrinting ? <Loader2 size={16} className="animate-spin" /> : <Printer size={16} />}
            Print
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
            <Search size={16} />
          </span>
          <input
            className="block w-full pl-12 pr-4 py-3 border border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-800 text-xs font-bold focus:ring-4 focus:ring-rose-600/10 focus:border-rose-600 outline-none transition-all dark:text-white placeholder-slate-400"
            placeholder="Search Name..."
            type="text"
            value={searchName}
            onChange={e => setSearchName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <div className="relative">
          <input 
            className="block w-full px-5 py-3 border border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-800 text-xs font-bold focus:ring-4 focus:ring-rose-600/10 focus:border-rose-600 outline-none transition-all dark:text-white placeholder-slate-400" 
            placeholder="Area" 
            type="text"
            value={searchArea}
            onChange={e => setSearchArea(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <div className="relative">
          <input 
            className="block w-full px-5 py-3 border border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-800 text-xs font-bold focus:ring-4 focus:ring-rose-600/10 focus:border-rose-600 outline-none transition-all dark:text-white placeholder-slate-400" 
            placeholder="City" 
            type="text"
            value={searchCity}
            onChange={e => setSearchCity(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
          />
        </div>
        
        <div className="flex items-center gap-2 md:col-span-1 lg:col-span-2">
          <button
            onClick={handleSearch}
            disabled={isLoading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/20 active:scale-95 disabled:opacity-50"
          >
            {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Filter size={14} />} 
            Search
          </button>
          <button
            onClick={handleClear}
            className="p-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 rounded-2xl transition-all active:scale-95"
            title="Clear Filters"
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      {/* Table — scrollable, fixed height */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-auto custom-scrollbar" style={{ maxHeight: '60vh' }}>
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead className="sticky top-0 z-10">
              <tr className="bg-slate-50 dark:bg-slate-800/90 border-b border-slate-200 dark:border-slate-800">
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 w-36 text-center">
                  Actions
                </th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 min-w-[150px]">
                  Name
                </th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                  Code
                </th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 min-w-[200px]">
                  Address Details
                </th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                  Area
                </th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                  Location
                </th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                  Pin Code
                </th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                  Phone
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {isLoading && (
                <tr>
                  <td colSpan={8} className="text-center py-16">
                    <div className="flex items-center justify-center gap-3 text-slate-400">
                      <Loader2 className="animate-spin" size={24} />
                      <span className="text-sm font-bold uppercase tracking-widest">Loading...</span>
                    </div>
                  </td>
                </tr>
              )}

              {!isLoading && paginatedPlaces.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-16">
                    <div className="flex flex-col items-center gap-3 text-slate-400">
                      <Warehouse size={40} className="opacity-30" />
                      <span className="text-sm font-bold uppercase tracking-widest">No stock places found</span>
                      <span className="text-xs opacity-60">Try searching or click Create to add a new place.</span>
                    </div>
                  </td>
                </tr>
              )}

              {!isLoading &&
                paginatedPlaces.map(place => (
                  <tr
                    key={place.sp_ID}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group"
                  >
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-3 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            setDetailRecordId(place.sp_ID);
                            setDetailModalOpen(true);
                          }}
                          className="text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 p-2 rounded-xl transition-all active:scale-90"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => onEdit?.(place.sp_ID)}
                          className="text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 p-2 rounded-xl transition-all active:scale-90"
                          title="Edit"
                        >
                          <Edit3 size={18} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(place)}
                          disabled={place.name?.toLowerCase() === 'main' || place.sp_ID === 0} // Can't delete main/default
                          className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 p-2 rounded-xl transition-all active:scale-90 disabled:opacity-30"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-black text-slate-800 dark:text-slate-200 uppercase tracking-tight text-sm">
                      {place.name}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg text-[10px] font-black font-mono uppercase tracking-widest">
                        {place.code}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 italic max-w-xs truncate">
                      {place.address_1}
                      {place.address_2 ? `, ${place.address_2}` : ''}
                    </td>
                    <td className="px-6 py-4 text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">
                      {place.area || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-tight">
                          {place.city || '-'}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          {place.state || '-'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 font-mono">
                      {place.pin || '-'}
                    </td>
                    <td className="px-6 py-4 text-xs font-black text-slate-700 dark:text-slate-300">
                      {place.phone || '-'}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-10">
            <SummaryStat label="Total Rows" value={String(places.length)} />
            <SummaryStat label="Filtered" value={String(filteredPlaces.length)} color="text-blue-600" />
          </div>
          {totalPages > 1 && (
            <div className="flex items-center gap-4">
              <PaginationButton
                icon={<ChevronLeft size={20} />}
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              />
              <div className="flex items-center gap-2">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let page: number;
                  if (totalPages <= 5) {
                    page = i + 1;
                  } else if (currentPage <= 3) {
                    page = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    page = totalPages - 4 + i;
                  } else {
                    page = currentPage - 2 + i;
                  }
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 rounded-xl font-black text-xs transition-all ${
                        page === currentPage
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                          : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>
              <PaginationButton
                icon={<ChevronRight size={20} />}
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              />
            </div>
          )}
        </div>
      </div>

      {/* Details Modal */}
      <StockPlaceDetailsModal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        recordId={detailRecordId}
      />

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteTarget && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setDeleteTarget(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/50 dark:border-slate-700/50 w-full max-w-md mx-4 p-8"
            >
              <div className="flex flex-col items-center text-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center">
                  <AlertTriangle className="text-rose-600" size={28} />
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  Confirm Delete
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Are you sure you want to delete{' '}
                  <strong className="text-slate-700 dark:text-slate-200">{deleteTarget.name}</strong>?
                  This action cannot be undone.
                </p>
                <div className="flex items-center gap-4 mt-4 w-full">
                  <button
                    onClick={() => setDeleteTarget(null)}
                    className="flex-1 px-6 py-3 bg-slate-100 dark:bg-slate-800 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDelete(deleteTarget)}
                    className="flex-1 px-6 py-3 bg-rose-600 rounded-2xl text-xs font-black uppercase tracking-widest text-white hover:bg-rose-700 transition-all active:scale-95 shadow-lg shadow-rose-600/20"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ─── Helpers ────────────────────────────────────────────────────────────────

const SummaryStat = ({
  label,
  value,
  color = 'text-slate-800 dark:text-white',
}: {
  label: string;
  value: string;
  color?: string;
}) => (
  <div className="flex items-center gap-3">
    <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">
      {label}:
    </span>
    <span
      className={`px-5 py-1.5 bg-white dark:bg-slate-700 rounded-xl text-xs font-black shadow-sm border border-slate-100 dark:border-slate-800 ${color}`}
    >
      {value}
    </span>
  </div>
);

const PaginationButton = ({
  icon,
  disabled = false,
  onClick,
}: {
  icon: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
}) => (
  <button
    disabled={disabled}
    onClick={onClick}
    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-90 shadow-sm"
  >
    {icon}
  </button>
);
