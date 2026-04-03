import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, 
  Plus, 
  RefreshCw, 
  Edit3, 
  Loader2, 
  HandCoins,
  ChevronLeft,
  ChevronRight,
  Database
} from 'lucide-react';
import { motion } from 'motion/react';
import { 
  ledgerTargetApi, 
  type LedgerTargetAssignedItem, 
  type LedgerTargetSearchPayload 
} from '../../../services/ledger-target.service';
import { ledgerService } from '../../../services/api';
import { toast } from '../../../lib/toast';

interface LedgerTargetListProps {
  onCreateNew?: () => void;
  onEdit?: (id: number) => void;
  pendingSave?: { record: any; isUpdate: boolean } | null;
  onPendingSaveConsumed?: () => void;
}

const PAGE_SIZE = 50;

export const LedgerTargetList: React.FC<LedgerTargetListProps> = ({ 
  onCreateNew, 
  onEdit, 
  pendingSave, 
  onPendingSaveConsumed 
}) => {
  const [assignedLedgers, setAssignedLedgers] = useState<LedgerTargetAssignedItem[]>([]);
  const [filteredLedgers, setFilteredLedgers] = useState<LedgerTargetAssignedItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Combobox items mapping
  const [allLedgers, setAllLedgers] = useState<any[]>([]);

  // Search Context
  const [searchLedgerId, setSearchLedgerId] = useState<number | 0>(0);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadLedgers();
    fetchData();
  }, []);

  async function loadLedgers() {
    try {
      const data = await ledgerService.list();
      setAllLedgers(data);
    } catch {
      // fallback mock behavior
    }
  }

  // Sync saved changes
  useEffect(() => {
    if (!pendingSave) return;
    const { record, isUpdate } = pendingSave;
    
    // The create form returns an object looking exactly like an assigned item: { ledger_ID, name }
    if (!isUpdate) {
      setAssignedLedgers(prev => {
        // If it already exists, just ignore (since list just shows distinct ledgers)
        if (prev.find(s => String(s.ledger_ID) === String(record.ledger_ID))) {
          return prev;
        }
        return [record, ...prev];
      });
    }
    
    fetchData(); // Always refresh to sync
    onPendingSaveConsumed?.();
  }, [pendingSave]);

  // Client-side mapping
  useEffect(() => {
    setFilteredLedgers(assignedLedgers);
    setCurrentPage(1);
  }, [assignedLedgers]);

  const fetchData = useCallback(async (ledgerIdOverride?: number | 0) => {
    setIsLoading(true);
    try {
      const val = ledgerIdOverride !== undefined ? ledgerIdOverride : searchLedgerId;
      const payload: LedgerTargetSearchPayload = {
        isSync: true,
        pageSize: 0,
        pageNumber: 0,
        lastModifiedDate: null,
        ledgerId: val
      };
      
      const data = await ledgerTargetApi.assignedLedgerTargets(payload);
      setAssignedLedgers(data.list || []);
    } catch (err: any) {
      if (!err?._processedByInterceptor) {
        toast.error('Failed to load records.');
      }
      setAssignedLedgers([]);
    } finally {
      setIsLoading(false);
    }
  }, [searchLedgerId]);

  const handleSearch = () => fetchData();

  const handleClear = () => {
    setSearchLedgerId(0);
    fetchData(0);
  };

  const totalPages = Math.max(1, Math.ceil(filteredLedgers.length / PAGE_SIZE));
  const paginatedLedgers = filteredLedgers.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6 flex flex-col gap-6">
      
      {/* Header & Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white dark:bg-slate-900 p-4 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-4">
          <div className="bg-blue-500 p-2.5 rounded-2xl shadow-lg shadow-blue-500/20">
            <HandCoins size={22} className="text-white" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
                Ledger Targets Listings
              </h1>
              <span className="px-2.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-md">
                Management
              </span>
            </div>
          </div>
        </div>

        {/* Toolbar aligned to right */}
        <div className="flex flex-wrap items-center gap-2 lg:gap-3">
          
          {/* Search Input Filter */}
          <div className="relative w-full sm:w-64 group">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
              <Search size={16} />
            </span>
            <select
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all shadow-sm appearance-none"
              value={searchLedgerId}
              onChange={e => setSearchLedgerId(Number(e.target.value))}
            >
              <option value={0}>All Ledgers...</option>
              {allLedgers.map(l => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
          </div>

          {/* Search Button */}
          <button
            onClick={handleSearch}
            disabled={isLoading}
            className="p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-sm active:scale-95 disabled:opacity-50"
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
              className="p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-sm active:scale-95 shadow-blue-600/20"
              title="Create New"
            >
              <Plus size={18} strokeWidth={3} />
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-auto custom-scrollbar" style={{ maxHeight: '60vh' }}>
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead className="sticky top-0 z-10">
              <tr className="bg-slate-50 dark:bg-slate-800/90 border-b border-slate-200 dark:border-slate-800">
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 w-24 text-center">
                  Actions
                </th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 w-full">
                  Ledger Name
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {isLoading && (
                <tr>
                  <td colSpan={2} className="text-center py-16">
                    <div className="flex items-center justify-center gap-3 text-slate-400">
                      <Loader2 className="animate-spin" size={24} />
                      <span className="text-sm font-bold uppercase tracking-widest">Loading...</span>
                    </div>
                  </td>
                </tr>
              )}

              {!isLoading && paginatedLedgers.length === 0 && (
                <tr>
                  <td colSpan={2} className="text-center py-16">
                    <div className="flex flex-col items-center gap-3 text-slate-400">
                      <Database size={40} className="opacity-30" />
                      <span className="text-sm font-bold uppercase tracking-widest">No target records assigned</span>
                    </div>
                  </td>
                </tr>
              )}

              {!isLoading && paginatedLedgers.map(lItem => (
                <tr key={lItem.ledger_ID} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                  <td className="px-6 py-4 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-3 opacity-60 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => onEdit?.(lItem.ledger_ID)} className="flex items-center justify-center text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 p-2 rounded-xl transition-all active:scale-90" title="Edit Properties">
                        <Edit3 size={18} />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-black text-slate-800 dark:text-slate-200 text-sm">
                    {lItem.name}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-10">
            <SummaryStat label="Total Ledgers" value={String(assignedLedgers.length)} />
            <SummaryStat label="Filtered" value={String(filteredLedgers.length)} color="text-blue-600" />
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
