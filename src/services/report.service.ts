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
};
