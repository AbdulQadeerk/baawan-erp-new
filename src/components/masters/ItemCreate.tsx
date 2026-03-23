import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Save, 
  RefreshCw, 
  Package, 
  CreditCard, 
  BarChart3, 
  ChevronDown, 
  UploadCloud, 
  Plus, 
  Trash2,
  Tag,
  Wallet,
  Scale,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { itemService, brandService, categoryService, unitService } from '../../services/api';

export const ItemCreate: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [activeSections, setActiveSections] = useState<string[]>(['rate-cat', 'ledger-map', 'conversion']);
  const [loading, setLoading] = useState(false);
  const [brands, setBrands] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    itemCode: '',
    itemName: '',
    aliases: '',
    brandId: '',
    categoryId: '',
    type: '',
    brandCode: '',
    productType: 'Goods',
    hsnCode: '',
    mrp: '0.00',
    gstPercentage: '0',
    sellRate: '0.00',
    discount: '0',
    stdUnitId: '',
    costingMethod: 'Standard',
    location: '',
    minQty: '0',
    maxQty: '0',
    reOrderDays: '0',
    reOrderQty: '0',
    isActive: true,
    stockMaintain: false,
    allowNegativeStock: false,
    batchLotReq: false,
    billOfMaterial: false,
    itemDescription: '',
    notes: ''
  });

  useEffect(() => {
    const fetchMasters = async () => {
      try {
        const [brandsData, categoriesData, unitsData] = await Promise.all([
          brandService.list(),
          categoryService.list(),
          unitService.list()
        ]);
        setBrands(Array.isArray(brandsData) ? brandsData : []);
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
        setUnits(Array.isArray(unitsData) ? unitsData : []);
      } catch (error) {
        console.error('Error fetching master data:', error);
      }
    };
    fetchMasters();
  }, []);

  const toggleSection = (id: string) => {
    setActiveSections(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async () => {
    if (!formData.itemName || !formData.itemCode) {
      alert('Please fill in required fields: Item Name and Item Code');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ItemCode: formData.itemCode,
        ItemName: formData.itemName,
        Aliases: formData.aliases,
        BrandID: formData.brandId,
        CategoryID: formData.categoryId,
        Type: formData.type,
        BrandCode: formData.brandCode,
        ProductType: formData.productType,
        HSNCode: formData.hsnCode,
        MRP: parseFloat(formData.mrp),
        GSTPercentage: parseFloat(formData.gstPercentage),
        SellRate: parseFloat(formData.sellRate),
        Discount: parseFloat(formData.discount),
        StdUnitID: formData.stdUnitId,
        CostingMethod: formData.costingMethod,
        Location: formData.location,
        MinQty: parseFloat(formData.minQty),
        MaxQty: parseFloat(formData.maxQty),
        ReOrderDays: parseInt(formData.reOrderDays),
        ReOrderQty: parseFloat(formData.reOrderQty),
        IsActive: formData.isActive,
        StockMaintain: formData.stockMaintain,
        AllowNegativeStock: formData.allowNegativeStock,
        BatchLotReq: formData.batchLotReq,
        BillOfMaterial: formData.billOfMaterial,
        ItemDescription: formData.itemDescription,
        Notes: formData.notes
      };

      await itemService.create(payload);
      alert('Item created successfully!');
      // Reset form or redirect
    } catch (error) {
      console.error('Error creating item:', error);
      alert('Failed to create item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.99 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-[1400px] mx-auto p-6 space-y-8 pb-32"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Create New Item</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-bold uppercase tracking-widest opacity-60">Configure item specifications, pricing, and stock controls.</p>
        </div>
        <button 
          onClick={onBack}
          className="inline-flex items-center px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all text-xs font-black uppercase tracking-widest active:scale-95"
        >
          <ArrowLeft size={16} className="mr-2" /> Back to List
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Basic Identity */}
        <section className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-8">
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <Package className="text-blue-600" size={20} />
            <h2 className="text-sm font-black uppercase tracking-[0.2em]">Basic Identity</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput label="Item Code" name="itemCode" value={formData.itemCode} onChange={handleInputChange} placeholder="e.g. SKU-1001" />
            <FormInput label="Item Name" name="itemName" value={formData.itemName} onChange={handleInputChange} placeholder="Enter full item name" />
            <div className="md:col-span-2">
              <FormInput label="Aliases" name="aliases" value={formData.aliases} onChange={handleInputChange} placeholder="Alternative names separated by commas" />
            </div>
            <FormSelect 
              label="Brand" 
              name="brandId" 
              value={formData.brandId} 
              onChange={handleInputChange}
              options={brands.map(b => ({ label: b.brandName || b.name, value: b.id || b.brandId }))} 
            />
            <FormSelect 
              label="Category" 
              name="categoryId" 
              value={formData.categoryId} 
              onChange={handleInputChange}
              options={categories.map(c => ({ label: c.categoryName || c.name, value: c.id || c.categoryId }))} 
            />
            <FormInput label="Type" name="type" value={formData.type} onChange={handleInputChange} />
            <FormInput label="Brand Code" name="brandCode" value={formData.brandCode} onChange={handleInputChange} />
          </div>
        </section>

        {/* Pricing & Tax */}
        <section className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-8">
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <CreditCard className="text-emerald-600" size={20} />
            <h2 className="text-sm font-black uppercase tracking-[0.2em]">Pricing & Tax</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FormSelect 
              label="Product Type" 
              name="productType" 
              value={formData.productType} 
              onChange={handleInputChange}
              options={[{ label: 'Goods', value: 'Goods' }, { label: 'Services', value: 'Services' }]} 
              required 
            />
            <FormInput label="HSN Code" name="hsnCode" value={formData.hsnCode} onChange={handleInputChange} />
            <FormInput label="MRP" name="mrp" type="number" value={formData.mrp} onChange={handleInputChange} textAlign="right" />
            <FormInput label="GST %" name="gstPercentage" type="number" value={formData.gstPercentage} onChange={handleInputChange} textAlign="right" />
            <FormInput label="Sell Rate" name="sellRate" type="number" value={formData.sellRate} onChange={handleInputChange} textAlign="right" color="text-blue-600" />
            <FormInput label="Discount (%)" name="discount" type="number" value={formData.discount} onChange={handleInputChange} textAlign="right" />
            <div className="md:col-span-2 lg:col-span-1">
              <FormSelect 
                label="Std Unit" 
                name="stdUnitId" 
                value={formData.stdUnitId} 
                onChange={handleInputChange}
                options={units.map(u => ({ label: u.unitName || u.name, value: u.id || u.unitId }))} 
                required 
              />
            </div>
          </div>
        </section>

        {/* Stock Control & Logistics */}
        <section className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-8 xl:col-span-2">
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <BarChart3 className="text-amber-600" size={20} />
            <h2 className="text-sm font-black uppercase tracking-[0.2em]">Stock Control & Logistics</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            <div className="space-y-6">
              <FormSelect 
                label="Costing Method" 
                name="costingMethod" 
                value={formData.costingMethod} 
                onChange={handleInputChange}
                options={[{ label: 'Standard', value: 'Standard' }, { label: 'FIFO', value: 'FIFO' }, { label: 'Weighted Average', value: 'Weighted Average' }]} 
                required 
              />
              <FormInput label="Location" name="location" value={formData.location} onChange={handleInputChange} placeholder="Aisle/Bin" />
            </div>
            <div className="space-y-6">
              <FormInput label="Last Purchase Rate" value="0.00" textAlign="right" readOnly bg="bg-slate-100 dark:bg-slate-800/50" />
              <FormInput label="Avg Purchase Rate" value="0.00" textAlign="right" readOnly bg="bg-slate-100 dark:bg-slate-800/50" />
            </div>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <FormInput label="Min Qty" name="minQty" value={formData.minQty} onChange={handleInputChange} textAlign="right" labelSize="text-[9px]" />
                <FormInput label="Max Qty" name="maxQty" value={formData.maxQty} onChange={handleInputChange} textAlign="right" labelSize="text-[9px]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormInput label="Re-Order Days" name="reOrderDays" value={formData.reOrderDays} onChange={handleInputChange} textAlign="right" labelSize="text-[9px]" />
                <FormInput label="Re-Order Qty" name="reOrderQty" value={formData.reOrderQty} onChange={handleInputChange} textAlign="right" labelSize="text-[9px]" />
              </div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 grid grid-cols-1 gap-4">
              <CheckboxItem label="Is Active?" name="isActive" checked={formData.isActive} onChange={handleInputChange} />
              <CheckboxItem label="Stock Maintain?" name="stockMaintain" checked={formData.stockMaintain} onChange={handleInputChange} />
              <CheckboxItem label="Allow Negative Stock?" name="allowNegativeStock" checked={formData.allowNegativeStock} onChange={handleInputChange} />
              <CheckboxItem label="Batch / Lot Req." name="batchLotReq" checked={formData.batchLotReq} onChange={handleInputChange} />
              <CheckboxItem label="Bill of Material" name="billOfMaterial" checked={formData.billOfMaterial} onChange={handleInputChange} />
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-6 border-t border-slate-100 dark:border-slate-800">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Item Description</label>
              <textarea 
                name="itemDescription"
                value={formData.itemDescription}
                onChange={handleInputChange}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold p-5 focus:ring-4 focus:ring-blue-600/10 outline-none transition-all" 
                placeholder="Provide detailed specifications of the item..." 
                rows={3}
              ></textarea>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Notes</label>
              <textarea 
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold p-5 focus:ring-4 focus:ring-blue-600/10 outline-none transition-all" 
                placeholder="Internal remarks or handling instructions..." 
                rows={3}
              ></textarea>
            </div>
          </div>
        </section>
      </div>

      {/* Sticky Footer Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 p-6 z-40 shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.1)]">
        <div className="max-w-[1400px] mx-auto flex items-center justify-center gap-6">
          <button 
            onClick={handleSubmit}
            disabled={loading}
            className="inline-flex items-center px-12 py-4 bg-slate-800 text-white rounded-2xl shadow-xl shadow-slate-800/20 hover:scale-[1.02] active:scale-95 transition-all font-black uppercase tracking-widest text-sm disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin mr-3" size={20} /> : <Save size={20} className="mr-3" />} 
            Insert Item
          </button>
          <button 
            onClick={() => setFormData({
              itemCode: '', itemName: '', aliases: '', brandId: '', categoryId: '', type: '', brandCode: '',
              productType: 'Goods', hsnCode: '', mrp: '0.00', gstPercentage: '0', sellRate: '0.00', discount: '0',
              stdUnitId: '', costingMethod: 'Standard', location: '', minQty: '0', maxQty: '0', reOrderDays: '0',
              reOrderQty: '0', isActive: true, stockMaintain: false, allowNegativeStock: false, batchLotReq: false,
              billOfMaterial: false, itemDescription: '', notes: ''
            })}
            className="inline-flex items-center px-12 py-4 bg-blue-600 text-white rounded-2xl shadow-xl shadow-blue-600/20 hover:scale-[1.02] active:scale-95 transition-all font-black uppercase tracking-widest text-sm"
          >
            <RefreshCw size={20} className="mr-3" /> Clear Form
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const FormInput = ({ label, name, placeholder, type = "text", value, onChange, textAlign = "left", color = "text-slate-900 dark:text-white", readOnly = false, bg = "bg-slate-50 dark:bg-slate-800", labelSize = "text-[10px]" }: { label: string, name?: string, placeholder?: string, type?: string, value?: string, onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void, textAlign?: "left" | "right", color?: string, readOnly?: boolean, bg?: string, labelSize?: string }) => (
  <div className="space-y-1.5">
    <label className={`${labelSize} font-black uppercase tracking-widest text-slate-500`}>{label}</label>
    <input 
      name={name}
      value={value}
      onChange={onChange}
      className={`w-full ${bg} border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold ${color} focus:ring-4 focus:ring-blue-600/10 outline-none transition-all text-${textAlign}`} 
      placeholder={placeholder} 
      type={type}
      readOnly={readOnly}
    />
  </div>
);

const FormSelect = ({ label, name, options, value, onChange, required = false, bg = "bg-slate-50 dark:bg-slate-800" }: { label: string, name: string, options: { label: string, value: string }[], value: string, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void, required?: boolean, bg?: string }) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      <select 
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full ${bg} border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 dark:text-white focus:ring-4 focus:ring-blue-600/10 outline-none transition-all appearance-none cursor-pointer`}
      >
        <option value="">Select {label}</option>
        {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
      <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
        <ChevronDown size={18} />
      </div>
    </div>
  </div>
);

const CheckboxItem = ({ label, name, checked, onChange }: { label: string, name: string, checked: boolean, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) => (
  <label className="flex items-center gap-4 cursor-pointer group">
    <div className="relative flex items-center">
      <input 
        name={name}
        checked={checked}
        onChange={onChange}
        className="peer w-5 h-5 text-blue-600 border-slate-300 rounded-lg focus:ring-blue-600 transition-all" 
        type="checkbox" 
      />
    </div>
    <span className="text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 group-hover:text-blue-600 transition-colors">{label}</span>
  </label>
);

const CollapsibleSection = ({ id, title, icon, children, isOpen, onToggle }: { id: string, title: string, icon: React.ReactNode, children: React.ReactNode, isOpen: boolean, onToggle: () => void }) => (
  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
    <button 
      className="w-full flex items-center justify-between p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left" 
      onClick={onToggle}
    >
      <div className="flex items-center gap-3">
        <div className="text-blue-600">{icon}</div>
        <h2 className="text-sm font-black uppercase tracking-[0.2em]">{title}</h2>
      </div>
      <motion.div
        animate={{ rotate: isOpen ? 0 : -90 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <ChevronDown size={20} className="text-slate-400" />
      </motion.div>
    </button>
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="overflow-hidden"
        >
          <div className="p-8 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30">
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);
