import React, { useState, useEffect, useCallback } from 'react';
import { Eye, Loader2, RefreshCw, X } from 'lucide-react';
import { reportApi } from '../../../../services/report.service';
import { formatNumber, formatDateForApi, getPrecision, groupBy } from '../trialBalanceHelpers';
import { toast } from '../../../../lib/toast';
import { TrialBalanceLedgerRegisterDetails } from '../trial-balance-ledger-register-details/TrialBalanceLedgerRegisterDetails';

interface Props {
  recordData: any;
  refreshTrigger: number;
}

export const TrialBalanceLedgerRegister: React.FC<Props> = ({ recordData, refreshTrigger }) => {
  const precision = getPrecision();
  const [lst, setLst] = useState<any[]>([]);
  const [groupedData, setGroupedData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [openingAmount, setOpeningAmount] = useState(0);
  const [openingAmountDrCr, setOpeningAmountDrCr] = useState('');
  const [closingAmount, setClosingAmount] = useState(0);
  const [closingAmountDrCr, setClosingAmountDrCr] = useState('');
  const [selectedTab, setSelectedTab] = useState(1);
  const [tabs, setTabs] = useState<any[]>([]);
  const [counter, setCounter] = useState(2);

  const formatShortDate = (dateString: string): string => {
    const date = new Date(dateString);
    const month = new Intl.DateTimeFormat('en', { month: 'short' }).format(date);
    const year = date.getFullYear().toString().substr(-2);
    return `${month}-${year}`;
  };

  const submitReportView = useCallback(async () => {
    setLoading(true);
    try {
      const fdata = JSON.parse(JSON.stringify(recordData.value));
      const getIsop = (obj: any) => {
        if (!obj) return undefined;
        for (const key of ['ISOP', 'isOp', 'isop', 'IsOp']) { if (obj[key] !== undefined) return obj[key] ?? false; }
        return undefined;
      };
      let isopValue = getIsop(fdata);
      if (isopValue === undefined && fdata.ledger) isopValue = getIsop(fdata.ledger);
      if (isopValue !== undefined) fdata.openingBalance = isopValue;
      if (fdata.from) fdata.from = formatDateForApi(fdata.from, '00:00:00');
      if (fdata.to) fdata.to = formatDateForApi(fdata.to, '23:59:59');

      const data = await reportApi.ledgerRegister(fdata);
      if (data?.list?.length) {
        setLst(data.list);
        const openingEntry = data.list.find((e: any) => e.type === 'Opening Amount');
        if (fdata.openingBalance && openingEntry) {
          const val = openingEntry.credit || openingEntry.debit || 0;
          setOpeningAmount(val);
          setOpeningAmountDrCr(openingEntry.credit ? 'Cr' : openingEntry.debit ? 'Dr' : openingEntry.isCr ? 'Cr' : 'Dr');
        } else { setOpeningAmount(0); setOpeningAmountDrCr(''); }

        const transactionList = data.list.filter((e: any) => e.type !== 'Closing Amount' && e.type !== 'Current Total' && e.type !== 'Opening Amount');
        if (transactionList.length > 0) {
          const last = transactionList[transactionList.length - 1];
          setClosingAmount(last.running); setClosingAmountDrCr(last.drCr);
        } else if (fdata.openingBalance && openingEntry) {
          setClosingAmount(openingEntry.credit || openingEntry.debit || 0);
          setClosingAmountDrCr(openingEntry.credit ? 'Cr' : 'Dr');
        }

        const newArray = data.list.filter((v: any) => v.invVchId).map((v: any) => ({ ...v, shortDate: formatShortDate(v.billDate) }));
        const grouped = groupBy(newArray, 'shortDate');

        // Compute opening/closing for each month group
        let runOp = openingEntry ? (openingEntry.credit || openingEntry.debit || 0) : 0;
        let runDir = openingEntry ? (openingEntry.credit ? 'Cr' : 'Dr') : '';
        grouped.forEach((g: any) => {
          g.openingAmount = runOp;
          g.openingAmountDrCr = runDir;
          const filtered = g.value.filter((e: any) => e.type !== 'Opening Amount');
          const creditSum = filtered.reduce((s: number, v: any) => s + (v.credit || 0), 0);
          const debitSum = filtered.reduce((s: number, v: any) => s + (v.debit || 0), 0);
          let closingVal = 0, closingDir = runDir;
          if (!closingDir) {
            closingDir = creditSum > debitSum ? 'Cr' : 'Dr';
            closingVal = Math.abs(creditSum - debitSum);
          } else {
            closingVal = closingDir === 'Cr' ? runOp + creditSum - debitSum : runOp + debitSum - creditSum;
            if (closingVal < 0) { closingVal = Math.abs(closingVal); closingDir = closingDir === 'Cr' ? 'Dr' : 'Cr'; }
          }
          runOp = closingVal; runDir = closingDir;
          g.closingAmount = closingVal; g.closingAmountDrCr = closingDir;
        });
        setGroupedData(grouped);
      } else { setLst([]); setGroupedData([]); toast.info('No details found for selected ledger', 'Info'); }
    } catch { setLst([]); setGroupedData([]); }
    finally { setLoading(false); }
  }, [recordData]);

  useEffect(() => { submitReportView(); }, []);
  useEffect(() => { if (refreshTrigger > 0) submitReportView(); }, [refreshTrigger]);

  const addTab = (item: any) => {
    const existing = tabs.find(t => t.text === item.key);
    if (!existing) {
      const newId = counter;
      setCounter(c => c + 1);
      setTabs(prev => [...prev, { id: newId, text: item.key, record: item, parentName: recordData.name }]);
      setSelectedTab(newId);
    } else { setSelectedTab(existing.id); }
  };

  const closeTab = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    const remaining = tabs.filter(t => t.id !== id);
    setTabs(remaining);
    if (selectedTab === id) setSelectedTab(remaining.length > 0 ? remaining[remaining.length - 1].id : 1);
  };

  const getFilters = () => ({
    ledgerId: recordData.value.ledgerId, runningBalance: recordData.value.runningBalance,
    openingBalance: recordData.value.openingBalance, billDetails: recordData.value.billDetails,
    bankDetails: recordData.value.bankDetails, isPdc: recordData.value.isPdc,
    from: recordData.value.from, to: recordData.value.to,
    includeChildLedgers: recordData.value.includeChildLedgers, monthWise: recordData.value.monthWise,
    name: recordData.name,
  });

  return (
    <div className="mt-2">
      {/* Inner tab bar */}
      <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-700 mb-0 overflow-x-auto">
        <button onClick={() => setSelectedTab(1)}
          className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-all whitespace-nowrap ${selectedTab === 1 ? 'bg-white dark:bg-slate-800 text-blue-600 border border-b-0 border-slate-200 dark:border-slate-700' : 'text-slate-500 hover:text-slate-700'}`}>
          Report
        </button>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setSelectedTab(tab.id)}
            className={`px-3 py-2 text-xs font-medium rounded-t-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${selectedTab === tab.id ? 'bg-white dark:bg-slate-800 text-blue-600 border border-b-0 border-slate-200 dark:border-slate-700' : 'text-slate-500 hover:text-slate-700'}`}>
            {tab.text}
            <span onClick={(e) => closeTab(e, tab.id)} className="ml-1 p-0.5 rounded hover:bg-red-100 hover:text-red-500 transition-colors"><X size={11} /></span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      {selectedTab === 1 && (
        <div className="bg-white dark:bg-slate-900 rounded-b-xl border border-t-0 border-slate-200 dark:border-slate-700">
          {loading ? (
            <div className="flex items-center justify-center py-12"><Loader2 size={20} className="animate-spin text-blue-500 mr-2" /><span className="text-sm text-slate-500">Loading ledger data...</span></div>
          ) : (
            <div className="overflow-auto max-h-[calc(100vh-340px)]">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                    <th className="px-3 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider w-10"></th>
                    <th className="px-3 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Month</th>
                    <th className="px-3 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Opening</th>
                    <th className="px-3 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Debit</th>
                    <th className="px-3 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Credit</th>
                    <th className="px-3 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">
                      Closing
                      <button onClick={submitReportView} className="ml-2 p-1 bg-blue-500 hover:bg-blue-600 text-white rounded transition-all inline-flex" title="Refresh">
                        <RefreshCw size={10} />
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {groupedData.length === 0 ? (
                    <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-400">No data found</td></tr>
                  ) : groupedData.map((group, i) => {
                    const debitSum = group.value.filter((e: any) => e.type !== 'Opening Amount').reduce((s: number, v: any) => s + (v.debit || 0), 0);
                    const creditSum = group.value.filter((e: any) => e.type !== 'Opening Amount').reduce((s: number, v: any) => s + (v.credit || 0), 0);
                    return (
                      <tr key={i} className="hover:bg-blue-50/50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-3 py-2 text-center">
                          <button onClick={() => addTab(group)} className="text-emerald-500 hover:text-emerald-600 transition-colors" title="View Details"><Eye size={14} /></button>
                        </td>
                        <td className="px-3 py-2 text-sm font-semibold text-slate-800 dark:text-slate-200">{group.key}</td>
                        <td className="px-3 py-2 text-xs text-right font-mono text-slate-600 dark:text-slate-400">{formatNumber(group.openingAmount, precision)}</td>
                        <td className="px-3 py-2 text-xs text-right font-mono text-slate-600 dark:text-slate-400">{formatNumber(debitSum, precision)}</td>
                        <td className="px-3 py-2 text-xs text-right font-mono text-slate-600 dark:text-slate-400">{formatNumber(creditSum, precision)}</td>
                        <td className="px-3 py-2 text-xs text-right font-mono font-semibold text-slate-800 dark:text-slate-200">{formatNumber(group.closingAmount, precision)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tabs.filter(t => t.id === selectedTab).map(tab => (
        <div key={tab.id} className="bg-white dark:bg-slate-900 rounded-b-xl border border-t-0 border-slate-200 dark:border-slate-700">
          <TrialBalanceLedgerRegisterDetails data={tab} formData={getFilters()} searchForm={recordData} onRefresh={submitReportView} />
        </div>
      ))}
    </div>
  );
};
