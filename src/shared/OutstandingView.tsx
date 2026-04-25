/**
 * OutstandingView — React equivalent of Angular's OutstandingViewComponent
 * Angular: src/app/shared/outstanding-view/outstanding-view.component.ts
 *
 * Renders a grouped outstanding report (per ledger) with bill details,
 * and supports PDF and Excel export.
 */
import React from 'react';
import { Download, FileText } from 'lucide-react';

interface OutstandingViewProps {
  uniqueLedLst: any[];
  lst: any[];
  pendingAmount: number;
  totalAmount: number;
  precision?: number;
  fileName?: string;
  fromMultipleLedgerOutstanding?: boolean;
  onExportExcel?: () => void;
  onExportPdf?: () => void;
}

const fmt = (n: any, precision = 2) => {
  const v = parseFloat(n);
  return isNaN(v) ? '0.00' : '₹' + v.toLocaleString('en-IN', { minimumFractionDigits: precision, maximumFractionDigits: precision });
};

const formatDate = (val: string) => {
  if (!val) return '—';
  try { return new Date(val).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }); }
  catch { return val; }
};

const formatAddress = (ledger: any) => {
  const parts = [ledger.address, ledger.area, ledger.city, ledger.stateName].filter(p => p && p !== 'null');
  return parts.length ? parts.join(', ') : '—';
};

export const OutstandingView: React.FC<OutstandingViewProps> = ({
  uniqueLedLst = [],
  lst = [],
  pendingAmount = 0,
  totalAmount = 0,
  precision = 2,
  fileName = 'outstanding-report',
  fromMultipleLedgerOutstanding = false,
  onExportExcel,
  onExportPdf,
}) => {
  return (
    <div className="space-y-6">
      {/* Export bar */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-500">
          {uniqueLedLst.length} Ledger{uniqueLedLst.length !== 1 ? 's' : ''} • {lst.length} Record{lst.length !== 1 ? 's' : ''}
        </div>
        <div className="flex items-center gap-2">
          {onExportPdf && (
            <button onClick={onExportPdf} className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 text-xs font-semibold rounded-lg hover:bg-rose-100 transition">
              <FileText size={13} /> PDF
            </button>
          )}
          {onExportExcel && (
            <button onClick={onExportExcel} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold rounded-lg hover:bg-emerald-100 transition">
              <Download size={13} /> Excel
            </button>
          )}
        </div>
      </div>

      {/* Ledger groups */}
      {uniqueLedLst.map((item, idx) => (
        <div key={idx} className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
          {/* Ledger header */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 px-4 py-3">
            <h4 className="font-bold text-slate-800 dark:text-slate-100">{item.ledger?.name || '—'}</h4>
            <p className="text-xs text-slate-500 mt-0.5">{formatAddress(item.ledger || {})}</p>
            {item.ledger?.mobile && <p className="text-xs text-slate-500">Mobile: {item.ledger.mobile}</p>}
            {fromMultipleLedgerOutstanding && (
              <div className="flex gap-4 text-xs text-slate-500 mt-1">
                {item.ledger?.salesperson && <span>Sales Person: <b>{item.ledger.salesperson}</b></span>}
                <span>Credit Limit: <b>{item.ledger?.credit_Limit || 0}</b></span>
                <span>Credit Days: <b>{item.ledger?.creditDays || 0}</b></span>
              </div>
            )}
          </div>

          {/* Bill details table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                  <th className="px-3 py-2 text-left text-xs font-bold uppercase text-slate-500">Doc No</th>
                  <th className="px-3 py-2 text-left text-xs font-bold uppercase text-slate-500">Date</th>
                  <th className="px-3 py-2 text-left text-xs font-bold uppercase text-slate-500">Voucher</th>
                  <th className="px-3 py-2 text-right text-xs font-bold uppercase text-slate-500">Amount</th>
                  <th className="px-3 py-2 text-right text-xs font-bold uppercase text-slate-500">Pending</th>
                  <th className="px-3 py-2 text-right text-xs font-bold uppercase text-slate-500">Over Due</th>
                </tr>
              </thead>
              <tbody>
                {item.data?.map((row: any, rowIdx: number) => (
                  <tr key={rowIdx} className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="px-3 py-2 text-slate-700 dark:text-slate-300">{row.billNo || '—'}</td>
                    <td className="px-3 py-2 text-slate-600 dark:text-slate-400">{formatDate(row.date)}</td>
                    <td className="px-3 py-2 text-slate-600 dark:text-slate-400 text-xs">
                      {typeof row.voucher === 'string' ? row.voucher : Array.isArray(row.voucher) ? row.voucher.map((v: any) => `${v.billNo || ''} ${v.invtype || ''}`).join(', ') : '—'}
                    </td>
                    <td className="px-3 py-2 text-right font-semibold text-slate-800 dark:text-slate-200">
                      {fmt(row.opening, precision)} {row.openingDrCr && <span className="text-xs text-slate-400">{row.openingDrCr}</span>}
                    </td>
                    <td className="px-3 py-2 text-right font-semibold text-amber-600 dark:text-amber-400">
                      {fmt(row.pending, precision)} {row.pendingDrCr && <span className="text-xs text-slate-400">{row.pendingDrCr}</span>}
                    </td>
                    <td className="px-3 py-2 text-right text-slate-600 dark:text-slate-400">{row.overDue || 0}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 font-bold">
                  <td className="px-3 py-2 text-slate-600 dark:text-slate-400">Total: {item.data?.length || 0}</td>
                  <td className="px-3 py-2"></td>
                  <td className="px-3 py-2"></td>
                  <td className="px-3 py-2 text-right text-slate-800 dark:text-slate-200">{fmt(item.data?.reduce((s: number, r: any) => s + (Math.abs(r.opening) || 0), 0), precision)}</td>
                  <td className="px-3 py-2 text-right text-amber-600 dark:text-amber-400">{fmt(item.data?.reduce((s: number, r: any) => s + (Math.abs(r.pending) || 0), 0), precision)}</td>
                  <td className="px-3 py-2"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      ))}

      {/* Summary bar */}
      <div className="flex items-center justify-between bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-800/50 rounded-xl px-6 py-4 border border-slate-200 dark:border-slate-700">
        <span className="text-sm font-bold text-slate-600 dark:text-slate-300">Total Rows: {lst.length}</span>
        <div className="flex items-center gap-6 text-sm">
          <span className="text-slate-600 dark:text-slate-400">Total: <b className="text-slate-800 dark:text-slate-200">{fmt(totalAmount, precision)}</b></span>
          <span className="text-slate-600 dark:text-slate-400">Pending: <b className="text-amber-600 dark:text-amber-400">{fmt(pendingAmount, precision)}</b></span>
        </div>
      </div>
    </div>
  );
};
