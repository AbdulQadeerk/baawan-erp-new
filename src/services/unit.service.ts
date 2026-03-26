import { apiClient } from '../lib/api-client';
import api from '../lib/api-client';

export interface UnitSearchPayload {
  isSync?: boolean;
  name?: string | null;
  category?: number | null;
}

export interface UnitSearchResponse {
  list: UnitRecord[];
  totalCount: number;
}

export interface UnitRecord {
  id: number;
  name: string;
  category: number;
  shortName: string;
}

export const UNIT_CATEGORIES = [
  { id: 1, text: 'Others' },
  { id: 2, text: 'Length' },
  { id: 3, text: 'Area' },
  { id: 4, text: 'Volume' },
  { id: 5, text: 'Weight' },
];

export function getUnitCategoryText(categoryId?: number | null): string {
  if (!categoryId) return '';
  const match = UNIT_CATEGORIES.find(c => c.id === categoryId);
  return match ? match.text : String(categoryId);
}

export const unitApi = {
  search(data: UnitSearchPayload): Promise<UnitSearchResponse> {
    return apiClient.post<UnitSearchResponse>('/api/UnitMaster/Search', data);
  },

  getById(id: number): Promise<UnitRecord> {
    return apiClient.post<UnitRecord>('/api/UnitMaster/GetById', { id });
  },

  create(data: Omit<UnitRecord, 'id'>): Promise<number> {
    return apiClient.post<number>('/api/UnitMaster/Create', data);
  },

  update(data: UnitRecord): Promise<any> {
    return apiClient.post('/api/UnitMaster/Update', data);
  },

  delete(id: number): Promise<any> {
    return apiClient.post('/api/UnitMaster/Delete', { id });
  },

  async exportToExcel(data: UnitSearchPayload): Promise<Blob> {
    const response = await api.post('/api/UnitMaster/Export', data, {
      headers: { Accept: 'application/octet-stream' },
      responseType: 'blob',
    });
    return response.data;
  },

  print(data: UnitSearchPayload): Promise<{ list: any[] }> {
    return apiClient.post('/api/UnitMaster/Print', data);
  },
};
