import React, { useState, useCallback } from "react";
import {
  Search,
  RotateCcw,
  FileSpreadsheet,
  Loader2,
  Calendar,
  Printer,
  Eye,
  Store,
} from "lucide-react";
import { reportApi } from "../../../services/report.service";
import { toast } from "../../../lib/toast";
import * as H from "../outstanding/outstandingHelpers";
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

import { InvoiceDetailsModal } from "../InvoiceDetailsModal";
import { VoucherDetailsModal } from "../../../shared/VoucherDetailsModal";

const EnInvTypeForCSReport = [
  { text: "Sales Invoice", id: 1 },
  { text: "Sale Return", id: 3 },
  { text: "Sales Quotation", id: 4 },
  { text: "Sales Order", id: 5 },
  { text: "Performa Invoice", id: 6 },
  { text: "Dispatch Note", id: 7 },
  { text: "Sales Enquiry", id: 23 },
  { text: "Dispatch Note Return", id: 30 },
  { text: "Cancel Document", id: 32 },
];

export const CounterSaleReport: React.FC = () => {
  const precision = H.getPrecision();

  const [mobile, setMobile] = useState<string | undefined>("");
  const [invType, setInvType] = useState<number>(1);

  const [lst, setLst] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [printLoading, setPrintLoading] = useState(false);

  const [totalRows, setTotalRows] = useState(0);
  const [totalTaxableValue, setTotalTaxableValue] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);

  // Modal States
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"invoice" | "voucher">("invoice");
  const [selectedInvCode, setSelectedInvCode] = useState<number>(-1);
  const [selectedInvType, setSelectedInvType] = useState<number>(-1);
  const [invoiceList, setInvoiceList] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  const getFilters = useCallback(() => {
    return {
      invType: invType,
      mobile: mobile ? mobile : null,
    };
  }, [invType, mobile]);

  const submitReport = async () => {
    if (!mobile || mobile.length < 10) {
      toast.error("Please enter a valid mobile number.");
      return;
    }

    setLoading(true);
    try {
      const data = await reportApi.counterSalesReport(getFilters());
      if (data?.length) {
        setLst(data);
        setTotalRows(data.length);
        
        let tv = 0;
        let gt = 0;
        data.forEach((r) => {
          tv += r.Item_SubTotal || 0;
          gt += r.GrandTotal || 0;
        });
        setTotalTaxableValue(tv);
        setGrandTotal(gt);
      } else {
        setLst([]);
        setTotalRows(0);
        setTotalTaxableValue(0);
        setGrandTotal(0);
        toast.info("No data found.", "Info");
      }
    } catch (err: any) {
      setLst([]);
      setTotalRows(0);
      setTotalTaxableValue(0);
      setGrandTotal(0);
      toast.error(err?.message || "Error fetching report");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setMobile("");
    setInvType(1);
    setLst([]);
    setTotalRows(0);
    setTotalTaxableValue(0);
    setGrandTotal(0);
  };

  const handleExport = async () => {
    if (!mobile || mobile.length < 10) {
      toast.error("Please enter a valid mobile number before exporting.");
      return;
    }
    setExportLoading(true);
    try {
      const blob = await reportApi.counterSalesReportExport(getFilters());
      if (blob?.size) {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "Counter_Sale_Export.xlsx";
        a.click();
        URL.revokeObjectURL(a.href);
      } else {
        toast.info("No data found to export.", "Info");
      }
    } catch (err: any) {
      toast.error(err?.message || "Export failed");
    } finally {
      setExportLoading(false);
    }
  };

  const handlePrint = async () => {
    if (!mobile || mobile.length < 10) {
      toast.error("Please enter a valid mobile number before printing.");
      return;
    }
    setPrintLoading(true);
    try {
      const filtersData = { ...getFilters(), resultType: 2 };
      // Similar to Excel, maybe the backend has an export for Print or we build a PDF from UI
      // If we don't have a print endpoint, we'll just mock it or say it's not supported
      toast.info("Print functionality requires backend API implementation.");
    } finally {
      setPrintLoading(false);
    }
  };

  const openInvDetailstPopup = (rowData: any) => {
    try {
      const isFromInvoice = rowData.fromInvoice !== undefined ? rowData.fromInvoice : true;
      const type = rowData.Inv_Type || rowData.invType || invType;
      const code = rowData.InvCode || rowData.invCode;

      const allItems = lst
        .map((x) => ({
          invCode: x.InvCode || x.invCode,
          invType: x.Inv_Type || x.invType || invType,
          fromInvoice: x.fromInvoice !== undefined ? x.fromInvoice : true,
          bill_No: x.Bill_No,
          partyName: x.PartyName,
          date: x.Date,
          amount: x.GrandTotal,
        }))
        .filter((x) => x.invCode);

      const index = allItems.findIndex((x) => x.invCode === code);

      setModalType(isFromInvoice ? "invoice" : "voucher");
      setSelectedInvCode(code);
      setSelectedInvType(type);
      setInvoiceList(allItems);
      setCurrentIndex(index);
      setModalOpen(true);
    } catch (err: any) {
      toast.error(err?.message || "Failed to load details");
    }
  };

  return (
    <div className="font-sans text-slate-700 dark:text-slate-200 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="bg-purple-100 dark:bg-purple-900/30 p-2.5 rounded-xl text-purple-600 dark:text-purple-400">
            <Store size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">
              Counter Sale Report
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              View and filter counter sales by mobile number
            </p>
          </div>
        </div>
      </div>

      {/* Filters Card */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-5 mb-5">
        <div className="flex flex-wrap items-end gap-4">
          {/* Mobile Number */}
          <div className="w-full sm:w-64 space-y-1">
            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Mobile Number <span className="text-rose-500">*</span>
            </label>
            <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 focus-within:ring-2 focus-within:ring-purple-500/20 focus-within:border-purple-500 transition-all [&_.PhoneInputInput]:bg-transparent [&_.PhoneInputInput]:border-none [&_.PhoneInputInput]:outline-none [&_.PhoneInputInput]:text-sm [&_.PhoneInputInput]:text-slate-800 dark:[&_.PhoneInputInput]:text-slate-200 [&_.PhoneInputInput]:font-semibold">
              <PhoneInput
                defaultCountry="IN"
                placeholder="e.g. 9876543210"
                value={mobile}
                onChange={setMobile}
              />
            </div>
          </div>

          {/* Type Dropdown */}
          <div className="w-full sm:w-48 space-y-1">
            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Type <span className="text-rose-500">*</span>
            </label>
            <select
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-semibold cursor-pointer"
              value={invType}
              onChange={(e) => setInvType(Number(e.target.value))}
            >
              {EnInvTypeForCSReport.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.text}
                </option>
              ))}
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pb-[2px]">
            {/* Search */}
            <button
              onClick={submitReport}
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

      {/* Results Grid */}
      {loading ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col items-center justify-center py-16">
          <Loader2 size={28} className="animate-spin text-purple-500 mb-3" />
          <span className="text-sm text-slate-500 font-medium">Loading...</span>
        </div>
      ) : !lst.length ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm text-center py-16">
          <Store size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
          <p className="text-slate-500 text-sm">
            No results found. Adjust filters and click Search.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="overflow-auto max-h-[500px]">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 z-10">
                <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase">
                    Date
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase">
                    Doc No
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase">
                    Party Name
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase">
                    RefNo
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase text-right">
                    Taxable Value
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase text-right">
                    Grand Total
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase">
                    IRN
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase text-center w-16">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {lst.map((row, ri) => (
                  <tr
                    key={ri}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="px-4 py-2 text-xs text-slate-500 whitespace-nowrap">
                      {H.formatDateShort(row.Date)}
                    </td>
                    <td className="px-4 py-2 text-xs font-semibold text-purple-600 dark:text-purple-400 whitespace-nowrap">
                      {row.Bill_No}
                    </td>
                    <td className="px-4 py-2 text-xs text-slate-700 dark:text-slate-300">
                      {row.partyHasGST !== false ? (
                        row.PartyName
                      ) : (
                        <span>
                          {row.PartyName}{" "}
                          <span className="text-red-500 ml-1 text-[10px] font-semibold tracking-tight">
                            (GST not updated)
                          </span>
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-xs text-slate-500 whitespace-nowrap">
                      {row.RefNo}
                    </td>
                    <td className="px-4 py-2 text-xs font-mono font-medium text-right whitespace-nowrap text-slate-700 dark:text-slate-300">
                      {H.formatNumber(row.Item_SubTotal, precision)}
                    </td>
                    <td className="px-4 py-2 text-xs font-mono font-bold text-right whitespace-nowrap text-slate-900 dark:text-white">
                      {H.formatNumber(row.GrandTotal, precision)}
                    </td>
                    <td className="px-4 py-2 text-xs text-slate-500 whitespace-nowrap">
                      {row.IRN || "-"}
                    </td>
                    <td className="px-4 py-2 text-center">
                      {(row.InvCode || row.invCode) && (
                        <button
                          onClick={() => openInvDetailstPopup(row)}
                          className="p-1.5 text-purple-500 hover:text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-md transition-colors"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sticky Summary Footer */}
      {lst.length > 0 && (
        <div className="sticky bottom-0 z-10 bg-brand-yellow dark:bg-brand-yellow/10 rounded-xl border border-brand-yellow/20 dark:border-brand-yellow/5 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] p-4 select-none mt-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <span className="text-xs font-bold text-slate-800 dark:text-brand-yellow/90 uppercase">
                Total Rows :{" "}
                <span className="text-slate-950 dark:text-brand-yellow font-extrabold">
                  {totalRows}
                </span>
              </span>
              <span className="text-xs font-bold text-slate-800 dark:text-brand-yellow/90 uppercase">
                Filtered Rows :{" "}
                <span className="text-slate-950 dark:text-brand-yellow font-extrabold">
                  {totalRows}
                </span>
              </span>
            </div>

            <div className="flex items-center gap-8">
              <div className="text-right">
                <span className="text-[10px] text-slate-800/80 dark:text-brand-yellow/70 font-bold uppercase block">
                  Total Taxable Value
                </span>
                <span className="text-sm font-bold text-slate-800 dark:text-brand-yellow/80 font-mono">
                  {H.formatNumber(totalTaxableValue, precision)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-800/80 dark:text-brand-yellow/70 font-bold uppercase block">
                  Grand Total
                </span>
                <span className="text-base font-black text-slate-950 dark:text-brand-yellow font-mono">
                  ₹{H.formatNumber(grandTotal, precision)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Details Modal */}
      {modalOpen && modalType === "invoice" && (
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
      {modalOpen && modalType === "voucher" && (
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
