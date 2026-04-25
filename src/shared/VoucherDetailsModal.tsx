/**
 * VoucherDetailsModal — React equivalent of Angular's VoucherDetailsModalComponent
 * Angular: src/app/shared/voucher-details-modal/voucher-details-modal.component.ts
 *
 * Fetches voucher data via /api/Voucher/GetById, resolves ledger details for
 * each voucher ledger entry, and displays debit/credit entries with navigation.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Loader2, Printer, Receipt } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { apiClient } from '../lib/api-client';
import { INVOICE_VOUCHER_TYPES_BY_ID } from '../lib/constants';

// Angular: appCommon.VoucherTypesObjByte
const VOUCHER_TYPES_BY_ID: Record<string, string> = {
  '17': 'Payment Voucher',
  '18': 'Receipt Voucher',
  '19': 'Journal Voucher',
  '20': 'Contra Voucher',
};

interface VoucherDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  invCode: number | string;
  invType: number;
  setupInfoData?: any;
  invoiceList?: any[];
  currentIndex?: number;
}

export const VoucherDetailsModal: React.FC<VoucherDetailsModalProps> = ({
  isOpen,
  onClose,
  invCode,
  invType,
  setupInfoData: initialSetup,
  invoiceList = [],
  currentIndex: initialIndex = 0,
}) => {
  const [loading, setLoading] = useState(false);
  const [record, setRecord] = useState<any>(null);
  const [index, setIndex] = useState(initialIndex);
  const invTypeText = VOUCHER_TYPES_BY_ID[String(invType)] || INVOICE_VOUCHER_TYPES_BY_ID[String(invType)] || 'Voucher';

  // ─── Fetch voucher data ─────────────────────────────────────────────────
  const fetchVoucher = useCallback(async (id: number | string) => {
    setLoading(true);
    try {
      // Angular: VoucherService.Get → /api/Voucher/GetById
      const data = await apiClient.post('/api/Voucher/GetById', { id, invType, fromInvoice: false });

      // Resolve ledger names for each ledger detail entry
      if (data.ledgerDetails?.length) {
        for (const detail of data.ledgerDetails) {
          if (detail.ledger_ID) {
            try {
              const ledger = await apiClient.post('/api/Ledger/GetById', { id: detail.ledger_ID });
              if (ledger) detail.ledgerData = ledger;
            } catch {}
          }
        }
      }

      // Resolve prepared by
      if (data.loginByUserID) {
        try {
          const userRes = await apiClient.post('/api/User/Search', {});
          const user = userRes?.list?.find((u: any) => u.user_ID == data.loginByUserID);
          if (user) data.preparedBy = `${user.first_Name || ''} ${user.lastname || ''}`.trim();
        } catch {}
      }

      setRecord(data);
    } catch (err) {
      console.error('Failed to load voucher:', err);
    } finally {
      setLoading(false);
    }
  }, [invType]);

  useEffect(() => {
    if (isOpen && invCode) fetchVoucher(invCode);
  }, [isOpen, invCode, fetchVoucher]);

  // Navigation
  const canPrev = invoiceList.length > 1 && index > 0;
  const canNext = invoiceList.length > 1 && index < invoiceList.length - 1;

  const navigate = (dir: 'prev' | 'next') => {
    const newIdx = dir === 'prev' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= invoiceList.length) return;
    setIndex(newIdx);
    const item = invoiceList[newIdx];
    fetchVoucher(item.invCode || item.id);
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

  const fmt = (n: any) => {
    const v = parseFloat(n);
    return isNaN(v) ? '0.00' : '₹' + v.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatDate = (val: string) => {
    if (!val) return '';
    try { return new Date(val).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }); }
    catch { return val; }
  };

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

        {invoiceList.length > 1 && (
          <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[110] px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full shadow-lg">
            {index + 1} / {invoiceList.length}
          </div>
        )}

        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col border border-slate-200 dark:border-slate-700"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Receipt size={18} className="text-blue-600" /> {invTypeText}
            </h3>
            <div className="flex items-center gap-2">
              <button onClick={() => window.print()} className="p-2 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 rounded-lg transition-colors text-blue-700 dark:text-blue-300" title="Print">
                <Printer size={16} />
              </button>
              <button onClick={onClose} className="p-2 bg-rose-100 dark:bg-rose-900/30 hover:bg-rose-200 rounded-lg transition-colors text-rose-600 dark:text-rose-400">
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Loader2 size={32} className="animate-spin text-blue-600" />
                <span className="text-sm text-slate-500">Loading voucher details...</span>
              </div>
            ) : record ? (
              <>
                {/* Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-sm">
                  <div>
                    <span className="text-slate-500">Voucher No:</span>
                    <p className="font-bold text-slate-800 dark:text-slate-100">{record.billNo || record.bill_No || '—'}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Date:</span>
                    <p className="font-bold text-slate-800 dark:text-slate-100">{formatDate(record.date)}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Type:</span>
                    <p className="font-bold text-slate-800 dark:text-slate-100">{invTypeText}</p>
                  </div>
                </div>

                {/* Ledger Entries Table */}
                <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden mb-4">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                        <th className="px-4 py-2 text-left text-xs font-bold uppercase text-slate-500">Ledger</th>
                        <th className="px-4 py-2 text-right text-xs font-bold uppercase text-slate-500">Debit</th>
                        <th className="px-4 py-2 text-right text-xs font-bold uppercase text-slate-500">Credit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {record.ledgerDetails?.map((entry: any, i: number) => (
                        <tr key={i} className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <td className="px-4 py-3">
                            <p className="font-semibold text-slate-800 dark:text-slate-200">{entry.ledgerData?.name || `Ledger #${entry.ledger_ID}`}</p>
                            {entry.subDetails?.length > 0 && (
                              <div className="mt-1 space-y-0.5">
                                {entry.subDetails.map((sub: any, j: number) => (
                                  <p key={j} className="text-xs text-slate-500 pl-3 border-l-2 border-slate-200 dark:border-slate-700">
                                    {sub.name || '—'} — {fmt(sub.amount)}
                                  </p>
                                ))}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right font-semibold text-slate-800 dark:text-slate-200">
                            {!entry.isCredit ? fmt(entry.amount) : ''}
                          </td>
                          <td className="px-4 py-3 text-right font-semibold text-slate-800 dark:text-slate-200">
                            {entry.isCredit ? fmt(entry.amount) : ''}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Footer */}
                <div className="flex flex-wrap items-center justify-between text-sm gap-4">
                  {record.note && (
                    <p className="text-slate-600 dark:text-slate-400"><b>Note:</b> {record.note}</p>
                  )}
                  {record.preparedBy && (
                    <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded text-xs font-semibold">
                      Prepared By: {record.preparedBy}
                    </span>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-16 text-sm text-slate-400">No voucher data available</div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
