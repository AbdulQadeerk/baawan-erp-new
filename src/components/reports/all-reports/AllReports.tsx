import React, { useState } from 'react';
import { 
  Package, Calculator, FileText, BarChart, ChevronRight, ChevronDown, 
  ShoppingCart, Clock, PieChart, FileCheck, Layers, Sparkles
} from 'lucide-react';
import { Page } from '../../../types';

interface AllReportsProps {
  onModuleClick?: (type: Page, title: string) => void;
}

export const AllReports: React.FC<AllReportsProps> = ({ onModuleClick }) => {
  const [openSection, setOpenSection] = useState<Record<string, boolean>>({
    order: false,
    finalAcc: false,
    outstanding: false,
    register: false,
  });

  const toggleSection = (section: string) => {
    setOpenSection((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleLinkClick = (e: React.MouseEvent, type: Page, title: string) => {
    e.preventDefault();
    if (onModuleClick) {
      onModuleClick(type, title);
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8 space-y-8 bg-slate-50/50 dark:bg-[#0B1120] min-h-screen">
      {/* Header Section */}
      <div className="flex items-center mb-2">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3 tracking-tight">
          <div className="p-2 bg-primary/10 rounded-xl text-primary border border-primary/20 shadow-sm">
             <Sparkles size={20} />
          </div>
          Analytics & Reporting
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 items-start">
        {/* Inventory Column */}
        <div className="group bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col relative">
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-emerald-400 to-emerald-600 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out"></div>
          
          <div className="p-6 border-b border-slate-100 dark:border-slate-800/60 flex items-center gap-4 bg-gradient-to-b from-slate-50/50 to-transparent dark:from-slate-800/20 dark:to-transparent">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-500/20 dark:to-emerald-500/5 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-inner ring-1 ring-emerald-100 dark:ring-emerald-500/20">
              <Package className="w-7 h-7" />
            </div>
            <div>
              <h2 className="font-bold text-slate-800 dark:text-slate-100 text-xl tracking-tight">Inventory</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">Stock & Valuation</p>
            </div>
          </div>
          <div className="p-4 flex-1">
            <ul className="space-y-1">
              <ReportLink onClick={(e) => handleLinkClick(e, 'current-stock-report', 'Current Stock')} title="Current Stock" />
              <ReportLink onClick={(e) => handleLinkClick(e, 'inventory-report', 'Inventory Report')} title="Inventory Report" />
              <ReportLink onClick={(e) => handleLinkClick(e, 'item-register-report', 'Item Register')} title="Item Register" />
              <ReportLink onClick={(e) => handleLinkClick(e, 'pending-report', 'Pending Report')} title="Pending Report" />
              <ReportLink onClick={(e) => handleLinkClick(e, 'stock-valuation-report', 'Stock Valuation')} title="Stock Valuation" />
              <ReportLink title="Purchase Invoice Adjustment Report" />
              <ReportLink onClick={(e) => handleLinkClick(e, 'sales-margin-report', 'Sales Margin Report')} title="Sales Margin Report" />
              <ReportLink onClick={(e) => handleLinkClick(e, 'sales-order-summary', 'SO Summary')} title="SO Summary" />
              <ReportLink title="Batch Stock Summary" />
              <ReportLink onClick={(e) => handleLinkClick(e, 'item-batch-register', 'Item Batch Register')} title="Item Batch Register" />

              {/* Order Collapsible */}
              <li className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => toggleSection('order')}
                  className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-semibold text-slate-800 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-xl transition-colors group"
                >
                  <span className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg flex items-center justify-center bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                      <ShoppingCart size={14} />
                    </span>
                    Order Processing
                  </span>
                  <span className={`text-slate-400 transition-transform duration-300 ${openSection.order ? 'rotate-180' : ''}`}>
                    <ChevronDown size={16} />
                  </span>
                </button>
                <div className={`grid transition-all duration-300 ease-in-out ${openSection.order ? 'grid-rows-[1fr] opacity-100 mt-2' : 'grid-rows-[0fr] opacity-0'}`}>
                  <ul className="overflow-hidden pl-9 space-y-1 relative before:absolute before:left-5 before:top-4 before:bottom-4 before:w-[2px] before:bg-slate-200 dark:before:bg-slate-700">
                    <ReportLink isSub onClick={(e) => handleLinkClick(e, 'process-order-report', 'Process Order')} title="Process Order" />
                    <ReportLink isSub onClick={(e) => handleLinkClick(e, 'schedule-report', 'Schedule Report')} title="Schedule Report" />
                  </ul>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Accounting Column */}
        <div className="group bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col relative">
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-blue-400 to-blue-600 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out"></div>
          
          <div className="p-6 border-b border-slate-100 dark:border-slate-800/60 flex items-center gap-4 bg-gradient-to-b from-slate-50/50 to-transparent dark:from-slate-800/20 dark:to-transparent">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-500/20 dark:to-blue-500/5 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-inner ring-1 ring-blue-100 dark:ring-blue-500/20">
              <Calculator className="w-7 h-7" />
            </div>
            <div>
              <h2 className="font-bold text-slate-800 dark:text-slate-100 text-xl tracking-tight">Accounting</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">Finance & Ledgers</p>
            </div>
          </div>
          <div className="p-4 flex-1">
            <ul className="space-y-1">
              {/* Final Acc Collapsible */}
              <li>
                <button
                  onClick={() => toggleSection('finalAcc')}
                  className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-semibold text-slate-800 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-xl transition-colors group"
                >
                  <span className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg flex items-center justify-center bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                      <PieChart size={14} />
                    </span>
                    Final Accounts
                  </span>
                  <span className={`text-slate-400 transition-transform duration-300 ${openSection.finalAcc ? 'rotate-180' : ''}`}>
                    <ChevronDown size={16} />
                  </span>
                </button>
                <div className={`grid transition-all duration-300 ease-in-out ${openSection.finalAcc ? 'grid-rows-[1fr] opacity-100 mt-2' : 'grid-rows-[0fr] opacity-0'}`}>
                  <ul className="overflow-hidden pl-9 space-y-1 relative before:absolute before:left-5 before:top-4 before:bottom-4 before:w-[2px] before:bg-slate-200 dark:before:bg-slate-700">
                    <ReportLink isSub onClick={(e) => handleLinkClick(e, 'trial-balance-report', 'Trial Balance')} title="Trial Balance" />
                    <ReportLink isSub onClick={(e) => handleLinkClick(e, 'profit-loss', 'P & L Account')} title="P & L Account" />
                    <ReportLink isSub onClick={(e) => handleLinkClick(e, 'balance-sheet', 'Balance Sheet')} title="Balance Sheet" />
                  </ul>
                </div>
              </li>

              {/* Outstanding Collapsible */}
              <li className="pt-1">
                <button
                  onClick={() => toggleSection('outstanding')}
                  className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-semibold text-slate-800 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-xl transition-colors group"
                >
                  <span className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg flex items-center justify-center bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                      <Clock size={14} />
                    </span>
                    Outstanding
                  </span>
                  <span className={`text-slate-400 transition-transform duration-300 ${openSection.outstanding ? 'rotate-180' : ''}`}>
                    <ChevronDown size={16} />
                  </span>
                </button>
                <div className={`grid transition-all duration-300 ease-in-out ${openSection.outstanding ? 'grid-rows-[1fr] opacity-100 mt-2' : 'grid-rows-[0fr] opacity-0'}`}>
                  <ul className="overflow-hidden pl-9 space-y-1 relative before:absolute before:left-5 before:top-4 before:bottom-4 before:w-[2px] before:bg-slate-200 dark:before:bg-slate-700">
                    <ReportLink isSub onClick={(e) => handleLinkClick(e, 'multiple-ledger-outstanding', 'Multiple Outstanding')} title="Multiple Outstanding" />
                    <ReportLink isSub onClick={(e) => handleLinkClick(e, 'ledger-outstanding-report', 'Ledger Outstanding')} title="Ledger Outstanding" />
                    <ReportLink isSub onClick={(e) => handleLinkClick(e, 'ledger-child-outstanding-report', 'Ledger Child Outstanding')} title="Ledger Child Outstanding" />
                    <ReportLink isSub onClick={(e) => handleLinkClick(e, 'outstanding-payments-report', 'Outstanding Payments')} title="Outstanding Payments" />
                    <ReportLink isSub onClick={(e) => handleLinkClick(e, 'outstanding-receipts-report', 'Outstanding Receipts')} title="Outstanding Receipts" />
                    <ReportLink isSub onClick={(e) => handleLinkClick(e, 'sales-person-outstanding-report', 'Sales Person Outstanding')} title="Sales Person Outstanding" />
                    <ReportLink isSub onClick={(e) => handleLinkClick(e, 'ledger-wise-outstanding-report', 'Ledger Wise Outstanding')} title="Ledger Wise Outstanding" />
                    <ReportLink isSub onClick={(e) => handleLinkClick(e, 'ledger-ageing-report', 'Ledger Wise Ageing')} title="Ledger Wise Ageing" />
                  </ul>
                </div>
              </li>

              {/* Register Collapsible */}
              <li className="pt-1">
                <button
                  onClick={() => toggleSection('register')}
                  className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-semibold text-slate-800 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-xl transition-colors group"
                >
                  <span className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg flex items-center justify-center bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                      <FileCheck size={14} />
                    </span>
                    Register
                  </span>
                  <span className={`text-slate-400 transition-transform duration-300 ${openSection.register ? 'rotate-180' : ''}`}>
                    <ChevronDown size={16} />
                  </span>
                </button>
                <div className={`grid transition-all duration-300 ease-in-out ${openSection.register ? 'grid-rows-[1fr] opacity-100 mt-2' : 'grid-rows-[0fr] opacity-0'}`}>
                  <ul className="overflow-hidden pl-9 space-y-1 relative before:absolute before:left-5 before:top-4 before:bottom-4 before:w-[2px] before:bg-slate-200 dark:before:bg-slate-700">
                    <ReportLink isSub onClick={(e) => handleLinkClick(e, 'ledger-register', 'Ledger Register')} title="Ledger Register" />
                    <ReportLink isSub onClick={(e) => handleLinkClick(e, 'sales-register', 'Sales Register')} title="Sales Register" />
                    <ReportLink isSub onClick={(e) => handleLinkClick(e, 'purchase-register', 'Purchase Register')} title="Purchase Register" />
                    <ReportLink isSub title="Sales Register Columnar" />
                    <ReportLink isSub title="Purchase Regd Columnar" />
                  </ul>
                </div>
              </li>

              <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 space-y-1">
                <ReportLink onClick={(e) => handleLinkClick(e, 'aging-analysis', 'Ageing Report')} title="Ageing Report" />
                <ReportLink title="Bank Reconciliation" />
                <ReportLink title="Process Discount" />
                <ReportLink title="Group Summary" />
                <ReportLink title="Dealer Analysis" />
                <ReportLink title="Day Book" />
              </div>
            </ul>
          </div>
        </div>

        {/* Statutory & Marketing Column */}
        <div className="flex flex-col gap-6">
          <div className="group bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col relative">
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-amber-400 to-amber-600 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out"></div>
            
            <div className="p-6 border-b border-slate-100 dark:border-slate-800/60 flex items-center gap-4 bg-gradient-to-b from-slate-50/50 to-transparent dark:from-slate-800/20 dark:to-transparent">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-100 to-amber-50 dark:from-amber-500/20 dark:to-amber-500/5 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-inner ring-1 ring-amber-100 dark:ring-amber-500/20">
                <FileText className="w-7 h-7" />
              </div>
              <div>
                <h2 className="font-bold text-slate-800 dark:text-slate-100 text-xl tracking-tight">Statutory</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">Tax & Compliance</p>
              </div>
            </div>
            <div className="p-4 flex-1">
              <ul className="space-y-1">
                <ReportLink title="GSTR 1" />
                <ReportLink title="GSTR 2" />
                <ReportLink title="GSTR3B" />
                <ReportLink title="VAT Report" />
                <ReportLink title="Process TCS" />
                <ReportLink title="Process TDS" />
              </ul>
            </div>
          </div>

          <div className="group bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col relative">
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-pink-400 to-pink-600 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out"></div>
            
            <div className="p-6 border-b border-slate-100 dark:border-slate-800/60 flex items-center gap-4 bg-gradient-to-b from-slate-50/50 to-transparent dark:from-slate-800/20 dark:to-transparent">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-100 to-pink-50 dark:from-pink-500/20 dark:to-pink-500/5 flex items-center justify-center text-pink-600 dark:text-pink-400 shadow-inner ring-1 ring-pink-100 dark:ring-pink-500/20">
                <BarChart className="w-7 h-7" />
              </div>
              <div>
                <h2 className="font-bold text-slate-800 dark:text-slate-100 text-xl tracking-tight">Marketing</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">Targets & KPIs</p>
              </div>
            </div>
            <div className="p-4 flex-1">
              <ul className="space-y-1">
                <ReportLink title="Ledger Target" />
              </ul>
            </div>
          </div>
        </div>

        {/* Other Reports Column */}
        <div className="group bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col relative">
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-purple-400 to-purple-600 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out"></div>
          
          <div className="p-6 border-b border-slate-100 dark:border-slate-800/60 flex items-center gap-4 bg-gradient-to-b from-slate-50/50 to-transparent dark:from-slate-800/20 dark:to-transparent">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-500/20 dark:to-purple-500/5 flex items-center justify-center text-purple-600 dark:text-purple-400 shadow-inner ring-1 ring-purple-100 dark:ring-purple-500/20">
              <Layers className="w-7 h-7" />
            </div>
            <div>
              <h2 className="font-bold text-slate-800 dark:text-slate-100 text-xl tracking-tight">Other Reports</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">Misc & Analysis</p>
            </div>
          </div>
          <div className="p-4 flex-1">
            <ul className="space-y-1">
              <ReportLink title="MSL Report" />
              <ReportLink title="Sales Person Report" />
              <ReportLink title="Sales Data By Sales Person Report" />
              <ReportLink title="Counter Sale Report" />
              <ReportLink title="Rate Comparision" />
              <ReportLink title="Item Register Group Wise" />
              <ReportLink title="Invoice Item Pending PO" />
              <ReportLink title="Documents Report" />
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

const ReportLink = ({ title, onClick, isSub = false }: { title: string; onClick?: (e: React.MouseEvent) => void; isSub?: boolean }) => {
  return (
    <li>
      <a
        href="#"
        onClick={onClick}
        className={`group flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200
          ${isSub 
            ? "text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary hover:bg-primary/5 dark:hover:bg-primary/10 relative before:absolute before:left-[-16px] before:top-1/2 before:w-4 before:h-[2px] before:bg-slate-200 dark:before:bg-slate-700 hover:before:bg-primary" 
            : "text-slate-700 dark:text-slate-300 hover:text-primary dark:hover:text-primary hover:bg-slate-50 dark:hover:bg-slate-800/80"}
        `}
      >
        <span className="flex items-center gap-3">
          {!isSub && (
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600 group-hover:bg-primary transition-all duration-300 group-hover:scale-150"></span>
          )}
          <span className="transform group-hover:translate-x-1 transition-transform duration-200">{title}</span>
        </span>
        <ChevronRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
      </a>
    </li>
  );
};
