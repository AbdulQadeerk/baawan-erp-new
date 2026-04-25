import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './lib/auth-context';
import { ToastContainer } from './components/ToastContainer';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { InvoiceList } from './components/InvoiceList';
import { InvoiceForm } from './components/InvoiceForm';
import { InvoicePreview } from './components/InvoicePreview';
import { StockModal } from './components/StockModal';
import { WidgetLibrary } from './components/WidgetLibrary';
import { TabBar } from './components/TabBar';
import { OutstandingReport } from './components/OutstandingReport';
import { BOMList } from './components/masters/BOMList';
import { BOMCreate } from './components/masters/BOMCreate';
import { CurrencyList } from './components/masters/currency/CurrencyList';
import { CurrencyCreate } from './components/masters/currency/CurrencyCreate';
import type { CurrencyRecord } from './services/currency.service';
import { ExtraChargeList } from './components/masters/extra-charge/ExtraChargeList';
import { ExtraChargeCreate } from './components/masters/extra-charge/ExtraChargeCreate';
import type { ExtraChargeRecord } from './services/extra-charge.service';
import { GroupCreate } from './components/masters/group/GroupCreate';
import { GroupList } from './components/masters/group/GroupList';
import type { GroupRecord } from './services/group.service';
import { ItemCreate } from './components/masters/ItemCreate';
import { ItemList } from './components/masters/ItemList';
import { ItemCategoryCreate } from './components/masters/item-category/ItemCategoryCreate';
import { ItemCategoryList } from './components/masters/item-category/ItemCategoryList';
import type { ItemCategoryRecord } from './services/item-category.service';
import { LedgerCreate } from './components/masters/LedgerCreate';
import { LedgerList } from './components/masters/LedgerList';
import { LedgerTargetList } from './components/masters/ledger-target/LedgerTargetList';
import { LedgerTargetCreate } from './components/masters/ledger-target/LedgerTargetCreate';
import { ProjectSiteList } from './components/masters/project-site/ProjectSiteList';
import { ProjectSiteCreate } from './components/masters/project-site/ProjectSiteCreate';
import type { ProjectSiteRecord } from './services/project-site.service';
import { SalesPersonList } from './components/masters/sales-person/SalesPersonList';
import { SalesPersonCreate } from './components/masters/sales-person/SalesPersonCreate';
import type { SalesPersonRecord } from './services/sales-person.service';
import { StockPlaceList } from './components/masters/stock-place/StockPlaceList';
import { StockPlaceCreate } from './components/masters/stock-place/StockPlaceCreate';
import type { StockPlaceRecord } from './services/stock-place.service';
import { TermsList } from './components/masters/terms-condition/TermsList';
import { TermsCreate } from './components/masters/terms-condition/TermsCreate';
import type { TermsConditionRecord } from './services/terms-condition.service';
import { UnitList } from './components/masters/unit/UnitList';
import { UnitCreate } from './components/masters/unit/UnitCreate';
import type { UnitRecord } from './services/unit.service';
import { UserList } from './components/masters/UserList';
import { UserCreate } from './components/masters/UserCreate';
import { UserRoleList } from './components/masters/UserRoleList';
import { ReceiptVoucherList } from './components/masters/ReceiptVoucherList';
import { ReceiptVoucherCreate } from './components/masters/ReceiptVoucherCreate';
import { PaymentVoucherList } from './components/masters/PaymentVoucherList';
import { PaymentVoucherCreate } from './components/masters/PaymentVoucherCreate';
import { PurchaseInvoiceList } from './components/PurchaseInvoiceList';
import { PurchaseInvoiceForm } from './components/PurchaseInvoiceForm';
import { AgingAnalysisReport } from './components/AgingAnalysisReport';
import { ProfitLossReport } from './components/ProfitLossReport';
import { BillWiseDrilldownScreen } from './components/BillWiseDrilldown';
import { LotBatchSummary } from './components/LotBatchSummary';
import { LedgerOutstandingList } from './components/LedgerOutstandingList';
import { TrialBalanceReport } from './components/TrialBalanceReport';
import { CurrentStockReport } from './components/reports/current-stock/CurrentStockReport';
import { ReceiptVoucherForm } from './components/ReceiptVoucherForm';
import { BIDashboard } from './components/BIDashboard';
import { InventoryMovementAnalysis } from './components/InventoryMovementAnalysis';
import { ItemStockLedger } from './components/ItemStockLedger';
import { ChartOfAccounts } from './components/ChartOfAccounts';
import { BOMBuilder } from './components/BOMBuilder';
import { PermissionsMatrix } from './components/PermissionsMatrix';
import { BalanceSheet } from './components/BalanceSheet';
import { InventoryReport } from './components/reports/inventory-report/InventoryReport';
import { StockValuationReport } from './components/StockValuationReport';
import { SalesRegisterTax } from './components/SalesRegisterTax';
import { SalesMarginReport } from './components/SalesMarginReport';
import { SalesCommissionReport } from './components/SalesCommissionReport';
import { SalesOrderSummaryReport } from './components/SalesOrderSummaryReport';
import { ItemRegisterReport } from './components/reports/item-register/ItemRegisterReport';
import { ItemBatchRegister } from './components/ItemBatchRegister';
import { ProcessOrderReport } from './components/ProcessOrderReport';
import { ScheduleReport } from './components/ScheduleReport';
import { ScheduleToInvoice } from './components/ScheduleToInvoice';
import { MultipleLedgerOutstanding } from './components/MultipleLedgerOutstanding';
import { PendingReport } from './components/reports/pending-report/PendingReport';
import { SupplierWisePendingReport } from './components/reports/supplier-wise-pending/SupplierWisePendingReport';
import { Login } from './components/Login';
import { Page, Tab, SplitMode } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { FileText, Package, Loader2, Maximize2 } from 'lucide-react';

function AppContent() {
  const { isAuthenticated, isLoading: isCheckingAuth, logout } = useAuth();

  const [tabs, setTabs] = useState<Tab[]>([
    { id: 'dashboard', type: 'dashboard', title: 'Dashboard', closable: false }
  ]);
  const [activeTabId, setActiveTabId] = useState('dashboard');
  const [splitMode, setSplitMode] = useState<SplitMode>('single');
  const [paneActiveTabIds, setPaneActiveTabIds] = useState<string[]>(['dashboard']);
  const [focusedPaneIndex, setFocusedPaneIndex] = useState(0);
  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') === 'dark');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [isWidgetLibraryOpen, setIsWidgetLibraryOpen] = useState(false);
  const [editGroupId, setEditGroupId] = useState<number | null>(null);
  const [pendingGroupSave, setPendingGroupSave] = useState<{ record: GroupRecord; isUpdate: boolean } | null>(null);
  const [editExtraChargeId, setEditExtraChargeId] = useState<number | null>(null);
  const [pendingExtraChargeSave, setPendingExtraChargeSave] = useState<{ record: ExtraChargeRecord; isUpdate: boolean } | null>(null);
  const [editStockPlaceId, setEditStockPlaceId] = useState<number | null>(null);
  const [pendingStockPlaceSave, setPendingStockPlaceSave] = useState<{ record: StockPlaceRecord; isUpdate: boolean } | null>(null);
  const [editUnitId, setEditUnitId] = useState<number | null>(null);
  const [pendingUnitSave, setPendingUnitSave] = useState<{ record: UnitRecord; isUpdate: boolean } | null>(null);
  const [editCurrencyId, setEditCurrencyId] = useState<number | null>(null);
  const [pendingCurrencySave, setPendingCurrencySave] = useState<{ record: CurrencyRecord; isUpdate: boolean } | null>(null);
  const [editSalesPersonId, setEditSalesPersonId] = useState<number | null>(null);
  const [pendingSalesPersonSave, setPendingSalesPersonSave] = useState<{ record: SalesPersonRecord; isUpdate: boolean } | null>(null);
  const [editItemCategoryId, setEditItemCategoryId] = useState<number | null>(null);
  const [pendingItemCategorySave, setPendingItemCategorySave] = useState<{ record: ItemCategoryRecord; isUpdate: boolean } | null>(null);
  const [editLedgerTargetId, setEditLedgerTargetId] = useState<number | null>(null);
  const [pendingLedgerTargetSave, setPendingLedgerTargetSave] = useState<{ record: any; isUpdate: boolean } | null>(null);
  const [editProjectSiteId, setEditProjectSiteId] = useState<number | null>(null);
  const [pendingProjectSiteSave, setPendingProjectSiteSave] = useState<{ record: ProjectSiteRecord; isUpdate: boolean } | null>(null);
  const [editTermsId, setEditTermsId] = useState<number | null>(null);
  const [pendingTermsSave, setPendingTermsSave] = useState<{ record: TermsConditionRecord; isUpdate: boolean } | null>(null);

  // Handle dark mode
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  // Listen for custom events to open modals from anywhere
  useEffect(() => {
    const handleOpenPreview = () => setIsPreviewOpen(true);
    const handleOpenStock = () => setIsStockModalOpen(true);
    const handleOpenWidgetLibrary = () => setIsWidgetLibraryOpen(true);

    window.addEventListener('open-invoice-preview', handleOpenPreview);
    window.addEventListener('open-stock-modal', handleOpenStock);
    window.addEventListener('open-widget-library', handleOpenWidgetLibrary);

    return () => {
      window.removeEventListener('open-invoice-preview', handleOpenPreview);
      window.removeEventListener('open-stock-modal', handleOpenStock);
      window.removeEventListener('open-widget-library', handleOpenWidgetLibrary);
    };
  }, []);

  // Scroll to top whenever active tab changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [activeTabId]);

  const addTab = (type: Page, title: string) => {
    // Check if tab already exists by type and title
    const existingTab = tabs.find(t => t.type === type && t.title === title);
    if (existingTab) {
      if (splitMode === 'single') {
        setActiveTabId(existingTab.id);
      } else {
        const newPaneIds = [...paneActiveTabIds];
        newPaneIds[focusedPaneIndex] = existingTab.id;
        setPaneActiveTabIds(newPaneIds);
      }
      return;
    }

    const newTab: Tab = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      title,
      closable: true
    };
    setTabs([...tabs, newTab]);
    
    if (splitMode === 'single') {
      setActiveTabId(newTab.id);
    } else {
      const newPaneIds = [...paneActiveTabIds];
      newPaneIds[focusedPaneIndex] = newTab.id;
      setPaneActiveTabIds(newPaneIds);
    }
  };

  const handleTabSwitch = (id: string) => {
    if (splitMode === 'single') {
      setActiveTabId(id);
    } else {
      const newPaneIds = [...paneActiveTabIds];
      newPaneIds[focusedPaneIndex] = id;
      setPaneActiveTabIds(newPaneIds);
    }
  };

  const handleSplitChange = (mode: SplitMode) => {
    setSplitMode(mode);
    if (mode === 'single') {
      setActiveTabId(paneActiveTabIds[0]);
    } else {
      let newPaneIds = [...paneActiveTabIds];
      const paneCount = mode === 'quad' ? 4 : (mode === 'three-left' ? 3 : 2);
      
      // Fill missing panes with existing tabs or dashboard
      while (newPaneIds.length < paneCount) {
        const nextTab = tabs.find(t => !newPaneIds.includes(t.id)) || tabs[0];
        newPaneIds.push(nextTab.id);
      }
      // Trim extra panes
      newPaneIds = newPaneIds.slice(0, paneCount);
      setPaneActiveTabIds(newPaneIds);
      setFocusedPaneIndex(0);
    }
  };

  const removeTab = (id: string) => {
    const tabToRemove = tabs.find(t => t.id === id);
    if (!tabToRemove || !tabToRemove.closable) return;

    const newTabs = tabs.filter(t => t.id !== id);
    setTabs(newTabs);
    
    if (activeTabId === id) {
      // Switch to the last tab if the active one was closed
      setActiveTabId(newTabs[newTabs.length - 1].id);
    }
  };

  const renderTabContent = (tab: Tab) => {
    switch (tab.type) {
      case 'dashboard':
        return <Dashboard onModuleClick={(type, title) => addTab(type, title)} />;
      case 'invoice-list':
        return <InvoiceList onCreateInvoice={() => addTab('invoice-create', 'New Invoice')} />;
      case 'invoice-create':
        return <InvoiceForm onBack={() => removeTab(tab.id)} />;
      case 'outstanding-report':
        return <OutstandingReport />;
      case 'bom-list':
        return <BOMList onCreateNew={() => addTab('bom-create', 'Create BOM')} />;
      case 'bom-create':
        return <BOMCreate onBack={() => removeTab(tab.id)} />;
      case 'currency-list':
        return (
          <CurrencyList
            onCreateNew={() => {
              setEditCurrencyId(null);
              addTab('currency-create', 'Create Currency');
            }}
            onEdit={(id: number) => {
              setEditCurrencyId(id);
              addTab('currency-create', 'Edit Currency');
            }}
            pendingSave={pendingCurrencySave}
            onPendingSaveConsumed={() => setPendingCurrencySave(null)}
          />
        );
      case 'currency-create':
        return (
          <CurrencyCreate
            editId={editCurrencyId}
            onBack={() => {
              setEditCurrencyId(null);
              removeTab(tab.id);
            }}
            onSaved={(record, isUpdate) => {
              setEditCurrencyId(null);
              setPendingCurrencySave({ record, isUpdate });
            }}
          />
        );
      case 'extra-charge-list':
        return (
          <ExtraChargeList
            onCreateNew={() => {
              setEditExtraChargeId(null);
              addTab('extra-charge-create', 'Create Extra Charge');
            }}
            onEdit={(id: number) => {
              setEditExtraChargeId(id);
              addTab('extra-charge-create', 'Edit Extra Charge');
            }}
            pendingSave={pendingExtraChargeSave}
            onPendingSaveConsumed={() => setPendingExtraChargeSave(null)}
          />
        );
      case 'extra-charge-create':
        return (
          <ExtraChargeCreate
            editId={editExtraChargeId}
            onBack={() => {
              setEditExtraChargeId(null);
              removeTab(tab.id);
            }}
            onSaved={(record, isUpdate) => {
              setEditExtraChargeId(null);
              setPendingExtraChargeSave({ record, isUpdate });
            }}
          />
        );
      case 'group-create':
        return (
          <GroupCreate
            editId={editGroupId}
            onBack={() => {
              setEditGroupId(null);
              removeTab(tab.id);
            }}
            onSaved={(record, isUpdate) => {
              setEditGroupId(null);
              setPendingGroupSave({ record, isUpdate });
            }}
          />
        );
      case 'group-list':
        return (
          <GroupList
            onCreateNew={() => {
              setEditGroupId(null);
              addTab('group-create', 'Create Group');
            }}
            onEdit={(id: number) => {
              setEditGroupId(id);
              addTab('group-create', 'Edit Group');
            }}
            pendingSave={pendingGroupSave}
            onPendingSaveConsumed={() => setPendingGroupSave(null)}
          />
        );
      case 'item-create':
        return <ItemCreate onBack={() => removeTab(tab.id)} />;
      case 'item-list':
        return <ItemList onCreateNew={() => addTab('item-create', 'Create Item')} />;
      case 'item-category-list':
        return (
          <ItemCategoryList
            onCreateNew={() => {
              setEditItemCategoryId(null);
              addTab('item-category-create', 'Create Item Rate Category');
            }}
            onEdit={(id: number) => {
              setEditItemCategoryId(id);
              addTab('item-category-create', 'Edit Item Rate Category');
            }}
            pendingSave={pendingItemCategorySave}
            onPendingSaveConsumed={() => setPendingItemCategorySave(null)}
          />
        );
      case 'item-category-create':
        return (
          <ItemCategoryCreate
            editId={editItemCategoryId}
            onBack={() => {
              setEditItemCategoryId(null);
              removeTab(tab.id);
            }}
            onSaved={(record, isUpdate) => {
              setEditItemCategoryId(null);
              setPendingItemCategorySave({ record, isUpdate });
            }}
          />
        );
      case 'ledger-create':
        return <LedgerCreate onBack={() => removeTab(tab.id)} />;
      case 'ledger-list':
        return <LedgerList onCreateNew={() => addTab('ledger-create', 'Create Ledger')} />;
      case 'ledger-target-list':
        return (
          <LedgerTargetList
            onCreateNew={() => {
              setEditLedgerTargetId(null);
              addTab('ledger-target-create', 'Create Ledger Targets');
            }}
            onEdit={(id: number) => {
              setEditLedgerTargetId(id);
              addTab('ledger-target-create', 'Edit Ledger Targets');
            }}
            pendingSave={pendingLedgerTargetSave}
            onPendingSaveConsumed={() => setPendingLedgerTargetSave(null)}
          />
        );
      case 'ledger-target-create':
        return (
          <LedgerTargetCreate
            editId={editLedgerTargetId}
            onBack={() => {
              setEditLedgerTargetId(null);
              removeTab(tab.id);
            }}
            onSaved={(record, isUpdate) => {
              setEditLedgerTargetId(null);
              setPendingLedgerTargetSave({ record, isUpdate });
            }}
          />
        );
      case 'project-site-list':
        return (
          <ProjectSiteList
            onCreateNew={() => {
              setEditProjectSiteId(null);
              addTab('project-site-create', 'Create Project Site');
            }}
            onEdit={(id: number) => {
              setEditProjectSiteId(id);
              addTab('project-site-create', 'Edit Project Site');
            }}
            pendingSave={pendingProjectSiteSave}
            onPendingSaveConsumed={() => setPendingProjectSiteSave(null)}
          />
        );
      case 'project-site-create':
        return (
          <ProjectSiteCreate
            editId={editProjectSiteId}
            onBack={() => {
              setEditProjectSiteId(null);
              removeTab(tab.id);
            }}
            onSaved={(record, isUpdate) => {
              setEditProjectSiteId(null);
              setPendingProjectSiteSave({ record, isUpdate });
            }}
          />
        );
      case 'sales-person-list':
        return (
          <SalesPersonList
            onCreateNew={() => {
              setEditSalesPersonId(null);
              addTab('sales-person-create', 'Create Sales Person');
            }}
            onEdit={(id: number) => {
              setEditSalesPersonId(id);
              addTab('sales-person-create', 'Edit Sales Person');
            }}
            pendingSave={pendingSalesPersonSave}
            onPendingSaveConsumed={() => setPendingSalesPersonSave(null)}
          />
        );
      case 'sales-person-create':
        return (
          <SalesPersonCreate
            editId={editSalesPersonId}
            onBack={() => {
              setEditSalesPersonId(null);
              removeTab(tab.id);
            }}
            onSaved={(record, isUpdate) => {
              setEditSalesPersonId(null);
              setPendingSalesPersonSave({ record, isUpdate });
            }}
          />
        );
      case 'stock-place-list':
        return (
          <StockPlaceList
            onCreateNew={() => {
              setEditStockPlaceId(null);
              addTab('stock-place-create', 'Create Stock Place');
            }}
            onEdit={(id: number) => {
              setEditStockPlaceId(id);
              addTab('stock-place-create', 'Edit Stock Place');
            }}
            pendingSave={pendingStockPlaceSave}
            onPendingSaveConsumed={() => setPendingStockPlaceSave(null)}
          />
        );
      case 'stock-place-create':
        return (
          <StockPlaceCreate
            editId={editStockPlaceId}
            onBack={() => {
              setEditStockPlaceId(null);
              removeTab(tab.id);
            }}
            onSaved={(record, isUpdate) => {
              setEditStockPlaceId(null);
              setPendingStockPlaceSave({ record, isUpdate });
            }}
          />
        );
      case 'terms-list':
        return (
          <TermsList
            onCreateNew={() => {
              setEditTermsId(null);
              addTab('terms-create', 'Create Terms & Conditions');
            }}
            onEdit={(id: number) => {
              setEditTermsId(id);
              addTab('terms-create', 'Edit Terms & Conditions');
            }}
            pendingSave={pendingTermsSave}
            onPendingSaveConsumed={() => setPendingTermsSave(null)}
          />
        );
      case 'terms-create':
        return (
          <TermsCreate
            editId={editTermsId}
            onBack={() => {
              setEditTermsId(null);
              removeTab(tab.id);
            }}
            onSaved={(record, isUpdate) => {
              setEditTermsId(null);
              setPendingTermsSave({ record, isUpdate });
            }}
          />
        );
      case 'unit-list':
        return (
          <UnitList
            onCreateNew={() => {
              setEditUnitId(null);
              addTab('unit-create', 'Create Unit');
            }}
            onEdit={(id: number) => {
              setEditUnitId(id);
              addTab('unit-create', 'Edit Unit');
            }}
            pendingSave={pendingUnitSave}
            onPendingSaveConsumed={() => setPendingUnitSave(null)}
          />
        );
      case 'unit-create':
        return (
          <UnitCreate
            editId={editUnitId}
            onBack={() => {
              setEditUnitId(null);
              removeTab(tab.id);
            }}
            onSaved={(record, isUpdate) => {
              setEditUnitId(null);
              setPendingUnitSave({ record, isUpdate });
            }}
          />
        );
      case 'user-list':
        return <UserList onCreateNew={() => addTab('user-create', 'Create User')} />;
      case 'user-create':
        return <UserCreate onBack={() => removeTab(tab.id)} />;
      case 'project-site-list':
        return <ProjectSiteList onCreateNew={() => addTab('project-site-create', 'Create Project Site')} />;
      case 'project-site-create':
        return <ProjectSiteCreate onBack={() => removeTab(tab.id)} />;
      case 'receipt-voucher-list':
        return <ReceiptVoucherList onCreateNew={() => addTab('receipt-voucher-create', 'New Receipt Voucher')} />;
      case 'receipt-voucher-create':
        return <ReceiptVoucherCreate onBack={() => removeTab(tab.id)} />;
      case 'payment-voucher-list':
        return <PaymentVoucherList onCreateNew={() => addTab('payment-voucher-create', 'New Payment Voucher')} />;
      case 'payment-voucher-create':
        return <PaymentVoucherCreate onBack={() => removeTab(tab.id)} />;
      case 'purchase-invoice-list':
        return <PurchaseInvoiceList onCreateInvoice={() => addTab('purchase-invoice-create', 'New Purchase Invoice')} />;
      case 'purchase-invoice-create':
        return <PurchaseInvoiceForm onBack={() => removeTab(tab.id)} />;
      case 'aging-analysis':
        return <AgingAnalysisReport />;
      case 'profit-loss':
        return <ProfitLossReport />;
      case 'role-list':
        return <UserRoleList />;
      case 'bill-wise-drilldown':
        return <BillWiseDrilldownScreen />;
      case 'lot-batch-summary':
        return <LotBatchSummary />;
      case 'ledger-outstanding-list':
        return <LedgerOutstandingList />;
      case 'trial-balance-report':
        return <TrialBalanceReport />;
      case 'current-stock-report':
        return <CurrentStockReport />;
      case 'receipt-voucher-create':
        return <ReceiptVoucherForm />;
      case 'bi-dashboard':
        return <BIDashboard />;
      case 'inventory-movement-analysis':
        return <InventoryMovementAnalysis />;
      case 'item-stock-ledger':
        return <ItemStockLedger />;
      case 'chart-of-accounts':
        return <ChartOfAccounts />;
      case 'bom-builder':
        return <BOMBuilder />;
      case 'permissions-matrix':
        return <PermissionsMatrix />;
      case 'balance-sheet':
        return <BalanceSheet />;
      case 'inventory-report':
        return <InventoryReport />;
      case 'stock-valuation-report':
        return <StockValuationReport />;
      case 'sales-register-tax':
        return <SalesRegisterTax />;
      case 'sales-margin-report':
        return <SalesMarginReport />;
      case 'sales-commission-report':
        return <SalesCommissionReport />;
      case 'sales-order-summary':
        return <SalesOrderSummaryReport />;
      case 'item-register-report':
        return <ItemRegisterReport />;
      case 'item-batch-register':
        return <ItemBatchRegister />;
      case 'process-order-report':
        return <ProcessOrderReport />;
      case 'schedule-report':
        return <ScheduleReport onConvertToInvoice={() => addTab('schedule-to-invoice', 'Schedule to Invoice')} />;
      case 'schedule-to-invoice':
        return <ScheduleToInvoice />;
      case 'multiple-ledger-outstanding':
        return <MultipleLedgerOutstanding />;
      case 'pending-report':
        return <PendingReport />;
      case 'supplier-wise-pending':
        return <SupplierWisePendingReport />;
      default:
        return <Dashboard />;
    }
  };

  const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0];

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-200 selection:bg-primary/20 selection:text-primary">
      <Header 
        currentPage={activeTab.type} 
        setCurrentPage={(page) => {
          const titles: Record<Page, string> = {
            'dashboard': 'Dashboard',
            'invoice-list': 'Invoice List',
            'invoice-create': 'New Invoice',
            'outstanding-report': 'Outstanding Report',
            'bom-list': 'BOM Master',
            'bom-create': 'Create BOM',
            'currency-list': 'Currency Master',
            'currency-create': 'Create Currency',
            'extra-charge-list': 'Extra Charge Master',
            'extra-charge-create': 'Create Extra Charge',
            'group-create': 'Create Group',
            'group-list': 'Group Master',
            'item-create': 'Create Item',
            'item-list': 'Item Master',
            'item-category-list': 'Item Rate Category List',
            'item-category-create': 'Create Item Rate Category',
            'ledger-create': 'Create Ledger',
            'ledger-list': 'Ledger Master',
            'ledger-target-list': 'Ledger Targets',
            'ledger-target-create': 'Create Ledger Targets',
            'project-site-list': 'Project Site Master',
            'project-site-create': 'Create Project Site',
            'sales-person-list': 'Sales Person Master',
            'sales-person-create': 'Create Sales Person',
            'stock-place-list': 'Stock Place Master',
            'stock-place-create': 'Create Stock Place',
            'terms-list': 'Terms & Conditions',
            'terms-create': 'Create Terms & Conditions',
            'unit-list': 'Unit Master',
            'unit-create': 'Create Unit',
            'user-list': 'User Master',
            'user-create': 'Create User',
            'role-list': 'User Role Master',
            'bill-wise-drilldown': 'Bill-wise Drilldown',
            'ledger-outstanding-list': 'Ledger Outstanding',
            'receipt-voucher-create': 'New Receipt Voucher',
            'bi-dashboard': 'Business Intelligence',
            'receipt-voucher-list': 'Receipt Vouchers',
            'payment-voucher-list': 'Payment Vouchers',
            'payment-voucher-create': 'New Payment Voucher',
            'purchase-invoice-list': 'Purchase Invoice',
            'purchase-invoice-create': 'New Purchase Invoice',
            'aging-analysis': 'Aging Analysis Detail',
            'profit-loss': 'Profit & Loss Statement',
            'trial-balance-report': 'Trial Balance Report',
            'current-stock-report': 'Current Stock Report',
            'inventory-movement-analysis': 'Inventory Movement Analysis',
            'item-stock-ledger': 'Item Stock Ledger',
            'chart-of-accounts': 'Chart of Accounts',
            'bom-builder': 'BOM Assembly Builder',
            'permissions-matrix': 'Permissions Matrix',
            'balance-sheet': 'Balance Sheet',
            'inventory-report': 'Inventory Report',
            'stock-valuation-report': 'Stock Valuation Report',
            'sales-register-tax': 'Sales Register with Tax',
            'sales-margin-report': 'Sales Margin Report',
            'sales-commission-report': 'Sales Commission & Performance',
            'sales-order-summary': 'Sales Order Summary',
            'item-register-report': 'Item Register',
            'item-batch-register': 'Item Batch Register',
            'lot-batch-summary': 'Lot / Batch Summary',
            'process-order-report': 'Process Order Report',
            'schedule-report': 'Schedule Report',
            'schedule-to-invoice': 'Schedule to Invoice',
            'multiple-ledger-outstanding': 'Multiple Ledger Outstanding',
            'pending-report': 'Pending Report',
            'supplier-wise-pending': 'Purchase Invoice Adjustment Report'
          };
          addTab(page, titles[page]);
        }} 
        isDark={isDark} 
        toggleDark={() => setIsDark(!isDark)} 
        onLogout={logout}
        splitMode={splitMode}
        onSplitChange={handleSplitChange}
      />
      
      <TabBar 
        tabs={tabs} 
        activeTabId={splitMode === 'single' ? activeTabId : paneActiveTabIds[focusedPaneIndex]} 
        onTabSwitch={handleTabSwitch} 
        onTabClose={removeTab} 
      />

      <main className="pb-20 px-4">
        {splitMode === 'single' ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTabId}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.15 }}
            >
              {renderTabContent(activeTab)}
            </motion.div>
          </AnimatePresence>
        ) : (
          <div className={`grid gap-4 h-[calc(100vh-180px)] ${
            splitMode === 'split-v' ? 'grid-cols-2' : 
            splitMode === 'split-h' ? 'grid-rows-2' : 
            splitMode === 'quad' ? 'grid-cols-2 grid-rows-2' : 
            'grid-cols-3'
          }`}>
            {paneActiveTabIds.map((tabId, index) => {
              const tab = tabs.find(t => t.id === tabId) || tabs[0];
              const isFocused = focusedPaneIndex === index;
              
              return (
                <div 
                  key={index}
                  onClick={() => setFocusedPaneIndex(index)}
                  className={`relative border-2 rounded-2xl overflow-hidden transition-all duration-300 bg-white dark:bg-slate-900 shadow-sm ${
                    isFocused ? 'border-primary ring-4 ring-primary/10' : 'border-slate-200 dark:border-slate-800'
                  } ${
                    splitMode === 'three-left' && index === 0 ? 'col-span-2 row-span-2' : ''
                  }`}
                >
                  <div className={`absolute top-0 left-0 right-0 h-1 z-10 ${isFocused ? 'bg-primary' : 'bg-transparent'}`} />
                  <div className="h-full overflow-auto p-4 custom-scrollbar">
                    <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{tab.title}</span>
                      {isFocused && <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />}
                    </div>
                    {renderTabContent(tab)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Global Modals */}
      <InvoicePreview 
        isOpen={isPreviewOpen} 
        onClose={() => setIsPreviewOpen(false)} 
      />
      
      <StockModal 
        isOpen={isStockModalOpen} 
        onClose={() => setIsStockModalOpen(false)} 
      />

      <WidgetLibrary 
        isOpen={isWidgetLibraryOpen} 
        onClose={() => setIsWidgetLibraryOpen(false)} 
      />

      {/* Floating Action Button for Demo */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-40">
        <button 
          onClick={() => setIsPreviewOpen(true)}
          className="w-12 h-12 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full shadow-xl flex items-center justify-center text-slate-600 dark:text-slate-300 hover:scale-110 transition-transform group"
          title="Preview Last Invoice"
        >
          <FileText size={20} className="group-hover:text-brand-red transition-colors" />
        </button>
        <button 
          onClick={() => setIsStockModalOpen(true)}
          className="w-12 h-12 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full shadow-xl flex items-center justify-center text-slate-600 dark:text-slate-300 hover:scale-110 transition-transform group"
          title="Check Stock"
        >
          <Package size={20} className="group-hover:text-blue-500 transition-colors" />
        </button>
      </div>
      <ToastContainer />
    </div>
  );
}

// Wrap the app with AuthProvider
function App() {
  return (
    <AuthProvider>
      <AppContent />
      <ToastContainer />
    </AuthProvider>
  );
}

export default App;
