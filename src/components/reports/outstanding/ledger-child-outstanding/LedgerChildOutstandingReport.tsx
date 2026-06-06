import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Search, RotateCcw, FileSpreadsheet, Loader2, Users, Eye, X, Printer } from 'lucide-react';
import { reportApi } from '../../../../services/report.service';
import { ledgerApi } from '../../../../services/ledger.service';
import { toast } from '../../../../lib/toast';
import * as H from '../outstandingHelpers';
import { InvoiceDetailsModal } from '../../InvoiceDetailsModal';

export const LedgerChildOutstandingReport: React.FC = () => {
  const precision = H.getPrecision();

  const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);
  const [includeChild, setIncludeChild] = useState(true);
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
  const [selectedInvoice, setSelectedInvoice] = useState<{ invCode: number | string; invType: number } | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const allLedgers = useRef<any[]>([]);
  useEffect(() => { allLedgers.current = H.getFilteredLedgers(); }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowSuggestions(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLedgerSearch = (val: string) => {
    setLedgerSearch(val); setSelectedLedger(null);
    if (val.length < 2) { setSuggestions([]); setShowSuggestions(false); return; }
    const term = val.toLowerCase();
    setSuggestions(allLedgers.current.filter((l: any) => (l.particular || l.name || '').toLowerCase().includes(term)).slice(0, 10));
    setShowSuggestions(true);
  };

  const selectLedger = (ledger: any) => { setSelectedLedger(ledger); setLedgerSearch(ledger.name); setShowSuggestions(false); };

  const getFilters = useCallback(() => ({
    ledgers: [selectedLedger?.id],
    toDate: H.formatDateForApi(toDate),
    includeChild,
  }), [selectedLedger, toDate, includeChild]);

  const submitReport = useCallback(async () => {
    if (!selectedLedger) { toast.info('Please select a ledger', 'Validation'); return; }
    setLoading(true);
    try {
      const data = await reportApi.ledgerOutstanding(getFilters());
      if (data?.length) {
        const sorted = data.sort((a: any, b: any) => b.overDue - a.overDue);
        setLst(sorted);
        const uniqueIds = [...new Set(sorted.map((i: any) => i.ledgerId))];
        try {
          const res = await ledgerApi.multiLedgerInfo({ ledgers: uniqueIds });
          const groups: any[] = [];
          for (const element of res) {
            element.stateName = element.stateName || '';
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
        setLst([]); setUniqueLedLst([]); toast.info('No outstanding for selected party', 'Info');
      }
    } catch (err: any) {
      setLst([]); setUniqueLedLst([]); toast.info(err?.message || 'Error', 'Error');
    } finally { setLoading(false); }
  }, [getFilters, selectedLedger, precision]);

  const handleExport = async () => {
    if (!selectedLedger) { toast.info('Please select a ledger', 'Validation'); return; }
    setExportLoading(true);
    try {
      const blob = await reportApi.ledgerOutstandingExport(getFilters());
      if (blob?.size) { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'ledger-child-outstanding.xlsx'; a.click(); URL.revokeObjectURL(a.href); }
      else toast.info('No data found to export.', 'Info');
    } catch {} finally { setExportLoading(false); }
  };

  const handleClear = () => {
    setLedgerSearch(''); setSelectedLedger(null); setLst([]); setUniqueLedLst([]);
    setTotalAmount(0); setPendingAmount(0); setIncludeChild(true);
    setToDate(new Date().toISOString().split('T')[0]);
  };

  return (
    <div className="font-sans text-slate-700 dark:text-slate-200 pt-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="bg-violet-100 dark:bg-violet-900/30 p-2.5 rounded-xl text-violet-600 dark:text-violet-400"><Users size={22} /></div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Ledger Child Outstanding</h1>
            <p className="text-xs text-slate-500 font-medium">Outstanding with child ledger breakdown</p>
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
              To Date
            </label>
            <input type="date" value={toDate} onChange={e => setToDate(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer" />
          </div>

          {/* Include Child Checkbox */}
          <div className="flex items-center gap-2 shrink-0 py-2 xl:py-2.5">
            <input type="checkbox" id="includeChild" checked={includeChild} onChange={e => setIncludeChild(e.target.checked)} className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer" />
            <label htmlFor="includeChild" className="text-xs font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap cursor-pointer">Include Child Ledger</label>
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
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col items-center justify-center py-16">
            <Loader2 size={28} className="animate-spin text-violet-500 mb-3" />
            <span className="text-sm text-slate-500 font-medium">Loading outstanding data...</span>
          </div>
        ) : !lst.length ? (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm text-center py-16">
            <Users size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
            <p className="text-slate-500 text-sm">Select a ledger and click Search to view outstanding.</p>
          </div>
        ) : (
          <>
            {uniqueLedLst.map((item, idx) => (
              <div key={idx} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                {/* Ledger Info */}
                <div className="bg-gradient-to-r from-violet-50 to-purple-50 dark:from-slate-800 dark:to-slate-800/80 p-4 border-b border-slate-200 dark:border-slate-700">
                  <div className="text-center space-y-0.5">
                    <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">{item.ledger.name}</h3>
                    {item.ledger.address && <p className="text-xs text-slate-500">{H.formatAddress(item.ledger)}</p>}
                    {item.ledger.mobile && <p className="text-xs text-slate-500">Mobile: {item.ledger.mobile}</p>}
                    <p className="text-xs text-slate-500 font-semibold">
                      Sales Person: {item.ledger.salesperson || '-'} | Credit Limit: {item.ledger.credit_Limit || 0} | Credit Days: {item.ledger.creditDays || 0}
                    </p>
                    <p className="text-xs text-slate-500 font-semibold">Due As on: {H.formatDisplayDate(toDate)}</p>
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-auto max-h-[350px]">
                  <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 z-10">
                      <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                        <th className="px-4 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Bill No</th>
                        <th className="px-3 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Date</th>
                        <th className="px-3 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Voucher</th>
                        <th className="px-3 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Amount</th>
                        <th className="px-3 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Pending</th>
                        <th className="px-3 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">Over Due (Days)</th>
                        <th className="px-3 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center w-16">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {item.data.map((row: any, ri: number) => (
                        <tr key={ri} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="px-4 py-2 text-sm font-semibold text-violet-600 dark:text-violet-400">{row.billNo}</td>
                          <td className="px-3 py-2 text-xs text-slate-600 dark:text-slate-400">{H.formatDateShort(row.date)}</td>
                          <td className="px-3 py-2 text-xs text-slate-600 dark:text-slate-400">{row.voucher}</td>
                          <td className="px-3 py-2 text-sm font-mono text-right">{H.formatNumber(row.opening, precision)}</td>
                          <td className="px-3 py-2 text-sm font-mono font-bold text-right">{H.formatNumber(row.pending, precision)}</td>
                          <td className="px-3 py-2 text-center">
                            <span className={`inline-block px-2 py-0.5 text-xs font-bold rounded-full ${
                              row.overDue > 90 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                              : row.overDue > 30 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                              : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                            }`}>{row.overDue}</span>
                          </td>
                          <td className="px-3 py-2 text-center">
                            {(row.invCode !== -1 && row.invcode !== -1) && (
                              <button 
                                onClick={() => setSelectedInvoice({ invCode: row.invCode || row.invcode, invType: row.type_ID || row.typeId || 1 })}
                                className="p-1 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded cursor-pointer"
                                title="View Details"
                              >
                                <Eye size={14} />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Per-ledger totals */}
                <div className="p-3 bg-brand-yellow dark:bg-brand-yellow/10 border-t border-brand-yellow/20 dark:border-brand-yellow/5 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-800 dark:text-brand-yellow/90">Total Rows: {item.data.length}</span>
                  <div className="flex gap-6">
                    <span className="text-xs font-bold text-slate-800 dark:text-brand-yellow/90">Total Amount: <span className="font-mono text-slate-950 dark:text-brand-yellow">{H.formatNumber(H.getLedgerTotals(item.data, precision), precision)}</span></span>
                    <span className="text-xs font-bold text-slate-800 dark:text-brand-yellow/90">Pending: <span className="font-mono text-slate-950 dark:text-brand-yellow">{H.formatNumber(H.getLedgerPending(item.data, precision), precision)}</span></span>
                  </div>
                </div>
              </div>
            ))}
 
            {/* Grand totals */}
            <div className="bg-brand-yellow dark:bg-brand-yellow/10 rounded-xl border border-brand-yellow/20 dark:border-brand-yellow/5 shadow-sm p-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <span className="text-xs font-bold text-slate-800 dark:text-brand-yellow/90 uppercase">Grand Total — {lst.length} rows</span>
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
          </>
        )}
      </div>

      {/* Invoice Detail Modal */}
      <InvoiceDetailsModal 
        isOpen={selectedInvoice !== null}
        onClose={() => setSelectedInvoice(null)}
        invCode={selectedInvoice?.invCode || 0} 
        invType={selectedInvoice?.invType || 1} 
        invoiceList={lst.filter(r => (r.invCode || r.invcode) && (r.type_ID || r.typeId)).map(r => ({ Invcode: r.invCode || r.invcode, TypeId: r.type_ID || r.typeId }))}
        currentIndex={lst.filter(r => (r.invCode || r.invcode) && (r.type_ID || r.typeId)).findIndex(r => (r.invCode || r.invcode) === selectedInvoice?.invCode && (r.type_ID || r.typeId) === selectedInvoice?.invType)}
      />
    </div>
  );
};
