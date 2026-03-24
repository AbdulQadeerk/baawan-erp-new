/**
 * Group Service — Migrated from Angular GroupServiceService
 *
 * Angular equivalent: src/app/providers/services/group-service.service.ts
 *
 * All endpoints use POST (matching the Angular implementation).
 * The axios interceptor in api-client.ts automatically injects sessionId.
 */

import { apiClient, commonApi } from '../lib/api-client';

// ─── Types ──────────────────────────────────────────────────────────────────
export interface GroupSearchPayload {
  isSync?: boolean;
  name?: string | null;
  nature?: number | null;
}

export interface GroupSearchResponse {
  list: GroupRecord[];
  totalCount: number;
}

export interface GroupRecord {
  id: number;
  name: string;
  parentId?: number | null;
  parent?: string;
  nature?: string;
  isCr?: boolean;
  modifiedDate?: string;
  field2?: string; // isCr from dropdown
  field3?: string; // nature from dropdown
}

export interface GroupCreatePayload {
  id?: number | null;
  name: string;
  parentId: number | null;
}

export interface GroupDropdownItem {
  id: number;
  name: string;
  field1?: string; // parent name
  field2?: string; // isCr
  field3?: string; // nature
}

// ─── Nature Enum (from Angular appCommon.EnNature) ──────────────────────────
export const NATURE_OPTIONS = [
  { text: 'Assets', id: 1 },
  { text: 'Liabilities', id: 2 },
  { text: 'Expenses', id: 3 },
  { text: 'Incomes', id: 4 },
] as const;

export function getNatureText(id: number | string | undefined): string {
  if (id == null) return '';
  const numId = typeof id === 'string' ? parseInt(id, 10) : id;
  const rec = NATURE_OPTIONS.find(x => x.id === numId);
  return rec?.text ?? '';
}

// ─── System Group IDs (1-28 cannot be edited/deleted) ───────────────────────
export const SYSTEM_GROUP_MAX_ID = 28;

export function isSystemGroup(id: number): boolean {
  return id >= 1 && id <= SYSTEM_GROUP_MAX_ID;
}

// ─── Service Methods ────────────────────────────────────────────────────────
export const groupApi = {
  /**
   * POST /api/Group/Search
   * Angular: GroupServiceService.Search()
   */
  search(data: GroupSearchPayload): Promise<GroupSearchResponse> {
    return apiClient.post<GroupSearchResponse>('/api/Group/Search', data);
  },

  /**
   * POST /api/Group/GetById
   * Angular: GroupServiceService.Get()
   */
  getById(id: number): Promise<GroupRecord> {
    return apiClient.post<GroupRecord>('/api/Group/GetById', { id });
  },

  /**
   * POST /api/Group/Create
   * Angular: GroupServiceService.Create()
   * Returns the new group ID
   */
  create(data: GroupCreatePayload): Promise<number> {
    return apiClient.post<number>('/api/Group/Create', data);
  },

  /**
   * POST /api/Group/Update
   * Angular: GroupServiceService.Update()
   */
  update(data: GroupCreatePayload): Promise<any> {
    return apiClient.post('/api/Group/Update', data);
  },

  /**
   * POST /api/Group/Delete
   * Angular: GroupServiceService.Delete()
   */
  delete(id: number): Promise<any> {
    return apiClient.post('/api/Group/Delete', { id });
  },

  /**
   * POST /api/Group/Export
   * Angular: GroupServiceService.Export()
   * Returns a Blob (Excel file)
   */
  async exportToExcel(data: GroupSearchPayload): Promise<Blob> {
    // We need to use axios directly for blob response
    const { default: api } = await import('../lib/api-client');
    const response = await api.post('/api/Group/Export', data, {
      headers: { Accept: 'application/octet-stream' },
      responseType: 'blob',
    });
    return response.data;
  },

  /**
   * POST /api/Group/Print
   * Angular: GroupServiceService.Print()
   */
  print(data: GroupSearchPayload): Promise<{ list: any[] }> {
    return apiClient.post('/api/Group/Print', data);
  },

  /**
   * POST /api/Group/Sync
   * Angular: GroupServiceService.Sync()
   */
  sync(data: any): Promise<any> {
    return apiClient.post('/api/Group/Sync', data);
  },

  /**
   * Fetch parent groups dropdown (table: 10 = Group)
   * Angular: CommonService.dropdown({ table: 10 })
   */
  getParentGroupsDropdown(): Promise<GroupDropdownItem[]> {
    return commonApi.dropdown({ table: 10 });
  },
};
