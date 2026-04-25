/**
 * Custom React hooks replacing Angular directives:
 *   - IsGrantedDirective → usePermission
 *   - DecimalPrecisionDirective → useDecimalPrecision
 *   - ShowForCountryDirective / HideForCountryDirective → useCountryVisibility
 */
import { useMemo } from 'react';
import { useAuth } from '../../lib/auth-context';

/**
 * usePermission — Replaces Angular's IsGrantedDirective
 * Checks if the current user has a specific permission.
 *
 * Angular: permissionManagerService.isGranted(permissionId)
 *
 * Usage: const canDelete = usePermission(11);
 */
export const usePermission = (permissionId: number): boolean => {
  const { getTokenInfo } = useAuth();

  return useMemo(() => {
    try {
      const tokenInfo = getTokenInfo();
      const permissions = tokenInfo?.user?.permissions || [];
      if (Array.isArray(permissions)) {
        return permissions.some((p: any) => p === permissionId || p.id === permissionId || p.permissionId === permissionId);
      }
      return false;
    } catch {
      return false;
    }
  }, [getTokenInfo, permissionId]);
};

/**
 * useDecimalPrecision — Replaces Angular's DecimalPrecisionDirective
 * Returns the company's configured decimal precision.
 *
 * Usage: const precision = useDecimalPrecision();
 */
export const useDecimalPrecision = (): number => {
  const { company } = useAuth();
  return company?.precision ?? 2;
};

/**
 * useCompanyInfo — Returns company info from auth token
 *
 * Usage: const { precision, taxType, baseCurrency } = useCompanyInfo();
 */
export const useCompanyInfo = () => {
  const { company } = useAuth();

  return useMemo(() => ({
    precision: company?.precision ?? 2,
    taxType: company?.taxType,
    baseCurrency: company?.baseCurrency,
    companyName: company?.compName || '',
    isTaxTypeVAT: company?.taxType === 1,
    taxLabel: company?.taxType === 1 ? 'VAT%' : 'GST%',
    taxNumberLabel: company?.taxType === 1 ? 'TRN' : 'GSTIN',
  }), [company]);
};

/**
 * useCountryVisibility — Replaces ShowForCountry / HideForCountry directives
 *
 * Usage:
 *   const { showForCountry, hideForCountry } = useCountryVisibility();
 *   if (showForCountry('IN')) { ... }
 */
export const useCountryVisibility = () => {
  const { company } = useAuth();
  const countryCode = (company as any)?.countryCode || 'IN';

  return useMemo(() => ({
    countryCode,
    showForCountry: (code: string) => countryCode === code,
    hideForCountry: (code: string) => countryCode !== code,
  }), [countryCode]);
};
