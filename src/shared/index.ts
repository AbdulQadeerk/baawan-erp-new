/**
 * Shared Module — Barrel Export
 *
 * React equivalent of Angular's SharedModule (shared.module.ts).
 * Import from '@/shared' to access all shared components, hooks, and utilities.
 */

// ─── Modals ──────────────────────────────────────────────────────────────────
export { ConfirmationModal } from './ConfirmationModal';
export { CommonModal } from './CommonModal';
export { ItemDetailsModal } from './ItemDetailsModal';
export { LedgerDetailsModal } from './LedgerDetailsModal';
export { VoucherDetailsModal } from './VoucherDetailsModal';
export { PrintViewModal } from './PrintViewModal';
export { ImagePreviewModal } from './ImagePreviewModal';
export { LocationSelectionListModal } from './LocationSelectionListModal';
export { QuickLedgerUpdateModal } from './QuickLedgerUpdateModal';

// ─── Selection Components ──────────────────────────────────────────────────
export { CommonAutocompleteTemplate } from './CommonAutocompleteTemplate';
export { LedgerSelection } from './LedgerSelection';
export { ItemSelection } from './ItemSelection';
export { GroupSelection } from './GroupSelection';
export { ItemClassificationSelection } from './ItemClassificationSelection';
export { ItemFileUpload } from './ItemFileUpload';
export { PendingVoucherSelection } from './PendingVoucherSelection';
export { DateRangeSelector } from './DateRangeSelector';
export { SearchLedger } from './SearchLedger';

// ─── AG Grid Extensions ──────────────────────────────────────────────────────
export * from './AgCustomControls';

// ─── UI Components ───────────────────────────────────────────────────────────
export { Loader } from './Loader';
export { AppAccordion } from './AppAccordion';
export { OutstandingView } from './OutstandingView';

// ─── Utility Functions (replaces Angular pipes) ─────────────────────────────
export {
  localPrecisionNumber,
  formatNumber,
  formatNumberVal,
  sumArray,
  sumCrDr,
  groupBy,
  filterArray,
  formatDateDMY,
  formatDateFull,
  displayVal,
} from './utils/formatters';

// ─── Hooks (replaces Angular directives) ────────────────────────────────────
export {
  usePermission,
  useDecimalPrecision,
  useCompanyInfo,
  useCountryVisibility,
} from './hooks/useShared';

// ─── Service Utilities ──────────────────────────────────────────────────────
export {
  getClassificationParents,
  getGroupChildren,
  checkGroupIdExists,
  verifyGroup,
} from './shared.service';
