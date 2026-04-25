import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  List, 
  MapPin, 
  Search, 
  UploadCloud, 
  CheckCircle2, 
  Trash2,
  ChevronDown,
  Info,
  PackageSearch,
  CheckCircle,
  Receipt,
  User,
  Wallet,
  Barcode,
  Tag,
  PlusCircle,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { motion } from 'motion/react';
import { InvoiceItem, Ledger } from '../types';
import { AddItemModal } from './AddItemModal';
import { LedgerSearchModal } from './LedgerSearchModal';
import { AddLedgerModal } from './AddLedgerModal';
import { invoiceService, ledgerService, itemService } from '../services/api';

interface InvoiceFormProps {
  onBack: () => void;
}

export const InvoiceForm: React.FC<InvoiceFormProps> = ({ onBack }) => {
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [isLedgerModalOpen, setIsLedgerModalOpen] = useState(false);
  const [isAddLedgerModalOpen, setIsAddLedgerModalOpen] = useState(false);
  
  const [ledgers, setLedgers] = useState<Ledger[]>([]);
  const [isLoadingLedgers, setIsLoadingLedgers] = useState(false);
  const [selectedLedger, setSelectedLedger] = useState<Ledger | null>(null);
  const [ledgerSearchQuery, setLedgerSearchQuery] = useState('');
  const [showLedgerResults, setShowLedgerResults] = useState(false);

  const [inventoryItems, setInventoryItems] = useState<any[]>([]);
  const [isLoadingItems, setIsLoadingItems] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const [formData, setFormData] = useState({
    billDate: new Date().toISOString().split('T')[0],
    docNo: '',
    poNo: '',
    poDate: '',
    supplyTo: '',
    salesPerson: '',
    shipAddress: '',
    stockPlace: 'Head Office (HO)',
    projectSite: ''
  });

  useEffect(() => {
    fetchLedgers();
    fetchItems();
  }, []);

  const fetchLedgers = async () => {
    setIsLoadingLedgers(true);
    try {
      console.log('Fetching ledgers...');
      const data = await ledgerService.list();
      console.log('Ledgers data received:', data);
      const mappedLedgers: Ledger[] = Array.isArray(data) ? data.map((ledger: any) => ({
        id: ledger.id,
        name: ledger.ledgerName || ledger.name || '',
        address: ledger.address || '',
        city: ledger.city || '',
        area: ledger.area || '',
        mobile: ledger.mobile || '',
        parentCompany: ledger.groupName || '',
        gstin: ledger.gstNo || ledger.gstin || '',
        openingDate: ledger.openingDate || '',
        pan: ledger.pan || '',
      })) : [];
      setLedgers(mappedLedgers);
    } catch (err) {
      console.error('Error fetching ledgers:', err);
    } finally {
      setIsLoadingLedgers(false);
    }
  };

  const fetchItems = async () => {
    setIsLoadingItems(true);
    try {
      console.log('Fetching items...');
      const data = await itemService.list();
      console.log('Items data received:', data);
      setInventoryItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching items:', err);
    } finally {
      setIsLoadingItems(false);
    }
  };

  const filteredLedgers = ledgers.filter(ledger => 
    ledger.name.toLowerCase().includes(ledgerSearchQuery.toLowerCase()) ||
    (ledger.mobile && ledger.mobile.toLowerCase().includes(ledgerSearchQuery.toLowerCase()))
  );
  
  // State for the item currently being built
  const [currentItem, setCurrentItem] = useState({
    id: '',
    name: '',
    sku: '',
    hsn: '',
    qty: 1,
    unit: 'PCS',
    rate: 0,
    gstPercent: 18
  });

  const filteredResults = inventoryItems.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (item.code && item.code.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const highlightText = (text: string, query: string) => {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) => 
          part.toLowerCase() === query.toLowerCase() ? (
            <span key={i} className="text-blue-500 font-bold">{part}</span>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  const selectItem = (item: any) => {
    setCurrentItem({
      ...currentItem,
      id: item.id || '',
      name: item.name,
      sku: item.code || item.sku || '',
      hsn: item.hsn || '',
      unit: item.unit || 'PCS',
      rate: item.rate || 0,
      gstPercent: item.gstPercent || 18
    });
    setSearchQuery(item.name);
    setShowResults(false);
  };

  const handleAddItem = () => {
    if (!currentItem.name) return;

    const newItem: InvoiceItem = {
      id: currentItem.id || Math.random().toString(36).substr(2, 9),
      particulars: currentItem.name,
      hsn: currentItem.hsn,
      qty: currentItem.qty,
      unit: currentItem.unit,
      rate: currentItem.rate,
      gstPercent: currentItem.gstPercent,
      amount: currentItem.qty * currentItem.rate,
    };
    setItems([...items, newItem]);
    
    // Reset builder
    setCurrentItem({
      id: '',
      name: '',
      sku: '',
      hsn: '',
      qty: 1,
      unit: 'PCS',
      rate: 0,
      gstPercent: 18
    });
    setSearchQuery('');
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const subTotal = items.reduce((acc, item) => acc + item.amount, 0);
  const totalTax = items.reduce((acc, item) => acc + (item.amount * item.gstPercent / 100), 0);
  const grandTotal = subTotal + totalTax;

  const handleCreateInvoice = async () => {
    if (!selectedLedger) {
      setSaveStatus({ type: 'error', message: 'Please select a ledger first.' });
      return;
    }
    if (items.length === 0) {
      setSaveStatus({ type: 'error', message: 'Please add at least one item.' });
      return;
    }

    setIsSaving(true);
    setSaveStatus(null);

    try {
      console.log('Creating invoice with data:', { ledger: selectedLedger, items, formData });
      const invoiceData = {
        id: 0,
        inv_Type: 0,
        spCode: 0,
        ledger_ID: parseInt(selectedLedger.id) || 0,
        gstType: 0,
        invoiceNo: 0,
        bill_No: formData.docNo || `INV-${Date.now()}`,
        date: new Date(formData.billDate).toISOString(),
        useInCompany: true,
        refNo: "",
        refDate: new Date().toISOString(),
        orderNo: formData.poNo || "",
        orderDate: formData.poDate ? new Date(formData.poDate).toISOString() : new Date().toISOString(),
        projectSiteId: 0,
        projectSiteAddress: formData.projectSite || "",
        invoiceItemDetail: items.map((item, index) => {
          const itemTax = (item.amount * item.gstPercent) / 100;
          return {
            id: 0,
            invDetID: 0,
            sno: index + 1,
            item_ID: parseInt(item.id) || 0,
            sp_Code: 0,
            mfrItemName: item.particulars,
            invType: 0,
            std_Qty: item.qty,
            conv_Qty: item.qty,
            conv_Unit: 0,
            std_Rate: item.rate,
            conv_Rate: item.rate,
            vatPer: item.gstPercent,
            discount1: 0,
            discount2: 0,
            amount: item.amount,
            cost_Rate: 0,
            itemDescription: item.particulars,
            inventoryMoved: 0,
            invoiceItemSubDetail: [],
            invoiceItemPendingPO: [],
            invoiceSupplyInfo: [],
            invoiceItemBatches: [],
            rateDiscount: 0,
            discount3: 0,
            landing: 0,
            mrp: 0,
            profit: 0,
            cgstPer: item.gstPercent / 2,
            cgstAmt: itemTax / 2,
            sgstPer: item.gstPercent / 2,
            sgstAmt: itemTax / 2,
            igstPer: 0,
            igstAmt: 0,
            hsn: item.hsn,
            scheduleDate: new Date().toISOString(),
            rateAfterVat: item.rate * (1 + item.gstPercent / 100),
            priceCategoryID: 0,
            units: item.unit,
            unittext: item.unit,
            itempcs: "",
            priceCategoryText: "",
            sp_text: "",
            particular: item.particulars,
            conversion: 1,
            itemRow: "",
            ledger: selectedLedger.name,
            currentStck: 0,
            itemImagePath: "",
            batchDetails: "",
            unitConsumed: ""
          };
        }),
        invoiceExtraCharges: [],
        invoiceTncMap: [],
        item_SubTotal: subTotal,
        extra_SubTotal: 0,
        grandTotal: grandTotal,
        roundOff: 0,
        shipToName: selectedLedger.name,
        shipToAddress: formData.shipAddress || selectedLedger.address,
        partyName: selectedLedger.name,
        partyAddress: selectedLedger.address,
        attenTo: "",
        subject: "",
        recBy: "",
        recAmt: 0,
        dueDays: 15,
        footerXML: [],
        isMaxVAT: true,
        isRoundOff: true,
        precision: 2,
        profit: 0,
        profitPer: 0,
        billStatus: 0,
        refPerson: "",
        refPersonNo: "",
        baseCurrency: 0,
        convertedCurrency: 0,
        convertedRate: 0,
        convertedGrandTotal: 0,
        subsidiaryOption: 0,
        schemePointValue: 0,
        quotationByUserID: 0,
        orderByUserID: 0,
        salesByUserID: 0,
        preparedByUserID: 0,
        approvedByUserID: 0,
        loginByUserID: 0,
        referenceByUserID: 0,
        regVehicleNumber: "",
        regChassisNumber: "",
        jobCardNumber: "",
        state: formData.supplyTo,
        custName: "",
        custMobile: "",
        custEmail: "",
        custRemarks: "",
        note: "",
        ewayNote: "",
        supplierPONo: "",
        supplierPODate: new Date().toISOString(),
        inwardDate: new Date().toISOString(),
        expenseLedgerId: 0,
        orderByID: 0,
        isTaxInclusive: false,
        isIGST: false,
        isReverseCharge: false,
        isTCS: false,
        tcsPer: 0,
        tcsAmt: 0,
        isTDS: false,
        tdsPer: 0,
        tdsAmt: 0,
        isEWayBill: false,
        eWayBillNo: "",
        eWayBillDate: new Date().toISOString(),
        isEInvoice: false,
        irn: "",
        qrCode: "",
        ackNo: "",
        ackDate: new Date().toISOString(),
        isCancelled: false,
        cancelReason: "",
        cancelDate: new Date().toISOString(),
        isDeleted: false,
        deleteReason: "",
        deleteDate: new Date().toISOString(),
        createdDate: new Date().toISOString(),
        modifiedDate: new Date().toISOString(),
        createdBy: 0,
        modifiedBy: 0,
        branchId: 0,
        companyId: 0,
        financialYearId: 0
      };

      console.log('Sending payload:', JSON.stringify(invoiceData, null, 2));
      const result = await invoiceService.create(invoiceData) as any;
      setSaveStatus({ type: 'success', message: `Invoice created successfully! Doc No: ${result.docNo || 'N/A'}` });
      
      // Optional: Reset form or navigate back after success
      setTimeout(() => {
        onBack();
      }, 2000);

    } catch (err: any) {
      console.error('Error creating invoice:', err);
      setSaveStatus({ type: 'error', message: err.response?.data?.message || 'Failed to create invoice. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-[1600px] mx-auto p-6 space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Create New Sales Invoice</h1>
          <p className="text-sm text-slate-500">Draft your sales documents with precision</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft size={18} /> Back
          </button>
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-brand-emerald rounded-lg hover:opacity-90 transition-opacity">
            <Save size={18} /> Save Draft
          </button>
        </div>
      </div>

      {/* Main Form Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transaction Details */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Receipt size={20} className="text-brand-emerald" />
            <h2 className="font-semibold text-slate-700 dark:text-slate-200">Transaction Details</h2>
          </div>
          <div className="space-y-4">
            <div className="relative">
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Ledger Name</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input 
                    className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-brand-emerald focus:border-brand-emerald text-sm px-3 py-2 outline-none" 
                    placeholder="Select or search ledger..." 
                    type="text"
                    value={ledgerSearchQuery}
                    onChange={(e) => {
                      setLedgerSearchQuery(e.target.value);
                      setShowLedgerResults(e.target.value.length > 0);
                    }}
                    onFocus={() => ledgerSearchQuery.length > 0 && setShowLedgerResults(true)}
                  />
                  
                  {showLedgerResults && (
                    <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl z-[60] overflow-hidden">
                      <div className="max-h-[340px] overflow-y-auto custom-scrollbar">
                        {isLoadingLedgers ? (
                          <div className="p-8 text-center">
                            <Loader2 className="animate-spin mx-auto text-slate-400 mb-2" size={24} />
                            <p className="text-xs text-slate-500">Loading ledgers...</p>
                          </div>
                        ) : filteredLedgers.length === 0 ? (
                          <div className="p-8 text-center">
                            <p className="text-xs text-slate-500 italic">No ledgers found matching "{ledgerSearchQuery}"</p>
                          </div>
                        ) : (
                          filteredLedgers.map((ledger, i) => (
                            <div 
                              key={i}
                              onClick={() => {
                                setSelectedLedger(ledger);
                                setLedgerSearchQuery(ledger.name);
                                setShowLedgerResults(false);
                                setFormData({ ...formData, shipAddress: ledger.address || '', salesPerson: ledger.salesPerson || '' });
                              }}
                              className={`p-3 border-b border-slate-100 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
                                selectedLedger?.id === ledger.id ? 'bg-emerald-50/50 dark:bg-emerald-900/20 border-l-4 border-brand-emerald' : ''
                              }`}
                            >
                              <div className="flex justify-between items-start mb-1">
                                <span className="text-sm font-bold text-slate-800 dark:text-white">
                                  {highlightText(ledger.name, ledgerSearchQuery)}
                                </span>
                                {ledger.outstanding !== undefined && (
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                    ledger.creditLimit && ledger.outstanding > ledger.creditLimit ? 'text-red-500 bg-red-500/10' : 'text-brand-emerald bg-emerald-500/10'
                                  }`}>
                                    ₹{ledger.outstanding.toLocaleString()} O/S
                                  </span>
                                )}
                              </div>
                              <div className="flex gap-3 text-[11px] text-slate-500 dark:text-slate-400">
                                <span className="flex items-center gap-1">
                                  <MapPin size={14} className="opacity-50" /> {ledger.city || 'No City'}
                                </span>
                                {ledger.gstin && (
                                  <span className="flex items-center gap-1">
                                    <Tag size={14} className="opacity-50" /> GST: {ledger.gstin}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                      <button 
                        onClick={() => setIsAddLedgerModalOpen(true)}
                        className="w-full p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2 text-brand-emerald font-bold text-xs hover:bg-emerald-500/5 transition-colors"
                      >
                        <PlusCircle size={16} /> Add New Ledger to Master
                      </button>
                    </div>
                  )}
                </div>
                <button 
                  onClick={() => setIsAddLedgerModalOpen(true)}
                  className="bg-brand-emerald text-white p-2 rounded-lg hover:opacity-90"
                >
                  <Plus size={18} />
                </button>
                <button 
                  onClick={() => setIsLedgerModalOpen(true)}
                  className="bg-slate-100 dark:bg-slate-700 p-2 rounded-lg hover:bg-slate-200"
                >
                  <List size={18} />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Stock Place</label>
                <select 
                  value={formData.stockPlace}
                  onChange={(e) => setFormData({ ...formData, stockPlace: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-sm px-3 py-2 outline-none"
                >
                  <option>Head Office (HO)</option>
                  <option>Warehouse A</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Bill Date</label>
                <input 
                  className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-sm px-3 py-2 outline-none" 
                  type="date" 
                  value={formData.billDate}
                  onChange={(e) => setFormData({ ...formData, billDate: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Doc No.</label>
                <input 
                  className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-sm px-3 py-2 outline-none" 
                  placeholder="INV-2026-001" 
                  type="text"
                  value={formData.docNo}
                  onChange={(e) => setFormData({ ...formData, docNo: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Project Site</label>
                <div className="flex gap-2">
                  <input 
                    className="flex-1 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-sm px-3 py-2 outline-none" 
                    placeholder="Select Site" 
                    type="text"
                    value={formData.projectSite}
                    onChange={(e) => setFormData({ ...formData, projectSite: e.target.value })}
                  />
                  <button className="bg-brand-emerald/10 text-brand-emerald p-2 rounded-lg hover:bg-brand-emerald/20"><MapPin size={18} /></button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Information */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <User size={20} className="text-blue-500" />
            <h2 className="font-semibold text-slate-700 dark:text-slate-200">Customer Information</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">PO Number</label>
              <input 
                className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-sm px-3 py-2 outline-none" 
                placeholder="Enter PO No" 
                type="text"
                value={formData.poNo}
                onChange={(e) => setFormData({ ...formData, poNo: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">PO Date</label>
              <input 
                className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-sm px-3 py-2 outline-none" 
                type="date"
                value={formData.poDate}
                onChange={(e) => setFormData({ ...formData, poDate: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Supply To</label>
              <select 
                value={formData.supplyTo}
                onChange={(e) => setFormData({ ...formData, supplyTo: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-sm px-3 py-2 outline-none"
              >
                <option value="">Select State</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Delhi">Delhi</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Sales Person</label>
              <select 
                value={formData.salesPerson}
                onChange={(e) => setFormData({ ...formData, salesPerson: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-sm px-3 py-2 outline-none"
              >
                <option value="">Select Sales Person</option>
                <option value="John Doe">John Doe</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Ship Address</label>
            <textarea 
              className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-sm px-3 py-2 outline-none resize-none" 
              placeholder="Full delivery address..." 
              rows={2}
              value={formData.shipAddress}
              onChange={(e) => setFormData({ ...formData, shipAddress: e.target.value })}
            ></textarea>
          </div>
        </div>
      </div>

      {/* Item Builder */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-visible">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            <div className="md:col-span-4 relative">
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Item Description</label>
              <div className="flex gap-2">
                <input 
                  className="flex-1 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 rounded-lg text-sm px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" 
                  placeholder="Search item by name or SKU" 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowResults(e.target.value.length > 0);
                  }}
                  onFocus={() => searchQuery.length > 0 && setShowResults(true)}
                />
                <button 
                  onClick={() => setIsAddItemModalOpen(true)}
                  className="bg-blue-500 text-white px-3 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center"
                  title="Add New Item to Master"
                >
                  <Plus size={18} />
                </button>
                <button className="bg-brand-emerald text-white px-3 rounded-lg hover:opacity-90 transition-opacity">
                  <Search size={18} />
                </button>
              </div>
              
              {showResults && (
                <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl z-[60] overflow-hidden">
                  <div className="max-h-[340px] overflow-y-auto custom-scrollbar">
                    {isLoadingItems ? (
                      <div className="p-8 text-center">
                        <Loader2 className="animate-spin mx-auto text-slate-400 mb-2" size={24} />
                        <p className="text-xs text-slate-500">Loading items...</p>
                      </div>
                    ) : filteredResults.length === 0 ? (
                      <div className="p-8 text-center">
                        <p className="text-xs text-slate-500 italic">No items found matching "{searchQuery}"</p>
                      </div>
                    ) : (
                      filteredResults.map((res, i) => (
                        <div 
                          key={i}
                          onClick={() => selectItem(res)}
                          className={`p-3 border-b border-slate-100 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
                            currentItem.name === res.name ? 'bg-blue-50/50 dark:bg-blue-900/20 border-l-4 border-blue-500' : ''
                          }`}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <span className="text-sm font-bold text-slate-800 dark:text-white">
                              {highlightText(res.name, searchQuery)}
                            </span>
                            {res.stock !== undefined && (
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                res.stock > 20 ? 'text-brand-emerald bg-emerald-500/10' :
                                res.stock > 0 ? 'text-amber-500 bg-amber-500/10' :
                                'text-red-500 bg-red-500/10'
                              }`}>
                                {res.stock > 0 ? `${res.stock} available` : 'Out of Stock'}
                              </span>
                            )}
                          </div>
                          <div className="flex gap-3 text-[11px] text-slate-500 dark:text-slate-400">
                            <span className="flex items-center gap-1">
                              <Barcode size={14} className="opacity-50" /> SKU: {highlightText(res.code || res.sku || 'N/A', searchQuery)}
                            </span>
                            {res.hsn && (
                              <span className="flex items-center gap-1">
                                <Tag size={14} className="opacity-50" /> HSN: {res.hsn}
                              </span>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <button 
                    onClick={() => setIsAddItemModalOpen(true)}
                    className="w-full p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2 text-brand-emerald font-bold text-xs hover:bg-emerald-500/5 transition-colors"
                  >
                    <PlusCircle size={16} /> Add New Item to Master List
                  </button>
                </div>
              )}
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Qty <span className="text-red-500">*</span></label>
              <input 
                className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-sm px-3 py-2 outline-none text-center focus:ring-2 focus:ring-brand-emerald/20" 
                type="number" 
                value={currentItem.qty}
                onChange={(e) => setCurrentItem({ ...currentItem, qty: Number(e.target.value) })}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Rate <span className="text-red-500">*</span></label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">₹</span>
                <input 
                  className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-sm pl-7 pr-3 py-2 outline-none focus:ring-2 focus:ring-brand-emerald/20" 
                  placeholder="0.00" 
                  type="number"
                  value={currentItem.rate || ''}
                  onChange={(e) => setCurrentItem({ ...currentItem, rate: Number(e.target.value) })}
                />
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Disc (%)</label>
              <input className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-sm px-3 py-2 outline-none text-center focus:ring-2 focus:ring-brand-emerald/20" placeholder="0" type="number"/>
            </div>
            <div className="md:col-span-2 flex gap-2">
              <button 
                onClick={handleAddItem}
                className="flex-1 bg-brand-emerald text-white py-2 rounded-lg font-medium flex items-center justify-center gap-2 hover:opacity-90 shadow-md shadow-emerald-500/10 active:scale-95 transition-all"
              >
                <PlusCircle size={18} /> Add
              </button>
              <button className="bg-slate-100 dark:bg-slate-700 p-2 rounded-lg hover:bg-slate-200 text-slate-600 dark:text-slate-300 transition-colors">
                <UploadCloud size={18} />
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 uppercase text-[11px] font-semibold tracking-wider">
              <tr>
                <th className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 w-12 text-center">#</th>
                <th className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">Particulars</th>
                <th className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 w-24">HSN</th>
                <th className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 w-24 text-center">Qty</th>
                <th className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 w-24 text-center">Unit</th>
                <th className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 w-32 text-right">Rate</th>
                <th className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 w-24 text-center">GST %</th>
                <th className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 w-32 text-right">Amount</th>
                <th className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 w-16 text-center"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {items.length === 0 ? (
                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="px-6 py-12 text-center text-slate-400 italic" colSpan={9}>
                    <div className="flex flex-col items-center gap-2">
                      <PackageSearch size={40} className="opacity-20" />
                      <span>No items added yet. Search above to begin.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                items.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="px-6 py-4 text-center text-slate-500">{idx + 1}</td>
                    <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-200">{item.particulars}</td>
                    <td className="px-6 py-4 text-slate-500">{item.hsn}</td>
                    <td className="px-6 py-4 text-center">{item.qty}</td>
                    <td className="px-6 py-4 text-center">{item.unit}</td>
                    <td className="px-6 py-4 text-right">₹{item.rate.toLocaleString()}</td>
                    <td className="px-6 py-4 text-center">{item.gstPercent}%</td>
                    <td className="px-6 py-4 text-right font-bold">₹{item.amount.toLocaleString()}</td>
                    <td className="px-6 py-4 text-center">
                      <button onClick={() => removeItem(item.id)} className="text-slate-400 hover:text-red-500 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="bg-emerald-500/5 dark:bg-emerald-500/10 grid grid-cols-2 md:grid-cols-4 px-6 py-4 gap-6">
          <div>
            <span className="text-[10px] text-slate-500 font-bold uppercase block">Total Qty</span>
            <span className="text-lg font-bold text-slate-700 dark:text-slate-200">{items.reduce((acc, item) => acc + item.qty, 0)}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 font-bold uppercase block">Total GST</span>
            <span className="text-lg font-bold text-slate-700 dark:text-slate-200">₹{totalTax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 font-bold uppercase block">Net Total</span>
            <span className="text-lg font-bold text-slate-700 dark:text-slate-200">₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex items-center justify-end">
            <button className="bg-blue-500 text-white px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 hover:opacity-90">
              <PackageSearch size={16} /> Check Stock
            </button>
          </div>
        </div>
      </div>

      {/* Footer Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Wallet size={18} className="text-amber-500" />
                <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-200">Extra Charges</h3>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input className="flex-1 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-sm px-3 py-2 outline-none" placeholder="Discount Reason" type="text"/>
                  <div className="relative w-32">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs">₹</span>
                    <input className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-sm pl-5 pr-3 py-2 outline-none text-right" placeholder="0.00" type="number"/>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Sub Total</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">₹{subTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <input defaultChecked className="rounded text-brand-emerald focus:ring-brand-emerald w-4 h-4" type="checkbox"/>
                  <span className="text-slate-500">Round Off</span>
                </div>
                <span className="font-semibold text-slate-800 dark:text-slate-200">₹0.00</span>
              </div>
              <div className="border-t border-slate-200 dark:border-slate-700 pt-3 flex justify-between items-center">
                <span className="text-base font-bold text-slate-700 dark:text-slate-200">Grand Total</span>
                <span className="text-xl font-black text-brand-emerald">₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Info size={18} className="text-blue-500" />
              <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-200">Notes & Remarks</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <textarea className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-sm px-3 py-2 outline-none resize-none" placeholder="Public notes (appears on invoice)..." rows={3}></textarea>
              <textarea className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-sm px-3 py-2 outline-none resize-none" placeholder="Internal e-way bill remarks..." rows={3}></textarea>
            </div>
          </div>
        </div>
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <UploadCloud size={18} className="text-slate-400" />
              <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-200">Attachments</h3>
            </div>
            <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-6 text-center space-y-2 hover:border-brand-emerald/50 transition-colors cursor-pointer group">
              <UploadCloud size={32} className="mx-auto text-slate-300 group-hover:text-brand-emerald transition-colors" />
              <p className="text-xs text-slate-500">Drag files here or <span className="text-brand-emerald font-bold">Browse</span></p>
              <p className="text-[10px] text-slate-400">PDF, JPG, PNG up to 5MB</p>
            </div>
          </div>
          <div className="bg-emerald-500/10 dark:bg-emerald-500/5 p-4 rounded-xl border border-emerald-500/20">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-xs text-brand-emerald uppercase">Terms & Conditions</h3>
              <ChevronDown size={16} className="text-brand-emerald" />
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              1. Goods once sold will not be taken back.<br/>
              2. Subject to local jurisdiction only.<br/>
              3. Payment due within 15 days of invoice date.
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center flex-col gap-4 py-8">
        {saveStatus && (
          <div className={`w-full max-w-md p-4 rounded-xl flex items-center gap-3 text-sm font-medium mb-4 ${
            saveStatus.type === 'success' 
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
              : 'bg-rose-50 text-rose-700 border border-rose-100'
          }`}>
            {saveStatus.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            {saveStatus.message}
          </div>
        )}
        <div className="flex items-center justify-center gap-4">
          <button 
            onClick={handleCreateInvoice}
            disabled={isSaving}
            className="px-8 py-3 bg-brand-emerald text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle size={20} />}
            {isSaving ? 'Creating...' : 'Create Invoice'}
          </button>
          <button 
            onClick={() => {
              setItems([]);
              setSelectedLedger(null);
              setLedgerSearchQuery('');
              setFormData({
                billDate: new Date().toISOString().split('T')[0],
                docNo: '',
                poNo: '',
                poDate: '',
                supplyTo: '',
                salesPerson: '',
                shipAddress: '',
                stockPlace: 'Head Office (HO)',
                projectSite: ''
              });
              setSaveStatus(null);
            }}
            className="px-8 py-3 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95 transition-all flex items-center gap-2"
          >
            Clear Form
          </button>
        </div>
      </div>

      <AddItemModal 
        isOpen={isAddItemModalOpen} 
        onClose={() => setIsAddItemModalOpen(false)} 
        onSuccess={fetchItems}
      />

      <LedgerSearchModal
        isOpen={isLedgerModalOpen}
        onClose={() => setIsLedgerModalOpen(false)}
        onSelect={(ledger) => {
          setSelectedLedger(ledger);
          setLedgerSearchQuery(ledger.name);
          setFormData(prev => ({
            ...prev,
            salesPerson: ledger.salesPerson || prev.salesPerson,
            shipAddress: ledger.address || prev.shipAddress
          }));
          setIsLedgerModalOpen(false);
        }}
      />

      <AddLedgerModal
        isOpen={isAddLedgerModalOpen}
        onClose={() => setIsAddLedgerModalOpen(false)}
        onSuccess={fetchLedgers}
      />
    </motion.div>
  );
};
