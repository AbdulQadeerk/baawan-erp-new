import React, { useState } from 'react';
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
  Truck
} from 'lucide-react';
import { motion } from 'motion/react';
import { InvoiceItem, Ledger } from '../types';
import { AddItemModal } from './AddItemModal';
import { LedgerSearchModal } from './LedgerSearchModal';
import { AddLedgerModal } from './AddLedgerModal';

interface PurchaseInvoiceFormProps {
  onBack: () => void;
}

export const PurchaseInvoiceForm: React.FC<PurchaseInvoiceFormProps> = ({ onBack }) => {
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [isLedgerModalOpen, setIsLedgerModalOpen] = useState(false);
  const [isAddLedgerModalOpen, setIsAddLedgerModalOpen] = useState(false);
  const [ledgerName, setLedgerName] = useState('');
  const [showLedgerResults, setShowLedgerResults] = useState(false);
  const [ledgerSearchQuery, setLedgerSearchQuery] = useState('');

  const mockLedgers: Ledger[] = [
    { 
      id: '1', 
      name: 'Patil Ledger', 
      address: 'ABC Tech Pvt Ltd, Plot No. 21, MIDC Industrial Area, Andheri East, Mumbai, Maharashtra – 400093', 
      city: 'MUMBAI', 
      area: 'Andheri East', 
      mobile: '+91 3453 453 455',
      outstanding: 452430,
      creditLimit: 400000,
      salesPerson: 'Mr. Rajesh Patil',
      gstin: '27AADCP2312R1Z5'
    },
    { 
      id: '2', 
      name: 'Purchase Ledger', 
      address: 'test address', 
      city: 'PUNE', 
      area: 'test', 
      mobile: '+91 5454 545 554',
      outstanding: 125000,
      creditLimit: 500000,
      salesPerson: 'Jane Smith',
      gstin: '27AADCP2312R1Z5'
    },
    { 
      id: '3', 
      name: 'test ledger', 
      address: 'Ramanand Nagar', 
      city: 'Kolhapur', 
      area: 'test', 
      mobile: '+91 91195 03337',
      outstanding: 0,
      creditLimit: 100000,
      salesPerson: 'Not Assigned',
      gstin: '27AADCP2312R1Z5'
    },
  ];

  const filteredLedgers = mockLedgers.filter(ledger => 
    ledger.name.toLowerCase().includes(ledgerSearchQuery.toLowerCase()) ||
    ledger.mobile.toLowerCase().includes(ledgerSearchQuery.toLowerCase())
  );
  
  // State for the item currently being built
  const [currentItem, setCurrentItem] = useState({
    name: '',
    sku: '',
    hsn: '',
    qty: 1,
    unit: 'PCS',
    rate: 0,
    gstPercent: 18
  });

  const mockResults = [
    { name: 'Solar Panel - 450W Monocrystalline', sku: 'SP-450-MN', hsn: '85414011', stock: 142, unit: 'PCS', rate: 12500 },
    { name: 'Solar Panel Stand - Z-Bracket Mount', sku: 'SP-MNT-ZB', hsn: '73089090', stock: 48, unit: 'SET', rate: 850 },
    { name: 'Portable Solar Panel 100W Foldable', sku: 'SP-FLD-100', hsn: '85414300', stock: 8, unit: 'PCS', rate: 4500 },
    { name: 'Solar Panel Cleaning Kit - Pro', sku: 'SP-CLN-KIT', hsn: '96039000', stock: 0, unit: 'KIT', rate: 1200 },
  ];

  const filteredResults = mockResults.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const highlightText = (text: string, query: string) => {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) => 
          part.toLowerCase() === query.toLowerCase() ? (
            <span key={i} className="text-primary font-bold">{part}</span>
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
      name: item.name,
      sku: item.sku,
      hsn: item.hsn,
      unit: item.unit,
      rate: item.rate
    });
    setSearchQuery(item.name);
    setShowResults(false);
  };

  const handleAddItem = () => {
    if (!currentItem.name) return;

    const newItem: InvoiceItem = {
      id: Math.random().toString(36).substr(2, 9),
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
  const totalGst = subTotal * 0.18;
  const grandTotal = subTotal + totalGst;

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-[1600px] mx-auto p-6 space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Create New Purchase Invoice</h1>
          <p className="text-sm text-slate-500">Record your purchase transactions and manage inventory inward</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft size={18} /> Back
          </button>
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:opacity-90 transition-opacity">
            <Save size={18} /> Save Draft
          </button>
        </div>
      </div>

      {/* Main Form Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transaction Details */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Receipt size={20} className="text-primary" />
            <h2 className="font-semibold text-slate-700 dark:text-slate-200">Transaction Details</h2>
          </div>
          <div className="space-y-4">
            <div className="relative">
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Vendor Ledger</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input 
                    className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-primary focus:border-primary text-sm px-3 py-2 outline-none" 
                    placeholder="Select or search vendor..." 
                    type="text"
                    value={ledgerSearchQuery}
                    onChange={(e) => {
                      setLedgerSearchQuery(e.target.value);
                      setShowLedgerResults(e.target.value.length > 0);
                    }}
                    onFocus={() => ledgerSearchQuery.length > 0 && setShowLedgerResults(true)}
                  />
                  
                  {showLedgerResults && filteredLedgers.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl z-[60] overflow-hidden">
                      <div className="max-h-[340px] overflow-y-auto custom-scrollbar">
                        {filteredLedgers.map((ledger, i) => (
                          <div 
                            key={i}
                            onClick={() => {
                              setLedgerName(ledger.name);
                              setLedgerSearchQuery(ledger.name);
                              setShowLedgerResults(false);
                            }}
                            className={`p-3 border-b border-slate-100 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
                              ledgerName === ledger.name ? 'bg-primary/10 dark:bg-primary/20 border-l-4 border-primary' : ''
                            }`}
                          >
                            <div className="flex justify-between items-start mb-1">
                              <span className="text-sm font-bold text-slate-800 dark:text-white">
                                {highlightText(ledger.name, ledgerSearchQuery)}
                              </span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                ledger.outstanding > ledger.creditLimit ? 'text-red-500 bg-red-500/10' : 'text-emerald-500 bg-emerald-500/10'
                              }`}>
                                ₹{ledger.outstanding.toLocaleString()} O/S
                              </span>
                            </div>
                            <div className="flex gap-3 text-[11px] text-slate-500 dark:text-slate-400">
                              <span className="flex items-center gap-1">
                                <MapPin size={14} className="opacity-50" /> {ledger.city}
                              </span>
                              <span className="flex items-center gap-1">
                                <Tag size={14} className="opacity-50" /> GST: {ledger.gstin}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <button 
                        onClick={() => setIsAddLedgerModalOpen(true)}
                        className="w-full p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2 text-primary font-bold text-xs hover:bg-primary/5 transition-colors"
                      >
                        <PlusCircle size={16} /> Add New Ledger to Master
                      </button>
                    </div>
                  )}
                </div>
                <button 
                  onClick={() => setIsAddLedgerModalOpen(true)}
                  className="bg-primary text-white p-2 rounded-lg hover:opacity-90"
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
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Stock Place (Inward)</label>
                <select className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-sm px-3 py-2 outline-none">
                  <option>Head Office (HO)</option>
                  <option>Warehouse A</option>
                  <option>Warehouse B</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Purchase Date</label>
                <input className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-sm px-3 py-2 outline-none" type="date" defaultValue={new Date().toISOString().split('T')[0]}/>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Internal Ref No.</label>
                <input className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-sm px-3 py-2 outline-none" placeholder="PUR-2026-001" type="text"/>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Project Site</label>
                <div className="flex gap-2">
                  <input className="flex-1 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-sm px-3 py-2 outline-none" placeholder="Select Site" type="text"/>
                  <button className="bg-primary/10 text-primary p-2 rounded-lg hover:bg-primary/20"><MapPin size={18} /></button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Vendor Information */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Truck size={20} className="text-blue-500" />
            <h2 className="font-semibold text-slate-700 dark:text-slate-200">Vendor Information</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Supplier Invoice No</label>
              <input className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-sm px-3 py-2 outline-none" placeholder="Enter Supplier Inv No" type="text"/>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Supplier Invoice Date</label>
              <input className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-sm px-3 py-2 outline-none" type="date"/>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Purchase From (State)</label>
              <select className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-sm px-3 py-2 outline-none">
                <option>Select State</option>
                <option>Maharashtra</option>
                <option>Delhi</option>
                <option>Gujarat</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Purchaser / Agent</label>
              <select className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-sm px-3 py-2 outline-none">
                <option>Select Person</option>
                <option>Admin User</option>
                <option>Procurement Manager</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Billing Address</label>
            <textarea className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-sm px-3 py-2 outline-none resize-none" placeholder="Vendor's billing address..." rows={2}></textarea>
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
                  className="flex-1 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 rounded-lg text-sm px-3 py-2 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" 
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
                <button className="bg-primary text-white px-3 rounded-lg hover:opacity-90 transition-opacity">
                  <Search size={18} />
                </button>
              </div>
              
              {showResults && filteredResults.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl z-[60] overflow-hidden">
                  <div className="max-h-[340px] overflow-y-auto custom-scrollbar">
                    {filteredResults.map((res, i) => (
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
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            res.stock > 20 ? 'text-emerald-500 bg-emerald-500/10' :
                            res.stock > 0 ? 'text-amber-500 bg-amber-500/10' :
                            'text-red-500 bg-red-500/10'
                          }`}>
                            {res.stock > 0 ? `${res.stock} in stock` : 'Out of Stock'}
                          </span>
                        </div>
                        <div className="flex gap-3 text-[11px] text-slate-500 dark:text-slate-400">
                          <span className="flex items-center gap-1">
                            <Barcode size={14} className="opacity-50" /> SKU: {highlightText(res.sku, searchQuery)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Tag size={14} className="opacity-50" /> HSN: {res.hsn}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button 
                    onClick={() => setIsAddItemModalOpen(true)}
                    className="w-full p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2 text-primary font-bold text-xs hover:bg-primary/5 transition-colors"
                  >
                    <PlusCircle size={16} /> Add New Item to Master List
                  </button>
                </div>
              )}
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Qty <span className="text-red-500">*</span></label>
              <input 
                className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-sm px-3 py-2 outline-none text-center focus:ring-2 focus:ring-primary/20" 
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
                  className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-sm pl-7 pr-3 py-2 outline-none focus:ring-2 focus:ring-primary/20" 
                  placeholder="0.00" 
                  type="number"
                  value={currentItem.rate || ''}
                  onChange={(e) => setCurrentItem({ ...currentItem, rate: Number(e.target.value) })}
                />
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Disc (%)</label>
              <input className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-sm px-3 py-2 outline-none text-center focus:ring-2 focus:ring-primary/20" placeholder="0" type="number"/>
            </div>
            <div className="md:col-span-2 flex gap-2">
              <button 
                onClick={handleAddItem}
                className="flex-1 bg-primary text-white py-2 rounded-lg font-medium flex items-center justify-center gap-2 hover:opacity-90 shadow-md shadow-primary/10 active:scale-95 transition-all"
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

        <div className="bg-primary/5 dark:bg-primary/10 grid grid-cols-2 md:grid-cols-4 px-6 py-4 gap-6">
          <div>
            <span className="text-[10px] text-slate-500 font-bold uppercase block">Total Qty</span>
            <span className="text-lg font-bold text-slate-700 dark:text-slate-200">{items.reduce((acc, item) => acc + item.qty, 0)}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 font-bold uppercase block">Total GST</span>
            <span className="text-lg font-bold text-slate-700 dark:text-slate-200">₹{totalGst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
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
                <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-200">Extra Charges / Discounts</h3>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm px-3 py-2 outline-none" placeholder="Discount Reason" type="text"/>
                  <div className="relative w-32">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs">₹</span>
                    <input className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm pl-5 pr-3 py-2 outline-none text-right" placeholder="0.00" type="number"/>
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
                  <input defaultChecked className="rounded text-primary focus:ring-primary w-4 h-4" type="checkbox"/>
                  <span className="text-slate-500">Round Off</span>
                </div>
                <span className="font-semibold text-slate-800 dark:text-slate-200">₹0.00</span>
              </div>
              <div className="border-t border-slate-200 dark:border-slate-700 pt-3 flex justify-between items-center">
                <span className="text-base font-bold text-slate-700 dark:text-slate-200">Grand Total</span>
                <span className="text-xl font-black text-primary">₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Info size={18} className="text-blue-500" />
              <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-200">Notes & Remarks</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <textarea className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm px-3 py-2 outline-none resize-none" placeholder="Public notes (appears on invoice)..." rows={3}></textarea>
              <textarea className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm px-3 py-2 outline-none resize-none" placeholder="Internal remarks..." rows={3}></textarea>
            </div>
          </div>
        </div>
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <UploadCloud size={18} className="text-slate-400" />
              <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-200">Attachments</h3>
            </div>
            <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-6 text-center space-y-2 hover:border-primary/50 transition-colors cursor-pointer group">
              <UploadCloud size={32} className="mx-auto text-slate-300 group-hover:text-primary transition-colors" />
              <p className="text-xs text-slate-500">Drag files here or <span className="text-primary font-bold">Browse</span></p>
              <p className="text-[10px] text-slate-400">PDF, JPG, PNG up to 5MB</p>
            </div>
          </div>
          <div className="bg-primary/10 dark:bg-primary/5 p-4 rounded-xl border border-primary/20">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-xs text-primary uppercase">Terms & Conditions</h3>
              <ChevronDown size={16} className="text-primary" />
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              1. Goods received in good condition.<br/>
              2. Payment terms as per agreement.<br/>
              3. Subject to verification of quality.
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-4 py-8">
        <button className="px-8 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2">
          <CheckCircle size={20} /> Create Purchase Invoice
        </button>
        <button className="px-8 py-3 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95 transition-all flex items-center gap-2">
          Clear Form
        </button>
      </div>

      <AddItemModal 
        isOpen={isAddItemModalOpen} 
        onClose={() => setIsAddItemModalOpen(false)} 
      />

      <LedgerSearchModal
        isOpen={isLedgerModalOpen}
        onClose={() => setIsLedgerModalOpen(false)}
        onSelect={(ledger) => {
          setLedgerName(ledger.name);
          setLedgerSearchQuery(ledger.name);
          setIsLedgerModalOpen(false);
        }}
      />

      <AddLedgerModal
        isOpen={isAddLedgerModalOpen}
        onClose={() => setIsAddLedgerModalOpen(false)}
      />
    </motion.div>
  );
};
