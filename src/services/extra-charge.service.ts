/**
 * Extra Charge Service — Migrated from Angular ExtraChargeService
 *
 * Angular equivalent: src/app/providers/services/extra-charge.service.ts
 *
 * All endpoints use POST (matching the Angular implementation).
 * The axios interceptor in api-client.ts automatically injects sessionId.
 */

import { apiClient } from '../lib/api-client';
import api from '../lib/api-client';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface ExtraChargeSearchPayload {
  isSync?: boolean;
  text?: string | null;
}

export interface ExtraChargeSearchResponse {
  list: ExtraChargeRecord[];
  totalCount: number;
}

export interface ExtraChargeRecord {
  extraCharges_ID: number;
  name: string;
  tax_Type?: number;
  taxType?: string;        // resolved text from API
  taxPercent?: number;
  fixedAmount?: number;
  fixedPercent?: number;
  vatEffect?: boolean;
  cstEffect?: boolean;
  isPositiveEffect?: boolean;
  percentBased?: boolean;
  description?: string;
  ledger_ID?: number;
  ledger?: string;
  ledgerName?: string;
  salesLegderId?: number;
  salesLedger?: string;
  salesLedgerName?: string;
  purchaseLegderId?: number;
  purchaseLedger?: string;
  purchaseLedgerName?: string;
  modifiedDate?: string;
}

export interface ExtraChargeCreatePayload {
  id?: number | null;
  name: string;
  tax_Type: number;
  taxPercent?: number | null;
  fixedAmount?: number;
  fixedPercent?: number;
  vatEffect?: boolean;
  cstEffect?: boolean;
  isPositiveEffect?: boolean;
  percentBased?: boolean;
  description?: string | null;
  ledger_ID: number;
  salesLegderId?: number | null;
  purchaseLegderId?: number | null;
}

// ─── Tax Type Enum (from Angular appCommon.EnTaxTypeForEC) ──────────────────
export const TAX_TYPE_OPTIONS = [
  { text: 'None', id: 0 },
  { text: 'VAT', id: 1 },
  { text: 'NoTax', id: 5 },
  { text: 'SGST', id: 6 },
  { text: 'CGST', id: 7 },
  { text: 'IGST', id: 8 },
] as const;

export const TAX_TYPE_MAP: Record<number, string> = {
  0: 'None',
  1: 'VAT',
  5: 'NoTax',
  6: 'SGST',
  7: 'CGST',
  8: 'IGST',
};

export function getTaxTypeText(id: number | undefined | null): string {
  if (id == null) return '';
  return TAX_TYPE_MAP[id] ?? '';
}

export function isTaxType(taxType: number | undefined | null): boolean {
  return taxType != null && taxType !== 0;
}

// ─── Service Methods ────────────────────────────────────────────────────────
export const extraChargeApi = {
  /**
   * POST /api/ExtraCharge/Search
   */
  search(data: ExtraChargeSearchPayload): Promise<ExtraChargeSearchResponse> {
    return apiClient.post<ExtraChargeSearchResponse>('/api/ExtraCharge/Search', data);
  },

  /**
   * POST /api/ExtraCharge/GetById
   */
  getById(id: number): Promise<ExtraChargeRecord> {
    return apiClient.post<ExtraChargeRecord>('/api/ExtraCharge/GetById', { id });
  },

  /**
   * POST /api/ExtraCharge/Create — returns new ID
   */
  create(data: ExtraChargeCreatePayload): Promise<number> {
    return apiClient.post<number>('/api/ExtraCharge/Create', data);
  },

  /**
   * POST /api/ExtraCharge/Update
   */
  update(data: ExtraChargeCreatePayload): Promise<any> {
    return apiClient.post('/api/ExtraCharge/Update', data);
  },

  /**
   * POST /api/ExtraCharge/Delete
   */
  delete(id: number): Promise<any> {
    return apiClient.post('/api/ExtraCharge/Delete', { id });
  },

  /**
   * POST /api/ExtraCharge/Export — returns Blob
   */
  async exportToExcel(data: ExtraChargeSearchPayload): Promise<Blob> {
    const response = await api.post('/api/ExtraCharge/Export', data, {
      headers: { Accept: 'application/octet-stream' },
      responseType: 'blob',
    });
    return response.data;
  },

  /**
   * POST /api/ExtraCharge/Print
   */
  print(data: ExtraChargeSearchPayload): Promise<{ list: any[] }> {
    return apiClient.post('/api/ExtraCharge/Print', data);
  },
};
