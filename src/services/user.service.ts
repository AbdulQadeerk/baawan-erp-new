import { apiClient } from '../lib/api-client';

export interface UserSearchPayload {
  pageSize?: number;
  pageNumber?: number;
  isSync?: boolean;
  name?: string;
  login_Name?: string;
}

export interface UserRoleRecord {
  role_id: number;
}

export interface UserRecord {
  id?: number;
  first_Name: string;
  lastname: string;
  login_Name: string;
  email_ID?: string | null;
  mobileNo?: string | null;
  designation: string;
  password?: string | null;
  emailPwd?: string | null;
  isLedger?: boolean;
  isBlocked?: boolean;
  isDeleted?: boolean;
  address?: string | null;
  description?: string | null;
  ledger_ID?: number | null;
  isEmployee?: boolean;
  roles?: UserRoleRecord[];
}

export const userApi = {
  search(data: UserSearchPayload): Promise<{ list: UserRecord[]; totalCount: number }> {
    return apiClient.post('/api/User/Search', data);
  },

  create(data: UserRecord): Promise<any> {
    return apiClient.post('/api/User/Create', data);
  },

  update(data: UserRecord): Promise<any> {
    return apiClient.post('/api/User/Update', data);
  },

  getById(id: number): Promise<UserRecord> {
    return apiClient.post('/api/User/GetById', { id });
  },

  delete(id: number): Promise<any> {
    return apiClient.post('/api/User/Delete', { id });
  },

  exportToExcel(data: UserSearchPayload): Promise<Blob> {
    return apiClient.post('/api/User/Export', data, { responseType: 'blob' });
  },

  print(data: UserSearchPayload): Promise<any> {
    return apiClient.post('/api/User/Print', data);
  },
  
  sync(data: any): Promise<any> {
      return apiClient.post('/api/User/Sync', data);
  }
};
