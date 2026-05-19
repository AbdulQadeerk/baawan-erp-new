import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, Eraser, FileDown, Printer, Eye } from 'lucide-react';
import { reportApi } from '../../../../services/report.service';
import { commonApi } from '../../../../services/common.service';
import { ledgerApi } from '../../../../services/ledger.service';
import { toast } from '../../../../lib/toast';
import * as H from '../outstandingHelpers';

import { InvoiceDetailsModal } from '../../InvoiceDetailsModal';
import { VoucherDetailsModal } from '../../../../shared/VoucherDetailsModal';
import { invoiceApi } from '../../../../services/invoice.service';

export const LedgerWiseOutstandingReport: React.FC = () => {
  const precision = H.getPrecision();

  const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);
  const [limits, setLimits] = useState<number | ''>(10);
  const [minDays, setMinDays] = useState<number | ''>('');
  const [maxDays, setMaxDays] = useState<number | ''>('');
  
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
    dateTo: H.formatDateForApi(toDate) + ' 23:59:59',
    resultType: 1,
    minDays: minDays !== '' ? minDays : null,
    maxDays: maxDays !== '' ? maxDays : null,
    limits: limits !== '' ? limits : 10,
    ledgers: [],
  }), [toDate, minDays, maxDays, limits]);

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
        a.download = 'ledger-wise-outstandingReport.xlsx';
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
    setLimits(10);
    setMinDays('');
    setMaxDays('');
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
        partyName: x.partyName || x.ledgerName || x.party,
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

  const FormatNumberValOpening = (row: any) =>
    `${H.formatNumber(row.opening, precision)} ${row.openingDrCr}`;

  const FormatNumberValPending = (row: any) =>
    `${H.formatNumber(row.pending, precision)} ${row.pendingDrCr}`;

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900/50">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Ledger Wise Outstanding</h1>
        </div>
      </div>

      <div className="p-6">
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-5">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            <div className="md:col-span-2">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">To Date</label>
              <input
                type="date"
                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Limits</label>
              <input
                type="number"
                placeholder="Limits"
                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                value={limits}
                onChange={(e) => setLimits(e.target.value ? Number(e.target.value) : '')}
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Min Days</label>
              <input
                type="number"
                placeholder="Min Days"
                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                value={minDays}
                onChange={(e) => setMinDays(e.target.value ? Number(e.target.value) : '')}
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Max Days</label>
              <input
                type="number"
                placeholder="Max Days"
                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                value={maxDays}
                onChange={(e) => setMaxDays(e.target.value ? Number(e.target.value) : '')}
              />
            </div>

            <div className="md:col-span-4 flex items-center justify-end gap-2">
              <button
                onClick={submitReport}
                disabled={loading}
                title="Search"
                className="w-10 h-10 flex items-center justify-center bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors shadow-sm disabled:opacity-70"
              >
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Search size={18} />}
              </button>
              
              <button
                onClick={handleClear}
                title="Clear"
                className="w-10 h-10 flex items-center justify-center bg-lime-600 hover:bg-lime-700 text-white rounded-lg transition-colors shadow-sm"
              >
                <Eraser size={18} />
              </button>
              
              <button
                onClick={handleExport}
                disabled={exportLoading || loading || !lst.length}
                title="Export"
                className="w-10 h-10 flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors shadow-sm disabled:opacity-70"
              >
                {exportLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FileDown size={18} />}
              </button>
              
              <button
                onClick={handlePrint}
                disabled={printLoading || loading || !lst.length}
                title="Print"
                className="w-10 h-10 flex items-center justify-center bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors shadow-sm disabled:opacity-70"
              >
                {printLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Printer size={18} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {lst.length > 0 && (
        <div className="px-6 pb-6 flex-1 flex flex-col min-h-0">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col h-full overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {uniqueLedLst.map((group, idx) => (
                <div key={idx} className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-4 border-b border-slate-200 dark:border-slate-700 text-center">
                    <h3 className="font-black text-lg text-slate-800 dark:text-slate-100">{group.ledger.name}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                      {group.ledger.address}, {group.ledger.area}, {group.ledger.city} - {group.ledger.stateName} {group.ledger.pinCode}
                    </p>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mt-1">Mobile No: {group.ledger.mobile || '-'}</p>
                    <p className="text-xs font-bold text-slate-500 mt-2 flex items-center justify-center gap-4 flex-wrap">
                      <span className="bg-white dark:bg-slate-800 px-2 py-1 rounded shadow-sm border border-slate-200 dark:border-slate-700">Sales Person: {group.ledger.salesperson}</span>
                      <span className="bg-white dark:bg-slate-800 px-2 py-1 rounded shadow-sm border border-slate-200 dark:border-slate-700">Credit Limit: {group.ledger.credit_Limit}</span>
                      <span className="bg-white dark:bg-slate-800 px-2 py-1 rounded shadow-sm border border-slate-200 dark:border-slate-700">Credit Days: {group.ledger.creditDays}</span>
                      <span className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-1 rounded shadow-sm border border-blue-200 dark:border-blue-800">Due As on: {H.formatDateForApi(toDate)}</span>
                    </p>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-slate-100/50 dark:bg-slate-800/30 border-b border-slate-200 dark:border-slate-700 text-slate-500">
                        <tr>
                          <th className="px-4 py-3 font-semibold w-40">Doc No</th>
                          <th className="px-4 py-3 font-semibold w-28">Date</th>
                          <th className="px-4 py-3 font-semibold">Voucher</th>
                          <th className="px-4 py-3 font-semibold text-right w-36">Amount</th>
                          <th className="px-4 py-3 font-semibold text-right w-36">Pending</th>
                          <th className="px-4 py-3 font-semibold text-center w-36">Over Due (Days)</th>
                          <th className="px-4 py-3 font-semibold text-center w-16"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                        {group.data.map((row: any, i: number) => (
                          <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                            <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">
                              {row.billNo || row.bill_No}
                            </td>
                            <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                              {H.formatDateForDisplay(row.date)}
                            </td>
                            <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                              {typeof row.voucher === 'string' ? row.voucher : (
                                <div className="space-y-1">
                                  {Array.isArray(row.voucher) && row.voucher.map((v: any, vi: number) => (
                                    <div key={vi} className="flex gap-4 text-xs">
                                      <span className="w-24 font-medium">{v.billNo}</span>
                                      <span className="w-20">{v.date}</span>
                                      <span className="w-20">{v.invtype}</span>
                                      <span className="font-bold text-slate-700 dark:text-slate-300">{v.amount}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-3 text-right font-medium text-slate-800 dark:text-slate-200">
                              {FormatNumberValOpening(row)}
                            </td>
                            <td className="px-4 py-3 text-right font-medium text-slate-800 dark:text-slate-200">
                              {FormatNumberValPending(row)}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={`inline-flex px-2 py-1 rounded text-xs font-bold ${
                                row.overDue > 0 
                                  ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' 
                                  : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                              }`}>
                                {row.overDue}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              {row.invCode !== -1 && (
                                <button
                                  onClick={() => openInvDetailstPopup(row)}
                                  className="p-1.5 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30 rounded transition-colors"
                                  title="View Details"
                                >
                                  <Eye size={16} />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="bg-slate-50 dark:bg-slate-800/80 p-4 border-t border-slate-200 dark:border-slate-700 shrink-0">
              <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-medium">Total Rows:</span>
                  <span className="font-black text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-900 px-2 py-1 rounded border border-slate-200 dark:border-slate-700">{lst.length}</span>
                </div>
                <div className="flex gap-6">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 font-medium uppercase tracking-wider text-xs">Total Amount:</span>
                    <span className="font-black text-lg text-emerald-600 dark:text-emerald-400">{H.formatNumber(totalAmount, precision)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 font-medium uppercase tracking-wider text-xs">Pending Amount:</span>
                    <span className="font-black text-lg text-rose-600 dark:text-rose-400">{H.formatNumber(pendingAmount, precision)}</span>
                  </div>
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
