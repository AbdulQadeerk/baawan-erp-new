import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Download, 
  Printer, 
  Edit3, 
  Trash2, 
  Eye,
  Layers,
  ChevronLeft,
  ChevronRight,
  Filter,
  RefreshCw,
  Box,
  ChevronDown,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { motion } from 'motion/react';
import { Item } from '../../types';
import { itemService } from '../../services/api';

export const ItemList: React.FC<{ onCreateNew?: () => void }> = ({ onCreateNew }) => {
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchItems = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await itemService.list();
      setItems(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Error fetching items:', err);
      setError('Failed to load items from the API.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const filteredItems = items.filter(item => 
    (item.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.code || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 space-y-6"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Item Master Listings</h1>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchItems}
            className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all shadow-sm"
            title="Refresh List"
          >
            <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
          </button>
          <button className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all shadow-sm">
            <Download size={18} />
          </button>
          <button className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all shadow-sm">
            <Printer size={18} />
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="lg:col-span-2 relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            <Search size={16} />
          </span>
          <input 
            className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold focus:ring-2 focus:ring-rose-600/20 focus:border-rose-600 dark:text-white transition-all outline-none" 
            placeholder="Search Item Code or Name..." 
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <FilterSelect options={['All Brands', 'Pigeon', 'Lenovo', 'Apple']} />
        <FilterSelect options={['Category', 'Bottle', 'Accessories', 'Electronics']} />
        <FilterSelect options={['Sub Category']} />
        <div className="flex gap-2">
          <button className="flex-1 bg-blue-600 text-white rounded-xl py-2.5 flex items-center justify-center hover:bg-blue-700 transition-all font-black uppercase tracking-widest text-[10px] shadow-md shadow-blue-600/20 active:scale-95">
            <Filter size={14} className="mr-2" /> Apply
          </button>
          <button 
            onClick={() => setSearchTerm('')}
            className="w-12 flex items-center justify-center border border-slate-200 dark:border-slate-700 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all active:scale-95"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[1200px]">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-black tracking-[0.2em]">
                <th className="px-8 py-5 border-b border-slate-100 dark:border-slate-800 w-24">Actions</th>
                <th className="px-8 py-5 border-b border-slate-100 dark:border-slate-800">Image</th>
                <th className="px-8 py-5 border-b border-slate-100 dark:border-slate-800">Item Code</th>
                <th className="px-8 py-5 border-b border-slate-100 dark:border-slate-800">Item Name</th>
                <th className="px-8 py-5 border-b border-slate-100 dark:border-slate-800">Brand</th>
                <th className="px-8 py-5 border-b border-slate-100 dark:border-slate-800">Category</th>
                <th className="px-8 py-5 border-b border-slate-100 dark:border-slate-800 text-right">Rate</th>
                <th className="px-8 py-5 border-b border-slate-100 dark:border-slate-800">UOM</th>
                <th className="px-8 py-5 border-b border-slate-100 dark:border-slate-800">HSN No</th>
                <th className="px-8 py-5 border-b border-slate-100 dark:border-slate-800 text-center">GST%</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={10} className="px-8 py-12 text-center">
                    <Loader2 size={40} className="animate-spin mx-auto text-slate-300 mb-4" />
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Loading real-time item data...</p>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={10} className="px-8 py-12 text-center">
                    <AlertCircle size={40} className="mx-auto text-rose-500 mb-4" />
                    <p className="text-rose-600 font-bold uppercase tracking-widest text-xs">{error}</p>
                    <button onClick={fetchItems} className="mt-4 text-blue-600 font-bold text-xs uppercase tracking-widest hover:underline">Try Again</button>
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-8 py-12 text-center">
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No items found matching your search.</p>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <button className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 transition-all"><Eye size={18} /></button>
                        <button className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-rose-600 transition-all"><Edit3 size={18} /></button>
                        <button className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20 text-slate-400 hover:text-red-600 transition-all"><Trash2 size={18} /></button>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="w-12 h-12 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden shadow-sm">
                        {item.image ? (
                          <img alt={item.name} className="w-full h-full object-cover" src={item.image} referrerPolicy="no-referrer" />
                        ) : (
                          <Box size={20} className="text-slate-400" />
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-5 font-mono text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">{item.code}</td>
                    <td className="px-8 py-5 font-bold text-slate-900 dark:text-white text-sm">{item.name}</td>
                    <td className="px-8 py-5">
                      <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">{item.brand || 'General'}</span>
                    </td>
                    <td className="px-8 py-5 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">{item.category || 'General'}</td>
                    <td className="px-8 py-5 text-right font-black text-slate-900 dark:text-white">₹{(item.rate || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td className="px-8 py-5 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">{item.unit || 'PCS'}</td>
                    <td className="px-8 py-5 text-xs font-bold text-slate-500 dark:text-slate-400 font-mono">{item.hsn || '—'}</td>
                    <td className="px-8 py-5 text-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${(item.gstPercent || 0) > 5 ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600' : 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600'}`}>
                        {(item.gstPercent || 0).toFixed(2)}%
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Summary */}
        <div className="bg-slate-50 dark:bg-slate-800/80 px-8 py-5 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-10">
            <SummaryStat label="Total Items" value={`${filteredItems.length} Items`} />
            <div className="h-6 w-[1px] bg-slate-300 dark:bg-slate-700"></div>
            <SummaryStat label="Filtered" value={`${filteredItems.length} Results`} color="text-rose-600" />
          </div>
          <div className="flex items-center gap-3">
            <PaginationButton icon={<ChevronLeft size={20} />} disabled />
            <div className="flex items-center gap-2">
              <button className="w-9 h-9 rounded-xl bg-rose-600 text-white text-xs font-black shadow-lg shadow-rose-600/20">1</button>
            </div>
            <PaginationButton icon={<ChevronRight size={20} />} disabled />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const FilterSelect = ({ options }: { options: string[] }) => (
  <div className="relative">
    <select className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-rose-600/20 focus:border-rose-600 transition-all outline-none appearance-none cursor-pointer">
      {options.map(opt => <option key={opt}>{opt}</option>)}
    </select>
    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">
      <ChevronDown size={14} />
    </div>
  </div>
);

const SummaryStat = ({ label, value, color = "text-slate-800 dark:text-white" }: { label: string, value: string, color?: string }) => (
  <div className="flex items-center gap-3">
    <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">{label}:</span>
    <span className={`text-sm font-black ${color}`}>{value}</span>
  </div>
);

const PaginationButton = ({ icon, disabled = false }: { icon: React.ReactNode, disabled?: boolean }) => (
  <button 
    disabled={disabled}
    className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-400 hover:text-rose-600 transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-90 shadow-sm"
  >
    {icon}
  </button>
);
