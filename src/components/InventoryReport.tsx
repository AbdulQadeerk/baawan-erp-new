import React, { useState } from 'react';
import { 
  Search, 
  FileText, 
  Download, 
  Printer, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  HelpCircle,
  Calendar,
  X
} from 'lucide-react';
import { motion } from 'motion/react';

interface InventoryItem {
  itemCode: string;
  name: string;
  category: string;
  sizes: string;
  type: string;
  typeLabel: 'STANDARD' | 'PREMIUM';
  brand: string;
  group: string;
  date: string;
  docNo: string;
  billType: string;
  stockPlace: string;
}

const mockData: InventoryItem[] = [
  {
    itemCode: 'Itemcodr4555',
    name: 'iPhone',
    category: 'Electronics',
    sizes: 'android',
    type: 'STANDARD',
    typeLabel: 'STANDARD',
    brand: 'Apple',
    group: 'codt4554',
    date: '11/02/2026',
    docNo: 'HO-0001/25-26',
    billType: 'Sales Invoice',
    stockPlace: 'Head Office'
  },
  {
    itemCode: 'Itemcodr4555',
    name: 'iPhone',
    category: 'Electronics',
    sizes: 'android',
    type: 'STANDARD',
    typeLabel: 'STANDARD',
    brand: 'Apple',
    group: 'codt4554',
    date: '13/02/2026',
    docNo: 'HO-0001/25-26',
    billType: 'Sales Invoice',
    stockPlace: 'Head Office'
  },
  {
    itemCode: 'Itemcodr9921',
    name: 'MacBook Pro 14"',
    category: 'Electronics',
    sizes: 'M3 Chip',
    type: 'PREMIUM',
    typeLabel: 'PREMIUM',
    brand: 'Apple',
    group: 'codt8822',
    date: '15/02/2026',
    docNo: 'HO-0452/25-26',
    billType: 'Sales Invoice',
    stockPlace: 'Main Warehouse'
  },
  {
    itemCode: 'Itemcodr1103',
    name: 'Galaxy S24',
    category: 'Electronics',
    sizes: 'android',
    type: 'STANDARD',
    typeLabel: 'STANDARD',
    brand: 'Samsung',
    group: 'codt1010',
    date: '18/02/2026',
    docNo: 'HO-0988/25-26',
    billType: 'Sales Invoice',
    stockPlace: 'Distribution Center'
  }
];

export const InventoryReport: React.FC = () => {
  const [filters, setFilters] = useState({
    itemCode: 'Itemcodr4555',
    itemName: '',
    brand: '',
    party: 'All Parties',
    subCategory: '',
    type: '',
    brandCode: '',
    stockPlace: 'Select Stock Place',
    fromDate: '2026-02-01',
    toDate: '2026-02-19',
    reportType: 'Sales Invoice'
  });

  const [checkboxes, setCheckboxes] = useState({
    inventory: false,
    itemWise: true,
    billDetails: true,
    billTypeWise: false,
    stockPlaceWise: true,
    ledgerWise: false,
    dateWise: true
  });

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-8 bg-slate-50 dark:bg-slate-950 min-h-screen space-y-8"
    >
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Inventory Report</h1>
        <p className="text-sm text-slate-500 font-medium mt-1">Generate and analyze stock movements across various parameters.</p>
      </div>

      {/* Filter Criteria */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-blue-600" />
            <h2 className="font-bold text-slate-800 dark:text-slate-200">Filter Criteria</h2>
          </div>
          <button className="px-4 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold rounded-lg hover:bg-slate-200 transition-all">
            Clear All
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <FilterInput label="ITEM CODE" value={filters.itemCode} />
          <FilterInput label="ITEM NAME" placeholder="Search item name" />
          <FilterInput label="BRAND" placeholder="Select brand" />
          <FilterSelect label="SELECT PARTY" options={['All Parties', 'Party A', 'Party B']} value={filters.party} />
          
          <FilterInput label="SUB CATEGORY" placeholder="Enter sub category" />
          <FilterInput label="TYPE" placeholder="Enter type" />
          <FilterInput label="BRAND CODE" placeholder="Enter brand code" />
          <FilterSelect label="STOCK PLACE" options={['Select Stock Place', 'Head Office', 'Main Warehouse']} value={filters.stockPlace} />
        </div>

        <div className="flex flex-wrap items-center gap-6 mb-8 py-6 border-y border-slate-100 dark:border-slate-800">
          <Checkbox label="Inventory" checked={checkboxes.inventory} />
          <Checkbox label="Item Wise" checked={checkboxes.itemWise} />
          <Checkbox label="Bill Details" checked={checkboxes.billDetails} />
          <Checkbox label="Bill Type Wise" checked={checkboxes.billTypeWise} />
          <Checkbox label="Stock Place Wise" checked={checkboxes.stockPlaceWise} />
          <Checkbox label="Ledger Wise" checked={checkboxes.ledgerWise} />
          <Checkbox label="Date Wise" checked={checkboxes.dateWise} />
        </div>

        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">FROM DATE</label>
              <div className="relative">
                <input 
                  type="date" 
                  value={filters.fromDate} 
                  onChange={(e) => setFilters({...filters, fromDate: e.target.value})}
                  className="pl-4 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium outline-none" 
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">TO DATE</label>
              <div className="relative">
                <input 
                  type="date" 
                  value={filters.toDate} 
                  onChange={(e) => setFilters({...filters, toDate: e.target.value})}
                  className="pl-4 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium outline-none" 
                />
              </div>
            </div>
            <FilterSelect label="REPORT TYPE" options={['Sales Invoice', 'Purchase Invoice']} value={filters.reportType} />
          </div>

          <div className="flex items-center gap-2">
            <ActionButton icon={<Search size={20} />} color="bg-blue-600" />
            <ActionButton icon={<FileText size={20} />} color="bg-emerald-500" />
            <ActionButton icon={<Download size={20} />} color="bg-orange-500" />
            <ActionButton icon={<Printer size={20} />} color="bg-slate-800" />
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">ITEM CODE</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">NAME</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">CATEGORY</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">SIZES</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">TYPE</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">BRAND</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">GROUP</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">DATE</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">DOC NO</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">BILL TYPE</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">STOCK PLACE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {mockData.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-slate-600 dark:text-slate-400">{item.itemCode}</td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-900 dark:text-white">{item.name}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{item.category}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{item.sizes}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-black tracking-widest ${
                      item.typeLabel === 'PREMIUM' 
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                        : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                    }`}>
                      {item.typeLabel}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">{item.brand}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{item.group}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{item.date}</td>
                  <td className="px-6 py-4 text-sm font-bold text-blue-600 hover:underline cursor-pointer">{item.docNo}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{item.billType}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{item.stockPlace}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <p className="text-sm text-slate-500 font-medium">Showing <span className="text-slate-900 dark:text-white font-bold">1</span> to <span className="text-slate-900 dark:text-white font-bold">4</span> of <span className="text-slate-900 dark:text-white font-bold">24</span> entries</p>
          <div className="flex items-center gap-2">
            <button className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-400 hover:bg-slate-50 transition-all disabled:opacity-50" disabled>
              <ChevronLeft size={18} />
            </button>
            <button className="w-10 h-10 bg-blue-600 text-white rounded-lg text-sm font-bold shadow-lg shadow-blue-600/20">1</button>
            <button className="w-10 h-10 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 transition-all">2</button>
            <button className="w-10 h-10 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 transition-all">3</button>
            <button className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-400 hover:bg-slate-50 transition-all">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-8 right-8 flex flex-col gap-4">
        <button className="w-14 h-14 bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform">
          <Plus size={28} />
        </button>
        <button className="w-12 h-12 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full shadow-xl flex items-center justify-center text-slate-400 hover:scale-110 transition-transform">
          <HelpCircle size={24} />
        </button>
      </div>
    </motion.div>
  );
};

const FilterInput = ({ label, value, placeholder }: { label: string, value?: string, placeholder?: string }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</label>
    <input 
      type="text" 
      defaultValue={value}
      placeholder={placeholder}
      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 transition-all"
    />
  </div>
);

const FilterSelect = ({ label, options, value }: { label: string, options: string[], value?: string }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</label>
    <select value={value} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none">
      {options.map(opt => <option key={opt}>{opt}</option>)}
    </select>
  </div>
);

const Checkbox = ({ label, checked }: { label: string, checked: boolean }) => (
  <label className="flex items-center gap-2 cursor-pointer group">
    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
      checked ? 'bg-blue-600 border-blue-600' : 'border-slate-300 dark:border-slate-700 group-hover:border-blue-400'
    }`}>
      {checked && <div className="w-2 h-2 bg-white rounded-full" />}
    </div>
    <span className="text-sm font-bold text-slate-600 dark:text-slate-400">{label}</span>
  </label>
);

const ActionButton = ({ icon, color }: { icon: React.ReactNode, color: string }) => (
  <button className={`p-3 ${color} text-white rounded-xl shadow-lg hover:scale-105 transition-all active:scale-95`}>
    {icon}
  </button>
);
