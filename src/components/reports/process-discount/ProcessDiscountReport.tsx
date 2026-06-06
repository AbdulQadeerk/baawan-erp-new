import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Search,
  RotateCcw,
  FileSpreadsheet,
  Printer,
  Loader2,
  Calendar,
  X,
  BookOpen,
  Tag,
} from "lucide-react";
import Select, { components } from "react-select";

// ─── React Select Custom Value Container for displaying selection summary ──
const CustomValueContainer = ({ children, getValue, ...props }: any) => {
  const selected = getValue();
  const count = selected.length;
  return (
    <components.ValueContainer {...props} getValue={getValue}>
      {count > 0 && (
        <span className="text-sm font-semibold text-slate-800 dark:text-slate-100 select-none mr-2 pl-1">
          {count} {count === 1 ? "item" : "items"} selected
        </span>
      )}
      {children}
    </components.ValueContainer>
  );
};
import { reportApi } from "../../../services/report.service";
import { commonApi } from "../../../services/common.service";
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
  templateType?: string;
  disabled?: boolean;
}> = ({
  label,
  value,
  options,
  onChange,
  placeholder,
  displayField = "name",
  templateType = "name",
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
        <div className="absolute z-50 top-full mt-1 w-full sm:min-w-[950px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl max-h-60 overflow-y-auto">
          {filtered.map((opt, i) => (
            <button
              key={i}
              onClick={() => {
                onChange(opt);
                setSearch("");
                setOpen(false);
              }}
              className="w-full text-left transition-colors border-b border-slate-100 dark:border-slate-700 last:border-0 p-0 flex hover:brightness-95 dark:hover:brightness-110 focus:outline-none"
            >
              {templateType === "ledger" ? (
                <div className="flex w-full text-sm font-medium">
                  {/* Left part - yellow background */}
                  <div
                    className="w-[32%] bg-[#fcf8e3] dark:bg-amber-950/40 px-3 py-2 text-slate-800 dark:text-amber-200 font-semibold truncate text-left"
                    title={opt.name}
                  >
                    {opt.name}
                  </div>
                  {/* Right part - blue background */}
                  <div className="w-[68%] bg-[#d9edf7] dark:bg-blue-950/40 px-3 py-2 flex items-center text-xs text-slate-700 dark:text-blue-200 font-semibold gap-2">
                    <div className="w-[22%] truncate text-left" title={opt.group}>
                      {opt.group || ""}
                    </div>
                    <div className="w-[24%] truncate text-left" title={opt.area}>
                      {opt.area || "-"}
                    </div>
                    <div className="w-[16%] truncate text-left" title={opt.city}>
                      {opt.city || "-"}
                    </div>
                    <div className="w-[20%] truncate text-left" title={opt.mobile || opt.phone_1 || opt.phone_2}>
                      {opt.mobile || opt.phone_1 || opt.phone_2 || "-"}
                    </div>
                    <div className="w-[18%] truncate text-left" title={opt.gstNo || opt.gstin}>
                      {opt.gstNo || opt.gstin || "-"}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="px-3 py-2 w-full text-left">{opt.name}</div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export const ProcessDiscountReport: React.FC = () => {
  const precision = H.getPrecision();

  // Filters State
  const [fromDate, setFromDate] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split("T")[0]
  );
  const [toDate, setToDate] = useState(new Date().toISOString().split("T")[0]);

  const [ledgers, setLedgers] = useState<any[]>([]);
  const [selectedLedger, setSelectedLedger] = useState<any>(null);

  // Multi-select Lists & Selection
  const [brandList, setBrandList] = useState<any[]>([]);
  const [categoryList, setCategoryList] = useState<any[]>([]);
  const [sizeList, setSizeList] = useState<any[]>([]);
  const [typeList, setTypeList] = useState<any[]>([]);

  const [selectedBrands, setSelectedBrands] = useState<any[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<any[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<any[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<any[]>([]);

  // Search Results
  const [lst, setLst] = useState<any[]>([]);
  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState<number[]>([]);
  const [discountPercent, setDiscountPercent] = useState<string>("");

  // Loading States
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [printLoading, setPrintLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Load Ledgers & Classifications
  useEffect(() => {
    // Group 17 is Sundry Debtors
    const debtors = H.getFilteredLedgers([17]);
    setLedgers(debtors);

    // Fetch Brand, Category, Sizes (Sub Category), and Type lists
    commonApi.getDistinctValues({ table: 0, column: "Brand" }).then(setBrandList).catch(() => {});
    commonApi.getDistinctValues({ table: 0, column: "Category" }).then(setCategoryList).catch(() => {});
    commonApi.getDistinctValues({ table: 0, column: "Sizes" }).then(setSizeList).catch(() => {});
    commonApi.getDistinctValues({ table: 0, column: "Type" }).then(setTypeList).catch(() => {});
  }, []);

  const formatDateForApi = (dateStr: string, time: string) => {
    if (!dateStr) return "";
    const [y, m, d] = dateStr.split("-");
    return `${d}/${m}/${y} ${time}`;
  };

  const isClassificationSelected =
    selectedBrands.length > 0 ||
    selectedCategories.length > 0 ||
    selectedSizes.length > 0 ||
    selectedTypes.length > 0;

  const getFilters = () => {
    return {
      ledgerId: selectedLedger ? selectedLedger.id : null,
      dateFrom: formatDateForApi(fromDate, "00:00:00"),
      dateTo: formatDateForApi(toDate, "23:59:59"),
      brand: selectedBrands.length ? selectedBrands.map((x) => x.name).join(",") : null,
      category: selectedCategories.length ? selectedCategories.map((x) => x.name).join(",") : null,
      sizes: selectedSizes.length ? selectedSizes.map((x) => x.name).join(",") : null,
      type: selectedTypes.length ? selectedTypes.map((x) => x.name).join(",") : null,
    };
  };

  const submitSearch = useCallback(async () => {
    setSubmitted(true);
    if (!selectedLedger) {
      toast.info("Please select a Party.", "Validation Error");
      return;
    }
    if (!fromDate || !toDate) {
      toast.info("From Date and To Date are required.", "Validation Error");
      return;
    }
    if (new Date(fromDate) > new Date(toDate)) {
      toast.info("From Date cannot be greater than To Date.", "Validation Error");
      return;
    }
    if (!isClassificationSelected) {
      toast.info(
        "At least one classification (Brand, Category, Sub Category, or Type) must be selected.",
        "Validation Error"
      );
      return;
    }

    setLoading(true);
    try {
      const filters = getFilters();
      const data = await reportApi.reportProcessDiscount(filters);
      if (data && data.length > 0) {
        setLst(data);
        setSelectedInvoiceIds(data.map((x) => x.InvCode)); // Checked by default
      } else {
        setLst([]);
        setSelectedInvoiceIds([]);
        toast.info("No data found for selected party", "Info");
      }
    } catch (err: any) {
      setLst([]);
      setSelectedInvoiceIds([]);
      toast.info(err?.message || "Failed to load report", "Error");
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate, selectedLedger, selectedBrands, selectedCategories, selectedSizes, selectedTypes, isClassificationSelected]);

  const handleExport = async () => {
    if (!selectedLedger) {
      toast.info("Please select a Party.", "Validation Error");
      return;
    }
    if (!isClassificationSelected) {
      toast.info("At least one classification must be selected.", "Validation Error");
      return;
    }
    setExportLoading(true);
    try {
      const filters = getFilters();
      const blob = await reportApi.reportProcessDiscountExport(filters);
      if (blob?.size) {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "process-discount.xlsx";
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

  const handlePrint = async () => {
    if (!selectedLedger) {
      toast.info("Please select a Party.", "Validation Error");
      return;
    }
    if (!isClassificationSelected) {
      toast.info("At least one classification must be selected.", "Validation Error");
      return;
    }
    setPrintLoading(true);
    try {
      const printData = lst.length
        ? lst
        : await reportApi.reportProcessDiscount(getFilters());

      if (printData?.length) {
        const pdfMake = (await import("pdfmake/build/pdfmake")).default;
        const pdfFonts = (await import("pdfmake/build/vfs_fonts")).default;
        (pdfMake as any).vfs = pdfFonts?.pdfMake?.vfs || pdfFonts;

        const headers = [
          { text: "Doc No", style: "tableHeader", alignment: "left" },
          { text: "Invoice Amount", style: "tableHeader", alignment: "right" },
          { text: "Receipt Amount", style: "tableHeader", alignment: "right" },
          { text: "Invoice Date", style: "tableHeader", alignment: "center" },
          { text: "Receipt Date", style: "tableHeader", alignment: "center" },
          { text: "Days", style: "tableHeader", alignment: "center" },
        ];

        const rows: any[][] = printData.map((row: any) => [
          String(row.INVBill_No ?? ""),
          H.formatNumber(row.INVAmount, precision),
          H.formatNumber(row.RecAmount, precision),
          H.formatDateShort(row.INVDate),
          H.formatDateShort(row.RecDate),
          String(row.Days ?? "0"),
        ]);

        const totalInv = printData.reduce((acc, r) => acc + (Number(r.INVAmount) || 0), 0);
        const totalRec = printData.reduce((acc, r) => acc + (Number(r.RecAmount) || 0), 0);

        const totalsRow = [
          { text: "Total", bold: true, alignment: "left" },
          { text: H.formatNumber(totalInv, precision), bold: true, alignment: "right" },
          { text: H.formatNumber(totalRec, precision), bold: true, alignment: "right" },
          "",
          "",
          "",
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
              text: "Process Discount Report",
              style: "header",
              margin: [0, 0, 0, 10],
            },
            {
              text: `Party: ${selectedLedger.name}`,
              fontSize: 10,
              bold: true,
              margin: [0, 0, 0, 10],
            },
            {
              table: {
                headerRows: 1,
                widths: ["*", "*", "*", "*", "*", "*"],
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
    setSelectedInvoiceIds([]);
    setSelectedLedger(null);
    setSelectedBrands([]);
    setSelectedCategories([]);
    setSelectedSizes([]);
    setSelectedTypes([]);
    setDiscountPercent("");
    setFromDate(
      new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        .toISOString()
        .split("T")[0]
    );
    setToDate(new Date().toISOString().split("T")[0]);
    setSubmitted(false);
  };

  const handleRowCheckbox = (invCode: number) => {
    setSelectedInvoiceIds((prev) =>
      prev.includes(invCode) ? prev.filter((id) => id !== invCode) : [...prev, invCode]
    );
  };

  const handleHeaderCheckbox = () => {
    if (selectedInvoiceIds.length === lst.length) {
      setSelectedInvoiceIds([]);
    } else {
      setSelectedInvoiceIds(lst.map((x) => x.InvCode));
    }
  };

  const handleCreateCN = (e: React.FormEvent) => {
    e.preventDefault();
    if (!discountPercent) {
      toast.info("Please enter a discount percentage.", "Validation Error");
      return;
    }
    if (selectedInvoiceIds.length === 0) {
      toast.info("No invoices selected to process.", "Validation Error");
      return;
    }

    const selectedRows = lst.filter((x) => selectedInvoiceIds.includes(x.InvCode));
    const invcodes = selectedRows.map((x) => x.InvCode);
    const billnos = selectedRows.map((x) => x.INVBill_No);

    const processDiscount = {
      ledgerId: selectedLedger.id,
      brand: selectedBrands.length ? selectedBrands.map((x) => x.name).join(",") : null,
      category: selectedCategories.length ? selectedCategories.map((x) => x.name).join(",") : null,
      sizes: selectedSizes.length ? selectedSizes.map((x) => x.name).join(",") : null,
      type: selectedTypes.length ? selectedTypes.map((x) => x.name).join(",") : null,
      invcodes: invcodes,
      billnos: billnos,
      discount: Number(discountPercent),
    };

    // Save to local storage
    storage.setItem(STORAGE_KEYS.PROCESS_DISCOUNT, processDiscount);

    toast.success(
      "Discount processed successfully! Data saved to localStorage. (Ready to create credit note)",
      "Success"
    );
  };

  const reactSelectStyles = {
    control: (base: any, state: any) => ({
      ...base,
      minHeight: "42px",
      borderRadius: "0.5rem",
      backgroundColor: "transparent",
      borderColor:
        submitted && !isClassificationSelected
          ? "#ef4444"
          : state.isFocused
          ? "#eab308"
          : "#e2e8f0",
      boxShadow:
        state.isFocused && submitted && !isClassificationSelected
          ? "0 0 0 2px rgba(239, 68, 68, 0.2)"
          : state.isFocused
          ? "0 0 0 2px rgba(234, 179, 8, 0.2)"
          : "none",
      "&:hover": {
        borderColor: submitted && !isClassificationSelected ? "#ef4444" : "#eab308",
      },
    }),
    menu: (base: any) => ({
      ...base,
      zIndex: 50,
    }),
    option: (base: any, state: any) => ({
      ...base,
      backgroundColor: state.isSelected
        ? "#3b82f6"
        : state.isFocused
        ? "rgba(59, 130, 246, 0.1)"
        : "transparent",
      color: state.isSelected ? "#ffffff" : "inherit",
      cursor: "pointer",
    }),
  };

  return (
    <div className="font-sans text-slate-700 dark:text-slate-200 pt-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg text-blue-600 dark:text-blue-400">
            <BookOpen size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Process Discount</h1>
            <p className="text-xs text-slate-500 font-medium">
              Calculate customer discount criteria and export credit voucher parameters.
            </p>
          </div>
        </div>

        {/* Dynamic breadcrumb summary details on right */}
        {selectedLedger && (
          <div className="flex flex-wrap gap-2 text-xs bg-slate-100 dark:bg-slate-800/40 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800">
            <span className="font-semibold text-slate-600 dark:text-slate-400">Party: {selectedLedger.name}</span>
            {selectedBrands.length > 0 && (
              <span className="text-slate-500">| Brand: {selectedBrands.map((x) => x.name).join(", ")}</span>
            )}
            {selectedCategories.length > 0 && (
              <span className="text-slate-500">| Category: {selectedCategories.map((x) => x.name).join(", ")}</span>
            )}
            {selectedSizes.length > 0 && (
              <span className="text-slate-500">| SubCategory: {selectedSizes.map((x) => x.name).join(", ")}</span>
            )}
            {selectedTypes.length > 0 && (
              <span className="text-slate-500">| Type: {selectedTypes.map((x) => x.name).join(", ")}</span>
            )}
          </div>
        )}
      </div>

      {/* Filters Card */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-5 space-y-4">
        {/* Row 1: Party Autocomplete & Dropdowns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-end">
          {/* Select Party */}
          <div className="lg:col-span-4 min-w-[250px]">
            <AutocompleteInput
              label="Select Party"
              placeholder="Select Party"
              value={selectedLedger}
              options={ledgers}
              onChange={setSelectedLedger}
              templateType="ledger"
            />
            {submitted && !selectedLedger && (
              <span className="text-[10px] text-rose-500 font-bold block mt-1">
                This value is required.
              </span>
            )}
          </div>

          {/* Multi-select inputs */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-4 gap-3">
            {/* Brand */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Brand <span className="text-rose-500">*</span>
              </label>
              <Select
                isMulti
                options={brandList}
                value={selectedBrands}
                onChange={(val) => setSelectedBrands(val as any[])}
                getOptionLabel={(x) => x.name}
                getOptionValue={(x) => x.name}
                placeholder="Brand"
                styles={reactSelectStyles}
                className="react-select-container"
                classNamePrefix="react-select"
                closeMenuOnSelect={false}
                hideSelectedOptions={false}
                components={{
                  MultiValue: () => null,
                  ValueContainer: CustomValueContainer,
                }}
              />
            </div>

            {/* Category */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Category <span className="text-rose-500">*</span>
              </label>
              <Select
                isMulti
                options={categoryList}
                value={selectedCategories}
                onChange={(val) => setSelectedCategories(val as any[])}
                getOptionLabel={(x) => x.name}
                getOptionValue={(x) => x.name}
                placeholder="Category"
                styles={reactSelectStyles}
                className="react-select-container"
                classNamePrefix="react-select"
                closeMenuOnSelect={false}
                hideSelectedOptions={false}
                components={{
                  MultiValue: () => null,
                  ValueContainer: CustomValueContainer,
                }}
              />
            </div>

            {/* Sub Category */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Sub Category <span className="text-rose-500">*</span>
              </label>
              <Select
                isMulti
                options={sizeList}
                value={selectedSizes}
                onChange={(val) => setSelectedSizes(val as any[])}
                getOptionLabel={(x) => x.name}
                getOptionValue={(x) => x.name}
                placeholder="Sub Category"
                styles={reactSelectStyles}
                className="react-select-container"
                classNamePrefix="react-select"
                closeMenuOnSelect={false}
                hideSelectedOptions={false}
                components={{
                  MultiValue: () => null,
                  ValueContainer: CustomValueContainer,
                }}
              />
            </div>

            {/* Type */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Type <span className="text-rose-500">*</span>
              </label>
              <Select
                isMulti
                options={typeList}
                value={selectedTypes}
                onChange={(val) => setSelectedTypes(val as any[])}
                getOptionLabel={(x) => x.name}
                getOptionValue={(x) => x.name}
                placeholder="Type"
                styles={reactSelectStyles}
                className="react-select-container"
                classNamePrefix="react-select"
                closeMenuOnSelect={false}
                hideSelectedOptions={false}
                components={{
                  MultiValue: () => null,
                  ValueContainer: CustomValueContainer,
                }}
              />
            </div>
          </div>
        </div>

        {/* Row 2: Date Filters & Action Buttons & CN Form */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-wrap items-end gap-3">
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
            </div>
          </div>

          {/* Discount Form / Create CN (Only when results exist) */}
          {lst.length > 0 && (
            <form onSubmit={handleCreateCN} className="flex items-end gap-2 bg-slate-50 dark:bg-slate-800/25 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
              <div className="w-32 space-y-1">
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Discount % <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  step="any"
                  placeholder="Percent"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 transition-all"
                />
              </div>
              <button
                type="submit"
                className="h-[38px] px-4 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                Create CN
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Grid Table */}
      {lst.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col">
          <div className="overflow-auto custom-scrollbar max-h-[calc(100vh-340px)]">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead className="sticky top-0 z-10">
                <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                  <th className="px-6 py-3 w-10 text-center">
                    <input
                      type="checkbox"
                      className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                      checked={selectedInvoiceIds.length === lst.length}
                      onChange={handleHeaderCheckbox}
                    />
                  </th>
                  <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Doc No
                  </th>
                  <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">
                    Invoice Amount
                  </th>
                  <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">
                    Receipt Amount
                  </th>
                  <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">
                    Invoice Date
                  </th>
                  <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">
                    Receipt Date
                  </th>
                  <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">
                    Days
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {lst.map((row, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors group"
                  >
                    <td className="px-6 py-3.5 text-center">
                      <input
                        type="checkbox"
                        className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                        checked={selectedInvoiceIds.includes(row.InvCode)}
                        onChange={() => handleRowCheckbox(row.InvCode)}
                      />
                    </td>
                    <td className="px-6 py-3.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {row.INVBill_No ?? "-"}
                    </td>
                    <td className="px-6 py-3.5 text-xs text-right font-mono font-bold text-slate-700 dark:text-slate-300">
                      ₹{H.formatNumber(row.INVAmount, precision)}
                    </td>
                    <td className="px-6 py-3.5 text-xs text-right font-mono font-bold text-slate-700 dark:text-slate-300">
                      ₹{H.formatNumber(row.RecAmount, precision)}
                    </td>
                    <td className="px-6 py-3.5 text-xs text-center text-slate-500 dark:text-slate-400">
                      {H.formatDateShort(row.INVDate)}
                    </td>
                    <td className="px-6 py-3.5 text-xs text-center text-slate-500 dark:text-slate-400">
                      {H.formatDateShort(row.RecDate)}
                    </td>
                    <td className="px-6 py-3.5 text-xs text-center font-bold text-slate-700 dark:text-slate-300">
                      {row.Days ?? "0"}
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
            <div className="flex items-center gap-8">
              <div className="text-right">
                <span className="text-[10px] text-slate-800/80 dark:text-brand-yellow/70 font-bold uppercase block">
                  Filtered Rows
                </span>
                <span className="text-base font-black text-slate-950 dark:text-brand-yellow">
                  {selectedInvoiceIds.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
