/**
 * Report Service — mirrors Angular ReportServiceService
 * Maps all report-related API endpoints used by current-stock and item-register-view.
 */

import { apiClient } from '../lib/api-client';
import api from '../lib/api-client';

// ─── Current Stock ──────────────────────────────────────────────────────────
export const reportApi = {
  /** POST /api/Report/CurrentStock — Angular: ReportServiceService.CurrentStock() */
  currentStock(data: any): Promise<any[]> {
    return apiClient.post<any[]>('/api/Report/CurrentStock', data);
  },

  /** POST /api/Report/CurrentStockExport — returns Excel blob */
  async currentStockExport(data: any): Promise<Blob> {
    const response = await api.post('/api/Report/CurrentStockExport', data, {
      headers: { Accept: 'application/octet-stream' },
      responseType: 'blob',
    });
    return response.data;
  },

  /** POST /api/Report/ItemRegister — Angular: ReportServiceService.ItemRegister() */
  itemRegister(data: any): Promise<any[]> {
    return apiClient.post<any[]>('/api/Report/ItemRegister', data);
  },

  /** POST /api/Report/ItemRegisterExport — returns Excel blob */
  async itemRegisterExport(data: any): Promise<Blob> {
    const response = await api.post('/api/Report/ItemRegisterExport', data, {
      headers: { Accept: 'application/octet-stream' },
      responseType: 'blob',
    });
    return response.data;
  },

  /** POST /api/Report/ItemRegisterWithGroups */
  itemRegisterWithGroups(data: any): Promise<any[]> {
    return apiClient.post<any[]>('/api/Report/ItemRegisterWithGroups', data);
  },

  /** POST /api/Report/InventoryReport — Angular: ReportServiceService.InventoryReport() */
  inventoryReport(data: any): Promise<any[]> {
    return apiClient.post<any[]>('/api/Report/InventoryReport', data);
  },

  /** POST /api/Report/InventoryReportExport — returns Excel blob */
  async inventoryReportExport(data: any): Promise<Blob> {
    const response = await api.post('/api/Report/InventoryReportExport', data, {
      headers: { Accept: 'application/octet-stream' },
      responseType: 'blob',
    });
    return response.data;
  },
  /** POST /api/Report/PendingItems — Angular: ReportServiceService.PendingItems() */
  pendingItems(data: any): Promise<any[]> {
    return apiClient.post<any[]>('/api/Report/PendingItems', data);
  },

  /** POST /api/Report/PendingItemsExport — returns Excel blob */
  async pendingItemsExport(data: any): Promise<Blob> {
    const response = await api.post('/api/Report/PendingItemsExport', data, {
      headers: { Accept: 'application/octet-stream' },
      responseType: 'blob',
    });
    return response.data;
  },

  /** POST /api/Report/StockValuationReport — Angular: ReportServiceService.StockValuationReport() */
  stockValuationReport(data: any): Promise<any[]> {
    return apiClient.post<any[]>('/api/Report/StockValuationReport', data);
  },

  /** POST /api/Report/StockValuationReportExport — returns Excel blob */
  async stockValuationReportExport(data: any): Promise<Blob> {
    const response = await api.post('/api/Report/StockValuationReportExport', data, {
      headers: { Accept: 'application/octet-stream' },
      responseType: 'blob',
    });
    return response.data;
  },

  /** POST /api/Report/SupplierWisePendingReport — Angular: ReportServiceService.SupplierWisePendingReport() */
  supplierWisePendingReport(data: any): Promise<any[]> {
    return apiClient.post<any[]>('/api/Report/SupplierWisePendingReport', data);
  },

  /** POST /api/Report/SupplierWisePendingReportExport — returns Excel blob */
  async supplierWisePendingReportExport(data: any): Promise<Blob> {
    const response = await api.post('/api/Report/SupplierWisePendingReportExport', data, {
      headers: { Accept: 'application/octet-stream' },
      responseType: 'blob',
    });
    return response.data;
  },

  /** POST /api/Report/SOSummary — Angular: ReportServiceService.SOSummary() */
  soSummary(data: any): Promise<any[]> {
    return apiClient.post<any[]>('/api/Report/SOSummary', data);
  },

  /** POST /api/Report/SOSummaryExport — returns Excel blob */
  async soSummaryExport(data: any): Promise<Blob> {
    const response = await api.post('/api/Report/SOSummaryExport', data, {
      headers: { Accept: 'application/octet-stream' },
      responseType: 'blob',
    });
    return response.data;
  },

  /** POST /api/Report/BatchStockSummary — Angular: ReportServiceService.BatchStockSummary() */
  batchStockSummary(data: any): Promise<any[]> {
    return apiClient.post<any[]>('/api/Report/BatchStockSummary', data);
  },

  /** POST /api/Report/TrialBalanceReport — Angular: ReportServiceService.TrialBalanceReport() */
  trialBalanceReport(data: any): Promise<any[]> {
    return apiClient.post<any[]>('/api/Report/TrialBalanceReport', data);
  },

  /** POST /api/Report/TrialBalanceReportExport — returns Excel blob */
  async trialBalanceReportExport(data: any): Promise<Blob> {
    const response = await api.post('/api/Report/TrialBalanceReportExport', data, {
      headers: { Accept: 'application/octet-stream' },
      responseType: 'blob',
    });
    return response.data;
  },

  /** POST /api/Report/LedgerRegister — Angular: ReportServiceService.LedgerRegister() */
  ledgerRegister(data: any): Promise<any> {
    return apiClient.post<any>('/api/Report/LedgerRegister', data);
  },

  /** POST /api/Report/PNLReport — Angular: ReportServiceService.ProfitLossReport() */
  profitLossReport(data: any): Promise<any> {
    return apiClient.post<any>('/api/Report/PNLReport', data);
  },

  /** POST /api/Report/BalanceSheetReport — Angular: ReportServiceService.BalanceSheetReport() */
  balanceSheetReport(data: any): Promise<any> {
    return apiClient.post<any>('/api/Report/BalanceSheetReport', data);
  },

  /** POST /api/Report/BalanceSheetReportExport — returns Excel blob */
  async balanceSheetReportExport(data: any): Promise<Blob> {
    const response = await api.post('/api/Report/BalanceSheetReportExport', data, {
      headers: { Accept: 'application/octet-stream' },
      responseType: 'blob',
    });
    return response.data;
  },

  // ─── Outstanding Report APIs ────────────────────────────────────────────────

  /** POST /api/Report/LedgerOutstanding — Angular: ReportServiceService.LedgerOutstanding() */
  ledgerOutstanding(data: any): Promise<any[]> {
    return apiClient.post<any[]>('/api/Report/LedgerOutstanding', data);
  },

  /** POST /api/Report/LedgerOutstandingExport — returns Excel blob */
  async ledgerOutstandingExport(data: any): Promise<Blob> {
    const response = await api.post('/api/Report/LedgerOutstandingExport', data, {
      headers: { Accept: 'application/octet-stream' },
      responseType: 'blob',
    });
    return response.data;
  },

  /** POST /api/Report/MultipleOutstandingExport — returns Excel blob */
  async multipleOutstandingExport(data: any): Promise<Blob> {
    const response = await api.post('/api/Report/MultipleOutstandingExport', data, {
      headers: { Accept: 'application/octet-stream' },
      responseType: 'blob',
    });
    return response.data;
  },

  /** POST /api/Report/LedgerOutstandingPrint — returns PDF blob */
  async ledgerOutstandingPrint(data: any): Promise<Blob> {
    const response = await api.post('/api/Report/LedgerOutstandingPrint', data, {
      headers: { Accept: 'application/octet-stream' },
      responseType: 'blob',
    });
    return response.data;
  },

  // ─── Register Report APIs ────────────────────────────────────────────────

  /** POST /api/Report/LedgerRegisterExport */
  async ledgerRegisterExport(data: any): Promise<Blob> {
    const response = await api.post('/api/Report/LedgerRegisterExport', data, {
      headers: { Accept: 'application/octet-stream' },
      responseType: 'blob',
    });
    return response.data;
  },

  /** POST /api/Report/SalesRegisterSummaryReport */
  salesRegisterSummaryReport(data: any): Promise<any[]> {
    return apiClient.post<any[]>('/api/Report/SalesRegisterSummaryReport', data);
  },

  /** POST /api/Report/SalesRegisterSummaryReportExport */
  async salesRegisterSummaryReportExport(data: any): Promise<Blob> {
    const response = await api.post('/api/Report/SalesRegisterSummaryReportExport', data, {
      headers: { Accept: 'application/octet-stream' },
      responseType: 'blob',
    });
    return response.data;
  },

  /** POST /api/Report/SalesRegisterDetailReport */
  salesRegisterDetailReport(data: any): Promise<any[]> {
    return apiClient.post<any[]>('/api/Report/SalesRegisterDetailReport', data);
  },

  /** POST /api/Report/SalesRegisterDetailReportExport */
  async salesRegisterDetailReportExport(data: any): Promise<Blob> {
    const response = await api.post('/api/Report/SalesRegisterDetailReportExport', data, {
      headers: { Accept: 'application/octet-stream' },
      responseType: 'blob',
    });
    return response.data;
  },

  /** POST /api/Report/PurchaseRegisterSummaryReport */
  purchaseRegisterSummaryReport(data: any): Promise<any[]> {
    return apiClient.post<any[]>('/api/Report/PurchaseRegisterSummaryReport', data);
  },

  /** POST /api/Report/PurchaseRegisterSummaryReportExport */
  async purchaseRegisterSummaryReportExport(data: any): Promise<Blob> {
    const response = await api.post('/api/Report/PurchaseRegisterSummaryReportExport', data, {
      headers: { Accept: 'application/octet-stream' },
      responseType: 'blob',
    });
    return response.data;
  },

  /** POST /api/Report/PurchaseRegisterDetailReport */
  purchaseRegisterDetailReport(data: any): Promise<any[]> {
    return apiClient.post<any[]>('/api/Report/PurchaseRegisterDetailReport', data);
  },

  /** POST /api/Report/SalesColumnarReport */
  salesColumnarReport(data: any): Promise<any[]> {
    return apiClient.post<any[]>('/api/Report/SalesColumnarReport', data);
  },

  /** POST /api/Report/SalesColumnarReportExport */
  async salesColumnarReportExport(data: any): Promise<Blob> {
    const response = await api.post('/api/Report/SalesColumnarReportExport', data, {
      headers: { Accept: 'application/octet-stream' },
      responseType: 'blob',
    });
    return response.data;
  },

  /** POST /api/Report/PurchaseColumnarReport */
  purchaseColumnarReport(data: any): Promise<any[]> {
    return apiClient.post<any[]>('/api/Report/PurchaseColumnarReport', data);
  },

  /** POST /api/Report/PurchaseColumnarReportExport */
  async purchaseColumnarReportExport(data: any): Promise<Blob> {
    const response = await api.post('/api/Report/PurchaseColumnarReportExport', data, {
      headers: { Accept: 'application/octet-stream' },
      responseType: 'blob',
    });
    return response.data;
  },

  /** POST /api/Report/AgeingReport */
  ageingReport(data: any): Promise<any[]> {
    return apiClient.post<any[]>('/api/Report/AgeingReport', data);
  },

  /** POST /api/Report/AgeingReportExport */
  async ageingReportExport(data: any): Promise<Blob> {
    const response = await api.post('/api/Report/AgeingReportExport', data, {
      headers: { Accept: 'application/octet-stream' },
      responseType: 'blob',
    });
    return response.data;
  },

  /** POST /api/Report/BankReconcile */
  bankReconcile(data: any): Promise<any> {
    return apiClient.post<any>('/api/Report/BankReconcile', data);
  },

  /** POST /api/Report/BankReconcileExport */
  async bankReconcileExport(data: any): Promise<Blob> {
    const response = await api.post('/api/Report/BankReconcileExport', data, {
      headers: { Accept: 'application/octet-stream' },
      responseType: 'blob',
    });
    return response.data;
  },

  /** POST /api/Report/BankReconcileUpdate */
  bankReconcileUpdate(data: any): Promise<any> {
    return apiClient.post<any>('/api/Report/BankReconcileUpdate', data);
  },

  /** POST /api/Report/ReportProcessDiscount */
  reportProcessDiscount(data: any): Promise<any[]> {
    return apiClient.post<any[]>('/api/Report/ReportProcessDiscount', data);
  },

  /** POST /api/Report/ReportProcessDiscountExport */
  async reportProcessDiscountExport(data: any): Promise<Blob> {
    const response = await api.post('/api/Report/ReportProcessDiscountExport', data, {
      headers: { Accept: 'application/octet-stream' },
      responseType: 'blob',
    });
    return response.data;
  },

  /** POST /api/Report/GroupSummaryReport */
  groupSummaryReport(data: any): Promise<any[]> {
    return apiClient.post<any[]>('/api/Report/GroupSummaryReport', data);
  },

  /** POST /api/Report/GroupSummaryReportExport */
  async groupSummaryReportExport(data: any): Promise<Blob> {
    const response = await api.post('/api/Report/GroupSummaryReportExport', data, {
      headers: { Accept: 'application/octet-stream' },
      responseType: 'blob',
    });
    return response.data;
  },

  /** POST /api/Report/DealerSales */
  dealerSales(data: any): Promise<any[]> {
    return apiClient.post<any[]>('/api/Report/DealerSales', data);
  },

  /** POST /api/Report/DealerSalesExport */
  async dealerSalesExport(data: any): Promise<Blob> {
    const response = await api.post('/api/Report/DealerSalesExport', data, {
      headers: { Accept: 'application/octet-stream' },
      responseType: 'blob',
    });
    return response.data;
  },

  /** POST /api/Report/DayBook */
  dayBook(data: any): Promise<any[]> {
    return apiClient.post<any[]>('/api/Report/DayBook', data);
  },

  /** POST /api/Report/GstrReport */
  gstrReport(data: any): Promise<any[]> {
    return apiClient.post<any[]>('/api/Report/GstrReport', data);
  },

  /** POST /api/Report/GstrReportExport */
  async gstrReportExport(data: any): Promise<Blob> {
    const response = await api.post('/api/Report/GstrReportExport', data, {
      headers: { Accept: 'application/octet-stream' },
      responseType: 'blob',
    });
    return response.data;
  },

  /** POST /api/Report/Gstr3BDetailsReport */
  gstr3BDetailsReport(data: any): Promise<any[]> {
    return apiClient.post<any[]>('/api/Report/Gstr3BDetailsReport', data);
  },

  /** POST /api/Report/Gstr3BDetailsReportExport */
  async gstr3BDetailsReportExport(data: any): Promise<Blob> {
    const response = await api.post('/api/Report/Gstr3BDetailsReportExport', data, {
      headers: { Accept: 'application/octet-stream' },
      responseType: 'blob',
    });
    return response.data;
  },

  /** POST /api/Report/ReportProcessTCS */
  reportProcessTCS(data: any): Promise<any[]> {
    return apiClient.post<any[]>('/api/Report/ReportProcessTCS', data);
  },

  /** POST /api/Report/ReportProcessTCSExport */
  async reportProcessTCSExport(data: any): Promise<Blob> {
    const response = await api.post('/api/Report/ReportProcessTCSExport', data, {
      headers: { Accept: 'application/octet-stream' },
      responseType: 'blob',
    });
    return response.data;
  },

  /** POST /api/Report/ReportProcessTDS */
  reportProcessTDS(data: any): Promise<any[]> {
    return apiClient.post<any[]>('/api/Report/ReportProcessTDS', data);
  },

  /** POST /api/Report/ReportProcessTDSExport */
  async reportProcessTDSExport(data: any): Promise<Blob> {
    const response = await api.post('/api/Report/ReportProcessTDSExport', data, {
      headers: { Accept: 'application/octet-stream' },
      responseType: 'blob',
    });
    return response.data;
  },

  /** POST /api/Report/ReportTOD */
  reportTOD(data: any): Promise<any[]> {
    return apiClient.post<any[]>('/api/Report/ReportTOD', data);
  },

  /** POST /api/Report/ReportTODExport */
  async reportTODExport(data: any): Promise<Blob> {
    const response = await api.post('/api/Report/ReportTODExport', data, {
      headers: { Accept: 'application/octet-stream' },
      responseType: 'blob',
    });
    return response.data;
  },

  /** POST /api/Report/MSLReport — Angular: ReportServiceService.MSLReport() */
  mslReport(data: any): Promise<any[]> {
    return apiClient.post<any[]>('/api/Report/MSLReport', data);
  },

  /** POST /api/Report/MSLReportExport — returns Excel blob */
  async mslReportExport(data: any): Promise<Blob> {
    const response = await api.post('/api/Report/MSLReportExport', data, {
      headers: { Accept: 'application/octet-stream' },
      responseType: 'blob',
    });
    return response.data;
  },

  /** POST /api/Report/SalesPersonReport */
  salesPersonReport(data: any): Promise<any[]> {
    return apiClient.post<any[]>('/api/Report/SalesPersonReport', data);
  },

  /** POST /api/Report/SalesPersonReportExport — returns Excel blob */
  async salesPersonReportExport(data: any): Promise<Blob> {
    const response = await api.post('/api/Report/SalesPersonReportExport', data, {
      headers: { Accept: 'application/octet-stream' },
      responseType: 'blob',
    });
    return response.data;
  },

  /** POST /api/Report/SalesDataBySalesPersonReport */
  salesDataBySalesPersonReport(data: any): Promise<any> {
    return apiClient.post<any>('/api/Report/SalesDataBySalesPersonReport', data);
  },

  /** POST /api/Report/SalesDataBySalesPersonReportExport */
  async salesDataBySalesPersonReportExport(data: any): Promise<Blob> {
    const response = await api.post('/api/Report/SalesDataBySalesPersonReportExport', data, {
      responseType: 'blob'
    });
    return response.data;
  },

  /** POST /api/Report/DocumentsReport */
  documentsReport(data: any): Promise<any[]> {
    return apiClient.post<any[]>('/api/Report/DocumentsReport', data);
  },

  /** POST /api/Report/DocumentsReportExport — returns Excel blob */
  async documentsReportExport(data: any): Promise<Blob> {
    const response = await api.post('/api/Report/DocumentsReportExport', data, {
      responseType: 'blob'
    });
    return response.data;
  },

  async counterSalesReport(payload: any): Promise<any[]> {
    const response = await apiClient.post<any[]>('/api/Report/CounterSalesReport', payload);
    return response;
  },

  async counterSalesReportExport(payload: any): Promise<Blob> {
    const response = await api.post('/api/Report/CounterSalesReportExport', payload, {
      headers: { Accept: 'application/octet-stream' },
      responseType: 'blob',
    });
    return response.data;
  },

  async rateComparisionReport(payload: any): Promise<any[]> {
    const response = await apiClient.post<any[]>('/api/Report/RateComparisionReport', payload);
    return response;
  },

  async rateComparisionReportExport(payload: any): Promise<Blob> {
    const response = await api.post('/api/Report/RateComparisionReportExport', payload, {
      headers: { Accept: 'application/octet-stream' },
      responseType: 'blob',
    });
    return response.data;
  }
};
