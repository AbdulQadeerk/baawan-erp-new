import { apiClient } from '../lib/api-client';
import api from '../lib/api-client';

export interface CurrencySearchPayload {
  isSync?: boolean;
  name?: string | null;
}

export interface CurrencySearchResponse {
  list: CurrencyRecord[];
  totalCount: number;
}

export interface CurrencyRecord {
  id: number;
  name: string;
  code: string;
  symbol: string;
}

export const currencyApi = {
  search(data: CurrencySearchPayload): Promise<CurrencySearchResponse> {
    return apiClient.post<CurrencySearchResponse>('/api/Currency/Search', data);
  },

  getById(id: number): Promise<CurrencyRecord> {
    return apiClient.post<CurrencyRecord>('/api/Currency/GetById', { id });
  },

  create(data: Omit<CurrencyRecord, 'id'>): Promise<number> {
    return apiClient.post<number>('/api/Currency/Create', data);
  },

  update(data: CurrencyRecord): Promise<any> {
    return apiClient.post('/api/Currency/Update', data);
  },

  delete(id: number): Promise<any> {
    return apiClient.post('/api/Currency/Delete', { id });
  },

  async exportToExcel(data: CurrencySearchPayload): Promise<Blob> {
    const response = await api.post('/api/Currency/Export', data, {
      headers: { Accept: 'application/octet-stream' },
      responseType: 'blob',
    });
    return response.data;
  },

  print(data: CurrencySearchPayload): Promise<{ list: any[] }> {
    return apiClient.post('/api/Currency/Print', data);
  },

  sync(data: any = {}): Promise<any> {
    return apiClient.post('/api/Currency/Sync', data);
  }
};
