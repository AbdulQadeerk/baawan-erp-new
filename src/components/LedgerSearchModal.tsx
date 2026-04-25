import React, { useState, useEffect } from 'react';
import { 
  X, 
  Search, 
  MapPin, 
  Building2, 
  Grid3X3, 
  Phone, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  ArrowUpDown,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  Wallet,
  User,
  Eye,
  Lightbulb,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Ledger } from '../types';
import { LedgerInfoModal } from './LedgerInfoModal';
import { QuickInfoModal } from './QuickInfoModal';
import { ledgerService } from '../services/api';

interface LedgerSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (ledger: Ledger) => void;
}

export const LedgerSearchModal: React.FC<LedgerSearchModalProps> = ({ isOpen, onClose, onSelect }) => {
  const [searchTerms, setSearchTerms] = useState({
    name: '',
    address: '',
    city: '',
    area: '',
    mobile: ''
  });
  const [ledgers, setLedgers] = useState<Ledger[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeLedger, setActiveLedger] = useState<Ledger | null>(null);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isQuickInfoModalOpen, setIsQuickInfoModalOpen] = useState(false);
  const [ledgerForInfo, setLedgerForInfo] = useState<Ledger | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchLedgers();
    }
  }, [isOpen]);

  const fetchLedgers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await ledgerService.list();
      const mappedLedgers: Ledger[] = Array.isArray(data) ? data.map((ledger: any) => ({
        id: ledger.id,
        name: ledger.ledgerName || ledger.name || '',
        address: ledger.address || '',
        city: ledger.city || '',
        area: ledger.area || '',
        mobile: ledger.mobile || '',
        parentCompany: ledger.groupName || '',
        gstin: ledger.gstNo || ledger.gstin || '',
        openingDate: ledger.openingDate || '',
        pan: ledger.pan || '',
      })) : [];
      setLedgers(mappedLedgers);
      if (mappedLedgers.length > 0) {
        setActiveLedger(mappedLedgers[0]);
      }
    } catch (err: any) {
      console.error('Error fetching ledgers:', err);
      setError('Failed to load ledgers. Please check your connection or session.');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredLedgers = ledgers.filter(ledger => 
    (ledger.name || '').toLowerCase().includes(searchTerms.name.toLowerCase()) &&
    (ledger.address || '').toLowerCase().includes(searchTerms.address.toLowerCase()) &&
    (ledger.city || '').toLowerCase().includes(searchTerms.city.toLowerCase()) &&
    (ledger.area || '').toLowerCase().includes(searchTerms.area.toLowerCase()) &&
    (ledger.mobile || '').toLowerCase().includes(searchTerms.mobile.toLowerCase())
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-7xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-200 dark:border-slate-800"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
              <div className="flex items-center gap-3">
                <div className="w-2 h-8 bg-blue-600 rounded-full"></div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Select Ledger</h2>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors group"
              >
                <X size={20} className="text-slate-500 dark:text-slate-400 group-hover:text-red-500" />
              </button>
            </div>

            <div className="flex flex-1 overflow-hidden">
              {/* Left Section: Search & Table */}
              <div className="flex-1 flex flex-col min-w-0">
                {/* Search Filters */}
                <div className="p-6 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                    <SearchInput 
                      label="Name" 
                      icon={<Search size={14} />} 
                      placeholder="Search name..." 
                      value={searchTerms.name}
                      onChange={(val) => setSearchTerms({ ...searchTerms, name: val })}
                    />
                    <SearchInput 
                      label="Address" 
                      icon={<MapPin size={14} />} 
                      placeholder="Search address..." 
                      value={searchTerms.address}
                      onChange={(val) => setSearchTerms({ ...searchTerms, address: val })}
                    />
                    <SearchInput 
                      label="City" 
                      icon={<Building2 size={14} />} 
                      placeholder="Search city..." 
                      value={searchTerms.city}
                      onChange={(val) => setSearchTerms({ ...searchTerms, city: val })}
                    />
                    <SearchInput 
                      label="Area" 
                      icon={<Grid3X3 size={14} />} 
                      placeholder="Search area..." 
                      value={searchTerms.area}
                      onChange={(val) => setSearchTerms({ ...searchTerms, area: val })}
                    />
                    <SearchInput 
                      label="Mobile" 
                      icon={<Phone size={14} />} 
                      placeholder="Search mobile..." 
                      value={searchTerms.mobile}
                      onChange={(val) => setSearchTerms({ ...searchTerms, mobile: val })}
                    />
                  </div>
                </div>

                {/* Table */}
                <div className="flex-1 overflow-auto custom-scrollbar">
                  <table className="w-full border-collapse">
                    <thead className="sticky top-0 bg-slate-50 dark:bg-slate-800 z-10">
                      <tr className="text-left">
                        <th className="px-6 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Address</th>
                        <th className="px-6 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">City</th>
                        <th className="px-6 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Mobile</th>
                        <th className="px-6 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {error ? (
                        <tr>
                          <td colSpan={5} className="p-12 text-center">
                            <AlertCircle className="mx-auto text-red-400 mb-2" size={32} />
                            <p className="text-red-500 font-medium">{error}</p>
                            <button 
                              onClick={fetchLedgers}
                              className="mt-4 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-200 transition-all text-sm font-bold"
                            >
                              Try Again
                            </button>
                          </td>
                        </tr>
                      ) : isLoading ? (
                        <tr>
                          <td colSpan={5} className="p-12 text-center">
                            <Loader2 className="animate-spin mx-auto text-slate-400 mb-2" size={32} />
                            <p className="text-slate-500">Loading ledgers...</p>
                          </td>
                        </tr>
                      ) : filteredLedgers.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-12 text-center text-slate-500 italic">
                            No ledgers found.
                          </td>
                        </tr>
                      ) : (
                        filteredLedgers.map((ledger) => (
                          <tr 
                            key={ledger.id}
                            onClick={() => setActiveLedger(ledger)}
                            className={`hover:bg-blue-50/50 dark:hover:bg-blue-900/10 cursor-pointer transition-colors group ${activeLedger?.id === ledger.id ? 'bg-blue-50/30 dark:bg-blue-900/5' : ''}`}
                          >
                            <td className="px-6 py-4 font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 transition-colors">
                              {ledger.name}
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 max-w-[200px] truncate">
                              {ledger.address}
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                              {ledger.city}
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                              <div className="flex items-center gap-2">
                                <span className="w-4 h-3 bg-slate-200 dark:bg-slate-700 rounded-sm overflow-hidden flex items-center justify-center text-[8px] font-bold">IN</span>
                                <span>{ledger.mobile}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setLedgerForInfo(ledger);
                                  setIsInfoModalOpen(true);
                                }}
                                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-600/10 rounded-lg transition-all"
                              >
                                <Eye size={18} />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    Showing {filteredLedgers.length} of {ledgers.length} results
                  </span>
                  <div className="flex items-center gap-1">
                    <PaginationButton icon={<ChevronLeft size={16} />} disabled />
                    <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-600 text-white font-bold">1</button>
                    <button className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">2</button>
                    <PaginationButton icon={<ChevronRight size={16} />} />
                  </div>
                </div>
              </div>

              {/* Right Section: Quick View Panel */}
              <div className="w-96 border-l border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/50 overflow-auto custom-scrollbar">
                {activeLedger ? (
                  <div className="p-6 space-y-8">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">Quick View</h3>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => setIsQuickInfoModalOpen(true)}
                            className="p-1.5 bg-emerald-500/10 text-emerald-600 rounded-lg hover:bg-emerald-500 hover:text-white transition-all"
                            title="Quick Info Summary"
                          >
                            <Lightbulb size={16} />
                          </button>
                          <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-widest bg-blue-600/10 text-blue-600 rounded-full">Active Ledger</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-4 p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                        <div className="w-12 h-12 rounded-full bg-blue-600/10 flex items-center justify-center text-blue-600 shrink-0">
                          <Building2 size={24} />
                        </div>
                        <div>
                          <h4 className="font-black text-slate-900 dark:text-slate-100">{activeLedger.name}</h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400">ID: LEDG-2024-{activeLedger.id.padStart(3, '0')}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Outstanding</label>
                        <div className={`text-3xl font-black ${activeLedger.outstanding! > activeLedger.creditLimit! ? 'text-red-600' : 'text-emerald-600'}`}>
                          ₹ {activeLedger.outstanding?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </div>
                        {activeLedger.outstanding! > activeLedger.creditLimit! && (
                          <div className="flex items-center gap-1.5 text-xs text-red-600 font-bold">
                            <AlertTriangle size={14} />
                            Over credit limit by ₹ {(activeLedger.outstanding! - activeLedger.creditLimit!).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 gap-5">
                        <QuickInfo icon={<User size={18} />} label="Contact Person" value={activeLedger.salesPerson || 'N/A'} />
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-slate-400">
                            <Receipt size={18} />
                            <label className="text-[10px] font-black uppercase tracking-widest">GSTIN Status</label>
                          </div>
                          <div className="flex items-center gap-2 ml-6">
                            <p className="text-sm font-bold text-slate-900 dark:text-slate-200">{activeLedger.gstin || 'N/A'}</p>
                            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                            <span className="text-[10px] font-black text-emerald-500 uppercase">Verified</span>
                          </div>
                        </div>
                        <QuickInfo icon={<Wallet size={18} />} label="Credit Limit" value={`₹ ${activeLedger.creditLimit?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`} />
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-slate-400">
                            <MapPin size={18} />
                            <label className="text-[10px] font-black uppercase tracking-widest">Full Address</label>
                          </div>
                          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400 ml-6 font-medium">
                            {activeLedger.address}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-3">
                      <button 
                        onClick={() => onSelect(activeLedger)}
                        className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 active:scale-95"
                      >
                        Select Ledger
                        <CheckCircle2 size={18} />
                      </button>
                      <button className="w-full py-3 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all active:scale-95">
                        View Statement
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                    <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-300 mb-4">
                      <Eye size={32} />
                    </div>
                    <p className="text-slate-400 font-bold">Select a ledger to see quick details</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}

      <LedgerInfoModal 
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
        ledger={ledgerForInfo}
      />

      <QuickInfoModal
        isOpen={isQuickInfoModalOpen}
        onClose={() => setIsQuickInfoModalOpen(false)}
        ledgerName={activeLedger?.name || ''}
      />
    </AnimatePresence>
  );
};

const SearchInput = ({ label, icon, placeholder, value, onChange }: { label: string, icon: React.ReactNode, placeholder: string, value: string, onChange: (val: string) => void }) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{label}</label>
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{icon}</span>
      <input 
        className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none dark:text-slate-200 transition-all" 
        placeholder={placeholder} 
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  </div>
);

const QuickInfo = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) => (
  <div className="space-y-1">
    <div className="flex items-center gap-2 text-slate-400">
      {icon}
      <label className="text-[10px] font-black uppercase tracking-widest">{label}</label>
    </div>
    <p className="text-sm font-bold text-slate-900 dark:text-slate-200 ml-6">{value}</p>
  </div>
);

const PaginationButton = ({ icon, disabled = false }: { icon: React.ReactNode, disabled?: boolean }) => (
  <button 
    disabled={disabled}
    className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
  >
    {icon}
  </button>
);
