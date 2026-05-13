import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Search, RotateCcw, FileSpreadsheet, Loader2, ListChecks, Plus, X, Trash2 } from 'lucide-react';
import { reportApi } from '../../../../services/report.service';
import { ledgerApi } from '../../../../services/ledger.service';
import { toast } from '../../../../lib/toast';
import * as H from '../outstandingHelpers';

export const MultipleOutstandingReport: React.FC = () => {
  const precision = H.getPrecision();

  const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);
  const [detailed, setDetailed] = useState(false);
  const [includeChild, setIncludeChild] = useState(false);
  const [allReceipts, setAllReceipts] = useState(false);
  const [allPayments, setAllPayments] = useState(false);
  const [ledgerSearch, setLedgerSearch] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedLedgerList, setSelectedLedgerList] = useState<any[]>([]);
  const [lst, setLst] = useState<any[]>([]);
  const [uniqueLedLst, setUniqueLedLst] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);
  const [pendingAmount, setPendingAmount] = useState(0);
  const [activeTab, setActiveTab] = useState<'search' | 'list' | 'result'>('search');
  const searchRef = useRef<HTMLDivElement>(null);

  const allLedgers = useRef<any[]>([]);
  useEffect(() => { allLedgers.current = H.getFilteredLedgers(); }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowSuggestions(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = (val: string) => {
    setLedgerSearch(val);
    if (val.length < 2) { setSuggestions([]); setShowSuggestions(false); return; }
    const term = val.toLowerCase();
    setSuggestions(allLedgers.current.filter((l: any) => (l.particular || l.name || '').toLowerCase().includes(term)).slice(0, 10));
    setShowSuggestions(true);
  };

  const addLedger = (ledger: any) => {
    if (!selectedLedgerList.find((l: any) => l.ledger_id === ledger.id)) {
      setSelectedLedgerList(prev => [...prev, { ledger_id: ledger.id, name: ledger.name, group: ledger.group }]);
    }
    setLedgerSearch(''); setShowSuggestions(false);
  };

  const removeLedger = (id: any) => setSelectedLedgerList(prev => prev.filter(l => l.ledger_id !== id));

  const getFilters = useCallback(() => {
    const ledgers = selectedLedgerList.map(l => l.ledger_id);
    return {
      ledgers, detailed, includeChild, allReceipts, allPayments,
      toDate: H.formatDateForApi(toDate),
      minDays: null, maxDays: null, assignedUserID: null,
      isOverDueOnBillDate: false, ageDetailed: false, fromDate: null,
    };
  }, [selectedLedgerList, detailed, includeChild, allReceipts, allPayments, toDate]);

  const submitReport = useCallback(async () => {
    if (!allReceipts && !allPayments && !selectedLedgerList.length) {
      toast.info('Please select ledger(s).', 'Validation'); return;
    }
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
            const ledgerData = data.filter((i: any) => i.ledgerId === element.id);
            groups.push({ ledger: element, data: ledgerData });
          }
          setUniqueLedLst(groups);
        } catch { setUniqueLedLst([]); }
        const { totalAmount: ta, pendingAmount: pa } = H.calculateTotals(data, precision);
        setTotalAmount(ta); setPendingAmount(pa);
        setActiveTab('result');
      } else {
        setLst([]); setUniqueLedLst([]);
        toast.info('No outstanding for selected party', 'Info');
      }
    } catch (err: any) {
      setLst([]); setUniqueLedLst([]);
      toast.info(err?.message || 'Error', 'Error');
    } finally { setLoading(false); }
  }, [getFilters, allReceipts, allPayments, selectedLedgerList, precision]);

  const handleExport = async () => {
    setExportLoading(true);
    try {
      const blob = await reportApi.multipleOutstandingExport(getFilters());
      if (blob?.size) { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'multiple-outstanding.xlsx'; a.click(); URL.revokeObjectURL(a.href); }
      else toast.info('No data found to export.', 'Info');
    } catch {} finally { setExportLoading(false); }
  };

  const handleClear = () => {
    setSelectedLedgerList([]); setLst([]); setUniqueLedLst([]);
    setTotalAmount(0); setPendingAmount(0); setDetailed(false); setIncludeChild(false);
    setAllReceipts(false); setAllPayments(false); setActiveTab('search');
    setToDate(new Date().toISOString().split('T')[0]);
  };

  return (
    <div className="font-sans text-slate-700 dark:text-slate-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="bg-teal-100 dark:bg-teal-900/30 p-2.5 rounded-xl text-teal-600 dark:text-teal-400"><ListChecks size={22} /></div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Multiple Outstanding</h1>
            <p className="text-xs text-slate-500 font-medium">Outstanding report for multiple ledgers</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-slate-100 dark:bg-slate-800 rounded-lg p-1 w-fit">
        {(['search', 'list', 'result'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-xs font-bold rounded-md transition-all ${activeTab === tab ? 'bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-400 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            {tab === 'search' ? 'Ledger Search' : tab === 'list' ? `Ledger List (${selectedLedgerList.length})` : 'Results'}
          </button>
        ))}
      </div>

      {/* Search Tab */}
      {activeTab === 'search' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <div className="max-w-lg" ref={searchRef}>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 block">Search & Add Ledger</label>
            <div className="relative">
              <input type="text" value={ledgerSearch} onChange={e => handleSearch(e.target.value)} onFocus={() => suggestions.length && setShowSuggestions(true)}
                placeholder="Type ledger name to search..."
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all" />
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                  {suggestions.map((l, i) => (
                    <div key={i} onClick={() => addLedger(l)} className="px-3 py-2.5 hover:bg-teal-50 dark:hover:bg-slate-700 cursor-pointer border-b border-slate-100 dark:border-slate-700 last:border-0 flex items-center justify-between">
                      <div>
                        <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">{l.name}</div>
                        <div className="text-[10px] text-slate-400">{[l.group, l.area, l.city].filter(Boolean).join(' | ')}</div>
                      </div>
                      <Plus size={14} className="text-teal-500" />
                    </div>
                  ))}
                </div>
              )}
            </div>
            <p className="text-[10px] text-slate-400 mt-2">Click on a ledger to add it to the list. Then switch to "Ledger List" tab.</p>
          </div>

          {/* Quick Options */}
          <div className="mt-6 flex flex-wrap gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <input type="checkbox" id="allReceipts" checked={allReceipts} onChange={e => { setAllReceipts(e.target.checked); if (e.target.checked) setAllPayments(false); }}
                className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500" />
              <label htmlFor="allReceipts" className="text-xs font-semibold text-slate-600 dark:text-slate-300">All Receipts</label>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="allPayments" checked={allPayments} onChange={e => { setAllPayments(e.target.checked); if (e.target.checked) setAllReceipts(false); }}
                className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500" />
              <label htmlFor="allPayments" className="text-xs font-semibold text-slate-600 dark:text-slate-300">All Payments</label>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="detailedMult" checked={detailed} onChange={e => setDetailed(e.target.checked)}
                className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500" />
              <label htmlFor="detailedMult" className="text-xs font-semibold text-slate-600 dark:text-slate-300">Detailed</label>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="inclChild" checked={includeChild} onChange={e => setIncludeChild(e.target.checked)}
                className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500" />
              <label htmlFor="inclChild" className="text-xs font-semibold text-slate-600 dark:text-slate-300">Include Child</label>
            </div>
            <div className="w-[170px]">
              <input type="date" value={toDate} onChange={e => setToDate(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm" />
            </div>
          </div>
        </div>
      )}

      {/* Ledger List Tab */}
      {activeTab === 'list' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="overflow-auto max-h-[calc(100vh-350px)]">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 z-10">
                <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                  <th className="px-4 py-2.5 text-[10px] font-bold text-slate-500 uppercase w-10"></th>
                  <th className="px-4 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Ledger</th>
                  <th className="px-3 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Group</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {selectedLedgerList.length === 0 ? (
                  <tr><td colSpan={3} className="px-4 py-8 text-center text-sm text-slate-400">No ledgers added. Go to "Ledger Search" tab to add.</td></tr>
                ) : selectedLedgerList.map((l, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                    <td className="px-4 py-2">
                      <button onClick={() => removeLedger(l.ledger_id)} className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"><Trash2 size={14} /></button>
                    </td>
                    <td className="px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200">{l.name}</td>
                    <td className="px-3 py-2 text-xs text-slate-500">{l.group}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Total: {selectedLedgerList.length} ledgers</span>
            <div className="flex gap-2">
              <button onClick={() => setActiveTab('search')} className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50">← Back</button>
              <button onClick={() => setSelectedLedgerList([])} className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50"><RotateCcw size={12} className="inline mr-1" />Clear</button>
              <button onClick={submitReport} className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-all shadow-lg shadow-teal-600/20">
                {loading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />} Search
              </button>
              <button onClick={handleExport} className="flex items-center gap-1 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-all">
                {exportLoading ? <Loader2 size={14} className="animate-spin" /> : <FileSpreadsheet size={14} />} Export
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Results Tab */}
      {activeTab === 'result' && (
        <div className="space-y-4">
          {loading ? (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col items-center justify-center py-16">
              <Loader2 size={28} className="animate-spin text-teal-500 mb-3" />
              <span className="text-sm text-slate-500 font-medium">Loading...</span>
            </div>
          ) : !uniqueLedLst.length ? (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm text-center py-16">
              <ListChecks size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
              <p className="text-slate-500 text-sm">No results yet. Add ledgers and search.</p>
            </div>
          ) : (
            <>
              {uniqueLedLst.map((item, idx) => (
                <div key={idx} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                  <div className="bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-slate-800 dark:to-slate-800/80 p-3 border-b border-slate-200 dark:border-slate-700">
                    <div className="text-center space-y-0.5">
                      <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">{item.ledger.name}</h3>
                      {item.ledger.address && <p className="text-[10px] text-slate-500">{H.formatAddress(item.ledger)}</p>}
                      {item.ledger.mobile && <p className="text-[10px] text-slate-500">Mobile: {item.ledger.mobile}</p>}
                    </div>
                  </div>
                  <div className="overflow-auto max-h-[250px]">
                    <table className="w-full text-left border-collapse">
                      <thead className="sticky top-0 z-10">
                        <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                          <th className="px-4 py-2 text-[10px] font-bold text-slate-500 uppercase">Doc No</th>
                          <th className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase">Date</th>
                          <th className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase text-right">Amount</th>
                          <th className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase text-right">Pending</th>
                          <th className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase text-center">Over Due</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {item.data.map((row: any, ri: number) => (
                          <tr key={ri} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                            <td className="px-4 py-2 text-xs font-semibold text-teal-600 dark:text-teal-400">{row.billNo}</td>
                            <td className="px-3 py-2 text-xs text-slate-500">{H.formatDateShort(row.date)}</td>
                            <td className="px-3 py-2 text-xs font-mono text-right">{H.formatNumber(row.opening, precision)} <span className="text-[9px] text-slate-400">{row.openingDrCr}</span></td>
                            <td className="px-3 py-2 text-xs font-mono font-bold text-right">{H.formatNumber(row.pending, precision)} <span className="text-[9px] text-slate-400">{row.pendingDrCr}</span></td>
                            <td className="px-3 py-2 text-center">
                              <span className={`text-[10px] font-bold ${row.overDue > 90 ? 'text-red-500' : row.overDue > 30 ? 'text-amber-500' : 'text-emerald-500'}`}>{row.overDue}d</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}

              {/* Grand totals */}
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <span className="text-xs font-bold text-slate-500 uppercase">Grand Total — {lst.length} rows across {uniqueLedLst.length} ledgers</span>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Amount</span>
                      <span className="text-sm font-bold font-mono">{H.formatNumber(totalAmount, precision)}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Pending Amount</span>
                      <span className="text-base font-black font-mono text-teal-600 dark:text-teal-400">{H.formatNumber(pendingAmount, precision)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
