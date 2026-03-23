import React, { useState } from 'react';
import { 
  History, 
  Plus, 
  Info, 
  Search, 
  Trash2, 
  Calculator, 
  CheckCircle2, 
  AlertCircle,
  ChevronDown,
  Save,
  RotateCcw,
  Package,
  Layers
} from 'lucide-react';
import { motion } from 'motion/react';

interface BOMComponent {
  id: string;
  name: string;
  details: string;
  qty: number;
  unit: string;
  rate: number;
  scrap: number;
}

const initialComponents: BOMComponent[] = [
  {
    id: '1',
    name: 'Cold Rolled Steel Sheet',
    details: '1.2mm Thickness, Grade 304',
    qty: 45.50,
    unit: 'KG',
    rate: 82.00,
    scrap: 2
  },
  {
    id: '2',
    name: 'Lock Mechanism Core',
    details: 'Brass finish, 5-pin cylinder',
    qty: 100,
    unit: 'NOS',
    rate: 145.00,
    scrap: 0.5
  },
  {
    id: '3',
    name: 'Stainless Steel Screws',
    details: 'M4 × 20mm Countersunk',
    qty: 400,
    unit: 'NOS',
    rate: 1.20,
    scrap: 5
  }
];

export const BOMBuilder: React.FC = () => {
  const [components, setComponents] = useState<BOMComponent[]>(initialComponents);

  const calculateExtendedCost = (comp: BOMComponent) => {
    return comp.qty * comp.rate;
  };

  const materialSubtotal = components.reduce((acc, curr) => acc + calculateExtendedCost(curr), 0);
  const packagingCost = 250;
  const laborCharge = 1200;
  const electricityFuel = 450;
  const totalOverheads = laborCharge + electricityFuel;
  const totalProductionCost = materialSubtotal + packagingCost + totalOverheads;
  const costPerUnit = totalProductionCost / 100;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 space-y-6 max-w-[1600px] mx-auto bg-slate-50/50 dark:bg-slate-900/50 min-h-screen"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Bill of Materials Assembly Builder</h1>
          <p className="text-sm text-slate-500 font-medium">Create and manage your multi-stage manufacturing recipes</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-50 transition-all">
            <History size={18} className="text-slate-400" />
            Version History
          </button>
          <button className="flex items-center gap-2 px-6 py-2 bg-blue-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-700/20 hover:bg-blue-800 transition-all">
            <Plus size={18} />
            New Revision
          </button>
        </div>
      </div>

      {/* Finished Good Specifications */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
            <Info size={14} />
          </div>
          <h2 className="font-bold text-slate-800 dark:text-slate-200">Finished Good Specifications</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Item Name / Finished Good</label>
            <div className="relative">
              <select className="w-full pl-4 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium appearance-none outline-none focus:ring-2 focus:ring-blue-500 transition-all">
                <option>Main Door Set (YUC) with Key (LH)</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">BOM Name / Reference</label>
            <input 
              type="text" 
              defaultValue="BOM-2024-MDS-001"
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Version</label>
            <div className="flex items-center gap-2">
              <input 
                type="text" 
                defaultValue="v2.4"
                className="w-24 px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
              <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-black rounded-md uppercase tracking-widest">Active</span>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Yield Qty</label>
            <div className="flex">
              <input 
                type="text" 
                defaultValue="100"
                className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-l-xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
              <span className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border border-l-0 border-slate-200 dark:border-slate-700 rounded-r-xl text-xs font-bold text-slate-500">NOS</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bill of Components */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600">
              <Layers size={20} />
            </div>
            <div>
              <h2 className="font-bold text-slate-800 dark:text-slate-200">Bill of Components</h2>
              <p className="text-xs text-slate-400">12 Items</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Search components..."
                className="pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all w-64"
              />
            </div>
            <button className="p-2 bg-slate-900 dark:bg-slate-700 text-white rounded-xl hover:bg-slate-800 transition-all">
              <Plus size={20} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/50">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">#</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Component Name & Details</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Required Qty</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Unit</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Unit Rate (₹)</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Scrap %</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Extended Cost</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {components.map((comp, idx) => (
                <tr key={comp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4 text-sm font-mono text-slate-400">{String(idx + 1).padStart(2, '0')}</td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900 dark:text-white">{comp.name}</div>
                    <div className="text-xs text-slate-500">{comp.details}</div>
                  </td>
                  <td className="px-6 py-4">
                    <input 
                      type="text" 
                      defaultValue={comp.qty.toFixed(2)}
                      className="w-24 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-center outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-[10px] font-bold text-slate-500 uppercase">{comp.unit}</span>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-300">
                    ₹ {comp.rate.toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    <input 
                      type="text" 
                      defaultValue={comp.scrap}
                      className="w-16 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-center outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4 text-sm font-black text-slate-900 dark:text-white">
                    ₹ {calculateExtendedCost(comp).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button className="p-2 text-slate-300 hover:text-rose-500 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 bg-slate-50/50 dark:bg-slate-800/20 border-t border-slate-100 dark:border-slate-800">
          <button className="w-full py-2 flex items-center justify-center gap-2 text-sm font-bold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all">
            <Plus size={16} /> Add More Rows
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Costing Analysis */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-8">
            <Calculator size={18} className="text-blue-600" />
            <h2 className="font-bold text-slate-800 dark:text-slate-200">Costing Analysis</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500">Direct Material</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">₹ {materialSubtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500">Packaging</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">₹</span>
                  <input 
                    type="text" 
                    defaultValue="250"
                    className="w-20 px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-right outline-none"
                  />
                </div>
              </div>
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <span className="text-sm font-bold text-slate-900 dark:text-white">Material Subtotal</span>
                <span className="text-sm font-black text-blue-600">₹ {(materialSubtotal + packagingCost).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500">Labor Charge</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">₹</span>
                  <input 
                    type="text" 
                    defaultValue="1200"
                    className="w-20 px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-right outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500">Electricity / Fuel</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">₹</span>
                  <input 
                    type="text" 
                    defaultValue="450"
                    className="w-20 px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-right outline-none"
                  />
                </div>
              </div>
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <span className="text-sm font-bold text-slate-900 dark:text-white">Total Overheads</span>
                <span className="text-sm font-black text-orange-600">₹ {totalOverheads.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            <div className="bg-blue-50/50 dark:bg-blue-900/10 p-6 rounded-2xl border border-blue-100 dark:border-blue-900/20 flex flex-col items-center justify-center text-center">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Production Cost</p>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-4">₹ {totalProductionCost.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h3>
              <div className="w-full h-px bg-blue-200 dark:bg-blue-800 mb-4"></div>
              <div className="flex items-center gap-4">
                <div className="text-left">
                  <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Cost Per Unit</p>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-[10px] font-black rounded">₹ {costPerUnit.toFixed(2)} / NOS</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Finalize BOM */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col">
          <h2 className="font-bold text-slate-800 dark:text-slate-200 mb-2">Finalize BOM</h2>
          <p className="text-xs text-slate-500 mb-6">Review all components and overheads before saving this version.</p>

          <div className="space-y-3 mb-auto">
            <div className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/30 rounded-xl">
              <CheckCircle2 size={18} className="text-emerald-600" />
              <div>
                <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">Validation Passed</p>
                <p className="text-[10px] text-emerald-600/80">All required fields are filled</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 rounded-xl">
              <Info size={18} className="text-blue-600" />
              <div>
                <p className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-widest">Yield Status</p>
                <p className="text-[10px] text-blue-600/80">Calculated for 100 units</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-8">
            <button className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all">
              <RotateCcw size={18} />
              CLEAR
            </button>
            <button className="flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all">
              <Save size={18} />
              SAVE BOM
            </button>
          </div>
        </div>
      </div>

      {/* Footer Meta */}
      <div className="pt-8 flex flex-col md:flex-row items-center justify-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
        <span>System Timestamp: 2025-01-04 14:30:22</span>
        <span className="hidden md:block">|</span>
        <span>User ID: ADM-992</span>
        <span className="hidden md:block">|</span>
        <span>Internal Revision Trace: AE-X821</span>
      </div>
    </motion.div>
  );
};
