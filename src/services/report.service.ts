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
};
