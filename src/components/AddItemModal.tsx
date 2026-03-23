import React, { useState } from 'react';
import { 
  X, 
  PlusSquare, 
  Download, 
  Eraser,
  ChevronDown,
  Info,
  Loader2,
  Save
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { itemService } from '../services/api';

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AddItemModal: React.FC<AddItemModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    itemCode: '',
    itemName: '',
    brand: '',
    category: '',
    subCategory: '',
    brandCode: '',
    hsnNo: '',
    productType: 'Goods',
    mrp: '0',
    uom: 'PCS',
    salesLedger: 'Sales',
    taxPercent: '0',
    allowNegativeStock: false,
    batchLotReq: false,
    rate: '0',
    lastPurRate: '0',
    purchaseLedger: 'Purchase'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.itemName || !formData.itemCode) {
      alert('Please fill in required fields: Item Name and Item Code');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ItemCode: formData.itemCode,
        ItemName: formData.itemName,
        Aliases: '',
        BrandID: 0,
        CategoryID: 0,
        Type: '',
        BrandCode: formData.brandCode,
        ProductType: formData.productType,
        HSNCode: formData.hsnNo,
        MRP: parseFloat(formData.mrp),
        GSTPercentage: parseFloat(formData.taxPercent),
        SellRate: parseFloat(formData.rate),
        Discount: 0,
        StdUnitID: 0,
        CostingMethod: 'Standard',
        Location: '',
        MinQty: 0,
        MaxQty: 0,
        ReOrderDays: 0,
        ReOrderQty: 0,
        IsActive: true,
        StockMaintain: true,
        AllowNegativeStock: formData.allowNegativeStock,
        BatchLotReq: formData.batchLotReq,
        BillOfMaterial: false,
        ItemDescription: '',
        Notes: ''
      };

      await itemService.create(payload);
      alert('Item created successfully!');
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating item:', error);
      alert('Failed to create item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-4xl bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-sky-50 dark:bg-slate-900/50 border-b border-sky-100 dark:border-slate-700">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <PlusSquare className="text-primary" size={24} />
                Add New Item to Master
              </h2>
              <button 
                onClick={onClose}
                className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors text-slate-500"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[80vh] custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                {/* Left Column */}
                <div className="space-y-6">
                  <div className="relative group">
                    <label className="absolute left-3 -top-2.5 px-1 bg-white dark:bg-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 group-focus-within:text-primary transition-colors z-10">
                      Item Code <span className="text-red-500">*</span>
                    </label>
                    <input 
                      name="itemCode"
                      value={formData.itemCode}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-slate-400 text-sm" 
                      placeholder="Enter unique code" 
                      type="text"
                    />
                  </div>

                  <div className="relative group">
                    <label className="absolute left-3 -top-2.5 px-1 bg-white dark:bg-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 group-focus-within:text-primary transition-colors z-10">
                      Brand
                    </label>
                    <input 
                      name="brand"
                      value={formData.brand}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm" 
                      placeholder="Select or enter brand" 
                      type="text"
                    />
                  </div>

                  <div className="relative group">
                    <label className="absolute left-3 -top-2.5 px-1 bg-white dark:bg-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 group-focus-within:text-primary transition-colors z-10">
                      Sub Category
                    </label>
                    <input 
                      name="subCategory"
                      value={formData.subCategory}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm" 
                      placeholder="Select sub category" 
                      type="text"
                    />
                  </div>

                  <div className="relative group">
                    <label className="absolute left-3 -top-2.5 px-1 bg-white dark:bg-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 group-focus-within:text-primary transition-colors z-10">
                      Brand Code
                    </label>
                    <input 
                      name="brandCode"
                      value={formData.brandCode}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm" 
                      placeholder="Enter brand code" 
                      type="text"
                    />
                  </div>

                  <div className="relative group">
                    <label className="absolute left-3 -top-2.5 px-1 bg-white dark:bg-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 group-focus-within:text-primary transition-colors z-10">
                      HSN No
                    </label>
                    <input 
                      name="hsnNo"
                      value={formData.hsnNo}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm" 
                      placeholder="Enter HSN number" 
                      type="text"
                    />
                  </div>

                  <div className="relative group">
                    <label className="absolute left-3 -top-2.5 px-1 bg-white dark:bg-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 group-focus-within:text-primary transition-colors z-10">
                      Product Type <span className="text-red-500">*</span>
                    </label>
                    <select 
                      name="productType"
                      value={formData.productType}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none text-sm"
                    >
                      <option>Goods</option>
                      <option>Service</option>
                    </select>
                    <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative group">
                      <label className="absolute left-3 -top-2.5 px-1 bg-white dark:bg-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 group-focus-within:text-primary transition-colors z-10">
                        MRP
                      </label>
                      <input 
                        name="mrp"
                        value={formData.mrp}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm" 
                        placeholder="0.00" 
                        type="number"
                      />
                    </div>
                    <div className="relative group">
                      <label className="absolute left-3 -top-2.5 px-1 bg-white dark:bg-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 group-focus-within:text-primary transition-colors z-10">
                        UOM <span className="text-red-500">*</span>
                      </label>
                      <select 
                        name="uom"
                        value={formData.uom}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none text-sm"
                      >
                        <option>Select Unit</option>
                        <option>PCS</option>
                        <option>KGS</option>
                        <option>SET</option>
                      </select>
                      <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  <div className="relative group">
                    <label className="absolute left-3 -top-2.5 px-1 bg-white dark:bg-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 group-focus-within:text-primary transition-colors z-10">
                      Sales Ledger
                    </label>
                    <select 
                      name="salesLedger"
                      value={formData.salesLedger}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none text-sm"
                    >
                      <option>Sales</option>
                    </select>
                    <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  <div className="relative group">
                    <label className="absolute left-3 -top-2.5 px-1 bg-white dark:bg-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 group-focus-within:text-primary transition-colors z-10">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input 
                      name="itemName"
                      value={formData.itemName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm" 
                      placeholder="Enter item name" 
                      type="text"
                    />
                  </div>

                  <div className="relative group">
                    <label className="absolute left-3 -top-2.5 px-1 bg-white dark:bg-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 group-focus-within:text-primary transition-colors z-10">
                      Category
                    </label>
                    <input 
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm" 
                      placeholder="Select category" 
                      type="text"
                    />
                  </div>

                  <div className="relative group">
                    <label className="absolute left-3 -top-2.5 px-1 bg-white dark:bg-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 group-focus-within:text-primary transition-colors z-10">
                      Type
                    </label>
                    <input 
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm" 
                      placeholder="Select type" 
                      type="text"
                    />
                  </div>

                  <div className="relative group">
                    <label className="absolute left-3 -top-2.5 px-1 bg-white dark:bg-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 group-focus-within:text-primary transition-colors z-10">
                      TAX %
                    </label>
                    <input 
                      name="taxPercent"
                      value={formData.taxPercent}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm" 
                      type="number" 
                    />
                  </div>

                  <div className="flex flex-col space-y-4 py-2">
                    <label className="flex items-center space-x-3 cursor-pointer group">
                      <div className="relative flex items-center">
                        <input 
                          name="allowNegativeStock"
                          checked={formData.allowNegativeStock}
                          onChange={handleInputChange}
                          type="checkbox" 
                          className="w-5 h-5 rounded border-slate-300 dark:border-slate-600 text-primary focus:ring-primary dark:bg-slate-700 transition-all"
                        />
                      </div>
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-300 group-hover:text-primary transition-colors">Allow Negative Stock?</span>
                    </label>
                    <label className="flex items-center space-x-3 cursor-pointer group">
                      <div className="relative flex items-center">
                        <input 
                          name="batchLotReq"
                          checked={formData.batchLotReq}
                          onChange={handleInputChange}
                          type="checkbox" 
                          className="w-5 h-5 rounded border-slate-300 dark:border-slate-600 text-primary focus:ring-primary dark:bg-slate-700 transition-all"
                        />
                      </div>
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-300 group-hover:text-primary transition-colors">Batch / Lot No. Req.</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative group">
                      <label className="absolute left-3 -top-2.5 px-1 bg-white dark:bg-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 group-focus-within:text-primary transition-colors z-10">
                        Rate
                      </label>
                      <input 
                        name="rate"
                        value={formData.rate}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm" 
                        placeholder="0" 
                        type="number"
                      />
                    </div>
                    <div className="relative group">
                      <label className="absolute left-3 -top-2.5 px-1 bg-white dark:bg-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 group-focus-within:text-primary transition-colors z-10">
                        Last Pur Rate
                      </label>
                      <input 
                        name="lastPurRate"
                        value={formData.lastPurRate}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm" 
                        placeholder="0" 
                        type="number"
                      />
                    </div>
                  </div>

                  <div className="relative group">
                    <label className="absolute left-3 -top-2.5 px-1 bg-white dark:bg-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 group-focus-within:text-primary transition-colors z-10">
                      Purchase Ledger
                    </label>
                    <select 
                      name="purchaseLedger"
                      value={formData.purchaseLedger}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none text-sm"
                    >
                      <option>Purchase</option>
                    </select>
                    <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="mt-8 flex items-center justify-end space-x-4 pt-6 border-t border-slate-100 dark:border-slate-700">
                <button 
                  type="submit"
                  disabled={loading}
                  className="flex items-center px-6 py-2.5 bg-slate-800 dark:bg-slate-700 hover:opacity-90 text-white font-semibold rounded-xl shadow-lg shadow-slate-900/10 transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                  Insert Item
                </button>
                <button 
                  type="button"
                  onClick={() => setFormData({
                    itemCode: '', itemName: '', brand: '', category: '', subCategory: '', brandCode: '',
                    hsnNo: '', productType: 'Goods', mrp: '0', uom: 'PCS', salesLedger: 'Sales',
                    taxPercent: '0', allowNegativeStock: false, batchLotReq: false, rate: '0',
                    lastPurRate: '0', purchaseLedger: 'Purchase'
                  })}
                  className="flex items-center px-6 py-2.5 bg-primary hover:opacity-90 text-white font-semibold rounded-xl shadow-lg shadow-primary/10 transition-all active:scale-95 flex items-center gap-2"
                >
                  <Eraser size={18} />
                  Clear Form
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
