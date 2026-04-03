import { apiClient } from '../lib/api-client';

export interface DistinctRequest {
  table: number; // 0 for Item
  column: string; // 'Brand', 'Category', 'Sizes', 'Type'
}

export interface DistinctResponseItem {
  name: string;
}

export const commonApi = {
  getDistinctValues(data: DistinctRequest): Promise<DistinctResponseItem[]> {
    return apiClient.post('/api/Common/Distinct', data);
  },
  
  getDropdown(data: { table: number }): Promise<any[]> {
    return apiClient.post('/api/Common/Dropdown', data);
  }
};
