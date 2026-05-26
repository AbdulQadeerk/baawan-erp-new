import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Search, RotateCcw, FileSpreadsheet, Loader2, Clock, Eye, ChevronDown } from 'lucide-react';
import { reportApi } from '../../../../services/report.service';
import { ledgerApi } from '../../../../services/ledger.service';
import { toast } from '../../../../lib/toast';
import * as H from '../outstandingHelpers';
import { InvoiceDetailsModal } from '../../InvoiceDetailsModal';

export const LedgerOutstandingReport: React.FC = () => {
  const precision = H.getPrecision();
  const currencySymbol = H.getCurrencySymbol();

  const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);
  const [detailed, setDetailed] = useState(false);
  const [ageType, setAgeType] = useState('1'); // 1: Weekly, 2: Monthly, 3: Quarterly
  const [ledgerSearch, setLedgerSearch] = useState('');
  const [selectedLedger, setSelectedLedger] = useState<any>(null);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [lst, setLst] = useState<any[]>([]);
  const [uniqueLedLst, setUniqueLedLst] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);
  const [pendingAmount, setPendingAmount] = useState(0);
  const [selectedInvoice, setSelectedInvoice] = useState<{ invCode: number, invType: number } | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Load ledgers from localStorage
  const allLedgers = useRef<any[]>([]);
  useEffect(() => {
    allLedgers.current = H.getFilteredLedgers();
  }, []);

  // Close suggestions on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowSuggestions(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLedgerSearch = (val: string) => {
    setLedgerSearch(val);
    setSelectedLedger(null);
    if (val.length < 2) { setSuggestions([]); setShowSuggestions(false); return; }
    const term = val.toLowerCase();
    const results = allLedgers.current
      .filter((l: any) => (l.particular || l.name || '').toLowerCase().includes(term))
      .slice(0, 10);
    setSuggestions(results);
    setShowSuggestions(true);
  };

  const selectLedger = (ledger: any) => {
    setSelectedLedger(ledger);
    setLedgerSearch(ledger.name);
    setShowSuggestions(false);
  };

  const getFilters = useCallback(() => ({
    ledgers: [selectedLedger?.id],
    detailed,
    toDate: H.formatDateForApi(toDate),
    isOverDueOnBillDate: false,
  }), [selectedLedger, detailed, toDate]);

  const submitReport = useCallback(async () => {
    if (!selectedLedger) { toast.info('Please select a ledger', 'Validation'); return; }
    if (!toDate) { toast.info('Please select To Date', 'Validation'); return; }
    setLoading(true);
    try {
      const data = await reportApi.ledgerOutstanding(getFilters());
      if (data?.length) {
        const sorted = data.sort((a: any, b: any) => b.overDue - a.overDue);
        setLst(sorted);
        // Get ledger info
        const uniqueIds = [...new Set(sorted.map((i: any) => i.ledgerId))];
        try {
          const res = await ledgerApi.multiLedgerInfo({ ledgers: uniqueIds });
          const groups: any[] = [];
          for (const element of res) {
            const ledgerData = sorted.filter((i: any) => i.ledgerId === element.id);
            groups.push({ ledger: element, data: ledgerData });
          }
          setUniqueLedLst(groups);
        } catch {
          setUniqueLedLst([{ ledger: selectedLedger, data: sorted }]);
        }
        const { totalAmount: ta, pendingAmount: pa } = H.calculateTotals(sorted, precision);
        setTotalAmount(ta); setPendingAmount(pa);
      } else {
        setLst([]); setUniqueLedLst([]);
        toast.info('No outstanding for selected party', 'Info');
      }
    } catch (err: any) {
      setLst([]); setUniqueLedLst([]);
      toast.info(err?.message || 'Error loading data', 'Error');
    } finally { setLoading(false); }
  }, [getFilters, selectedLedger, toDate, precision]);

  const handleExport = async () => {
    if (!selectedLedger) { toast.info('Please select a ledger', 'Validation'); return; }
    setExportLoading(true);
    try {
      const blob = await reportApi.ledgerOutstandingExport(getFilters());
      if (blob?.size) {
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
        a.download = 'ledger-outstanding.xlsx'; a.click(); URL.revokeObjectURL(a.href);
      } else toast.info('No data found to export.', 'Info');
    } catch {} finally { setExportLoading(false); }
  };

  const handleClear = () => {
    setLedgerSearch(''); setSelectedLedger(null); setLst([]); setUniqueLedLst([]);
    setTotalAmount(0); setPendingAmount(0); setDetailed(false); setAgeType('1');
    setToDate(new Date().toISOString().split('T')[0]);
  };

  return (
    <div className="font-sans text-slate-700 dark:text-slate-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2.5 rounded-xl text-indigo-600 dark:text-indigo-400">
            <Clock size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Ledger Outstanding</h1>
            <p className="text-xs text-slate-500 font-medium">Outstanding bills for a single ledger</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 mb-4">
        <div className="flex flex-wrap xl:flex-nowrap items-start xl:items-end gap-4">
          {/* Ledger Typeahead */}
          <div className="w-full sm:w-64 xl:w-80 shrink-0" ref={searchRef}>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 block">Select Ledger <span className="text-red-500">*</span></label>
            <div className="relative">
              <input type="text" value={ledgerSearch} onChange={e => handleLedgerSearch(e.target.value)} onFocus={() => suggestions.length && setShowSuggestions(true)}
                placeholder="Type to search ledger..."
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" />
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                  {suggestions.map((l, i) => (
                    <div key={i} onClick={() => selectLedger(l)}
                      className="px-3 py-2 hover:bg-indigo-50 dark:hover:bg-slate-700 cursor-pointer border-b border-slate-100 dark:border-slate-700 last:border-0">
                      <div className="flex justify-between">
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{l.name}</span>
                        <span className="text-[10px] text-slate-400">{l.group}</span>
                      </div>
                      {(l.area || l.city) && <span className="text-[10px] text-slate-400">{[l.area, l.city].filter(Boolean).join(', ')}</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* To Date */}
          <div className="w-full sm:w-[170px] shrink-0">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 block">To Date <span className="text-red-500">*</span></label>
            <input type="date" value={toDate} onChange={e => setToDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" />
          </div>

          {/* Detailed checkbox */}
          <div className="flex items-center gap-2 shrink-0 py-2 xl:py-2.5">
            <input type="checkbox" id="detailed" checked={detailed} onChange={e => setDetailed(e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" />
            <label htmlFor="detailed" className="text-xs font-semibold text-slate-600 dark:text-slate-300">Detailed</label>
          </div>

          {/* Age Type Dropdown */}
          <div className="w-full sm:w-[150px] shrink-0">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 block">Age Type</label>
            <select
              value={ageType}
              onChange={e => setAgeType(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all appearance-none"
            >
              <option value="1">Weekly</option>
              <option value="2">Monthly</option>
              <option value="3">Quarterly</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="flex items-center space-x-2 shrink-0 pt-4 xl:pt-1 xl:ml-auto">
            <button
              onClick={submitReport}
              className="w-10 h-10 rounded-lg bg-[#2D9E75] text-white flex items-center justify-center hover:opacity-90 transition-all shadow-sm cursor-pointer"
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
              onClick={handleExport}
              className="w-10 h-10 rounded-lg bg-rose-500 text-white flex items-center justify-center hover:opacity-90 transition-all shadow-sm cursor-pointer"
              title="Export"
            >
              {exportLoading ? <Loader2 size={16} className="animate-spin" /> : <FileSpreadsheet size={16} />}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 size={28} className="animate-spin text-indigo-500 mb-3" />
            <span className="text-sm text-slate-500 font-medium">Loading outstanding data...</span>
          </div>
        ) : !lst.length ? (
          <div className="text-center py-16">
            <Clock size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
            <p className="text-slate-500 text-sm">Select a ledger and click Search to view outstanding.</p>
          </div>
        ) : (
          <>
            {uniqueLedLst.map((item, idx) => (
              <div key={idx} className="mb-4">
                {/* Ledger Info Header */}
                <div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-slate-800 dark:to-slate-800/80 p-4 border-b border-slate-200 dark:border-slate-700">
                  <div className="text-center space-y-0.5">
                    <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">{item.ledger.name || selectedLedger?.name}</h3>
                    {item.ledger.address && <p className="text-xs text-slate-500">{H.formatAddress(item.ledger)}</p>}
                    {item.ledger.mobile && <p className="text-xs text-slate-500">Mobile: {item.ledger.mobile}</p>}
                    <p className="text-xs text-slate-500 font-semibold">Due As on: {H.formatDisplayDate(toDate)}</p>
                  </div>
                </div>

                {/* Data Table */}
                <div className="overflow-auto max-h-[calc(100vh-420px)]">
                  <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 z-10">
                      <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                        <th className="px-4 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Doc No</th>
                        <th className="px-3 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Date</th>
                        {detailed && <th className="px-3 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Voucher Details</th>}
                        <th className="px-3 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Amount</th>
                        <th className="px-3 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Pending</th>
                        <th className="px-3 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">Over Due</th>
                        <th className="px-2 py-2.5 w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {item.data.map((row: any, ri: number) => (
                        <tr key={ri} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="px-4 py-2.5 text-sm font-semibold text-indigo-600 dark:text-indigo-400">{row.billNo}</td>
                          <td className="px-3 py-2.5 text-xs text-slate-600 dark:text-slate-400">{H.formatDateShort(row.date)}</td>
                          {detailed && (
                            <td className="px-3 py-2.5 text-xs text-slate-500 max-w-[300px]">
                              {Array.isArray(row.voucher) ? row.voucher.map((v: any, vi: number) => (
                                <div key={vi} className="text-[11px] italic">{v.invtype || ''} {v.billNo} {v.date || ''} <b>{v.amount || ''}</b></div>
                              )) : row.voucher || ''}
                            </td>
                          )}
                          <td className="px-3 py-2.5 text-sm font-mono text-right text-slate-700 dark:text-slate-300">
                            {H.formatNumber(row.opening, precision)} <span className="text-[10px] text-slate-400">{row.openingDrCr}</span>
                          </td>
                          <td className="px-3 py-2.5 text-sm font-mono font-bold text-right text-slate-800 dark:text-slate-200">
                            {H.formatNumber(row.pending, precision)} <span className="text-[10px] text-slate-400">{row.pendingDrCr}</span>
                          </td>
                          <td className="px-3 py-2.5 text-center">
                            <span className={`inline-block px-2 py-0.5 text-xs font-bold rounded-full ${
                              row.overDue > 90 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                              : row.overDue > 30 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                              : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                            }`}>{row.overDue} days</span>
                          </td>
                          <td className="px-2 py-2.5 text-center">
                            {row.invCode && row.invCode > 0 && row.invType ? (
                              <button 
                                onClick={() => setSelectedInvoice({ invCode: row.invCode, invType: row.invType })}
                                className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-md transition-colors"
                                title="View Invoice"
                              >
                                <Eye size={16} />
                              </button>
                            ) : null}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}

            {/* Totals Footer */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <span className="text-xs font-bold text-slate-500 uppercase">Total Rows: {lst.length}</span>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Amount</span>
                    <span className="text-sm font-bold font-mono text-slate-800 dark:text-slate-200">{H.formatNumber(totalAmount, precision)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Pending Amount</span>
                    <span className="text-base font-black font-mono text-indigo-600 dark:text-indigo-400">{H.formatNumber(pendingAmount, precision)}</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Invoice Detail Modal */}
      <InvoiceDetailsModal 
        isOpen={selectedInvoice !== null}
        onClose={() => setSelectedInvoice(null)}
        invCode={selectedInvoice?.invCode || 0} 
        invType={selectedInvoice?.invType || 1} 
        invoiceList={lst.filter(r => r.invCode && r.invType).map(r => ({ Invcode: r.invCode, TypeId: r.invType }))}
        currentIndex={lst.filter(r => r.invCode && r.invType).findIndex(r => r.invCode === selectedInvoice?.invCode && r.invType === selectedInvoice?.invType)}
      />
    </div>
  );
};
