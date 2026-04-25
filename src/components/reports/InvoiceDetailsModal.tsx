import React, { useState, useEffect, useCallback } from "react";
import {
  X,
  Pencil,
  Printer,
  ChevronLeft,
  ChevronRight,
  Loader2,
  FileSpreadsheet,
  ClipboardList,
  Package,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { invoiceApi } from "../../services/invoice.service";
import { INVOICE_VOUCHER_TYPES_BY_ID } from "../../lib/constants";

interface InvoiceDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  invCode: number | string;
  invType: number;
  invoiceList?: any[];
  currentIndex?: number;
}

export const InvoiceDetailsModal: React.FC<InvoiceDetailsModalProps> = ({
  isOpen,
  onClose,
  invCode,
  invType,
  invoiceList = [],
  currentIndex: initialIndex = 0,
}) => {
  const [loading, setLoading] = useState(false);
  const [printLoading, setPrintLoading] = useState(false);
  const [record, setRecord] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [extraCharges, setExtraCharges] = useState<any[]>([]);
  const [index, setIndex] = useState(initialIndex);
  const [setupInfo, setSetupInfo] = useState<any>(null);

  const invTypeText = INVOICE_VOUCHER_TYPES_BY_ID[String(invType)] || "Invoice";

  // ─── Fetch invoice data ────────────────────────────────────────────────
  const fetchInvoice = useCallback(
    async (id: number | string, type: number) => {
      setLoading(true);
      try {
        // Get setup info
        const setup = await invoiceApi.setupInfo({
          invtype: type,
          fromInvoice: true,
        });
        setSetupInfo(setup);

        // Get invoice details — Angular uses /api/Invoice/GetById
        const data = await invoiceApi.getById({ id, invType: type });

        // Resolve ledger data via API — Angular: LedgerServiceService.Get → /api/Ledger/GetById
        if (data.ledger_ID) {
          try {
            const { apiClient } = await import('../../lib/api-client');
            const ledgerData = await apiClient.post('/api/Ledger/GetById', { id: data.ledger_ID });
            if (ledgerData) data.ledgerData = ledgerData;
          } catch (err) {
            console.warn('Ledger API failed, trying localStorage:', err);
            try {
              const ledgers = JSON.parse(localStorage.getItem('ledger-list') || '[]');
              if (Array.isArray(ledgers) && ledgers.length) {
                data.ledgerData = ledgers.find((l: any) => l.id == data.ledger_ID) || {};
              }
            } catch { /* ignore */ }
          }
        }
        if (!data.ledgerData) data.ledgerData = {};

        // Resolve sales person — Angular: commonService.dropdown({table: 5}) for salesman
        if (data.salesByUserID) {
          try {
            const { commonApi } = await import('../../lib/api-client');
            const salesmen = await commonApi.dropdown({ table: 5 });
            const sp = salesmen?.find((s: any) => s.id == data.salesByUserID);
            if (sp) data.salesPerson = sp.name;
          } catch {}
        }

        // Resolve prepared by — Angular: userService.Search then match loginByUserID
        if (data.loginByUserID) {
          try {
            const { apiClient } = await import('../../lib/api-client');
            const userRes = await apiClient.post('/api/User/Search', {});
            const user = userRes?.list?.find((u: any) => u.user_ID == data.loginByUserID);
            if (user) data.preparedBy = `${user.first_Name || ''} ${user.lastname || ''}`.trim();
          } catch {}
        }

        // Resolve project site name — Angular: commonService.dropdown({table: 13})
        if (data.projectSiteId && !data.projectSiteName) {
          try {
            const { commonApi } = await import('../../lib/api-client');
            const sites = await commonApi.dropdown({ table: 13 });
            const site = sites?.find((p: any) => p.id == data.projectSiteId);
            if (site) {
              data.projectSiteName = site.name;
              data.projectSiteAddress = site.address || '';
            }
          } catch {}
        }

        setRecord(data);

        // Process items
        if (data.invoiceItemDetail?.length) {
          const processedItems = data.invoiceItemDetail.map(
            (item: any, i: number) => ({
              sno: i + 1,
              particular: item.particular || "",
              hsn: item.hsn || "",
              sp_text: item.sp_text || "",
              qty: item.std_Qty || 0,
              unit: item.unitConsumed || "",
              rate: item.std_Rate || 0,
              priceCategory: item.priceCategoryText || "None",
              discount: item.discount1 || 0,
              gstPer: item.vatPer || 0,
              gstAmt:
                (item.sgstAmt || 0) + (item.cgstAmt || 0) + (item.igstAmt || 0),
              amount: item.amount || 0,
              description: item.itemDescription || "",
            }),
          );
          setItems(processedItems);
        } else {
          setItems([]);
        }

        // Process extra charges
        if (data.invoiceExtraCharges?.length && setup?.extraCharges?.length) {
          const charges = setup.extraCharges
            .map((ec: any) => {
              const saved = data.invoiceExtraCharges.find(
                (x: any) => x.extra_Charge_ID === ec.extraCharges_ID,
              );
              return saved
                ? {
                    name: ec.name,
                    perVal: ec.fixedPercent || 0,
                    amount: saved.amount || 0,
                    hidden: !saved.amount,
                  }
                : null;
            })
            .filter((c: any) => c && !c.hidden);
          setExtraCharges(charges);
        } else {
          setExtraCharges([]);
        }
      } catch (err) {
        console.error("Failed to load invoice:", err);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (isOpen && invCode) {
      fetchInvoice(invCode, invType);
    }
  }, [isOpen, invCode, invType, fetchInvoice]);

  // ─── Navigation ────────────────────────────────────────────────────────
  const canPrev = invoiceList.length > 1 && index > 0;
  const canNext = invoiceList.length > 1 && index < invoiceList.length - 1;

  const navigate = (dir: "prev" | "next") => {
    const newIdx = dir === "prev" ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= invoiceList.length) return;
    setIndex(newIdx);
    const item = invoiceList[newIdx];
    fetchInvoice(
      item.invCode || item.Invcode,
      item.invType || item.TypeId || invType,
    );
  };

  // ─── Totals ────────────────────────────────────────────────────────────
  const totalQty = items.reduce((s, i) => s + (i.qty || 0), 0);
  const netTotal = record?.item_SubTotal || 0;
  const totalGst = items.reduce((s, i) => s + (i.gstAmt || 0), 0);
  const grossTotal = record?.grandTotal || netTotal + totalGst;

  // ─── Print ─────────────────────────────────────────────────────────────
  const handlePrint = () => {
    window.print();
  };

  const formatDate = (val: string) => {
    if (!val) return "";
    try {
      return new Date(val).toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      });
    } catch {
      return val;
    }
  };

  const fmt = (n: any) => {
    const v = parseFloat(n);
    return isNaN(v)
      ? "0.00"
      : "₹" +
          v.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        {/* Navigation Arrows */}
        {canPrev && (
          <button
            onClick={() => navigate("prev")}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-[110] w-10 h-10 bg-white dark:bg-slate-800 rounded-full shadow-xl flex items-center justify-center hover:bg-blue-50 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700"
          >
            <ChevronLeft
              size={20}
              className="text-slate-600 dark:text-slate-300"
            />
          </button>
        )}
        {canNext && (
          <button
            onClick={() => navigate("next")}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-[110] w-10 h-10 bg-white dark:bg-slate-800 rounded-full shadow-xl flex items-center justify-center hover:bg-blue-50 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700"
          >
            <ChevronRight
              size={20}
              className="text-slate-600 dark:text-slate-300"
            />
          </button>
        )}

        {/* Counter Badge */}
        {invoiceList.length > 1 && (
          <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[110] px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full shadow-lg">
            {index + 1} / {invoiceList.length}
          </div>
        )}

        {/* Modal Content */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border border-slate-200 dark:border-slate-700"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
              {invTypeText}
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="p-2 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 rounded-lg transition-colors text-blue-700 dark:text-blue-300"
                title="Print"
              >
                <Printer size={16} />
              </button>
              <button
                onClick={onClose}
                className="p-2 bg-rose-100 dark:bg-rose-900/30 hover:bg-rose-200 rounded-lg transition-colors text-rose-600 dark:text-rose-400"
                title="Close"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Loader2 size={32} className="animate-spin text-blue-600" />
                <span className="text-sm text-slate-500 font-medium">
                  Loading invoice details...
                </span>
              </div>
            ) : record ? (
              <>
                {/* Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  {/* Left: Party Info */}
                  <div className="space-y-1 text-sm">
                    <p className="font-bold text-slate-800 dark:text-slate-100">
                      {record.ledgerData?.name || record.partyName || "—"}
                    </p>
                    {record.ledgerData?.address && (
                      <p className="text-slate-500">
                        {record.ledgerData.address}
                      </p>
                    )}
                    {record.ledgerData?.city && (
                      <p className="text-slate-500">
                        {record.ledgerData.city}
                        {record.ledgerData?.state
                          ? `, ${record.ledgerData.state}`
                          : ""}{" "}
                        {record.ledgerData?.pinCode || ""}
                      </p>
                    )}
                    {record.ledgerData?.mobile && (
                      <p className="text-slate-600 dark:text-slate-400">
                        <span className="font-semibold">Phone No.:</span>{" "}
                        {record.ledgerData.mobile}
                      </p>
                    )}
                    {record.ledgerData?.gstNo && (
                      <p className="text-slate-600 dark:text-slate-400">
                        <span className="font-semibold">GSTIN:</span>{" "}
                        {record.ledgerData.gstNo}
                      </p>
                    )}
                    {record.projectSiteName && (
                      <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                        <p className="text-slate-500">
                          <span className="font-semibold text-slate-600 dark:text-slate-400">
                            Project Site:
                          </span>{" "}
                          <span className="text-blue-600">
                            {record.projectSiteName}
                          </span>
                        </p>
                        {record.projectSiteAddress && (
                          <p className="text-slate-500 mt-1 whitespace-pre-line text-xs">
                            {record.projectSiteAddress}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Middle: Doc Info */}
                  <div className="space-y-1 text-sm">
                    <p className="text-slate-600 dark:text-slate-400">
                      <span className="font-semibold">Doc No:</span>{" "}
                      {record.bill_No}
                    </p>
                    <p className="text-slate-600 dark:text-slate-400">
                      <span className="font-semibold">Date:</span>{" "}
                      {formatDate(record.date)}
                    </p>
                    {record.orderNo && (
                      <p className="text-slate-600 dark:text-slate-400">
                        <span className="font-semibold">PO No.:</span>{" "}
                        {record.orderNo}
                      </p>
                    )}
                    {record.salesPerson && (
                      <p className="text-slate-600 dark:text-slate-400">
                        <span className="font-semibold">Sales Person:</span>{" "}
                        {record.salesPerson}
                      </p>
                    )}
                  </div>

                  {/* Right: Ref Info */}
                  <div className="space-y-1 text-sm">
                    <p className="text-slate-600 dark:text-slate-400">
                      <span className="font-semibold">Credit Days:</span>{" "}
                      {record.dueDays || 0}
                    </p>
                    {record.refNo && (
                      <p className="text-slate-600 dark:text-slate-400">
                        <span className="font-semibold">Ref No:</span>{" "}
                        {record.refNo}
                      </p>
                    )}
                    {record.refDate && (
                      <p className="text-slate-600 dark:text-slate-400">
                        <span className="font-semibold">Ref Date:</span>{" "}
                        {record.refDate}
                      </p>
                    )}
                    {record.shipToAddress && (
                      <p className="text-slate-600 dark:text-slate-400">
                        <span className="font-semibold">Supply To:</span>{" "}
                        {record.shipToAddress}
                      </p>
                    )}
                  </div>
                </div>

                {/* Items Table */}
                <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden mb-4">
                  <div className="overflow-x-auto max-h-[200px]">
                    <table className="w-full text-left border-collapse text-sm">
                      <thead className="sticky top-0 z-10">
                        <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                          <th className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 w-8">
                            #
                          </th>
                          <th className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                            Particular
                          </th>
                          <th className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                            HSN
                          </th>
                          <th className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                            SP
                          </th>
                          <th className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 text-right">
                            Qty
                          </th>
                          <th className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                            Unit
                          </th>
                          <th className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 text-right">
                            Rate
                          </th>
                          <th className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                            Categ...
                          </th>
                          <th className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 text-right">
                            D...
                          </th>
                          <th className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 text-right">
                            GST%
                          </th>
                          <th className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 text-right">
                            GST
                          </th>
                          <th className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 text-right">
                            Amount
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {items.map((item, i) => (
                          <tr
                            key={i}
                            className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors"
                          >
                            <td className="px-3 py-2 text-slate-500">
                              {item.sno}
                            </td>
                            <td className="px-3 py-2 text-slate-700 dark:text-slate-300 font-medium max-w-[200px] truncate">
                              {item.particular}
                            </td>
                            <td className="px-3 py-2 text-slate-500">
                              {item.hsn}
                            </td>
                            <td className="px-3 py-2 text-slate-500">
                              {item.sp_text}
                            </td>
                            <td className="px-3 py-2 text-right font-medium text-slate-700 dark:text-slate-300">
                              {item.qty}
                            </td>
                            <td className="px-3 py-2 text-slate-500">
                              {item.unit}
                            </td>
                            <td className="px-3 py-2 text-right text-slate-700 dark:text-slate-300">
                              {fmt(item.rate)}
                            </td>
                            <td className="px-3 py-2 text-slate-500">
                              {item.priceCategory}
                            </td>
                            <td className="px-3 py-2 text-right text-slate-500">
                              {item.discount}
                            </td>
                            <td className="px-3 py-2 text-right text-slate-500">
                              {fmt(item.gstPer)}
                            </td>
                            <td className="px-3 py-2 text-right text-slate-500">
                              {fmt(item.gstAmt)}
                            </td>
                            <td className="px-3 py-2 text-right font-bold text-slate-800 dark:text-slate-100">
                              {fmt(item.amount)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Totals Bar */}
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-3 mb-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm font-semibold">
                    <div className="text-slate-600 dark:text-slate-400">
                      Total Qty:{" "}
                      <span className="text-slate-800 dark:text-slate-100">
                        {totalQty}
                      </span>
                    </div>
                    <div className="text-slate-600 dark:text-slate-400">
                      Net Total:{" "}
                      <span className="text-slate-800 dark:text-slate-100">
                        {fmt(netTotal)}
                      </span>
                    </div>
                    <div className="text-slate-600 dark:text-slate-400">
                      Total GST:{" "}
                      <span className="text-slate-800 dark:text-slate-100">
                        {fmt(totalGst)}
                      </span>
                    </div>
                    <div className="text-slate-600 dark:text-slate-400">
                      Gross Total:{" "}
                      <span className="text-emerald-600 dark:text-emerald-400 text-base">
                        {fmt(grossTotal)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer: Actions + Notes + Extra Charges */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left: Notes */}
                  <div className="space-y-2 text-sm">
                    {record.note && (
                      <p className="text-slate-600 dark:text-slate-400">
                        <span className="font-bold uppercase text-slate-700 dark:text-slate-300">
                          Note:
                        </span>{" "}
                        {record.note}
                      </p>
                    )}
                    {record.ewayNote && (
                      <p className="text-slate-600 dark:text-slate-400">
                        <span className="font-bold uppercase text-slate-700 dark:text-slate-300">
                          Eway Note:
                        </span>{" "}
                        {record.ewayNote}
                      </p>
                    )}
                    {record.preparedBy && (
                      <span className="inline-block px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded text-xs font-semibold">
                        Prepared By: {record.preparedBy}
                      </span>
                    )}
                  </div>

                  {/* Right: Sub Total + Extra Charges + Grand Total */}
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="font-bold text-slate-600 dark:text-slate-400">
                        Sub Total:
                      </span>
                      <span className="text-slate-800 dark:text-slate-100">
                        {fmt(record.item_SubTotal)}
                      </span>
                    </div>
                    {extraCharges.map((ec, i) => (
                      <div
                        key={i}
                        className="flex justify-between text-slate-500"
                      >
                        <span>
                          {ec.name} {ec.perVal ? `(${ec.perVal}%)` : ""}
                        </span>
                        <span>{fmt(ec.amount)}</span>
                      </div>
                    ))}
                    {record.roundOff != null && record.roundOff !== 0 && (
                      <div className="flex justify-between">
                        <span className="font-bold text-slate-600 dark:text-slate-400">
                          Round Off:
                        </span>
                        <span>{fmt(record.roundOff)}</span>
                      </div>
                    )}
                    <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
                      <span className="font-bold text-slate-800 dark:text-slate-100">
                        Grand Total:
                      </span>
                      <span className="font-bold text-lg text-emerald-600 dark:text-emerald-400">
                        {fmt(record.grandTotal)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-center gap-3 mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <button
                    onClick={() => {
                      /* Export handled by parent */
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold rounded-lg transition-all shadow-lg shadow-emerald-500/20"
                  >
                    <FileSpreadsheet size={14} /> Export
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-all shadow-lg shadow-blue-600/20">
                    <Package size={14} /> Check Stock
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white text-sm font-semibold rounded-lg transition-all shadow-lg shadow-rose-500/20">
                    <ClipboardList size={14} /> Check Pending
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-16 text-sm text-slate-400">
                No invoice data available
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
