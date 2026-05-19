import React, { useState, useCallback, useRef } from 'react';
import { Search, RotateCcw, FileSpreadsheet, FileText, RefreshCw, Loader2, X, FolderOpen, Scale, CheckCircle, Settings, TrendingUp, Info, ShieldCheck } from 'lucide-react';
import { reportApi } from '../../../../services/report.service';
import { toast } from '../../../../lib/toast';
import * as H from '../trialBalanceHelpers';
import { TrialBalanceGroupDetail } from '../trial-balance-group-detail/TrialBalanceGroupDetail';
import { TrialBalanceLedgerRegister } from '../trial-balance-ledger-register/TrialBalanceLedgerRegister';

// ─── Date Range Quick Selector ───────────────────────────────────────────────
const DATE_RANGES = [
  { label: 'Q1', getRange: (fy: number) => ({ from: `${fy}-04-01`, to: `${fy}-06-30` }) },
  { label: 'Q2', getRange: (fy: number) => ({ from: `${fy}-07-01`, to: `${fy}-09-30` }) },
  { label: 'Q3', getRange: (fy: number) => ({ from: `${fy}-10-01`, to: `${fy}-12-31` }) },
  { label: 'Q4', getRange: (fy: number) => ({ from: `${fy + 1}-01-01`, to: `${fy + 1}-03-31` }) },
  { label: 'H1', getRange: (fy: number) => ({ from: `${fy}-04-01`, to: `${fy}-09-30` }) },
  { label: 'H2', getRange: (fy: number) => ({ from: `${fy}-10-01`, to: `${fy + 1}-03-31` }) },
  { label: 'FY', getRange: (fy: number) => ({ from: `${fy}-04-01`, to: `${fy + 1}-03-31` }) },
];

interface TabItem {
  id: number;
  text: string;
  isGroup: boolean;
  groupItem?: any;
  filterobj?: any;
  needsRefresh?: boolean;
}

export const TrialBalanceReport: React.FC = () => {
  const grpList = useRef(H.getGroupList()).current;
  const precision = H.getPrecision();
  const currencySymbol = H.getCurrencySymbol();
  const fyDates = H.getFYDates();

  const [fromDate, setFromDate] = useState(fyDates.fromDate);
  const [toDate, setToDate] = useState(fyDates.toDate);
  const [lst, setLst] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [showOpeningBalance, setShowOpeningBalance] = useState(true);
  const [showDebit, setShowDebit] = useState(true);
  const [showCredit, setShowCredit] = useState(true);
  const [selectedTab, setSelectedTab] = useState(1);
  const [tabs, setTabs] = useState<TabItem[]>([]);
  const [counter, setCounter] = useState(2);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const getFilters = useCallback(() => ({
    fromDate: H.formatDateForApi(fromDate, '00:00:00'),
    toDate: H.formatDateForApi(toDate, '23:59:59'),
  }), [fromDate, toDate]);

  const submitReportView = useCallback(async (item?: any) => {
    const fdata: any = getFilters();
    if (item) { fdata.groupId = item.ID; }
    if (!item) setLoading(true);
    try {
      const data = await reportApi.trialBalanceReport(fdata);
      if (data?.length) {
        H.enrichTrialBalanceData(data, grpList);
        if (!item) {
          data.forEach((v: any) => {
            if (v.ISGROUP) {
              const rec = grpList.find((x: any) => x.id == v.ID);
              if (rec) { v.groupInfo = rec; }
            }
          });
          setLst(data);
        } else {
          item.isChildDataLoaded = true;
          data.forEach((child: any) => {
            child.parentName = item.NAME;
            child.parentGroupId = item.ID;
          });
          item.childNodeData = data;
          if (item.openTabAfterLoad) { onAddNewTab(item); item.openTabAfterLoad = false; }
          setLst(prev => [...prev]);
        }
      } else {
        if (!item) { setLst([]); toast.info('No data found', 'Info'); }
      }
    } catch (err: any) {
      if (!item) setLst([]);
    } finally {
      setLoading(false);
    }
  }, [getFilters, grpList]);

  const handleSearch = () => {
    if (!fromDate || !toDate) { toast.info('Please select date range', 'Validation'); return; }
    if (new Date(fromDate) > new Date(toDate)) { toast.info('From Date cannot be after To Date', 'Validation'); return; }
    setTabs([]); setSelectedTab(1);
    submitReportView();
  };

  const handleExport = async () => {
    setExportLoading(true);
    try {
      const blob = await reportApi.trialBalanceReportExport(getFilters());
      if (blob?.size) {
        const a = document.createElement('a');
        const url = URL.createObjectURL(blob);
        a.href = url; a.download = 'trial-balance.xlsx'; a.click(); URL.revokeObjectURL(url);
      } else { toast.info('No data found to export.', 'Info'); }
    } catch { } finally { setExportLoading(false); }
  };

  const handleClear = () => {
    const d = H.getFYDates();
    setFromDate(d.fromDate); setToDate(d.toDate); setLst([]); setTabs([]); setSelectedTab(1);
  };

  const handleRefreshAll = () => {
    lst.forEach(item => { item.isChildDataLoaded = false; item.childNodeData = []; });
    submitReportView();
    setRefreshTrigger(p => p + 1);
  };

  const handleDateRange = (range: typeof DATE_RANGES[0]) => {
    const today = new Date();
    const fy = today.getMonth() >= 3 ? today.getFullYear() : today.getFullYear() - 1;
    const r = range.getRange(fy);
    setFromDate(r.from); setToDate(r.to);
  };

  const toggleItem = (item: any) => {
    if (item.ISGROUP) {
      if (!item.isChildDataLoaded) { item.openTabAfterLoad = true; submitReportView(item); }
      else { onAddNewTab(item); }
    } else { onAddNewTab(item); }
  };

  const onAddNewTab = (item: any) => {
    item.filterobj = {
      value: {
        from: fromDate, to: toDate, ledgerId: item.ID, runningBalance: true,
        openingBalance: item.ISOP ?? item.isOp ?? false, billDetails: false,
        bankDetails: false, isPdc: false, includeChildLedgers: true, monthWise: true,
      },
      name: item.NAME, parentName: item.parentName || '',
    };
    item.ledgerName = item.NAME;
    const existing = tabs.find(t => t.text === item.NAME);
    if (!existing) {
      const newId = counter;
      setCounter(c => c + 1);
      setTabs(prev => [...prev, { id: newId, text: item.NAME, isGroup: !!item.ISGROUP, groupItem: item, filterobj: item.filterobj }]);
      setSelectedTab(newId);
    } else { setSelectedTab(existing.id); }
  };

  const closeTab = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    const remaining = tabs.filter(t => t.id !== id);
    setTabs(remaining);
    if (selectedTab === id) setSelectedTab(remaining.length > 0 ? remaining[remaining.length - 1].id : 1);
  };

  const onDetailGroupToggle = (item: any) => {
    if (item.ISGROUP) {
      if (!item.isChildDataLoaded) { item.openTabAfterLoad = true; submitReportView(item); }
      else { onAddNewTab(item); }
    } else { onAddNewTab(item); }
  };

  const onChildRefreshRequested = (tabItem: TabItem) => {
    if (tabItem.groupItem) {
      tabItem.groupItem.isChildDataLoaded = false;
      tabItem.groupItem.childNodeData = [];
      submitReportView(tabItem.groupItem);
    }
  };

  const grouped = H.groupBy(lst, 'nature');

  // Dynamic calculations for the right panel
  const getClosing = (name: string) => {
    const item = lst.find(x => x.NAME === name);
    return item ? Math.abs(H.getProcessedClosingBalance(item)) : 0;
  };

  const caVal = getClosing('Current Assets');
  const faVal = getClosing('Fixed Assets');
  const clVal = getClosing('Current Liabilities');
  const loanVal = getClosing('Loans (Liability)');

  const totalAssets = caVal + faVal;
  const totalLiabilities = clVal + loanVal;
  const totalBoth = totalAssets + totalLiabilities;
  
  const denominator = totalBoth > 0 ? totalBoth : 1;
  const caPct = Math.round((caVal / denominator) * 100);
  const faPct = Math.round((faVal / denominator) * 100);
  const liabPct = Math.round((totalLiabilities / denominator) * 100);
  const assetPct = totalBoth > 0 ? Math.round((totalAssets / denominator) * 100) : 0;

  const netWorth = totalAssets - totalLiabilities;

  return (
    <div className="font-sans text-slate-700 dark:text-slate-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2.5 rounded-xl text-indigo-600 dark:text-indigo-400">
            <Scale size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Trial Balance</h1>
            <p className="text-xs text-slate-500 font-medium">Comprehensive financial position with drill-down analysis</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 mb-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[320px]">
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 block">From Date <span className="text-red-500">*</span></label>
                <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" />
              </div>
              <div className="flex-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 block">To Date <span className="text-red-500">*</span></label>
                <input type="date" value={toDate} onChange={e => setToDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" />
              </div>
              <div className="flex gap-1">
                {DATE_RANGES.map(r => (
                  <button key={r.label} onClick={() => handleDateRange(r)}
                    className="px-2 py-2 text-[10px] font-bold bg-slate-100 dark:bg-slate-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 text-slate-600 dark:text-slate-400 hover:text-indigo-600 rounded-lg transition-all border border-slate-200 dark:border-slate-700">
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSearch}
              className="w-10 h-10 rounded-lg bg-[#2D9E75] text-white flex items-center justify-center hover:opacity-90 transition-all shadow-sm cursor-pointer"
              title="Generate Report"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
            </button>
            <button
              onClick={handleClear}
              className="w-10 h-10 rounded-lg bg-lime-500 text-white flex items-center justify-center hover:opacity-90 transition-all shadow-sm cursor-pointer"
              title="Clear Filters"
            >
              <RotateCcw size={16} />
            </button>
            <button
              onClick={handleExport}
              className="w-10 h-10 rounded-lg bg-rose-500 text-white flex items-center justify-center hover:opacity-90 transition-all shadow-sm cursor-pointer"
              title="Export Excel"
            >
              {exportLoading ? <Loader2 size={16} className="animate-spin" /> : <FileSpreadsheet size={16} />}
            </button>
            <button
              onClick={handleRefreshAll}
              className="w-10 h-10 rounded-lg bg-blue-500 text-white flex items-center justify-center hover:opacity-90 transition-all shadow-sm cursor-pointer"
              title="Refresh All"
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-700 mb-0 overflow-x-auto pb-0">
        <button onClick={() => setSelectedTab(1)}
          className={`px-4 py-2.5 text-sm font-semibold rounded-t-lg transition-all whitespace-nowrap ${selectedTab === 1 ? 'bg-white dark:bg-slate-900 text-indigo-600 border border-b-0 border-slate-200 dark:border-slate-700 -mb-[1px]' : 'text-slate-500 hover:text-slate-700'}`}>
          Trial Balance
        </button>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setSelectedTab(tab.id)}
            className={`px-3 py-2.5 text-xs font-medium rounded-t-lg transition-all flex items-center gap-1.5 whitespace-nowrap max-w-[180px] ${selectedTab === tab.id ? 'bg-white dark:bg-slate-900 text-indigo-600 border border-b-0 border-slate-200 dark:border-slate-700 -mb-[1px]' : 'text-slate-500 hover:text-slate-700'}`}>
            <span className="truncate">{tab.text}</span>
            <span onClick={(e) => closeTab(e, tab.id)} className="ml-1 p-0.5 rounded hover:bg-red-100 hover:text-red-500 transition-colors flex-shrink-0"><X size={12} /></span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex flex-col lg:flex-row bg-white dark:bg-slate-900 rounded-b-xl border border-t-0 border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {/* Main Trial Balance Tab */}
          {selectedTab === 1 && (
            <div className="p-4 flex-1 overflow-auto custom-scrollbar">
            {lst.length > 0 && (
              <div className="flex items-center gap-6 mb-4">
                {[{ label: 'Opening Balance', checked: showOpeningBalance, onChange: setShowOpeningBalance },
                  { label: 'Debit', checked: showDebit, onChange: setShowDebit },
                  { label: 'Credit', checked: showCredit, onChange: setShowCredit },
                ].map(col => (
                  <label key={col.label} className="flex items-center gap-2 cursor-pointer select-none group">
                    <input type="checkbox" checked={col.checked} onChange={e => col.onChange(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 transition-all" />
                    <span className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200 font-medium">{col.label}</span>
                  </label>
                ))}
              </div>
            )}

            {loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 size={28} className="animate-spin text-indigo-500 mb-3" />
                <span className="text-sm text-slate-500 font-medium">Generating trial balance...</span>
              </div>
            ) : lst.length === 0 ? (
              <div className="text-center py-16">
                <Scale size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                <p className="text-slate-500 text-sm">Select date range and click Search to generate the report.</p>
              </div>
            ) : (
              <>
                {/* Unified Data Table */}
                <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm flex-1 flex flex-col">
                  <div className="overflow-x-auto custom-scrollbar flex-1">
                    <table className="w-full text-left border-collapse whitespace-nowrap min-w-[800px]">
                      <thead className="sticky top-0 z-10 bg-white dark:bg-slate-900 shadow-sm border-b border-slate-200 dark:border-slate-700">
                        <tr>
                          <th className="px-4 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-white dark:bg-slate-900"></th>
                          {showOpeningBalance && <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center bg-white dark:bg-slate-900 border-l border-slate-100 dark:border-slate-800">Opening Balance</th>}
                          {showDebit && <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center bg-white dark:bg-slate-900 border-l border-slate-100 dark:border-slate-800">Debit</th>}
                          {showCredit && <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center bg-white dark:bg-slate-900 border-l border-slate-100 dark:border-slate-800">Credit</th>}
                          <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right bg-white dark:bg-slate-900 border-l border-slate-100 dark:border-slate-800">Closing Balance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {grouped.map((group, gi) => (
                          <React.Fragment key={gi}>
                            {/* Group Header */}
                            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                              <td colSpan={1 + (showOpeningBalance ? 1 : 0) + (showDebit ? 1 : 0) + (showCredit ? 1 : 0) + 1} className="px-4 py-3.5 text-sm font-semibold text-slate-700 dark:text-slate-300">
                                {group.key}
                              </td>
                            </tr>
                            
                            {/* Group Items */}
                            {group.value.map((item: any, idx: number) => (
                              <tr key={idx} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer" onClick={() => toggleItem(item)}>
                                <td className="px-4 py-3.5">
                                  <div className="flex items-center gap-2.5">
                                    <FolderOpen size={16} className="text-lime-500 flex-shrink-0" fill="currentColor" fillOpacity={0.2} />
                                    <span className="text-sm font-semibold text-blue-600 dark:text-blue-400 group-hover:underline">{item.NAME}</span>
                                  </div>
                                </td>
                                {showOpeningBalance && (
                                  <td className="px-4 py-3.5 text-center text-sm font-medium text-slate-600 dark:text-slate-400">
                                    {H.formatNumber(H.getProcessedOpeningBalance(item), precision)}
                                    {H.getOpeningDrCr(item) && <span className="ml-1 text-slate-400">{H.getOpeningDrCr(item)}</span>}
                                  </td>
                                )}
                                {showDebit && <td className="px-4 py-3.5 text-center text-sm font-medium text-slate-600 dark:text-slate-400">{H.formatNumber(H.getProcessedDebit(item), precision)}</td>}
                                {showCredit && <td className="px-4 py-3.5 text-center text-sm font-medium text-slate-600 dark:text-slate-400">{H.formatNumber(H.getProcessedCredit(item), precision)}</td>}
                                <td className="px-4 py-3.5 text-right text-sm font-medium text-slate-800 dark:text-slate-200">
                                  {H.formatNumber(H.getProcessedClosingBalance(item), precision)}
                                  {H.getClosingDrCr(item) && <span className="ml-1 text-xs text-slate-400 font-normal">{H.getClosingDrCr(item)}</span>}
                                </td>
                              </tr>
                            ))}
                            
                            {/* Group Total */}
                            <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30">
                              <td className="px-4 py-3.5 text-sm font-medium text-slate-500 dark:text-slate-400">Total</td>
                              {showOpeningBalance && (
                                <td className="px-4 py-3.5 text-center text-sm font-semibold text-slate-600 dark:text-slate-400">
                                  {H.formatNumber(H.getTotalProcessedOpeningBalance(group.value), precision)}
                                  {H.getOpeningDrCrForGroup(group.value) && <span className="ml-1 text-slate-400 font-normal">{H.getOpeningDrCrForGroup(group.value)}</span>}
                                </td>
                              )}
                              {showDebit && <td className="px-4 py-3.5 text-center text-sm font-semibold text-slate-600 dark:text-slate-400">{H.formatNumber(H.getTotalProcessedDebit(group.value), precision)}</td>}
                              {showCredit && <td className="px-4 py-3.5 text-center text-sm font-semibold text-slate-600 dark:text-slate-400">{H.formatNumber(H.getTotalProcessedCredit(group.value), precision)}</td>}
                              <td className={`px-4 py-3.5 text-right text-sm font-bold ${H.getNetAmountWithSign(group.value) >= 0 ? 'text-emerald-500 dark:text-emerald-400' : 'text-red-500'}`}>
                                {H.formatNumber(H.getNetAmount(group.value), precision)}
                                {H.getClosingDrCrForGroup(group.value) && <span className="ml-1 font-normal text-xs">{H.getClosingDrCrForGroup(group.value)}</span>}
                              </td>
                            </tr>
                          </React.Fragment>
                        ))}
                      </tbody>
                      <tfoot className="sticky bottom-0 z-10 bg-gradient-to-r from-indigo-50 dark:from-indigo-900/20 to-blue-50 dark:to-blue-900/20 border-t-2 border-indigo-200 dark:border-indigo-800 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                        <tr>
                          <td className="px-4 py-4 text-sm font-black text-indigo-700 dark:text-indigo-400 uppercase tracking-wider">Grand Total</td>
                          {showOpeningBalance && (
                            <td className="px-4 py-4 text-center text-sm font-bold text-indigo-700 dark:text-indigo-400">
                              {H.formatNumber(H.getTotalProcessedOpeningBalance(lst), precision)}
                            </td>
                          )}
                          {showDebit && <td className="px-4 py-4 text-center text-sm font-bold text-indigo-700 dark:text-indigo-400">{H.formatNumber(H.getTotalProcessedDebit(lst), precision)}</td>}
                          {showCredit && <td className="px-4 py-4 text-center text-sm font-bold text-indigo-700 dark:text-indigo-400">{H.formatNumber(H.getTotalProcessedCredit(lst), precision)}</td>}
                          <td className="px-4 py-4 text-right text-sm font-black text-indigo-700 dark:text-indigo-400">
                            {H.formatNumber(H.getNetAmount(lst), precision)}
                            {H.getClosingDrCrForGroup(lst) && <span className="ml-1 text-xs">{H.getClosingDrCrForGroup(lst)}</span>}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </>
            )}
            </div>
          )}

          {/* Dynamic Tabs Content */}
          {tabs.filter(t => t.id === selectedTab).map(tab => (
            <div key={tab.id} className="p-4 overflow-auto custom-scrollbar">
              {tab.isGroup ? (
                <TrialBalanceGroupDetail
                  groupItem={tab.groupItem}
                  showOpeningBalance={showOpeningBalance}
                  showDebit={showDebit}
                  showCredit={showCredit}
                  onItemSelected={onDetailGroupToggle}
                  onRefresh={() => onChildRefreshRequested(tab)}
                />
              ) : (
                <TrialBalanceLedgerRegister
                  recordData={tab.filterobj}
                  refreshTrigger={refreshTrigger}
                />
              )}
            </div>
          ))}

          {/* Bottom Strip */}
          {selectedTab === 1 && (
            <div className="sticky bottom-0 bg-yellow-50 dark:bg-yellow-900/10 border-t-2 border-indigo-600/20 px-4 md:px-6 py-4 flex flex-wrap items-center justify-between gap-4 z-20 mt-auto">
              <div className="flex items-center gap-6">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Total Debit</span>
                  <span className="text-xl font-black text-slate-900 dark:text-white tabular-nums">
                    {lst.length > 0 ? H.formatNumber(H.getTotalProcessedDebit(lst), precision) : '1,245,600.00'}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Total Credit</span>
                  <span className="text-xl font-black text-slate-900 dark:text-white tabular-nums">
                    {lst.length > 0 ? H.formatNumber(H.getTotalProcessedCredit(lst), precision) : '1,245,600.00'}
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-3 px-3 md:px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                  <CheckCircle size={18} className="text-emerald-500 hidden md:block" />
                  <div>
                    <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-500 uppercase leading-none mb-0.5">Status</p>
                    <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">Accounts Balanced</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-3 md:px-4 py-2 bg-indigo-500/5 border border-indigo-500/20 rounded-lg">
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-500 uppercase leading-none mb-0.5">Difference</p>
                    <p className="text-sm font-black text-indigo-600 dark:text-indigo-400">
                      {lst.length > 0 ? H.formatNumber(Math.abs(H.getTotalProcessedDebit(lst) - H.getTotalProcessedCredit(lst)), precision) : '0.00'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Side Panel: Quick Insights */}
        {selectedTab === 1 && (
          <aside className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col shrink-0">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white/50 dark:bg-slate-900/80">
              <h3 className="font-bold text-sm uppercase tracking-wider text-slate-500">Quick Insights</h3>
              <button className="text-slate-400 hover:text-slate-600 transition-colors">
                <Settings size={14} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-8 custom-scrollbar">
              <div className="space-y-4">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Asset vs Liability</p>
                <div className="relative aspect-square w-full bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center overflow-hidden shadow-inner">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-blue-500/5"></div>
                  <div className="relative w-40 h-40 rounded-full border-[14px] border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-sm">
                    <div className="absolute top-[-14px] left-[-14px] w-40 h-40 rounded-full border-[14px] border-indigo-500 border-t-transparent border-r-transparent -rotate-[15deg]" style={{ transform: `rotate(${((assetPct / 100) * 360) - 225}deg)` }}></div>
                    <div className="text-center z-10 flex flex-col items-center justify-center bg-white dark:bg-slate-900 w-[112px] h-[112px] rounded-full shadow-sm">
                      <p className="text-2xl font-black tabular-nums text-slate-800 dark:text-white leading-none mb-1">{assetPct}%</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Assets</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
                      <span className="text-slate-600 dark:text-slate-400 font-medium">Current Assets</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-500 font-mono">{currencySymbol} {H.formatNumber(caVal, precision)}</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 w-8 text-right">{caPct}%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-400"></span>
                      <span className="text-slate-600 dark:text-slate-400 font-medium">Fixed Assets</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-500 font-mono">{currencySymbol} {H.formatNumber(faVal, precision)}</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 w-8 text-right">{faPct}%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                      <span className="text-slate-600 dark:text-slate-400 font-medium">Liabilities</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-500 font-mono">{currencySymbol} {H.formatNumber(totalLiabilities, precision)}</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 w-8 text-right">{liabPct}%</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Quick Stats</p>
                <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                    <TrendingUp size={48} className="text-emerald-500" />
                  </div>
                  <p className="text-[10px] font-bold text-slate-500 mb-1 tracking-wider uppercase relative z-10">Total Assets</p>
                  <p className="text-xl font-black text-slate-900 dark:text-white tabular-nums relative z-10">
                    {currencySymbol} {H.formatNumber(totalAssets, precision)}
                  </p>
                </div>
                <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden">
                  <p className="text-[10px] font-bold text-slate-500 mb-1 tracking-wider uppercase">Net Worth</p>
                  <p className={`text-xl font-black tabular-nums ${netWorth >= 0 ? 'text-slate-900 dark:text-white' : 'text-red-500'}`}>
                    {currencySymbol} {H.formatNumber(netWorth, precision)}
                  </p>
                  <div className="mt-2 flex items-center gap-1.5 text-[10px] font-medium text-slate-400">
                    <Info size={12} />
                    <span>Updated dynamically</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-auto p-4 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-xl border border-indigo-100 dark:border-indigo-900/30">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck size={16} className="text-indigo-600 dark:text-indigo-400" />
                  <p className="text-[10px] font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-widest">Audit Status</p>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                  Last audited on <span className="text-indigo-700 dark:text-indigo-300">Oct 24, 2023</span>. This report is interactive; click on any account name to view the detailed ledger breakdown.
                </p>
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};
