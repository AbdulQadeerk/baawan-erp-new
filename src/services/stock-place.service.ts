import { apiClient } from '../lib/api-client';
import api from '../lib/api-client';

export interface StockPlaceSearchPayload {
  isSync?: boolean;
  name?: string | null;
  area?: string | null;
  city?: string | null;
}

export interface StockPlaceSearchResponse {
  list: StockPlaceRecord[];
  totalCount: number;
}

export interface StockPlaceRecord {
  sp_ID: number;
  name: string;
  code: string;
  address_1?: string;
  address_2?: string;
  area: string;
  city: string;
  state: string;
  pin?: string;
  phone?: string;
  canMakeBill: boolean;
  isStockPlace: boolean;
  locationName?: string;
  baseCurrency?: number;
  cashLedger?: number;
  useInCompany: boolean;
}

export const stockPlaceApi = {
  search(data: StockPlaceSearchPayload): Promise<StockPlaceSearchResponse> {
    return apiClient.post<StockPlaceSearchResponse>('/api/StockPlace/Search', data);
  },

  getById(id: number): Promise<StockPlaceRecord> {
    return apiClient.post<StockPlaceRecord>('/api/StockPlace/GetById', { id });
  },

  create(data: Omit<StockPlaceRecord, 'sp_ID'>): Promise<number> {
    return apiClient.post<number>('/api/StockPlace/Create', data);
  },

  update(data: StockPlaceRecord): Promise<any> {
    return apiClient.post('/api/StockPlace/Update', data);
  },

  delete(id: number): Promise<any> {
    return apiClient.post('/api/StockPlace/Delete', { id });
  },

  async exportToExcel(data: StockPlaceSearchPayload): Promise<Blob> {
    const response = await api.post('/api/StockPlace/Export', data, {
      headers: { Accept: 'application/octet-stream' },
      responseType: 'blob',
    });
    return response.data;
  },

  print(data: StockPlaceSearchPayload): Promise<{ list: any[] }> {
    return apiClient.post('/api/StockPlace/Print', data);
  },
};
