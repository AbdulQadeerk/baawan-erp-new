/**
 * LedgerDetailsModal — React equivalent of Angular's LedgerDetailsModalComponent
 * Angular: src/app/shared/ledger-details-modal/ledger-details-modal.component.ts
 *
 * Fetches full ledger data via /api/Ledger/GetById and displays all ledger
 * information including address, GST, balance, price categories.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Loader2, User, MapPin, Phone, CreditCard, Building2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { apiClient } from '../lib/api-client';

interface LedgerDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  ledgerId: number;
  ledgerList?: any[];
  currentIndex?: number;
}

export const LedgerDetailsModal: React.FC<LedgerDetailsModalProps> = ({
  isOpen,
  onClose,
  ledgerId,
  ledgerList = [],
  currentIndex: initialIndex = 0,
}) => {
  const [loading, setLoading] = useState(false);
  const [record, setRecord] = useState<any>(null);
  const [index, setIndex] = useState(initialIndex);

  // ─── Fetch ledger data ──────────────────────────────────────────────────
  const fetchLedger = useCallback(async (id: number) => {
    setLoading(true);
    try {
      // Angular: LedgerServiceService.Get → /api/Ledger/GetById
      const data = await apiClient.post('/api/Ledger/GetById', { id });
      setRecord(data);
    } catch (err) {
      console.error('Failed to load ledger:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen && ledgerId) fetchLedger(ledgerId);
  }, [isOpen, ledgerId, fetchLedger]);

  // ─── Navigation ─────────────────────────────────────────────────────────
  const canPrev = ledgerList.length > 1 && index > 0;
  const canNext = ledgerList.length > 1 && index < ledgerList.length - 1;

  const navigate = (dir: 'prev' | 'next') => {
    const newIdx = dir === 'prev' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= ledgerList.length) return;
    setIndex(newIdx);
    const item = ledgerList[newIdx];
    fetchLedger(item.id || item.ledger_ID);
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') navigate('next');
      else if (e.key === 'ArrowLeft') navigate('prev');
      else if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, index]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        {canPrev && (
          <button onClick={() => navigate('prev')} className="absolute left-4 top-1/2 -translate-y-1/2 z-[110] w-10 h-10 bg-white dark:bg-slate-800 rounded-full shadow-xl flex items-center justify-center hover:bg-blue-50 transition-all border border-slate-200 dark:border-slate-700">
            <ChevronLeft size={20} className="text-slate-600 dark:text-slate-300" />
          </button>
        )}
        {canNext && (
          <button onClick={() => navigate('next')} className="absolute right-4 top-1/2 -translate-y-1/2 z-[110] w-10 h-10 bg-white dark:bg-slate-800 rounded-full shadow-xl flex items-center justify-center hover:bg-blue-50 transition-all border border-slate-200 dark:border-slate-700">
            <ChevronRight size={20} className="text-slate-600 dark:text-slate-300" />
          </button>
        )}

        {ledgerList.length > 1 && (
          <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[110] px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full shadow-lg">
            {index + 1} / {ledgerList.length}
          </div>
        )}

        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col border border-slate-200 dark:border-slate-700"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <User size={18} className="text-blue-600" /> Ledger Details
            </h3>
            <button onClick={onClose} className="p-2 bg-rose-100 dark:bg-rose-900/30 hover:bg-rose-200 rounded-lg transition-colors text-rose-600 dark:text-rose-400">
              <X size={16} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Loader2 size={32} className="animate-spin text-blue-600" />
                <span className="text-sm text-slate-500 font-medium">Loading ledger details...</span>
              </div>
            ) : record ? (
              <>
                {/* Name banner */}
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl p-4 mb-6 border border-emerald-100 dark:border-emerald-800">
                  <h4 className="text-xl font-bold text-slate-800 dark:text-slate-100">{record.name || '—'}</h4>
                  {record.group && <p className="text-sm text-slate-500 mt-1">Group: <b>{record.group}</b></p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Address */}
                  <div className="space-y-2 text-sm">
                    <h5 className="font-bold text-slate-700 dark:text-slate-300 uppercase text-xs tracking-wider flex items-center gap-2"><MapPin size={14} /> Address</h5>
                    {record.address && <p className="text-slate-600 dark:text-slate-400">{record.address}</p>}
                    {record.area && <p className="text-slate-600 dark:text-slate-400">{record.area}</p>}
                    {record.city && <p className="text-slate-600 dark:text-slate-400">{record.city}{record.pinCode ? ` - ${record.pinCode}` : ''}</p>}
                    {record.state && <p className="text-slate-600 dark:text-slate-400">{record.state}</p>}
                    {record.country && <p className="text-slate-600 dark:text-slate-400">{record.country}</p>}
                  </div>

                  {/* Contact */}
                  <div className="space-y-2 text-sm">
                    <h5 className="font-bold text-slate-700 dark:text-slate-300 uppercase text-xs tracking-wider flex items-center gap-2"><Phone size={14} /> Contact</h5>
                    {record.mobile && <p className="text-slate-600 dark:text-slate-400"><b>Mobile:</b> {record.mobile}</p>}
                    {record.phone_1 && <p className="text-slate-600 dark:text-slate-400"><b>Phone 1:</b> {record.phone_1}</p>}
                    {record.phone_2 && <p className="text-slate-600 dark:text-slate-400"><b>Phone 2:</b> {record.phone_2}</p>}
                    {record.email && <p className="text-slate-600 dark:text-slate-400"><b>Email:</b> {record.email}</p>}
                  </div>

                  {/* Tax Info */}
                  <div className="space-y-2 text-sm">
                    <h5 className="font-bold text-slate-700 dark:text-slate-300 uppercase text-xs tracking-wider flex items-center gap-2"><CreditCard size={14} /> Tax Info</h5>
                    {record.gstNo && <p className="text-slate-600 dark:text-slate-400"><b>GSTIN:</b> {record.gstNo}</p>}
                    {record.panNo && <p className="text-slate-600 dark:text-slate-400"><b>PAN:</b> {record.panNo}</p>}
                    <p className="text-slate-600 dark:text-slate-400"><b>Credit Days:</b> {record.creditDays || 0}</p>
                    <p className="text-slate-600 dark:text-slate-400"><b>Party Type:</b> {record.partyType === 1 ? 'Customer' : record.partyType === 2 ? 'Supplier' : 'Both'}</p>
                  </div>

                  {/* Bank Details */}
                  <div className="space-y-2 text-sm">
                    <h5 className="font-bold text-slate-700 dark:text-slate-300 uppercase text-xs tracking-wider flex items-center gap-2"><Building2 size={14} /> Bank</h5>
                    {record.bankName && <p className="text-slate-600 dark:text-slate-400"><b>Bank:</b> {record.bankName}</p>}
                    {record.bankAccountNo && <p className="text-slate-600 dark:text-slate-400"><b>Account:</b> {record.bankAccountNo}</p>}
                    {record.bankIfsc && <p className="text-slate-600 dark:text-slate-400"><b>IFSC:</b> {record.bankIfsc}</p>}
                    {record.bankBranch && <p className="text-slate-600 dark:text-slate-400"><b>Branch:</b> {record.bankBranch}</p>}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-16 text-sm text-slate-400">No ledger data available</div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
