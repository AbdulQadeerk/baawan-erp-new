/**
 * Application constants migrated from Angular _appCommon.ts
 * Maps Angular's appCommon.LocalStorageKeyType and other constants
 */

// ─── Local Storage Keys ─────────────────────────────────────────────────────
// Angular: appCommon.LocalStorageKeyType
export const STORAGE_KEYS = {
  TOKEN_INFO: 'tokenInfo',
  GROUP_LIST: 'group-list',
  LEDGER_LIST: 'ledger-list',
  ITEM_LIST: 'item-list',
  USER_DATA: 'userData',
  COMPANY_DATA: 'companyData',
  COMPANY_INFO: 'company-info',
  COMPANY_ASSETS: 'company-assets',
  GSTR3B2_DATA: 'gSTR3B2Data',
  PROCESS_DISCOUNT: 'process-discount',
  PROCESS_TDS: 'process-tds',
  PROCESS_TCS: 'process-tcs',
  PROCESS_PENDINGS: 'process-pendings',
  PROCESS_ORDER_DETAILS: 'process-order-details',
  SALES_REGISTER_DATA: 'salesRegisterData',
  PURCHASE_REGISTER_DATA: 'purchaseRegisterData',
  LEDGER_OUTSTANDING_DATA: 'ledgerOustandingData',
  ITEM_REGISTER_DATA: 'itemRegisterData',
  CURRENCY_LIST: 'currencyList',
  PENDING_ITEM_BATCHES: 'pending-item-batches',
  VOUCHER_FORM_DATA: 'voucherFormData',
  USER_LOGIN_DETAIL: 'userLoginDetail',
  API_URL: 'api-url',
  APP_VERSION: 'app-version',
  THEME: 'theme',
  SESSION_ID: 'sessionId',
} as const;

// ─── API Configuration ──────────────────────────────────────────────────────
// Angular: environment.ts
export const API_CONFIG = {
  BASE_URL: 'https://api.baawanerp.com',
  STAGE_URL: 'https://stageapi.baawanerp.com',
  CR_URL: 'https://print.baawanerp.com',
  IFSC_LOOKUP_URL: 'https://ifsc.razorpay.com',
  TALLY_URL: 'http://localhost:9000',
} as const;

// Use the proxy path for client-side requests (avoids CORS)
export const API_BASE_URL = '/api-proxy';

// ─── Invoice/Voucher Type Mappings ──────────────────────────────────────────
// Angular: InvoiceVoucherTypesObj, InvoiceVoucherTypesObjByte
export const INVOICE_VOUCHER_TYPES: Record<string, string> = {
  'sales-invoice': '1',
  'sales-voucher': '1',
  'cash-invoice': '2',
  'sale-return': '3',
  'credit-note': '3',
  'sales-quotation': '4',
  'sales-order': '5',
  'performa-invoice': '6',
  'sales-chalan': '7',
  'purchase-order': '8',
  'purchase-invoice': '9',
  'purchase-voucher': '9',
  'purchase-return': '10',
  'debit-note': '10',
  'purchase-quotation': '11',
  'opening-stock': '12',
  'transfered-in-stock': '13',
  'transfered-out-stock': '14',
  'stock-adjustment': '15',
  'purchase-challan': '16',
  'payment-voucher': '17',
  'receipt-voucher': '18',
  'journal-voucher': '19',
  'contra-voucher': '20',
  'absolute-stock': '21',
  'sales-enquiry': '23',
  'payment-open-brc': '24',
  'receipt-open-brc': '25',
  'costing': '26',
  'material-slip': '27',
  'material-in': '28',
  'material-out': '29',
  'sales-challan-return': '30',
  'purchase-challan-return': '31',
  'cancel-document': '32',
};

export const INVOICE_VOUCHER_TYPES_BY_ID: Record<string, string> = {
  '1': 'Sales Invoice',
  '2': 'Cash Invoice',
  '3': 'Sale Return',
  '4': 'Sales Quotation',
  '5': 'Sales Order',
  '6': 'Performa Invoice',
  '7': 'Dispatch Note',
  '8': 'Purchase Order',
  '9': 'Purchase Invoice',
  '10': 'Purchase Return',
  '11': 'Purchase Quotation',
  '12': 'Opening Stock',
  '13': 'Transfered In Stock',
  '14': 'Transfered Out Stock',
  '16': 'Purchase Challan',
  '17': 'Payment Voucher',
  '18': 'Receipt Voucher',
  '19': 'Journal Voucher',
  '20': 'Contra Voucher',
  '21': 'Absolute Stock',
  '22': 'Opening',
  '23': 'Sales Enquiry',
  '24': 'Payment Open BRC',
  '25': 'Receipt Open BRC',
  '26': 'Costing',
  '27': 'Material Slip',
  '28': 'Material In',
  '29': 'Material Out',
  '30': 'Dispatch Note Return',
  '31': 'Purchase Challan Return',
  '32': 'Cancel Document',
};

// ─── Payment Modes ──────────────────────────────────────────────────────────
export const PAYMENT_MODES: Record<string, string> = {
  '1': 'Credit',
  '2': 'Cash',
  '3': 'Bank',
  '5': 'Card',
  '6': 'Multi',
};

// ─── Transaction Types ──────────────────────────────────────────────────────
export const TRANSACTION_TYPES: Record<string, string> = {
  '1': 'Cheque',
  '2': 'Credit Card',
  '3': 'DD',
  '4': 'Cash',
  '5': 'Bank Transfer',
  '6': 'RTGS',
  '7': 'NEFT',
  '8': 'UPI',
};
