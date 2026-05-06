import React, { useState, useEffect } from 'react';
import { Loader2, RefreshCw, Printer } from 'lucide-react';
import { reportApi } from '../../../../services/report.service';
import { formatNumber, getPrecision } from '../trialBalanceHelpers';
import { toast } from '../../../../lib/toast';
import { INVOICE_VOUCHER_TYPES_BY_ID } from '../../../../lib/constants';

interface Props {
  data: any;
  formData: any;
  searchForm: any;
  onRefresh: () => void;
}

export const TrialBalanceLedgerRegisterDetails: React.FC<Props> = ({ data, formData, searchForm, onRefresh }) => {
  const precision = getPrecision();
  const [lst, setLst] = useState<any[]>([]);
  const [openingAmount, setOpeningAmount] = useState(0);
  const [openingAmountDrCr, setOpeningAmountDrCr] = useState('');
  const [closingAmount, setClosingAmount] = useState(0);
  const [closingAmountDrCr, setClosingAmountDrCr] = useState('');

  useEffect(() => {
    if (data?.record?.value) {
      setLst(data.record.value);
      setOpeningAmount(data.record.openingAmount || 0);
      setOpeningAmountDrCr(data.record.openingAmountDrCr || '');
      setClosingAmount(data.record.closingAmount || 0);
      setClosingAmountDrCr(data.record.closingAmountDrCr || '');
    }
  }, [data]);

  const filteredList = lst.filter(e => e.type !== 'Closing Amount' && e.type !== 'Current Total' && e.type !== 'Opening Amount');
  const totalDebit = filteredList.reduce((s, v) => s + (v.debit || 0), 0);
  const totalCredit = filteredList.reduce((s, v) => s + (v.credit || 0), 0);

  const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('en-GB') : '';

  return (
    <div className="mt-2">
      <div className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800/60 dark:to-slate-800/40 border-b border-slate-200 dark:border-slate-700 rounded-t-xl">
        <div className="flex items-center gap-2">
          <button onClick={onRefresh} className="p-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all" title="Refresh">
            <RefreshCw size={13} />
          </button>
        </div>
        <div className="flex items-center gap-6 text-sm">
          {searchForm?.value?.openingBalance && (
            <div><span className="text-slate-500 mr-1">Opening:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{formatNumber(openingAmount, precision)} {openingAmountDrCr}</span>
            </div>
          )}
          <div><span className="text-slate-500 mr-1">Closing:</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">{formatNumber(closingAmount, precision)} {closingAmountDrCr}</span>
          </div>
        </div>
      </div>
      <div className="overflow-auto max-h-[calc(100vh-340px)]">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 z-10">
            <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
              <th className="px-3 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Doc No</th>
              <th className="px-3 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Date</th>
              <th className="px-3 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Particular</th>
              <th className="px-3 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Type</th>
              <th className="px-3 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Debit</th>
              <th className="px-3 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Credit</th>
              <th className="px-3 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Running</th>
              <th className="px-3 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider w-10"></th>
              <th className="px-3 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Note</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredList.length === 0 ? (
              <tr><td colSpan={9} className="px-4 py-8 text-center text-sm text-slate-400">No transaction records found</td></tr>
            ) : filteredList.map((row, i) => (
              <tr key={i} className="hover:bg-blue-50/50 dark:hover:bg-slate-800/50 transition-colors">
                <td className="px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300">{row.billNo}</td>
                <td className="px-3 py-2 text-xs text-slate-500">{formatDate(row.billDate)}</td>
                <td className="px-3 py-2 text-sm text-slate-800 dark:text-slate-200">{row.particular}</td>
                <td className="px-3 py-2 text-xs text-slate-500">{row.type}</td>
                <td className="px-3 py-2 text-xs text-right font-mono text-slate-700 dark:text-slate-300">{row.debit ? formatNumber(row.debit, precision) : ''}</td>
                <td className="px-3 py-2 text-xs text-right font-mono text-slate-700 dark:text-slate-300">{row.credit ? formatNumber(row.credit, precision) : ''}</td>
                <td className="px-3 py-2 text-xs text-right font-mono font-semibold text-slate-800 dark:text-slate-200">{row.running != null ? formatNumber(row.running, precision) : ''}</td>
                <td className="px-3 py-2 text-xs text-slate-400 italic">{row.drCr}</td>
                <td className="px-3 py-2 text-xs text-slate-400 truncate max-w-[150px]">{row.note}</td>
              </tr>
            ))}
          </tbody>
          {filteredList.length > 0 && (
            <tfoot>
              <tr className="bg-slate-100 dark:bg-slate-800 font-bold border-t-2 border-slate-300 dark:border-slate-600">
                <td colSpan={4} className="px-3 py-2.5 text-xs text-slate-700 dark:text-slate-300">Total</td>
                <td className="px-3 py-2.5 text-xs text-right font-mono text-slate-800 dark:text-slate-200">{formatNumber(totalDebit, precision)}</td>
                <td className="px-3 py-2.5 text-xs text-right font-mono text-slate-800 dark:text-slate-200">{formatNumber(totalCredit, precision)}</td>
                <td colSpan={3}></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
};
