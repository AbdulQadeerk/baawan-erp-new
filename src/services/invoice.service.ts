/**
 * Invoice Service — mirrors Angular InvoiceService
 * Maps all invoice-related API endpoints.
 */

import { apiClient } from '../lib/api-client';
import api from '../lib/api-client';

export const invoiceApi = {
  /** POST /api/Invoice/Search */
  search(data: any): Promise<any> {
    return apiClient.post('/api/Invoice/Search', data);
  },

  /** POST /api/Invoice/GetById — Angular: InvoiceService.Get() */
  getById(data: any): Promise<any> {
    return apiClient.post('/api/Invoice/GetById', data);
  },

  /** POST /api/Invoice/SetupInfo */
  setupInfo(data: any): Promise<any> {
    return apiClient.post('/api/Invoice/SetupInfo', data);
  },

  /** POST /api/Invoice/Create */
  create(data: any): Promise<any> {
    return apiClient.post('/api/Invoice/Create', data);
  },

  /** POST /api/Invoice/Update */
  update(data: any): Promise<any> {
    return apiClient.post('/api/Invoice/Update', data);
  },

  /** POST /api/Invoice/Delete */
  delete(data: any): Promise<any> {
    return apiClient.post('/api/Invoice/Delete', data);
  },

  /** POST /api/Invoice/Export — returns Excel blob */
  async export(data: any): Promise<Blob> {
    const response = await api.post('/api/Invoice/Export', data, {
      headers: { Accept: 'application/octet-stream' },
      responseType: 'blob',
    });
    return response.data;
  },

  /** POST /api/Invoice/GetPendInvs */
  getPendInvs(data: any): Promise<any> {
    return apiClient.post('/api/Invoice/GetPendInvs', data);
  },

  /** POST /api/Invoice/GetPendInvDetails */
  getPendInvDetails(data: any): Promise<any> {
    return apiClient.post('/api/Invoice/GetPendInvDetails', data);
  },

  /** POST /api/Invoice/ChooseRateDiscount */
  chooseRateDiscount(data: any): Promise<{ discount: number; rate: number }> {
    return apiClient.post('/api/Invoice/ChooseRateDiscount', data);
  },

  /** POST /api/Invoice/Dependency */
  dependency(data: any): Promise<any> {
    return apiClient.post('/api/Invoice/Dependency', data);
  },

  /** POST /api/Invoice/ExportInvoiceItems — returns blob */
  async exportInvoiceItems(data: any): Promise<Blob> {
    const response = await api.post('/api/Invoice/ExportInvoiceItems', data, {
      headers: { Accept: 'application/octet-stream' },
      responseType: 'blob',
    });
    return response.data;
  },

  /** POST /api/Invoice/Correction */
  correction(data: any): Promise<any> {
    return apiClient.post('/api/Invoice/Correction', data);
  },

  /** POST /api/Invoice/GenerateIRN */
  generateIRN(data: any): Promise<any> {
    return apiClient.post('/api/Invoice/GenerateIRN', data);
  },

  /** POST /api/Invoice/SendEmail */
  sendEmail(data: any): Promise<any> {
    return apiClient.post('/api/Invoice/SendEmail', data);
  },

  /** GET /api/Invoice/:invCode/:invType/:format — returns PDF blob */
  async getPdf(invCode: number, invType: number, format: string): Promise<Blob> {
    const response = await api.get(`/api/Invoice/${invCode}/${invType}/${format}`, {
      responseType: 'blob',
    });
    return response.data;
  },
};
