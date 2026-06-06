import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  RotateCcw,
  FileSpreadsheet,
  Loader2,
  Calendar,
  X,
  Eye,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { reportApi } from "../../../services/report.service";
import { commonApi } from "../../../lib/api-client";
import { toast } from "../../../lib/toast";
import * as H from "../outstanding/outstandingHelpers";
import { DateRangePicker } from "../../DateRangePicker";

export const SalesDataBySalesPersonReport: React.FC = () => {
  const precision = H.getPrecision();

  // Filters State
  const [fromDate, setFromDate] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split("T")[0];
  });
  const [toDate, setToDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [selectedSalesPersonId, setSelectedSalesPersonId] = useState<string>("");
  const [salesPersonList, setSalesPersonList] = useState<any[]>([]);
  const [showLedgerWise, setShowLedgerWise] = useState<boolean>(true);

  // Search Results & UI States
  const [salesDataLedgerWiseList, setSalesDataLedgerWiseList] = useState<any[]>([]);
  const [salesDataStockPlaceWiseList, setSalesDataStockPlaceWiseList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Tabs & Accordion State
  const [activeTab, setActiveTab] = useState<string>("ledger-wise");
  // dynamicTabs will store the opened detailed views
  // type: 'ledger' or 'stock-place'
  const [dynamicTabs, setDynamicTabs] = useState<any[]>([]);
  const [expandedAccordions, setExpandedAccordions] = useState<Record<string, boolean>>({});

  // Inventory Modal State
  const [inventoryModalOpen, setInventoryModalOpen] = useState(false);
  const [inventoryData, setInventoryData] = useState<any[]>([]);
  const [inventoryLoading, setInventoryLoading] = useState(false);
  const [expandedInventoryCategories, setExpandedInventoryCategories] = useState<Record<string, boolean>>({});

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

  // Update active tab when radio button changes
  useEffect(() => {
    if (showLedgerWise && activeTab === "stock-place-wise") {
      setActiveTab("ledger-wise");
    } else if (!showLedgerWise && activeTab === "ledger-wise") {
      setActiveTab("stock-place-wise");
    }
  }, [showLedgerWise, activeTab]);

  const formatDateForApi = (dateStr: string, time: string) => {
    if (!dateStr) return "";
    const [y, m, d] = dateStr.split("-");
    return `${d}/${m}/${y} ${time}`;
  };

  const getFilters = useCallback(() => {
    return {
      salesByUserId: selectedSalesPersonId || null,
      fromDate: formatDateForApi(fromDate, "00:00:00"),
      toDate: formatDateForApi(toDate, "23:59:59"),
    };
  }, [fromDate, toDate, selectedSalesPersonId]);

  const transformData = (data: any[]) => {
    const groupedData = data.reduce((acc, curr) => {
      const { salesPersonName, ledgerName, amount, ledger_ID } = curr;
      const key = salesPersonName || "Unassigned";
      if (!acc[key]) {
        acc[key] = {
          salesPersonName: key,
          totalamount: 0,
          ledgerDetails: [],
        };
      }
      acc[key].totalamount += Number(amount);
      acc[key].ledgerDetails.push({ ledgerName, amount, ledger_ID });
      return acc;
    }, {} as any);
    return Object.values(groupedData);
  };

  const transformStockPlaceData = (data: any[]) => {
    const groupedData = data.reduce((acc, curr) => {
      const { spName, salesPersonName, amount } = curr;
      const key = spName || "Unknown Stock Place";
      if (!acc[key]) {
        acc[key] = {
          spName: key,
          totalamount: 0,
          salesPersonDetails: [],
        };
      }
      acc[key].totalamount += Number(amount);
      acc[key].salesPersonDetails.push({ salesPersonName, amount });
      return acc;
    }, {} as any);
    return Object.values(groupedData);
  };

  const submitSearch = useCallback(async () => {
    setSubmitted(true);
    if (!fromDate || !toDate) {
      toast.info("From Date and To Date are required.", "Validation Error");
      return;
    }
    if (new Date(fromDate) > new Date(toDate)) {
      toast.info("From Date cannot be greater than To Date.", "Validation Error");
      return;
    }

    setLoading(true);
    try {
      const payload = getFilters();
      const data = await reportApi.salesDataBySalesPersonReport(payload);
      if (data) {
        setSalesDataLedgerWiseList(transformData(data.salesDataLedgerWiseList || []));
        setSalesDataStockPlaceWiseList(transformStockPlaceData(data.salesDataStockPlaceWiseList || []));
      } else {
        setSalesDataLedgerWiseList([]);
        setSalesDataStockPlaceWiseList([]);
      }
    } catch (err: any) {
      console.error(err);
      toast.info(err?.response?.data?.message || "Failed to load report", "Info");
      setSalesDataLedgerWiseList([]);
      setSalesDataStockPlaceWiseList([]);
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate, getFilters]);

  const handleExport = async () => {
    setSubmitted(true);
    if (!fromDate || !toDate) {
      toast.info("From Date and To Date are required.", "Validation Error");
      return;
    }
    setExportLoading(true);
    try {
      const payload = getFilters();
      const blob = await reportApi.salesDataBySalesPersonReportExport(payload);
      if (blob && blob.size > 0) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "SalesDataBySalesPersonReport.xlsx";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        toast.info("No data found to export.", "Info");
      }
    } catch (err: any) {
      console.error(err);
      toast.info(err?.response?.data?.message || "Export failed", "Info");
    } finally {
      setExportLoading(false);
    }
  };

  const handleClear = () => {
    setFromDate(() => {
      const d = new Date();
      return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split("T")[0];
    });
    setToDate(() => new Date().toISOString().split("T")[0]);
    setSelectedSalesPersonId("");
    setShowLedgerWise(true);
    setSalesDataLedgerWiseList([]);
    setSalesDataStockPlaceWiseList([]);
    setDynamicTabs([]);
    setExpandedAccordions({});
    setSubmitted(false);
    setActiveTab("ledger-wise");
  };

  const openDynamicTab = (item: any, type: "ledger" | "stock-place") => {
    const title = type === "ledger" ? item.salesPersonName : item.spName;
    const tabId = `tab-${type}-${title}`;
    
    // Check if tab exists
    const existingTab = dynamicTabs.find(t => t.id === tabId);
    if (!existingTab) {
      const newTab = {
        id: tabId,
        title,
        type,
        recordList: type === "ledger" ? item.ledgerDetails : item.salesPersonDetails
      };
      setDynamicTabs([...dynamicTabs, newTab]);
    }
    setActiveTab(tabId);
  };

  const closeDynamicTab = (e: React.MouseEvent, tabId: string) => {
    e.stopPropagation();
    setDynamicTabs(prev => prev.filter(t => t.id !== tabId));
    if (activeTab === tabId) {
      setActiveTab(showLedgerWise ? "ledger-wise" : "stock-place-wise");
    }
  };

  const toggleAccordion = (key: string) => {
    setExpandedAccordions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const submitInventoryView = async (ledgerId: number) => {
    setInventoryLoading(true);
    setInventoryData([]);
    try {
      const payload = {
        dateFrom: formatDateForApi(fromDate, "00:00:00"),
        dateTo: formatDateForApi(toDate, "23:59:59"),
        billDetailsReq: false,
        brand: null,
        category: null,
        dateWise: false,
        invType: null,
        itemGroup: null,
        itemId: null,
        itemWise: true,
        item_CodeTxt: null,
        ledgerWise: false,
        mfrReq: false,
        name: null,
        projectIds: 0,
        sizes: null,
        spId: null,
        spIdWise: false,
        subsidiaryOption: 0,
        type: null,
        ledgerIds: ledgerId
      };
      const data = await reportApi.inventoryReport(payload);
      if (data && data.length > 0) {
        setInventoryData(data);
        setExpandedInventoryCategories({});
        setInventoryModalOpen(true);
      } else {
        toast.info("No values found for selected criteria", "Info");
      }
    } catch (err: any) {
      toast.info(err?.response?.data?.message || "Failed to fetch inventory", "Info");
    } finally {
      setInventoryLoading(false);
    }
  };

  const toggleInventoryAccordion = (key: string) => {
    setExpandedInventoryCategories(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Group inventory data locally for modal
  const groupedInventoryData = () => {
    const grouped = inventoryData.reduce((acc, curr) => {
      const brand = curr.Brand || "Unbranded";
      const category = curr.Category || "Uncategorized";
      
      if (!acc[brand]) acc[brand] = { amount: 0, categories: {} };
      acc[brand].amount += curr.Amount;
      
      if (!acc[brand].categories[category]) {
        acc[brand].categories[category] = { amount: 0, items: [] };
      }
      acc[brand].categories[category].amount += curr.Amount;
      acc[brand].categories[category].items.push(curr);
      
      return acc;
    }, {} as any);
    return grouped;
  };

  // Calculations for sticky footer
  const renderSummaryFooter = () => {
    let totalRows = 0;
    let totalAmount = 0;
    
    if (activeTab === "ledger-wise") {
      totalRows = salesDataLedgerWiseList.length;
      totalAmount = salesDataLedgerWiseList.reduce((sum, item) => sum + (Number(item.totalamount) || 0), 0);
    } else if (activeTab === "stock-place-wise") {
      totalRows = salesDataStockPlaceWiseList.length;
      totalAmount = salesDataStockPlaceWiseList.reduce((sum, item) => sum + (Number(item.totalamount) || 0), 0);
    } else {
      // Dynamic Tab active
      const tab = dynamicTabs.find(t => t.id === activeTab);
      if (tab && tab.recordList) {
        totalRows = tab.recordList.length;
        totalAmount = tab.recordList.reduce((sum: number, item: any) => sum + (Number(item.amount) || 0), 0);
      }
    }

    return (
      <div className="sticky bottom-0 z-10 bg-brand-yellow dark:bg-brand-yellow/10 rounded-xl border border-brand-yellow/20 dark:border-brand-yellow/5 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] p-4 select-none mt-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <span className="text-xs font-bold text-slate-800 dark:text-brand-yellow/90 uppercase">
              Total Rows :{" "}
              <span className="text-slate-950 dark:text-brand-yellow font-extrabold">{totalRows}</span>
            </span>
            <span className="text-xs font-bold text-slate-800 dark:text-brand-yellow/90 uppercase">
              Filtered Rows :{" "}
              <span className="text-slate-950 dark:text-brand-yellow font-extrabold">{totalRows}</span>
            </span>
          </div>

          <div className="flex items-center gap-8">
            <div className="text-right">
              <span className="text-[10px] text-slate-800/80 dark:text-brand-yellow/70 font-bold uppercase block">
                Total Amount
              </span>
              <span className="text-base font-black text-slate-950 dark:text-brand-yellow font-mono">
                ₹{H.formatNumber(totalAmount, precision)}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
          Sales Data By Sales Person Report
        </h1>
      </div>

      {/* Filters Card */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-5 mb-5">
        <div className="flex flex-wrap items-end gap-4">
          {/* Sales Person Dropdown */}
          <div className="w-full sm:w-64 space-y-1">
            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Sales Person
            </label>
            <select
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-semibold cursor-pointer"
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

          {/* Radio Buttons */}
          <div className="flex flex-col gap-1.5 px-2 pb-[2px]">
            <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-slate-700 dark:text-slate-300">
              <input
                type="radio"
                name="reportType"
                className="w-4 h-4 text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-600"
                checked={showLedgerWise}
                onChange={() => setShowLedgerWise(true)}
              />
              Show Ledger-Wise Sales
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-slate-700 dark:text-slate-300">
              <input
                type="radio"
                name="reportType"
                className="w-4 h-4 text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-600"
                checked={!showLedgerWise}
                onChange={() => setShowLedgerWise(false)}
              />
              Show Stock Place-Wise Sales
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pb-[2px] ml-auto">
            <button
              onClick={submitSearch}
              disabled={loading}
              title="Search"
              className="w-10 h-10 flex items-center justify-center bg-[#2D9E75] text-white rounded-lg hover:opacity-90 transition-all shadow-sm cursor-pointer disabled:opacity-70"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
            </button>

            <button
              onClick={handleClear}
              title="Reset Filters"
              className="w-10 h-10 flex items-center justify-center bg-lime-500 text-white rounded-lg hover:opacity-90 transition-all shadow-sm cursor-pointer"
            >
              <RotateCcw size={16} />
            </button>

            <button
              onClick={handleExport}
              disabled={exportLoading || loading}
              title="Excel Export"
              className="w-10 h-10 flex items-center justify-center bg-emerald-600 text-white rounded-lg hover:opacity-90 transition-all shadow-sm cursor-pointer disabled:opacity-70"
            >
              {exportLoading ? <Loader2 size={16} className="animate-spin" /> : <FileSpreadsheet size={16} />}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs and Data Card */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col relative overflow-hidden min-h-[400px]">
        {/* Tab Header */}
        <div className="flex overflow-x-auto border-b border-slate-200 dark:border-slate-700 scrollbar-none bg-slate-50 dark:bg-slate-800/50">
          <button
            onClick={() => {
              setShowLedgerWise(true);
              setActiveTab("ledger-wise");
            }}
            className={`px-5 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
              activeTab === "ledger-wise"
                ? "border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
            }`}
          >
            Ledger-Wise Sales
          </button>
          <button
            onClick={() => {
              setShowLedgerWise(false);
              setActiveTab("stock-place-wise");
            }}
            className={`px-5 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
              activeTab === "stock-place-wise"
                ? "border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
            }`}
          >
            Stock Place-Wise Sales
          </button>
          {dynamicTabs.map((tab) => (
            <div
              key={tab.id}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors group cursor-pointer ${
                activeTab === tab.id
                  ? "border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900"
                  : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span>{tab.title} Sales</span>
              <button
                onClick={(e) => closeDynamicTab(e, tab.id)}
                className={`p-1 rounded-full transition-colors ${
                  activeTab === tab.id 
                    ? "hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400" 
                    : "hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300"
                }`}
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 p-4 overflow-auto">
          {activeTab === "ledger-wise" && (
            <div className="space-y-3">
              {salesDataLedgerWiseList.length === 0 ? (
                <div className="text-center py-10 text-slate-500">No data available</div>
              ) : (
                salesDataLedgerWiseList.map((sp, idx) => {
                  const key = `ledger_${idx}`;
                  const isExpanded = expandedAccordions[key];
                  return (
                    <div key={key} className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-800">
                      <div
                        className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors"
                        onClick={() => {
                          toggleAccordion(key);
                          openDynamicTab(sp, "ledger");
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                          </button>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {sp.salesPersonName}
                          </span>
                        </div>
                        <div className="font-bold text-slate-800 dark:text-slate-200">
                          Total Amount: ₹{H.formatNumber(sp.totalamount, precision)}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {activeTab === "stock-place-wise" && (
            <div className="space-y-3">
              {salesDataStockPlaceWiseList.length === 0 ? (
                <div className="text-center py-10 text-slate-500">No data available</div>
              ) : (
                salesDataStockPlaceWiseList.map((sp, idx) => {
                  const key = `stock_${idx}`;
                  const isExpanded = expandedAccordions[key];
                  return (
                    <div key={key} className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-800">
                      <div
                        className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors"
                        onClick={() => {
                          toggleAccordion(key);
                          openDynamicTab(sp, "stock-place");
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                          </button>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {sp.spName}
                          </span>
                        </div>
                        <div className="font-bold text-slate-800 dark:text-slate-200">
                          Total Amount: ₹{H.formatNumber(sp.totalamount, precision)}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Render Dynamic Tab Grid */}
          {dynamicTabs.map((tab) => {
            if (activeTab !== tab.id) return null;
            return (
              <div key={tab.id} className="w-full">
                <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                      <tr>
                        <th className="px-4 py-3 text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                          {tab.type === "ledger" ? "Ledger Name" : "Sales Person"}
                        </th>
                        <th className="px-4 py-3 text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider text-right w-48">
                          Amount
                        </th>
                        {tab.type === "ledger" && (
                          <th className="px-4 py-3 text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider text-center w-20">
                            Action
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                      {tab.recordList.map((row: any, idx: number) => (
                        <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group">
                          <td className="px-4 py-3 text-sm text-slate-800 dark:text-slate-200 font-medium">
                            {tab.type === "ledger" ? row.ledgerName : row.salesPersonName}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-800 dark:text-slate-200 text-right font-semibold">
                            ₹{H.formatNumber(row.amount, precision)}
                          </td>
                          {tab.type === "ledger" && (
                            <td className="px-4 py-3 text-center">
                              <button
                                onClick={() => submitInventoryView(row.ledger_ID)}
                                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 flex items-center justify-center transition-colors mx-auto"
                                title="View Inventory"
                              >
                                {inventoryLoading ? <Loader2 size={14} className="animate-spin" /> : <Eye size={14} />}
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>

        {renderSummaryFooter()}
      </div>

      {/* Inventory Modal */}
      {inventoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                Inventory Report
              </h2>
              <button
                onClick={() => setInventoryModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="flex-1 overflow-auto p-6">
              {inventoryData.length === 0 ? (
                <div className="text-center py-10 text-slate-500">No data available for the selected criteria.</div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(groupedInventoryData()).map(([brand, brandData]: any) => {
                    const brandKey = `brand_${brand}`;
                    const isBrandExpanded = expandedInventoryCategories[brandKey];
                    return (
                      <div key={brandKey} className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                        <div 
                          className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/80 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          onClick={() => toggleInventoryAccordion(brandKey)}
                        >
                          <div className="flex items-center gap-3">
                            <button className="text-slate-400">
                              {isBrandExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                            </button>
                            <span className="font-bold text-slate-800 dark:text-slate-200">{brand}</span>
                          </div>
                          <div className="font-bold text-slate-800 dark:text-slate-200">
                            Total: ₹{H.formatNumber(brandData.amount, precision)}
                          </div>
                        </div>
                        
                        {isBrandExpanded && (
                          <div className="p-4 space-y-3 bg-white dark:bg-slate-900">
                            {Object.entries(brandData.categories).map(([category, categoryData]: any) => {
                              const catKey = `${brandKey}_cat_${category}`;
                              const isCatExpanded = expandedInventoryCategories[catKey];
                              return (
                                <div key={catKey} className="border border-slate-100 dark:border-slate-800 rounded-lg overflow-hidden">
                                  <div 
                                    className="flex items-center justify-between p-3 bg-slate-50/50 dark:bg-slate-800/40 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                    onClick={() => toggleInventoryAccordion(catKey)}
                                  >
                                    <div className="flex items-center gap-2 pl-2">
                                      <button className="text-slate-400">
                                        {isCatExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                      </button>
                                      <span className="font-semibold text-slate-700 dark:text-slate-300 text-sm">{category}</span>
                                    </div>
                                    <div className="font-semibold text-slate-700 dark:text-slate-300 text-sm">
                                      Total: ₹{H.formatNumber(categoryData.amount, precision)}
                                    </div>
                                  </div>
                                  
                                  {isCatExpanded && (
                                    <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                                      <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
                                        <table className="w-full text-left text-sm">
                                          <thead className="bg-slate-50 dark:bg-slate-800">
                                            <tr>
                                              <th className="px-4 py-2 font-bold text-slate-600 dark:text-slate-300">Item Name</th>
                                              <th className="px-4 py-2 font-bold text-slate-600 dark:text-slate-300 text-right">Quantity</th>
                                              <th className="px-4 py-2 font-bold text-slate-600 dark:text-slate-300 text-right">Price</th>
                                              <th className="px-4 py-2 font-bold text-slate-600 dark:text-slate-300 text-right">Amount</th>
                                            </tr>
                                          </thead>
                                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                            {categoryData.items.map((item: any, idx: number) => (
                                              <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                                                <td className="px-4 py-2 font-medium text-slate-800 dark:text-slate-200">{item.Name}</td>
                                                <td className="px-4 py-2 text-right text-slate-600 dark:text-slate-400">{item.Qty}</td>
                                                <td className="px-4 py-2 text-right text-slate-600 dark:text-slate-400">₹{H.formatNumber(item.Rate, precision)}</td>
                                                <td className="px-4 py-2 text-right font-semibold text-slate-800 dark:text-slate-200">₹{H.formatNumber(item.Amount, precision)}</td>
                                              </tr>
                                            ))}
                                          </tbody>
                                        </table>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
