import React, { useState, useCallback, useEffect } from 'react';
import { Search, Eraser, FileDown, Printer, Mail, MessageSquare, MessageCircle, BarChart3, Eye, FileText } from 'lucide-react';
import { reportApi } from '../../../../services/report.service';
import { commonApi } from '../../../../services/common.service';
import { toast } from '../../../../lib/toast';
import * as H from '../../outstanding/outstandingHelpers';
import { ledgerApi } from '../../../../services/ledger.service';
import { CommonAutocompleteTemplate } from '../../../../shared/CommonAutocompleteTemplate';
import { useRef } from 'react';

// ─── Autocomplete Input Component ──────────────────────────────────────────
const AutocompleteInput: React.FC<{
  label: string;
  value: any;
  options: any[];
  onChange: (val: any) => void;
  placeholder: string;
  displayField?: string;
  templateType?: string;
  disabled?: boolean;
}> = ({
  label,
  value,
  options,
  onChange,
  placeholder,
  displayField = 'name',
  templateType = 'name',
  disabled = false,
}) => {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered =
    search.length >= 1
      ? options
          .filter((o) =>
            o[displayField]?.toLowerCase().includes(search.toLowerCase()),
          )
          .slice(0, 10)
      : [];

  return (
    <div className="space-y-1 relative" ref={ref}>
      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
        {label}
      </label>
      <div className="relative">
        <input
          type="search"
          disabled={disabled}
          placeholder={placeholder}
          value={value ? value[displayField] || '' : search}
          onChange={(e) => {
            setSearch(e.target.value);
            onChange(null);
            setOpen(true);
          }}
          onFocus={() => !disabled && setOpen(true)}
          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D9E75]/20 focus:border-[#2D9E75] transition-all disabled:opacity-50 pr-8"
        />
        {value && (
          <button 
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-500"
            onClick={() => { onChange(null); setSearch(''); }}
          >
            <Eraser size={14} />
          </button>
        )}
      </div>
      {open && filtered.length > 0 && !disabled && (
        <div className="absolute z-50 top-full mt-1 w-full min-w-[300px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl max-h-60 overflow-y-auto">
          {filtered.map((opt, i) => (
            <button
              key={i}
              onClick={() => {
                onChange(opt);
                setSearch('');
                setOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700 last:border-0"
            >
              <CommonAutocompleteTemplate
                result={opt}
                templateType={templateType}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export const LedgerRegisterReport: React.FC = () => {
  const precision = H.getPrecision();

  const [ledgers, setLedgers] = useState<any[]>([]);
  const [selectedLedger, setSelectedLedger] = useState<any>(null);

  const [projectSites, setProjectSites] = useState<any[]>([]);
  const [selectedProjectSiteId, setSelectedProjectSiteId] = useState<number | null>(null);

  const [fromDate, setFromDate] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
  );
  const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [openingBalance, setOpeningBalance] = useState(true);
  const [runningBalance, setRunningBalance] = useState(true);
  const [billDetails, setBillDetails] = useState(false);
  const [childLedgers, setChildLedgers] = useState(false);
  const [monthWise, setMonthWise] = useState(false);
  const [columnType, setColumnType] = useState<number>(1); // 1 = All, 2 = Credit, 3 = Debit
  
  const [lst, setLst] = useState<any[]>([]);
  const [groupedData, setGroupedData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  
  const [openingAmount, setOpeningAmount] = useState<number>(0);
  const [closingAmount, setClosingAmount] = useState<number>(0);
  const [currentTotal, setCurrentTotal] = useState<number>(0);

  useEffect(() => {
    // Fetch detailed ledgers for autocomplete
    ledgerApi.search({ name: '', lockFreeze: false }).then((data) => {
      const list = data?.list || data?.data?.list || (Array.isArray(data) ? data : []);
      setLedgers(list);
    }).catch(console.error);

    commonApi.getDropdown({ table: 13 }).then((data) => {
      setProjectSites(data);
    });
  }, []);

  const getFilters = useCallback(() => ({
    ledgerId: selectedLedger ? (selectedLedger.id || selectedLedger.ledger_id || 0) : 0,
    projectSiteId: selectedProjectSiteId || 0,
    from: H.formatDisplayDate(fromDate) + ' 00:00:00',
    to: H.formatDisplayDate(toDate) + ' 23:59:59',
    openingBalance,
    runningBalance,
    billDetails,
    bankDetails: false,
    isPdc: false,
    includeChildLedgers: childLedgers,
    monthWise,
    columnType: columnType.toString()
  }), [selectedLedger, selectedProjectSiteId, fromDate, toDate, openingBalance, runningBalance, billDetails, childLedgers, monthWise, columnType]);

  const submitReport = useCallback(async () => {
    if (!selectedLedger) {
      toast.info('Please select a ledger', 'Info');
      return;
    }
    setLoading(true);
    try {
      const data = await reportApi.ledgerRegister(getFilters());
      if (data && data.list?.length) {
        setLst(data.list);
        setOpeningAmount(data.openingBal || 0);
        
        const filteredList = data.list.filter((entry: any) => 
          entry.type !== "Closing Amount" && 
          entry.type !== "Current Total" && 
          entry.type !== "Opening Amount"
        );
        
        const sumCredit = filteredList.reduce((total: number, entry: any) => 
          (entry.credit !== null ? total + entry.credit : total), 0);
        const sumDebit = filteredList.reduce((total: number, entry: any) => 
          (entry.debit !== null ? total + entry.debit : total), 0);
          
        setCurrentTotal(Math.abs(sumDebit - sumCredit));

        const openingEntry = data.list.find((entry: any) => entry.type === "Opening Amount");
        const isOpeningCredit = openingEntry && openingEntry.isCr;
        
        let closingAmt = 0;
        if (isOpeningCredit) {
          closingAmt = (data.openingBal || 0) + sumCredit - sumDebit;
        } else {
          closingAmt = (data.openingBal || 0) + sumDebit - sumCredit;
        }
        setClosingAmount(closingAmt);
        
        if (monthWise) {
          const gData = data.list.reduce((acc: any, item: any) => {
            const key = `${item.InvMonth}-${item.InvYear}`;
            if (!acc[key]) acc[key] = { key, openingAmount: item.opening || 0, credit: 0, debit: 0, closingAmount: 0 };
            acc[key].credit += item.credit || 0;
            acc[key].debit += item.debit || 0;
            acc[key].closingAmount = acc[key].openingAmount + acc[key].credit - acc[key].debit;
            return acc;
          }, {});
          setGroupedData(Object.values(gData));
        } else {
          setGroupedData([]);
        }
      } else {
        setLst([]);
        setGroupedData([]);
        setOpeningAmount(0);
        setClosingAmount(0);
        setCurrentTotal(0);
        toast.info('No data found', 'Info');
      }
    } catch (err: any) {
      setLst([]);
      setGroupedData([]);
      toast.info(err?.message || 'Error', 'Error');
    } finally {
      setLoading(false);
    }
  }, [getFilters, selectedLedger, monthWise]);

  const handleExport = async () => {
    if (!selectedLedger) return;
    setExportLoading(true);
    try {
      const blob = await reportApi.ledgerRegisterExport(getFilters());
      if (blob?.size) {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'ledger-register.xlsx';
        a.click();
        URL.revokeObjectURL(a.href);
      } else toast.info('No data found to export.', 'Info');
    } catch {
    } finally {
      setExportLoading(false);
    }
  };

  const handleClear = () => {
    setLst([]);
    setGroupedData([]);
    setSelectedLedger(null);
    setSelectedProjectSiteId(null);
    setFromDate(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
    setToDate(new Date().toISOString().split('T')[0]);
    setOpeningBalance(true);
    setRunningBalance(true);
    setBillDetails(false);
    setChildLedgers(false);
    setMonthWise(false);
    setColumnType(1);
    setOpeningAmount(0);
    setClosingAmount(0);
    setCurrentTotal(0);
  };

  const selectedLedgerName = selectedLedger ? selectedLedger.name : '';

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900/50">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Ledger Register</h1>
        <div className="text-sm font-semibold text-slate-600 dark:text-slate-300">
          {selectedLedgerName ? `Ledger : ${selectedLedgerName} | ` : ''}
          Date : {H.formatDateShort(fromDate)} - {H.formatDateShort(toDate)}
        </div>
      </div>

      <div className="p-6">
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-5">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-y-4 gap-x-6 items-end">
            
            {/* First Row */}
            <div className="md:col-span-4">
              <AutocompleteInput
                label="Select Ledger"
                placeholder="Select Ledger"
                value={selectedLedger}
                options={ledgers}
                onChange={setSelectedLedger}
                templateType="ledger"
              />
            </div>

            <div className="md:col-span-3 space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">From Date <span className="text-rose-500">*</span></label>
              <input
                type="date"
                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#2D9E75]/20 focus:border-[#2D9E75] transition-all"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>

            <div className="md:col-span-3 space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">To Date <span className="text-rose-500">*</span></label>
              <input
                type="date"
                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#2D9E75]/20 focus:border-[#2D9E75] transition-all"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>
            
            <div className="md:col-span-2 flex flex-col gap-1.5 justify-center mt-2 md:mt-0">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-[#2D9E75]" checked={openingBalance} onChange={(e) => setOpeningBalance(e.target.checked)} />
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Opening Bal</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-[#2D9E75]" checked={runningBalance} onChange={(e) => setRunningBalance(e.target.checked)} />
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Running Bal</span>
              </label>
            </div>

            {/* Second Row */}
            <div className="md:col-span-4 space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Project Site</label>
              <select
                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#2D9E75]/20 focus:border-[#2D9E75] transition-all"
                value={selectedProjectSiteId || ''}
                onChange={(e) => setSelectedProjectSiteId(Number(e.target.value))}
              >
                <option value="">Project Site</option>
                {projectSites.map(l => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-4 flex items-center justify-between px-2">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-[#2D9E75]" checked={billDetails} onChange={(e) => setBillDetails(e.target.checked)} />
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Bill Details</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-[#2D9E75]" checked={childLedgers} onChange={(e) => setChildLedgers(e.target.checked)} />
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Child Ledgers</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-[#2D9E75]" checked={monthWise} onChange={(e) => setMonthWise(e.target.checked)} />
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Month Wise</span>
              </label>
            </div>
            
            <div className="md:col-span-4 flex items-center gap-4 border-l border-slate-200 dark:border-slate-700 pl-4 h-full">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="radio" name="colType" value={1} checked={columnType === 1} onChange={() => setColumnType(1)} className="text-blue-600 focus:ring-[#2D9E75]" />
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">All</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="radio" name="colType" value={2} checked={columnType === 2} onChange={() => setColumnType(2)} className="text-blue-600 focus:ring-[#2D9E75]" />
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Credit</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="radio" name="colType" value={3} checked={columnType === 3} onChange={() => setColumnType(3)} className="text-blue-600 focus:ring-[#2D9E75]" />
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Debit</span>
              </label>
            </div>

            {/* Action Buttons */}
            <div className="md:col-span-12 flex flex-wrap items-center gap-3 mt-2 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button onClick={submitReport} disabled={loading} title="Search" className="w-10 h-10 flex items-center justify-center bg-[#2D9E75] text-white rounded-lg hover:opacity-90 transition-all shadow-sm disabled:opacity-70">
                {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Search size={16} />}
              </button>
              <button onClick={handleClear} title="Clear" className="w-10 h-10 flex items-center justify-center bg-lime-500 text-white rounded-lg hover:opacity-90 transition-all shadow-sm">
                <Eraser size={16} />
              </button>
              <button onClick={handleExport} disabled={exportLoading || loading || !lst.length} title="Export" className="w-10 h-10 flex items-center justify-center bg-blue-500 text-white rounded-lg hover:opacity-90 transition-all shadow-sm disabled:opacity-70">
                {exportLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FileDown size={16} />}
              </button>
              <button disabled={!lst.length} title="Print" className="w-10 h-10 flex items-center justify-center bg-stone-600 text-white rounded-lg hover:opacity-90 transition-all shadow-sm disabled:opacity-70">
                <Printer size={16} />
              </button>
              <button disabled={!lst.length} title="Email" className="w-10 h-10 flex items-center justify-center bg-emerald-500 text-white rounded-lg hover:opacity-90 transition-all shadow-sm disabled:opacity-70">
                <Mail size={16} />
              </button>
              <button disabled={!lst.length} title="WhatsApp" className="w-10 h-10 flex items-center justify-center bg-stone-700 text-white rounded-lg hover:opacity-90 transition-all shadow-sm disabled:opacity-70">
                <MessageCircle size={16} />
              </button>
              <button disabled={!lst.length} title="SMS" className="w-10 h-10 flex items-center justify-center bg-amber-800 text-white rounded-lg hover:opacity-90 transition-all shadow-sm disabled:opacity-70">
                <MessageSquare size={16} />
              </button>
              <button disabled={!lst.length} title="Chart" className="w-10 h-10 flex items-center justify-center bg-yellow-500 text-white rounded-lg hover:opacity-90 transition-all shadow-sm disabled:opacity-70">
                <BarChart3 size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {lst.length > 0 && (
        <div className="px-6 pb-6 flex-1 flex flex-col min-h-0">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col h-full overflow-hidden">
            
            <div className="flex-1 overflow-auto">
              {monthWise ? (
                <table className="w-full text-sm text-left whitespace-nowrap">
                  <thead className="bg-slate-100/50 dark:bg-slate-800/30 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 sticky top-0 z-10">
                    <tr>
                      <th className="px-4 py-3 font-bold">Month</th>
                      <th className="px-4 py-3 font-bold text-right">Opening</th>
                      <th className="px-4 py-3 font-bold text-right">Credit</th>
                      <th className="px-4 py-3 font-bold text-right">Debit</th>
                      <th className="px-4 py-3 font-bold text-right">Closing</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                    {groupedData.map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">{row.key}</td>
                        <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-400">{H.formatNumber(row.openingAmount, precision)}</td>
                        <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-400">{H.formatNumber(row.credit, precision)}</td>
                        <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-400">{H.formatNumber(row.debit, precision)}</td>
                        <td className="px-4 py-3 text-right font-black text-blue-600 dark:text-blue-400">{H.formatNumber(row.closingAmount, precision)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <table className="w-full text-sm text-left whitespace-nowrap">
                  <thead className="bg-[#fcf8e3] dark:bg-amber-900/20 border-b border-slate-200 dark:border-slate-700 text-slate-700 dark:text-amber-200/80 sticky top-0 z-10">
                    <tr>
                      <th className="px-4 py-3 font-bold text-xs uppercase">Doc No</th>
                      <th className="px-4 py-3 font-bold text-xs uppercase">Bill Date</th>
                      <th className="px-4 py-3 font-bold text-xs uppercase">Particular</th>
                      <th className="px-4 py-3 font-bold text-xs uppercase">Type</th>
                      <th className="px-4 py-3 font-bold text-xs uppercase text-right">Debit</th>
                      <th className="px-4 py-3 font-bold text-xs uppercase text-right">Credit</th>
                      <th className="px-4 py-3 font-bold text-xs uppercase text-right">Running</th>
                      <th className="px-4 py-3 font-bold text-xs uppercase">Note</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                    <tr className="bg-slate-50/30 dark:bg-slate-800/10">
                      <td colSpan={3}></td>
                      <td className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">Opening Amount</td>
                      <td className="px-4 py-2 text-right font-mono text-slate-500"></td>
                      <td className="px-4 py-2 text-right font-mono text-slate-600 dark:text-slate-300">{H.formatNumber(openingAmount, precision)}</td>
                      <td colSpan={2}></td>
                    </tr>
                    
                    {lst.map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="px-4 py-2 font-medium text-slate-800 dark:text-slate-200">{row.docNo || row.billNo}</td>
                        <td className="px-4 py-2 text-slate-600 dark:text-slate-400">{H.formatDateShort(row.date)}</td>
                        <td className="px-4 py-2 text-slate-600 dark:text-slate-400">{row.particular || row.party}</td>
                        <td className="px-4 py-2 text-slate-600 dark:text-slate-400">{row.type}</td>
                        <td className="px-4 py-2 text-right font-mono text-slate-600 dark:text-slate-400">{H.formatNumber(row.debit, precision)}</td>
                        <td className="px-4 py-2 text-right font-mono text-slate-600 dark:text-slate-400">{H.formatNumber(row.credit, precision)}</td>
                        <td className="px-4 py-2 text-right font-mono text-blue-600 dark:text-blue-400 font-semibold">{H.formatNumber(row.runningAmount, precision)}</td>
                        <td className="px-4 py-2 text-slate-500 text-xs truncate max-w-[150px]">{row.note}</td>
                      </tr>
                    ))}
                    
                    <tr className="bg-slate-50/30 dark:bg-slate-800/10 border-t border-slate-200 dark:border-slate-700">
                      <td colSpan={3}></td>
                      <td className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">Current Total</td>
                      <td className="px-4 py-2 text-right font-mono font-semibold text-slate-800 dark:text-slate-100">{H.formatNumber(currentTotal, precision)}</td>
                      <td className="px-4 py-2 text-right font-mono font-semibold text-slate-800 dark:text-slate-100">{H.formatNumber(currentTotal, precision)}</td>
                      <td colSpan={2}></td>
                    </tr>
                    <tr className="bg-slate-50/30 dark:bg-slate-800/10">
                      <td colSpan={3}></td>
                      <td className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">Closing Amount</td>
                      <td className="px-4 py-2 text-right font-mono text-slate-500"></td>
                      <td className="px-4 py-2 text-right font-mono text-slate-600 dark:text-slate-300">{H.formatNumber(closingAmount, precision)}</td>
                      <td colSpan={2}></td>
                    </tr>
                  </tbody>
                </table>
              )}
            </div>
            
            {/* Footer summary matching screenshot */}
            <div className="bg-[#d9edf7] dark:bg-blue-900/30 border-t border-slate-200 dark:border-slate-700 p-3 flex items-center justify-between">
              <div className="font-bold text-slate-800 dark:text-blue-100 text-sm">Total Rows : {lst.length}</div>
              <div className="font-bold text-slate-800 dark:text-blue-100 text-sm">Opening Amount : ₹{H.formatNumber(openingAmount, precision)}</div>
              <div className="font-bold text-slate-800 dark:text-blue-100 text-sm">Closing Amount : ₹{H.formatNumber(closingAmount, precision)}</div>
              
              <div className="flex gap-2">
                <button className="w-7 h-7 bg-indigo-500 text-white rounded flex items-center justify-center hover:bg-indigo-600"><Printer size={14}/></button>
                <button className="w-7 h-7 bg-lime-500 text-white rounded flex items-center justify-center hover:bg-lime-600"><FileText size={14}/></button>
                <button className="w-7 h-7 bg-amber-500 text-white rounded flex items-center justify-center hover:bg-amber-600"><FileText size={14}/></button>
                <button className="w-7 h-7 bg-rose-500 text-white rounded flex items-center justify-center hover:bg-rose-600"><FileText size={14}/></button>
              </div>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
};
