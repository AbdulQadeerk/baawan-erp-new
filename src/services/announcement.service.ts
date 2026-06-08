import { apiClient } from '../lib/api-client';

export interface Announcement {
  id?: string;
  announcement: string;
  fromDate: string;
  toDate: string;
  createdDate: string;
  companyId: string | number;
}

export const announcementApi = {
  create(data: Announcement): Promise<any> {
    return apiClient.post<any>('/api/Announcement/Create', data);
  },

  get(id: string): Promise<Announcement> {
    return apiClient.post<Announcement>('/api/Announcement/GetById', { id });
  },

  update(data: Announcement): Promise<any> {
    return apiClient.post<any>('/api/Announcement/Update', data);
  },

  delete(id: string): Promise<any> {
    return apiClient.post<any>('/api/Announcement/Delete', { id });
  },

  list(): Promise<Announcement[]> {
    return apiClient.post<Announcement[]>('/api/Announcement/List', {});
  }
};
