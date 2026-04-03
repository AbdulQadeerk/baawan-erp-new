import { apiClient } from '../lib/api-client';
import api from '../lib/api-client';

export interface ItemCategorySearchPayload {
  isSync?: boolean;
  name?: string | null;
}

export interface ItemCategorySearchResponse {
  list: ItemCategoryRecord[];
  totalCount: number;
}

export interface ItemCategoryRecord {
  priceCategoryID: number;
  priceCategoryName: string;
}

export const itemCategoryApi = {
  search(data: ItemCategorySearchPayload): Promise<ItemCategorySearchResponse> {
    return apiClient.post<ItemCategorySearchResponse>('/api/PriceCategory/Search', data);
  },

  getById(id: number): Promise<ItemCategoryRecord> {
    return apiClient.post<ItemCategoryRecord>('/api/PriceCategory/GetById', { id });
  },

  create(data: Omit<ItemCategoryRecord, 'priceCategoryID'>): Promise<number> {
    return apiClient.post<number>('/api/PriceCategory/Create', data);
  },

  update(data: ItemCategoryRecord & { id?: number }): Promise<any> {
    return apiClient.post('/api/PriceCategory/Update', data);
  },

  delete(id: number): Promise<any> {
    return apiClient.post('/api/PriceCategory/Delete', { id });
  },

  async exportToExcel(data: ItemCategorySearchPayload): Promise<Blob> {
    const response = await api.post('/api/PriceCategory/Export', data, {
      headers: { Accept: 'application/octet-stream' },
      responseType: 'blob',
    });
    return response.data;
  },

  print(data: ItemCategorySearchPayload): Promise<{ list: any[] }> {
    return apiClient.post('/api/PriceCategory/Print', data);
  }
};
