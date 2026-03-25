import React, { useEffect, useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  extraChargeApi,
  getTaxTypeText,
  isTaxType,
  type ExtraChargeRecord,
} from '../../../services/extra-charge.service';

interface ExtraChargeDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  recordId: number | null;
}

export const ExtraChargeDetailsModal: React.FC<ExtraChargeDetailsModalProps> = ({
  isOpen,
  onClose,
  recordId,
}) => {
  const [record, setRecord] = useState<ExtraChargeRecord | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && recordId) {
      loadData(recordId);
    }
    if (!isOpen) {
      setRecord(null);
      setError(null);
    }
  }, [isOpen, recordId]);

  async function loadData(id: number) {
    setIsLoading(true);
    setError(null);
    try {
      const data = await extraChargeApi.getById(id);
      setRecord(data);
    } catch (err: any) {
      if (!err?._processedByInterceptor) {
        setError(err?.message || 'Failed to load extra charge details.');
      }
    } finally {
      setIsLoading(false);
    }
  }

  if (!isOpen) return null;

  const taxTypeIsSet = record ? isTaxType(record.tax_Type) : false;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/50 dark:border-slate-700/50 w-full max-w-2xl mx-4 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-wider">
                Extra Charge Info
              </h3>
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-all active:scale-90"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="px-8 py-6">
              {isLoading && (
                <div className="flex items-center justify-center gap-3 py-12 text-slate-500">
                  <Loader2 className="animate-spin" size={24} />
                  <span className="text-sm font-bold uppercase tracking-widest">Loading...</span>
                </div>
              )}

              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl px-6 py-4 text-sm font-bold text-red-600 dark:text-red-400">
                  {error}
                </div>
              )}

              {!isLoading && !error && record && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <DetailItem label="Name" value={record.name || 'N/A'} />
                  <DetailItem label="Ledger" value={record.ledger || record.ledgerName || 'N/A'} />
                  <DetailItem
                    label="Tax Type"
                    value={getTaxTypeText(record.tax_Type) || record.taxType || 'N/A'}
                    badge
                    badgeColor="bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800"
                  />
                  {taxTypeIsSet ? (
                    <DetailItem label="Tax Percent" value={`${record.taxPercent ?? 0}%`} />
                  ) : (
                    <DetailItem
                      label="Positive Effect"
                      value={record.isPositiveEffect ? 'Yes' : 'No'}
                      badge
                      badgeColor={
                        record.isPositiveEffect
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800'
                          : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800'
                      }
                    />
                  )}
                  {taxTypeIsSet && (
                    <>
                      <DetailItem label="Sales Ledger" value={record.salesLedger || record.salesLedgerName || 'N/A'} />
                      <DetailItem label="Purchase Ledger" value={record.purchaseLedger || record.purchaseLedgerName || 'N/A'} />
                    </>
                  )}
                  <DetailItem label="Percent Based" value={record.percentBased ? 'Yes' : 'No'} />
                  <DetailItem label="Amount Based" value={record.cstEffect ? 'Yes' : 'No'} />
                  <DetailItem label="Fixed Amount" value={String(record.fixedAmount ?? 0)} />
                  <DetailItem label="Fixed Percent" value={`${record.fixedPercent ?? 0}%`} />
                  {record.description && (
                    <div className="sm:col-span-2">
                      <DetailItem label="Description" value={record.description} />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-8 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-slate-800 dark:bg-slate-700 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-900 dark:hover:bg-slate-600 transition-all active:scale-95"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// ─── Sub-components ─────────────────────────────────────────────────────────

const DetailItem = ({
  label,
  value,
  badge = false,
  badgeColor = '',
}: {
  label: string;
  value: string;
  badge?: boolean;
  badgeColor?: string;
}) => (
  <div className="space-y-1.5">
    <span className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
      {label}
    </span>
    {badge ? (
      <span
        className={`inline-block px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${badgeColor}`}
      >
        {value}
      </span>
    ) : (
      <span className="block text-sm font-bold text-slate-800 dark:text-slate-200">{value}</span>
    )}
  </div>
);
