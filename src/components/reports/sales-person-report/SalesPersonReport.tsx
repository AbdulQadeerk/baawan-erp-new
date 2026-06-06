import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  RotateCcw,
  FileSpreadsheet,
  FileText,
  Printer,
  Loader2,
  Calendar,
  X,
  Calculator,
  Percent,
} from "lucide-react";
import { reportApi } from "../../../services/report.service";
import { commonApi } from "../../../lib/api-client";
import { toast } from "../../../lib/toast";
import * as H from "../outstanding/outstandingHelpers";
import { DateRangePicker } from "../../DateRangePicker";

export const SalesPersonReport: React.FC = () => {
  const precision = H.getPrecision();

  // Filters State
  const [fromDate, setFromDate] = useState(() => {
    const d = new Date();
    // Default to first day of current month
    return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split("T")[0];
  });
  const [toDate, setToDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [selectedSalesPersonId, setSelectedSalesPersonId] = useState<string>("");
  const [salesPersonList, setSalesPersonList] = useState<any[]>([]);

  // Search Results & UI States
  const [lst, setLst] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [printLoading, setPrintLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Selection state (storing row indices for robustness)
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);

  // Commission Modal State
  const [showCommissionModal, setShowCommissionModal] = useState(false);
  const [commissionPercent, setCommissionPercent] = useState<string>("");
  const [calculatedCommission, setCalculatedCommission] = useState<number | null>(null);

  // Load Sales Person dropdown options on mount
  useEffect(() => {
    commonApi
      .dropdown({ table: 18 })
      .then((data) => {
        if (data && Array.isArray(data)) {
          setSalesPersonList(data);
        }
      })
      .catch((err) => {
        console.error("Failed to load sales persons dropdown list:", err);
      });
  }, []);

  const formatDateForApi = (dateStr: string, time: string) => {
    if (!dateStr) return "";
    const [y, m, d] = dateStr.split("-");
    return `${d}/${m}/${y} ${time}`;
  };

  const getFilters = useCallback(() => {
    return {
      userId: selectedSalesPersonId || null,
      fromDate: formatDateForApi(fromDate, "00:00:00"),
      toDate: formatDateForApi(toDate, "23:59:59"),
    };
  }, [fromDate, toDate, selectedSalesPersonId]);

  const submitSearch = useCallback(async () => {
    setSubmitted(true);
    if (!fromDate || !toDate) {
      toast.info("From Date and To Date are required.", "Validation Error");
      return;
    }
    if (!selectedSalesPersonId) {
      toast.info("Please select a sales person.", "Validation Error");
      return;
    }
    if (new Date(fromDate) > new Date(toDate)) {
      toast.info("From Date cannot be greater than To Date.", "Validation Error");
      return;
    }

    setLoading(true);
    setSelectedIndices([]); // reset selections
    try {
      const payload = getFilters();
      const data = await reportApi.salesPersonReport(payload);
      if (data && data.length > 0) {
        setLst(data);
      } else {
        setLst([]);
        toast.info("No data found", "Info");
      }
    } catch (err: any) {
      setLst([]);
      toast.error(err?.message || "Failed to load report");
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate, selectedSalesPersonId, getFilters]);

  const handleClear = () => {
    setLst([]);
    setSelectedIndices([]);
    setSelectedSalesPersonId("");
    setFromDate(() => {
      const d = new Date();
      return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split("T")[0];
    });
    setToDate(new Date().toISOString().split("T")[0]);
    setSubmitted(false);
  };

  const handleExport = async () => {
    if (!selectedSalesPersonId) {
      toast.info("Please select a sales person.", "Validation Error");
      return;
    }
    setExportLoading(true);
    try {
      const payload = getFilters();
      const blob = await reportApi.salesPersonReportExport(payload);
      if (blob?.size) {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "sales-personReport.xlsx";
        a.click();
        URL.revokeObjectURL(a.href);
      } else {
        toast.info("No data found to export.", "Info");
      }
    } catch {
      toast.error("Excel export failed");
    } finally {
      setExportLoading(false);
    }
  };

  const handlePrint = async () => {
    if (!selectedSalesPersonId) {
      toast.info("Please select a sales person.", "Validation Error");
      return;
    }
    setPrintLoading(true);
    try {
      const printData = lst.length
        ? lst
        : await reportApi.salesPersonReport(getFilters());

      if (printData?.length) {
        const pdfMake = (await import("pdfmake/build/pdfmake")).default;
        const pdfFonts = (await import("pdfmake/build/vfs_fonts")).default;
        (pdfMake as any).vfs = pdfFonts?.pdfMake?.vfs || pdfFonts;

        const headers = [
          { text: "Item Code", style: "tableHeader", alignment: "left" },
          { text: "Item Name", style: "tableHeader", alignment: "left" },
          { text: "Brands", style: "tableHeader", alignment: "left" },
          { text: "Category", style: "tableHeader", alignment: "left" },
          { text: "Subcategory", style: "tableHeader", alignment: "left" },
          { text: "Type", style: "tableHeader", alignment: "left" },
          { text: "Ledger", style: "tableHeader", alignment: "left" },
          { text: "SalesPerson", style: "tableHeader", alignment: "left" },
          { text: "Doc No", style: "tableHeader", alignment: "left" },
          { text: "Date", style: "tableHeader", alignment: "left" },
          { text: "Qty", style: "tableHeader", alignment: "right" },
          { text: "Disc 1", style: "tableHeader", alignment: "right" },
          { text: "Disc 2", style: "tableHeader", alignment: "right" },
          { text: "Std Rate", style: "tableHeader", alignment: "right" },
          { text: "Amount", style: "tableHeader", alignment: "right" },
        ];

        const rows: any[][] = printData.map((row: any) => [
          String(row.BillNo ?? "-"),
          String(row.ItemName ?? "-"),
          String(row.Brand ?? "-"),
          String(row.Category ?? "-"),
          String(row.SubCategory ?? "-"),
          String(row.ItemType ?? "-"),
          String(row.Ledger ?? "-"),
          String(row.SalesPerson ?? "-"),
          String(row.BillNo ?? "-"),
          row.Date ? H.formatDateShort(row.Date) : "-",
          H.formatNumber(row.Qty, precision),
          row.Disc1 != null ? `${Number(row.Disc1).toFixed(2)}%` : "-",
          row.Disc2 != null ? `${Number(row.Disc2).toFixed(2)}%` : "-",
          H.formatNumber(row.StdRate, precision),
          H.formatNumber(row.Amount, precision),
        ]);

        const totalQty = printData.reduce((acc, r) => acc + (Number(r.Qty) || 0), 0);
        const totalAmount = printData.reduce((acc, r) => acc + (Number(r.Amount) || 0), 0);

        const totalsRow = [
          { text: "Total", bold: true, alignment: "left" },
          "", "", "", "", "", "", "", "", "",
          { text: H.formatNumber(totalQty, precision), bold: true, alignment: "right" },
          "", "", "",
          { text: H.formatNumber(totalAmount, precision), bold: true, alignment: "right" },
        ];
        rows.push(totalsRow);

        const now = new Date();
        const printedOn = `Printed on: ${now.toLocaleDateString("en-GB")} ${now.toLocaleTimeString("en-GB")}`;

        const docDef: any = {
          pageOrientation: "landscape",
          pageSize: "A4",
          content: [
            {
              text: printedOn,
              alignment: "right",
              fontSize: 7,
              color: "#64748b",
              margin: [0, 0, 0, 5],
            },
            {
              text: "Sales Person Report",
              style: "header",
              margin: [0, 0, 0, 10],
            },
            {
              table: {
                headerRows: 1,
                widths: ["auto", "auto", "auto", "auto", "auto", "auto", "auto", "auto", "auto", "auto", "auto", "auto", "auto", "auto", "auto"],
                body: [headers, ...rows],
              },
              layout: {
                hLineWidth: () => 0.5,
                vLineWidth: () => 0.5,
                hLineColor: () => "#e2e8f0",
                vLineColor: () => "#e2e8f0",
                paddingLeft: () => 3,
                paddingRight: () => 3,
                paddingTop: () => 3,
                paddingBottom: () => 3,
              },
            },
            {
              text: `Total Rows: ${printData.length}`,
              style: "footer",
              margin: [0, 10, 0, 0],
            },
          ],
          styles: {
            header: { fontSize: 12, bold: true, color: "#1e293b" },
            tableHeader: {
              fontSize: 6,
              bold: true,
              color: "#475569",
              fillColor: "#f1f5f9",
            },
            footer: { fontSize: 8, italics: true, color: "#64748b" },
          },
          defaultStyle: { fontSize: 6 },
        };
        pdfMake.createPdf(docDef).open();
      } else {
        toast.info("No data found to print.", "Info");
      }
    } catch (err: any) {
      toast.error(err?.message || "Print failed");
    } finally {
      setPrintLoading(false);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIndices(lst.map((_, idx) => idx));
    } else {
      setSelectedIndices([]);
    }
  };

  const handleSelectRow = (idx: number, checked: boolean) => {
    if (checked) {
      setSelectedIndices((prev) => [...prev, idx]);
    } else {
      setSelectedIndices((prev) => prev.filter((i) => i !== idx));
    }
  };

  // Derive selection-dependent details
  const selectedRows = selectedIndices.map((idx) => lst[idx]);
  const totalSelectedQty = selectedRows.reduce((acc, row) => acc + (Number(row.Qty) || 0), 0);
  const totalSelectedAmount = selectedRows.reduce((acc, row) => acc + (Number(row.Amount) || 0), 0);

  const calculateCommission = () => {
    const percent = parseFloat(commissionPercent);
    if (isNaN(percent) || percent < 0) {
      toast.info("Please enter a valid commission percentage.", "Validation Error");
      return;
    }
    const calculated = (totalSelectedAmount * percent) / 100;
    setCalculatedCommission(calculated);
  };

  return (
    <div className="font-sans text-slate-700 dark:text-slate-200 pt-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg text-blue-600 dark:text-blue-400">
            <FileText size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Sales Person Report</h1>
            <p className="text-xs text-slate-500 font-medium">Sales Person wise ledger transactions report.</p>
          </div>
        </div>
      </div>

      {/* Filters Card */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-5 mb-5">
        <div className="flex flex-wrap items-end gap-4">
          {/* From Date */}
          <div className="w-full sm:w-36 shrink-0 space-y-1">
            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              From Date <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer font-semibold"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>

          {/* To Date */}
          <div className="w-full sm:w-36 shrink-0 space-y-1">
            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              To Date <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer font-semibold"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>

          {/* Presets */}
          <div className="shrink-0 relative pb-[2px]">
            <button
              type="button"
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="w-10 h-10 rounded-lg bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors shadow-sm cursor-pointer"
              title="Date Presets"
            >
              <Calendar size={18} />
            </button>
            {showDatePicker && (
              <DateRangePicker
                isOpen={showDatePicker}
                onClose={() => setShowDatePicker(false)}
                onApply={(from, to) => {
                  const partsFrom = from.split("/");
                  if (partsFrom.length === 3) {
                    setFromDate(`${partsFrom[2]}-${partsFrom[1]}-${partsFrom[0]}`);
                  }
                  const partsTo = to.split("/");
                  if (partsTo.length === 3) {
                    setToDate(`${partsTo[2]}-${partsTo[1]}-${partsTo[0]}`);
                  }
                  setShowDatePicker(false);
                }}
                initialFrom={H.formatDisplayDate(fromDate)}
                initialTo={H.formatDisplayDate(toDate)}
              />
            )}
          </div>

          {/* Sales Person Dropdown */}
          <div className="w-full sm:w-64 space-y-1">
            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Sales Person <span className="text-rose-500">*</span>
            </label>
            <select
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-semibold"
              value={selectedSalesPersonId}
              onChange={(e) => setSelectedSalesPersonId(e.target.value)}
            >
              <option value="">Select Sales Person</option>
              {salesPersonList.map((item: any) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pb-[2px]">
            {/* Search */}
            <button
              onClick={submitSearch}
              disabled={loading}
              title="Search"
              className="w-10 h-10 flex items-center justify-center bg-[#2D9E75] text-white rounded-lg hover:opacity-90 transition-all shadow-sm cursor-pointer disabled:opacity-70"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Search size={16} />
              )}
            </button>

            {/* Reset */}
            <button
              onClick={handleClear}
              title="Reset Filters"
              className="w-10 h-10 flex items-center justify-center bg-lime-500 text-white rounded-lg hover:opacity-90 transition-all shadow-sm cursor-pointer"
            >
              <RotateCcw size={16} />
            </button>

            {/* Print */}
            <button
              onClick={handlePrint}
              disabled={printLoading || loading}
              title="Print PDF"
              className="w-10 h-10 flex items-center justify-center bg-rose-500 text-white rounded-lg hover:opacity-90 transition-all shadow-sm cursor-pointer disabled:opacity-70"
            >
              {printLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Printer size={16} />
              )}
            </button>

            {/* Excel */}
            <button
              onClick={handleExport}
              disabled={exportLoading || loading}
              title="Excel Export"
              className="w-10 h-10 flex items-center justify-center bg-emerald-600 text-white rounded-lg hover:opacity-90 transition-all shadow-sm cursor-pointer disabled:opacity-70"
            >
              {exportLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <FileSpreadsheet size={16} />
              )}
            </button>

            {/* Commission (Visible only when rows are selected) */}
            {selectedIndices.length > 0 && (
              <button
                onClick={() => {
                  setCommissionPercent("");
                  setCalculatedCommission(null);
                  setShowCommissionModal(true);
                }}
                title="Calculate Commission"
                className="w-10 h-10 flex items-center justify-center bg-blue-500 text-white rounded-lg hover:opacity-90 transition-all shadow-sm cursor-pointer animate-pulse"
              >
                <Calculator size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Grid Table */}
      {lst.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col mt-4">
          <div className="overflow-auto custom-scrollbar max-h-[calc(100vh-340px)]">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead className="sticky top-0 z-10">
                <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                  <th className="w-10 px-4 py-3 text-center">
                    <input
                      type="checkbox"
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      checked={selectedIndices.length === lst.length}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                    />
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Item Code
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Item Name
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Brands
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Subcategory
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Ledger
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    SalesPerson
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Doc No
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">
                    Qty
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">
                    Disc 1
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">
                    Disc 2
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">
                    Std Rate
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {lst.map((row, idx) => {
                  const isChecked = selectedIndices.includes(idx);
                  return (
                    <tr
                      key={idx}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="px-4 py-2 text-center">
                        <input
                          type="checkbox"
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          checked={isChecked}
                          onChange={(e) => handleSelectRow(idx, e.target.checked)}
                        />
                      </td>
                      <td className="px-4 py-2 text-xs text-slate-500 dark:text-slate-400">
                        {row.BillNo ?? "-"}
                      </td>
                      <td className="px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200">
                        {row.ItemName ?? "-"}
                      </td>
                      <td className="px-4 py-2 text-xs text-slate-500 dark:text-slate-400">
                        {row.Brand ?? "-"}
                      </td>
                      <td className="px-4 py-2 text-xs text-slate-500 dark:text-slate-400">
                        {row.Category ?? "-"}
                      </td>
                      <td className="px-4 py-2 text-xs text-slate-500 dark:text-slate-400">
                        {row.SubCategory ?? "-"}
                      </td>
                      <td className="px-4 py-2 text-xs text-slate-500 dark:text-slate-400">
                        {row.ItemType ?? "-"}
                      </td>
                      <td className="px-4 py-2 text-xs text-slate-500 dark:text-slate-400">
                        {row.Ledger ?? "-"}
                      </td>
                      <td className="px-4 py-2 text-xs text-slate-500 dark:text-slate-400">
                        {row.SalesPerson ?? "-"}
                      </td>
                      <td className="px-4 py-2 text-xs text-slate-500 dark:text-slate-400">
                        {row.BillNo ?? "-"}
                      </td>
                      <td className="px-4 py-2 text-xs text-slate-500 dark:text-slate-400">
                        {row.Date ? H.formatDateShort(row.Date) : "-"}
                      </td>
                      <td className="px-4 py-2 text-xs font-bold text-right text-slate-700 dark:text-slate-300 font-mono">
                        {H.formatNumber(row.Qty, precision)}
                      </td>
                      <td className="px-4 py-2 text-xs text-right text-slate-500 dark:text-slate-400 font-mono">
                        {row.Disc1 != null ? `${Number(row.Disc1).toFixed(2)}%` : "-"}
                      </td>
                      <td className="px-4 py-2 text-xs text-right text-slate-500 dark:text-slate-400 font-mono">
                        {row.Disc2 != null ? `${Number(row.Disc2).toFixed(2)}%` : "-"}
                      </td>
                      <td className="px-4 py-2 text-xs text-right text-slate-500 dark:text-slate-400 italic font-mono">
                        {H.formatNumber(row.StdRate, precision)}
                      </td>
                      <td className="px-4 py-2 text-xs text-right text-slate-700 dark:text-slate-300 font-bold italic font-mono">
                        {H.formatNumber(row.Amount, precision)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sticky Bottom Summary bar (Yellow) */}
      {lst.length > 0 && (
        <footer className="sticky bottom-0 z-40 bg-brand-yellow dark:bg-brand-yellow/10 px-6 py-4 shadow-[0_-4px_20px_rgba(0,0,0,0.15)] border-t border-brand-yellow/20 dark:border-brand-yellow/5 flex flex-wrap justify-center gap-8 md:gap-16 items-center -mx-6 mt-6">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-800/80 dark:text-brand-yellow/70 uppercase tracking-tighter">
              Total Rows
            </span>
            <span className="text-xl font-extrabold text-slate-950 dark:text-brand-yellow tabular-nums">
              {lst.length}
            </span>
          </div>
          <div className="h-8 w-px bg-slate-900/15 dark:bg-brand-yellow/20 hidden sm:block"></div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-800/80 dark:text-brand-yellow/70 uppercase tracking-tighter">
              Selected Rows
            </span>
            <span className="text-xl font-extrabold text-slate-950 dark:text-brand-yellow tabular-nums">
              {selectedIndices.length}
            </span>
          </div>
          <div className="h-8 w-px bg-slate-900/15 dark:bg-brand-yellow/20 hidden sm:block"></div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-800/80 dark:text-brand-yellow/70 uppercase tracking-tighter">
              Total Selected Qty
            </span>
            <span className="text-xl font-extrabold text-slate-950 dark:text-brand-yellow tabular-nums">
              {H.formatNumber(totalSelectedQty, precision)}
            </span>
          </div>
          <div className="h-8 w-px bg-slate-900/15 dark:bg-brand-yellow/20 hidden sm:block"></div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-800/80 dark:text-brand-yellow/70 uppercase tracking-tighter">
              Total Selected Amount
            </span>
            <span className="text-xl font-extrabold text-slate-950 dark:text-brand-yellow tabular-nums">
              ₹ {H.formatNumber(totalSelectedAmount, precision)}
            </span>
          </div>
        </footer>
      )}

      {/* Commission Modal Dialog */}
      {showCommissionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden flex flex-col max-h-[80vh] mx-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Percent size={18} className="text-blue-500" />
                Check Sales Person Commission
              </h3>
              <button
                onClick={() => setShowCommissionModal(false)}
                className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Commission %
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    placeholder="Enter Commission %"
                    className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-semibold"
                    value={commissionPercent}
                    onChange={(e) => setCommissionPercent(e.target.value)}
                  />
                  <button
                    onClick={calculateCommission}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm cursor-pointer shrink-0"
                  >
                    <Calculator size={16} />
                    Calculate
                  </button>
                </div>
              </div>

              {calculatedCommission !== null && (
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Calculated Commission Amount
                  </span>
                  <span className="text-2xl font-black text-blue-600 dark:text-blue-400 font-mono">
                    ₹ {H.formatNumber(calculatedCommission, precision)}
                  </span>
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex justify-end bg-slate-50/50 dark:bg-slate-900/50">
              <button
                onClick={() => setShowCommissionModal(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-lg transition-colors text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
