/**
 * ItemDetailsModal — React equivalent of Angular's ItemDetailsModalComponent
 * Angular: src/app/shared/item-details-modal/item-details-modal.component.ts
 *
 * Fetches full item data via /api/item/GetById, resolves price categories,
 * sales/purchase ledger names, unit conversions, and displays item details
 * with navigation support.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Loader2, Pencil, Package, Tag, Hash, MapPin, FileText, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { apiClient, commonApi } from '../lib/api-client';

interface ItemDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemId: number;
  itemList?: any[];
  currentIndex?: number;
}

export const ItemDetailsModal: React.FC<ItemDetailsModalProps> = ({
  isOpen,
  onClose,
  itemId,
  itemList = [],
  currentIndex: initialIndex = 0,
}) => {
  const [loading, setLoading] = useState(false);
  const [record, setRecord] = useState<any>(null);
  const [index, setIndex] = useState(initialIndex);
  const [priceCategoryList, setPriceCategoryList] = useState<any[]>([]);
  const [unitList, setUnitList] = useState<any[]>([]);

  // ─── Fetch item data (mirrors Angular ItemDetailsModal.getData) ──────────
  const fetchItem = useCallback(async (id: number) => {
    setLoading(true);
    try {
      // Call /api/item/GetById — Angular: ItemServiceService.Get
      const data = await apiClient.post('/api/item/GetById', { id });

      // Resolve sales ledger name
      if (data.salesAccountLedgerID) {
        try {
          const ledger = await apiClient.post('/api/Ledger/GetById', { id: data.salesAccountLedgerID });
          if (ledger) data.salesAccountLedgerName = ledger.name;
        } catch {}
      }

      // Resolve purchase ledger name
      if (data.purchaseAccountLedgerID) {
        try {
          const ledger = await apiClient.post('/api/Ledger/GetById', { id: data.purchaseAccountLedgerID });
          if (ledger) data.purchaseAccountLedgerName = ledger.name;
        } catch {}
      }

      // Resolve price categories
      if (data.priceCategories?.length && priceCategoryList.length) {
        data.priceCategories.forEach((v: any) => {
          const rec = priceCategoryList.find((x: any) => x.priceCategoryID === v.priceCategoryID);
          if (rec) v.priceCategoryName = rec.priceCategoryName;
        });
      }

      // Resolve unit conversion names
      if (data.unit_Conv?.length && unitList.length) {
        data.unit_Conv.forEach((uc: any) => {
          const unit = unitList.find((u: any) => u.id == uc.convUnit);
          if (unit) uc.convUnitName = unit.name;
        });
      }

      setRecord(data);
    } catch (err) {
      console.error('Failed to load item:', err);
    } finally {
      setLoading(false);
    }
  }, [priceCategoryList, unitList]);

  // ─── Load dropdowns on mount ────────────────────────────────────────────
  useEffect(() => {
    // Price categories — Angular: commonService.dropdown({table: 27})
    commonApi.dropdown({ table: 27 }).then((data: any) => {
      if (data?.length) {
        setPriceCategoryList(data.map((item: any) => ({
          priceCategoryID: item.id,
          priceCategoryName: item.name,
        })));
      }
    }).catch(() => {});

    // Unit list — Angular: commonService.dropdown({table: 16})
    commonApi.dropdown({ table: 16 }).then((data: any) => {
      if (data?.length) setUnitList(data);
    }).catch(() => {});
  }, []);

  // ─── Fetch on open ──────────────────────────────────────────────────────
  useEffect(() => {
    if (isOpen && itemId) {
      fetchItem(itemId);
    }
  }, [isOpen, itemId, fetchItem]);

  // ─── Navigation ─────────────────────────────────────────────────────────
  const canPrev = itemList.length > 1 && index > 0;
  const canNext = itemList.length > 1 && index < itemList.length - 1;

  const navigate = (dir: 'prev' | 'next') => {
    const newIdx = dir === 'prev' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= itemList.length) return;
    setIndex(newIdx);
    const item = itemList[newIdx];
    fetchItem(item.item_ID || item.id || item.iid);
  };

  // ─── Keyboard navigation ───────────────────────────────────────────────
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

  const fmt = (n: any, decimals = 2) => {
    const v = parseFloat(n);
    return isNaN(v) ? '0.00' : v.toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
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
        {/* Navigation Arrows */}
        {canPrev && (
          <button onClick={() => navigate('prev')} className="absolute left-4 top-1/2 -translate-y-1/2 z-[110] w-10 h-10 bg-white dark:bg-slate-800 rounded-full shadow-xl flex items-center justify-center hover:bg-blue-50 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700">
            <ChevronLeft size={20} className="text-slate-600 dark:text-slate-300" />
          </button>
        )}
        {canNext && (
          <button onClick={() => navigate('next')} className="absolute right-4 top-1/2 -translate-y-1/2 z-[110] w-10 h-10 bg-white dark:bg-slate-800 rounded-full shadow-xl flex items-center justify-center hover:bg-blue-50 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700">
            <ChevronRight size={20} className="text-slate-600 dark:text-slate-300" />
          </button>
        )}

        {/* Counter */}
        {itemList.length > 1 && (
          <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[110] px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full shadow-lg">
            {index + 1} / {itemList.length}
          </div>
        )}

        {/* Modal */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col border border-slate-200 dark:border-slate-700"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Package size={18} className="text-blue-600" /> Item Details
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
                <span className="text-sm text-slate-500 font-medium">Loading item details...</span>
              </div>
            ) : record ? (
              <>
                {/* Top info bar */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 mb-6 border border-blue-100 dark:border-blue-800">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="text-xl font-bold text-slate-800 dark:text-slate-100">{record.name || '—'}</h4>
                    {record.isActive !== false && (
                      <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-full">Active</span>
                    )}
                    {record.isActive === false && (
                      <span className="px-2 py-0.5 bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-400 text-xs font-bold rounded-full">Inactive</span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-400">
                    <span className="flex items-center gap-1"><Hash size={13} /> Code: <b className="text-slate-800 dark:text-slate-200">{record.item_CodeTxt || '—'}</b></span>
                    <span className="flex items-center gap-1"><Tag size={13} /> HSN: <b className="text-slate-800 dark:text-slate-200">{record.hsnNo || '—'}</b></span>
                    {record.brand && <span>Brand: <b className="text-slate-800 dark:text-slate-200">{record.brand}</b></span>}
                    {record.category && <span>Category: <b className="text-slate-800 dark:text-slate-200">{record.category}</b></span>}
                  </div>
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Left column */}
                  <div className="space-y-3 text-sm">
                    <h5 className="font-bold text-slate-700 dark:text-slate-300 uppercase text-xs tracking-wider flex items-center gap-2"><Layers size={14} /> Stock Info</h5>
                    <div className="grid grid-cols-2 gap-2">
                      <InfoRow label="Type" value={record.type || '—'} />
                      <InfoRow label="Size" value={record.sizes || '—'} />
                      <InfoRow label="Item Group" value={record.itemGroup || '—'} />
                      <InfoRow label="Unit" value={record.std_Unit || '—'} />
                      <InfoRow label="MSL (Min Stock)" value={fmt(record.minimum_Qty, 0)} />
                      <InfoRow label="MOQ (Reorder)" value={fmt(record.reOrderQty, 0)} />
                    </div>
                    {record.note && (
                      <div className="mt-2"><InfoRow label="Note" value={record.note} /></div>
                    )}
                    {record.location && (
                      <div><InfoRow label="Location" value={record.location} /></div>
                    )}
                  </div>

                  {/* Right column */}
                  <div className="space-y-3 text-sm">
                    <h5 className="font-bold text-slate-700 dark:text-slate-300 uppercase text-xs tracking-wider flex items-center gap-2"><FileText size={14} /> Pricing</h5>
                    <div className="grid grid-cols-2 gap-2">
                      <InfoRow label="Sell Rate" value={`₹${fmt(record.std_Sell_Rate)}`} />
                      <InfoRow label="Purchase Rate" value={`₹${fmt(record.std_Purchase_Rate)}`} />
                      <InfoRow label="MRP" value={`₹${fmt(record.mrp)}`} />
                      <InfoRow label="GST %" value={`${record.vatPer || 0}%`} />
                      {record.salesAccountLedgerName && <InfoRow label="Sales A/c" value={record.salesAccountLedgerName} />}
                      {record.purchaseAccountLedgerName && <InfoRow label="Purchase A/c" value={record.purchaseAccountLedgerName} />}
                    </div>
                  </div>
                </div>

                {/* Price Categories */}
                {record.priceCategories?.length > 0 && (
                  <div className="mb-6">
                    <h5 className="font-bold text-slate-700 dark:text-slate-300 uppercase text-xs tracking-wider mb-2">Price Categories</h5>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {record.priceCategories.map((pc: any, i: number) => (
                        <div key={i} className="bg-slate-50 dark:bg-slate-800 rounded-lg px-3 py-2 text-sm">
                          <span className="text-slate-500">{pc.priceCategoryName || `Category ${pc.priceCategoryID}`}</span>
                          <span className="float-right font-bold text-slate-800 dark:text-slate-200">₹{fmt(pc.rate)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Unit Conversions */}
                {record.unit_Conv?.length > 0 && (
                  <div className="mb-6">
                    <h5 className="font-bold text-slate-700 dark:text-slate-300 uppercase text-xs tracking-wider mb-2">Unit Conversions</h5>
                    <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-slate-50 dark:bg-slate-800">
                            <th className="px-3 py-2 text-left text-xs font-bold text-slate-500">Unit</th>
                            <th className="px-3 py-2 text-right text-xs font-bold text-slate-500">Conversion</th>
                          </tr>
                        </thead>
                        <tbody>
                          {record.unit_Conv.map((uc: any, i: number) => (
                            <tr key={i} className="border-t border-slate-100 dark:border-slate-800">
                              <td className="px-3 py-2 text-slate-700 dark:text-slate-300">{uc.convUnitName || uc.convUnit}</td>
                              <td className="px-3 py-2 text-right text-slate-800 dark:text-slate-200 font-semibold">{uc.convFactor}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16 text-sm text-slate-400">No item data available</div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ─── Helper ─────────────────────────────────────────────────────────────────
const InfoRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div>
    <span className="text-slate-500 dark:text-slate-400 text-xs">{label}</span>
    <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{value}</p>
  </div>
);
