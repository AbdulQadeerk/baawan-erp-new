import { apiClient } from '../lib/api-client';

export interface ProjectSiteSearchPayload {
  pageSize?: number;
  pageNumber?: number;
  isSync?: boolean;
  name?: string;
  lastModifiedDate?: string | null;
  text?: string | null;
}

export interface ProjectSiteRecord {
  id: number;
  name: string;
  address: string | null;
  shipAddress: string | null;
  area: string | null;
  country: string | null;
  city: string | null;
  state: string | null;
  pinCode: string | null;
  phone_1: string | null;
  phone_2: string | null;
  mobile: string | null;
  email: string | null;
  contact_Person: string | null;
  gstNo: string | null;
  isDeleted?: boolean;
}

export const projectSiteApi = {
  search(data: ProjectSiteSearchPayload): Promise<{ list: ProjectSiteRecord[]; totalCount: number }> {
    return apiClient.post('/api/ProjectSite/Search', data);
  },

  create(data: Omit<ProjectSiteRecord, 'id'>): Promise<any> {
    return apiClient.post('/api/ProjectSite/Create', data);
  },

  update(data: ProjectSiteRecord): Promise<any> {
    return apiClient.post('/api/ProjectSite/Update', data);
  },

  getById(id: number): Promise<ProjectSiteRecord> {
    return apiClient.post('/api/ProjectSite/GetById', { id });
  },

  delete(id: number): Promise<any> {
    return apiClient.post('/api/ProjectSite/Delete', { id });
  },

  exportToExcel(data: ProjectSiteSearchPayload): Promise<Blob> {
    return apiClient.post('/api/ProjectSite/Export', data, { responseType: 'blob' });
  },

  print(data: ProjectSiteSearchPayload): Promise<any> {
    return apiClient.post('/api/ProjectSite/Print', data);
  }
};
