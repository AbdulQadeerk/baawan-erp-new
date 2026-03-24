/**
 * Barrel export for lib/ modules
 * 
 * Usage: import { useAuth, toast, storage, STORAGE_KEYS, authApi } from '@/src/lib';
 */

// Auth
export { AuthProvider, useAuth } from './auth-context';
export type { AuthUser, AuthCompany, LoginPayload, LoginResponse, UserLoginDetail, CompanyAsset } from './auth-types';

// API
export { authApi, commonApi, apiClient } from './api-client';

// Utilities
export { storage } from './storage';
export { toast } from './toast';
export type { ToastType, ToastMessage } from './toast';

// Constants
export { STORAGE_KEYS, API_BASE_URL, API_CONFIG, INVOICE_VOUCHER_TYPES, INVOICE_VOUCHER_TYPES_BY_ID, PAYMENT_MODES, TRANSACTION_TYPES } from './constants';
