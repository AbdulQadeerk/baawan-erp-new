/**
 * Shared utility functions — replaces Angular pipes:
 *   - FormatNumberValPipe → formatNumberVal
 *   - SumPipe → sumArray
 *   - SumBasedOnCrDr → sumCrDr
 *   - LocalPrecisionNumberPipe → localPrecisionNumber
 *   - GroupByPipe → groupBy
 *   - FilterPipe → filterArray
 */

/** Format a number with currency symbol and locale (en-IN) */
export const localPrecisionNumber = (
  value: number | null | undefined,
  precision: number = 2,
  currencyCode: string = 'INR'
): string => {
  if (value === null || value === undefined || isNaN(Number(value))) return '0.00';
  return Number(value).toLocaleString('en-IN', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
  });
};

/** Format number with precision, no currency symbol */
export const formatNumber = (value: number | null | undefined, precision: number = 2): string => {
  if (value === null || value === undefined || isNaN(Number(value))) return '0.00';
  return Number(value).toLocaleString('en-IN', {
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
  });
};

/** Format number value with Dr/Cr suffix (mirrors Angular FormatNumberValPipe) */
export const formatNumberVal = (
  value: number | null | undefined,
  key: string,
  rowData: any,
  precision: number = 2
): string => {
  const v = value ?? 0;
  const absVal = Math.abs(v);
  const formatted = formatNumber(absVal, precision);

  // Determine Dr/Cr from companion field
  const drCrKey = `${key}DrCr`;
  const drCr = rowData?.[drCrKey] || '';

  return drCr ? `${formatted} ${drCr}` : formatted;
};

/** Sum an array of objects by a property */
export const sumArray = (arr: any[], property: string): number => {
  if (!arr?.length) return 0;
  return arr.reduce((sum, item) => sum + (Number(item[property]) || 0), 0);
};

/** Sum with Dr/Cr logic (mirrors Angular SumBasedOnCrDr pipe) */
export const sumCrDr = (arr: any[], config: string, precision: number = 2): string => {
  if (!arr?.length) return '0.00';

  const [valKey, drCrKey] = config.split(',');
  let total = 0;

  arr.forEach((item) => {
    const val = Math.abs(Number(item[valKey]) || 0);
    const drCr = item[drCrKey];
    total += drCr === 'Cr' ? val : -val;
  });

  const absTotal = Math.abs(total);
  const suffix = total >= 0 ? 'Cr' : 'Dr';
  return `${formatNumber(absTotal, precision)} ${suffix}`;
};

/** Group an array by a property (mirrors Angular GroupByPipe) */
export const groupBy = <T extends Record<string, any>>(arr: T[], key: string): Record<string, T[]> => {
  if (!arr?.length) return {};
  return arr.reduce((groups, item) => {
    const val = String(item[key] ?? '');
    if (!groups[val]) groups[val] = [];
    groups[val].push(item);
    return groups;
  }, {} as Record<string, T[]>);
};

/** Filter an array by search text across all string fields (mirrors Angular FilterPipe) */
export const filterArray = <T extends Record<string, any>>(arr: T[], searchText: string): T[] => {
  if (!arr?.length || !searchText?.trim()) return arr || [];
  const lowerSearch = searchText.toLowerCase().trim();
  return arr.filter((item) =>
    Object.values(item).some(
      (val) => val !== null && val !== undefined && String(val).toLowerCase().includes(lowerSearch)
    )
  );
};

/** Format date (DD/MM/YYYY) */
export const formatDateDMY = (val: string | Date | null | undefined): string => {
  if (!val) return '—';
  try {
    const d = new Date(val);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch {
    return String(val);
  }
};

/** Format date (MMM DD, YYYY) */
export const formatDateFull = (val: string | Date | null | undefined): string => {
  if (!val) return '—';
  try {
    return new Date(val).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
  } catch {
    return String(val);
  }
};

/** Null-safe string display */
export const displayVal = (val: any, fallback: string = '—'): string => {
  if (val === null || val === undefined || val === '' || val === 'null' || val === 'undefined') return fallback;
  return String(val).trim();
};
