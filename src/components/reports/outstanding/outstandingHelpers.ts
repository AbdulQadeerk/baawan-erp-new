/**
 * Outstanding Report Helpers — shared across all outstanding report components
 * Mirrors Angular outstanding logic (total calculations, ledger filtering, formatting)
 */

import { storage } from '../../../lib/storage';
import { STORAGE_KEYS } from '../../../lib/constants';

// ─── Ledger list from localStorage with group filtering ──────────────────────
export function getFilteredLedgers(groupIds: number[] = [16, 17, 18, 19]): any[] {
  const ldrList = storage.getItem<any[]>(STORAGE_KEYS.LEDGER_LIST) || [];
  const grpList = storage.getItem<any[]>(STORAGE_KEYS.GROUP_LIST) || [];
  if (!ldrList.length) return [];

  // Collect all child groups recursively
  const childGroups: number[] = [];
  groupIds.forEach(gid => {
    childGroups.push(gid);
    getChildGroupIds(gid, grpList, childGroups);
  });

  let filtered = ldrList.filter(
    (x: any) => !x.lock_Freeze && childGroups.indexOf(x.group_ID) !== -1
  );

  // Enrich with searchable 'particular' field and group name
  filtered = filtered.map((ele: any) => {
    const parts: string[] = [ele.name];
    if (ele.address) parts.push(ele.address);
    if (ele.area) parts.push(ele.area);
    if (ele.city) parts.push(ele.city);
    if (ele.phone_1) parts.push(ele.phone_1);
    if (ele.phone_2) parts.push(ele.phone_2);
    if (ele.mobile) parts.push(ele.mobile);
    const grp = grpList.find((g: any) => g.id === ele.group_ID);
    return { ...ele, particular: parts.join(' '), group: grp?.name || '' };
  });

  return filtered;
}

export function getFilteredGroups(groupIds: number[] = [16, 17]): any[] {
  const grpList = storage.getItem<any[]>(STORAGE_KEYS.GROUP_LIST) || [];
  if (!grpList.length) return [];

  const childGroups: number[] = [];
  groupIds.forEach(gid => {
    childGroups.push(gid);
    getChildGroupIds(gid, grpList, childGroups);
  });

  const filtered = grpList.filter((x: any) => childGroups.indexOf(x.id) !== -1);
  return filtered.sort((a: any, b: any) => a.name.localeCompare(b.name));
}

function getChildGroupIds(parentId: number, grpList: any[], result: number[]) {
  const children = grpList.filter((g: any) => g.parentGroup === parentId);
  children.forEach((child: any) => {
    if (result.indexOf(child.id) === -1) {
      result.push(child.id);
      getChildGroupIds(child.id, grpList, result);
    }
  });
}

// ─── Totals calculation (matches Angular getTotals) ──────────────────────────
export function calculateTotals(
  lst: any[],
  precision: number
): { totalAmount: number; pendingAmount: number } {
  let totalAmount = 0;
  let pendingAmount = 0;
  for (const ele of lst) {
    totalAmount = round(
      totalAmount + ele.opening * (ele.openingDrCr === ele.ledgerDrCr ? 1 : -1),
      precision
    );
    pendingAmount = round(
      pendingAmount + ele.pending * (ele.pendingDrCr === ele.ledgerDrCr ? 1 : -1),
      precision
    );
  }
  return { totalAmount, pendingAmount };
}

export function getLedgerTotals(lst: any[], precision: number): number {
  let totalAmount = 0;
  for (const ele of lst) {
    totalAmount = round(
      totalAmount + ele.opening * (ele.openingDrCr === ele.ledgerDrCr ? 1 : -1),
      precision
    );
  }
  return totalAmount;
}

export function getLedgerPending(lst: any[], precision: number): number {
  let pendingAmount = 0;
  for (const ele of lst) {
    pendingAmount = round(
      pendingAmount + ele.pending * (ele.pendingDrCr === ele.ledgerDrCr ? 1 : -1),
      precision
    );
  }
  return pendingAmount;
}

// ─── Number helpers ──────────────────────────────────────────────────────────
export function round(value: number, precision: number): number {
  const factor = Math.pow(10, precision);
  return Math.round(value * factor) / factor;
}

export function formatNumber(val: number | null | undefined, precision: number = 2): string {
  if (val == null) return '';
  return Math.abs(val).toLocaleString('en-IN', {
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
  });
}

export function formatAmountWithDrCr(val: number, precision: number): string {
  return formatNumber(Math.abs(val), precision) + (val >= 0 ? ' Dr' : ' Cr');
}

// ─── Date formatting ─────────────────────────────────────────────────────────
export function formatDateForApi(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy} 23:59:59`;
}

export function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

export function formatDateShort(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

// ─── Precision from token ────────────────────────────────────────────────────
export function getPrecision(): number {
  const tokenInfo = storage.getItem<any>(STORAGE_KEYS.TOKEN_INFO);
  return tokenInfo?.company?.precision ?? 2;
}

export function getCurrencySymbol(): string {
  const tokenInfo = storage.getItem<any>(STORAGE_KEYS.TOKEN_INFO);
  if (tokenInfo?.company) {
    const currencyList = storage.getItem<any[]>(STORAGE_KEYS.CURRENCY_LIST);
    if (currencyList?.length) {
      const currency = currencyList.find((x: any) => x.id == tokenInfo.company.baseCurrency);
      if (currency?.code) return currency.code;
    }
  }
  return '₹';
}

// ─── Address formatting ──────────────────────────────────────────────────────
export function formatAddress(ledger: any): string {
  const parts: string[] = [];
  if (ledger.address) parts.push(ledger.address);
  if (ledger.area) parts.push(ledger.area);
  if (ledger.city) parts.push(ledger.city);
  if (ledger.stateName) parts.push(ledger.stateName);
  if (ledger.pinCode) parts.push(ledger.pinCode);
  return parts.join(', ');
}
