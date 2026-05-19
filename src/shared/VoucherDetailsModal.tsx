/**
 * VoucherDetailsModal — React equivalent of Angular's VoucherDetailsModalComponent
 * Angular: src/app/shared/voucher-details-modal/voucher-details-modal.component.ts
 *
 * Fetches voucher data via /api/Voucher/GetById, resolves ledger details for
 * each voucher ledger entry, and displays debit/credit entries with navigation.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Loader2, Printer, Receipt, Pencil, Paperclip } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState<'details'|'attachments'>('details');
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
  }, [isOpen, index, navigate, onClose]);

  const fmt = (n: any) => {
    const v = parseFloat(n);
    return isNaN(v) ? '0.00' : '₹' + v.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatDate = (val: string) => {
    if (!val) return '';
    try { return new Date(val).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }); }
    catch { return val; }
  };

  const totalDebit = record?.ledgerDetails?.filter((e: any) => !e.isCredit).reduce((sum: number, e: any) => sum + e.amount, 0) || 0;
  const totalCredit = record?.ledgerDetails?.filter((e: any) => e.isCredit).reduce((sum: number, e: any) => sum + e.amount, 0) || 0;

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
          className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border border-slate-200 dark:border-slate-700"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
            <div className="flex items-center gap-6">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Receipt size={16} className="text-blue-500" /> {invTypeText}
                {record && <span className="text-xs font-normal text-slate-500 ml-2">{record.billNo || record.bill_No} | {formatDate(record.date)}</span>}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 rounded transition-colors text-blue-600 dark:text-blue-400" title="Edit">
                <Pencil size={14} />
              </button>
              <button onClick={() => window.print()} className="p-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 rounded transition-colors text-emerald-600 dark:text-emerald-400" title="Print">
                <Printer size={14} />
              </button>
              <button onClick={onClose} className="p-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 rounded transition-colors text-slate-600 dark:text-slate-400">
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-4 px-6 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 pt-3">
            <button
              onClick={() => setActiveTab('details')}
              className={`pb-2 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
                activeTab === 'details' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <Receipt size={14} /> Voucher Details
            </button>
            <button
              onClick={() => setActiveTab('attachments')}
              className={`pb-2 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
                activeTab === 'attachments' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <Paperclip size={14} /> Attachments <span className="bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded text-[10px]">0</span>
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto bg-white dark:bg-slate-900">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Loader2 size={32} className="animate-spin text-blue-600" />
                <span className="text-sm text-slate-500">Loading voucher details...</span>
              </div>
            ) : record ? (
              activeTab === 'details' ? (
                <>
                  {/* Info Header */}
                  <div className="flex justify-between items-end p-6 border-b-2 border-slate-200 dark:border-slate-700 pb-4 mb-4">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Voucher Date</span>
                      <p className="text-lg font-black text-slate-800 dark:text-slate-100">{formatDate(record.date)}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Document No</span>
                      <p className="text-lg font-black text-slate-800 dark:text-slate-100">{record.billNo || record.bill_No || '—'}</p>
                    </div>
                  </div>

                  {/* Ledger Entries Table */}
                  <div className="px-6 mb-6">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-[#3498db] text-white">
                          <th className="px-4 py-2 text-left text-xs font-bold uppercase tracking-wider rounded-tl-sm">Party / Account</th>
                          <th className="px-4 py-2 text-right text-xs font-bold uppercase tracking-wider w-40">Debit</th>
                          <th className="px-4 py-2 text-right text-xs font-bold uppercase tracking-wider w-40 rounded-tr-sm">Credit</th>
                        </tr>
                      </thead>
                      <tbody>
                        {record.ledgerDetails?.map((entry: any, i: number) => (
                          <tr key={i} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                            <td className="px-4 py-3">
                              <p className="font-semibold text-slate-800 dark:text-slate-200 uppercase text-xs">
                                {entry.ledgerData?.name || `Ledger #${entry.ledger_ID}`}
                              </p>
                              <span className="text-[10px] text-slate-400 font-medium block mt-0.5">ID: {entry.ledger_ID}</span>
                              {entry.subDetails?.length > 0 && (
                                <div className="mt-2 space-y-1">
                                  {entry.subDetails.map((sub: any, j: number) => (
                                    <p key={j} className="text-xs text-slate-600 dark:text-slate-400 pl-3 border-l-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-1 rounded-r">
                                      <span className="font-medium">{sub.name || '—'}</span> — <span className="font-bold">{fmt(sub.amount)}</span>
                                    </p>
                                  ))}
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-3 text-right font-bold text-emerald-600 dark:text-emerald-400 align-top">
                              {!entry.isCredit ? `${fmt(entry.amount)} Dr` : ''}
                            </td>
                            <td className="px-4 py-3 text-right font-bold text-rose-600 dark:text-rose-400 align-top">
                              {entry.isCredit ? `${fmt(entry.amount)} Cr` : ''}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="bg-slate-50 dark:bg-slate-800/50 border-t-2 border-slate-200 dark:border-slate-700">
                          <td className="px-4 py-4 text-center font-bold uppercase text-xs text-slate-700 dark:text-slate-300">Total Balance</td>
                          <td className="px-4 py-4 text-right font-bold text-emerald-600 dark:text-emerald-400">{fmt(totalDebit)} Dr</td>
                          <td className="px-4 py-4 text-right font-bold text-rose-600 dark:text-rose-400">{fmt(totalCredit)} Cr</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  {/* Footer Notes */}
                  <div className="flex flex-wrap items-center justify-between text-xs px-6 pb-6 gap-4 border-t border-slate-100 dark:border-slate-800 pt-4">
                    {record.note && (
                      <p className="text-slate-500"><b>Note:</b> {record.note}</p>
                    )}
                    {record.preparedBy && (
                      <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded font-semibold ml-auto">
                        Prepared By: {record.preparedBy}
                      </span>
                    )}
                  </div>
                </>
              ) : (
                <div className="p-6 text-center text-sm text-slate-500">
                  <Paperclip size={48} className="mx-auto text-slate-200 dark:text-slate-700 mb-4" />
                  <p>No attachments available for this voucher.</p>
                </div>
              )
            ) : (
              <div className="text-center py-16 text-sm text-slate-400">No voucher data available</div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
