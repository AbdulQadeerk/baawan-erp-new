export type Page = 
  | 'dashboard' 
  | 'invoice-list' 
  | 'invoice-create' 
  | 'outstanding-report'
  | 'bom-list'
  | 'currency-list'
  | 'extra-charge-list'
  | 'group-create'
  | 'item-create'
  | 'item-list'
  | 'item-category-create'
  | 'item-category-list'
  | 'ledger-create'
  | 'ledger-list'
  | 'ledger-target-list'
  | 'ledger-target-create'
  | 'project-site-list'
  | 'project-site-create'
  | 'sales-person-list'
  | 'stock-place-list'
  | 'terms-list'
  | 'terms-create'
  | 'unit-list'
  | 'user-list'
  | 'role-list'
  | 'bill-wise-drilldown'
  | 'receipt-voucher-create'
  | 'lot-batch-summary'
  | 'ledger-outstanding-list'
  | 'bi-dashboard'
  | 'currency-create'
  | 'extra-charge-create'
  | 'user-create'
  | 'project-site-list'
  | 'project-site-create'
  | 'bom-create'
  | 'group-list'
  | 'sales-person-create'
  | 'stock-place-create'
  | 'unit-create'
  | 'receipt-voucher-list'
  | 'receipt-voucher-create'
  | 'payment-voucher-list'
  | 'payment-voucher-create'
  | 'purchase-invoice-list'
  | 'purchase-invoice-create'
  | 'aging-analysis'
  | 'profit-loss'
  | 'trial-balance-report'
  | 'current-stock-report'
  | 'inventory-movement-analysis'
  | 'item-stock-ledger'
  | 'chart-of-accounts'
  | 'bom-builder'
  | 'permissions-matrix'
  | 'balance-sheet'
  | 'inventory-report'
  | 'stock-valuation-report'
  | 'sales-register-tax'
  | 'sales-margin-report'
  | 'sales-commission-report'
  | 'sales-order-summary'
  | 'item-register-report'
  | 'item-batch-register'
  | 'lot-batch-summary'
  | 'process-order-report'
  | 'schedule-report'
  | 'schedule-to-invoice'
  | 'multiple-ledger-outstanding'
  | 'pending-report'
  | 'supplier-wise-pending';

export type SplitMode = 'single' | 'split-v' | 'split-h' | 'quad' | 'three-left';

export interface Tab {
  id: string;
  type: Page;
  title: string;
  closable: boolean;
}

export interface BOM {
  id: string;
  name: string;
  itemCode: string;
  itemName: string;
  category: string;
  size: string;
  type: string;
  brand: string;
  taxPercent: number;
  sellRate: number;
  unit: string;
}

export interface Currency {
  id: string;
  name: string;
  code: string;
  symbol: string;
}

export interface ExtraCharge {
  id: string;
  name: string;
  taxType: string;
  taxPercent: number;
  ledger: string;
}

export interface Group {
  id: string;
  name: string;
  parent: string;
  nature: string;
  type: string;
  modifiedDate: string;
}

export interface Item {
  id: string;
  code: string;
  name: string;
  brand: string;
  category: string;
  rate: number;
  unit: string;
  hsn: string;
  gstPercent: number;
  image?: string;
}

export interface SalesPerson {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
}

export interface StockPlace {
  id: string;
  name: string;
  code: string;
  address: string;
  area: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
}

export interface TermCondition {
  id: string;
  title: string;
  text: string;
  status: 'Active' | 'Pending';
}

export interface Unit {
  id: string;
  name: string;
  category: string;
  shortName: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  designation: string;
  mobile: string;
  email: string;
  loginName: string;
}

export interface UserRole {
  id: string;
  name: string;
  description: string;
  memberCount: number;
}

export interface OutstandingLedger {
  id: string;
  name: string;
  group: string;
  areaCity: string;
  mobile: string;
  creditLimit: number;
  outstanding: number;
  status: 'within-limit' | 'exceeded';
}

export interface Invoice {
  id: string;
  docNo: string;
  date: string;
  time: string;
  partyName: string;
  refNo: string;
  taxableValue: number;
  grandTotal: number;
  status: 'pending' | 'completed' | 'gst-not-updated';
}

export interface InvoiceItem {
  id: string;
  particulars: string;
  hsn: string;
  qty: number;
  unit: string;
  rate: number;
  gstPercent: number;
  amount: number;
  description?: string;
}

export interface Activity {
  id: string;
  type: 'info' | 'warning' | 'success';
  message: string;
  time: string;
}

export interface RecentItem {
  id: string;
  docNo: string;
  type: string;
  time: string;
}

export interface Ledger {
  id: string;
  name: string;
  address: string;
  city: string;
  area: string;
  mobile: string;
  group?: string;
  gstin?: string;
  pincode?: string;
  state?: string;
  parentCompany?: string;
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
  ifscCode?: string;
  email?: string;
  salesPerson?: string;
  pan?: string;
  gstCategory?: string;
  openingBal?: number;
  openingBalType?: 'Dr' | 'Cr';
  openingDate?: string;
  creditLimit?: number;
  outstanding?: number;
}

export interface LedgerTransaction {
  id: string;
  date: string;
  docNo: string;
  refNo: string;
  taxableValue: number;
  grandTotal: number;
}

export interface BillWiseDrilldown {
  id: string;
  billDate: string;
  billNo: string;
  dueDate: string;
  overdueDays: number | 'Not Due';
  billAmount: number;
  adjusted: number;
  balance: number;
}

export interface BatchSummary {
  id: string;
  itemCode: string;
  itemName: string;
  brand: string;
  batchNo: string;
  mfgDate: string;
  expDate: string;
  openingQty: number;
  inwardQty: number;
  outwardQty: number;
  closingQty: number;
  status?: 'expired' | 'expiring-soon';
}

export interface ProjectSite {
  id: string;
  name: string;
  address: string;
  area: string;
  city: string;
  state: string;
  phone1: string;
  phone2: string;
  gstNo: string;
  contactPerson: string;
}
