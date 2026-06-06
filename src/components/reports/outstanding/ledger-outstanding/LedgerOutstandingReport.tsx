import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Search, RotateCcw, FileSpreadsheet, Loader2, Clock, Eye, ChevronDown, X, Printer, CheckCircle, Send } from 'lucide-react';
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
    <div className="font-sans text-slate-700 dark:text-slate-200 pt-4">
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
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-5 mb-5">
        <div className="flex flex-wrap items-end gap-3">
          {/* Ledger Typeahead */}
          <div className="flex-1 min-w-[250px] md:max-w-[350px] relative" ref={searchRef}>
            <div className={`w-full px-3 py-1 bg-white dark:bg-slate-900 border rounded-lg transition-all focus-within:border-yellow-500 focus-within:ring-2 focus-within:ring-yellow-500/20 ${showSuggestions ? "border-yellow-500 ring-2 ring-yellow-500/20" : "border-slate-200 dark:border-slate-700"}`}>
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block select-none mb-0.5 uppercase tracking-wider">
                Select Ledger <span className="text-rose-500">*</span>
              </label>
              <div className="relative flex items-center">
                <input type="text" value={ledgerSearch} onChange={e => handleLedgerSearch(e.target.value)} onFocus={() => suggestions.length && setShowSuggestions(true)}
                  placeholder="Select Ledger"
                  className="w-full bg-transparent border-0 p-0 text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-0 pr-6" />
                {ledgerSearch && (
                  <button type="button" onClick={() => { setLedgerSearch(''); setSelectedLedger(null); setShowSuggestions(false); }} className="absolute right-0 text-blue-600 dark:text-blue-400 hover:text-blue-800 font-extrabold select-none cursor-pointer">
                    <X size={16} className="stroke-[3]" />
                  </button>
                )}
              </div>
            </div>
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-50 top-full mt-1 w-full sm:min-w-[950px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                {suggestions.map((l, i) => (
                  <button key={i} onClick={() => selectLedger(l)} className="w-full text-left transition-colors border-b border-slate-100 dark:border-slate-700 last:border-0 p-0 flex hover:brightness-95 dark:hover:brightness-110 focus:outline-none">
                    <div className="flex w-full text-sm font-medium">
                      <div className="w-[32%] bg-[#fcf8e3] dark:bg-amber-950/40 px-3 py-2 text-slate-800 dark:text-amber-200 font-semibold truncate text-left" title={l.name}>{l.name}</div>
                      <div className="w-[68%] bg-[#d9edf7] dark:bg-blue-950/40 px-3 py-2 flex items-center text-xs text-slate-700 dark:text-blue-200 font-semibold gap-2">
                        <div className="w-[22%] truncate text-left" title={l.group}>{l.group || ''}</div>
                        <div className="w-[24%] truncate text-left" title={l.area}>{l.area || '-'}</div>
                        <div className="w-[16%] truncate text-left" title={l.city}>{l.city || '-'}</div>
                        <div className="w-[20%] truncate text-left" title={l.mobile || l.phone_1 || l.phone_2}>{l.mobile || l.phone_1 || l.phone_2 || '-'}</div>
                        <div className="w-[18%] truncate text-left" title={l.gstNo || l.gstin}>{l.gstNo || l.gstin || '-'}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* To Date */}
          <div className="w-full sm:w-36 shrink-0 space-y-1">
            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              To Date <span className="text-rose-500">*</span>
            </label>
            <input type="date" value={toDate} onChange={e => setToDate(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer" />
          </div>

          {/* Detailed checkbox */}
          <div className="flex items-center gap-2 shrink-0 py-2 xl:py-2.5">
            <input type="checkbox" id="detailed" checked={detailed} onChange={e => setDetailed(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500" />
            <label htmlFor="detailed" className="text-xs font-semibold text-slate-600 dark:text-slate-300">Detailed</label>
          </div>

          {/* Age Type Dropdown */}
          <div className="w-full sm:w-[150px] shrink-0 space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-0.5 block">Age Type</label>
            <select
              value={ageType}
              onChange={e => setAgeType(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
            >
              <option value="1">Weekly</option>
              <option value="2">Monthly</option>
              <option value="3">Quarterly</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="flex items-center space-x-2 shrink-0 pb-0.5 ml-auto">
            <button onClick={submitReport} disabled={loading} className="w-10 h-10 rounded-lg bg-[#2D9E75] text-white flex items-center justify-center hover:opacity-90 transition-all shadow-sm disabled:opacity-70 cursor-pointer" title="Search">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
            </button>
            <button onClick={handleClear} className="w-10 h-10 rounded-lg bg-lime-500 text-white flex items-center justify-center hover:opacity-90 transition-all shadow-sm cursor-pointer" title="Reset Filters">
              <RotateCcw size={16} />
            </button>
            <button disabled className="w-10 h-10 rounded-lg bg-rose-500 text-white flex items-center justify-center hover:opacity-90 transition-all shadow-sm disabled:opacity-70 cursor-pointer" title="PDF Export">
              <Printer size={16} />
            </button>
            <button onClick={handleExport} disabled={exportLoading} className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center hover:opacity-90 transition-all shadow-sm disabled:opacity-70 cursor-pointer" title="Export Excel">
              {exportLoading ? <Loader2 size={16} className="animate-spin" /> : <FileSpreadsheet size={16} />}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col overflow-hidden min-h-[500px]">
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
                <div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-slate-800 dark:to-slate-800/80 p-4 border-b border-slate-200 dark:border-slate-700 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex-1 hidden md:block"></div>
                  <div className="text-center space-y-0.5 flex-1">
                    <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">{item.ledger.name || selectedLedger?.name}</h3>
                    {item.ledger.address && <p className="text-xs text-slate-500">{H.formatAddress(item.ledger)}</p>}
                    {item.ledger.mobile && <p className="text-xs text-slate-500">Mobile: {item.ledger.mobile}</p>}
                    <p className="text-xs text-slate-500 font-semibold">Due As on: {H.formatDisplayDate(toDate)}</p>
                  </div>
                  <div className="flex-1 flex justify-center md:justify-end">
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 p-3 rounded-xl flex flex-col items-end">
                      <p className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest mb-0.5">Total Net Outstanding</p>
                      <p className="text-xl font-black text-slate-900 dark:text-white leading-tight">{currencySymbol} {H.formatNumber(pendingAmount, precision)}</p>
                    </div>
                  </div>
                </div>

                {/* Data Table */}
                <div className="overflow-auto max-h-[calc(100vh-450px)]">
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

            {/* Sticky Footer */}
            <div className="sticky bottom-0 mt-auto z-40 bg-brand-yellow dark:bg-brand-yellow/10 border-t border-brand-yellow/20 dark:border-brand-yellow/5 py-4 px-6 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] backdrop-blur-md">
              <div className="flex flex-wrap items-center justify-between gap-6">
                <div className="flex items-center gap-8">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-400/20 rounded-lg text-slate-800 dark:text-brand-yellow">
                      <Clock size={22} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-800/80 dark:text-brand-yellow/70 uppercase tracking-widest">Balance Outstanding</p>
                      <p className="text-xl font-black text-slate-950 dark:text-brand-yellow leading-tight tracking-tight">{currencySymbol} {H.formatNumber(pendingAmount, precision)}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button type="button" className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 text-white rounded-lg text-sm font-bold hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20 cursor-pointer">
                    <Send size={18} />
                    Send Reminder
                  </button>
                  <div className="hidden sm:block w-px h-8 bg-yellow-400/50 dark:bg-brand-yellow/20 mx-2"></div>
                  <span className="hidden sm:block text-xs font-bold text-slate-800 dark:text-brand-yellow/90 uppercase">Total Rows: {lst.length}</span>
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
