import { apiClient } from '../lib/api-client';

export interface LedgerTargetSearchPayload {
  pageSize?: number;
  pageNumber?: number;
  isSync?: boolean;
  ledgerId?: number;
  lastModifiedDate?: string | null;
}

export interface LedgerTargetAssignedItem {
  ledger_ID: number;
  name: string;
}

export interface LedgerTargetAssignedResponse {
  list: LedgerTargetAssignedItem[];
  totalCount: number;
}

export interface LedgerTargetRecord {
  id?: number;
  brand: string | null;
  category: string | null;
  sizes: string | null;
  type: string | null;
  ledgerId: number | null;
  ledgeName?: string | null;
  fromDate: string | null;
  toDate: string | null;
  qty: number | null;
  amount: number | null;
  itemGroup: string | null;
  isDeleted: boolean;
  index?: number;
}

export const ledgerTargetApi = {
  search(data: LedgerTargetSearchPayload): Promise<{ list: LedgerTargetRecord[]; totalCount: number }> {
    return apiClient.post('/api/SalesTargetLedger/Search', data);
  },

  assignedLedgerTargets(data: LedgerTargetSearchPayload): Promise<LedgerTargetAssignedResponse> {
    return apiClient.post('/api/SalesTargetLedger/AssignedLedgerTargets', data);
  },

  create(data: { list: LedgerTargetRecord[] }): Promise<any> {
    return apiClient.post('/api/SalesTargetLedger/Create', data);
  }
};
