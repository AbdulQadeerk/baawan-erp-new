import React from 'react';
import { 
  Search, 
  Plus, 
  Printer, 
  Download, 
  Edit3, 
  Trash2, 
  Eye,
  ChevronLeft,
  ChevronRight,
  Filter,
  RefreshCw,
  MapPin,
  Building2,
  Phone
} from 'lucide-react';
import { motion } from 'motion/react';
import { StockPlace } from '../../types';

const mockStockPlaces: StockPlace[] = [
  { id: '1', name: 'Head Office', code: 'HO', address: 'No address provided', area: '—', city: '—', state: '—', pincode: '—', phone: '—' },
  { id: '2', name: 'Warehouse A', code: 'codet45', address: 'gtfgffgbbfg, 5tfgdfg', area: 'test', city: 'Sangli', state: 'Maharashtra', pincode: '43555', phone: '+91 5455 455 555' },
  { id: '3', name: 'Patil Warehouse', code: 'codet45 54', address: 'Rahul Traders Shop No. 5, Laxmi Market MG Road Pun...', area: 'test', city: 'Mumbai S...', state: 'Maharashtra', pincode: '345354444', phone: '+91 44 4433 4544' },
  { id: '4', name: 'Snehal Pawar', code: 'codty45 6', address: 'test, test', area: 'test', city: 'East Jaint...', state: 'Meghalaya', pincode: '654646', phone: '+91 4564 564 566' },
];

interface StockPlaceListProps {
  onCreateNew?: () => void;
}

export const StockPlaceList: React.FC<StockPlaceListProps> = ({ onCreateNew }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-6 space-y-6"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Stock Place Listings</h1>
          <p className="text-sm text-slate-500 font-bold uppercase tracking-widest opacity-60 mt-1">Manage and track your warehouse locations globally.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-1 shadow-sm">
            <button className="p-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all">
              <Printer size={18} />
            </button>
            <button className="p-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all">
              <Download size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
            <Search size={16} />
          </span>
          <input 
            className="block w-full pl-12 pr-4 py-3 border border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-800 text-xs font-bold focus:ring-4 focus:ring-rose-600/10 focus:border-rose-600 outline-none transition-all dark:text-white placeholder-slate-400" 
            placeholder="Search Stock Place" 
            type="text"
          />
        </div>
        <FilterInput placeholder="Area" />
        <FilterInput placeholder="City" />
        <div className="flex items-center gap-2">
          <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/20 active:scale-95">
            <Filter size={14} /> Search
          </button>
          <button className="p-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 rounded-2xl transition-all active:scale-95" title="Clear Filters">
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">Name</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">Code</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">Address Details</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">Area</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">Location</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">Pin Code</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">Phone</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {mockStockPlaces.map((place) => (
                <tr key={place.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                  <td className="px-8 py-5 font-black text-slate-900 dark:text-white text-sm uppercase tracking-tight">{place.name}</td>
                  <td className="px-8 py-5">
                    <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg text-[10px] font-black font-mono uppercase tracking-widest">{place.code}</span>
                  </td>
                  <td className="px-8 py-5 text-xs font-bold text-slate-500 dark:text-slate-400 italic max-w-xs truncate">{place.address}</td>
                  <td className="px-8 py-5 text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">{place.area}</td>
                  <td className="px-8 py-5">
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-tight">{place.city}</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{place.state}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-xs font-bold text-slate-500 dark:text-slate-400 font-mono">{place.pincode}</td>
                  <td className="px-8 py-5 text-xs font-black text-slate-700 dark:text-slate-300">{place.phone}</td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all"><Eye size={18} /></button>
                      <button className="p-2 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-xl transition-all"><Edit3 size={18} /></button>
                      <button className="p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-10">
            <SummaryStat label="Total Rows" value={mockStockPlaces.length.toString()} />
            <SummaryStat label="Filtered Rows" value={mockStockPlaces.length.toString()} color="text-rose-600" />
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Page 1 of 1</span>
            <div className="flex items-center gap-2">
              <PaginationButton icon={<ChevronLeft size={20} />} disabled />
              <button className="w-9 h-9 rounded-xl bg-rose-600 text-white text-xs font-black shadow-lg shadow-rose-600/20">1</button>
              <PaginationButton icon={<ChevronRight size={20} />} disabled />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const FilterInput = ({ placeholder }: { placeholder: string }) => (
  <input 
    className="block w-full px-5 py-3 border border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-800 text-xs font-bold focus:ring-4 focus:ring-rose-600/10 focus:border-rose-600 outline-none transition-all dark:text-white placeholder-slate-400" 
    placeholder={placeholder} 
    type="text"
  />
);

const SummaryStat = ({ label, value, color = "text-slate-900 dark:text-white" }: { label: string, value: string, color?: string }) => (
  <div className="flex items-center gap-3">
    <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">{label}:</span>
    <span className={`text-sm font-black ${color}`}>{value}</span>
  </div>
);

const PaginationButton = ({ icon, disabled = false }: { icon: React.ReactNode, disabled?: boolean }) => (
  <button 
    disabled={disabled}
    className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-400 hover:text-rose-600 transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-90 shadow-sm"
  >
    {icon}
  </button>
);
