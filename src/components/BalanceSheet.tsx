import React, { useState, useCallback } from 'react';
import { Search, RotateCcw, FileSpreadsheet, Loader2, Layers, CheckCircle2, LineChart, Info, Printer } from 'lucide-react';
import { reportApi } from '../services/report.service';
import { toast } from '../lib/toast';
import * as H from './reports/trial-balance/trialBalanceHelpers';

interface BSItem { NAME: string; Amount: number; }
interface BSData { liabilities: BSItem[]; assets: BSItem[]; totalLiabilities: number; totalAssets: number; }

const LIABILITIES_MAP: Record<string, string> = {
  capitalAccount: 'Capital Account',
  loansLiability: 'Loans (Liability)',
  currentLiabilities: 'Current Liabilities',
  profitNLoss: 'Profit & Loss A/c',
};
const ASSETS_MAP: Record<string, string> = {
  fixedAssets: 'Fixed Assets',
  investment: 'Investments',
  currentAssets: 'Current Assets',
};

const normalizeBS = (data: any): BSData => {
  const res: BSData = { liabilities: [], assets: [], totalLiabilities: 0, totalAssets: 0 };
  if (!data) return res;

  // Liabilities
  if (data.liabilities) {
    if (Array.isArray(data.liabilities)) { res.liabilities = data.liabilities; }
    else {
      Object.keys(LIABILITIES_MAP).forEach(key => {
        if (data.liabilities[key] !== undefined) {
          res.liabilities.push({ NAME: LIABILITIES_MAP[key], Amount: Number(data.liabilities[key]) || 0 });
        }
      });
    }
  }
  // Assets
  if (data.assets) {
    if (Array.isArray(data.assets)) { res.assets = data.assets; }
    else {
      Object.keys(ASSETS_MAP).forEach(key => {
        if (data.assets[key] !== undefined) {
          res.assets.push({ NAME: ASSETS_MAP[key], Amount: Number(data.assets[key]) || 0 });
        }
      });
    }
  }
  res.totalLiabilities = res.liabilities.reduce((s, i) => s + (i.Amount || 0), 0);
  res.totalAssets = res.assets.reduce((s, i) => s + (i.Amount || 0), 0);
  return res;
};

export const BalanceSheet: React.FC = () => {
  const precision = H.getPrecision();
  const currencySymbol = H.getCurrencySymbol();
  const fyDates = H.getFYDates();

  const [fromDate, setFromDate] = useState(fyDates.fromDate);
  const [toDate, setToDate] = useState(fyDates.toDate);
  const [lst, setLst] = useState<BSData | null>(null);
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  const getFilters = useCallback(() => ({
    fromDate: H.formatDateForApi(fromDate, '00:00:00'),
    toDate: H.formatDateForApi(toDate, '23:59:59'),
  }), [fromDate, toDate]);

  const submitReportView = useCallback(async () => {
    setLoading(true);
    try {
      const data = await reportApi.balanceSheetReport(getFilters());
      if (data) { setLst(normalizeBS(data)); }
      else { setLst(null); toast.info('No data found', 'Info'); }
    } catch { setLst(null); }
    finally { setLoading(false); }
  }, [getFilters]);

  const handleSearch = () => {
    if (!fromDate || !toDate) { toast.info('Please select date range', 'Validation'); return; }
    if (new Date(fromDate) > new Date(toDate)) { toast.info('From Date cannot be after To Date', 'Validation'); return; }
    submitReportView();
  };

  const handleExport = async () => {
    setExportLoading(true);
    try {
      const blob = await reportApi.balanceSheetReportExport(getFilters());
      if (blob?.size) {
        const a = document.createElement('a');
        const url = URL.createObjectURL(blob);
        a.href = url; a.download = 'balance-sheet.xlsx'; a.click(); URL.revokeObjectURL(url);
      } else { toast.info('No data found to export.', 'Info'); }
    } catch { } finally { setExportLoading(false); }
  };

  const handleClear = () => {
    const d = H.getFYDates();
    setFromDate(d.fromDate); setToDate(d.toDate); setLst(null);
  };

  const fmt = (val: number) => H.formatNumber(Math.abs(val), precision);
  const isBalanced = lst ? Math.abs(lst.totalLiabilities - lst.totalAssets) < 0.01 : false;

  const currentAssets = lst?.assets.find(a => a.NAME === 'Current Assets')?.Amount || 0;
  const currentLiabilities = lst?.liabilities.find(l => l.NAME === 'Current Liabilities')?.Amount || 0;
  const currentRatio = currentLiabilities ? (currentAssets / currentLiabilities) : 0;

  const totalDebt = lst?.liabilities.find(l => l.NAME === 'Loans (Liability)')?.Amount || 0;
  const capital = lst?.liabilities.find(l => l.NAME === 'Capital Account')?.Amount || 0;
  const pnl = lst?.liabilities.find(l => l.NAME === 'Profit & Loss A/c')?.Amount || 0;
  const equity = capital + pnl;
  const debtToEquity = equity ? (totalDebt / equity) : 0;

  return (
    <div className="font-sans text-slate-700 dark:text-slate-200 pt-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 dark:bg-blue-900/30 p-2.5 rounded-xl text-blue-600 dark:text-blue-400">
            <Layers size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Balance Sheet</h1>
            <p className="text-xs text-slate-500 font-medium">Financial position — liabilities vs assets</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-5 mb-5">
        <div className="flex flex-wrap xl:flex-nowrap items-end gap-4">
          <div className="w-full sm:w-36 shrink-0 space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              From Date <span className="text-red-500">*</span>
            </label>
            <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
          </div>
          <div className="w-full sm:w-36 shrink-0 space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              To Date <span className="text-red-500">*</span>
            </label>
            <input type="date" value={toDate} onChange={e => setToDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
          </div>
          
          <div className="flex items-center space-x-2 shrink-0 pb-0.5 ml-auto">
            <button onClick={handleSearch} disabled={loading} className="w-10 h-10 rounded-lg bg-[#2D9E75] text-white flex items-center justify-center hover:opacity-90 transition-all shadow-sm disabled:opacity-70 cursor-pointer" title="Search">
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

      {/* Content & Sidebar */}
      <div className="flex flex-col xl:flex-row gap-6 items-start">
        <div className="flex-1 w-full bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 size={28} className="animate-spin text-blue-500 mb-3" />
            <span className="text-sm text-slate-500 font-medium">Loading balance sheet...</span>
          </div>
        ) : !lst ? (
          <div className="text-center py-16">
            <Layers size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
            <p className="text-slate-500 text-sm">Select date range and click Search to generate the report.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-slate-700">
              {/* Liabilities */}
              <div className="p-4">
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-slate-800 dark:to-slate-800/80 px-4 py-3 rounded-t-xl border border-slate-200 dark:border-slate-700">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">Liabilities</span>
                    <span className="text-xs font-semibold text-slate-500">Total ({currencySymbol})</span>
                  </div>
                </div>
                <div className="border-x border-slate-200 dark:border-slate-700">
                  <table className="w-full text-left border-collapse">
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {lst.liabilities.map((item, i) => (
                        <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                          <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">{item.NAME}</td>
                          <td className="px-4 py-3 text-sm text-right font-mono text-slate-800 dark:text-slate-200">{fmt(item.Amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="bg-amber-600 px-4 py-3 rounded-b-xl flex items-center justify-between text-white font-bold">
                  <span className="text-sm uppercase">Total ({currencySymbol})</span>
                  <span className="text-base font-mono">{fmt(lst.totalLiabilities)}</span>
                </div>
              </div>

              {/* Assets */}
              <div className="p-4">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800/80 px-4 py-3 rounded-t-xl border border-slate-200 dark:border-slate-700">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">Assets</span>
                    <span className="text-xs font-semibold text-slate-500">Total ({currencySymbol})</span>
                  </div>
                </div>
                <div className="border-x border-slate-200 dark:border-slate-700">
                  <table className="w-full text-left border-collapse">
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {lst.assets.map((item, i) => (
                        <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                          <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">{item.NAME}</td>
                          <td className="px-4 py-3 text-sm text-right font-mono text-slate-800 dark:text-slate-200">{fmt(item.Amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="bg-blue-600 px-4 py-3 rounded-b-xl flex items-center justify-between text-white font-bold">
                  <span className="text-sm uppercase">Total ({currencySymbol})</span>
                  <span className="text-base font-mono">{fmt(lst.totalAssets)}</span>
                </div>
              </div>
            </div>

            {/* Balance status footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-center">
              <div className={`flex items-center gap-2 px-6 py-3 rounded-xl border ${isBalanced ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'}`}>
                <CheckCircle2 size={20} className={isBalanced ? 'text-emerald-500' : 'text-red-500'} />
                <span className={`text-xs font-bold uppercase tracking-wider ${isBalanced ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'}`}>
                  {isBalanced ? 'Balance Sheet is Balanced' : `Difference: ${fmt(Math.abs(lst.totalLiabilities - lst.totalAssets))}`}
                </span>
              </div>
            </div>
          </>
        )}
        </div>
        
        {/* Right Sidebar: Liquidity Insights */}
        {lst && (
          <aside className="w-full xl:w-[320px] shrink-0 flex flex-col gap-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm sticky top-6">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <LineChart size={18} />
                </div>
                <h3 className="font-extrabold text-lg">Liquidity Insights</h3>
              </div>
              <div className="flex flex-col gap-8">
                {/* Ratio 1 */}
                <div className="flex flex-col items-center gap-4 text-center">
                  <div className="relative w-32 h-32 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90">
                      <circle className="text-slate-100 dark:text-slate-800" cx="64" cy="64" fill="transparent" r="58" stroke="currentColor" strokeWidth="8"></circle>
                      <circle className="text-[#2D9E75]" cx="64" cy="64" fill="transparent" r="58" stroke="currentColor" strokeDasharray="364.4" strokeDashoffset={currentRatio > 2 ? 0 : 364.4 - (364.4 * (currentRatio / 2))} strokeLinecap="round" strokeWidth="10"></circle>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-black">{currentRatio.toFixed(2)}</span>
                      <span className="text-[10px] uppercase font-bold text-slate-400">Target: 1.2+</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">Current Ratio</h4>
                    <p className="text-xs text-slate-500 mt-1">Measuring ability to pay short-term obligations.</p>
                  </div>
                </div>
                <div className="h-px bg-slate-100 dark:bg-slate-800"></div>
                {/* Ratio 2 */}
                <div className="flex flex-col items-center gap-4 text-center">
                  <div className="relative w-32 h-32 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90">
                      <circle className="text-slate-100 dark:text-slate-800" cx="64" cy="64" fill="transparent" r="58" stroke="currentColor" strokeWidth="8"></circle>
                      <circle className="text-amber-500" cx="64" cy="64" fill="transparent" r="58" stroke="currentColor" strokeDasharray="364.4" strokeDashoffset={Math.abs(debtToEquity) > 2 ? 0 : 364.4 - (364.4 * (Math.abs(debtToEquity) / 2))} strokeLinecap="round" strokeWidth="10"></circle>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-black">{Math.abs(debtToEquity).toFixed(2)}</span>
                      <span className="text-[10px] uppercase font-bold text-slate-400">Target: 1.0</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">Debt-to-Equity</h4>
                    <p className="text-xs text-slate-500 mt-1">Financial leverage assessment.</p>
                  </div>
                </div>
                <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                  <div className="flex items-center gap-2 mb-2">
                    <Info size={16} className="text-amber-500" />
                    <span className="text-xs font-bold uppercase tracking-wide">Analysis</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {currentRatio < 1.2 ? "Liquidity is below target. " : "Liquidity is strong. "}
                    {Math.abs(debtToEquity) > 1 ? <span className="font-bold text-red-500">Debt leverage is high.</span> : "Debt leverage is manageable."}
                  </p>
                </div>
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};
