/**
 * Trial Balance Helpers — mirrors Angular trial-balance.component.ts logic
 */
import { storage } from '../../../lib/storage';
import { STORAGE_KEYS } from '../../../lib/constants';

// ─── Date Helpers ────────────────────────────────────────────────────────────
export function getFYDates(): { fromDate: string; toDate: string } {
  const tokenInfo = storage.getItem<any>(STORAGE_KEYS.TOKEN_INFO);
  let fromDate: Date, toDate: Date;
  if (tokenInfo?.company?.currentFYStarts && tokenInfo?.company?.currentFYEnds) {
    fromDate = new Date(tokenInfo.company.currentFYStarts);
    toDate = new Date(tokenInfo.company.currentFYEnds);
  } else {
    const today = new Date();
    const year = today.getMonth() >= 3 ? today.getFullYear() : today.getFullYear() - 1;
    fromDate = new Date(year, 3, 1);
    toDate = new Date(year + 1, 2, 31);
  }
  return {
    fromDate: fromDate.toISOString().split('T')[0],
    toDate: toDate.toISOString().split('T')[0],
  };
}

export function formatDateForApi(dateStr: string, time: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy} ${time}`;
}

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

// ─── Group List from localStorage ────────────────────────────────────────────
export function getGroupList(): any[] {
  return storage.getItem<any[]>(STORAGE_KEYS.GROUP_LIST) || [];
}

// ─── Dr/Cr Formatting ────────────────────────────────────────────────────────
export function formatDrCr(amount: number, isCreditNature: boolean): { value: number; type: string } {
  if (amount === 0) return { value: 0, type: '' };
  if (isCreditNature) {
    return amount >= 0 ? { value: Math.abs(amount), type: 'Cr' } : { value: Math.abs(amount), type: 'Dr' };
  } else {
    return amount >= 0 ? { value: Math.abs(amount), type: 'Dr' } : { value: Math.abs(amount), type: 'Cr' };
  }
}

// ─── Process Trial Balance Item ──────────────────────────────────────────────
export function processTrialBalanceItem(item: any, group: any): void {
  if (!group || group.isCr === undefined) return;
  const isCr = group.isCr;
  const opening = item.OPENINGBAL || 0;
  const debit = item.DEBIT || 0;
  const credit = item.CREDIT || 0;
  let closing = isCr ? opening - debit + credit : opening + debit - credit;

  const openingDisplay = formatDrCr(opening, isCr);
  const closingDisplay = formatDrCr(closing, isCr);

  item.processedOpeningBalance = openingDisplay.value;
  item.openingDrCr = openingDisplay.type;
  item.processedDebit = Math.abs(debit);
  item.processedCredit = Math.abs(credit);
  item.processedClosingBalance = closingDisplay.value;
  item.closingDrCr = closingDisplay.type;
  item.originalOpeningBalance = opening;
  item.originalDebit = debit;
  item.originalCredit = credit;
  item.originalClosingBalance = closing;
}

// ─── Accessor helpers (mirror Angular getProcessed* methods) ─────────────────
export function getProcessedOpeningBalance(item: any): number {
  if (item.processedOpeningBalance !== undefined) return item.processedOpeningBalance;
  const isCr = item.groupInfo?.isCr;
  if (isCr !== undefined) return formatDrCr(item.OPENINGBAL || 0, isCr).value;
  return Math.abs(item.OPENINGBAL || 0);
}
export function getOpeningDrCr(item: any): string {
  return item.openingDrCr || '';
}
export function getProcessedDebit(item: any): number {
  return item.processedDebit !== undefined ? item.processedDebit : Math.abs(item.DEBIT || 0);
}
export function getProcessedCredit(item: any): number {
  return item.processedCredit !== undefined ? item.processedCredit : Math.abs(item.CREDIT || 0);
}
export function getProcessedClosingBalance(item: any): number {
  if (item.processedClosingBalance !== undefined) return item.processedClosingBalance;
  return Math.abs(item.originalClosingBalance !== undefined ? item.originalClosingBalance : ((item.OPENINGBAL || 0) + (item.DEBIT || 0) + (item.CREDIT || 0)));
}
export function getClosingDrCr(item: any): string {
  if (item.closingDrCr) return item.closingDrCr;
  const isCr = item.groupInfo?.isCr;
  const closing = item.originalClosingBalance !== undefined ? item.originalClosingBalance : ((item.OPENINGBAL || 0) + (item.DEBIT || 0) + (item.CREDIT || 0));
  if (isCr === undefined) return closing >= 0 ? 'Cr' : 'Dr';
  return closing >= 0 ? (isCr ? 'Cr' : 'Dr') : (isCr ? 'Dr' : 'Cr');
}

// ─── Group-level totals ──────────────────────────────────────────────────────
export function getNetAmountWithSign(lst: any[]): number {
  return lst.reduce((sum, obj) => {
    if (obj.originalClosingBalance !== undefined) return sum + obj.originalClosingBalance;
    const opening = obj.originalOpeningBalance !== undefined ? obj.originalOpeningBalance : (obj.OPENINGBAL || 0);
    const debit = obj.originalDebit !== undefined ? obj.originalDebit : (obj.DEBIT || 0);
    const credit = obj.originalCredit !== undefined ? obj.originalCredit : (obj.CREDIT || 0);
    const isCr = obj.groupInfo?.isCr;
    if (isCr === true) return sum + (opening - debit + credit);
    if (isCr === false) return sum + (opening + debit - credit);
    return sum + (opening + debit + credit);
  }, 0);
}
export function getNetAmount(lst: any[]): number {
  return Math.abs(getNetAmountWithSign(lst));
}
export function getTotalProcessedOpeningBalance(lst: any[]): number {
  const total = lst.reduce((s, o) => s + (o.originalOpeningBalance !== undefined ? o.originalOpeningBalance : (o.OPENINGBAL || 0)), 0);
  const isCr = lst[0]?.groupInfo?.isCr;
  if (isCr !== undefined) return formatDrCr(total, isCr).value;
  return Math.abs(total);
}
export function getTotalOpeningBalanceWithSign(lst: any[]): number {
  return lst.reduce((s, o) => s + (o.originalOpeningBalance !== undefined ? o.originalOpeningBalance : (o.OPENINGBAL || 0)), 0);
}
export function getTotalProcessedDebit(lst: any[]): number {
  return lst.reduce((s, o) => s + Math.abs(o.originalDebit !== undefined ? o.originalDebit : (o.DEBIT || 0)), 0);
}
export function getTotalProcessedCredit(lst: any[]): number {
  return lst.reduce((s, o) => s + Math.abs(o.originalCredit !== undefined ? o.originalCredit : (o.CREDIT || 0)), 0);
}
export function getClosingDrCrForGroup(lst: any[]): string {
  if (!lst?.length) return '';
  let groupInfo = lst[0]?.groupInfo;
  if (!groupInfo) { for (const item of lst) { if (item.groupInfo) { groupInfo = item.groupInfo; break; } } }
  if (!groupInfo) return '';
  const isCr = groupInfo.isCr;
  const net = getNetAmountWithSign(lst);
  return net >= 0 ? (isCr ? 'Cr' : 'Dr') : (isCr ? 'Dr' : 'Cr');
}
export function getOpeningDrCrForGroup(lst: any[]): string {
  if (!lst?.length) return '';
  let groupInfo = lst[0]?.groupInfo;
  if (!groupInfo) { for (const item of lst) { if (item.groupInfo) { groupInfo = item.groupInfo; break; } } }
  if (!groupInfo) return '';
  const isCr = groupInfo.isCr;
  const total = getTotalOpeningBalanceWithSign(lst);
  return total >= 0 ? (isCr ? 'Cr' : 'Dr') : (isCr ? 'Dr' : 'Cr');
}

// ─── GroupBy pipe equivalent ─────────────────────────────────────────────────
export function groupBy<T>(arr: T[], key: string): { key: string; value: T[] }[] {
  const map = new Map<string, T[]>();
  arr.forEach(item => {
    const k = (item as any)[key] || 'Other';
    if (!map.has(k)) map.set(k, []);
    map.get(k)!.push(item);
  });
  return Array.from(map.entries()).map(([k, v]) => ({ key: k, value: v }));
}

// ─── Number formatting ──────────────────────────────────────────────────────
export function formatNumber(val: number | null | undefined, precision: number = 2): string {
  if (val == null) return '';
  return Math.abs(val).toLocaleString('en-IN', { minimumFractionDigits: precision, maximumFractionDigits: precision });
}

// ─── Enrich API data with group info ─────────────────────────────────────────
export function enrichTrialBalanceData(data: any[], grpList: any[]): any[] {
  data.forEach((v: any) => {
    if (v.ISGROUP) {
      const rec = grpList.find(x => x.id == v.ID);
      if (rec) {
        v.nature = (rec.nature === 2 || rec.nature === 3) ? 'Liabilities' : (rec.nature === 1 || rec.nature === 4) ? 'Assets' : 'Other';
        v.groupInfo = rec;
        processTrialBalanceItem(v, rec);
      }
    } else {
      const parentGroup = grpList.find(x => x.id == (v.groupId || v.parentId));
      if (parentGroup) {
        v.nature = (parentGroup.nature === 2 || parentGroup.nature === 3) ? 'Liabilities' : (parentGroup.nature === 1 || parentGroup.nature === 4) ? 'Assets' : 'Other';
        v.groupInfo = parentGroup;
        processTrialBalanceItem(v, parentGroup);
      }
    }
  });
  data.sort((a, b) => {
    if (a.nature === 'Liabilities' && b.nature === 'Assets') return -1;
    if (a.nature === 'Assets' && b.nature === 'Liabilities') return 1;
    return 0;
  });
  return data;
}
