import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Search, RotateCcw, FileSpreadsheet, Loader2, ListChecks, Plus, X, Trash2, FilePlus, ArrowRight } from 'lucide-react';
import { reportApi } from '../../../../services/report.service';
import { ledgerApi } from '../../../../services/ledger.service';
import { groupApi } from '../../../../services/group.service';
import { commonApi } from '../../../../services/common.service';
import { toast } from '../../../../lib/toast';
import * as H from '../outstandingHelpers';

export const MultipleOutstandingReport: React.FC = () => {
  const precision = H.getPrecision();

  const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);
  const [detailed, setDetailed] = useState(false);
  const [includeChild, setIncludeChild] = useState(true);
  const [allReceipts, setAllReceipts] = useState(false);
  const [allPayments, setAllPayments] = useState(false);
  const [ledgerSearch, setLedgerSearch] = useState('');
  const [selectedLedgerList, setSelectedLedgerList] = useState<any[]>([]);
  const [lst, setLst] = useState<any[]>([]);
  const [uniqueLedLst, setUniqueLedLst] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);
  const [pendingAmount, setPendingAmount] = useState(0);
  const [activeTab, setActiveTab] = useState<'search' | 'list' | 'result'>('search');
  const searchRef = useRef<HTMLDivElement>(null);
  
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedSalesPerson, setSelectedSalesPerson] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedInSearch, setSelectedInSearch] = useState<Set<any>>(new Set());
  const [isSearchLoading, setIsSearchLoading] = useState(false);

  const allLedgers = useRef<any[]>([]);
  const [groupList, setGroupList] = useState<any[]>([]);
  const [salesPersonList, setSalesPersonList] = useState<any[]>([]);

  useEffect(() => {
    allLedgers.current = H.getFilteredLedgers();

    // Fetch Groups - matching Angular getGroupList() logic
    groupApi.search({}).then(data => {
      const allGroups = data?.list || [];
      const parentGroups = allGroups.filter((x: any) => x.id === 16 || x.id === 17);
      const childGroups: number[] = [];
      
      const getChildIds = (parentId: number, list: any[], result: number[]) => {
        const children = list.filter((g: any) => g.parentGroup === parentId || g.parentId === parentId);
        children.forEach((child: any) => {
          if (result.indexOf(child.id) === -1) {
            result.push(child.id);
            getChildIds(child.id, list, result);
          }
        });
      };

      parentGroups.forEach((v: any) => {
        childGroups.push(v.id);
        getChildIds(v.id, allGroups, childGroups);
      });

      const filtered = allGroups.filter((x: any) => childGroups.indexOf(x.id) !== -1);
      setGroupList(filtered.sort((a: any, b: any) => a.name.localeCompare(b.name)));
    }).catch(() => {
      // Fallback to local storage if API fails, as per helper
      const localGroups = H.getFilteredGroups(); // Need to check if this exists or just use local storage directly
      if (localGroups.length) setGroupList(localGroups);
    });

    // Fetch Sales Persons - matching Angular listSalesPerson() (table 18)
    commonApi.getDropdown({ table: 18 }).then(data => {
      setSalesPersonList(data || []);
    }).catch(() => {});
  }, []);


  const handleSearch = async () => {
    setIsSearchLoading(true);
    try {
      const formatDt = (dtStr: string, time: string) => {
        if (!dtStr) return null;
        const [y, m, d] = dtStr.split('-');
        return `${d}/${m}/${y} ${time}`;
      };

      const payload = {
        isSync: false,
        name: ledgerSearch || null,
        assignedUserID: selectedSalesPerson || null,
        groups: selectedGroup ? [selectedGroup] : [],
        includeChildGroups: includeChild,
        toDate: formatDt(toDate, '23:59:59'),
        lockFreeze: false
      };

      const result = await ledgerApi.search(payload);
      const list = result?.list || result?.data?.list || (Array.isArray(result) ? result : []);
      
      const normalizedList = list.map((item: any) => ({
        ...item,
        id: item.ledger_id || item.id,
      }));

      setSearchResults(normalizedList);
      setSelectedInSearch(new Set());
    } catch (err: any) {
      toast.error(err?.message || 'Failed to search ledgers');
      setSearchResults([]);
    } finally {
      setIsSearchLoading(false);
    }
  };

  const handleResetSearch = () => {
    setLedgerSearch('');
    setSelectedGroup('');
    setSelectedSalesPerson('');
    setToDate(new Date().toISOString().split('T')[0]);
    setSearchResults([]);
    setSelectedInSearch(new Set());
  };

  const toggleSearchSelection = (ledgerId: any) => {
    setSelectedInSearch(prev => {
      const newSet = new Set(prev);
      if (newSet.has(ledgerId)) newSet.delete(ledgerId);
      else newSet.add(ledgerId);
      return newSet;
    });
  };

  const toggleAllSearchSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedInSearch(new Set(searchResults.map(l => l.id)));
    } else {
      setSelectedInSearch(new Set());
    }
  };

  const addSelectedToList = () => {
    const toAdd = searchResults.filter(l => selectedInSearch.has(l.id));
    const newItems = toAdd.filter(ledger => !selectedLedgerList.find((l: any) => l.ledger_id === ledger.id))
      .map(ledger => ({ ledger_id: ledger.id, name: ledger.name, group: ledger.group }));
    
    if (newItems.length > 0) {
      setSelectedLedgerList(prev => [...prev, ...newItems]);
      toast.success(`${newItems.length} ledgers added to list.`);
    }
    setActiveTab('list');
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
    setTotalAmount(0); setPendingAmount(0); setDetailed(false); setIncludeChild(true);
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
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end mb-6" ref={searchRef}>
            <div className="md:col-span-3">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 block">Name</label>
              <input type="text" value={ledgerSearch} onChange={e => setLedgerSearch(e.target.value)}
                placeholder="Name"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all" />
            </div>
            <div className="md:col-span-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 block">Group</label>
              <select value={selectedGroup} onChange={e => setSelectedGroup(e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all">
                <option value="">Select Group</option>
                {groupList.map((g: any, i) => (
                  <option key={i} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 block">Sales Person</label>
              <select value={selectedSalesPerson} onChange={e => setSelectedSalesPerson(e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all">
                <option value="">Select Sales Person</option>
                {salesPersonList.map((sp: any, i) => (
                  <option key={i} value={sp.id}>{sp.name}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 block">To Date</label>
              <input type="date" value={toDate} onChange={e => setToDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all" />
            </div>
            <div className="md:col-span-3 flex items-center gap-2 justify-end">
              <button 
                onClick={handleSearch} 
                disabled={isSearchLoading}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-bold transition-all shadow-lg shadow-blue-600/20 disabled:opacity-70"
              >
                {isSearchLoading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                <span className="hidden sm:inline">Search</span>
              </button>
              <button 
                onClick={handleResetSearch} 
                className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 rounded-lg transition-all border border-slate-200 dark:border-slate-700"
              >
                <RotateCcw size={16} />
              </button>
            </div>
          </div>

          <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden relative flex flex-col flex-1">
            <div className="overflow-auto max-h-[calc(100vh-450px)] min-h-[300px]">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 z-10 bg-[#e2f0f7] dark:bg-slate-800">
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="px-4 py-2.5 w-10">
                      <input type="checkbox" checked={searchResults.length > 0 && selectedInSearch.size === searchResults.length} onChange={toggleAllSearchSelection} className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500" />
                    </th>
                    <th className="px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Ledger</th>
                    <th className="px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Group</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                  {searchResults.length === 0 ? (
                    <tr><td colSpan={3} className="px-4 py-8 text-center text-sm text-slate-400">No data</td></tr>
                  ) : searchResults.map((l, i) => (
                    <tr key={i} onClick={() => toggleSearchSelection(l.id)} className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/50 cursor-pointer ${i % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50/30 dark:bg-slate-800/20'}`}>
                      <td className="px-4 py-2">
                        <input type="checkbox" checked={selectedInSearch.has(l.id)} onChange={() => {}} className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500" />
                      </td>
                      <td className="px-4 py-2 text-sm text-slate-700 dark:text-slate-200">{l.name}</td>
                      <td className="px-4 py-2 text-sm text-slate-500">{l.group}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="sticky bottom-0 z-10 flex flex-wrap items-center justify-between gap-4 p-3 bg-[#e2f0f7] dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
              <div className="flex gap-10">
                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Total Rows : {searchResults.length}</span>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Filtered Rows : {searchResults.length}</span>
              </div>
              <div className="flex gap-2">
                <button onClick={addSelectedToList} disabled={selectedInSearch.size === 0} className="flex items-center gap-2 bg-[#4b4949] hover:bg-[#3a3a3a] text-white px-4 py-1.5 rounded-md text-xs font-bold transition-all disabled:opacity-50 shadow-sm">
                  <FilePlus size={14} /> Add To List
                </button>
                <button onClick={() => setActiveTab('list')} className="flex items-center gap-2 bg-[#36a3f7] hover:bg-[#258edb] text-white px-4 py-1.5 rounded-md text-xs font-bold transition-all shadow-sm">
                  Next <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* Quick Options */}
          <div className="mt-6 flex flex-wrap gap-6 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <input type="checkbox" id="allReceipts" checked={allReceipts} onChange={e => { setAllReceipts(e.target.checked); if (e.target.checked) setAllPayments(false); }}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500" />
              <label htmlFor="allReceipts" className="text-xs font-semibold text-slate-600 dark:text-slate-300">All Receipts</label>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="allPayments" checked={allPayments} onChange={e => { setAllPayments(e.target.checked); if (e.target.checked) setAllReceipts(false); }}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500" />
              <label htmlFor="allPayments" className="text-xs font-semibold text-slate-600 dark:text-slate-300">All Payments</label>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="detailedMult" checked={detailed} onChange={e => setDetailed(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500" />
              <label htmlFor="detailedMult" className="text-xs font-semibold text-slate-600 dark:text-slate-300">Detailed</label>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="inclChild" checked={includeChild} onChange={e => setIncludeChild(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500" />
              <label htmlFor="inclChild" className="text-xs font-semibold text-slate-600 dark:text-slate-300">Include Child</label>
            </div>
          </div>
        </div>
      )}

      {/* Ledger List Tab */}
      {activeTab === 'list' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 relative flex flex-col">
          <div className="overflow-auto max-h-[calc(100vh-450px)] min-h-[300px]">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 z-10 bg-[#e2f0f7] dark:bg-slate-800">
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="px-4 py-2.5 text-[10px] font-bold text-slate-500 uppercase w-10"></th>
                  <th className="px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Ledger</th>
                  <th className="px-3 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Group</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                {selectedLedgerList.length === 0 ? (
                  <tr><td colSpan={3} className="px-4 py-8 text-center text-sm text-slate-400">No ledgers added. Go to "Ledger Search" tab to add.</td></tr>
                ) : selectedLedgerList.map((l, i) => (
                  <tr key={i} className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/50 ${i % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50/30 dark:bg-slate-800/20'}`}>
                    <td className="px-4 py-2">
                      <button onClick={() => removeLedger(l.ledger_id)} className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"><Trash2 size={14} /></button>
                    </td>
                    <td className="px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200">{l.name}</td>
                    <td className="px-3 py-2 text-xs text-slate-500">{l.group}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="sticky bottom-0 z-10 p-3 bg-[#e2f0f7] dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Total: {selectedLedgerList.length} ledgers</span>
            <div className="flex gap-2">
              <button onClick={() => setActiveTab('search')} className="px-4 py-1.5 text-xs font-bold text-slate-600 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-md hover:bg-slate-50 shadow-sm transition-all">← Back</button>
              <button onClick={() => setSelectedLedgerList([])} className="px-4 py-1.5 text-xs font-bold text-slate-600 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-md hover:bg-slate-50 shadow-sm transition-all"><RotateCcw size={12} className="inline mr-1" />Clear</button>
              <button onClick={submitReport} className="flex items-center gap-2 bg-[#36a3f7] hover:bg-[#258edb] text-white px-5 py-1.5 rounded-md text-xs font-bold transition-all shadow-sm">
                {loading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />} Search
              </button>
              <button onClick={handleExport} className="flex items-center gap-1 bg-[#1dc9b7] hover:bg-[#17a899] text-white px-5 py-1.5 rounded-md text-xs font-bold transition-all shadow-sm">
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
                <div className="sticky bottom-0 z-10 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-[0_-4px_12px_-2px_rgba(0,0,0,0.05)] p-4">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Grand Total — {lst.length} rows across {uniqueLedLst.length} ledgers</span>
                    <div className="flex items-center gap-8">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Total Amount</span>
                        <span className="text-sm font-black text-slate-700 dark:text-slate-200">{H.formatNumber(totalAmount, precision)}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-teal-500 font-bold uppercase tracking-wider block mb-1">Pending Amount</span>
                        <span className="text-lg font-black text-teal-600 dark:text-teal-400">{H.formatNumber(pendingAmount, precision)}</span>
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
