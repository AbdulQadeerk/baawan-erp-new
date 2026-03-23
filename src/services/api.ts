import axios from 'axios';

// Mock data for fallback
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

const BASE_URL = '/api-proxy';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add X-Session-ID to headers
api.interceptors.request.use((config) => {
  const sessionId = localStorage.getItem('sessionId');
  if (sessionId && !sessionId.trim().startsWith('<!doctype') && !sessionId.trim().startsWith('<html')) {
    config.headers['X-Session-ID'] = sessionId;
  }
  return config;
});

export const authService = {
  login: async (loginData: any) => {
    console.log('Mock Login with:', loginData.userName);
    const mockSessionId = 'mock-session-id-' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('sessionId', mockSessionId);
    return { sessionId: mockSessionId, userName: loginData.userName, status: 'success' };
  },
  checkSession: async () => {
    return true;
  },
  logout: () => {
    localStorage.removeItem('sessionId');
  },
};

export const ledgerService = {
  search: async (params: any) => {
    console.log('Mock Ledger Search:', params);
    const searchText = (params.searchText || '').toLowerCase();
    return MOCK_LEDGERS.filter(l => 
      l.name.toLowerCase().includes(searchText) || 
      l.groupName.toLowerCase().includes(searchText)
    );
  },
  list: async () => {
    console.log('Mock Ledger List');
    return MOCK_LEDGERS;
  },
  create: async (ledgerData: any) => {
    console.log('Mock Ledger Create:', ledgerData);
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
    console.log('Mock Item Search:', params);
    const searchText = (params.searchText || '').toLowerCase();
    return MOCK_ITEMS.filter(i => 
      i.itemName.toLowerCase().includes(searchText) || 
      i.itemCode.toLowerCase().includes(searchText)
    );
  },
  list: async () => {
    console.log('Mock Item List');
    return MOCK_ITEMS;
  },
  create: async (itemData: any) => {
    console.log('Mock Item Create:', itemData);
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
    console.log('Mock Invoice Create:', invoiceData);
    const invoiceNo = 'INV-' + Math.floor(Math.random() * 10000);
    return { status: 'success', invoiceNo, docNo: invoiceNo };
  },
  search: async (params: any) => {
    console.log('Mock Invoice Search:', params);
    return [
      { id: '1', bill_No: 'MLCO-30008/25-26', date: '2026-03-21T09:47:00', partyName: 'Shri Parshwa Sales', refNo: '', item_SubTotal: 4300.00, grandTotal: 5074.00, billStatus: 0, salesPerson: 'Jigar Mehta' }
    ];
  },
  getVoucherDependency: async (voucherId: string) => {
    console.log('Mock Voucher Dependency:', voucherId);
    return [
      { id: '1', type: 'Enquiry', docNo: 'ENQ-2026-001', date: '2026-03-01', status: 'Converted', amount: 5000 },
      { id: '2', type: 'Sales Order', docNo: 'SO-2026-001', date: '2026-03-05', status: 'Converted', amount: 5000 },
      { id: '3', type: 'Proforma Invoice', docNo: 'PI-2026-001', date: '2026-03-10', status: 'Converted', amount: 5000 },
      { id: '4', type: 'Sales Invoice', docNo: 'MLCO-30008/25-26', date: '2026-03-21', status: 'Active', amount: 5074 },
      { id: '5', type: 'Billing/Payment', docNo: 'PAY-2026-001', date: '2026-03-22', status: 'Paid', amount: 5074 },
    ];
  },
};

export const reportService = {
  getPNL: async (params: any) => {
    console.log('Mock PNL Report:', params);
    return {
      revenue: 1250000,
      expenses: 850000,
      netProfit: 400000,
      details: []
    };
  },
  getAgeing: async (params: any) => {
    console.log('Mock Ageing Report:', params);
    return { data: [] };
  },
  getInventory: async (params: any) => {
    console.log('Mock Inventory Report:', params);
    return { data: MOCK_ITEMS };
  },
  getSalesRegister: async (params: any) => {
    console.log('Mock Sales Register:', params);
    return { data: [] };
  },
  getLedgerOutstanding: async (params: any) => {
    console.log('Mock Ledger Outstanding:', params);
    return {
      data: [
        { id: '1', partyName: 'ABC Corporation', billNo: 'INV-001', date: '2024-03-01', amount: 25000, pendingAmount: 15000 },
        { id: '2', partyName: 'XYZ Industries', billNo: 'INV-005', date: '2024-03-10', amount: 12000, pendingAmount: 12000 },
      ]
    };
  },
  getTrialBalance: async (params: any) => {
    console.log('Mock Trial Balance:', params);
    return {
      data: MOCK_LEDGERS.map(l => ({
        ...l,
        opening: l.openingBalance,
        debit: 0,
        credit: 0,
        closing: l.openingBalance
      }))
    };
  },
  getCurrentStock: async (params: any) => {
    console.log('Mock Current Stock:', params);
    return { data: MOCK_ITEMS };
  },
};

export const dashboardService = {
  getPurchaseTrend: async (params: any) => {
    console.log('Mock Purchase Trend:', params);
    return [
      { date: '2024-03-14', amount: 45000 },
      { date: '2024-03-15', amount: 32000 },
      { date: '2024-03-16', amount: 58000 },
      { date: '2024-03-17', amount: 21000 },
      { date: '2024-03-18', amount: 64000 },
      { date: '2024-03-19', amount: 48000 },
      { date: '2024-03-20', amount: 55000 },
    ];
  },
  getInventorySummary: async (params: any) => {
    console.log('Mock Inventory Summary:', params);
    return {
      totalItems: 156,
      lowStockItems: 12,
      outOfStockItems: 3,
      totalValue: 2540000
    };
  },
  getTopSellingItems: async (params: any) => {
    console.log('Mock Top Selling Items:', params);
    return [
      { name: 'Laptop Pro 15', quantity: 45, amount: 3060000 },
      { name: 'Wireless Mouse', quantity: 128, amount: 153600 },
      { name: 'Monitor 27"', quantity: 32, amount: 624000 },
    ];
  },
};

export const groupService = {
  list: async () => {
    return [
      { id: 1, name: 'Cash-in-hand' },
      { id: 2, name: 'Bank Accounts' },
      { id: 3, name: 'Indirect Expenses' },
      { id: 4, name: 'Sales Accounts' },
      { id: 5, name: 'Sundry Debtors' },
    ];
  }
};

export const brandService = {
  list: async () => {
    return [
      { id: 1, name: 'Apple' },
      { id: 2, name: 'Logitech' },
      { id: 3, name: 'Dell' },
    ];
  }
};

export const categoryService = {
  list: async () => {
    return [
      { id: 1, name: 'Electronics' },
      { id: 2, name: 'Accessories' },
      { id: 3, name: 'Peripherals' },
    ];
  }
};

export const unitService = {
  list: async () => {
    return [
      { id: 1, name: 'Nos' },
      { id: 2, name: 'Kgs' },
      { id: 3, name: 'Pcs' },
    ];
  }
};

export default api;
