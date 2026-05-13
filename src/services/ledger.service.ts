/**
 * Ledger Service — real API integration
 * Mirrors Angular LedgerServiceService
 */

import { apiClient } from '../lib/api-client';

export const ledgerApi = {
  /** POST /api/Ledger/Search */
  search(data: any): Promise<any> {
    return apiClient.post('/api/Ledger/Search', data);
  },

  /** POST /api/Ledger/MultiLedgerInfo — get details for multiple ledger IDs */
  multiLedgerInfo(data: { ledgers: any[] }): Promise<any[]> {
    return apiClient.post<any[]>('/api/Ledger/MultiLedgerInfo', data);
  },
};
