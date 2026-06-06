import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Search,
  RotateCcw,
  FileSpreadsheet,
  Printer,
  Loader2,
  Calendar,
  X,
  FolderTree,
} from "lucide-react";
import { reportApi } from "../../../services/report.service";
import { toast } from "../../../lib/toast";
import * as H from "../outstanding/outstandingHelpers";
import { DateRangePicker } from "../../DateRangePicker";
import { storage } from "../../../lib/storage";
import { STORAGE_KEYS } from "../../../lib/constants";

// ─── Autocomplete Input Component ──────────────────────────────────────────
const AutocompleteInput: React.FC<{
  label: string;
  value: any;
  options: any[];
  onChange: (val: any) => void;
  placeholder: string;
  displayField?: string;
  disabled?: boolean;
}> = ({
  label,
  value,
  options,
  onChange,
  placeholder,
  displayField = "name",
  disabled = false,
}) => {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered =
    search.length >= 1
      ? options
          .filter((o) =>
            o[displayField]?.toLowerCase().includes(search.toLowerCase())
          )
          .slice(0, 10)
      : [];

  return (
    <div className="relative" ref={ref}>
      <div
        className={`w-full px-3 py-1 bg-white dark:bg-slate-900 border rounded-lg transition-all focus-within:border-yellow-500 focus-within:ring-2 focus-within:ring-yellow-500/20 ${
          open
            ? "border-yellow-500 ring-2 ring-yellow-500/20"
            : "border-slate-200 dark:border-slate-700"
        }`}
      >
        <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block select-none mb-0.5">
          {label}
        </label>
        <div className="relative flex items-center">
          <input
            type="text"
            disabled={disabled}
            placeholder={placeholder}
            value={value ? value[displayField] || "" : search}
            onChange={(e) => {
              setSearch(e.target.value);
              onChange(null);
              setOpen(true);
            }}
            onFocus={() => !disabled && setOpen(true)}
            className="w-full bg-transparent border-0 p-0 text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-0 disabled:opacity-50 pr-6"
          />
          {(value || search) && (
            <button
              type="button"
              className="absolute right-0 text-blue-600 dark:text-blue-400 hover:text-blue-800 font-extrabold select-none cursor-pointer"
              onClick={() => {
                onChange(null);
                setSearch("");
              }}
            >
              <X size={16} className="stroke-[3]" />
            </button>
          )}
        </div>
      </div>
      {open && filtered.length > 0 && !disabled && (
        <div className="absolute z-50 top-full mt-1 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl max-h-60 overflow-y-auto">
          {filtered.map((opt, i) => (
            <button
              key={i}
              onClick={() => {
                onChange(opt);
                setSearch("");
                setOpen(false);
              }}
              className="w-full text-left transition-colors border-b border-slate-100 dark:border-slate-700 last:border-0 px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/80 focus:outline-none text-sm font-medium"
            >
              {opt.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export const GroupSummaryReport: React.FC = () => {
  const precision = H.getPrecision();

  const [fromDate, setFromDate] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split("T")[0]
  );
  const [toDate, setToDate] = useState(new Date().toISOString().split("T")[0]);

  const [groups, setGroups] = useState<any[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [includeChildGroups, setIncludeChildGroups] = useState(false);

  const [lst, setLst] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [printLoading, setPrintLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const grpList = storage.getItem<any[]>(STORAGE_KEYS.GROUP_LIST) || [];
    const sorted = [...grpList].sort((a, b) => a.name.localeCompare(b.name));
    setGroups(sorted);
  }, []);

  const formatDateForApi = (dateStr: string, time: string) => {
    if (!dateStr) return "";
    const [y, m, d] = dateStr.split("-");
    return `${d}/${m}/${y} ${time}`;
  };

  const getFilters = () => {
    return {
      groupId: selectedGroup ? selectedGroup.id : 0,
      fromDate: formatDateForApi(fromDate, "00:00:00"),
      toDate: formatDateForApi(toDate, "23:59:59"),
      includeChildGroups: includeChildGroups,
    };
  };

  const submitSearch = useCallback(async () => {
    setSubmitted(true);
    if (new Date(fromDate) > new Date(toDate)) {
      toast.info("From Date cannot be greater than To Date.", "Validation Error");
      return;
    }

    setLoading(true);
    try {
      const data = await reportApi.groupSummaryReport(getFilters());
      if (data && data.length > 0) {
        setLst(data);
      } else {
        setLst([]);
        toast.info("No data found for selected criteria.", "Info");
      }
    } catch (err: any) {
      setLst([]);
      toast.info(err?.message || "Failed to load report", "Error");
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate, selectedGroup, includeChildGroups]);

  const handleExport = async () => {
    setExportLoading(true);
    try {
      const blob = await reportApi.groupSummaryReportExport(getFilters());
      if (blob?.size) {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "group-summary.xlsx";
        a.click();
        URL.revokeObjectURL(a.href);
      } else {
        toast.info("No data found to export.", "Info");
      }
    } catch {
    } finally {
      setExportLoading(false);
    }
  };

  // Balance Formatter Helper: positive/negative signs + GIsCr nature
  const formatBalType = (val: number, isCreditNature: boolean) => {
    const balanceType = val < 0
      ? (isCreditNature ? " Dr" : " Cr")
      : (isCreditNature ? " Cr" : " Dr");
    return H.formatNumber(Math.abs(val), precision) + balanceType;
  };

  // Totals calculations
  const totalOpeningRaw = lst.reduce((acc, row) => acc + (Number(row.OPENINGBAL) || 0), 0);
  const totalDebitRaw = lst.reduce((acc, row) => acc + (Number(row.DEBIT) || 0), 0);
  const totalCreditRaw = lst.reduce((acc, row) => acc + (Number(row.CREDIT) || 0), 0);
  const totalClosingRaw = lst.reduce((acc, row) => acc + (Number(row.CLOSINGBAL) || 0), 0);

  const groupIsCreditNature = lst.length > 0 && lst[0]?.GIsCr === true;

  const totalOpeningDisplay = lst.length > 0
    ? formatBalType(totalOpeningRaw, groupIsCreditNature)
    : "0.00 Dr";

  const totalClosingDisplay = lst.length > 0
    ? formatBalType(totalClosingRaw, groupIsCreditNature)
    : "0.00 Dr";

  const handlePrint = async () => {
    setPrintLoading(true);
    try {
      const printData = lst.length
        ? lst
        : await reportApi.groupSummaryReport(getFilters());

      if (printData?.length) {
        const pdfMake = (await import("pdfmake/build/pdfmake")).default;
        const pdfFonts = (await import("pdfmake/build/vfs_fonts")).default;
        (pdfMake as any).vfs = pdfFonts?.pdfMake?.vfs || pdfFonts;

        const headers = [
          { text: "Name", style: "tableHeader", alignment: "left" },
          { text: "Opening Balance", style: "tableHeader", alignment: "right" },
          { text: "Debit", style: "tableHeader", alignment: "right" },
          { text: "Credit", style: "tableHeader", alignment: "right" },
          { text: "Closing Balance", style: "tableHeader", alignment: "right" },
        ];

        const rows: any[][] = printData.map((row: any) => [
          String(row.Name ?? ""),
          formatBalType(row.OPENINGBAL, row.GIsCr),
          H.formatNumber(row.DEBIT, precision),
          H.formatNumber(row.CREDIT, precision),
          formatBalType(row.CLOSINGBAL, row.GIsCr),
        ]);

        const totalsRow = [
          { text: "Total", bold: true, alignment: "left" },
          { text: totalOpeningDisplay, bold: true, alignment: "right" },
          { text: H.formatNumber(totalDebitRaw, precision), bold: true, alignment: "right" },
          { text: H.formatNumber(totalCreditRaw, precision), bold: true, alignment: "right" },
          { text: totalClosingDisplay, bold: true, alignment: "right" },
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
              fontSize: 8,
              color: "#64748b",
              margin: [0, 0, 0, 5],
            },
            {
              text: "Group Summary Report",
              style: "header",
              margin: [0, 0, 0, 10],
            },
            {
              text: `Group: ${selectedGroup ? selectedGroup.name : "All"}`,
              fontSize: 10,
              bold: true,
              margin: [0, 0, 0, 10],
            },
            {
              table: {
                headerRows: 1,
                widths: ["*", "*", "*", "*", "*"],
                body: [headers, ...rows],
              },
              layout: {
                hLineWidth: () => 0.5,
                vLineWidth: () => 0.5,
                hLineColor: () => "#e2e8f0",
                vLineColor: () => "#e2e8f0",
                paddingLeft: () => 6,
                paddingRight: () => 6,
                paddingTop: () => 4,
                paddingBottom: () => 4,
              },
            },
            {
              text: `Total Rows: ${printData.length}`,
              style: "footer",
              margin: [0, 10, 0, 0],
            },
          ],
          styles: {
            header: { fontSize: 14, bold: true, color: "#1e293b" },
            tableHeader: {
              fontSize: 8,
              bold: true,
              color: "#475569",
              fillColor: "#f1f5f9",
            },
            footer: { fontSize: 9, italics: true, color: "#64748b" },
          },
          defaultStyle: { fontSize: 8 },
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

  const handleClear = () => {
    setLst([]);
    setSelectedGroup(null);
    setIncludeChildGroups(false);
    setFromDate(
      new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        .toISOString()
        .split("T")[0]
    );
    setToDate(new Date().toISOString().split("T")[0]);
    setSubmitted(false);
  };

  return (
    <div className="font-sans text-slate-700 dark:text-slate-200 pt-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded-lg text-emerald-600 dark:text-emerald-400">
            <FolderTree size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Group Summary Report</h1>
            <p className="text-xs text-slate-500 font-medium">
              View balance sheet/income aggregates grouped by account groups.
            </p>
          </div>
        </div>
      </div>

      {/* Filters Card */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-5">
        <div className="flex flex-wrap items-end gap-3">
          {/* Select Group */}
          <div className="flex-1 min-w-[250px] md:max-w-[350px]">
            <AutocompleteInput
              label="Group"
              placeholder="Group"
              value={selectedGroup}
              options={groups}
              onChange={setSelectedGroup}
            />
          </div>

          {/* Include Child Checkbox */}
          <div className="flex items-center gap-2 h-[42px] px-2 select-none">
            <input
              type="checkbox"
              id="includeChildGroups"
              checked={includeChildGroups}
              onChange={(e) => setIncludeChildGroups(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer w-4 h-4"
            />
            <label
              htmlFor="includeChildGroups"
              className="text-xs font-semibold text-slate-600 dark:text-slate-300 cursor-pointer"
            >
              Include Child
            </label>
          </div>

          {/* From Date */}
          <div className="w-full sm:w-36 shrink-0 space-y-1">
            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              From Date <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
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
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>

          {/* Preset Picker & Search & Clear & Excel & Print Actions */}
          <div className="flex items-center gap-2 pb-0.5">
            <div className="shrink-0 relative">
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

            {/* Clear */}
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
              disabled={printLoading || loading || !lst.length}
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
              disabled={exportLoading || loading || !lst.length}
              title="Excel Export"
              className="w-10 h-10 flex items-center justify-center bg-emerald-600 text-white rounded-lg hover:opacity-90 transition-all shadow-sm cursor-pointer disabled:opacity-70"
            >
              {exportLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <FileSpreadsheet size={16} />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Grid Table */}
      {lst.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col mt-4">
          <div className="overflow-auto custom-scrollbar max-h-[calc(100vh-320px)]">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead className="sticky top-0 z-10">
                <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                  <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">
                    Opening Balance
                  </th>
                  <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">
                    Debit
                  </th>
                  <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">
                    Credit
                  </th>
                  <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">
                    Closing Balance
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {lst.map((row, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors group"
                  >
                    <td className="px-6 py-3.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {row.Name ?? "-"}
                    </td>
                    <td className="px-6 py-3.5 text-xs text-right font-mono font-bold text-slate-700 dark:text-slate-300">
                      {formatBalType(row.OPENINGBAL, row.GIsCr)}
                    </td>
                    <td className="px-6 py-3.5 text-xs text-right font-mono font-bold text-slate-700 dark:text-slate-300">
                      ₹{H.formatNumber(row.DEBIT, precision)}
                    </td>
                    <td className="px-6 py-3.5 text-xs text-right font-mono font-bold text-slate-700 dark:text-slate-300">
                      ₹{H.formatNumber(row.CREDIT, precision)}
                    </td>
                    <td className="px-6 py-3.5 text-xs text-right font-mono font-bold text-slate-700 dark:text-slate-300">
                      {formatBalType(row.CLOSINGBAL, row.GIsCr)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sticky yellow summary bar */}
      {lst.length > 0 && (
        <div className="sticky bottom-0 z-10 bg-brand-yellow dark:bg-brand-yellow/10 rounded-xl border border-brand-yellow/20 dark:border-brand-yellow/5 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] p-4 select-none mt-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <span className="text-xs font-bold text-slate-800 dark:text-brand-yellow/90 uppercase">
              Total Rows :{" "}
              <span className="text-slate-950 dark:text-brand-yellow font-extrabold">{lst.length}</span>
            </span>
            <div className="flex flex-wrap items-center gap-x-8 gap-y-2">
              <div className="text-right">
                <span className="text-[10px] text-slate-800/80 dark:text-brand-yellow/70 font-bold uppercase block">
                  Total Opening
                </span>
                <span className="text-sm font-black text-slate-950 dark:text-brand-yellow">
                  {totalOpeningDisplay}
                </span>
              </div>
              <div className="h-8 w-px bg-slate-900/15 dark:bg-brand-yellow/20 hidden sm:block"></div>
              <div className="text-right">
                <span className="text-[10px] text-slate-800/80 dark:text-brand-yellow/70 font-bold uppercase block">
                  Total Debit
                </span>
                <span className="text-sm font-black text-slate-950 dark:text-brand-yellow">
                  ₹{H.formatNumber(totalDebitRaw, precision)}
                </span>
              </div>
              <div className="h-8 w-px bg-slate-900/15 dark:bg-brand-yellow/20 hidden sm:block"></div>
              <div className="text-right">
                <span className="text-[10px] text-slate-800/80 dark:text-brand-yellow/70 font-bold uppercase block">
                  Total Credit
                </span>
                <span className="text-sm font-black text-slate-950 dark:text-brand-yellow">
                  ₹{H.formatNumber(totalCreditRaw, precision)}
                </span>
              </div>
              <div className="h-8 w-px bg-slate-900/15 dark:bg-brand-yellow/20 hidden sm:block"></div>
              <div className="text-right">
                <span className="text-[10px] text-slate-800/80 dark:text-brand-yellow/70 font-bold uppercase block">
                  Total Closing
                </span>
                <span className="text-sm font-black text-slate-950 dark:text-brand-yellow">
                  {totalClosingDisplay}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
