import React from 'react';
import { 
  X, 
  Search, 
  Plus, 
  GripVertical, 
  BarChart2, 
  Map, 
  Wallet, 
  Clock, 
  TrendingUp,
  PlusCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface WidgetLibraryProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WidgetLibrary: React.FC<WidgetLibraryProps> = ({ isOpen, onClose }) => {
  const categories = ['All Categories', 'Sales', 'Finance', 'Inventory', 'HR'];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[120]"
          />
          
          {/* Slide-over Modal */}
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-[520px] bg-white dark:bg-slate-900 shadow-2xl z-[130] flex flex-col border-l border-slate-200 dark:border-slate-800"
          >
            {/* Modal Header */}
            <header className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">Widget Library</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Personalize your business intelligence workspace</p>
                </div>
                <button 
                  onClick={onClose}
                  className="size-8 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Search and Filter */}
              <div className="flex flex-col gap-4">
                <div className="relative">
                  <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20 placeholder:text-slate-400 outline-none dark:text-white" 
                    placeholder="Search widgets (e.g., Revenue, Stock)" 
                    type="text"
                  />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                  {categories.map((cat, i) => (
                    <button 
                      key={cat}
                      className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                        i === 0 
                          ? 'bg-primary text-white' 
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </header>

            {/* Widget Gallery */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              {/* Sales Section */}
              <section className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Sales Analytics</h4>
                  <span className="text-[10px] bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded font-bold">2 AVAILABLE</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <WidgetPreviewCard 
                    title="Daily Revenue" 
                    description="Track gross income trends per day."
                    preview={<DailyRevenuePreview />}
                  />
                  <WidgetPreviewCard 
                    title="Sales by Region" 
                    description="Heatmap of global performance."
                    preview={<SalesByRegionPreview />}
                  />
                </div>
              </section>

              {/* Finance Section */}
              <section className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Finance & Cashflow</h4>
                  <span className="text-[10px] bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-2 py-0.5 rounded font-bold">2 AVAILABLE</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <WidgetPreviewCard 
                    title="Cash on Hand" 
                    description="Real-time liquidity monitoring."
                    preview={<CashOnHandPreview />}
                  />
                  <WidgetPreviewCard 
                    title="Pending Receivables" 
                    description="Overview of outstanding invoices."
                    preview={<PendingReceivablesPreview />}
                  />
                </div>
              </section>

              {/* Inventory Section */}
              <section className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Inventory Control</h4>
                  <span className="text-[10px] bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 px-2 py-0.5 rounded font-bold">1 AVAILABLE</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <WidgetPreviewCard 
                    title="Stock Valuation" 
                    description="Total value of inventory assets."
                    preview={<StockValuationPreview />}
                  />
                  <div className="border border-dashed border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-center bg-slate-50/50 dark:bg-slate-900/50 p-4">
                    <div className="text-center">
                      <PlusCircle size={24} className="text-slate-300 dark:text-slate-700 mx-auto" />
                      <p className="text-[10px] text-slate-400 mt-1 font-medium">Coming Soon</p>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* Modal Footer */}
            <footer className="p-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
              <button className="text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors uppercase tracking-wider">
                Restore Defaults
              </button>
              <div className="flex gap-3">
                <button 
                  onClick={onClose}
                  className="px-6 py-2 rounded-xl text-slate-600 dark:text-slate-400 font-bold text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={onClose}
                  className="px-8 py-2 rounded-xl bg-primary text-white font-bold text-sm shadow-md shadow-primary/20 hover:bg-primary-dark transition-all"
                >
                  Done
                </button>
              </div>
            </footer>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const WidgetPreviewCard = ({ title, description, preview }: { title: string, description: string, preview: React.ReactNode }) => (
  <div className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden hover:border-primary/50 transition-all hover:shadow-lg cursor-grab active:cursor-grabbing">
    <div className="h-32 bg-slate-50 dark:bg-slate-800/50 p-4 flex flex-col justify-end overflow-hidden">
      {preview}
    </div>
    <div className="p-3">
      <h5 className="text-sm font-bold text-slate-800 dark:text-white">{title}</h5>
      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">{description}</p>
    </div>
    <div className="absolute inset-0 bg-primary/60 flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
      <button className="bg-white text-primary px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 shadow-md hover:scale-105 active:scale-95 transition-transform">
        <Plus size={14} /> Add
      </button>
      <GripVertical size={20} className="text-white/80" />
    </div>
  </div>
);

const DailyRevenuePreview = () => (
  <div className="flex items-end gap-1 h-16">
    <div className="w-full bg-primary/20 rounded-t-sm h-[40%]"></div>
    <div className="w-full bg-primary/20 rounded-t-sm h-[60%]"></div>
    <div className="w-full bg-primary rounded-t-sm h-[85%]"></div>
    <div className="w-full bg-primary/20 rounded-t-sm h-[50%]"></div>
    <div className="w-full bg-primary/20 rounded-t-sm h-[70%]"></div>
    <div className="w-full bg-primary/20 rounded-t-sm h-[45%]"></div>
  </div>
);

const SalesByRegionPreview = () => (
  <div className="flex items-center justify-center h-full">
    <div className="relative size-20 rounded-full border-[6px] border-slate-200 dark:border-slate-700 flex items-center justify-center">
      <div className="absolute inset-[-6px] rounded-full border-[6px] border-emerald-500 border-t-transparent border-l-transparent rotate-45"></div>
      <span className="text-[10px] font-bold text-slate-400 uppercase">Geo</span>
    </div>
  </div>
);

const CashOnHandPreview = () => (
  <div className="flex flex-col items-center justify-center h-full w-full">
    <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden relative">
      <div className="absolute inset-y-0 left-0 w-[75%] bg-emerald-500"></div>
    </div>
    <div className="flex justify-between w-full mt-2">
      <span className="text-[9px] font-bold text-slate-400">0%</span>
      <span className="text-[9px] font-bold text-slate-400">100%</span>
    </div>
  </div>
);

const PendingReceivablesPreview = () => (
  <div className="flex flex-col gap-2 h-full justify-center">
    <div className="w-full bg-red-500/20 h-4 rounded-sm flex items-center px-2">
      <div className="w-[80%] h-1.5 bg-red-500 rounded-full"></div>
    </div>
    <div className="w-full bg-amber-500/20 h-4 rounded-sm flex items-center px-2">
      <div className="w-[45%] h-1.5 bg-amber-500 rounded-full"></div>
    </div>
    <div className="w-full bg-emerald-500/20 h-4 rounded-sm flex items-center px-2">
      <div className="w-[60%] h-1.5 bg-emerald-500 rounded-full"></div>
    </div>
  </div>
);

const StockValuationPreview = () => (
  <div className="h-full w-full flex items-center justify-center">
    <svg className="w-full h-full text-primary" fill="none" viewBox="0 0 100 40">
      <path d="M0 35 C 10 35, 20 10, 30 15 S 40 30, 50 25 S 60 5, 70 10 S 80 20, 100 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M0 35 C 10 35, 20 10, 30 15 S 40 30, 50 25 S 60 5, 70 10 S 80 20, 100 5 V 40 H 0 Z" fill="currentColor" fillOpacity="0.1" />
    </svg>
  </div>
);
