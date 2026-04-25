import React, { useState, useEffect, useCallback } from 'react';
import { Search, RotateCcw, FileSpreadsheet, FileText, Eye, Loader2 } from 'lucide-react';
import { reportApi } from '../../services/report.service';
import { commonApi } from '../../lib/api-client';
import { InvoiceDetailsModal } from './InvoiceDetailsModal';
import * as XLSX from 'xlsx';

interface Props {
  itemId: number;
  stockPlaceId: string | null;
}

export const ItemRegisterView: React.FC<Props> = ({ itemId, stockPlaceId }) => {
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [printLoading, setPrintLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [stockPlaceList, setStockPlaceList] = useState<any[]>([]);
  const [filters, setFilters] = useState({
    fromDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    toDate: new Date().toISOString().split('T')[0],
    isOpeningStock: false,
    stockDetail: false,
    spIds: stockPlaceId || '',
  });

  // Invoice Details Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalInvCode, setModalInvCode] = useState<number | string>(0);
  const [modalInvType, setModalInvType] = useState<number>(1);
  const [modalIndex, setModalIndex] = useState(0);

  const hiddenColumns = ['LedgerId', 'TypeId', 'Invcode', 'Rate', 'Discount1', 'Discount2', 'Discount3', 'NetRate'];

  const columnLabels: Record<string, string> = {
    BillNo: 'Doc No', BillDate: 'Bill Date', Type: 'Invoice Type',
    Party: 'Ledger', StockPlace: 'Stock Place', Balance: 'Balance',
  };

  useEffect(() => {
    commonApi.dropdown({ table: 4 }).then(d => setStockPlaceList(d)).catch(() => {});
  }, []);

  useEffect(() => {
    submitReport();
  }, [itemId]);

  const formatDateForApi = (dateStr: string, time: string) => {
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y} ${time}`;
  };

  const getFilters = useCallback(() => ({
    fromDate: filters.fromDate ? formatDateForApi(filters.fromDate, '00:00:00') : null,
    toDate: filters.toDate ? formatDateForApi(filters.toDate, '23:59:59') : null,
    isOpeningStock: filters.isOpeningStock,
    stockDetail: filters.stockDetail,
    spIds: (!filters.isOpeningStock && filters.spIds) ? [parseInt(filters.spIds)] : null,
    itemId: itemId,
  }), [filters, itemId]);

  const submitReport = async () => {
    if (!itemId) return;
    setLoading(true);
    try {
      const result = await reportApi.itemRegister(getFilters());
      if (result?.length) {
        const keys = Object.keys(result[0]);
        setColumns(keys);
        setData(result);
      } else {
        setData([]);
        setColumns([]);
      }
    } catch { setData([]); }
    finally { setLoading(false); }
  };

  // ─── Export to Excel using xlsx library ─────────────────────────────────
  const handleExport = async () => {
    setExportLoading(true);
    try {
      const exportData = data.length ? data : await reportApi.itemRegister(getFilters());
      if (exportData?.length) {
        const visibleCols = Object.keys(exportData[0]).filter(c => !hiddenColumns.includes(c));
        const wsData = [
          visibleCols.map(c => columnLabels[c] || c),
          ...exportData.map((row: any) => visibleCols.map(c => row[c] ?? ''))
        ];
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(wsData);
        XLSX.utils.book_append_sheet(wb, ws, 'Item Register');
        XLSX.writeFile(wb, 'item-register-report.xlsx');
      }
    } catch {}
    finally { setExportLoading(false); }
  };

  // ─── Print using pdfmake ───────────────────────────────────────────────
  const handlePrint = async () => {
    setPrintLoading(true);
    try {
      const printData = data.length ? data : await reportApi.itemRegister(getFilters());
      if (printData?.length) {
        const pdfMake = (await import('pdfmake/build/pdfmake')).default;
        const pdfFonts = (await import('pdfmake/build/vfs_fonts')).default;
        (pdfMake as any).vfs = (pdfFonts as any).pdfMake?.vfs || pdfFonts;

        // Include ALL columns in PDF (matching old Angular behavior)
        const allCols = Object.keys(printData[0]);
        const allColLabels: Record<string, string> = {
          ...columnLabels, LedgerId: 'Ledger Id', TypeId: 'Type Id',
          Invcode: 'Invcode', Rate: 'Rate', Discount1: 'Discount 1',
          Discount2: 'Discount 2', Discount3: 'Discount 3', NetRate: 'Net Rate',
          Received: 'Received', Issued: 'Issued',
        };
        const headers = allCols.map(c => ({ text: allColLabels[c] || c, style: 'tableHeader' }));
        const rows = printData.map((row: any) => allCols.map(c => {
          if (c === 'BillDate') return formatDate(row[c]);
          if (['Balance', 'Rate', 'Discount1', 'Discount2', 'Discount3', 'NetRate', 'Received', 'Issued'].includes(c)) {
            return formatNumber(row[c]);
          }
          return String(row[c] ?? '');
        }));

        // Add totals row
        const totalsRow = allCols.map(c => {
          if (c === 'Type') return { text: 'Closing', bold: true };
          if (['Received', 'Issued', 'Balance'].includes(c)) {
            const sum = printData.reduce((s: number, r: any) => s + (parseFloat(r[c]) || 0), 0);
            return { text: formatNumber(sum), bold: true };
          }
          return '';
        });
        rows.push(totalsRow);

        const now = new Date();
        const printedOn = `Printed on : ${now.toLocaleDateString('en-GB')} ${now.toLocaleTimeString('en-GB')}`;

        const docDef: any = {
          pageOrientation: 'landscape',
          pageSize: 'A4',
          content: [
            { text: printedOn, alignment: 'right', fontSize: 8, color: '#64748b', margin: [0, 0, 0, 5] },
            { text: 'Item Register Report', style: 'header', margin: [0, 0, 0, 10] },
            {
              table: { headerRows: 1, widths: allCols.map(() => 'auto'), body: [headers, ...rows] },
              layout: { hLineWidth: () => 0.5, vLineWidth: () => 0.5, hLineColor: () => '#e2e8f0', vLineColor: () => '#e2e8f0', paddingLeft: () => 3, paddingRight: () => 3, paddingTop: () => 2, paddingBottom: () => 2 }
            },
            { text: `Total Rows: ${printData.length}`, style: 'footer', margin: [0, 10, 0, 0] }
          ],
          styles: {
            header: { fontSize: 14, bold: true, color: '#1e293b' },
            tableHeader: { fontSize: 7, bold: true, color: '#475569', fillColor: '#f1f5f9' },
            footer: { fontSize: 9, italics: true, color: '#64748b' }
          },
          defaultStyle: { fontSize: 7 }
        };
        pdfMake.createPdf(docDef).open();
      }
    } catch (e) { console.error('PDF generation error:', e); }
    finally { setPrintLoading(false); }
  };

  // ─── Open Invoice Details Modal ────────────────────────────────────────
  const openInvoiceModal = (row: any, rowIndex: number) => {
    if (!row.Invcode || !row.TypeId) return;
    setModalInvCode(row.Invcode);
    setModalInvType(row.TypeId);
    setModalIndex(rowIndex);
    setModalOpen(true);
  };

  const formatDate = (val: string) => {
    if (!val) return '';
    try {
      const d = new Date(val);
      return d.toLocaleDateString('en-GB') + ' ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    } catch { return val; }
  };

  const formatNumber = (val: any) => {
    if (val == null || val === '') return '';
    const n = parseFloat(val);
    return isNaN(n) ? val : n.toFixed(2);
  };

  // Build invoiceList for modal navigation from the data rows that have Invcode
  const invoiceListForModal = data.filter(r => r.Invcode && r.TypeId);

  return (
    <div className="mt-4">
      {/* Filters Row */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4 mb-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">From Date <span className="text-red-500">*</span></label>
            <input type="date" value={filters.fromDate} onChange={e => setFilters({ ...filters, fromDate: e.target.value })}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">To Date <span className="text-red-500">*</span></label>
            <input type="date" value={filters.toDate} onChange={e => setFilters({ ...filters, toDate: e.target.value })}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Stock Place</label>
            <select value={filters.spIds} onChange={e => setFilters({ ...filters, spIds: e.target.value })}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 min-w-[160px]">
              <option value="">Select Stock Place</option>
              {stockPlaceList.map((sp: any) => <option key={sp.id} value={sp.id}>{sp.name}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 cursor-pointer">
              <input type="checkbox" checked={filters.isOpeningStock} onChange={e => setFilters({ ...filters, isOpeningStock: e.target.checked })}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
              All Stock Places
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 cursor-pointer">
              <input type="checkbox" checked={filters.stockDetail} onChange={e => setFilters({ ...filters, stockDetail: e.target.checked })}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
              Stock Balance In Details
            </label>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={submitReport} className="p-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg transition-all" title="Search">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
            </button>
            <button onClick={() => { setFilters({ fromDate: new Date().toISOString().split('T')[0], toDate: new Date().toISOString().split('T')[0], isOpeningStock: false, stockDetail: false, spIds: '' }); }}
              className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 rounded-lg transition-all border border-slate-200 dark:border-slate-700" title="Clear">
              <RotateCcw size={16} />
            </button>
            <button onClick={handleExport} className="p-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-all" title="Export Excel">
              {exportLoading ? <Loader2 size={16} className="animate-spin" /> : <FileSpreadsheet size={16} />}
            </button>
            <button onClick={handlePrint} className="p-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-lg transition-all" title="Print PDF">
              {printLoading ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
            </button>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto max-h-[calc(100vh-380px)]">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-10">
              <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 w-10"></th>
                {columns.filter(c => !hiddenColumns.includes(c)).map(col => (
                  <th key={col} className={`px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap ${col === 'Balance' ? 'text-right' : ''}`}>
                    {columnLabels[col] || col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr><td colSpan={columns.length + 1} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 size={24} className="animate-spin text-blue-600" />
                    <span className="text-xs text-slate-500">Loading item register...</span>
                  </div>
                </td></tr>
              ) : !data.length ? (
                <tr><td colSpan={columns.length + 1} className="px-6 py-12 text-center text-sm text-slate-400">No data found</td></tr>
              ) : data.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-4 py-3">
                    {row.TypeId && row.Invcode && (
                      <button onClick={() => openInvoiceModal(row, idx)} className="text-blue-500 hover:text-blue-700 transition-colors" title="View Invoice Details">
                        <Eye size={14} />
                      </button>
                    )}
                  </td>
                  {columns.filter(c => !hiddenColumns.includes(c)).map(col => (
                    <td key={col} className={`px-4 py-3 text-sm ${col === 'Balance' ? 'text-right font-medium' : ''} text-slate-600 dark:text-slate-300 whitespace-nowrap`}>
                      {col === 'BillDate' ? formatDate(row[col]) : col === 'Balance' ? formatNumber(row[col]) : (row[col] ?? '')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 flex justify-between">
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Total Rows: {data.length}</span>
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Filtered Rows: {data.length}</span>
        </div>
      </div>

      {/* Invoice Details Modal */}
      <InvoiceDetailsModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        invCode={modalInvCode}
        invType={modalInvType}
        invoiceList={invoiceListForModal}
        currentIndex={modalIndex}
      />
    </div>
  );
};
