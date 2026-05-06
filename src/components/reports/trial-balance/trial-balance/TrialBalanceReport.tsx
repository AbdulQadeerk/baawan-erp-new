import React, { useState, useCallback, useRef } from 'react';
import { Search, RotateCcw, FileSpreadsheet, FileText, RefreshCw, Loader2, X, FolderOpen, Scale } from 'lucide-react';
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
            <button onClick={handleSearch} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg text-sm font-bold transition-all shadow-lg shadow-indigo-600/20" title="Generate Report">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
              <span className="hidden sm:inline">Search</span>
            </button>
            <button onClick={handleClear} className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 rounded-lg transition-all border border-slate-200 dark:border-slate-700" title="Clear"><RotateCcw size={16} /></button>
            <button onClick={handleExport} className="p-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-all shadow-lg shadow-emerald-500/20" title="Export Excel">
              {exportLoading ? <Loader2 size={16} className="animate-spin" /> : <FileSpreadsheet size={16} />}
            </button>
            <button onClick={handleRefreshAll} className="p-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all shadow-lg shadow-blue-500/20" title="Refresh All">
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
      <div className="bg-white dark:bg-slate-900 rounded-b-xl border border-t-0 border-slate-200 dark:border-slate-700 shadow-sm">
        {/* Main Trial Balance Tab */}
        {selectedTab === 1 && (
          <div className="p-4">
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
                {/* Table Header */}
                <div className="rounded-t-xl overflow-hidden border border-slate-200 dark:border-slate-700 mb-0">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800">
                        <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Account</th>
                        {showOpeningBalance && <th className="px-3 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">Opening Balance</th>}
                        {showDebit && <th className="px-3 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">Debit</th>}
                        {showCredit && <th className="px-3 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">Credit</th>}
                        <th className="px-3 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Closing Balance</th>
                      </tr>
                    </thead>
                  </table>
                </div>

                {/* Grouped Data */}
                <div className="max-h-[calc(100vh-420px)] overflow-auto">
                  {grouped.map((group, gi) => (
                    <div key={gi} className="mb-3">
                      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-slate-800 dark:to-slate-800/80 px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-t-lg">
                        <span className="text-sm font-bold text-indigo-700 dark:text-indigo-400">{group.key}</span>
                      </div>
                      <div className="border-x border-slate-200 dark:border-slate-700">
                        {group.value.map((item: any, idx: number) => (
                          <div key={idx} className="border-b border-slate-100 dark:border-slate-800 hover:bg-blue-50/50 dark:hover:bg-slate-800/50 transition-colors">
                            <table className="w-full text-left border-collapse">
                              <tbody>
                                <tr className="cursor-pointer" onClick={() => toggleItem(item)}>
                                  <td className="px-4 py-2.5">
                                    <div className="flex items-center gap-2">
                                      <FolderOpen size={14} className="text-emerald-500 flex-shrink-0" />
                                      <span className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline">{item.NAME}</span>
                                    </div>
                                  </td>
                                  {showOpeningBalance && (
                                    <td className="px-3 py-2.5 text-center text-xs font-mono text-slate-600 dark:text-slate-400">
                                      {H.formatNumber(H.getProcessedOpeningBalance(item), precision)}
                                      {H.getOpeningDrCr(item) && <span className="ml-1 text-slate-400">{H.getOpeningDrCr(item)}</span>}
                                    </td>
                                  )}
                                  {showDebit && <td className="px-3 py-2.5 text-center text-xs font-mono text-slate-600 dark:text-slate-400">{H.formatNumber(H.getProcessedDebit(item), precision)}</td>}
                                  {showCredit && <td className="px-3 py-2.5 text-center text-xs font-mono text-slate-600 dark:text-slate-400">{H.formatNumber(H.getProcessedCredit(item), precision)}</td>}
                                  <td className="px-3 py-2.5 text-right text-sm font-mono font-bold text-slate-800 dark:text-slate-200">
                                    {H.formatNumber(H.getProcessedClosingBalance(item), precision)}
                                    {H.getClosingDrCr(item) && <span className="ml-1 text-xs font-normal text-slate-400">{H.getClosingDrCr(item)}</span>}
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        ))}
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-800/80 border border-t-2 border-slate-200 dark:border-slate-700 rounded-b-lg">
                        <table className="w-full text-left border-collapse">
                          <tbody>
                            <tr className="font-bold">
                              <td className="px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300">Total</td>
                              {showOpeningBalance && (
                                <td className="px-3 py-2.5 text-center text-xs font-mono text-slate-700 dark:text-slate-300">
                                  {H.formatNumber(H.getTotalProcessedOpeningBalance(group.value), precision)}
                                  {H.getOpeningDrCrForGroup(group.value) && <span className="ml-1">{H.getOpeningDrCrForGroup(group.value)}</span>}
                                </td>
                              )}
                              {showDebit && <td className="px-3 py-2.5 text-center text-xs font-mono text-slate-700 dark:text-slate-300">{H.formatNumber(H.getTotalProcessedDebit(group.value), precision)}</td>}
                              {showCredit && <td className="px-3 py-2.5 text-center text-xs font-mono text-slate-700 dark:text-slate-300">{H.formatNumber(H.getTotalProcessedCredit(group.value), precision)}</td>}
                              <td className={`px-3 py-2.5 text-right text-sm font-mono ${H.getNetAmountWithSign(group.value) >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                                {H.formatNumber(H.getNetAmount(group.value), precision)}
                                {H.getClosingDrCrForGroup(group.value) && <span className="ml-1 text-xs">{H.getClosingDrCrForGroup(group.value)}</span>}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Grand Total */}
                <div className="mt-3 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl p-4 shadow-lg shadow-indigo-600/20">
                  <table className="w-full text-left border-collapse">
                    <tbody>
                      <tr className="text-white font-bold">
                        <td className="px-4 py-1 text-base">Grand Total</td>
                        {showOpeningBalance && (
                          <td className="px-3 py-1 text-center text-sm font-mono">
                            {H.formatNumber(H.getTotalProcessedOpeningBalance(lst), precision)}
                          </td>
                        )}
                        {showDebit && <td className="px-3 py-1 text-center text-sm font-mono">{H.formatNumber(H.getTotalProcessedDebit(lst), precision)}</td>}
                        {showCredit && <td className="px-3 py-1 text-center text-sm font-mono">{H.formatNumber(H.getTotalProcessedCredit(lst), precision)}</td>}
                        <td className="px-3 py-1 text-right text-lg font-mono">
                          {H.formatNumber(H.getNetAmount(lst), precision)}
                          {H.getClosingDrCrForGroup(lst) && <span className="ml-1 text-sm">{H.getClosingDrCrForGroup(lst)}</span>}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}

        {/* Dynamic Tabs Content */}
        {tabs.filter(t => t.id === selectedTab).map(tab => (
          <div key={tab.id} className="p-4">
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
      </div>
    </div>
  );
};
