import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Search,
  RotateCcw,
  FileSpreadsheet,
  Printer,
  Loader2,
  Calendar,
  X,
  TrendingUp,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { reportApi } from "../../../services/report.service";
import { toast } from "../../../lib/toast";
import * as H from "../outstanding/outstandingHelpers";
import { DateRangePicker } from "../../DateRangePicker";
import { storage } from "../../../lib/storage";
import { STORAGE_KEYS } from "../../../lib/constants";

// ─── Interfaces ──────────────────────────────────────────────────────────────
interface CategoryData {
  name: string;
  retailSales: number;
  projectSales: number;
  retailSpl: number;
  total: number;
  growth?: {
    retailSales: number;
    projectSales: number;
    retailSpl: number;
    total: number;
  };
}

interface BrandData {
  brand: string;
  categories: CategoryData[];
  total: {
    retailSales: number;
    projectSales: number;
    retailSpl: number;
    total: number;
  };
  growth?: {
    retailSales: number;
    projectSales: number;
    retailSpl: number;
    total: number;
  };
}

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
            o[displayField]?.toLowerCase().includes(search.toLowerCase()),
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
        <div className="absolute z-50 top-full mt-1 w-full sm:min-w-[700px] md:min-w-[900px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl max-h-60 overflow-y-auto">
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
                    <div
                      className="w-[22%] truncate text-left"
                      title={opt.group}
                    >
                      {opt.group || ""}
                    </div>
                    <div
                      className="w-[24%] truncate text-left"
                      title={opt.area}
                    >
                      {opt.area || "-"}
                    </div>
                    <div
                      className="w-[16%] truncate text-left"
                      title={opt.city}
                    >
                      {opt.city || "-"}
                    </div>
                    <div
                      className="w-[20%] truncate text-left"
                      title={opt.mobile || opt.phone_1 || opt.phone_2}
                    >
                      {opt.mobile || opt.phone_1 || opt.phone_2 || "-"}
                    </div>
                    <div
                      className="w-[18%] truncate text-left"
                      title={opt.gstNo || opt.gstin}
                    >
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

export const DealerAnalysisReport: React.FC = () => {
  const precision = H.getPrecision();

  const [fromDate, setFromDate] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth() - 1, 1)
      .toISOString()
      .split("T")[0];
  });
  const [toDate, setToDate] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 0)
      .toISOString()
      .split("T")[0];
  });

  const [ledgers, setLedgers] = useState<any[]>([]);
  const [selectedLedger, setSelectedLedger] = useState<any>(null);

  const [currentYearData, setCurrentYearData] = useState<BrandData[]>([]);
  const [previousYearData, setPreviousYearData] = useState<BrandData[]>([]);
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [printLoading, setPrintLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [collapsedStates, setCollapsedStates] = useState<{
    [key: string]: boolean;
  }>({});

  // Dynamic year bounds
  const [selectedYearStart, setSelectedYearStart] = useState(() => {
    return new Date().getFullYear();
  });
  const selectedYearEnd = selectedYearStart + 1;

  useEffect(() => {
    const ldrList = storage.getItem<any[]>(STORAGE_KEYS.LEDGER_LIST) || [];
    const grpList = storage.getItem<any[]>(STORAGE_KEYS.GROUP_LIST) || [];

    const mapped = ldrList
      .filter((x: any) => !x.lock_Freeze)
      .map((ele: any) => {
        const parts: string[] = [ele.name];
        if (ele.address) parts.push(ele.address);
        if (ele.area) parts.push(ele.area);
        if (ele.city) parts.push(ele.city);
        if (ele.phone_1) parts.push(ele.phone_1);
        if (ele.phone_2) parts.push(ele.phone_2);
        if (ele.mobile) parts.push(ele.mobile);
        const grp = grpList.find((g: any) => g.id === ele.group_ID);
        return {
          ...ele,
          particular: parts.join(" "),
          group: grp?.name || "",
        };
      })
      .sort((a: any, b: any) => a.name.localeCompare(b.name));

    setLedgers(mapped);
  }, []);

  const toggleCollapse = (key: string) => {
    setCollapsedStates((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const isCollapsed = (key: string) => {
    return !!collapsedStates[key];
  };

  const calculateGrowth = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const groupAndSummarize = (items: any[]): BrandData[] => {
    const brandsMap: { [brand: string]: { [category: string]: CategoryData } } =
      {};

    items.forEach((item) => {
      const brand = item.Brand || "N/A";
      const category = item.Category || "N/A";
      const amount = Number(item.Amount) || 0;

      if (!brandsMap[brand]) {
        brandsMap[brand] = {};
      }
      if (!brandsMap[brand][category]) {
        brandsMap[brand][category] = {
          name: category,
          retailSales: 0,
          projectSales: 0,
          retailSpl: 0,
          total: 0,
        };
      }

      const catObj = brandsMap[brand][category];
      catObj.total += amount;

      const ledgerName = item.LedgerName || "";
      if (ledgerName.includes("(Project)")) {
        catObj.projectSales += amount;
      } else if (ledgerName.includes("(Retail Spl)")) {
        catObj.retailSpl += amount;
      } else {
        catObj.retailSales += amount;
      }
    });

    const brandsList: BrandData[] = Object.keys(brandsMap)
      .map((brandName) => {
        const categories = Object.values(brandsMap[brandName]).sort((a, b) =>
          a.name.localeCompare(b.name),
        );

        const total = {
          retailSales: categories.reduce((sum, c) => sum + c.retailSales, 0),
          projectSales: categories.reduce((sum, c) => sum + c.projectSales, 0),
          retailSpl: categories.reduce((sum, c) => sum + c.retailSpl, 0),
          total: categories.reduce((sum, c) => sum + c.total, 0),
        };

        return {
          brand: brandName,
          categories,
          total,
        };
      })
      .sort((a, b) => a.brand.localeCompare(b.brand));

    return brandsList;
  };

  const processDataByYear = (data: any[]) => {
    const toDateObj = new Date(toDate);
    const currentYear = toDateObj.getFullYear();
    const previousYear = currentYear - 1;

    // Current Year gets the full data without year-filtering
    const currentYearItems = data;

    // Previous Year filters data for items in the previous calendar year
    const previousYearItems = data.filter((item) => {
      const d = new Date(item.Date);
      return d.getFullYear() === previousYear;
    });

    const currentBrands = groupAndSummarize(currentYearItems);
    const previousBrands = groupAndSummarize(previousYearItems);

    // Calculate growth percentages
    currentBrands.forEach((brand) => {
      const prevBrand = previousBrands.find((pb) => pb.brand === brand.brand);
      if (prevBrand) {
        brand.growth = {
          retailSales: calculateGrowth(
            brand.total.retailSales,
            prevBrand.total.retailSales,
          ),
          projectSales: calculateGrowth(
            brand.total.projectSales,
            prevBrand.total.projectSales,
          ),
          retailSpl: calculateGrowth(
            brand.total.retailSpl,
            prevBrand.total.retailSpl,
          ),
          total: calculateGrowth(brand.total.total, prevBrand.total.total),
        };

        brand.categories.forEach((cat) => {
          const prevCat = prevBrand.categories.find(
            (pc) => pc.name === cat.name,
          );
          if (prevCat) {
            cat.growth = {
              retailSales: calculateGrowth(
                cat.retailSales,
                prevCat.retailSales,
              ),
              projectSales: calculateGrowth(
                cat.projectSales,
                prevCat.projectSales,
              ),
              retailSpl: calculateGrowth(cat.retailSpl, prevCat.retailSpl),
              total: calculateGrowth(cat.total, prevCat.total),
            };
          }
        });
      }
    });

    setCurrentYearData(currentBrands);
    setPreviousYearData(previousBrands);
  };

  const getFilters = () => {
    return {
      fromDate: fromDate,
      toDate: toDate,
      ledgerId: selectedLedger ? selectedLedger.id : 0,
      includeChild: true,
    };
  };

  const submitSearch = useCallback(async () => {
    if (new Date(fromDate) > new Date(toDate)) {
      toast.info(
        "From Date cannot be greater than To Date.",
        "Validation Error",
      );
      return;
    }

    const startYear = new Date(fromDate).getFullYear();
    setSelectedYearStart(startYear);

    setLoading(true);
    try {
      const data = await reportApi.dealerSales(getFilters());
      if (data && data.length > 0) {
        processDataByYear(data);
      } else {
        setCurrentYearData([]);
        setPreviousYearData([]);
        toast.info("No data found for selected criteria.", "Info");
      }
    } catch (err: any) {
      setCurrentYearData([]);
      setPreviousYearData([]);
      toast.info(err?.message || "Failed to load report", "Error");
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate, selectedLedger]);

  const handleExport = async () => {
    setExportLoading(true);
    try {
      const blob = await reportApi.dealerSalesExport(getFilters());
      if (blob?.size) {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "dealer-analysis-report.xlsx";
        a.click();
        URL.revokeObjectURL(a.href);
      } else {
        toast.info("No data found to export.", "Info");
      }
    } catch {
      toast.error("Failed to export report.");
    } finally {
      setExportLoading(false);
    }
  };

  const handlePrint = async () => {
    setPrintLoading(true);
    try {
      const rawData =
        currentYearData.length > 0 || previousYearData.length > 0
          ? null
          : await reportApi.dealerSales(getFilters());

      let printableCurrent = currentYearData;
      let printablePrevious = previousYearData;

      if (rawData && rawData.length > 0) {
        const toDateObj = new Date(toDate);
        const currentYear = toDateObj.getFullYear();
        const previousYear = currentYear - 1;
        const currentItems = rawData;
        const prevItems = rawData.filter(
          (item) => new Date(item.Date).getFullYear() === previousYear,
        );
        printableCurrent = groupAndSummarize(currentItems);
        printablePrevious = groupAndSummarize(prevItems);

        printableCurrent.forEach((brand) => {
          const prevBrand = printablePrevious.find(
            (pb) => pb.brand === brand.brand,
          );
          if (prevBrand) {
            brand.growth = {
              retailSales: calculateGrowth(
                brand.total.retailSales,
                prevBrand.total.retailSales,
              ),
              projectSales: calculateGrowth(
                brand.total.projectSales,
                prevBrand.total.projectSales,
              ),
              retailSpl: calculateGrowth(
                brand.total.retailSpl,
                prevBrand.total.retailSpl,
              ),
              total: calculateGrowth(brand.total.total, prevBrand.total.total),
            };
            brand.categories.forEach((cat) => {
              const prevCat = prevBrand.categories.find(
                (pc) => pc.name === cat.name,
              );
              if (prevCat) {
                cat.growth = {
                  retailSales: calculateGrowth(
                    cat.retailSales,
                    prevCat.retailSales,
                  ),
                  projectSales: calculateGrowth(
                    cat.projectSales,
                    prevCat.projectSales,
                  ),
                  retailSpl: calculateGrowth(cat.retailSpl, prevCat.retailSpl),
                  total: calculateGrowth(cat.total, prevCat.total),
                };
              }
            });
          }
        });
      }

      if (printableCurrent.length || printablePrevious.length) {
        const pdfMake = (await import("pdfmake/build/pdfmake")).default;
        const pdfFonts = (await import("pdfmake/build/vfs_fonts")).default;
        (pdfMake as any).vfs = pdfFonts?.pdfMake?.vfs || pdfFonts;

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
              text: "Dealer Analysis Report",
              style: "header",
              margin: [0, 0, 0, 10],
            },
            {
              text: `Ledger: ${selectedLedger ? selectedLedger.name : "All"} | Period: ${H.formatDisplayDate(fromDate)} to ${H.formatDisplayDate(toDate)}`,
              fontSize: 10,
              bold: true,
              margin: [0, 0, 0, 15],
            },
            // Title for Current Year
            {
              text: `${selectedYearStart}-${selectedYearEnd} (Current Year)`,
              style: "subHeader",
              margin: [0, 10, 0, 5],
            },
            // Table for Current Year
            {
              table: {
                headerRows: 1,
                widths: ["*", "15%", "15%", "15%", "15%", "15%"],
                body: [
                  [
                    { text: "Brand / Category", style: "tableHeader" },
                    {
                      text: "Retail Sales",
                      style: "tableHeader",
                      alignment: "right",
                    },
                    {
                      text: "Project Sales",
                      style: "tableHeader",
                      alignment: "right",
                    },
                    {
                      text: "Retail Spl",
                      style: "tableHeader",
                      alignment: "right",
                    },
                    { text: "Total", style: "tableHeader", alignment: "right" },
                    {
                      text: "Growth %",
                      style: "tableHeader",
                      alignment: "right",
                    },
                  ],
                  ...printableCurrent.flatMap((brand) => [
                    [
                      { text: brand.brand, bold: true, fillColor: "#f8fafc" },
                      {
                        text: H.formatNumber(
                          brand.total.retailSales,
                          precision,
                        ),
                        bold: true,
                        alignment: "right",
                        fillColor: "#f8fafc",
                      },
                      {
                        text: H.formatNumber(
                          brand.total.projectSales,
                          precision,
                        ),
                        bold: true,
                        alignment: "right",
                        fillColor: "#f8fafc",
                      },
                      {
                        text: H.formatNumber(brand.total.retailSpl, precision),
                        bold: true,
                        alignment: "right",
                        fillColor: "#f8fafc",
                      },
                      {
                        text: H.formatNumber(brand.total.total, precision),
                        bold: true,
                        alignment: "right",
                        fillColor: "#f8fafc",
                      },
                      {
                        text: brand.growth
                          ? `${brand.growth.total >= 0 ? "+" : ""}${H.formatNumber(brand.growth.total, 2)}%`
                          : "-",
                        bold: true,
                        alignment: "right",
                        fillColor: "#f8fafc",
                      },
                    ],
                    ...brand.categories.map((cat) => [
                      { text: `  ${cat.name}`, color: "#475569" },
                      {
                        text: H.formatNumber(cat.retailSales, precision),
                        alignment: "right",
                        color: "#475569",
                      },
                      {
                        text: H.formatNumber(cat.projectSales, precision),
                        alignment: "right",
                        color: "#475569",
                      },
                      {
                        text: H.formatNumber(cat.retailSpl, precision),
                        alignment: "right",
                        color: "#475569",
                      },
                      {
                        text: H.formatNumber(cat.total, precision),
                        alignment: "right",
                        color: "#475569",
                      },
                      {
                        text: cat.growth
                          ? `${cat.growth.total >= 0 ? "+" : ""}${H.formatNumber(cat.growth.total, 2)}%`
                          : "-",
                        alignment: "right",
                        color: "#475569",
                      },
                    ]),
                  ]),
                ],
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
            // Spacing / Page Break
            { text: "", pageBreak: "before", margin: [0, 0, 0, 0] },
            // Title for Previous Year
            {
              text: `${selectedYearStart - 1}-${selectedYearStart} (Previous Year)`,
              style: "subHeader",
              margin: [0, 10, 0, 5],
            },
            // Table for Previous Year
            {
              table: {
                headerRows: 1,
                widths: ["*", "18%", "18%", "18%", "18%"],
                body: [
                  [
                    { text: "Brand / Category", style: "tableHeader" },
                    {
                      text: "Retail Sales",
                      style: "tableHeader",
                      alignment: "right",
                    },
                    {
                      text: "Project Sales",
                      style: "tableHeader",
                      alignment: "right",
                    },
                    {
                      text: "Retail Spl",
                      style: "tableHeader",
                      alignment: "right",
                    },
                    { text: "Total", style: "tableHeader", alignment: "right" },
                  ],
                  ...printablePrevious.flatMap((brand) => [
                    [
                      { text: brand.brand, bold: true, fillColor: "#f8fafc" },
                      {
                        text: H.formatNumber(
                          brand.total.retailSales,
                          precision,
                        ),
                        bold: true,
                        alignment: "right",
                        fillColor: "#f8fafc",
                      },
                      {
                        text: H.formatNumber(
                          brand.total.projectSales,
                          precision,
                        ),
                        bold: true,
                        alignment: "right",
                        fillColor: "#f8fafc",
                      },
                      {
                        text: H.formatNumber(brand.total.retailSpl, precision),
                        bold: true,
                        alignment: "right",
                        fillColor: "#f8fafc",
                      },
                      {
                        text: H.formatNumber(brand.total.total, precision),
                        bold: true,
                        alignment: "right",
                        fillColor: "#f8fafc",
                      },
                    ],
                    ...brand.categories.map((cat) => [
                      { text: `  ${cat.name}`, color: "#475569" },
                      {
                        text: H.formatNumber(cat.retailSales, precision),
                        alignment: "right",
                        color: "#475569",
                      },
                      {
                        text: H.formatNumber(cat.projectSales, precision),
                        alignment: "right",
                        color: "#475569",
                      },
                      {
                        text: H.formatNumber(cat.retailSpl, precision),
                        alignment: "right",
                        color: "#475569",
                      },
                      {
                        text: H.formatNumber(cat.total, precision),
                        alignment: "right",
                        color: "#475569",
                      },
                    ]),
                  ]),
                ],
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
          ],
          styles: {
            header: { fontSize: 14, bold: true, color: "#1e293b" },
            subHeader: { fontSize: 11, bold: true, color: "#2563eb" },
            tableHeader: {
              fontSize: 8,
              bold: true,
              color: "#475569",
              fillColor: "#f1f5f9",
            },
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
    setCurrentYearData([]);
    setPreviousYearData([]);
    setSelectedLedger(null);
    const d = new Date();
    setFromDate(
      new Date(d.getFullYear(), d.getMonth() - 1, 1)
        .toISOString()
        .split("T")[0],
    );
    setToDate(new Date(d.getFullYear(), d.getMonth(), 0).toISOString().split("T")[0]);
  };

  const hasResults = currentYearData.length > 0 || previousYearData.length > 0;

  return (
    <div className="font-sans text-slate-700 dark:text-slate-200 pt-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-amber-100 dark:bg-amber-900/30 p-2 rounded-lg text-amber-600 dark:text-amber-400">
            <TrendingUp size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 font-sans">
              Dealer Analysis Report
            </h1>
            <p className="text-xs text-slate-500 font-medium font-sans">
              Compare retail and project sales performance side-by-side with
              growth metrics.
            </p>
          </div>
        </div>
      </div>

      {/* Filters Card */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-5">
        <div className="flex flex-wrap items-end gap-3">
          {/* Select Ledger */}
          <div className="flex-1 min-w-[250px] md:max-w-[350px]">
            <AutocompleteInput
              label="Select Ledger"
              placeholder="Select Ledger"
              value={selectedLedger}
              options={ledgers}
              onChange={setSelectedLedger}
              templateType="ledger"
            />
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
                      setFromDate(
                        `${partsFrom[2]}-${partsFrom[1]}-${partsFrom[0]}`,
                      );
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
          </div>
        </div>
      </div>

      {/* Comparative Cards Section */}
      {hasResults && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">
          {/* Current Year Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col p-5">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3 mb-4 flex items-center gap-2">
              <Calendar className="text-blue-500" size={18} />
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                {selectedYearStart}-{selectedYearEnd} (Current Year)
              </h3>
            </div>

            <div className="grid grid-cols-6 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 px-3">
              <div className="text-left">Brand</div>
              <div className="text-right">Retail Sales</div>
              <div className="text-right">Project Sales</div>
              <div className="text-right">Retail Spl</div>
              <div className="text-right">Total</div>
              <div className="text-right">Growth %</div>
            </div>

            <div className="space-y-2 overflow-y-auto max-h-[600px] pr-1">
              {currentYearData.map((brandGroup, idx) => (
                <div
                  key={idx}
                  className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50/20 dark:bg-slate-800/10"
                >
                  <div
                    onClick={() =>
                      toggleCollapse(`current_${brandGroup.brand}`)
                    }
                    className="grid grid-cols-6 items-center py-3 border-b border-slate-100 dark:border-slate-800 cursor-pointer select-none bg-slate-50/50 dark:bg-slate-800/30 px-3 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all duration-200"
                  >
                    <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200 truncate">
                      {isCollapsed(`current_${brandGroup.brand}`) ? (
                        <ChevronUp size={16} className="text-slate-400" />
                      ) : (
                        <ChevronDown size={16} className="text-slate-400" />
                      )}
                      <span title={brandGroup.brand}>{brandGroup.brand}</span>
                    </div>
                    <div className="text-right font-mono font-bold text-slate-700 dark:text-slate-300">
                      ₹
                      {H.formatNumber(brandGroup.total.retailSales, precision)}
                    </div>
                    <div className="text-right font-mono font-bold text-slate-700 dark:text-slate-300">
                      ₹
                      {H.formatNumber(brandGroup.total.projectSales, precision)}
                    </div>
                    <div className="text-right font-mono font-bold text-slate-700 dark:text-slate-300">
                      ₹{H.formatNumber(brandGroup.total.retailSpl, precision)}
                    </div>
                    <div className="text-right font-mono font-bold text-slate-800 dark:text-slate-200">
                      ₹{H.formatNumber(brandGroup.total.total, precision)}
                    </div>
                    <div
                      className={`text-right font-mono font-bold ${
                        brandGroup.growth && brandGroup.growth.total >= 0
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-rose-600 dark:text-rose-400"
                      }`}
                    >
                      {brandGroup.growth !== undefined &&
                      brandGroup.growth.total !== null ? (
                        `(${brandGroup.growth.total >= 0 ? "+" : ""}${H.formatNumber(brandGroup.growth.total, 2)}%)`
                      ) : (
                        "-"
                      )}
                    </div>
                  </div>

                  {isCollapsed(`current_${brandGroup.brand}`) && (
                    <div className="p-4 bg-slate-50/10 dark:bg-slate-900/20 transition-all duration-300">
                      <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800">
                        <table className="w-full text-left border-collapse whitespace-nowrap bg-white dark:bg-slate-900">
                          <thead>
                            <tr className="bg-slate-50/80 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-800">
                              <th className="px-4 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                Category
                              </th>
                              <th className="px-4 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">
                                Retail Sales
                              </th>
                              <th className="px-4 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">
                                Project Sales
                              </th>
                              <th className="px-4 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">
                                Retail Spl
                              </th>
                              <th className="px-4 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">
                                Total
                              </th>
                              <th className="px-4 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">
                                Growth %
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {brandGroup.categories.map((cat, cIdx) => (
                              <tr
                                key={cIdx}
                                className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                              >
                                <td className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[150px]" title={cat.name}>
                                  {cat.name}
                                </td>
                                <td className="px-4 py-2 text-xs font-mono text-right font-medium text-slate-600 dark:text-slate-400">
                                  ₹{H.formatNumber(cat.retailSales, precision)}
                                </td>
                                <td className="px-4 py-2 text-xs font-mono text-right font-medium text-slate-600 dark:text-slate-400">
                                  ₹{H.formatNumber(cat.projectSales, precision)}
                                </td>
                                <td className="px-4 py-2 text-xs font-mono text-right font-medium text-slate-600 dark:text-slate-400">
                                  ₹{H.formatNumber(cat.retailSpl, precision)}
                                </td>
                                <td className="px-4 py-2 text-xs font-mono text-right font-semibold text-slate-800 dark:text-slate-200">
                                  ₹{H.formatNumber(cat.total, precision)}
                                </td>
                                <td
                                  className={`px-4 py-2 text-xs font-mono text-right font-bold ${
                                    cat.growth && cat.growth.total >= 0
                                      ? "text-emerald-600 dark:text-emerald-400"
                                      : "text-rose-600 dark:text-rose-400"
                                  }`}
                                >
                                  {cat.growth !== undefined &&
                                  cat.growth.total !== null ? (
                                    `${cat.growth.total >= 0 ? "+" : ""}${H.formatNumber(cat.growth.total, 2)}%`
                                  ) : (
                                    "-"
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Previous Year Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col p-5">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3 mb-4 flex items-center gap-2">
              <Calendar className="text-indigo-500" size={18} />
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                {selectedYearStart - 1}-{selectedYearStart} (Previous Year)
              </h3>
            </div>

            <div className="grid grid-cols-5 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 px-3">
              <div className="text-left">Brand</div>
              <div className="text-right">Retail Sales</div>
              <div className="text-right">Project Sales</div>
              <div className="text-right">Retail Spl</div>
              <div className="text-right">Total</div>
            </div>

            <div className="space-y-2 overflow-y-auto max-h-[600px] pr-1">
              {previousYearData.map((brandGroup, idx) => (
                <div
                  key={idx}
                  className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50/20 dark:bg-slate-800/10"
                >
                  <div
                    onClick={() =>
                      toggleCollapse(`previous_${brandGroup.brand}`)
                    }
                    className="grid grid-cols-5 items-center py-3 border-b border-slate-100 dark:border-slate-800 cursor-pointer select-none bg-slate-50/50 dark:bg-slate-800/30 px-3 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all duration-200"
                  >
                    <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200 truncate">
                      {isCollapsed(`previous_${brandGroup.brand}`) ? (
                        <ChevronUp size={16} className="text-slate-400" />
                      ) : (
                        <ChevronDown size={16} className="text-slate-400" />
                      )}
                      <span title={brandGroup.brand}>{brandGroup.brand}</span>
                    </div>
                    <div className="text-right font-mono font-bold text-slate-700 dark:text-slate-300">
                      ₹
                      {H.formatNumber(brandGroup.total.retailSales, precision)}
                    </div>
                    <div className="text-right font-mono font-bold text-slate-700 dark:text-slate-300">
                      ₹
                      {H.formatNumber(brandGroup.total.projectSales, precision)}
                    </div>
                    <div className="text-right font-mono font-bold text-slate-700 dark:text-slate-300">
                      ₹{H.formatNumber(brandGroup.total.retailSpl, precision)}
                    </div>
                    <div className="text-right font-mono font-bold text-slate-800 dark:text-slate-200">
                      ₹{H.formatNumber(brandGroup.total.total, precision)}
                    </div>
                  </div>

                  {isCollapsed(`previous_${brandGroup.brand}`) && (
                    <div className="p-4 bg-slate-50/10 dark:bg-slate-900/20 transition-all duration-300">
                      <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800">
                        <table className="w-full text-left border-collapse whitespace-nowrap bg-white dark:bg-slate-900">
                          <thead>
                            <tr className="bg-slate-50/80 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-800">
                              <th className="px-4 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                Category
                              </th>
                              <th className="px-4 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">
                                Retail Sales
                              </th>
                              <th className="px-4 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">
                                Project Sales
                              </th>
                              <th className="px-4 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">
                                Retail Spl
                              </th>
                              <th className="px-4 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">
                                Total
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {brandGroup.categories.map((cat, cIdx) => (
                              <tr
                                key={cIdx}
                                className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                              >
                                <td className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[150px]" title={cat.name}>
                                  {cat.name}
                                </td>
                                <td className="px-4 py-2 text-xs font-mono text-right font-medium text-slate-600 dark:text-slate-400">
                                  ₹{H.formatNumber(cat.retailSales, precision)}
                                </td>
                                <td className="px-4 py-2 text-xs font-mono text-right font-medium text-slate-600 dark:text-slate-400">
                                  ₹{H.formatNumber(cat.projectSales, precision)}
                                </td>
                                <td className="px-4 py-2 text-xs font-mono text-right font-medium text-slate-600 dark:text-slate-400">
                                  ₹{H.formatNumber(cat.retailSpl, precision)}
                                </td>
                                <td className="px-4 py-2 text-xs font-mono text-right font-semibold text-slate-800 dark:text-slate-200">
                                  ₹{H.formatNumber(cat.total, precision)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
