import { apiClient } from '../lib/api-client';
import api from '../lib/api-client';

export interface SalesPersonSearchPayload {
  isSync?: boolean;
  firstName?: string | null;
  lastName?: string | null;
  emailId?: string | null;
  loginName?: string | null;
}

export interface SalesPersonSearchResponse {
  list: SalesPersonRecord[];
  totalCount: number;
}

export interface SalesPersonRecord {
  user_ID: number;
  id?: number;
  first_Name: string;
  lastname: string;
  login_Name?: string;
  email_ID: string;
  mobileNo: string;
}

export const salesPersonApi = {
  search(data: SalesPersonSearchPayload): Promise<SalesPersonSearchResponse> {
    return apiClient.post<SalesPersonSearchResponse>('/api/Salesman/Search', data);
  },

  getById(id: number): Promise<SalesPersonRecord> {
    return apiClient.post<SalesPersonRecord>('/api/Salesman/GetById', { id });
  },

  create(data: Omit<SalesPersonRecord, 'user_ID' | 'id'>): Promise<number> {
    return apiClient.post<number>('/api/Salesman/Create', data);
  },

  update(data: Partial<SalesPersonRecord>): Promise<any> {
    return apiClient.post('/api/Salesman/Update', data);
  },

  delete(id: number): Promise<any> {
    return apiClient.post('/api/Salesman/Delete', { id });
  },

  async exportToExcel(data: SalesPersonSearchPayload): Promise<Blob> {
    const response = await api.post('/api/Salesman/Export', data, {
      headers: { Accept: 'application/octet-stream' },
      responseType: 'blob',
    });
    return response.data;
  },

  print(data: SalesPersonSearchPayload): Promise<{ list: any[] }> {
    return apiClient.post('/api/Salesman/Print', data);
  }
};
