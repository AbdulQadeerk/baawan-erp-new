import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Search, RotateCcw, FileSpreadsheet, Loader2, Banknote, Eye, Printer } from 'lucide-react';
import { reportApi } from '../../../../services/report.service';
import { ledgerApi } from '../../../../services/ledger.service';
import { commonApi } from '../../../../services/common.service';
import { invoiceApi } from '../../../../services/invoice.service';
import { toast } from '../../../../lib/toast';
import * as H from '../outstandingHelpers';

import { InvoiceDetailsModal } from '../../InvoiceDetailsModal';
import { VoucherDetailsModal } from '../../../../shared/VoucherDetailsModal';

export const OutstandingPaymentsReport: React.FC = () => {
  const precision = H.getPrecision();

  const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);
  const [lst, setLst] = useState<any[]>([]);
  const [uniqueLedLst, setUniqueLedLst] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [printLoading, setPrintLoading] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);
  const [pendingAmount, setPendingAmount] = useState(0);
  const salesPersonListRef = useRef<any[]>([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'invoice' | 'voucher'>('invoice');
  const [selectedInvCode, setSelectedInvCode] = useState<number>(-1);
  const [selectedInvType, setSelectedInvType] = useState<number>(-1);
  const [invoiceList, setInvoiceList] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  useEffect(() => {
    commonApi.getDropdown({ table: 18 }).then(data => {
      salesPersonListRef.current = data || [];
    }).catch(() => {});
  }, []);

  const getFilters = useCallback(() => ({
    ledgers: [],
    detailed: false,
    toDate: H.formatDateForApi(toDate),
    allPayments: true,
  }), [toDate]);

  const submitReport = useCallback(async () => {
    setLoading(true);
    try {
      const data = await reportApi.ledgerOutstanding(getFilters());
      if (data?.length) {
        setLst(data);
        const uniqueIds = [...new Set(data.map((i: any) => i.ledgerId))];
        try {
          const res = await ledgerApi.multiLedgerInfo({ ledgers: uniqueIds });
          const groups: any[] = [];
          for (const element of res) {
            element.stateName = element.stateName || '';
            if (element.assignedUserID && salesPersonListRef.current.length) {
              const rec = salesPersonListRef.current.find((x: any) => x.id == element.assignedUserID);
              element.salesperson = rec ? rec.name : '-';
            } else {
              element.salesperson = '-';
            }
            const ledgerData = data.filter((i: any) => i.ledgerId === element.id);
            groups.push({ ledger: element, data: ledgerData });
          }
          setUniqueLedLst(groups);
        } catch { setUniqueLedLst([]); }
        const { totalAmount: ta, pendingAmount: pa } = H.calculateTotals(data, precision);
        setTotalAmount(ta);
        setPendingAmount(pa);
      } else {
        setLst([]); setUniqueLedLst([]);
        toast.info('No outstanding for selected party', 'Info');
      }
    } catch (err: any) {
      setLst([]); setUniqueLedLst([]);
      toast.info(err?.message || 'Error', 'Error');
    } finally { setLoading(false); }
  }, [getFilters, precision]);

  const handleExport = async () => {
    setExportLoading(true);
    try {
      const blob = await reportApi.ledgerOutstandingExport(getFilters());
      if (blob?.size) {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'outstanding-paymentReport.xlsx';
        a.click();
        URL.revokeObjectURL(a.href);
      } else toast.info('No data found to export.', 'Info');
    } catch {} finally { setExportLoading(false); }
  };

  const handlePrint = async () => {
    setPrintLoading(true);
    try {
      const blob = await reportApi.ledgerOutstandingPrint(getFilters());
      if (blob?.size) {
        const blobUrl = URL.createObjectURL(blob);
        window.open(blobUrl, '_blank');
      } else toast.info('No data to print.', 'Info');
    } catch (err: any) {
      toast.error(err?.message || 'Print failed');
    } finally { setPrintLoading(false); }
  };

  const handleClear = () => {
    setLst([]);
    setUniqueLedLst([]);
    setTotalAmount(0);
    setPendingAmount(0);
    setToDate(new Date().toISOString().split('T')[0]);
  };

  const openInvDetailstPopup = async (rowData: any) => {
    if (rowData.invCode === -1) return;
    try {
      const isFromInvoice = rowData.fromInvoice !== undefined ? rowData.fromInvoice : false;
      const allItems = lst.map(x => ({
        invCode: x.invCode,
        invType: x.invType,
        fromInvoice: x.fromInvoice !== undefined ? x.fromInvoice : false,
        bill_No: x.bill_No || x.billNo,
        partyName: x.partyName || x.ledgerName,
        date: x.date,
        amount: x.pending
      })).filter(x => x.invCode !== -1);
      
      const index = allItems.findIndex(x => x.invCode === rowData.invCode);
      
      setModalType(isFromInvoice ? 'invoice' : 'voucher');
      setSelectedInvCode(rowData.invCode);
      setSelectedInvType(rowData.invType);
      setInvoiceList(allItems);
      setCurrentIndex(index);
      setModalOpen(true);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to load details');
    }
  };

  const isVoucherObject = (value: any): boolean => value && typeof value === 'object' && !Array.isArray(value) ? false : Array.isArray(value);

  return (
    <div className="font-sans text-slate-700 dark:text-slate-200 pt-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="bg-rose-100 dark:bg-rose-900/30 p-2.5 rounded-xl text-rose-600 dark:text-rose-400"><Banknote size={22} /></div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Outstanding Payments</h1>
            <p className="text-xs text-slate-500 font-medium">All pending payment outstanding</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-5 mb-5">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 block">To Date</label>
            <input type="date" value={toDate} onChange={e => setToDate(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all w-44" />
          </div>
          <div className="flex items-center space-x-2 mt-4 md:mt-0">
            <button
              onClick={submitReport} disabled={loading}
              className="w-10 h-10 rounded-lg bg-[#2D9E75] text-white flex items-center justify-center hover:opacity-90 transition-all shadow-sm cursor-pointer disabled:opacity-70"
              title="Search"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
            </button>
            <button
              onClick={handleClear}
              className="w-10 h-10 rounded-lg bg-lime-500 text-white flex items-center justify-center hover:opacity-90 transition-all shadow-sm cursor-pointer"
              title="Reset Filters"
            >
              <RotateCcw size={16} />
            </button>
            <button
              onClick={handlePrint} disabled={printLoading}
              className="w-10 h-10 rounded-lg bg-rose-500 text-white flex items-center justify-center hover:opacity-90 transition-all shadow-sm cursor-pointer disabled:opacity-70"
              title="Print / PDF"
            >
              {printLoading ? <Loader2 size={16} className="animate-spin" /> : <Printer size={16} />}
            </button>
            <button
              onClick={handleExport} disabled={exportLoading}
              className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center hover:opacity-90 transition-all shadow-sm cursor-pointer disabled:opacity-70"
              title="Excel Export"
            >
              {exportLoading ? <Loader2 size={16} className="animate-spin" /> : <FileSpreadsheet size={16} />}
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col items-center justify-center py-16">
          <Loader2 size={28} className="animate-spin text-rose-500 mb-3" />
          <span className="text-sm text-slate-500 font-medium">Loading...</span>
        </div>
      ) : !uniqueLedLst.length ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm text-center py-16">
          <Banknote size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
          <p className="text-slate-500 text-sm">No results yet. Select a date and click Search.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {uniqueLedLst.map((item, idx) => (
            <div key={idx} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-rose-50 to-pink-50 dark:from-slate-800 dark:to-slate-800/80 p-3 border-b border-slate-200 dark:border-slate-700">
                <div className="text-center space-y-0.5">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">{item.ledger.name}</h3>
                  {item.ledger.address && <p className="text-[10px] text-slate-500">{H.formatAddress(item.ledger)}</p>}
                  {item.ledger.mobile && <p className="text-[10px] text-slate-500">Mobile: {item.ledger.mobile}</p>}
                  <p className="text-[10px] text-slate-500">
                    Sales Person: {item.ledger.salesperson || '-'}, Credit Limit: {item.ledger.credit_Limit || 0}, Credit Days: {item.ledger.creditDays || 0}
                  </p>
                  <p className="text-[10px] text-slate-500">Due As on: {H.formatDisplayDate(toDate)}</p>
                </div>
              </div>
              <div className="overflow-auto max-h-[300px]">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 z-10">
                    <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                      <th className="px-4 py-2 text-[10px] font-bold text-slate-500 uppercase">Doc No</th>
                      <th className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase">Date</th>
                      <th className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase">Voucher</th>
                      <th className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase text-right">Amount</th>
                      <th className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase text-right">Pending</th>
                      <th className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase text-center">Over Due</th>
                      <th className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase text-center w-16">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {item.data.map((row: any, ri: number) => (
                      <tr key={ri} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                        <td className="px-4 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400">{row.billNo}</td>
                        <td className="px-3 py-2 text-xs text-slate-500">{H.formatDateShort(row.date)}</td>
                        <td className="px-3 py-2 text-xs text-slate-500">
                          {isVoucherObject(row.voucher)
                            ? (row.voucher as any[]).map((v: any, vi: number) => <div key={vi} className="italic text-[10px]">{v.billNo}</div>)
                            : row.voucher}
                        </td>
                        <td className="px-3 py-2 text-xs font-mono text-right">{H.formatNumber(row.opening, precision)} <span className="text-[9px] text-slate-400">{row.openingDrCr}</span></td>
                        <td className="px-3 py-2 text-xs font-mono font-bold text-right">{H.formatNumber(row.pending, precision)} <span className="text-[9px] text-slate-400">{row.pendingDrCr}</span></td>
                        <td className="px-3 py-2 text-center">
                          <span className={`text-[10px] font-bold ${row.overDue > 90 ? 'text-red-500' : row.overDue > 30 ? 'text-amber-500' : 'text-emerald-500'}`}>{row.overDue}d</span>
                        </td>
                        <td className="px-3 py-2 text-center">
                          {row.invCode !== -1 && (
                            <button onClick={() => openInvDetailstPopup(row)}
                              className="p-1 text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded transition-colors" title="View Details">
                              <Eye size={14} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-3 bg-brand-yellow dark:bg-brand-yellow/10 border-t border-brand-yellow/20 dark:border-brand-yellow/5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <span className="text-xs font-bold text-slate-800 dark:text-brand-yellow/90">Total Rows: {item.data.length}</span>
                  <div className="flex gap-6">
                    <span className="text-xs font-bold text-slate-800 dark:text-brand-yellow/90">Total: <span className="font-mono text-slate-950 dark:text-brand-yellow">{H.formatNumber(H.getLedgerTotals(item.data, precision), precision)}</span></span>
                    <span className="text-xs font-bold text-slate-800 dark:text-brand-yellow/90">Pending: <span className="font-mono text-slate-950 dark:text-brand-yellow">{H.formatNumber(H.getLedgerPending(item.data, precision), precision)}</span></span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Grand totals */}
          <div className="sticky bottom-0 z-10 bg-brand-yellow dark:bg-brand-yellow/10 rounded-xl border border-brand-yellow/20 dark:border-brand-yellow/5 shadow-sm p-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <span className="text-xs font-bold text-slate-800 dark:text-brand-yellow/90 uppercase">Grand Total — {lst.length} rows across {uniqueLedLst.length} ledgers</span>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <span className="text-[10px] text-slate-800/80 dark:text-brand-yellow/70 font-bold uppercase block">Total Amount</span>
                  <span className="text-sm font-bold font-mono text-slate-950 dark:text-brand-yellow">{H.formatNumber(totalAmount, precision)}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-800/80 dark:text-brand-yellow/70 font-bold uppercase block">Pending Amount</span>
                  <span className="text-base font-black font-mono text-slate-950 dark:text-brand-yellow">{H.formatNumber(pendingAmount, precision)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Details Modal */}
      {modalOpen && modalType === 'invoice' && (
        <InvoiceDetailsModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          invCode={selectedInvCode}
          invType={selectedInvType}
          invoiceList={invoiceList}
          currentIndex={currentIndex}
        />
      )}

      {/* Voucher Details Modal */}
      {modalOpen && modalType === 'voucher' && (
        <VoucherDetailsModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          invCode={selectedInvCode}
          invType={selectedInvType}
        />
      )}
    </div>
  );
};
