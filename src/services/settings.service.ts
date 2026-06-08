import { apiClient } from '../lib/api-client';
import api from '../lib/api-client';

export const settingsApi = {
  companySetting(data: any): Promise<any> {
    return apiClient.post<any>('/api/Company/Update', data);
  },

  get(data: any): Promise<any> {
    return apiClient.post<any>('/api/Company/GetById', data);
  },

  extraChargeSetting(data: any): Promise<any> {
    return apiClient.post<any>('/api/InvoiceType/ECSettings', data);
  },

  listExtraChargeSetting(data: any): Promise<any> {
    return apiClient.post<any>('/api/InvoiceType/ListECSettings', data);
  },

  uploadCompanyDocument(formData: FormData): Promise<any> {
    return api.post('/api/Company/UploadCompanyDocument', formData);
  },

  async downloadCompanyDocument(data: { id: number; fileName: string }): Promise<Blob> {
    const response = await api.post('/api/Company/DownloadCompanyDocument', data, {
      headers: { Accept: 'application/octet-stream' },
      responseType: 'blob',
    });
    return response.data;
  },

  deleteCompanyDocument(data: { id: number; tableId: number }): Promise<any> {
    return apiClient.post<any>('/api/Company/DeleteCompanyDocument', data);
  }
};
