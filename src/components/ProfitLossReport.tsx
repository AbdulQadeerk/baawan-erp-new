import React, { useState, useCallback, useRef } from 'react';
import { Search, RotateCcw, FileSpreadsheet, Loader2, X, TrendingUp, Scale, ChevronRight } from 'lucide-react';
import { reportApi } from '../services/report.service';
import { toast } from '../lib/toast';
import * as H from './reports/trial-balance/trialBalanceHelpers';
import { TrialBalanceGroupDetail } from './reports/trial-balance/trial-balance-group-detail/TrialBalanceGroupDetail';
import { TrialBalanceLedgerRegister } from './reports/trial-balance/trial-balance-ledger-register/TrialBalanceLedgerRegister';

// ─── P&L Group ID mapping (same as Angular) ─────────────────────────────────
const GROUP_NAME_MAP: Record<number, string> = {
  10: 'Purchase Accounts',
  5: 'Direct Expenses',
  6: 'Indirect Expenses',
  9: 'Sales Accounts',
  11: 'Direct Incomes',
  12: 'Indirect Incomes',
};

interface PnLData {
  purchase: { OpenStock: number; Purchase: number; DirectExpense: number; GrossProfit: number; IndirectExp: number; NetProfit: number };
  sales: { Sales: number; DirectIncome: number; CloseStock: number; GrossLoss: number; IndirectIncome: number; NetLoss: number };
}

interface TabItem { id: number; text: string; isGroup: boolean; groupItem?: any; filterobj?: any; }

const normalizePnLData = (data: any): PnLData => {
  const res: PnLData = {
    purchase: { OpenStock: 0, Purchase: 0, DirectExpense: 0, GrossProfit: 0, IndirectExp: 0, NetProfit: 0 },
    sales: { Sales: 0, DirectIncome: 0, CloseStock: 0, GrossLoss: 0, IndirectIncome: 0, NetLoss: 0 },
  };
  if (!data) return res;
  if (data.purchase) {
    res.purchase.OpenStock = Number(data.purchase.openStock ?? data.purchase.OpenStock) || 0;
    res.purchase.Purchase = Number(data.purchase.purchase ?? data.purchase.Purchase) || 0;
    res.purchase.DirectExpense = Number(data.purchase.directExpense ?? data.purchase.DirectExpense) || 0;
    res.purchase.GrossProfit = Number(data.purchase.grossProfit ?? data.purchase.GrossProfit) || 0;
    res.purchase.IndirectExp = Number(data.purchase.indirectExp ?? data.purchase.IndirectExp) || 0;
    res.purchase.NetProfit = Number(data.purchase.netProfit ?? data.purchase.NetProfit) || 0;
  }
  if (data.sales) {
    res.sales.Sales = Number(data.sales.sales ?? data.sales.Sales) || 0;
    res.sales.DirectIncome = Number(data.sales.directIncome ?? data.sales.DirectIncome) || 0;
    res.sales.CloseStock = Number(data.sales.closeStock ?? data.sales.CloseStock) || 0;
    res.sales.GrossLoss = Number(data.sales.grossLoss ?? data.sales.GrossLoss) || 0;
    res.sales.IndirectIncome = Number(data.sales.indirectIncome ?? data.sales.IndirectIncome) || 0;
    res.sales.NetLoss = Number(data.sales.netLoss ?? data.sales.NetLoss) || 0;
  }
  return res;
};

export const ProfitLossReport: React.FC = () => {
  const grpList = useRef(H.getGroupList()).current;
  const precision = H.getPrecision();
  const currencySymbol = H.getCurrencySymbol();
  const fyDates = H.getFYDates();

  const [fromDate, setFromDate] = useState(fyDates.fromDate);
  const [toDate, setToDate] = useState(fyDates.toDate);
  const [withStock, setWithStock] = useState(false);
  const [lst, setLst] = useState<PnLData | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState(1);
  const [tabs, setTabs] = useState<TabItem[]>([]);
  const [counter, setCounter] = useState(2);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const getFilters = useCallback(() => ({
    fromDate: H.formatDateForApi(fromDate, '00:00:00'),
    toDate: H.formatDateForApi(toDate, '23:59:59'),
    withStock,
  }), [fromDate, toDate, withStock]);

  const submitReportView = useCallback(async () => {
    setLoading(true);
    try {
      const data = await reportApi.profitLossReport(getFilters());
      setLst(normalizePnLData(data));
      if (!data) toast.info('No data found', 'Info');
    } catch { setLst(null); } finally { setLoading(false); }
  }, [getFilters]);

  const handleSearch = () => {
    if (!fromDate || !toDate) { toast.info('Please select date range', 'Validation'); return; }
    if (new Date(fromDate) > new Date(toDate)) { toast.info('From Date cannot be after To Date', 'Validation'); return; }
    setTabs([]); setSelectedTab(1);
    submitReportView();
  };

  const handleClear = () => {
    const d = H.getFYDates();
    setFromDate(d.fromDate); setToDate(d.toDate); setLst(null); setTabs([]); setSelectedTab(1);
  };

  // ─── Drill-down into P&L groups (reuses Trial Balance infrastructure) ───
  const toggleDetails = (groupId: number) => {
    const item: any = { ID: groupId, NAME: GROUP_NAME_MAP[groupId], ISGROUP: true, isChildDataLoaded: false };
    const rec = grpList.find((x: any) => x.id == groupId);
    if (rec) item.groupInfo = rec;
    onDetailToggle(item);
  };

  const onDetailToggle = (item: any) => {
    if (item.ISGROUP) {
      if (!item.isChildDataLoaded) { item.openTabAfterLoad = true; loadGroupChildren(item); }
      else { onAddNewTab(item); }
    } else { onAddNewTab(item); }
  };

  const loadGroupChildren = async (item: any) => {
    const fdata: any = getFilters();
    fdata.groupId = item.ID;
    try {
      const data = await reportApi.trialBalanceReport(fdata);
      if (data?.length) {
        data.forEach((child: any) => {
          child.NAME = child.NAME || child.Name;
          child.ID = child.ID || child.Ledger_ID || child.LedgerId || child.ledgerId || child.id;
          child.ISGROUP = child.ISGROUP ?? child.IsGroup ?? false;
          child.parentName = item.NAME;
          if (child.ISGROUP) {
            const rec = grpList.find((x: any) => x.id == child.ID);
            if (rec) { child.groupInfo = rec; H.processTrialBalanceItem(child, rec); }
          } else if (item.groupInfo) {
            child.groupInfo = item.groupInfo;
            H.processTrialBalanceItem(child, item.groupInfo);
          }
        });
        item.isChildDataLoaded = true;
        item.childNodeData = data;
        if (item.openTabAfterLoad) { onAddNewTab(item); item.openTabAfterLoad = false; }
      }
    } catch { }
  };

  const onAddNewTab = (item: any) => {
    const groupInfo = item.ISGROUP ? item : item.groupInfo;
    const isPnL = groupInfo && (groupInfo.nature === 3 || groupInfo.nature === 4);
    const obVal = item.ISOP ?? item.isOp ?? (isPnL ? false : false);
    const resolvedId = item.ID || item.Ledger_ID || item.LedgerId || item.ledgerId || item.id;

    item.filterobj = {
      value: {
        from: fromDate, to: toDate, ledgerId: resolvedId, runningBalance: true,
        openingBalance: obVal, billDetails: false, bankDetails: false,
        isPdc: false, includeChildLedgers: true, monthWise: true,
      },
      name: item.NAME, parentName: item.parentName || '',
    };
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

  const onChildRefreshRequested = (tabItem: TabItem) => {
    if (tabItem.groupItem) {
      tabItem.groupItem.isChildDataLoaded = false;
      tabItem.groupItem.childNodeData = [];
      loadGroupChildren(tabItem.groupItem);
    }
  };

  const fmt = (val: number) => H.formatNumber(Math.abs(val), precision);
  const p = lst?.purchase;
  const s = lst?.sales;
  const expenseSubtotal = p ? p.OpenStock + p.Purchase + p.DirectExpense + p.GrossProfit : 0;
  const incomeSubtotal = s ? s.Sales + s.DirectIncome + s.CloseStock + s.GrossLoss : 0;
  const totalExpense = s && p ? s.GrossLoss + p.IndirectExp + p.NetProfit : 0;
  const totalIncome = p && s ? p.GrossProfit + s.IndirectIncome + s.NetLoss : 0;

  return (
    <div className="font-sans text-slate-700 dark:text-slate-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-100 dark:bg-emerald-900/30 p-2.5 rounded-xl text-emerald-600 dark:text-emerald-400">
            <TrendingUp size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Profit & Loss Account</h1>
            <p className="text-xs text-slate-500 font-medium">Income vs expense analysis with drill-down</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 mb-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[320px]">
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 block">From Date <span className="text-red-500">*</span></label>
                <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" />
              </div>
              <div className="flex-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 block">To Date <span className="text-red-500">*</span></label>
                <input type="date" value={toDate} onChange={e => setToDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" />
              </div>
              <label className="flex items-center gap-2 cursor-pointer select-none pb-2">
                <input type="checkbox" checked={withStock} onChange={e => setWithStock(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 whitespace-nowrap">With Stock</span>
              </label>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleSearch} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-lg text-sm font-bold transition-all shadow-lg shadow-emerald-600/20">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
              <span className="hidden sm:inline">Search</span>
            </button>
            <button onClick={handleClear} className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 rounded-lg transition-all border border-slate-200 dark:border-slate-700"><RotateCcw size={16} /></button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-700 mb-0 overflow-x-auto">
        <button onClick={() => setSelectedTab(1)}
          className={`px-4 py-2.5 text-sm font-semibold rounded-t-lg transition-all whitespace-nowrap ${selectedTab === 1 ? 'bg-white dark:bg-slate-900 text-emerald-600 border border-b-0 border-slate-200 dark:border-slate-700 -mb-[1px]' : 'text-slate-500 hover:text-slate-700'}`}>
          Profit & Loss
        </button>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setSelectedTab(tab.id)}
            className={`px-3 py-2.5 text-xs font-medium rounded-t-lg transition-all flex items-center gap-1.5 whitespace-nowrap max-w-[180px] ${selectedTab === tab.id ? 'bg-white dark:bg-slate-900 text-emerald-600 border border-b-0 border-slate-200 dark:border-slate-700 -mb-[1px]' : 'text-slate-500 hover:text-slate-700'}`}>
            <span className="truncate">{tab.text}</span>
            <span onClick={(e) => closeTab(e, tab.id)} className="ml-1 p-0.5 rounded hover:bg-red-100 hover:text-red-500 transition-colors flex-shrink-0"><X size={12} /></span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-slate-900 rounded-b-xl border border-t-0 border-slate-200 dark:border-slate-700 shadow-sm">
        {selectedTab === 1 && (
          <div className="p-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 size={28} className="animate-spin text-emerald-500 mb-3" />
                <span className="text-sm text-slate-500 font-medium">Loading P&L data...</span>
              </div>
            ) : !lst ? (
              <div className="text-center py-16">
                <TrendingUp size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                <p className="text-slate-500 text-sm">Select date range and click Search to generate the report.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* EXPENSE Side */}
                <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                  <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-slate-800 dark:to-slate-800/80 px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                    <span className="text-sm font-bold text-red-700 dark:text-red-400 uppercase tracking-wider">Expense</span>
                    <span className="text-xs text-slate-500 ml-2">Total ({currencySymbol})</span>
                  </div>
                  <table className="w-full text-left border-collapse">
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      <PnLRow label="Opening Stock" value={fmt(p!.OpenStock)} />
                      <PnLRow label="Purchase Accounts" value={fmt(p!.Purchase)} clickable onClick={() => toggleDetails(10)} />
                      <PnLRow label="Direct Expenses" value={fmt(p!.DirectExpense)} clickable onClick={() => toggleDetails(5)} />
                      <PnLRow label="Gross Profit" value={fmt(p!.GrossProfit)} highlight />
                      <PnLRow label="" value={<span className="font-black">{fmt(expenseSubtotal)}</span>} subtotal />
                      {p!.IndirectExp !== 0 && <PnLRow label="Indirect Expenses" value={fmt(p!.IndirectExp)} clickable onClick={() => toggleDetails(6)} />}
                      {p!.NetProfit !== 0 && <PnLRow label="Net Profit" value={fmt(p!.NetProfit)} highlight />}
                    </tbody>
                  </table>
                  <div className="bg-red-600 px-4 py-3 flex items-center justify-between text-white font-bold">
                    <span className="text-sm uppercase">Total of Expense</span>
                    <span className="text-base font-mono">{fmt(totalExpense)}</span>
                  </div>
                </div>

                {/* INCOME Side */}
                <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                  <div className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-slate-800 dark:to-slate-800/80 px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                    <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Income</span>
                    <span className="text-xs text-slate-500 ml-2">Total ({currencySymbol})</span>
                  </div>
                  <table className="w-full text-left border-collapse">
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      <PnLRow label="Sales Accounts" value={fmt(s!.Sales)} clickable onClick={() => toggleDetails(9)} />
                      <PnLRow label="Direct Incomes" value={fmt(s!.DirectIncome)} clickable onClick={() => toggleDetails(11)} />
                      <PnLRow label="Closing Stock" value={fmt(s!.CloseStock)} />
                      <PnLRow label="Gross Loss" value={fmt(s!.GrossLoss)} highlight />
                      <PnLRow label="" value={<span className="font-black">{fmt(incomeSubtotal)}</span>} subtotal />
                      {p!.GrossProfit !== 0 && <PnLRow label="Gross Profit" value={fmt(p!.GrossProfit)} />}
                      {s!.IndirectIncome !== 0 && <PnLRow label="Indirect Incomes" value={fmt(s!.IndirectIncome)} clickable onClick={() => toggleDetails(12)} />}
                      {s!.NetLoss !== 0 && <PnLRow label="Nett Loss" value={fmt(s!.NetLoss)} highlight />}
                    </tbody>
                  </table>
                  <div className="bg-emerald-600 px-4 py-3 flex items-center justify-between text-white font-bold">
                    <span className="text-sm uppercase">Total of Income</span>
                    <span className="text-base font-mono">{fmt(totalIncome)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Dynamic drill-down tabs */}
        {tabs.filter(t => t.id === selectedTab).map(tab => (
          <div key={tab.id} className="p-4">
            {tab.isGroup ? (
              <TrialBalanceGroupDetail
                groupItem={tab.groupItem}
                showOpeningBalance={true} showDebit={true} showCredit={true}
                onItemSelected={onDetailToggle}
                onRefresh={() => onChildRefreshRequested(tab)}
              />
            ) : (
              <TrialBalanceLedgerRegister recordData={tab.filterobj} refreshTrigger={refreshTrigger} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Sub-component: P&L table row ────────────────────────────────────────────
const PnLRow: React.FC<{
  label: string; value: React.ReactNode; clickable?: boolean; onClick?: () => void; highlight?: boolean; subtotal?: boolean;
}> = ({ label, value, clickable, onClick, highlight, subtotal }) => (
  <tr className={`${clickable ? 'cursor-pointer hover:bg-blue-50/50 dark:hover:bg-slate-800/50' : ''} ${subtotal ? 'bg-slate-50 dark:bg-slate-800/50' : ''}`}
    onClick={clickable ? onClick : undefined}>
    <td className="px-4 py-3">
      <div className="flex items-center gap-2">
        {clickable && <ChevronRight size={14} className="text-blue-500 flex-shrink-0" />}
        <span className={`text-sm ${highlight ? 'font-semibold text-emerald-700 dark:text-emerald-400' : clickable ? 'font-semibold text-blue-600 dark:text-blue-400 hover:underline' : 'text-slate-700 dark:text-slate-300'}`}>
          {label}
        </span>
      </div>
    </td>
    <td className="px-4 py-3 text-right text-sm font-mono text-slate-800 dark:text-slate-200">{value}</td>
  </tr>
);
