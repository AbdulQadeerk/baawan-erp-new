import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  RotateCcw,
  FileSpreadsheet,
  Printer,
  Loader2,
  Calendar,
  ShieldAlert,
  Eye,
  X,
  Download,
} from "lucide-react";
import { reportApi } from "../../../services/report.service";
import { toast } from "../../../lib/toast";
import { DateRangePicker } from "../../DateRangePicker";
import * as H from "../outstanding/outstandingHelpers";
import * as XLSX from "xlsx";

const EnGSTR3B2Details = [
  { text: "Local Sales Taxable", id: 1 },
  { text: "Local Sales Non Taxable", id: 2 },
  { text: "Inter State Sales Taxable", id: 3 },
  { text: "Inter State Sales Non Taxable", id: 4 },
  { text: "Manual Sales", id: 5 },
  { text: "Manual Sales Return", id: 6 },
  { text: "Local Purchase Taxable", id: 7 },
  { text: "Local Purchase Non Taxable", id: 8 },
  { text: "Inter State Purchase Taxable", id: 9 },
  { text: "Inter State Purchase Non Taxable", id: 10 },
  { text: "Manual Purchase", id: 11 },
  { text: "Manual Purchase Return", id: 12 },
];

interface TabItem {
  id: number;
  text: string;
}

const emptyParticular = { TaxableValue: 0, IGST: 0, CGST: 0, SGST: 0, TotalValue: 0 };

export const Gstr3bReport: React.FC = () => {
  const precision = H.getPrecision();

  const getFirstDayOfPrevMonth = () => {
    const d = new Date();
    const prev = new Date(d.getFullYear(), d.getMonth() - 1, 1);
    return prev.toISOString().split("T")[0];
  };

  const getLastDayOfPrevMonth = () => {
    const d = new Date();
    const prev = new Date(d.getFullYear(), d.getMonth(), 0);
    return prev.toISOString().split("T")[0];
  };

  const [fromDate, setFromDate] = useState<string>(getFirstDayOfPrevMonth());
  const [toDate, setToDate] = useState<string>(getLastDayOfPrevMonth());
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [printLoading, setPrintLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Tab states
  const [tabs, setTabs] = useState<TabItem[]>([{ id: 1, text: "GSTR3B" }]);
  const [activeTab, setActiveTab] = useState<number>(1);
  const [tabCounter, setTabCounter] = useState<number>(2);

  // GSTR3B Summary States
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [localSalesTaxable, setLocalSalesTaxable] = useState(emptyParticular);
  const [localSalesNonTaxable, setLocalSalesNonTaxable] = useState(emptyParticular);
  const [totalLocalSales, setTotalLocalSales] = useState(emptyParticular);

  const [interStateSalesTaxable, setInterStateSalesTaxable] = useState(emptyParticular);
  const [interStateSalesNonTaxable, setInterStateSalesNonTaxable] = useState(emptyParticular);
  const [totalInterStateSales, setTotalInterStateSales] = useState(emptyParticular);

  const [manualSales, setManualSales] = useState(emptyParticular);
  const [manualSalesReturn, setManualSalesReturn] = useState(emptyParticular);
  const [totalOutwards, setTotalOutwards] = useState(emptyParticular);

  const [localPurchaseTaxable, setLocalPurchaseTaxable] = useState(emptyParticular);
  const [localPurchaseNonTaxable, setLocalPurchaseNonTaxable] = useState(emptyParticular);
  const [totalLocalPurchase, setTotalLocalPurchase] = useState(emptyParticular);

  const [interStatePurchaseTaxable, setInterStatePurchaseTaxable] = useState(emptyParticular);
  const [interStatePurchaseNonTaxable, setInterStatePurchaseNonTaxable] = useState(emptyParticular);
  const [totalInterStatePurchase, setTotalInterStatePurchase] = useState(emptyParticular);

  const [manualPurchase, setManualPurchase] = useState(emptyParticular);
  const [manualPurchaseReturn, setManualPurchaseReturn] = useState(emptyParticular);
  const [totalInwards, setTotalInwards] = useState(emptyParticular);

  const [totalPayable, setTotalPayable] = useState(0);

  const formatDateForApi = (dateStr: string, time: string) => {
    if (!dateStr) return "";
    const [y, m, d] = dateStr.split("-");
    return `${d}/${m}/${y} ${time}`;
  };

  const getFilters = () => {
    return {
      dateFrom: formatDateForApi(fromDate, "00:00:00"),
      dateTo: formatDateForApi(toDate, "23:59:59"),
      resultType: 1,
    };
  };

  const submitSearch = useCallback(async () => {
    if (new Date(fromDate) > new Date(toDate)) {
      toast.info("From Date cannot be greater than To Date.", "Validation Error");
      return;
    }

    setLoading(true);
    setIsDataLoaded(false);
    try {
      const fdata = { ...getFilters(), reportType: 5 };
      const data = await reportApi.gstrReport(fdata);

      const lstaxable = data.find((x: any) => x.Particular === "LocalSalesTaxable") || emptyParticular;
      const lsTaxVal = {
        ...lstaxable,
        TotalValue: (lstaxable.IGST || 0) + (lstaxable.CGST || 0) + (lstaxable.SGST || 0),
      };
      setLocalSalesTaxable(lsTaxVal);

      const lsNonTax = data.find((x: any) => x.Particular === "LocalSalesNonTaxable") || emptyParticular;
      const lsNonTaxVal = {
        ...lsNonTax,
        TotalValue: (lsNonTax.IGST || 0) + (lsNonTax.CGST || 0) + (lsNonTax.SGST || 0),
      };
      setLocalSalesNonTaxable(lsNonTaxVal);

      const totLS = {
        TaxableValue: (lsTaxVal.TaxableValue || 0) + (lsNonTaxVal.TaxableValue || 0),
        IGST: (lsTaxVal.IGST || 0) + (lsNonTaxVal.IGST || 0),
        CGST: (lsTaxVal.CGST || 0) + (lsNonTaxVal.CGST || 0),
        SGST: (lsTaxVal.SGST || 0) + (lsNonTaxVal.SGST || 0),
        TotalValue: (lsTaxVal.TotalValue || 0) + (lsNonTaxVal.TotalValue || 0),
      };
      setTotalLocalSales(totLS);

      const istaxable = data.find((x: any) => x.Particular === "InterStateSalesTaxable") || emptyParticular;
      const isTaxVal = {
        ...istaxable,
        TotalValue: (istaxable.IGST || 0) + (istaxable.CGST || 0) + (istaxable.SGST || 0),
      };
      setInterStateSalesTaxable(isTaxVal);

      const isNonTax = data.find((x: any) => x.Particular === "InterStateSalesNonTaxable") || emptyParticular;
      const isNonTaxVal = {
        ...isNonTax,
        TotalValue: (isNonTax.IGST || 0) + (isNonTax.CGST || 0) + (isNonTax.SGST || 0),
      };
      setInterStateSalesNonTaxable(isNonTaxVal);

      const totIS = {
        TaxableValue: (isTaxVal.TaxableValue || 0) + (isNonTaxVal.TaxableValue || 0),
        IGST: (isTaxVal.IGST || 0) + (isNonTaxVal.IGST || 0),
        CGST: (isTaxVal.CGST || 0) + (isNonTaxVal.CGST || 0),
        SGST: (isTaxVal.SGST || 0) + (isNonTaxVal.SGST || 0),
        TotalValue: (isTaxVal.TotalValue || 0) + (isNonTaxVal.TotalValue || 0),
      };
      setTotalInterStateSales(totIS);

      const ms = data.find((x: any) => x.Particular === "ManualSales") || emptyParticular;
      const msVal = {
        ...ms,
        TotalValue: (ms.IGST || 0) + (ms.CGST || 0) + (ms.SGST || 0),
      };
      setManualSales(msVal);

      const msr = data.find((x: any) => x.Particular === "ManualSalesReturn") || emptyParticular;
      const msrVal = {
        ...msr,
        TaxableValue: -1 * (msr.TaxableValue || 0),
        IGST: -1 * (msr.IGST || 0),
        CGST: -1 * (msr.CGST || 0),
        SGST: -1 * (msr.SGST || 0),
        TotalValue: (msr.IGST || 0) + (msr.CGST || 0) + (msr.SGST || 0),
      };
      setManualSalesReturn(msrVal);

      const totOut = {
        TaxableValue: (msVal.TaxableValue || 0) + (msrVal.TaxableValue || 0) + totLS.TaxableValue + totIS.TaxableValue,
        IGST: (msVal.IGST || 0) + (msrVal.IGST || 0) + totLS.IGST + totIS.IGST,
        CGST: (msVal.CGST || 0) + (msrVal.CGST || 0) + totLS.CGST + totIS.CGST,
        SGST: (msVal.SGST || 0) + (msrVal.SGST || 0) + totLS.SGST + totIS.SGST,
        TotalValue: (msVal.TotalValue || 0) + (msrVal.TotalValue || 0) + totLS.TotalValue + totIS.TotalValue,
      };
      setTotalOutwards(totOut);

      const lptaxable = data.find((x: any) => x.Particular === "LocalPurchaseTaxable") || emptyParticular;
      const lpTaxVal = {
        ...lptaxable,
        TotalValue: (lptaxable.IGST || 0) + (lptaxable.CGST || 0) + (lptaxable.SGST || 0),
      };
      setLocalPurchaseTaxable(lpTaxVal);

      const lpNonTax = data.find((x: any) => x.Particular === "LocalPurchaseNonTaxable") || emptyParticular;
      const lpNonTaxVal = {
        ...lpNonTax,
        TotalValue: (lpNonTax.IGST || 0) + (lpNonTax.CGST || 0) + (lpNonTax.SGST || 0),
      };
      setLocalPurchaseNonTaxable(lpNonTaxVal);

      const totLP = {
        TaxableValue: (lpTaxVal.TaxableValue || 0) + (lpNonTaxVal.TaxableValue || 0),
        IGST: (lpTaxVal.IGST || 0) + (lpNonTaxVal.IGST || 0),
        CGST: (lpTaxVal.CGST || 0) + (lpNonTaxVal.CGST || 0),
        SGST: (lpTaxVal.SGST || 0) + (lpNonTaxVal.SGST || 0),
        TotalValue: (lpTaxVal.TotalValue || 0) + (lpNonTaxVal.TotalValue || 0),
      };
      setTotalLocalPurchase(totLP);

      const iptaxable = data.find((x: any) => x.Particular === "InterStatePurchaseTaxable") || emptyParticular;
      const ipTaxVal = {
        ...iptaxable,
        TotalValue: (iptaxable.IGST || 0) + (iptaxable.CGST || 0) + (iptaxable.SGST || 0),
      };
      setInterStatePurchaseTaxable(ipTaxVal);

      const ipNonTax = data.find((x: any) => x.Particular === "InterStatePurchaseNonTaxable") || emptyParticular;
      const ipNonTaxVal = {
        ...ipNonTax,
        TotalValue: (ipNonTax.IGST || 0) + (ipNonTax.CGST || 0) + (ipNonTax.SGST || 0),
      };
      setInterStatePurchaseNonTaxable(ipNonTaxVal);

      const totIP = {
        TaxableValue: (ipTaxVal.TaxableValue || 0) + (ipNonTaxVal.TaxableValue || 0),
        IGST: (ipTaxVal.IGST || 0) + (ipNonTaxVal.IGST || 0),
        CGST: (ipTaxVal.CGST || 0) + (ipNonTaxVal.CGST || 0),
        SGST: (ipTaxVal.SGST || 0) + (ipNonTaxVal.SGST || 0),
        TotalValue: (ipTaxVal.TotalValue || 0) + (ipNonTaxVal.TotalValue || 0),
      };
      setTotalInterStatePurchase(totIP);

      const mp = data.find((x: any) => x.Particular === "ManualPurchase") || emptyParticular;
      const mpVal = {
        ...mp,
        TotalValue: (mp.IGST || 0) + (mp.CGST || 0) + (mp.SGST || 0),
      };
      setManualPurchase(mpVal);

      const mpr = data.find((x: any) => x.Particular === "ManualPurchaseReturn") || emptyParticular;
      const mprVal = {
        ...mpr,
        TaxableValue: -1 * (mpr.TaxableValue || 0),
        IGST: -1 * (mpr.IGST || 0),
        CGST: -1 * (mpr.CGST || 0),
        SGST: -1 * (mpr.SGST || 0),
        TotalValue: (mpr.IGST || 0) + (mpr.CGST || 0) + (mpr.SGST || 0),
      };
      setManualPurchaseReturn(mprVal);

      const totIn = {
        TaxableValue: (mpVal.TaxableValue || 0) + (mprVal.TaxableValue || 0) + totLP.TaxableValue + totIP.TaxableValue,
        IGST: (mpVal.IGST || 0) + (mprVal.IGST || 0) + totLP.IGST + totIP.IGST,
        CGST: (mpVal.CGST || 0) + (mprVal.CGST || 0) + totLP.CGST + totIP.CGST,
        SGST: (mpVal.SGST || 0) + (mprVal.SGST || 0) + totLP.SGST + totIP.SGST,
        TotalValue: (mpVal.TotalValue || 0) + (mprVal.TotalValue || 0) + totLP.TotalValue + totIP.TotalValue,
      };
      setTotalInwards(totIn);

      setTotalPayable(totOut.TotalValue - totIn.TotalValue);
      setIsDataLoaded(true);
    } catch (err: any) {
      toast.info(err?.message || "Failed to load report", "Error");
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate]);

  // Submit search on mount
  useEffect(() => {
    submitSearch();
  }, []);

  const handleClear = () => {
    setIsDataLoaded(false);
    setLocalSalesTaxable(emptyParticular);
    setLocalSalesNonTaxable(emptyParticular);
    setTotalLocalSales(emptyParticular);
    setInterStateSalesTaxable(emptyParticular);
    setInterStateSalesNonTaxable(emptyParticular);
    setTotalInterStateSales(emptyParticular);
    setManualSales(emptyParticular);
    setManualSalesReturn(emptyParticular);
    setTotalOutwards(emptyParticular);
    setLocalPurchaseTaxable(emptyParticular);
    setLocalPurchaseNonTaxable(emptyParticular);
    setTotalLocalPurchase(emptyParticular);
    setInterStatePurchaseTaxable(emptyParticular);
    setInterStatePurchaseNonTaxable(emptyParticular);
    setTotalInterStatePurchase(emptyParticular);
    setManualPurchase(emptyParticular);
    setManualPurchaseReturn(emptyParticular);
    setTotalInwards(emptyParticular);
    setTotalPayable(0);
    setFromDate(getFirstDayOfPrevMonth());
    setToDate(getLastDayOfPrevMonth());
    setTabs([{ id: 1, text: "GSTR3B" }]);
    setActiveTab(1);
  };

  const handleExportSummary = () => {
    const element = document.getElementById("gstr3b-summary-table");
    if (!element) {
      toast.info("No table found to export.", "Info");
      return;
    }
    const ws = XLSX.utils.table_to_sheet(element);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, "gstr3b2.xlsx");
  };

  // Landscape PDF printing of summary
  const handlePrintSummary = async () => {
    setPrintLoading(true);
    try {
      const pdfMake = (await import("pdfmake/build/pdfmake")).default;
      const pdfFonts = (await import("pdfmake/build/vfs_fonts")).default;
      (pdfMake as any).vfs = pdfFonts?.pdfMake?.vfs || pdfFonts;

      const docDef: any = {
        pageOrientation: "landscape",
        pageSize: "A4",
        content: [
          {
            text: `Printed on: ${new Date().toLocaleDateString("en-GB")} ${new Date().toLocaleTimeString("en-GB")}`,
            alignment: "right",
            fontSize: 8,
            color: "#64748b",
            margin: [0, 0, 0, 5],
          },
          {
            text: "GSTR3B Report Summary",
            style: "header",
            margin: [0, 0, 0, 10],
          },
          {
            text: `Period: ${H.formatDisplayDate(fromDate)} to ${H.formatDisplayDate(toDate)}`,
            fontSize: 9,
            bold: true,
            margin: [0, 0, 0, 10],
          },
          {
            table: {
              headerRows: 1,
              widths: ["*", "auto", "auto", "auto", "auto", "auto"],
              body: [
                [
                  { text: "Particulars", style: "tableHeader" },
                  { text: "Taxable Value", style: "tableHeader", alignment: "right" },
                  { text: "Integrated Tax Amount (IGST)", style: "tableHeader", alignment: "right" },
                  { text: "Central Tax Amount (CGST)", style: "tableHeader", alignment: "right" },
                  { text: "State Tax Amount (SGST)", style: "tableHeader", alignment: "right" },
                  { text: "Total Tax Amount", style: "tableHeader", alignment: "right" },
                ],
                // Outward Supplies header
                [{ text: "Outward Supplies", colSpan: 6, bold: true, fillColor: "#f8fafc", alignment: "center" }, "", "", "", "", ""],
                [
                  "Local Sales",
                  H.formatNumber(totalLocalSales.TaxableValue, precision),
                  H.formatNumber(totalLocalSales.IGST, precision),
                  H.formatNumber(totalLocalSales.CGST, precision),
                  H.formatNumber(totalLocalSales.SGST, precision),
                  H.formatNumber(totalLocalSales.TotalValue, precision),
                ],
                [
                  "  Taxable",
                  H.formatNumber(localSalesTaxable.TaxableValue, precision),
                  H.formatNumber(localSalesTaxable.IGST, precision),
                  H.formatNumber(localSalesTaxable.CGST, precision),
                  H.formatNumber(localSalesTaxable.SGST, precision),
                  H.formatNumber(localSalesTaxable.TotalValue, precision),
                ],
                [
                  "  Non Taxable",
                  H.formatNumber(localSalesNonTaxable.TaxableValue, precision),
                  H.formatNumber(localSalesNonTaxable.IGST, precision),
                  H.formatNumber(localSalesNonTaxable.CGST, precision),
                  H.formatNumber(localSalesNonTaxable.SGST, precision),
                  H.formatNumber(localSalesNonTaxable.TotalValue, precision),
                ],
                [
                  "Inter State Sales",
                  H.formatNumber(totalInterStateSales.TaxableValue, precision),
                  H.formatNumber(totalInterStateSales.IGST, precision),
                  H.formatNumber(totalInterStateSales.CGST, precision),
                  H.formatNumber(totalInterStateSales.SGST, precision),
                  H.formatNumber(totalInterStateSales.TotalValue, precision),
                ],
                [
                  "  Taxable",
                  H.formatNumber(interStateSalesTaxable.TaxableValue, precision),
                  H.formatNumber(interStateSalesTaxable.IGST, precision),
                  H.formatNumber(interStateSalesTaxable.CGST, precision),
                  H.formatNumber(interStateSalesTaxable.SGST, precision),
                  H.formatNumber(interStateSalesTaxable.TotalValue, precision),
                ],
                [
                  "  Non Taxable",
                  H.formatNumber(interStateSalesNonTaxable.TaxableValue, precision),
                  H.formatNumber(interStateSalesNonTaxable.IGST, precision),
                  H.formatNumber(interStateSalesNonTaxable.CGST, precision),
                  H.formatNumber(interStateSalesNonTaxable.SGST, precision),
                  H.formatNumber(interStateSalesNonTaxable.TotalValue, precision),
                ],
                [
                  "Voucher (Manual Sales)",
                  H.formatNumber(manualSales.TaxableValue, precision),
                  H.formatNumber(manualSales.IGST, precision),
                  H.formatNumber(manualSales.CGST, precision),
                  H.formatNumber(manualSales.SGST, precision),
                  H.formatNumber(manualSales.TotalValue, precision),
                ],
                [
                  "Voucher Return (Manual Sales Return)",
                  H.formatNumber(manualSalesReturn.TaxableValue, precision),
                  H.formatNumber(manualSalesReturn.IGST, precision),
                  H.formatNumber(manualSalesReturn.CGST, precision),
                  H.formatNumber(manualSalesReturn.SGST, precision),
                  H.formatNumber(manualSalesReturn.TotalValue, precision),
                ],
                [
                  { text: "Total Outward Supplies", bold: true },
                  { text: H.formatNumber(totalOutwards.TaxableValue, precision), bold: true, alignment: "right" },
                  { text: H.formatNumber(totalOutwards.IGST, precision), bold: true, alignment: "right" },
                  { text: H.formatNumber(totalOutwards.CGST, precision), bold: true, alignment: "right" },
                  { text: H.formatNumber(totalOutwards.SGST, precision), bold: true, alignment: "right" },
                  { text: H.formatNumber(totalOutwards.TotalValue, precision), bold: true, alignment: "right" },
                ],
                // Inward Supplies header
                [{ text: "Inward Supplies", colSpan: 6, bold: true, fillColor: "#f8fafc", alignment: "center" }, "", "", "", "", ""],
                [
                  "Local Purchase",
                  H.formatNumber(totalLocalPurchase.TaxableValue, precision),
                  H.formatNumber(totalLocalPurchase.IGST, precision),
                  H.formatNumber(totalLocalPurchase.CGST, precision),
                  H.formatNumber(totalLocalPurchase.SGST, precision),
                  H.formatNumber(totalLocalPurchase.TotalValue, precision),
                ],
                [
                  "  Taxable",
                  H.formatNumber(localPurchaseTaxable.TaxableValue, precision),
                  H.formatNumber(localPurchaseTaxable.IGST, precision),
                  H.formatNumber(localPurchaseTaxable.CGST, precision),
                  H.formatNumber(localPurchaseTaxable.SGST, precision),
                  H.formatNumber(localPurchaseTaxable.TotalValue, precision),
                ],
                [
                  "  Non Taxable",
                  H.formatNumber(localPurchaseNonTaxable.TaxableValue, precision),
                  H.formatNumber(localPurchaseNonTaxable.IGST, precision),
                  H.formatNumber(localPurchaseNonTaxable.CGST, precision),
                  H.formatNumber(localPurchaseNonTaxable.SGST, precision),
                  H.formatNumber(localPurchaseNonTaxable.TotalValue, precision),
                ],
                [
                  "Inter State Purchase",
                  H.formatNumber(totalInterStatePurchase.TaxableValue, precision),
                  H.formatNumber(totalInterStatePurchase.IGST, precision),
                  H.formatNumber(totalInterStatePurchase.CGST, precision),
                  H.formatNumber(totalInterStatePurchase.SGST, precision),
                  H.formatNumber(totalInterStatePurchase.TotalValue, precision),
                ],
                [
                  "  Taxable",
                  H.formatNumber(interStatePurchaseTaxable.TaxableValue, precision),
                  H.formatNumber(interStatePurchaseTaxable.IGST, precision),
                  H.formatNumber(interStatePurchaseTaxable.CGST, precision),
                  H.formatNumber(interStatePurchaseTaxable.SGST, precision),
                  H.formatNumber(interStatePurchaseTaxable.TotalValue, precision),
                ],
                [
                  "  Non Taxable",
                  H.formatNumber(interStatePurchaseNonTaxable.TaxableValue, precision),
                  H.formatNumber(interStatePurchaseNonTaxable.IGST, precision),
                  H.formatNumber(interStatePurchaseNonTaxable.CGST, precision),
                  H.formatNumber(interStatePurchaseNonTaxable.SGST, precision),
                  H.formatNumber(interStatePurchaseNonTaxable.TotalValue, precision),
                ],
                [
                  "Voucher (Manual Purchase)",
                  H.formatNumber(manualPurchase.TaxableValue, precision),
                  H.formatNumber(manualPurchase.IGST, precision),
                  H.formatNumber(manualPurchase.CGST, precision),
                  H.formatNumber(manualPurchase.SGST, precision),
                  H.formatNumber(manualPurchase.TotalValue, precision),
                ],
                [
                  "Voucher Return (Manual Purchase Return)",
                  H.formatNumber(manualPurchaseReturn.TaxableValue, precision),
                  H.formatNumber(manualPurchaseReturn.IGST, precision),
                  H.formatNumber(manualPurchaseReturn.CGST, precision),
                  H.formatNumber(manualPurchaseReturn.SGST, precision),
                  H.formatNumber(manualPurchaseReturn.TotalValue, precision),
                ],
                [
                  { text: "Total Inwards Supplies", bold: true },
                  { text: H.formatNumber(totalInwards.TaxableValue, precision), bold: true, alignment: "right" },
                  { text: H.formatNumber(totalInwards.IGST, precision), bold: true, alignment: "right" },
                  { text: H.formatNumber(totalInwards.CGST, precision), bold: true, alignment: "right" },
                  { text: H.formatNumber(totalInwards.SGST, precision), bold: true, alignment: "right" },
                  { text: H.formatNumber(totalInwards.TotalValue, precision), bold: true, alignment: "right" },
                ],
                [
                  "", "", "", "",
                  { text: "Payable", bold: true, alignment: "right" },
                  { text: H.formatNumber(totalPayable, precision), bold: true, alignment: "right" },
                ],
              ],
            },
            layout: {
              hLineWidth: () => 0.5,
              vLineWidth: () => 0.5,
              hLineColor: () => "#e2e8f0",
              vLineColor: () => "#e2e8f0",
              paddingLeft: () => 5,
              paddingRight: () => 5,
              paddingTop: () => 3,
              paddingBottom: () => 3,
            },
          },
        ],
        styles: {
          header: { fontSize: 13, bold: true, color: "#1e293b" },
          tableHeader: {
            fontSize: 7,
            bold: true,
            color: "#475569",
            fillColor: "#f1f5f9",
          },
        },
        defaultStyle: { fontSize: 7 },
      };

      pdfMake.createPdf(docDef).open();
    } catch (err: any) {
      toast.error(err?.message || "Print failed");
    } finally {
      setPrintLoading(false);
    }
  };

  const openDetailsTab = (label: string) => {
    const existing = tabs.find((t) => t.text === label);
    if (existing) {
      setActiveTab(existing.id);
    } else {
      const newId = tabCounter;
      setTabs([...tabs, { id: newId, text: label }]);
      setActiveTab(newId);
      setTabCounter(tabCounter + 1);
    }
  };

  const closeTab = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    e.preventDefault();
    setTabs(tabs.filter((t) => t.id !== id));
    setActiveTab(1);
  };

  return (
    <div className="font-sans text-slate-700 dark:text-slate-200 pt-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg text-purple-600 dark:text-purple-400">
            <ShieldAlert size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">GSTR3B Report</h1>
            <p className="text-xs text-slate-500 font-medium">
              Tax returns summary and outward/inward supplies reports.
            </p>
          </div>
        </div>
      </div>

      {/* Filters Card */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-5">
        <div className="flex flex-wrap items-end gap-3">
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

          {/* Actions */}
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

            {/* Print Summary */}
            {activeTab === 1 && (
              <button
                onClick={handlePrintSummary}
                disabled={printLoading || loading || !isDataLoaded}
                title="Print PDF"
                className="w-10 h-10 flex items-center justify-center bg-rose-500 text-white rounded-lg hover:opacity-90 transition-all shadow-sm cursor-pointer disabled:opacity-70"
              >
                {printLoading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Printer size={16} />
                )}
              </button>
            )}

            {/* Excel Summary */}
            {activeTab === 1 && (
              <button
                onClick={handleExportSummary}
                disabled={exportLoading || loading || !isDataLoaded}
                title="Excel Export"
                className="w-10 h-10 flex items-center justify-center bg-emerald-600 text-white rounded-lg hover:opacity-90 transition-all shadow-sm cursor-pointer disabled:opacity-70"
              >
                {exportLoading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <FileSpreadsheet size={16} />
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-6 border-b border-slate-200 dark:border-slate-800 flex flex-wrap gap-1">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors cursor-pointer select-none border-b-2 ${
              activeTab === tab.id
                ? "border-blue-600 text-blue-600 bg-slate-50 dark:bg-slate-800/40"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <span>{tab.id === 1 ? tab.text : `${tab.text} Details`}</span>
            {tab.id !== 1 && (
              <button
                onClick={(e) => closeTab(e, tab.id)}
                className="p-0.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700/60 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <X size={12} />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Tab Contents */}
      <div className="mt-4">
        {tabs.map((tab) => {
          if (tab.id !== activeTab) return null;
          if (tab.id === 1) {
            return (
              <div key={tab.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 overflow-hidden flex flex-col">
                <div className="overflow-x-auto custom-scrollbar">
                  <table id="gstr3b-summary-table" className="w-full text-left border-collapse whitespace-nowrap text-xs">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold">
                        <th className="px-6 py-3">Particulars</th>
                        <th className="px-6 py-3 text-right">Taxable value</th>
                        <th className="px-6 py-3 text-right">Integrated Tax Amount</th>
                        <th className="px-6 py-3 text-right">Central Tax Amount</th>
                        <th className="px-6 py-3 text-right">State Tax Amount</th>
                        <th className="px-6 py-3 text-right">Total Tax Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-400">
                      {/* Outward Supplies */}
                      <tr className="bg-slate-100/30 dark:bg-slate-800/30">
                        <td colSpan={6} className="px-6 py-2.5 font-bold text-lg text-[#097f60] dark:text-[#0bb085] text-center">
                          Outward Supplies
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-3.5 font-bold text-slate-800 dark:text-slate-200">Local Sales</td>
                        <td className="px-6 py-3.5 text-right font-mono font-semibold">₹{H.formatNumber(totalLocalSales.TaxableValue, precision)}</td>
                        <td className="px-6 py-3.5 text-right font-mono font-semibold">₹{H.formatNumber(totalLocalSales.IGST, precision)}</td>
                        <td className="px-6 py-3.5 text-right font-mono font-semibold">₹{H.formatNumber(totalLocalSales.CGST, precision)}</td>
                        <td className="px-6 py-3.5 text-right font-mono font-semibold">₹{H.formatNumber(totalLocalSales.SGST, precision)}</td>
                        <td className="px-6 py-3.5 text-right font-mono font-bold text-slate-800 dark:text-slate-200">₹{H.formatNumber(totalLocalSales.TotalValue, precision)}</td>
                      </tr>
                      <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group">
                        <td className="px-6 py-3.5 pl-12 cursor-pointer font-medium text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400" onClick={() => openDetailsTab("Local Sales Taxable")}>
                          <div className="flex items-center justify-between w-full">
                            <span>Taxable</span>
                            {isDataLoaded && <Eye size={14} className="text-slate-400 dark:text-slate-500 hover:text-blue-500 dark:hover:text-blue-400 transition-colors" />}
                          </div>
                        </td>
                        <td className="px-6 py-3.5 text-right font-mono">₹{H.formatNumber(localSalesTaxable.TaxableValue, precision)}</td>
                        <td className="px-6 py-3.5 text-right font-mono">₹{H.formatNumber(localSalesTaxable.IGST, precision)}</td>
                        <td className="px-6 py-3.5 text-right font-mono">₹{H.formatNumber(localSalesTaxable.CGST, precision)}</td>
                        <td className="px-6 py-3.5 text-right font-mono">₹{H.formatNumber(localSalesTaxable.SGST, precision)}</td>
                        <td className="px-6 py-3.5 text-right font-mono font-semibold">₹{H.formatNumber(localSalesTaxable.TotalValue, precision)}</td>
                      </tr>
                      <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group">
                        <td className="px-6 py-3.5 pl-12 cursor-pointer font-medium text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400" onClick={() => openDetailsTab("Local Sales Non Taxable")}>
                          <div className="flex items-center justify-between w-full">
                            <span>Non Taxable</span>
                            {isDataLoaded && <Eye size={14} className="text-slate-400 dark:text-slate-500 hover:text-blue-500 dark:hover:text-blue-400 transition-colors" />}
                          </div>
                        </td>
                        <td className="px-6 py-3.5 text-right font-mono">₹{H.formatNumber(localSalesNonTaxable.TaxableValue, precision)}</td>
                        <td className="px-6 py-3.5 text-right font-mono">₹{H.formatNumber(localSalesNonTaxable.IGST, precision)}</td>
                        <td className="px-6 py-3.5 text-right font-mono">₹{H.formatNumber(localSalesNonTaxable.CGST, precision)}</td>
                        <td className="px-6 py-3.5 text-right font-mono">₹{H.formatNumber(localSalesNonTaxable.SGST, precision)}</td>
                        <td className="px-6 py-3.5 text-right font-mono font-semibold">₹{H.formatNumber(localSalesNonTaxable.TotalValue, precision)}</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-3.5 font-bold text-slate-800 dark:text-slate-200">Inter State Sales</td>
                        <td className="px-6 py-3.5 text-right font-mono font-semibold">₹{H.formatNumber(totalInterStateSales.TaxableValue, precision)}</td>
                        <td className="px-6 py-3.5 text-right font-mono font-semibold">₹{H.formatNumber(totalInterStateSales.IGST, precision)}</td>
                        <td className="px-6 py-3.5 text-right font-mono font-semibold">₹{H.formatNumber(totalInterStateSales.CGST, precision)}</td>
                        <td className="px-6 py-3.5 text-right font-mono font-semibold">₹{H.formatNumber(totalInterStateSales.SGST, precision)}</td>
                        <td className="px-6 py-3.5 text-right font-mono font-bold text-slate-800 dark:text-slate-200">₹{H.formatNumber(totalInterStateSales.TotalValue, precision)}</td>
                      </tr>
                      <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group">
                        <td className="px-6 py-3.5 pl-12 cursor-pointer font-medium text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400" onClick={() => openDetailsTab("Inter State Sales Taxable")}>
                          <div className="flex items-center justify-between w-full">
                            <span>Taxable</span>
                            {isDataLoaded && <Eye size={14} className="text-slate-400 dark:text-slate-500 hover:text-blue-500 dark:hover:text-blue-400 transition-colors" />}
                          </div>
                        </td>
                        <td className="px-6 py-3.5 text-right font-mono">₹{H.formatNumber(interStateSalesTaxable.TaxableValue, precision)}</td>
                        <td className="px-6 py-3.5 text-right font-mono">₹{H.formatNumber(interStateSalesTaxable.IGST, precision)}</td>
                        <td className="px-6 py-3.5 text-right font-mono">₹{H.formatNumber(interStateSalesTaxable.CGST, precision)}</td>
                        <td className="px-6 py-3.5 text-right font-mono">₹{H.formatNumber(interStateSalesTaxable.SGST, precision)}</td>
                        <td className="px-6 py-3.5 text-right font-mono font-semibold">₹{H.formatNumber(interStateSalesTaxable.TotalValue, precision)}</td>
                      </tr>
                      <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group">
                        <td className="px-6 py-3.5 pl-12 cursor-pointer font-medium text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400" onClick={() => openDetailsTab("Inter State Sales Non Taxable")}>
                          <div className="flex items-center justify-between w-full">
                            <span>Non Taxable</span>
                            {isDataLoaded && <Eye size={14} className="text-slate-400 dark:text-slate-500 hover:text-blue-500 dark:hover:text-blue-400 transition-colors" />}
                          </div>
                        </td>
                        <td className="px-6 py-3.5 text-right font-mono">₹{H.formatNumber(interStateSalesNonTaxable.TaxableValue, precision)}</td>
                        <td className="px-6 py-3.5 text-right font-mono">₹{H.formatNumber(interStateSalesNonTaxable.IGST, precision)}</td>
                        <td className="px-6 py-3.5 text-right font-mono">₹{H.formatNumber(interStateSalesNonTaxable.CGST, precision)}</td>
                        <td className="px-6 py-3.5 text-right font-mono">₹{H.formatNumber(interStateSalesNonTaxable.SGST, precision)}</td>
                        <td className="px-6 py-3.5 text-right font-mono font-semibold">₹{H.formatNumber(interStateSalesNonTaxable.TotalValue, precision)}</td>
                      </tr>
                      <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group">
                        <td className="px-6 py-3.5 cursor-pointer font-bold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400" onClick={() => openDetailsTab("Manual Sales")}>
                          <div className="flex items-center justify-between w-full">
                            <span>Voucher</span>
                            {isDataLoaded && <Eye size={14} className="text-slate-400 dark:text-slate-500 hover:text-blue-500 dark:hover:text-blue-400 transition-colors" />}
                          </div>
                        </td>
                        <td className="px-6 py-3.5 text-right font-mono">₹{H.formatNumber(manualSales.TaxableValue, precision)}</td>
                        <td className="px-6 py-3.5 text-right font-mono">₹{H.formatNumber(manualSales.IGST, precision)}</td>
                        <td className="px-6 py-3.5 text-right font-mono">₹{H.formatNumber(manualSales.CGST, precision)}</td>
                        <td className="px-6 py-3.5 text-right font-mono">₹{H.formatNumber(manualSales.SGST, precision)}</td>
                        <td className="px-6 py-3.5 text-right font-mono font-semibold">₹{H.formatNumber(manualSales.TotalValue, precision)}</td>
                      </tr>
                      <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group">
                        <td className="px-6 py-3.5 cursor-pointer font-bold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400" onClick={() => openDetailsTab("Manual Sales Return")}>
                          <div className="flex items-center justify-between w-full">
                            <span>Voucher Return</span>
                            {isDataLoaded && <Eye size={14} className="text-slate-400 dark:text-slate-500 hover:text-blue-500 dark:hover:text-blue-400 transition-colors" />}
                          </div>
                        </td>
                        <td className="px-6 py-3.5 text-right font-mono">₹{H.formatNumber(manualSalesReturn.TaxableValue, precision)}</td>
                        <td className="px-6 py-3.5 text-right font-mono">₹{H.formatNumber(manualSalesReturn.IGST, precision)}</td>
                        <td className="px-6 py-3.5 text-right font-mono">₹{H.formatNumber(manualSalesReturn.CGST, precision)}</td>
                        <td className="px-6 py-3.5 text-right font-mono">₹{H.formatNumber(manualSalesReturn.SGST, precision)}</td>
                        <td className="px-6 py-3.5 text-right font-mono font-semibold">₹{H.formatNumber(manualSalesReturn.TotalValue, precision)}</td>
                      </tr>
                      <tr className="bg-brand-yellow dark:bg-brand-yellow/10 font-bold border-t-2 border-brand-yellow/20 dark:border-brand-yellow/5">
                        <td className="px-6 py-3.5 text-slate-900 dark:text-brand-yellow font-extrabold">Total Outward Supplies</td>
                        <td className="px-6 py-3.5 text-right font-mono text-slate-950 dark:text-brand-yellow font-extrabold">₹{H.formatNumber(totalOutwards.TaxableValue, precision)}</td>
                        <td className="px-6 py-3.5 text-right font-mono text-slate-950 dark:text-brand-yellow font-extrabold">₹{H.formatNumber(totalOutwards.IGST, precision)}</td>
                        <td className="px-6 py-3.5 text-right font-mono text-slate-950 dark:text-brand-yellow font-extrabold">₹{H.formatNumber(totalOutwards.CGST, precision)}</td>
                        <td className="px-6 py-3.5 text-right font-mono text-slate-950 dark:text-brand-yellow font-extrabold">₹{H.formatNumber(totalOutwards.SGST, precision)}</td>
                        <td className="px-6 py-3.5 text-right font-mono text-slate-950 dark:text-brand-yellow font-extrabold">₹{H.formatNumber(totalOutwards.TotalValue, precision)}</td>
                      </tr>
 
                      {/* Inward Supplies */}
                      <tr className="bg-slate-100/30 dark:bg-slate-800/30">
                        <td colSpan={6} className="px-6 py-2.5 font-bold text-lg text-[#097f60] dark:text-[#0bb085] text-center">
                          Inward Supplies
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-3.5 font-bold text-slate-800 dark:text-slate-200">Local Purchase</td>
                        <td className="px-6 py-3.5 text-right font-mono font-semibold">₹{H.formatNumber(totalLocalPurchase.TaxableValue, precision)}</td>
                        <td className="px-6 py-3.5 text-right font-mono font-semibold">₹{H.formatNumber(totalLocalPurchase.IGST, precision)}</td>
                        <td className="px-6 py-3.5 text-right font-mono font-semibold">₹{H.formatNumber(totalLocalPurchase.CGST, precision)}</td>
                        <td className="px-6 py-3.5 text-right font-mono font-semibold">₹{H.formatNumber(totalLocalPurchase.SGST, precision)}</td>
                        <td className="px-6 py-3.5 text-right font-mono font-bold text-slate-800 dark:text-slate-200">₹{H.formatNumber(totalLocalPurchase.TotalValue, precision)}</td>
                      </tr>
                      <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group">
                        <td className="px-6 py-3.5 pl-12 cursor-pointer font-medium text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400" onClick={() => openDetailsTab("Local Purchase Taxable")}>
                          <div className="flex items-center justify-between w-full">
                            <span>Taxable</span>
                            {isDataLoaded && <Eye size={14} className="text-slate-400 dark:text-slate-500 hover:text-blue-500 dark:hover:text-blue-400 transition-colors" />}
                          </div>
                        </td>
                        <td className="px-6 py-3.5 text-right font-mono">₹{H.formatNumber(localPurchaseTaxable.TaxableValue, precision)}</td>
                        <td className="px-6 py-3.5 text-right font-mono">₹{H.formatNumber(localPurchaseTaxable.IGST, precision)}</td>
                        <td className="px-6 py-3.5 text-right font-mono">₹{H.formatNumber(localPurchaseTaxable.CGST, precision)}</td>
                        <td className="px-6 py-3.5 text-right font-mono">₹{H.formatNumber(localPurchaseTaxable.SGST, precision)}</td>
                        <td className="px-6 py-3.5 text-right font-mono font-semibold">₹{H.formatNumber(localPurchaseTaxable.TotalValue, precision)}</td>
                      </tr>
                      <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group">
                        <td className="px-6 py-3.5 pl-12 cursor-pointer font-medium text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400" onClick={() => openDetailsTab("Local Purchase Non Taxable")}>
                          <div className="flex items-center justify-between w-full">
                            <span>Non Taxable</span>
                            {isDataLoaded && <Eye size={14} className="text-slate-400 dark:text-slate-500 hover:text-blue-500 dark:hover:text-blue-400 transition-colors" />}
                          </div>
                        </td>
                        <td className="px-6 py-3.5 text-right font-mono">₹{H.formatNumber(localPurchaseNonTaxable.TaxableValue, precision)}</td>
                        <td className="px-6 py-3.5 text-right font-mono">₹{H.formatNumber(localPurchaseNonTaxable.IGST, precision)}</td>
                        <td className="px-6 py-3.5 text-right font-mono">₹{H.formatNumber(localPurchaseNonTaxable.CGST, precision)}</td>
                        <td className="px-6 py-3.5 text-right font-mono">₹{H.formatNumber(localPurchaseNonTaxable.SGST, precision)}</td>
                        <td className="px-6 py-3.5 text-right font-mono font-semibold">₹{H.formatNumber(localPurchaseNonTaxable.TotalValue, precision)}</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-3.5 font-bold text-slate-800 dark:text-slate-200">Inter State Purchase</td>
                        <td className="px-6 py-3.5 text-right font-mono font-semibold">₹{H.formatNumber(totalInterStatePurchase.TaxableValue, precision)}</td>
                        <td className="px-6 py-3.5 text-right font-mono font-semibold">₹{H.formatNumber(totalInterStatePurchase.IGST, precision)}</td>
                        <td className="px-6 py-3.5 text-right font-mono font-semibold">₹{H.formatNumber(totalInterStatePurchase.CGST, precision)}</td>
                        <td className="px-6 py-3.5 text-right font-mono font-semibold">₹{H.formatNumber(totalInterStatePurchase.SGST, precision)}</td>
                        <td className="px-6 py-3.5 text-right font-mono font-bold text-slate-800 dark:text-slate-200">₹{H.formatNumber(totalInterStatePurchase.TotalValue, precision)}</td>
                      </tr>
                      <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group">
                        <td className="px-6 py-3.5 pl-12 cursor-pointer font-medium text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400" onClick={() => openDetailsTab("Inter State Purchase Taxable")}>
                          <div className="flex items-center justify-between w-full">
                            <span>Taxable</span>
                            {isDataLoaded && <Eye size={14} className="text-slate-400 dark:text-slate-500 hover:text-blue-500 dark:hover:text-blue-400 transition-colors" />}
                          </div>
                        </td>
                        <td className="px-6 py-3.5 text-right font-mono">₹{H.formatNumber(interStatePurchaseTaxable.TaxableValue, precision)}</td>
                        <td className="px-6 py-3.5 text-right font-mono">₹{H.formatNumber(interStatePurchaseTaxable.IGST, precision)}</td>
                        <td className="px-6 py-3.5 text-right font-mono">₹{H.formatNumber(interStatePurchaseTaxable.CGST, precision)}</td>
                        <td className="px-6 py-3.5 text-right font-mono">₹{H.formatNumber(interStatePurchaseTaxable.SGST, precision)}</td>
                        <td className="px-6 py-3.5 text-right font-mono font-semibold">₹{H.formatNumber(interStatePurchaseTaxable.TotalValue, precision)}</td>
                      </tr>
                      <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group">
                        <td className="px-6 py-3.5 pl-12 cursor-pointer font-medium text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400" onClick={() => openDetailsTab("Inter State Purchase Non Taxable")}>
                          <div className="flex items-center justify-between w-full">
                            <span>Non Taxable</span>
                            {isDataLoaded && <Eye size={14} className="text-slate-400 dark:text-slate-500 hover:text-blue-500 dark:hover:text-blue-400 transition-colors" />}
                          </div>
                        </td>
                        <td className="px-6 py-3.5 text-right font-mono">₹{H.formatNumber(interStatePurchaseNonTaxable.TaxableValue, precision)}</td>
                        <td className="px-6 py-3.5 text-right font-mono">₹{H.formatNumber(interStatePurchaseNonTaxable.IGST, precision)}</td>
                        <td className="px-6 py-3.5 text-right font-mono">₹{H.formatNumber(interStatePurchaseNonTaxable.CGST, precision)}</td>
                        <td className="px-6 py-3.5 text-right font-mono">₹{H.formatNumber(interStatePurchaseNonTaxable.SGST, precision)}</td>
                        <td className="px-6 py-3.5 text-right font-mono font-semibold">₹{H.formatNumber(interStatePurchaseNonTaxable.TotalValue, precision)}</td>
                      </tr>
                      <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group">
                        <td className="px-6 py-3.5 cursor-pointer font-bold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400" onClick={() => openDetailsTab("Manual Purchase")}>
                          <div className="flex items-center justify-between w-full">
                            <span>Voucher</span>
                            {isDataLoaded && <Eye size={14} className="text-slate-400 dark:text-slate-500 hover:text-blue-500 dark:hover:text-blue-400 transition-colors" />}
                          </div>
                        </td>
                        <td className="px-6 py-3.5 text-right font-mono">₹{H.formatNumber(manualPurchase.TaxableValue, precision)}</td>
                        <td className="px-6 py-3.5 text-right font-mono">₹{H.formatNumber(manualPurchase.IGST, precision)}</td>
                        <td className="px-6 py-3.5 text-right font-mono">₹{H.formatNumber(manualPurchase.CGST, precision)}</td>
                        <td className="px-6 py-3.5 text-right font-mono">₹{H.formatNumber(manualPurchase.SGST, precision)}</td>
                        <td className="px-6 py-3.5 text-right font-mono font-semibold">₹{H.formatNumber(manualPurchase.TotalValue, precision)}</td>
                      </tr>
                      <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group">
                        <td className="px-6 py-3.5 cursor-pointer font-bold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400" onClick={() => openDetailsTab("Manual Purchase Return")}>
                          <div className="flex items-center justify-between w-full">
                            <span>Voucher Return</span>
                            {isDataLoaded && <Eye size={14} className="text-slate-400 dark:text-slate-500 hover:text-blue-500 dark:hover:text-blue-400 transition-colors" />}
                          </div>
                        </td>
                        <td className="px-6 py-3.5 text-right font-mono">₹{H.formatNumber(manualPurchaseReturn.TaxableValue, precision)}</td>
                        <td className="px-6 py-3.5 text-right font-mono">₹{H.formatNumber(manualPurchaseReturn.IGST, precision)}</td>
                        <td className="px-6 py-3.5 text-right font-mono">₹{H.formatNumber(manualPurchaseReturn.CGST, precision)}</td>
                        <td className="px-6 py-3.5 text-right font-mono">₹{H.formatNumber(manualPurchaseReturn.SGST, precision)}</td>
                        <td className="px-6 py-3.5 text-right font-mono font-semibold">₹{H.formatNumber(manualPurchaseReturn.TotalValue, precision)}</td>
                      </tr>
                      <tr className="bg-brand-yellow dark:bg-brand-yellow/10 font-bold border-t-2 border-brand-yellow/20 dark:border-brand-yellow/5">
                        <td className="px-6 py-3.5 text-slate-900 dark:text-brand-yellow font-extrabold">Total Inwards Supplies</td>
                        <td className="px-6 py-3.5 text-right font-mono text-slate-950 dark:text-brand-yellow font-extrabold">₹{H.formatNumber(totalInwards.TaxableValue, precision)}</td>
                        <td className="px-6 py-3.5 text-right font-mono text-slate-950 dark:text-brand-yellow font-extrabold">₹{H.formatNumber(totalInwards.IGST, precision)}</td>
                        <td className="px-6 py-3.5 text-right font-mono text-slate-950 dark:text-brand-yellow font-extrabold">₹{H.formatNumber(totalInwards.CGST, precision)}</td>
                        <td className="px-6 py-3.5 text-right font-mono text-slate-950 dark:text-brand-yellow font-extrabold">₹{H.formatNumber(totalInwards.SGST, precision)}</td>
                        <td className="px-6 py-3.5 text-right font-mono text-slate-950 dark:text-brand-yellow font-extrabold">₹{H.formatNumber(totalInwards.TotalValue, precision)}</td>
                      </tr>
 
                      {/* Payable */}
                      <tr className="bg-brand-yellow dark:bg-brand-yellow/10 border-t border-brand-yellow/20 dark:border-brand-yellow/5 font-extrabold text-sm">
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td className="px-6 py-3.5 text-right text-slate-900 dark:text-brand-yellow font-black uppercase tracking-wider">Payable</td>
                        <td className="px-6 py-3.5 text-right font-mono text-slate-950 dark:text-brand-yellow font-black">₹{H.formatNumber(totalPayable, precision)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            );
          } else {
            return (
              <div key={tab.id}>
                <Gstr3bDetailsView
                  label={tab.text}
                  fromDate={fromDate}
                  toDate={toDate}
                  precision={precision}
                />
              </div>
            );
          }
        })}
      </div>
    </div>
  );
};

// Details view child component
interface DetailsViewProps {
  label: string;
  fromDate: string;
  toDate: string;
  precision: number;
}

const Gstr3bDetailsView: React.FC<DetailsViewProps> = ({
  label,
  fromDate,
  toDate,
  precision,
}) => {
  const [lst, setLst] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  const formatDateForApi = (dateStr: string, time: string) => {
    if (!dateStr) return "";
    const [y, m, d] = dateStr.split("-");
    return `${d}/${m}/${y} ${time}`;
  };

  const loadDetails = useCallback(async () => {
    setLoading(true);
    try {
      const optionItem = EnGSTR3B2Details.find((x) => x.text === label);
      const optionId = optionItem ? optionItem.id : 1;

      const fdata = {
        dateFrom: formatDateForApi(fromDate, "00:00:00"),
        dateTo: formatDateForApi(toDate, "23:59:59"),
        resultType: 1,
        option: optionId,
      };

      const data = await reportApi.gstr3BDetailsReport(fdata);
      if (data && data.length > 0) {
        setLst(data);
      } else {
        setLst([]);
      }
    } catch (err: any) {
      toast.info(err?.message || "Failed to load details.", "Error");
      setLst([]);
    } finally {
      setLoading(false);
    }
  }, [label, fromDate, toDate]);

  useEffect(() => {
    loadDetails();
  }, [loadDetails]);

  const handleExportDetails = async () => {
    setExportLoading(true);
    try {
      const optionItem = EnGSTR3B2Details.find((x) => x.text === label);
      const optionId = optionItem ? optionItem.id : 1;

      const fdata = {
        dateFrom: formatDateForApi(fromDate, "00:00:00"),
        dateTo: formatDateForApi(toDate, "23:59:59"),
        resultType: 2,
        option: optionId,
      };

      const blob = await reportApi.gstr3BDetailsReportExport(fdata);
      if (blob && blob.size > 0) {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "gstr3-detailsReport.xlsx";
        a.click();
        URL.revokeObjectURL(a.href);
      } else {
        // Fallback using xlsx client-side
        if (lst.length) {
          const wsData = [
            ["Doc No", "Date", "GST No", "Taxable Value", "IGST", "SGST", "CGST"],
            ...lst.map((row) => [
              row.Bill_No || "",
              row.Date ? new Date(row.Date).toLocaleDateString("en-GB") : "",
              row.GstNo || "",
              row.TaxableValue || 0,
              row.IGST || 0,
              row.SGST || 0,
              row.CGST || 0,
            ]),
          ];
          const wb = XLSX.utils.book_new();
          const ws = XLSX.utils.aoa_to_sheet(wsData);
          XLSX.utils.book_append_sheet(wb, ws, "Details");
          XLSX.writeFile(wb, "gstr3-detailsReport.xlsx");
        } else {
          toast.info("No data found to export.", "Info");
        }
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to export details.");
    } finally {
      setExportLoading(false);
    }
  };

  const totalTaxable = lst.reduce((acc, row) => acc + (parseFloat(row.TaxableValue) || 0), 0);

  return (
    <div className="space-y-4">
      {/* Dynamic Actions panel */}
      <div className="flex justify-end">
        <button
          onClick={handleExportDetails}
          disabled={exportLoading || loading || !lst.length}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-sm transition-colors disabled:opacity-75"
        >
          {exportLoading ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Download size={14} />
          )}
          <span>Export to Excel</span>
        </button>
      </div>

      {/* Grid Table */}
      {loading ? (
        <div className="flex items-center justify-center p-12 text-slate-400">
          <Loader2 size={24} className="animate-spin mr-2" /> Loading details...
        </div>
      ) : lst.length > 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col mt-2">
          <div className="overflow-auto custom-scrollbar max-h-[calc(100vh-340px)]">
            <table className="w-full text-left border-collapse whitespace-nowrap text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="px-6 py-3 w-[80px]">Sr No</th>
                  <th className="px-6 py-3">Doc No</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">GST No</th>
                  <th className="px-6 py-3 text-right">Taxable Value</th>
                  <th className="px-6 py-3 text-right">IGST</th>
                  <th className="px-6 py-3 text-right">SGST</th>
                  <th className="px-6 py-3 text-right">CGST</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-400">
                {lst.map((row, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="px-6 py-3.5 font-semibold text-slate-500">{idx + 1}</td>
                    <td className="px-6 py-3.5 font-bold text-slate-800 dark:text-slate-200">{row.Bill_No || "—"}</td>
                    <td className="px-6 py-3.5">{row.Date ? new Date(row.Date).toLocaleDateString("en-GB") : "—"}</td>
                    <td className="px-6 py-3.5">{row.GstNo || "—"}</td>
                    <td className="px-6 py-3.5 text-right font-mono">₹{H.formatNumber(row.TaxableValue, precision)}</td>
                    <td className="px-6 py-3.5 text-right font-mono">₹{H.formatNumber(row.IGST, precision)}</td>
                    <td className="px-6 py-3.5 text-right font-mono">₹{H.formatNumber(row.SGST, precision)}</td>
                    <td className="px-6 py-3.5 text-right font-mono">₹{H.formatNumber(row.CGST, precision)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center p-12 text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
          No detail transactions found.
        </div>
      )}

      {/* Sticky footer metrics bar */}
      {lst.length > 0 && (
        <div className="sticky bottom-0 z-10 bg-brand-yellow dark:bg-brand-yellow/10 rounded-xl border border-brand-yellow/20 dark:border-brand-yellow/5 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] p-4 select-none mt-2">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <span className="text-xs font-bold text-slate-800 dark:text-brand-yellow/90 uppercase">
              Total Rows :{" "}
              <span className="text-slate-950 dark:text-brand-yellow font-extrabold">{lst.length}</span>
            </span>
            <span className="text-xs font-bold text-slate-800 dark:text-brand-yellow/90 uppercase">
              Total Taxable Value :{" "}
              <span className="text-slate-950 dark:text-brand-yellow font-extrabold">₹{H.formatNumber(totalTaxable, precision)}</span>
            </span>
            <span className="text-xs font-bold text-slate-800 dark:text-brand-yellow/90 uppercase">
              Filtered Rows :{" "}
              <span className="text-slate-950 dark:text-brand-yellow font-extrabold">{lst.length}</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
