import { apiClient } from '../lib/api-client';
import api from '../lib/api-client';

export interface TermsConditionSearchPayload {
  isSync?: boolean;
  text?: string | null;
}

export interface TermsConditionSearchResponse {
  list: TermsConditionRecord[];
  totalCount: number;
}

export interface TermsConditionRecord {
  id: number;
  tncText: string;
}

export const termsConditionApi = {
  search(data: TermsConditionSearchPayload): Promise<TermsConditionSearchResponse> {
    return apiClient.post<TermsConditionSearchResponse>('/api/Tnc/Search', data);
  },

  getById(id: number): Promise<TermsConditionRecord> {
    return apiClient.post<TermsConditionRecord>('/api/Tnc/GetById', { id });
  },

  create(data: Omit<TermsConditionRecord, 'id'>): Promise<number> {
    return apiClient.post<number>('/api/Tnc/Create', data);
  },

  update(data: TermsConditionRecord): Promise<any> {
    return apiClient.post('/api/Tnc/Update', data);
  },

  delete(id: number): Promise<any> {
    return apiClient.post('/api/Tnc/Delete', { id });
  },

  async exportToExcel(data: TermsConditionSearchPayload): Promise<Blob> {
    const response = await api.post('/api/Tnc/Export', data, {
      headers: { Accept: 'application/octet-stream' },
      responseType: 'blob',
    });
    return response.data;
  },

  print(data: TermsConditionSearchPayload): Promise<{ list: any[] }> {
    return apiClient.post('/api/Tnc/Print', data);
  }
};
