import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Download, 
  Edit3, 
  Trash2, 
  Eye,
  ChevronLeft,
  ChevronRight,
  Filter,
  RefreshCw,
  MapPin,
  Folder,
  Calendar,
  AlertTriangle,
  ChevronDown,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { motion } from 'motion/react';
import { Ledger } from '../../types';
import { ledgerService } from '../../services/api';

export const LedgerList: React.FC<{ onCreateNew?: () => void }> = ({ onCreateNew }) => {
  const [ledgers, setLedgers] = useState<Ledger[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchLedgers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await ledgerService.list();
      setLedgers(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Error fetching ledgers:', err);
      setError('Failed to load ledgers from the API.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLedgers();
  }, []);

  const filteredLedgers = ledgers.filter(ledger => 
    (ledger.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 space-y-6"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Ledger Listings</h1>
          <p className="text-sm text-slate-500 font-bold uppercase tracking-widest opacity-60 mt-1">Manage and monitor all your accounting ledger accounts</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchLedgers}
            className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 hover:text-blue-600 transition-all shadow-sm active:scale-95"
            title="Refresh List"
          >
            <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
          </button>
          <button className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm active:scale-95">
            <Download size={18} /> Export
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Search size={18} /></span>
          <input 
            className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold focus:ring-4 focus:ring-rose-600/10 outline-none transition-all" 
            placeholder="Search Ledger Name..." 
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <FilterInput placeholder="Filter by City" icon={<MapPin size={18} />} />
        <FilterSelect options={['All Groups', 'Sundry Creditors', 'Sundry Debtors', 'Duties & Taxes']} icon={<Folder size={18} />} />
        <FilterInput placeholder="Modified Date" icon={<Calendar size={18} />} />
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setSearchTerm('')}
            className="flex-1 bg-slate-100 dark:bg-slate-800 py-3 rounded-xl text-slate-700 dark:text-slate-300 font-black uppercase tracking-widest text-[10px] hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95"
          >
            Clear Filters
          </button>
          <button className="p-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl hover:opacity-90 transition-all active:scale-95">
            <Filter size={18} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Ledger Name</th>
                <th className="px-4 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Group</th>
                <th className="px-4 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">State</th>
                <th className="px-4 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Contact Info</th>
                <th className="px-4 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">GST No. / PAN</th>
                <th className="px-4 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Last Modified</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-8 py-12 text-center">
                    <Loader2 size={40} className="animate-spin mx-auto text-slate-300 mb-4" />
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Loading real-time ledger data...</p>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={7} className="px-8 py-12 text-center">
                    <AlertCircle size={40} className="mx-auto text-rose-500 mb-4" />
                    <p className="text-rose-600 font-bold uppercase tracking-widest text-xs">{error}</p>
                    <button onClick={fetchLedgers} className="mt-4 text-blue-600 font-bold text-xs uppercase tracking-widest hover:underline">Try Again</button>
                  </td>
                </tr>
              ) : filteredLedgers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-8 py-12 text-center">
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No ledgers found matching your search.</p>
                  </td>
                </tr>
              ) : (
                filteredLedgers.map((ledger) => (
                  <tr key={ledger.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                    <td className="px-8 py-4 font-bold text-sm text-slate-900 dark:text-white">
                      {ledger.name}
                    </td>
                    <td className="px-4 py-4">
                      <span className="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-slate-100 dark:bg-slate-800 text-slate-600">
                        {ledger.parentCompany || 'General'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{ledger.state || '—'}</td>
                    <td className="px-4 py-4">
                      {ledger.mobile ? (
                        <div className="flex flex-col">
                          <span className="text-slate-700 dark:text-slate-300 font-black text-xs">{ledger.mobile}</span>
                          <span className="text-[10px] font-bold text-slate-400 lowercase">{ledger.email}</span>
                        </div>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-4">
                      {ledger.gstin ? (
                        <div className="text-[10px] font-black space-y-1">
                          <div className="flex items-center gap-2"><span className="text-slate-400 uppercase tracking-widest w-8">GST:</span> <span className="font-mono text-slate-700 dark:text-slate-300">{ledger.gstin}</span></div>
                          <div className="flex items-center gap-2"><span className="text-slate-400 uppercase tracking-widest w-8">PAN:</span> <span className="font-mono text-slate-700 dark:text-slate-300">{ledger.pan}</span></div>
                        </div>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-4 text-xs font-black text-slate-500 dark:text-slate-400">{ledger.openingDate || '—'}</td>
                    <td className="px-8 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all"><Eye size={18} /></button>
                        <button className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-xl transition-all"><Edit3 size={18} /></button>
                        <button className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all"><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-xs font-black uppercase tracking-widest text-slate-500">
            Total Ledger Accounts: <span className="text-rose-600 text-base ml-2">{filteredLedgers.length}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Showing {filteredLedgers.length} results</span>
            <div className="flex items-center gap-1">
              <PaginationButton icon={<ChevronLeft size={18} />} disabled />
              <button className="w-9 h-9 rounded-xl bg-rose-600 text-white text-xs font-black shadow-lg shadow-rose-600/20">1</button>
              <PaginationButton icon={<ChevronRight size={18} />} disabled />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const FilterInput = ({ placeholder, icon }: { placeholder: string, icon: React.ReactNode }) => (
  <div className="relative">
    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">{icon}</span>
    <input 
      className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold focus:ring-4 focus:ring-rose-600/10 outline-none transition-all" 
      placeholder={placeholder} 
      type="text"
    />
  </div>
);

const FilterSelect = ({ options, icon }: { options: string[], icon: React.ReactNode }) => (
  <div className="relative">
    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">{icon}</span>
    <select className="w-full pl-12 pr-10 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold focus:ring-4 focus:ring-rose-600/10 outline-none transition-all appearance-none cursor-pointer">
      {options.map(opt => <option key={opt}>{opt}</option>)}
    </select>
    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
      <ChevronDown size={18} />
    </div>
  </div>
);

const PaginationButton = ({ icon, disabled = false }: { icon: React.ReactNode, disabled?: boolean }) => (
  <button 
    disabled={disabled}
    className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-400 hover:text-rose-600 transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-90 shadow-sm"
  >
    {icon}
  </button>
);
