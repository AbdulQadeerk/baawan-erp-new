import React, { useState, useEffect } from 'react';
import { 
  Search, 
  RotateCcw, 
  FileSpreadsheet, 
  FileText, 
  Edit2, 
  Eye, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  LayoutGrid,
  ExternalLink,
  CheckCircle2,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { reportService } from '../services/api';

export const CurrentStockReport: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(true);
  const [filters, setFilters] = useState({
    itemSearch: '',
    brand: '',
    category: '',
    type: '',
    singleItem: 'Specific SKU',
    stockPlace: 'All Warehouses (Multi-select)'
  });

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const formatDate = (date: Date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${d}/${m}/${y}`;
      };

      const params = {
        brand: filters.brand || "",
        category: filters.category || "",
        type: filters.type || "",
        name: filters.itemSearch || "",
        fromDate: formatDate(new Date(new Date().setMonth(new Date().getMonth() - 1))),
        toDate: formatDate(new Date()),
        stockPlace: "",
        includeChild: false,
        branchId: 0
      };
      
      const result = await reportService.getCurrentStock(params) as any;
      const items = Array.isArray(result) ? result : (result.data || []);
      
      // Map API response fields to component fields if necessary
      const mappedData = items.map((item: any) => ({
        id: item.id || Math.random().toString(36).substr(2, 9),
        code: item.code || item.item_Code || 'N/A',
        name: item.name || item.itemName || 'Unknown Item',
        brand: item.brand || item.brandName || '-',
        category: item.category || item.categoryName || '-',
        type: item.type || '-',
        ho: item.ho || item.hoQty || 0,
        wh1: item.wh1 || item.wh1Qty || 0,
        wh2: item.wh2 || item.wh2Qty || 0,
        total: item.total || item.totalQty || 0
      }));

      setData(mappedData);
    } catch (err: any) {
      console.error('Current Stock Error:', err);
      let errorMessage = 'Failed to fetch stock data.';
      if (err.response?.data) {
        errorMessage = `Error ${err.response.status}: ${JSON.stringify(err.response.data)}`;
      }
      setError(errorMessage);
      
      // Mock data
      setData([
        { id: 1, code: 'W001', name: 'Water Bottle 750ml', brand: 'Pigeon', category: 'Bottles', type: 'Still', ho: 150.00, wh1: 0.00, wh2: 0.00, total: 150.00 },
        { id: 2, code: 'ITM001', name: 'Lenovo ThinkPad X1', brand: 'Lenovo', category: 'Laptops', type: 'Professional', ho: 350.00, wh1: 50.00, wh2: 0.00, total: 400.00 },
        { id: 3, code: 'IPH15', name: 'iPhone 15 Pro Max', brand: 'Apple', category: 'Mobiles', type: 'iOS', ho: 0.00, wh1: 0.00, wh2: 0.00, total: 0.00 },
        { id: 4, code: 'ITM003', name: 'Mechanical Keyboard', brand: 'Logitech', category: 'Accessories', type: 'Gaming', ho: 500.00, wh1: 0.00, wh2: 0.00, total: 500.00 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Auto-hide toast after 5 seconds
    const timer = setTimeout(() => setShowToast(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 font-sans text-slate-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-slate-200 p-2 rounded-lg">
            <LayoutGrid size={20} className="text-slate-600" />
          </div>
          <h1 className="text-xl font-bold text-slate-800">Current Stock Report</h1>
        </div>
        <button className="flex items-center gap-1.5 text-blue-600 text-sm font-semibold hover:underline">
          <ExternalLink size={14} />
          Quick Links
        </button>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl text-rose-600 text-sm font-medium mb-6">
          {error}
        </div>
      )}

      {/* Filters Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Item Code / Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text"
                placeholder="Search item..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                value={filters.itemSearch}
                onChange={(e) => setFilters({...filters, itemSearch: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Brand <span className="text-red-500">*</span>
            </label>
            <select 
              value={filters.brand}
              onChange={(e) => setFilters({...filters, brand: e.target.value})}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none"
            >
              <option value="">Select Brand</option>
              <option value="Apple">Apple</option>
              <option value="Lenovo">Lenovo</option>
              <option value="Logitech">Logitech</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Category <span className="text-red-500">*</span>
            </label>
            <select 
              value={filters.category}
              onChange={(e) => setFilters({...filters, category: e.target.value})}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none"
            >
              <option value="">Select Category</option>
              <option value="Mobiles">Mobiles</option>
              <option value="Laptops">Laptops</option>
              <option value="Accessories">Accessories</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Type <span className="text-red-500">*</span>
            </label>
            <select 
              value={filters.type}
              onChange={(e) => setFilters({...filters, type: e.target.value})}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none"
            >
              <option value="">Select Type</option>
              <option value="Retail">Retail</option>
              <option value="Bulk">Bulk</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Single Item <span className="text-red-500">*</span>
            </label>
            <select 
              value={filters.singleItem}
              onChange={(e) => setFilters({...filters, singleItem: e.target.value})}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none"
            >
              <option value="Specific SKU">Specific SKU</option>
              <option value="All SKUs">All SKUs</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Stock Place <span className="text-red-500">*</span>
            </label>
            <select 
              value={filters.stockPlace}
              onChange={(e) => setFilters({...filters, stockPlace: e.target.value})}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none"
            >
              <option value="">All Warehouses (Multi-select)</option>
              <option value="HO">HO</option>
              <option value="WH-1">WH-1</option>
              <option value="WH-2">WH-2</option>
            </select>
          </div>

          <div className="md:col-span-2 flex items-end gap-3">
            <button 
              onClick={fetchData}
              className="flex-1 bg-blue-700 hover:bg-blue-800 text-white px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-700/20"
            >
              <Search size={18} />
              Search
            </button>
            <button className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-all border border-slate-200">
              <RotateCcw size={18} />
            </button>
            <button className="p-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-all shadow-lg shadow-emerald-500/20">
              <FileSpreadsheet size={18} />
            </button>
            <button className="p-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-lg transition-all shadow-lg shadow-rose-500/20">
              <FileText size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">Actions</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">Item Code</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">Item Name</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">Brand</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">Category</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">Type</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-500 text-right">HO</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-500 text-right">WH-1</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-500 text-right">WH-2</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-500 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={10} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-xs text-slate-500 font-medium">Fetching stock levels...</span>
                    </div>
                  </td>
                </tr>
              ) : data.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <button className="text-blue-500 hover:text-blue-700 transition-colors">
                        <Edit2 size={16} />
                      </button>
                      <button className="text-slate-400 hover:text-slate-600 transition-colors">
                        <Eye size={16} />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-800">{item.code}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{item.name}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{item.brand}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{item.category}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{item.type}</td>
                  <td className="px-6 py-4 text-sm text-right font-medium text-slate-700">{item.ho.toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm text-right font-medium text-slate-700">{item.wh1.toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm text-right font-medium text-slate-700">{item.wh2.toFixed(2)}</td>
                  <td className={`px-6 py-4 text-sm text-right font-bold ${item.total > 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                    {item.total.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination & Summary */}
        <div className="px-6 py-4 bg-amber-50/30 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-slate-100">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Total Items:</span>
              <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded text-[10px] font-bold">1,240</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Filtered Results:</span>
              <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-[10px] font-bold">10 Rows</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <button className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30" disabled>
                <ChevronsLeft size={18} />
              </button>
              <button className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30" disabled>
                <ChevronLeft size={18} />
              </button>
            </div>
            <span className="text-xs font-bold text-slate-700">Page 1 of 42</span>
            <div className="flex items-center gap-1">
              <button className="p-1 text-slate-600 hover:text-blue-600">
                <ChevronRight size={18} />
              </button>
              <button className="p-1 text-slate-600 hover:text-blue-600">
                <ChevronsRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed bottom-8 right-8 bg-white rounded-xl shadow-2xl border border-emerald-100 p-4 flex items-start gap-4 z-50 min-w-[320px]"
          >
            <div className="bg-emerald-100 p-2 rounded-lg">
              <CheckCircle2 size={20} className="text-emerald-600" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-slate-800">Report Filtered</h4>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Displaying mandatory stock views.</p>
            </div>
            <button 
              onClick={() => setShowToast(false)}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={16} />
            </button>
            <div className="absolute bottom-0 left-0 h-1 bg-emerald-500 rounded-full animate-[progress_5s_linear_forwards]"></div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes progress {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};
