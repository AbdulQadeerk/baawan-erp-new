import React, { useState, useCallback } from 'react';
import { Search, RotateCcw, FileSpreadsheet, Loader2, Layers, CheckCircle2 } from 'lucide-react';
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

  return (
    <div className="font-sans text-slate-700 dark:text-slate-200">
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
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 mb-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[280px]">
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 block">From Date <span className="text-red-500">*</span></label>
                <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
              </div>
              <div className="flex-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 block">To Date <span className="text-red-500">*</span></label>
                <input type="date" value={toDate} onChange={e => setToDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleSearch} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-bold transition-all shadow-lg shadow-blue-600/20">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
              <span className="hidden sm:inline">Search</span>
            </button>
            <button onClick={handleClear} className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 rounded-lg transition-all border border-slate-200 dark:border-slate-700"><RotateCcw size={16} /></button>
            <button onClick={handleExport} className="p-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-all shadow-lg shadow-emerald-500/20">
              {exportLoading ? <Loader2 size={16} className="animate-spin" /> : <FileSpreadsheet size={16} />}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
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
    </div>
  );
};
