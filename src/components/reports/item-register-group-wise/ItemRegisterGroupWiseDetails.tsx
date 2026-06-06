import React, { useState, useEffect } from 'react';
import { ChevronLeft, FileSpreadsheet, Loader2, BarChart2, Eye } from 'lucide-react';
import { reportApi } from '../../../services/report.service';
import { toast } from '../../../lib/toast';
import * as H from '../outstanding/outstandingHelpers';
import { InvoiceDetailsModal } from '../InvoiceDetailsModal';

interface ItemRegisterGroupWiseDetailsProps {
  filters: any;
  itemCode: string;
  itemName: string;
  itemId: string;
  monthString: string;
  onBack: () => void;
}

export const ItemRegisterGroupWiseDetails: React.FC<ItemRegisterGroupWiseDetailsProps> = ({
  filters,
  itemCode,
  itemName,
  itemId,
  monthString,
  onBack
}) => {
  const precision = H.getPrecision();
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);

  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, [filters, monthString]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { startDate, endDate } = getMonthStartEnd(monthString);
      
      const payload = {
        ...filters,
        fromDate: startDate ? H.formatDateForApi(startDate.toISOString()) : filters.fromDate,
        toDate: endDate ? H.formatDateForApi(endDate.toISOString()) : filters.toDate,
        itemId: itemId,
      };

      const res = await reportApi.itemRegister(payload);
      setData(res || []);
    } catch (err: any) {
      toast.error(err?.message || "Failed to fetch details");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const getMonthStartEnd = (monthStr: string) => {
    if (!monthStr || monthStr === "No Date") return { startDate: null, endDate: null };
    const months: any = {
      January: 0, February: 1, March: 2, April: 3, May: 4, June: 5,
      July: 6, August: 7, September: 8, October: 9, November: 10, December: 11
    };
    const parts = monthStr.split(' ');
    if (parts.length < 2) return { startDate: null, endDate: null };
    const monthName = parts[0];
    const year = parseInt(parts[1], 10);
    const monthIndex = months[monthName];
    if (monthIndex === undefined) return { startDate: null, endDate: null };

    const startDate = new Date(year, monthIndex, 1);
    const endDate = new Date(year, monthIndex + 1, 0);
    return { startDate, endDate };
  };

  const handleExport = async () => {
    setExportLoading(true);
    try {
      const { startDate, endDate } = getMonthStartEnd(monthString);
      const payload = {
        ...filters,
        fromDate: startDate ? H.formatDateForApi(startDate.toISOString()) : filters.fromDate,
        toDate: endDate ? H.formatDateForApi(endDate.toISOString()) : filters.toDate,
        itemId: itemId,
      };

      const blob = await reportApi.salesRegisterDetailReportExport(payload);
      if (blob?.size) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `item-register-details-${monthString}.xlsx`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        toast.info("No data found to export.");
      }
    } catch (err: any) {
      toast.error(err?.message || "Export failed");
    } finally {
      setExportLoading(false);
    }
  };

  const openModal = (row: any) => {
    if (!row.Invcode) return;
    setModalData({
      invCode: row.Invcode,
      invType: row.TypeId,
      recordData: row,
    });
    setModalOpen(true);
  };



  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-4 flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 leading-tight">
              {itemName} <span className="text-slate-400 font-normal">({itemCode})</span>
            </h2>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{monthString}</p>
          </div>
        </div>

        <button
          onClick={handleExport}
          disabled={loading || exportLoading || !data.length}
          className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors text-sm font-semibold disabled:opacity-50"
        >
          {exportLoading ? <Loader2 size={16} className="animate-spin" /> : <FileSpreadsheet size={16} />}
          Export Details
        </button>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto custom-scrollbar">
        {loading ? (
           <div className="flex flex-col items-center justify-center h-40">
             <Loader2 size={24} className="animate-spin text-sky-500 mb-2" />
             <p className="text-sm text-slate-500 font-medium">Loading details...</p>
           </div>
        ) : !data.length ? (
           <div className="flex flex-col items-center justify-center h-40 text-slate-400">
             <BarChart2 size={32} className="mb-2 opacity-50" />
             <p className="text-sm">No transaction details found.</p>
           </div>
        ) : (
          <table className="w-full text-left border-collapse whitespace-nowrap min-w-max">
            <thead className="sticky top-0 z-10">
              <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700">
                <th className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase w-10 text-center"></th>
                <th className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase">Doc No</th>
                <th className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase">Bill Date</th>
                <th className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase">Invoice Type</th>
                <th className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase">Ledger</th>
                <th className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase">Stock Place</th>
                <th className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase text-right">Rate</th>
                <th className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase text-right">Balance</th>
                <th className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase">Unit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {data.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-3 py-2 text-center">
                    {row.TypeId ? (
                      <button 
                        onClick={() => openModal(row)}
                        className="text-sky-500 hover:text-sky-600 transition-colors p-1"
                      >
                        <Eye size={14} />
                      </button>
                    ) : null}
                  </td>
                  <td className="px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300">{row.BillNo}</td>
                  <td className="px-3 py-2 text-xs text-slate-500">{row.BillDate ? new Date(row.BillDate).toLocaleString() : ''}</td>
                  <td className="px-3 py-2 text-xs text-slate-500">{row.Type}</td>
                  <td className="px-3 py-2 text-xs text-slate-600 dark:text-slate-400">{row.Party}</td>
                  <td className="px-3 py-2 text-xs text-slate-500">{row.StockPlace}</td>
                  <td className="px-3 py-2 text-xs font-mono text-right text-slate-700 dark:text-slate-300">{H.formatNumber(row.NetRate, precision)}</td>
                  <td className="px-3 py-2 text-xs font-mono font-bold text-right text-emerald-600 dark:text-emerald-400">{H.formatNumber(row.Balance, precision)}</td>
                  <td className="px-3 py-2 text-xs text-slate-500">
                    {row.StdUnit && row.UnitConsumed && row.StdUnit !== row.UnitConsumed ? (
                      <span>{row.StdUnit} <span className="text-[10px] text-slate-400">({row.UnitConsumed})</span></span>
                    ) : (row.StdUnit || row.UnitConsumed || '')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {modalOpen && modalData && (
        <InvoiceDetailsModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          invCode={modalData.invCode}
          invType={modalData.invType}
        />
      )}
    </div>
  );
};
