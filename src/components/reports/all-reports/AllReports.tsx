import React, { useState } from 'react';
import { Package, Calculator, FileText, BarChart, Files, ChevronRight, ChevronDown, FileBox, Tag, ShoppingCart, Clock, Calculator as CalcIcon, Percent, FileCheck, CircleDollarSign, TrendingUp, DollarSign, Wallet, Store, Receipt, Banknote, List, FolderOpen } from 'lucide-react';
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
    <div className="max-w-[1600px] mx-auto p-4 sm:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <Files className="text-primary" /> Reports
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* Inventory Column */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col h-full">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Package size={20} />
            </div>
            <h2 className="font-bold text-slate-800 dark:text-white text-lg">Inventory</h2>
          </div>
          <div className="p-2 flex-1 overflow-y-auto">
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
              <li className="pt-2">
                <button
                  onClick={() => toggleSection('order')}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg transition-colors"
                >
                  <span className="w-5 h-5 rounded flex items-center justify-center bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400">
                    {openSection.order ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </span>
                  Order
                </button>
                {openSection.order && (
                  <ul className="pl-9 mt-1 space-y-1 border-l-2 border-slate-100 dark:border-slate-800 ml-5 py-1">
                    <ReportLink isSub onClick={(e) => handleLinkClick(e, 'process-order-report', 'Process Order')} title="Process Order" />
                    <ReportLink isSub onClick={(e) => handleLinkClick(e, 'schedule-report', 'Schedule Report')} title="Schedule Report" />
                  </ul>
                )}
              </li>
            </ul>
          </div>
        </div>

        {/* Accounting Column */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col h-full">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Calculator size={20} />
            </div>
            <h2 className="font-bold text-slate-800 dark:text-white text-lg">Accounting</h2>
          </div>
          <div className="p-2 flex-1 overflow-y-auto">
            <ul className="space-y-1">
              {/* Final Acc Collapsible */}
              <li>
                <button
                  onClick={() => toggleSection('finalAcc')}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg transition-colors"
                >
                  <span className="w-5 h-5 rounded flex items-center justify-center bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400">
                    {openSection.finalAcc ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </span>
                  Final Acc
                </button>
                {openSection.finalAcc && (
                  <ul className="pl-9 mt-1 space-y-1 border-l-2 border-slate-100 dark:border-slate-800 ml-5 py-1">
                    <ReportLink isSub onClick={(e) => handleLinkClick(e, 'trial-balance-report', 'Trial Balance')} title="Trial Balance" />
                    <ReportLink isSub onClick={(e) => handleLinkClick(e, 'profit-loss', 'P & L Account')} title="P & L Account" />
                    <ReportLink isSub onClick={(e) => handleLinkClick(e, 'balance-sheet', 'Balance Sheet')} title="Balance Sheet" />
                  </ul>
                )}
              </li>

              {/* Outstanding Collapsible */}
              <li className="pt-1">
                <button
                  onClick={() => toggleSection('outstanding')}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg transition-colors"
                >
                  <span className="w-5 h-5 rounded flex items-center justify-center bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400">
                    {openSection.outstanding ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </span>
                  Outstanding
                </button>
                {openSection.outstanding && (
                  <ul className="pl-9 mt-1 space-y-1 border-l-2 border-slate-100 dark:border-slate-800 ml-5 py-1">
                    <ReportLink isSub onClick={(e) => handleLinkClick(e, 'multiple-ledger-outstanding', 'Multiple Outstanding')} title="Multiple Outstanding" />
                    <ReportLink isSub onClick={(e) => handleLinkClick(e, 'ledger-outstanding-report', 'Ledger Outstanding')} title="Ledger Outstanding" />
                    <ReportLink isSub onClick={(e) => handleLinkClick(e, 'ledger-child-outstanding-report', 'Ledger Child Outstanding')} title="Ledger Child Outstanding" />
                    <ReportLink isSub onClick={(e) => handleLinkClick(e, 'outstanding-payments-report', 'Outstanding Payments')} title="Outstanding Payments" />
                    <ReportLink isSub onClick={(e) => handleLinkClick(e, 'outstanding-receipts-report', 'Outstanding Receipts')} title="Outstanding Receipts" />
                    <ReportLink isSub onClick={(e) => handleLinkClick(e, 'sales-person-outstanding-report', 'Sales Person Outstanding')} title="Sales Person Outstanding" />
                    <ReportLink isSub onClick={(e) => handleLinkClick(e, 'ledger-wise-outstanding-report', 'Ledger Wise Outstanding')} title="Ledger Wise Outstanding" />
                    <ReportLink isSub onClick={(e) => handleLinkClick(e, 'ledger-ageing-report', 'Ledger Wise Ageing')} title="Ledger Wise Ageing" />
                  </ul>
                )}
              </li>

              {/* Register Collapsible */}
              <li className="pt-1">
                <button
                  onClick={() => toggleSection('register')}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg transition-colors"
                >
                  <span className="w-5 h-5 rounded flex items-center justify-center bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400">
                    {openSection.register ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </span>
                  Register
                </button>
                {openSection.register && (
                  <ul className="pl-9 mt-1 space-y-1 border-l-2 border-slate-100 dark:border-slate-800 ml-5 py-1">
                    <ReportLink isSub onClick={(e) => handleLinkClick(e, 'ledger-register', 'Ledger Register')} title="Ledger Register" />
                    <ReportLink isSub onClick={(e) => handleLinkClick(e, 'sales-register', 'Sales Register')} title="Sales Register" />
                    <ReportLink isSub onClick={(e) => handleLinkClick(e, 'purchase-register', 'Purchase Register')} title="Purchase Register" />
                    <ReportLink isSub title="Sales Register Columnar" />
                    <ReportLink isSub title="Purchase Regd Columnar" />
                  </ul>
                )}
              </li>

              <div className="pt-2 mt-2 border-t border-slate-100 dark:border-slate-800">
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
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex-1 flex flex-col">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <FileText size={20} />
              </div>
              <h2 className="font-bold text-slate-800 dark:text-white text-lg">Statutory</h2>
            </div>
            <div className="p-2 flex-1 overflow-y-auto">
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

          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex-1 flex flex-col">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-pink-50 dark:bg-pink-500/10 flex items-center justify-center text-pink-600 dark:text-pink-400">
                <BarChart size={20} />
              </div>
              <h2 className="font-bold text-slate-800 dark:text-white text-lg">Marketing</h2>
            </div>
            <div className="p-2 flex-1 overflow-y-auto">
              <ul className="space-y-1">
                <ReportLink title="Ledger Target" />
              </ul>
            </div>
          </div>
        </div>

        {/* Other Reports Column */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col h-full">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <Files size={20} />
            </div>
            <h2 className="font-bold text-slate-800 dark:text-white text-lg">Other Reports</h2>
          </div>
          <div className="p-2 flex-1 overflow-y-auto">
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
        className={`block px-3 py-2 text-sm font-medium rounded-lg transition-colors
          ${isSub 
            ? "text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary hover:bg-slate-50 dark:hover:bg-slate-800/50" 
            : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"}
        `}
      >
        {isSub && <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600 mr-2 -ml-1 align-middle"></span>}
        {title}
      </a>
    </li>
  );
};
