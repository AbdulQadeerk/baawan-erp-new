import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Search, RotateCcw, FileSpreadsheet, Loader2, UserSearch, Eye, Printer } from 'lucide-react';
import { reportApi } from '../../../../services/report.service';
import { ledgerApi } from '../../../../services/ledger.service';
import { commonApi } from '../../../../services/common.service';
import { invoiceApi } from '../../../../services/invoice.service';
import { toast } from '../../../../lib/toast';
import { storage } from '../../../../lib/storage';
import { STORAGE_KEYS } from '../../../../lib/constants';
import * as H from '../outstandingHelpers';

import { InvoiceDetailsModal } from '../../InvoiceDetailsModal';
import { VoucherDetailsModal } from '../../../../shared/VoucherDetailsModal';

export const SalesPersonOutstandingReport: React.FC = () => {
  const precision = H.getPrecision();

  const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);
  const [assignedUserID, setAssignedUserID] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [selectedSubGroups, setSelectedSubGroups] = useState<any[]>([]);
  const [lst, setLst] = useState<any[]>([]);
  const [uniqueLedLst, setUniqueLedLst] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [printLoading, setPrintLoading] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);
  const [pendingAmount, setPendingAmount] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const [salesPersonList, setSalesPersonList] = useState<any[]>([]);
  const [groupList, setGroupList] = useState<any[]>([]);
  const [childGroupList, setChildGroupList] = useState<any[]>([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'invoice' | 'voucher'>('invoice');
  const [selectedInvCode, setSelectedInvCode] = useState<number>(-1);
  const [selectedInvType, setSelectedInvType] = useState<number>(-1);
  const [invoiceList, setInvoiceList] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  useEffect(() => {
    // Load sales persons
    commonApi.getDropdown({ table: 18 }).then(data => {
      setSalesPersonList(data || []);
    }).catch(() => {});

    // Load group list from local storage
    const grpList = storage.getItem<any[]>(STORAGE_KEYS.GROUP_LIST) || [];
    setGroupList(grpList);
  }, []);

  const getChildGroupIds = (parentId: number, grpList: any[], result: number[]) => {
    const children = grpList.filter((g: any) => g.parentGroup === parentId);
    children.forEach((child: any) => {
      if (result.indexOf(child.id) === -1) {
        result.push(child.id);
        getChildGroupIds(child.id, grpList, result);
      }
    });
  };

  const onGroupChange = (groupId: string) => {
    setSelectedGroupId(groupId);
    setSelectedSubGroups([]);
    if (groupId) {
      const childIds: number[] = [];
      getChildGroupIds(Number(groupId), groupList, childIds);
      const childGroups = groupList.filter((g: any) => childIds.includes(g.id));
      setChildGroupList(childGroups);
    } else {
      setChildGroupList([]);
    }
  };

  const toggleSubGroup = (group: any) => {
    setSelectedSubGroups(prev => {
      const exists = prev.find(g => g.id === group.id);
      if (exists) return prev.filter(g => g.id !== group.id);
      return [...prev, group];
    });
  };

  const getFilters = useCallback(() => ({
    ledgers: [],
    assignedUserID: assignedUserID || null,
    toDate: H.formatDateForApi(toDate),
  }), [assignedUserID, toDate]);

  const submitReport = useCallback(async () => {
    setSubmitted(true);
    if (!assignedUserID) {
      toast.info('Please select a sales person.', 'Validation');
      return;
    }
    setLoading(true);
    try {
      const data = await reportApi.ledgerOutstanding(getFilters());
      if (data?.length) {
        // Filter by selected groups if applicable
        let filteredData = data;
        if (selectedSubGroups.length) {
          filteredData = data.filter((v: any) => selectedSubGroups.some(group => v.group === group.name));
        } else if (selectedGroupId) {
          // If group selected but no sub-groups, filter by parent group name
          const parentGroup = groupList.find(g => g.id == selectedGroupId);
          if (parentGroup) {
            filteredData = data.filter((v: any) => v.group === parentGroup.name);
          }
        }

        setLst(filteredData);

        if (filteredData.length) {
          const uniqueIds = [...new Set(filteredData.map((i: any) => i.ledgerId))];
          try {
            const res = await ledgerApi.multiLedgerInfo({ ledgers: uniqueIds });
            const groups: any[] = [];
            for (const element of res) {
              const grpRec = groupList.find(x => x.id == element.groupId);
              if (grpRec) element.group = grpRec.name;
              element.stateName = element.stateName || '';
              if (element.assignedUserID && salesPersonList.length) {
                const rec = salesPersonList.find((x: any) => x.id == element.assignedUserID);
                element.salesperson = rec ? rec.name : '-';
              } else {
                element.salesperson = '-';
              }
              const ledgerData = filteredData.filter((i: any) => i.ledgerId === element.id);
              groups.push({ ledger: element, data: ledgerData });
            }
            setUniqueLedLst(groups);
          } catch { setUniqueLedLst([]); }
          const { totalAmount: ta, pendingAmount: pa } = H.calculateTotals(filteredData, precision);
          setTotalAmount(ta);
          setPendingAmount(pa);
        } else {
          setUniqueLedLst([]);
          toast.info('No outstanding for selected criteria', 'Info');
        }
      } else {
        setLst([]); setUniqueLedLst([]);
        toast.info('No outstanding for selected party', 'Info');
      }
    } catch (err: any) {
      setLst([]); setUniqueLedLst([]);
      toast.info(err?.message || 'Error', 'Error');
    } finally { setLoading(false); }
  }, [getFilters, precision, assignedUserID, selectedSubGroups, selectedGroupId, groupList, salesPersonList]);

  const handleExport = async () => {
    if (!assignedUserID) {
      toast.info('Please select a sales person.', 'Validation');
      return;
    }
    setExportLoading(true);
    try {
      const blob = await reportApi.ledgerOutstandingExport(getFilters());
      if (blob?.size) {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'sales-person-outstandingReport.xlsx';
        a.click();
        URL.revokeObjectURL(a.href);
      } else toast.info('No data found to export.', 'Info');
    } catch {} finally { setExportLoading(false); }
  };

  const handlePrint = async () => {
    if (!assignedUserID) {
      toast.info('Please select a sales person.', 'Validation');
      return;
    }
    setPrintLoading(true);
    try {
      const blob = await reportApi.ledgerOutstandingPrint(getFilters());
      if (blob?.size) {
        const blobUrl = URL.createObjectURL(blob);
        window.open(blobUrl, '_blank');
      } else toast.info('No data to print.', 'Info');
    } catch (err: any) {
      toast.error(err?.message || 'Print failed');
    } finally { setPrintLoading(false); }
  };

  const handleClear = () => {
    setLst([]);
    setUniqueLedLst([]);
    setTotalAmount(0);
    setPendingAmount(0);
    setToDate(new Date().toISOString().split('T')[0]);
    setAssignedUserID('');
    setSelectedGroupId('');
    setSelectedSubGroups([]);
    setChildGroupList([]);
    setSubmitted(false);
  };

  const openInvDetailstPopup = async (rowData: any) => {
    if (rowData.invCode === -1) return;
    try {
      const isFromInvoice = rowData.fromInvoice !== undefined ? rowData.fromInvoice : false;
      const allItems = lst.map(x => ({
        invCode: x.invCode,
        invType: x.invType,
        fromInvoice: x.fromInvoice !== undefined ? x.fromInvoice : false,
        bill_No: x.bill_No || x.billNo,
        partyName: x.partyName || x.ledgerName,
        date: x.date,
        amount: x.pending
      })).filter(x => x.invCode !== -1);
      
      const index = allItems.findIndex(x => x.invCode === rowData.invCode);
      
      setModalType(isFromInvoice ? 'invoice' : 'voucher');
      setSelectedInvCode(rowData.invCode);
      setSelectedInvType(rowData.invType);
      setInvoiceList(allItems);
      setCurrentIndex(index);
      setModalOpen(true);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to load details');
    }
  };

  const FormatNumberValOpening = (row: any) =>
    `${H.formatNumber(row.opening, precision)} ${row.openingDrCr}`;

  const FormatNumberValPending = (row: any) =>
    `${H.formatNumber(row.pending, precision)} ${row.pendingDrCr}`;

  return (
    <div className="font-sans text-slate-700 dark:text-slate-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="bg-amber-100 dark:bg-amber-900/30 p-2.5 rounded-xl text-amber-600 dark:text-amber-400"><UserSearch size={22} /></div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Sales Person Outstanding</h1>
            <p className="text-xs text-slate-500 font-medium">Outstanding by sales person with group filtering</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-5 mb-5">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 block">To Date</label>
            <input type="date" value={toDate} onChange={e => setToDate(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all w-44" />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 block">Sales Person <span className="text-red-500">*</span></label>
            <select value={assignedUserID} onChange={e => setAssignedUserID(e.target.value)}
              className={`px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all w-52 ${submitted && !assignedUserID ? 'border-red-400' : 'border-slate-200 dark:border-slate-700'}`}>
              <option value="">Select Sales Person</option>
              {salesPersonList.map((sp: any, i) => (
                <option key={i} value={sp.id}>{sp.name}</option>
              ))}
            </select>
            {submitted && !assignedUserID && <p className="text-red-500 text-[10px] mt-1">This value is required.</p>}
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 block">Group</label>
            <select value={selectedGroupId} onChange={e => onGroupChange(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all w-52">
              <option value="">Select Group</option>
              <option value="16">Sundry Creditors</option>
              <option value="17">Sundry Debtors</option>
            </select>
          </div>
          {childGroupList.length > 0 && (
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 block">Child Groups</label>
              <div className="flex flex-wrap gap-1 max-w-xs p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg max-h-24 overflow-y-auto">
                {childGroupList.map((g: any, i) => (
                  <button key={i} onClick={() => toggleSubGroup(g)}
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all border ${selectedSubGroups.find(sg => sg.id === g.id)
                      ? 'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900/40 dark:text-amber-400 dark:border-amber-800'
                      : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-100 dark:bg-slate-700 dark:border-slate-600'}`}>
                    {g.name}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="flex items-center space-x-2 mt-4 md:mt-0">
            <button
              onClick={submitReport} disabled={loading}
              className="w-10 h-10 rounded-lg bg-[#2D9E75] text-white flex items-center justify-center hover:opacity-90 transition-all shadow-sm cursor-pointer disabled:opacity-70"
              title="Search"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
            </button>
            <button
              onClick={handleClear}
              className="w-10 h-10 rounded-lg bg-lime-500 text-white flex items-center justify-center hover:opacity-90 transition-all shadow-sm cursor-pointer"
              title="Reset Filters"
            >
              <RotateCcw size={16} />
            </button>
            <button
              onClick={handlePrint} disabled={printLoading}
              className="w-10 h-10 rounded-lg bg-rose-500 text-white flex items-center justify-center hover:opacity-90 transition-all shadow-sm cursor-pointer disabled:opacity-70"
              title="Print / PDF"
            >
              {printLoading ? <Loader2 size={16} className="animate-spin" /> : <Printer size={16} />}
            </button>
            <button
              onClick={handleExport} disabled={exportLoading}
              className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center hover:opacity-90 transition-all shadow-sm cursor-pointer disabled:opacity-70"
              title="Excel Export"
            >
              {exportLoading ? <Loader2 size={16} className="animate-spin" /> : <FileSpreadsheet size={16} />}
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col items-center justify-center py-16">
          <Loader2 size={28} className="animate-spin text-amber-500 mb-3" />
          <span className="text-sm text-slate-500 font-medium">Loading...</span>
        </div>
      ) : !uniqueLedLst.length ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm text-center py-16">
          <UserSearch size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
          <p className="text-slate-500 text-sm">No results yet. Select a sales person and click Search.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {uniqueLedLst.map((item, idx) => (
            <div key={idx} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-slate-800 dark:to-slate-800/80 p-3 border-b border-slate-200 dark:border-slate-700">
                <div className="text-center space-y-0.5">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                    {item.ledger.name} {item.ledger.group && <span className="text-xs font-normal text-slate-400">({item.ledger.group})</span>}
                  </h3>
                  {item.ledger.address && <p className="text-[10px] text-slate-500">{H.formatAddress(item.ledger)}</p>}
                  {item.ledger.mobile && <p className="text-[10px] text-slate-500">Mobile: {item.ledger.mobile}</p>}
                  <p className="text-[10px] text-slate-500">
                    Sales Person: {item.ledger.salesperson || '-'}, Credit Limit: {item.ledger.credit_Limit || 0}, Credit Days: {item.ledger.creditDays || 0}
                  </p>
                  <p className="text-[10px] text-slate-500">Due As on: {H.formatDisplayDate(toDate)}</p>
                </div>
              </div>
              <div className="overflow-auto max-h-[300px]">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 z-10">
                    <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                      <th className="px-4 py-2 text-[10px] font-bold text-slate-500 uppercase">Doc No</th>
                      <th className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase">Date</th>
                      <th className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase">Voucher</th>
                      <th className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase text-right">Amount</th>
                      <th className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase text-right">Pending</th>
                      <th className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase text-center">Over Due</th>
                      <th className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase text-center w-16">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {item.data.map((row: any, ri: number) => (
                      <tr key={ri} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                        <td className="px-4 py-2 text-xs font-semibold text-amber-600 dark:text-amber-400">{row.billNo}</td>
                        <td className="px-3 py-2 text-xs text-slate-500">{H.formatDateShort(row.date)}</td>
                        <td className="px-3 py-2 text-xs text-slate-500">{row.voucher}</td>
                        <td className="px-3 py-2 text-xs font-mono text-right">{FormatNumberValOpening(row)}</td>
                        <td className="px-3 py-2 text-xs font-mono font-bold text-right">{FormatNumberValPending(row)}</td>
                        <td className="px-3 py-2 text-center">
                          <span className={`text-[10px] font-bold ${row.overDue > 90 ? 'text-red-500' : row.overDue > 30 ? 'text-amber-500' : 'text-emerald-500'}`}>{row.overDue}d</span>
                        </td>
                        <td className="px-3 py-2 text-center">
                          {row.invCode !== -1 && (
                            <button onClick={() => openInvDetailstPopup(row)}
                              className="p-1 text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded transition-colors" title="View Details">
                              <Eye size={14} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <span className="text-xs font-bold text-slate-500">Total Rows: {item.data.length}</span>
                  <div className="flex gap-6">
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Total: {H.formatNumber(H.getLedgerTotals(item.data, precision), precision)}</span>
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400">Pending: {H.formatNumber(H.getLedgerPending(item.data, precision), precision)}</span>
                  </div>
                </div>
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
                  <span className="text-[10px] text-amber-500 font-bold uppercase tracking-wider block mb-1">Pending Amount</span>
                  <span className="text-lg font-black text-amber-600 dark:text-amber-400">{H.formatNumber(pendingAmount, precision)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Details Modal */}
      {modalOpen && modalType === 'invoice' && (
        <InvoiceDetailsModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          invCode={selectedInvCode}
          invType={selectedInvType}
          invoiceList={invoiceList}
          currentIndex={currentIndex}
        />
      )}

      {/* Voucher Details Modal */}
      {modalOpen && modalType === 'voucher' && (
        <VoucherDetailsModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          invCode={selectedInvCode}
          invType={selectedInvType}
        />
      )}
    </div>
  );
};
