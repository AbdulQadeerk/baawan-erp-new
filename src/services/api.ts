/**
 * API Service Layer — Backward-compatible exports
 * 
 * This file re-exports from the new lib/api-client module while maintaining
 * the same export names that existing components use (authService, ledgerService, etc.)
 * 
 * Services that haven't been migrated yet still use mock data.
 * As you migrate each feature, update the corresponding service here
 * to use apiClient.post/get from lib/api-client.
 */

import { authApi, apiClient } from '../lib/api-client';
import { storage } from '../lib/storage';
import { toast } from '../lib/toast';
import { STORAGE_KEYS } from '../lib/constants';

// ═══════════════════════════════════════════════════════════════════════════════
// AUTH SERVICE — Now uses real API (replaces mock)
// ═══════════════════════════════════════════════════════════════════════════════
export const authService = {
  login: async (loginData: { userName: string; password: string; shortcode: string }) => {
    // This is used by the Login component directly. 
    // For the full login flow with localStorage writes, use useAuth().login() instead.
    const data = await authApi.login({
      username: loginData.userName,
      password: loginData.password,
      shortcode: loginData.shortcode,
    });
    return data;
  },

  checkSession: async () => {
    const tokenInfo = storage.getItem<any>(STORAGE_KEYS.TOKEN_INFO);
    const sessionId = tokenInfo?.user?.currentSessionId;
    if (!sessionId) return false;
    try {
      await authApi.checkSession(sessionId);
      return true;
    } catch {
      return false;
    }
  },

  logout: () => {
    storage.removeItem(STORAGE_KEYS.TOKEN_INFO);
    toast.success('You have been logged out.', 'Success');
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// SERVICES THAT STILL USE MOCK DATA (to be migrated later)
// Keep these so existing components don't break
// ═══════════════════════════════════════════════════════════════════════════════

const MOCK_LEDGERS = [
  { id: '1', name: 'Cash in Hand', ledgerName: 'Cash in Hand', groupName: 'Cash-in-hand', openingBalance: 5000, balanceType: 'Dr' },
  { id: '2', name: 'HDFC Bank', ledgerName: 'HDFC Bank', groupName: 'Bank Accounts', openingBalance: 125000, balanceType: 'Dr' },
  { id: '3', name: 'Office Rent', ledgerName: 'Office Rent', groupName: 'Indirect Expenses', openingBalance: 0, balanceType: 'Dr' },
  { id: '4', name: 'Sales Account', ledgerName: 'Sales Account', groupName: 'Sales Accounts', openingBalance: 0, balanceType: 'Cr' },
  { id: '5', name: 'ABC Corporation', ledgerName: 'ABC Corporation', groupName: 'Sundry Debtors', openingBalance: 45000, balanceType: 'Dr', gstNo: '27AAAAA0000A1Z5' },
];

const MOCK_ITEMS = [
  { id: '1', itemName: 'Laptop Pro 15', itemCode: 'ITM001', hsnCode: '8471', mrp: 75000, sellRate: 68000, gstPercentage: 18, stock: 15 },
  { id: '2', itemName: 'Wireless Mouse', itemCode: 'ITM002', hsnCode: '8471', mrp: 1500, sellRate: 1200, gstPercentage: 18, stock: 45 },
  { id: '3', itemName: 'Monitor 27"', itemCode: 'ITM003', hsnCode: '8471', mrp: 22000, sellRate: 19500, gstPercentage: 18, stock: 8 },
  { id: '4', itemName: 'Keyboard Mechanical', itemCode: 'ITM004', hsnCode: '8471', mrp: 4500, sellRate: 3800, gstPercentage: 18, stock: 22 },
];

export const ledgerService = {
  search: async (params: any) => {
    const searchText = (params.searchText || '').toLowerCase();
    return MOCK_LEDGERS.filter(l => 
      l.name.toLowerCase().includes(searchText) || 
      l.groupName.toLowerCase().includes(searchText)
    );
  },
  list: async () => MOCK_LEDGERS,
  create: async (ledgerData: any) => {
    const newLedger = {
      ...ledgerData,
      id: Math.random().toString(36).substr(2, 9),
      name: ledgerData.ledgerName || ledgerData.name || 'New Ledger'
    };
    return { status: 'success', data: newLedger, sentPayload: ledgerData };
  },
};

export const itemService = {
  search: async (params: any) => {
    const searchText = (params.searchText || '').toLowerCase();
    return MOCK_ITEMS.filter(i => 
      i.itemName.toLowerCase().includes(searchText) || 
      i.itemCode.toLowerCase().includes(searchText)
    );
  },
  list: async () => MOCK_ITEMS,
  create: async (itemData: any) => {
    const newItem = {
      ...itemData,
      id: Math.random().toString(36).substr(2, 9),
      itemName: itemData.itemName || itemData.ItemName || 'New Item'
    };
    return { status: 'success', data: newItem, sentPayload: itemData };
  },
};

export const invoiceService = {
  create: async (invoiceData: any) => {
    const invoiceNo = 'INV-' + Math.floor(Math.random() * 10000);
    return { status: 'success', invoiceNo, docNo: invoiceNo };
  },
  search: async (params: any) => {
    return [
      { id: '1', bill_No: 'MLCO-30008/25-26', date: '2026-03-21T09:47:00', partyName: 'Shri Parshwa Sales', refNo: '', item_SubTotal: 4300.00, grandTotal: 5074.00, billStatus: 0, salesPerson: 'Jigar Mehta' }
    ];
  },
  getVoucherDependency: async (voucherId: string) => {
    return [
      { id: '1', type: 'Enquiry', docNo: 'ENQ-2026-001', date: '2026-03-01', status: 'Converted', amount: 5000 },
      { id: '2', type: 'Sales Order', docNo: 'SO-2026-001', date: '2026-03-05', status: 'Converted', amount: 5000 },
    ];
  },
};

export const reportService = {
  getPNL: async (params: any) => ({ revenue: 1250000, expenses: 850000, netProfit: 400000, details: [] }),
  getAgeing: async (params: any) => ({ data: [] }),
  getInventory: async (params: any) => ({ data: MOCK_ITEMS }),
  getSalesRegister: async (params: any) => ({ data: [] }),
  getLedgerOutstanding: async (params: any) => ({
    data: [
      { id: '1', partyName: 'ABC Corporation', billNo: 'INV-001', date: '2024-03-01', amount: 25000, pendingAmount: 15000 },
      { id: '2', partyName: 'XYZ Industries', billNo: 'INV-005', date: '2024-03-10', amount: 12000, pendingAmount: 12000 },
    ]
  }),
  getTrialBalance: async (params: any) => ({
    data: MOCK_LEDGERS.map(l => ({ ...l, opening: l.openingBalance, debit: 0, credit: 0, closing: l.openingBalance }))
  }),
  getCurrentStock: async (params: any) => ({ data: MOCK_ITEMS }),
};

export const dashboardService = {
  getPurchaseTrend: async (params: any) => [
    { date: '2024-03-14', amount: 45000 },
    { date: '2024-03-15', amount: 32000 },
    { date: '2024-03-16', amount: 58000 },
    { date: '2024-03-17', amount: 21000 },
    { date: '2024-03-18', amount: 64000 },
    { date: '2024-03-19', amount: 48000 },
    { date: '2024-03-20', amount: 55000 },
  ],
  getInventorySummary: async (params: any) => ({
    totalItems: 156, lowStockItems: 12, outOfStockItems: 3, totalValue: 2540000
  }),
  getTopSellingItems: async (params: any) => [
    { name: 'Laptop Pro 15', quantity: 45, amount: 3060000 },
    { name: 'Wireless Mouse', quantity: 128, amount: 153600 },
    { name: 'Monitor 27"', quantity: 32, amount: 624000 },
  ],
};

// Group Service — now uses real API (migrated from Angular GroupServiceService)
export { groupApi as groupService } from './group.service';

export const brandService = {
  list: async () => [
    { id: 1, name: 'Apple' },
    { id: 2, name: 'Logitech' },
    { id: 3, name: 'Dell' },
  ]
};

export const categoryService = {
  list: async () => [
    { id: 1, name: 'Electronics' },
    { id: 2, name: 'Accessories' },
    { id: 3, name: 'Peripherals' },
  ]
};

export const unitService = {
  list: async () => [
    { id: 1, name: 'Nos' },
    { id: 2, name: 'Kgs' },
    { id: 3, name: 'Pcs' },
  ]
};

// Re-export the api client as default for direct use
export { apiClient } from '../lib/api-client';
export default apiClient;
