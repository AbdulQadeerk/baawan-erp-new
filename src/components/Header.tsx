import React, { useState } from "react";
import { Page, SplitMode } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { SplitScreenMenu } from "./SplitScreenMenu";
import {
  LayoutDashboard,
  Receipt,
  ShoppingCart,
  FileText,
  Settings,
  Maximize2,
  Moon,
  Sun,
  Bell,
  Search,
  ChevronDown,
  Calendar,
  Link as LinkIcon,
  Home,
  Landmark,
  BookOpen,
  Network,
  Coins,
  Package,
  Layers,
  LayoutGrid,
  Award,
  Box,
  Warehouse,
  ShieldCheck,
  Settings2,
  Gavel,
  Banknote,
  Truck,
  CreditCard,
  Send,
  History,
  ArrowLeftRight,
  Megaphone,
  Clock,
  UserSearch,
  Scale,
  TrendingUp,
  BarChart3,
  AlertCircle,
  ChevronRight,
  CheckCircle2,
  ArrowRight,
  Plus,
  List,
  Users2,
  Users,
  UserPlus,
  Shield,
  PieChart,
  FolderTree,
  MapPin,
  Wallet,
  Calculator,
  LogOut,
  ListChecks,
  Book,
  Percent,
  Target,
  Menu,
  X,
  Sparkles,
} from "lucide-react";

interface HeaderProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  isDark: boolean;
  toggleDark: () => void;
  onLogout: () => void;
  splitMode: SplitMode;
  onSplitChange: (mode: SplitMode) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPage,
  setCurrentPage,
  isDark,
  toggleDark,
  onLogout,
  splitMode,
  onSplitChange,
}) => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [showSplitMenu, setShowSplitMenu] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedMobileSection, setExpandedMobileSection] = useState<string | null>(null);

  const handleNavigate = (page: Page, title: string) => {
    setCurrentPage(page);
    setActiveMenu(null);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 transition-colors duration-200">
      <div className="max-w-[1600px] mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 lg:gap-8">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-500 mr-1"
            title="Toggle Menu"
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => handleNavigate("dashboard", "Dashboard")}
          >
            <div className="w-10 h-10 bg-gradient-to-tr from-brand-red to-brand-amber rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg">
              B
            </div>
            <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
              baawan.com
            </span>
          </div>

          <nav className="hidden lg:flex items-center gap-6 flex-shrink-0">
            <button className="flex items-center gap-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:opacity-80">
              <LayoutDashboard size={18} /> CRM
            </button>
            <button className="flex items-center gap-1.5 text-sm font-medium text-amber-600 dark:text-amber-400 hover:opacity-80">
              <ShoppingCart size={18} /> E-Commerce
            </button>
            <button className="flex items-center gap-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:opacity-80">
              <FileText size={18} /> CMS
            </button>
            <button 
              onClick={() => handleNavigate("ai-chat", "Baawan AI Assistant")}
              className="flex items-center gap-1.5 text-sm font-semibold text-purple-600 dark:text-purple-400 hover:opacity-80 cursor-pointer"
            >
              <Sparkles size={18} className="animate-pulse" /> Baawan AI
            </button>
          </nav>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden md:block text-right">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              ERP Administrator
            </p>
            <p className="text-xs text-slate-400">01/04/2025 - 31/03/2026</p>
          </div>

          <div
            className="hidden lg:block relative"
            onMouseEnter={() => setShowSplitMenu(true)}
            onMouseLeave={() => setShowSplitMenu(false)}
          >
            <button
              onClick={() => {
                if (!document.fullscreenElement) {
                  document.documentElement.requestFullscreen().catch((err) => {
                    console.error(
                      `Error attempting to enable full-screen mode: ${err.message}`,
                    );
                  });
                } else {
                  if (document.exitFullscreen) {
                    document.exitFullscreen();
                  }
                }
              }}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500"
              title="Toggle Fullscreen"
            >
              <Maximize2 size={20} />
            </button>
            <AnimatePresence>
              {showSplitMenu && (
                <SplitScreenMenu
                  currentMode={splitMode}
                  onSelect={(mode) => {
                    onSplitChange(mode);
                    setShowSplitMenu(false);
                  }}
                />
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={() => {
              if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch((err) => {
                  console.error(
                    `Error attempting to enable full-screen mode: ${err.message}`,
                  );
                });
              } else {
                if (document.exitFullscreen) {
                  document.exitFullscreen();
                }
              }
            }}
            className="hidden md:block lg:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500"
            title="Toggle Fullscreen"
          >
            <Maximize2 size={20} />
          </button>

          <div className="relative group">
            <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
            </button>
          </div>

          <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full flex items-center justify-center font-bold text-slate-600 dark:text-slate-300">
            EA
          </div>

          <button
            onClick={() => {
              toggleDark();
            }}
            className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDark ? (
              <Sun size={18} className="text-amber-400" />
            ) : (
              <Moon size={18} className="text-slate-500" />
            )}
          </button>

          <button
            onClick={() => {
              if (window.confirm("Are you sure you want to sign out?")) {
                onLogout();
              }
            }}
            className="p-2 bg-red-50 dark:bg-red-900/20 rounded-full hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors text-red-600 dark:text-red-400"
            title="Sign Out"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>

      {/* Sub-navigation */}
      <div className="hidden lg:flex bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 px-4 h-12 items-center relative">
        <div className="max-w-[1600px] mx-auto w-full flex items-center justify-between text-sm font-medium text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-6 h-full">
            <button
              onClick={() => handleNavigate("dashboard", "Dashboard")}
              className={`flex items-center gap-1 hover:text-primary transition-colors ${currentPage === "dashboard" ? "text-primary" : ""}`}
            >
              <Home size={18} />
            </button>

            {/* Master Mega Menu */}
            <div
              className="relative h-12 flex items-center"
              onMouseEnter={() => setActiveMenu("master")}
              onMouseLeave={() => setActiveMenu(null)}
            >
              <button
                className={`flex items-center gap-0.5 hover:text-primary transition-colors cursor-pointer h-full px-1 ${activeMenu === "master" ? "text-primary" : ""}`}
              >
                Master <ChevronDown size={14} />
              </button>
              <AnimatePresence>
                {activeMenu === "master" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-[-100px] w-[1000px] bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 z-[60] rounded-b-2xl overflow-hidden"
                  >
                    <div className="grid grid-cols-4 gap-8 p-8">
                      <div>
                        <h3 className="flex items-center gap-2 text-[10px] font-bold text-primary uppercase tracking-widest mb-6 border-b border-primary/10 pb-2">
                          <Landmark size={14} /> Accounting
                        </h3>
                        <div className="space-y-1">
                          <MenuLink
                            icon={<List size={16} />}
                            label="Ledger List"
                            onClick={() =>
                              handleNavigate("ledger-list", "Ledger Master")
                            }
                          />
                          <MenuLink
                            icon={<FolderTree size={16} />}
                            label="Group List"
                            onClick={() =>
                              handleNavigate("group-list", "Group Master")
                            }
                          />
                          <MenuLink
                            icon={<List size={16} />}
                            label="Currency List"
                            onClick={() =>
                              handleNavigate("currency-list", "Currency Master")
                            }
                          />
                        </div>
                      </div>
                      <div>
                        <h3 className="flex items-center gap-2 text-[10px] font-bold text-brand-amber uppercase tracking-widest mb-6 border-b border-brand-amber/20 pb-2">
                          <Package size={14} /> Inventory
                        </h3>
                        <div className="space-y-1">
                          <MenuLink
                            icon={<List size={16} />}
                            label="Item List"
                            color="text-brand-amber"
                            onClick={() =>
                              handleNavigate("item-list", "Item Master")
                            }
                          />
                          <MenuLink
                            icon={<Layers size={16} />}
                            label="BOM List"
                            color="text-brand-amber"
                            onClick={() =>
                              handleNavigate("bom-list", "BOM Master")
                            }
                          />
                          <MenuLink
                            icon={<LayoutGrid size={16} />}
                            label="Unit List"
                            color="text-brand-amber"
                            onClick={() =>
                              handleNavigate("unit-list", "Unit Master")
                            }
                          />
                          <MenuLink
                            icon={<Warehouse size={16} />}
                            label="Stock Place List"
                            color="text-brand-amber"
                            onClick={() =>
                              handleNavigate(
                                "stock-place-list",
                                "Stock Place Master",
                              )
                            }
                          />
                        </div>
                      </div>
                      <div>
                        <h3 className="flex items-center gap-2 text-[10px] font-bold text-brand-emerald uppercase tracking-widest mb-6 border-b border-brand-emerald/10 pb-2">
                          <ShieldCheck size={14} /> Statutory
                        </h3>
                        <div className="space-y-1">
                          <MenuLink
                            icon={<List size={16} />}
                            label="Extra Charges"
                            color="text-brand-emerald"
                            onClick={() =>
                              handleNavigate(
                                "extra-charge-list",
                                "Extra Charge Master",
                              )
                            }
                          />
                          <MenuLink
                            icon={<Gavel size={16} />}
                            label="Terms & Cond."
                            color="text-brand-emerald"
                            onClick={() =>
                              handleNavigate("terms-list", "Terms & Conditions")
                            }
                          />
                        </div>
                      </div>
                      <div>
                        <h3 className="flex items-center gap-2 text-[10px] font-bold text-rose-600 uppercase tracking-widest mb-6 border-b border-rose-600/10 pb-2">
                          <Users2 size={14} /> Admin
                        </h3>
                        <div className="space-y-1">
                          <MenuLink
                            icon={<UserSearch size={16} />}
                            label="User List"
                            color="text-rose-600"
                            onClick={() =>
                              handleNavigate("user-list", "User Master")
                            }
                          />
                          <MenuLink
                            icon={<Shield size={16} />}
                            label="User Roles"
                            color="text-rose-600"
                            onClick={() =>
                              handleNavigate("role-list", "User Role Master")
                            }
                          />
                          <MenuLink
                            icon={<UserPlus size={16} />}
                            label="Sales Person List"
                            color="text-rose-600"
                            onClick={() =>
                              handleNavigate(
                                "sales-person-list",
                                "Sales Person Master",
                              )
                            }
                          />
                          <MenuLink
                            icon={<MapPin size={16} />}
                            label="Project Site List"
                            color="text-rose-600"
                            onClick={() =>
                              handleNavigate(
                                "project-site-list",
                                "Project Site Master",
                              )
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Transactions Mega Menu */}
            <div
              className="relative h-12 flex items-center"
              onMouseEnter={() => setActiveMenu("transactions")}
              onMouseLeave={() => setActiveMenu(null)}
            >
              <button
                className={`flex items-center gap-0.5 hover:text-primary transition-colors cursor-pointer h-full px-1 ${activeMenu === "transactions" ? "text-primary" : ""}`}
              >
                Transactions <ChevronDown size={14} />
              </button>
              <AnimatePresence>
                {activeMenu === "transactions" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-[-200px] w-[900px] bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 z-[60] rounded-b-2xl overflow-hidden"
                  >
                    <div className="grid grid-cols-3 gap-8 p-8">
                      <div className="bg-blue-50/30 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-900/20">
                        <h3 className="flex items-center gap-2 text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-6">
                          <Banknote size={14} /> Sales Workflow
                        </h3>
                        <div className="grid grid-cols-1 gap-2">
                          <WorkflowLink label="Quotation" />
                          <WorkflowLink label="Order" />
                          <WorkflowLink
                            label="Schedule to Invoice"
                            onClick={() =>
                              handleNavigate(
                                "schedule-to-invoice",
                                "Schedule to Invoice",
                              )
                            }
                          />
                          <WorkflowLink
                            label="Invoice"
                            active
                            onClick={() =>
                              handleNavigate("invoice-list", "Sales Invoice")
                            }
                          />
                          <WorkflowLink label="Return" />
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="flex items-center gap-2 text-[10px] font-bold text-brand-amber uppercase tracking-widest mb-6">
                          <Truck size={14} /> Purchase Workflow
                        </h3>
                        <div className="space-y-1">
                          <WorkflowStep label="PO" title="Purchase Order" />
                          <WorkflowStep label="GR" title="GRN" />
                          <WorkflowStep label="PI" title="Purchase Invoice" />
                          <WorkflowStep label="RT" title="Return" />
                        </div>
                      </div>
                      <div className="p-4 border-l border-slate-100 dark:border-slate-800">
                        <h3 className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">
                          <Coins size={14} /> Finance
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                          <FinanceCard
                            icon={<Receipt size={18} />}
                            label="Receipt"
                          />
                          <FinanceCard
                            icon={<Send size={18} />}
                            label="Payment"
                          />
                          <FinanceCard
                            icon={<History size={18} />}
                            label="Journal"
                          />
                          <FinanceCard
                            icon={<ArrowLeftRight size={18} />}
                            label="Contra"
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="relative h-12 flex items-center">
              <button
                onClick={() => handleNavigate("invoice-list", "Sales Invoice")}
                className={`flex items-center gap-0.5 transition-colors h-full px-1 border-b-2 ${
                  currentPage === "invoice-list" ||
                  currentPage === "invoice-create"
                    ? "text-brand-red border-brand-red"
                    : "hover:text-primary border-transparent"
                }`}
              >
                Invoice <ChevronDown size={14} />
              </button>
            </div>

            {/* Inventory Mega Menu */}
            <div
              className="relative h-12 flex items-center"
              onMouseEnter={() => setActiveMenu("inventory")}
              onMouseLeave={() => setActiveMenu(null)}
            >
              <button
                className={`flex items-center gap-0.5 hover:text-primary transition-colors cursor-pointer h-full px-1 border-b-2 ${
                  currentPage === "inventory-movement-analysis" ||
                  currentPage === "item-stock-ledger" ||
                  currentPage === "current-stock-report"
                    ? "text-brand-emerald border-brand-emerald"
                    : "hover:text-primary border-transparent"
                }`}
              >
                Inventory <ChevronDown size={14} />
              </button>
              <AnimatePresence>
                {activeMenu === "inventory" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-[-200px] w-[800px] bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 z-[60] rounded-b-2xl overflow-hidden"
                  >
                    <div className="grid grid-cols-2 gap-8 p-8">
                      <div>
                        <h3 className="flex items-center gap-2 text-[10px] font-bold text-brand-emerald uppercase tracking-widest mb-6 border-b border-brand-emerald/10 pb-2">
                          <TrendingUp size={14} /> Analysis & Reports
                        </h3>
                        <div className="space-y-1">
                          <MenuLink
                            icon={<TrendingUp size={16} />}
                            label="Movement Analysis"
                            color="text-brand-emerald"
                            onClick={() =>
                              handleNavigate(
                                "inventory-movement-analysis",
                                "Inventory Movement Analysis",
                              )
                            }
                          />
                          <MenuLink
                            icon={<BookOpen size={16} />}
                            label="Item Stock Ledger"
                            color="text-brand-emerald"
                            onClick={() =>
                              handleNavigate(
                                "item-stock-ledger",
                                "Item Stock Ledger",
                              )
                            }
                          />
                          <MenuLink
                            icon={<Package size={16} />}
                            label="Current Stock"
                            color="text-brand-emerald"
                            onClick={() =>
                              handleNavigate(
                                "current-stock-report",
                                "Current Stock Report",
                              )
                            }
                          />
                          <MenuLink
                            icon={<Layers size={16} />}
                            label="BOM Assembly Builder"
                            color="text-brand-emerald"
                            onClick={() =>
                              handleNavigate(
                                "bom-builder",
                                "BOM Assembly Builder",
                              )
                            }
                          />
                          <MenuLink
                            icon={<BarChart3 size={16} />}
                            label="Stock Summary"
                            color="text-brand-emerald"
                          />
                        </div>
                      </div>
                      <div>
                        <h3 className="flex items-center gap-2 text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-6 border-b border-blue-600/10 pb-2">
                          <Layers size={14} /> Operations
                        </h3>
                        <div className="space-y-1">
                          <MenuLink
                            icon={<Plus size={16} />}
                            label="Stock Adjustment"
                            color="text-blue-600"
                          />
                          <MenuLink
                            icon={<ArrowLeftRight size={16} />}
                            label="Inter-WH Transfer"
                            color="text-blue-600"
                          />
                          <MenuLink
                            icon={<History size={16} />}
                            label="Stock History"
                            color="text-blue-600"
                          />
                          <MenuLink
                            icon={<AlertCircle size={16} />}
                            label="Low Stock Alerts"
                            color="text-rose-600"
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Accounts Mega Menu */}
            <div
              className="relative h-12 flex items-center"
              onMouseEnter={() => setActiveMenu("accounts")}
              onMouseLeave={() => setActiveMenu(null)}
            >
              <button
                className={`flex items-center gap-0.5 hover:text-primary transition-colors cursor-pointer h-full px-1 border-b-2 ${
                  currentPage === "receipt-voucher-list" ||
                  currentPage === "receipt-voucher-create" ||
                  currentPage === "payment-voucher-list" ||
                  currentPage === "payment-voucher-create"
                    ? "text-primary border-primary"
                    : "border-transparent"
                }`}
              >
                Accounts <ChevronDown size={14} />
              </button>
              <AnimatePresence>
                {activeMenu === "accounts" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-[-150px] w-[500px] bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 z-[60] rounded-b-2xl overflow-hidden"
                  >
                    <div className="grid grid-cols-2 gap-8 p-8">
                      <div>
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 flex items-center gap-2">
                          <CreditCard size={14} className="text-primary" />
                          Vouchers
                        </h3>
                        <div className="space-y-1">
                          <MenuLink
                            icon={<List size={16} />}
                            label="Receipt Vouchers"
                            color="text-primary"
                            onClick={() =>
                              handleNavigate(
                                "receipt-voucher-list",
                                "Receipt Vouchers",
                              )
                            }
                          />
                          <MenuLink
                            icon={<Plus size={16} />}
                            label="New Receipt"
                            color="text-primary"
                            onClick={() =>
                              handleNavigate(
                                "receipt-voucher-create",
                                "New Receipt Voucher",
                              )
                            }
                          />
                          <MenuLink
                            icon={<List size={16} />}
                            label="Payment Vouchers"
                            color="text-primary"
                            onClick={() =>
                              handleNavigate(
                                "payment-voucher-list",
                                "Payment Vouchers",
                              )
                            }
                          />
                          <MenuLink
                            icon={<Plus size={16} />}
                            label="New Payment"
                            color="text-primary"
                            onClick={() =>
                              handleNavigate(
                                "payment-voucher-create",
                                "New Payment Voucher",
                              )
                            }
                          />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 flex items-center gap-2">
                          <PieChart size={14} className="text-primary" />
                          Analysis
                        </h3>
                        <div className="space-y-1">
                          <MenuLink
                            icon={<FolderTree size={16} />}
                            label="Chart of Accounts"
                            color="text-primary"
                            onClick={() =>
                              handleNavigate(
                                "chart-of-accounts",
                                "Chart of Accounts",
                              )
                            }
                          />
                          <MenuLink
                            icon={<PieChart size={16} />}
                            label="Outstanding Report"
                            color="text-primary"
                            onClick={() =>
                              handleNavigate(
                                "outstanding-report",
                                "Outstanding Report",
                              )
                            }
                          />
                          <MenuLink
                            icon={<Scale size={16} />}
                            label="Trial Balance"
                            color="text-primary"
                            onClick={() =>
                              handleNavigate(
                                "trial-balance-report",
                                "Trial Balance Report",
                              )
                            }
                          />
                          <MenuLink
                            icon={<List size={16} />}
                            label="Bill-wise Drilldown"
                            color="text-primary"
                            onClick={() =>
                              handleNavigate(
                                "bill-wise-drilldown",
                                "Bill-wise Drilldown",
                              )
                            }
                          />
                          <MenuLink
                            icon={<Landmark size={16} />}
                            label="Bank Reconciliation"
                            color="text-primary"
                            onClick={() =>
                              handleNavigate(
                                "bank-reconciliation",
                                "Bank Reconciliation",
                              )
                            }
                          />
                          <MenuLink
                            icon={<FolderTree size={16} />}
                            label="Group Summary"
                            color="text-primary"
                            onClick={() =>
                              handleNavigate(
                                "group-summary",
                                "Group Summary",
                              )
                            }
                          />
                          <MenuLink
                            icon={<Book size={16} />}
                            label="Day Book"
                            color="text-primary"
                            onClick={() =>
                              handleNavigate(
                                "day-book",
                                "Day Book",
                              )
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Modules Link */}
            <button className="h-12 flex items-center px-1 border-b-2 border-transparent transition-colors hover:text-primary">
              Modules
            </button>

            {/* Permissions Link */}
            <button
              onClick={() =>
                handleNavigate("permissions-matrix", "Permissions Matrix")
              }
              className={`h-12 flex items-center px-1 border-b-2 transition-colors hover:text-primary ${
                currentPage === "permissions-matrix"
                  ? "text-primary border-primary"
                  : "border-transparent"
              }`}
            >
              Permissions
            </button>

            {/* Company Settings Link */}
            <button
              onClick={() =>
                handleNavigate("company-settings", "Company Settings")
              }
              className={`h-12 flex items-center px-1 border-b-2 transition-colors hover:text-primary ${
                currentPage === "company-settings"
                  ? "text-primary border-primary"
                  : "border-transparent"
              }`}
            >
              Company Settings
            </button>

            {/* Reports Mega Menu */}
            <div
              className="relative h-12 flex items-center"
              onMouseEnter={() => setActiveMenu("reports")}
              onMouseLeave={() => setActiveMenu(null)}
            >
              <button
                className={`flex items-center gap-0.5 hover:text-primary transition-colors cursor-pointer h-full px-1 ${activeMenu === "reports" || activeMenu?.startsWith("reports_") ? "text-primary" : ""}`}
              >
                Reports <ChevronDown size={14} />
              </button>
              <AnimatePresence>
                {(activeMenu === "reports" ||
                  activeMenu?.startsWith("reports_")) && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-[-400px] w-[1000px] bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 z-[60] rounded-b-2xl overflow-hidden"
                  >
                    <div className="flex h-[400px]">
                      <div className="w-64 border-r border-slate-100 dark:border-slate-800 py-4 overflow-y-auto bg-slate-50/50 dark:bg-slate-900/50">
                        <ReportSidebarItem
                          icon={<LayoutGrid size={18} />}
                          label="All Reports"
                          color="text-primary"
                          active={false}
                          onClick={() => handleNavigate("all-reports", "All Reports")}
                        />
                        <div className="mx-4 my-2 border-t border-slate-200 dark:border-slate-700/50"></div>
                        <ReportSidebarItem
                          icon={<Package size={18} />}
                          label="Inventory"
                          color="text-brand-emerald"
                          active={
                            activeMenu === "reports" ||
                            activeMenu === "reports_inventory"
                          }
                          onMouseEnter={() =>
                            setActiveMenu("reports_inventory")
                          }
                          onClick={() => setActiveMenu("reports_inventory")}
                        />
                        <ReportSidebarItem
                          icon={<Landmark size={18} />}
                          label="Accounting"
                          color="text-blue-600"
                          active={activeMenu === "reports_accounting"}
                          onMouseEnter={() =>
                            setActiveMenu("reports_accounting")
                          }
                          onClick={() => setActiveMenu("reports_accounting")}
                        />
                        <ReportSidebarItem
                          icon={<Gavel size={18} />}
                          label="Statutory"
                          color="text-brand-red"
                          active={activeMenu === "reports_statutory"}
                          onMouseEnter={() =>
                            setActiveMenu("reports_statutory")
                          }
                          onClick={() => setActiveMenu("reports_statutory")}
                        />
                        <ReportSidebarItem
                          icon={<Megaphone size={18} />}
                          label="Marketing"
                          color="text-brand-amber"
                          active={activeMenu === "reports_marketing"}
                          onMouseEnter={() =>
                            setActiveMenu("reports_marketing")
                          }
                          onClick={() => setActiveMenu("reports_marketing")}
                        />
                      </div>
                      <div className="w-72 border-r border-slate-100 dark:border-slate-800 py-4 overflow-y-auto">
                        {activeMenu === "reports" ||
                        activeMenu === "reports_inventory" ? (
                          <>
                            <ReportSubItem
                              icon={<TrendingUp size={18} />}
                              label="Movement Analysis"
                              onClick={() =>
                                handleNavigate(
                                  "inventory-movement-analysis",
                                  "Inventory Movement Analysis",
                                )
                              }
                            />
                            <ReportSubItem
                              icon={<BookOpen size={18} />}
                              label="Stock Ledger"
                              onClick={() =>
                                handleNavigate(
                                  "item-stock-ledger",
                                  "Item Stock Ledger",
                                )
                              }
                            />
                            <ReportSubItem
                              icon={<FileText size={18} />}
                              label="Inventory Report"
                              onClick={() =>
                                handleNavigate(
                                  "inventory-report",
                                  "Inventory Report",
                                )
                              }
                            />
                            <ReportSubItem
                              icon={<List size={18} />}
                              label="Item Register"
                              onClick={() =>
                                handleNavigate(
                                  "item-register-report",
                                  "Item Register",
                                )
                              }
                            />
                            <ReportSubItem
                              icon={<Calculator size={18} />}
                              label="Stock Valuation"
                              onClick={() =>
                                handleNavigate(
                                  "stock-valuation-report",
                                  "Stock Valuation Report",
                                )
                              }
                            />
                            <ReportSubItem
                              icon={<LayoutGrid size={18} />}
                              label="Batch Register"
                              onClick={() =>
                                handleNavigate(
                                  "item-batch-register",
                                  "Item Batch Register",
                                )
                              }
                            />
                            <ReportSubItem
                              icon={<Layers size={18} />}
                              label="Batch Summary"
                              onClick={() =>
                                handleNavigate(
                                  "lot-batch-summary",
                                  "Lot / Batch Summary",
                                )
                              }
                            />
                            <ReportSubItem
                              icon={<Settings size={18} />}
                              label="Process Order"
                              onClick={() =>
                                handleNavigate(
                                  "process-order-report",
                                  "Process Order Report",
                                )
                              }
                            />
                            <ReportSubItem
                              icon={<Package size={18} />}
                              label="Stock Summary"
                            />
                            <ReportSubItem
                              icon={<FileText size={18} />}
                              label="Pending Report"
                              onClick={() =>
                                handleNavigate(
                                  "pending-report",
                                  "Pending Report",
                                )
                              }
                            />
                            <ReportSubItem
                              icon={<Clock size={18} />}
                              label="PI Adjustment"
                              onClick={() =>
                                handleNavigate(
                                  "supplier-wise-pending",
                                  "Purchase Invoice Adjustment Report",
                                )
                              }
                            />
                            <ReportSubItem
                              icon={<FileText size={18} />}
                              label="SO Summary"
                              onClick={() =>
                                handleNavigate(
                                  "sales-order-summary",
                                  "Sales Order Summary",
                                )
                              }
                            />
                          </>
                        ) : activeMenu === "reports_marketing" ? (
                          <>
                            <ReportSubItem
                              icon={<TrendingUp size={18} />}
                              label="Performance"
                              active
                            />
                            <ReportSubItem
                              icon={<Users size={18} />}
                              label="Sales Force"
                            />
                            <ReportSubItem
                              icon={<Calendar size={18} />}
                              label="Schedule Report"
                              onClick={() =>
                                handleNavigate(
                                  "schedule-report",
                                  "Schedule Report",
                                )
                              }
                            />
                            <ReportSubItem
                              icon={<Coins size={18} />}
                              label="Commissions"
                              onClick={() =>
                                handleNavigate(
                                  "sales-commission-report",
                                  "Sales Commission & Performance",
                                )
                              }
                            />
                          </>
                        ) : (
                          <>
                            <ReportSubItem
                              icon={<FileText size={18} />}
                              label="Final Acc"
                              active={activeMenu !== "reports_outstanding"}
                              onMouseEnter={() =>
                                setActiveMenu("reports_accounting")
                              }
                              onClick={() =>
                                setActiveMenu("reports_accounting")
                              }
                            />
                            <ReportSubItem
                              icon={<Clock size={18} />}
                              label="Outstanding"
                              active={activeMenu === "reports_outstanding"}
                              onMouseEnter={() =>
                                setActiveMenu("reports_outstanding")
                              }
                              onClick={() =>
                                setActiveMenu("reports_outstanding")
                              }
                            />
                            <ReportSubItem
                              icon={<Book size={18} />}
                              label="Register"
                              active={activeMenu === "reports_register"}
                              onMouseEnter={() =>
                                setActiveMenu("reports_register")
                              }
                              onClick={() =>
                                setActiveMenu("reports_register")
                              }
                            />
                            <ReportSubItem
                              icon={<Receipt size={18} />}
                              label="Sales Register"
                              onClick={() =>
                                handleNavigate(
                                  "sales-register-tax",
                                  "Sales Register with Tax",
                                )
                              }
                            />
                            <ReportSubItem
                              icon={<FileText size={18} />}
                              label="SO Summary"
                              onClick={() =>
                                handleNavigate(
                                  "sales-order-summary",
                                  "Sales Order Summary",
                                )
                              }
                            />
                            <ReportSubItem
                              icon={<TrendingUp size={18} />}
                              label="Margin Report"
                              onClick={() =>
                                handleNavigate(
                                  "sales-margin-report",
                                  "Sales Margin Report",
                                )
                              }
                            />
                            <ReportSubItem
                              icon={<UserSearch size={18} />}
                              label="Dealer Analysis"
                              onClick={() =>
                                handleNavigate(
                                  "dealer-analysis",
                                  "Dealer Analysis",
                                )
                              }
                            />
                          </>
                        )}
                      </div>
                      <div className="flex-1 p-8 bg-slate-50/30 dark:bg-slate-800/10 overflow-y-auto custom-scrollbar">
                        <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-6">
                          {activeMenu === "reports" ||
                          activeMenu === "reports_inventory"
                            ? "Inventory Reports"
                            : activeMenu === "reports_marketing"
                              ? "Marketing & Performance"
                              : activeMenu === "reports_outstanding"
                                ? "Outstanding Reports"
                                : activeMenu === "reports_register"
                                  ? "Register Reports"
                                  : activeMenu === "reports_statutory"
                                    ? "Statutory Reports"
                                    : "Reports in Final Acc"}
                        </h3>
                        <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                          {activeMenu === "reports" ||
                          activeMenu === "reports_inventory" ? (
                            <>
                              <ReportCard
                                icon={<FileText size={24} />}
                                title="Inventory Report"
                                desc="Detailed stock movement analysis"
                                color="bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400"
                                onClick={() =>
                                  handleNavigate(
                                    "inventory-report",
                                    "Inventory Report",
                                  )
                                }
                              />
                              <ReportCard
                                icon={<TrendingUp size={24} />}
                                title="Movement Analysis"
                                desc="Stock turnover intelligence"
                                color="bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400"
                                onClick={() =>
                                  handleNavigate(
                                    "inventory-movement-analysis",
                                    "Inventory Movement Analysis",
                                  )
                                }
                              />
                              <ReportCard
                                icon={<BookOpen size={24} />}
                                title="Item Stock Ledger"
                                desc="Detailed transaction history"
                                color="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400"
                                onClick={() =>
                                  handleNavigate(
                                    "item-stock-ledger",
                                    "Item Stock Ledger",
                                  )
                                }
                              />
                              <ReportCard
                                icon={<List size={24} />}
                                title="Item Register"
                                desc="Item-wise stock register"
                                color="bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400"
                                onClick={() =>
                                  handleNavigate(
                                    "item-register-report",
                                    "Item Register",
                                  )
                                }
                              />
                              <ReportCard
                                icon={<Calculator size={24} />}
                                title="Stock Valuation"
                                desc="Inventory costing & valuation"
                                color="bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400"
                                onClick={() =>
                                  handleNavigate(
                                    "stock-valuation-report",
                                    "Stock Valuation Report",
                                  )
                                }
                              />
                              <ReportCard
                                icon={<Package size={24} />}
                                title="Current Stock"
                                desc="Real-time stock status"
                                color="bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400"
                                onClick={() =>
                                  handleNavigate(
                                    "current-stock-report",
                                    "Current Stock Report",
                                  )
                                }
                              />
                              <ReportCard
                                icon={<LayoutGrid size={24} />}
                                title="Batch Register"
                                desc="Batch & lot number tracking"
                                color="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                                onClick={() =>
                                  handleNavigate(
                                    "item-batch-register",
                                    "Item Batch Register",
                                  )
                                }
                              />
                              <ReportCard
                                icon={<Layers size={24} />}
                                title="Batch Summary"
                                desc="Consolidated batch inventory"
                                color="bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400"
                                onClick={() =>
                                  handleNavigate(
                                    "lot-batch-summary",
                                    "Lot / Batch Summary",
                                  )
                                }
                              />
                              <ReportCard
                                icon={<Settings size={24} />}
                                title="Process Order"
                                desc="Manufacturing & process tracking"
                                color="bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400"
                                onClick={() =>
                                  handleNavigate(
                                    "process-order-report",
                                    "Process Order Report",
                                  )
                                }
                              />
                              <ReportCard
                                icon={<FileText size={24} />}
                                title="Pending Report"
                                desc="Pending items overview"
                                color="bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400"
                                onClick={() =>
                                  handleNavigate(
                                    "pending-report",
                                    "Pending Report",
                                  )
                                }
                              />
                              <ReportCard
                                icon={<Clock size={24} />}
                                title="PI Adjustment"
                                desc="Purchase Invoice Adjustment"
                                color="bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400"
                                onClick={() =>
                                  handleNavigate(
                                    "supplier-wise-pending",
                                    "Purchase Invoice Adjustment Report",
                                  )
                                }
                              />
                              <ReportCard
                                icon={<FileText size={24} />}
                                title="SO Summary"
                                desc="Sales Order Summary"
                                color="bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400"
                                onClick={() =>
                                  handleNavigate(
                                    "sales-order-summary",
                                    "Sales Order Summary",
                                  )
                                }
                              />
                            </>
                          ) : activeMenu === "reports_marketing" ? (
                            <>
                              <ReportCard
                                icon={<TrendingUp size={24} />}
                                title="Sales Commission"
                                desc="Performance based tracking"
                                color="bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400"
                                onClick={() =>
                                  handleNavigate(
                                    "sales-commission-report",
                                    "Sales Commission & Performance",
                                  )
                                }
                              />
                              <ReportCard
                                icon={<Users size={24} />}
                                title="Executive Performance"
                                desc="Sales force analysis"
                                color="bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400"
                              />
                              <ReportCard
                                icon={<Calendar size={24} />}
                                title="Schedule Report"
                                desc="Pending sales order tracking"
                                color="bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400"
                                onClick={() =>
                                  handleNavigate(
                                    "schedule-report",
                                    "Schedule Report",
                                  )
                                }
                              />
                            </>
                          ) : activeMenu === "reports_outstanding" ? (
                            <>
                              <ReportCard
                                icon={<ListChecks size={24} />}
                                title="Multiple Outstanding"
                                desc="Outstanding for multiple ledgers"
                                color="bg-teal-100 text-teal-600 dark:bg-teal-900/40 dark:text-teal-400"
                                onClick={() =>
                                  handleNavigate(
                                    "multiple-outstanding-report",
                                    "Multiple Outstanding",
                                  )
                                }
                              />
                              <ReportCard
                                icon={<Clock size={24} />}
                                title="Ledger Outstanding"
                                desc="Single ledger outstanding bills"
                                color="bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400"
                                onClick={() =>
                                  handleNavigate(
                                    "ledger-outstanding-report",
                                    "Ledger Outstanding",
                                  )
                                }
                              />
                              <ReportCard
                                icon={<Users size={24} />}
                                title="Ledger Child Outstanding"
                                desc="Outstanding with child breakdown"
                                color="bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-400"
                                onClick={() =>
                                  handleNavigate(
                                    "ledger-child-outstanding-report",
                                    "Ledger Child Outstanding",
                                  )
                                }
                              />
                              <ReportCard
                                icon={<Banknote size={24} />}
                                title="Outstanding Payments"
                                desc="All pending payment outstanding"
                                color="bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400"
                                onClick={() =>
                                  handleNavigate(
                                    "outstanding-payments-report",
                                    "Outstanding Payments",
                                  )
                                }
                              />
                              <ReportCard
                                icon={<Receipt size={24} />}
                                title="Outstanding Receipts"
                                desc="All pending receipt outstanding"
                                color="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400"
                                onClick={() =>
                                  handleNavigate(
                                    "outstanding-receipts-report",
                                    "Outstanding Receipts",
                                  )
                                }
                              />
                              <ReportCard
                                icon={<UserSearch size={24} />}
                                title="Sales Person Outstanding"
                                desc="Outstanding by sales person"
                                color="bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400"
                                onClick={() =>
                                  handleNavigate(
                                    "sales-person-outstanding-report",
                                    "Sales Person Outstanding",
                                  )
                                }
                              />
                              <ReportCard
                                icon={<FileText size={24} />}
                                title="Ledger Wise Outstanding"
                                desc="Outstanding per ledger with limits"
                                color="bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400"
                                onClick={() =>
                                  handleNavigate(
                                    "ledger-wise-outstanding-report",
                                    "Ledger Wise Outstanding",
                                  )
                                }
                              />
                              <ReportCard
                                icon={<Calendar size={24} />}
                                title="Ledger Ageing Report"
                                desc="Ageing analysis per ledger"
                                color="bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400"
                                onClick={() =>
                                  handleNavigate(
                                    "ledger-ageing-report",
                                    "Ledger Wise Ageing",
                                  )
                                }
                              />
                            </>
                          ) : activeMenu === "reports_register" ? (
                            <>
                              <ReportCard
                                icon={<Book size={24} />}
                                title="Ledger Register"
                                desc="Detailed ledger transaction register"
                                color="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400"
                                onClick={() =>
                                  handleNavigate(
                                    "ledger-register",
                                    "Ledger Register",
                                  )
                                }
                              />
                              <ReportCard
                                icon={<Receipt size={24} />}
                                title="Sales Register"
                                desc="Sales transaction register"
                                color="bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400"
                                onClick={() =>
                                  handleNavigate(
                                    "sales-register",
                                    "Sales Register",
                                  )
                                }
                              />
                              <ReportCard
                                icon={<Package size={24} />}
                                title="Purchase Register"
                                desc="Purchase transaction register"
                                color="bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400"
                                onClick={() =>
                                  handleNavigate(
                                    "purchase-register",
                                    "Purchase Register",
                                  )
                                }
                              />
                              <ReportCard
                                icon={<Receipt size={24} />}
                                title="Sales Columnar"
                                desc="Sales columnar register"
                                color="bg-yellow-100 text-yellow-600 dark:bg-yellow-900/40 dark:text-yellow-400"
                                onClick={() =>
                                  handleNavigate(
                                    "sales-columnar",
                                    "Sales Columnar",
                                  )
                                }
                              />
                              <ReportCard
                                icon={<Receipt size={24} />}
                                title="Purchase Columnar"
                                desc="Purchase columnar register"
                                color="bg-yellow-100 text-yellow-600 dark:bg-yellow-900/40 dark:text-yellow-400"
                                onClick={() =>
                                  handleNavigate(
                                    "purchase-columnar",
                                    "Purchase Columnar",
                                  )
                                }
                              />
                              <ReportCard
                                icon={<BookOpen size={24} />}
                                title="Process Discount"
                                desc="Process customer discount & create CN"
                                color="bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400"
                                onClick={() =>
                                  handleNavigate(
                                    "process-discount",
                                    "Process Discount",
                                  )
                                }
                              />
                            </>
                          ) : activeMenu === "reports_statutory" ? (
                            <>
                              <ReportCard
                                icon={<Shield size={24} />}
                                title="GSTR1 Report"
                                desc="GSTR1 tax return summary"
                                color="bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400"
                                onClick={() =>
                                  handleNavigate(
                                    "gstr1-report",
                                    "GSTR1 Report",
                                  )
                                }
                              />
                              <ReportCard
                                icon={<ShieldCheck size={24} />}
                                title="GSTR2 Report"
                                desc="GSTR2 tax return summary"
                                color="bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400"
                                onClick={() =>
                                  handleNavigate(
                                    "gstr2-report",
                                    "GSTR2 Report",
                                  )
                                }
                              />
                              <ReportCard
                                icon={<Shield size={24} />}
                                title="GSTR3B Report"
                                desc="GSTR3B tax return summary"
                                color="bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400"
                                onClick={() =>
                                  handleNavigate(
                                    "gstr3b-report",
                                    "GSTR3B Report",
                                  )
                                }
                              />
                              <ReportCard
                                icon={<Percent size={24} />}
                                title="Process TCS"
                                desc="Process and adjust TCS items"
                                color="bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400"
                                onClick={() =>
                                  handleNavigate(
                                    "process-tcs",
                                    "Process TCS",
                                  )
                                }
                              />
                              <ReportCard
                                icon={<Percent size={24} />}
                                title="Process TDS"
                                desc="Process and adjust TDS items"
                                color="bg-teal-100 text-teal-600 dark:bg-teal-900/40 dark:text-teal-400"
                                onClick={() =>
                                  handleNavigate(
                                    "process-tds",
                                    "Process TDS",
                                  )
                                }
                              />
                              <ReportCard
                                icon={<Target size={24} />}
                                title="Ledger Target"
                                desc="Ledger target sales performance"
                                color="bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-400"
                                onClick={() =>
                                  handleNavigate(
                                    "ledger-target-report",
                                    "Ledger Target Report",
                                  )
                                }
                              />
                              <ReportCard
                                icon={<Package size={24} />}
                                title="MSL Report"
                                desc="Minimum stock level report"
                                color="bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400"
                                onClick={() =>
                                  handleNavigate(
                                    "msl-report",
                                    "MSL Report",
                                  )
                                }
                              />
                              <ReportCard
                                icon={<Users size={24} />}
                                title="Sales Person Report"
                                desc="Sales person sales report"
                                color="bg-pink-100 text-pink-600 dark:bg-pink-900/40 dark:text-pink-400"
                                onClick={() =>
                                  handleNavigate(
                                    "sales-person-report",
                                    "Sales Person Report",
                                  )
                                }
                              />
                            </>
                          ) : (
                            <>
                              <ReportCard
                                icon={<Receipt size={24} />}
                                title="Sales Register"
                                desc="Sales data with tax breakup"
                                color="bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400"
                                onClick={() =>
                                  handleNavigate(
                                    "sales-register-tax",
                                    "Sales Register with Tax",
                                  )
                                }
                              />
                              <ReportCard
                                icon={<FileText size={24} />}
                                title="SO Summary"
                                desc="Sales order status & summary"
                                color="bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400"
                                onClick={() =>
                                  handleNavigate(
                                    "sales-order-summary",
                                    "Sales Order Summary",
                                  )
                                }
                              />
                              <ReportCard
                                icon={<TrendingUp size={24} />}
                                title="Margin Report"
                                desc="Sales profitability analysis"
                                color="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400"
                                onClick={() =>
                                  handleNavigate(
                                    "sales-margin-report",
                                    "Sales Margin Report",
                                  )
                                }
                              />
                              <ReportCard
                                icon={<Scale size={24} />}
                                title="Balance Sheet"
                                desc="Financial position & contracts"
                                color="bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400"
                                onClick={() =>
                                  handleNavigate(
                                    "balance-sheet",
                                    "Balance Sheet",
                                  )
                                }
                              />
                              <ReportCard
                                icon={<PieChart size={24} />}
                                title="BI Dashboard"
                                desc="Business intelligence & KPIs"
                                color="bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400"
                                onClick={() =>
                                  handleNavigate(
                                    "bi-dashboard",
                                    "Business Intelligence",
                                  )
                                }
                              />
                              <ReportCard
                                icon={<TrendingUp size={24} />}
                                title="P & L Account"
                                desc="Revenue and expense statement"
                                color="bg-emerald-100 text-brand-emerald dark:bg-emerald-900/40 dark:text-emerald-400"
                                onClick={() =>
                                  handleNavigate(
                                    "profit-loss",
                                    "Profit & Loss Statement",
                                  )
                                }
                              />
                              <ReportCard
                                icon={<AlertCircle size={24} />}
                                title="Outstanding"
                                desc="Ledger outstanding list"
                                color="bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400"
                                onClick={() =>
                                  handleNavigate(
                                    "ledger-outstanding-list",
                                    "Ledger Outstanding",
                                  )
                                }
                              />
                              <ReportCard
                                icon={<TrendingUp size={24} />}
                                title="Multiple Ledger Outstanding"
                                desc="Multi-dimensional aging analysis"
                                color="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400"
                                onClick={() =>
                                  handleNavigate(
                                    "multiple-ledger-outstanding",
                                    "Multiple Ledger Outstanding",
                                  )
                                }
                              />
                              <ReportCard
                                icon={<BarChart3 size={24} />}
                                title="Aging Analysis"
                                desc="Detailed bill-wise aging"
                                color="bg-amber-100 text-brand-amber dark:bg-amber-900/40 dark:text-brand-amber"
                                onClick={() =>
                                  handleNavigate(
                                    "aging-analysis",
                                    "Aging Analysis Detail",
                                  )
                                }
                              />
                              <ReportCard
                                icon={<Package size={24} />}
                                title="Lot/Batch Summary"
                                desc="Inventory batch tracking"
                                color="bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400"
                                onClick={() =>
                                  handleNavigate(
                                    "lot-batch-summary",
                                    "Lot/Batch Summary",
                                  )
                                }
                              />
                              <ReportCard
                                icon={<Scale size={24} />}
                                title="Trial Balance"
                                desc="Accounting trial balance"
                                color="bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400"
                                onClick={() =>
                                  handleNavigate(
                                    "trial-balance-report",
                                    "Trial Balance Report",
                                  )
                                }
                              />
                              <ReportCard
                                icon={<Landmark size={24} />}
                                title="Bank Reconciliation"
                                desc="Reconcile bank accounts & books"
                                color="bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400"
                                onClick={() =>
                                  handleNavigate(
                                    "bank-reconciliation",
                                    "Bank Reconciliation",
                                  )
                                }
                              />
                              <ReportCard
                                icon={<FolderTree size={24} />}
                                title="Group Summary"
                                desc="Summary of account groups"
                                color="bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400"
                                onClick={() =>
                                  handleNavigate(
                                    "group-summary",
                                    "Group Summary",
                                  )
                                }
                              />
                              <ReportCard
                                icon={<UserSearch size={24} />}
                                title="Dealer Analysis"
                                desc="Analysis of dealer sales & growth"
                                color="bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400"
                                onClick={() =>
                                  handleNavigate(
                                    "dealer-analysis",
                                    "Dealer Analysis",
                                  )
                                }
                              />
                              <ReportCard
                                icon={<Book size={24} />}
                                title="Day Book"
                                desc="Daily transaction summary"
                                color="bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400"
                                onClick={() =>
                                  handleNavigate(
                                    "day-book",
                                    "Day Book",
                                  )
                                }
                              />
                              <ReportCard
                                icon={<Shield size={24} />}
                                title="GSTR1 Report"
                                desc="GSTR1 tax return summary"
                                color="bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400"
                                onClick={() =>
                                  handleNavigate(
                                    "gstr1-report",
                                    "GSTR1 Report",
                                  )
                                }
                              />
                              <ReportCard
                                icon={<ShieldCheck size={24} />}
                                title="GSTR2 Report"
                                desc="GSTR2 tax return summary"
                                color="bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400"
                                onClick={() =>
                                  handleNavigate(
                                    "gstr2-report",
                                    "GSTR2 Report",
                                  )
                                }
                              />
                              <ReportCard
                                icon={<Shield size={24} />}
                                title="GSTR3B Report"
                                desc="GSTR3B tax return summary"
                                color="bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400"
                                onClick={() =>
                                  handleNavigate(
                                    "gstr3b-report",
                                    "GSTR3B Report",
                                  )
                                }
                              />
                              <ReportCard
                                icon={<Percent size={24} />}
                                title="Process TCS"
                                desc="Process and adjust TCS items"
                                color="bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400"
                                onClick={() =>
                                  handleNavigate(
                                    "process-tcs",
                                    "Process TCS",
                                  )
                                }
                              />
                              <ReportCard
                                icon={<Percent size={24} />}
                                title="Process TDS"
                                desc="Process and adjust TDS items"
                                color="bg-teal-100 text-teal-600 dark:bg-teal-900/40 dark:text-teal-400"
                                onClick={() =>
                                  handleNavigate(
                                    "process-tds",
                                    "Process TDS",
                                  )
                                }
                              />
                              <ReportCard
                                icon={<Target size={24} />}
                                title="Ledger Target"
                                desc="Ledger target sales performance"
                                color="bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-400"
                                onClick={() =>
                                  handleNavigate(
                                    "ledger-target-report",
                                    "Ledger Target Report",
                                  )
                                }
                              />
                              <ReportCard
                                icon={<Package size={24} />}
                                title="MSL Report"
                                desc="Minimum stock level report"
                                color="bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400"
                                onClick={() =>
                                  handleNavigate(
                                    "msl-report",
                                    "MSL Report",
                                  )
                                }
                              />
                              <ReportCard
                                icon={<Users size={24} />}
                                title="Sales Person Report"
                                desc="Sales person sales report"
                                color="bg-pink-100 text-pink-600 dark:bg-pink-900/40 dark:text-pink-400"
                                onClick={() =>
                                  handleNavigate(
                                    "sales-person-report",
                                    "Sales Person Report",
                                  )
                                }
                              />
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button className="flex items-center gap-0.5 hover:text-primary transition-colors">
              Tools <ChevronDown size={14} />
            </button>

            <button className="flex items-center gap-0.5 hover:text-primary transition-colors">
              Settings <ChevronDown size={14} />
            </button>
          </div>

          <div className="flex items-center gap-4">
            <button className="flex items-center gap-1 text-xs hover:text-primary transition-colors">
              <LinkIcon size={14} /> Quick Links
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[90]"
            />

            {/* Drawer Content */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="lg:hidden fixed top-0 left-0 bottom-0 w-[280px] max-w-[85vw] bg-white dark:bg-slate-900 shadow-2xl z-[100] flex flex-col h-full border-r border-slate-200 dark:border-slate-800"
            >
              {/* Drawer Header */}
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-tr from-brand-red to-brand-amber rounded-lg flex items-center justify-center text-white font-bold text-base shadow-md">
                    B
                  </div>
                  <span className="text-base font-bold tracking-tight text-slate-800 dark:text-white">
                    baawan.com
                  </span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Drawer Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {/* 1. Core Navigation (CRM, E-Commerce, CMS) */}
                <div className="space-y-1 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <button className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-all text-left">
                    <LayoutDashboard size={16} /> CRM
                  </button>
                  <button className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-semibold text-amber-600 dark:text-amber-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-all text-left">
                    <ShoppingCart size={16} /> E-Commerce
                  </button>
                  <button className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-all text-left">
                    <FileText size={16} /> CMS
                  </button>
                </div>

                {/* 2. Sub-navigation Items */}
                <div className="space-y-2">
                  {/* Dashboard */}
                  <button
                    onClick={() => handleNavigate("dashboard", "Dashboard")}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm font-bold rounded-lg text-left transition-all ${
                      currentPage === "dashboard"
                        ? "bg-slate-100 dark:bg-slate-800 text-brand-red"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    <Home size={16} /> Dashboard
                  </button>

                  {/* Accordion Categories */}
                  {[
                    {
                      id: "master",
                      label: "Master",
                      icon: <Landmark size={16} />,
                      items: [
                        { label: "Ledger List", page: "ledger-list", title: "Ledger Master" },
                        { label: "Group List", page: "group-list", title: "Group Master" },
                        { label: "Currency List", page: "currency-list", title: "Currency Master" },
                        { label: "Item List", page: "item-list", title: "Item Master" },
                        { label: "BOM List", page: "bom-list", title: "BOM Master" },
                        { label: "Unit List", page: "unit-list", title: "Unit Master" },
                        { label: "Stock Place List", page: "stock-place-list", title: "Stock Place Master" },
                        { label: "Extra Charges", page: "extra-charge-list", title: "Extra Charge Master" },
                        { label: "Terms & Cond.", page: "terms-list", title: "Terms & Conditions" },
                        { label: "User List", page: "user-list", title: "User Master" },
                        { label: "User Roles", page: "role-list", title: "User Role Master" },
                        { label: "Sales Person List", page: "sales-person-list", title: "Sales Person Master" },
                        { label: "Project Site List", page: "project-site-list", title: "Project Site Master" },
                      ]
                    },
                    {
                      id: "transactions",
                      label: "Transactions",
                      icon: <Receipt size={16} />,
                      items: [
                        { label: "Quotation", page: "dashboard", title: "Dashboard" },
                        { label: "Order", page: "dashboard", title: "Dashboard" },
                        { label: "Schedule to Invoice", page: "schedule-to-invoice", title: "Schedule to Invoice" },
                        { label: "Sales Invoice", page: "invoice-list", title: "Sales Invoice" },
                        { label: "Return", page: "dashboard", title: "Dashboard" },
                      ]
                    },
                    {
                      id: "inventory",
                      label: "Inventory",
                      icon: <Package size={16} />,
                      items: [
                        { label: "Movement Analysis", page: "inventory-movement-analysis", title: "Inventory Movement Analysis" },
                        { label: "Item Stock Ledger", page: "item-stock-ledger", title: "Item Stock Ledger" },
                        { label: "Current Stock", page: "current-stock-report", title: "Current Stock Report" },
                        { label: "BOM Assembly Builder", page: "bom-builder", title: "BOM Assembly Builder" },
                      ]
                    },
                    {
                      id: "accounts",
                      label: "Accounts",
                      icon: <CreditCard size={16} />,
                      items: [
                        { label: "Receipt Vouchers", page: "receipt-voucher-list", title: "Receipt Vouchers" },
                        { label: "New Receipt", page: "receipt-voucher-create", title: "New Receipt Voucher" },
                        { label: "Payment Vouchers", page: "payment-voucher-list", title: "Payment Vouchers" },
                        { label: "New Payment", page: "payment-voucher-create", title: "New Payment Voucher" },
                        { label: "Chart of Accounts", page: "chart-of-accounts", title: "Chart of Accounts" },
                        { label: "Outstanding Report", page: "outstanding-report", title: "Outstanding Report" },
                        { label: "Trial Balance", page: "trial-balance-report", title: "Trial Balance Report" },
                        { label: "Bill-wise Drilldown", page: "bill-wise-drilldown", title: "Bill-wise Drilldown" },
                      ]
                    },
                    {
                      id: "reports",
                      label: "Reports",
                      icon: <PieChart size={16} />,
                      items: [
                        { label: "All Reports", page: "all-reports", title: "All Reports" },
                        { label: "Inventory Report", page: "inventory-report", title: "Inventory Report" },
                        { label: "Movement Analysis", page: "inventory-movement-analysis", title: "Inventory Movement Analysis" },
                        { label: "Stock Valuation", page: "stock-valuation-report", title: "Stock Valuation Report" },
                        { label: "Sales Register with Tax", page: "sales-register-tax", title: "Sales Register with Tax" },
                        { label: "Sales Margin Report", page: "sales-margin-report", title: "Sales Margin Report" },
                        { label: "Sales Commission", page: "sales-commission-report", title: "Sales Commission & Performance" },
                        { label: "Sales Order Summary", page: "sales-order-summary", title: "Sales Order Summary" },
                      ]
                    }
                  ].map((section) => {
                    const isExpanded = expandedMobileSection === section.id;
                    return (
                      <div key={section.id} className="space-y-1">
                        <button
                          onClick={() => setExpandedMobileSection(isExpanded ? null : section.id)}
                          className="w-full flex items-center justify-between px-3 py-2 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-all text-left"
                        >
                          <div className="flex items-center gap-2.5">
                            {section.icon}
                            <span>{section.label}</span>
                          </div>
                          <ChevronDown
                            size={16}
                            className={`text-slate-400 transition-transform duration-200 ${
                              isExpanded ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden pl-7 space-y-1"
                            >
                              {section.items.map((sub, sidx) => (
                                <button
                                  key={sidx}
                                  onClick={() => handleNavigate(sub.page as Page, sub.title)}
                                  className={`w-full flex items-center py-1.5 px-3 text-xs font-semibold rounded-md text-left transition-all ${
                                    currentPage === sub.page
                                      ? "text-primary"
                                      : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                                  }`}
                                >
                                  {sub.label}
                                </button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}

                  {/* Invoice */}
                  <button
                    onClick={() => handleNavigate("invoice-list", "Sales Invoice")}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm font-bold rounded-lg text-left transition-all ${
                      currentPage === "invoice-list"
                        ? "bg-slate-100 dark:bg-slate-800 text-brand-red"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    <Receipt size={16} /> Invoice
                  </button>

                  {/* Permissions */}
                  <button
                    onClick={() => handleNavigate("permissions-matrix", "Permissions Matrix")}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm font-bold rounded-lg text-left transition-all ${
                      currentPage === "permissions-matrix"
                        ? "bg-slate-100 dark:bg-slate-800 text-primary"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    <ShieldCheck size={16} /> Permissions
                  </button>

                  {/* Company Settings */}
                  <button
                    onClick={() => handleNavigate("company-settings", "Company Settings")}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm font-bold rounded-lg text-left transition-all ${
                      currentPage === "company-settings"
                        ? "bg-slate-100 dark:bg-slate-800 text-primary"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    <Settings size={16} /> Company Settings
                  </button>

                  {/* Quick Links */}
                  <button
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-all text-left"
                  >
                    <LinkIcon size={16} /> Quick Links
                  </button>
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 space-y-3">
                <div className="text-left">
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    ERP Administrator
                  </p>
                  <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    01/04/2025 - 31/03/2026
                  </p>
                </div>

                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    if (window.confirm("Are you sure you want to sign out?")) {
                      onLogout();
                    }
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2 bg-red-50 dark:bg-red-955/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-xs font-bold transition-colors"
                >
                  <LogOut size={14} /> Sign Out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
};

// Helper Components
const MenuLink = ({
  icon,
  label,
  color = "text-slate-400",
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  color?: string;
  onClick?: () => void;
}) => (
  <button
    onClick={onClick}
    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 group transition-all text-left"
  >
    <span className={`${color} group-hover:text-primary transition-colors`}>
      {icon}
    </span>
    <span className="text-slate-700 dark:text-slate-300 font-medium">
      {label}
    </span>
  </button>
);

const WorkflowLink = ({
  label,
  active = false,
  onClick,
}: {
  label: string;
  active?: boolean;
  onClick?: () => void;
}) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center justify-between p-3 rounded-lg hover:shadow-md transition-all group text-left ${
      active
        ? "bg-primary/10 border border-primary/20"
        : "bg-white dark:bg-slate-800"
    }`}
  >
    <span
      className={`${active ? "text-primary font-bold" : "text-slate-700 dark:text-slate-200 font-medium"}`}
    >
      {label}
    </span>
    {active ? (
      <CheckCircle2 size={16} className="text-primary" />
    ) : (
      <ArrowRight
        size={16}
        className="text-slate-400 group-hover:text-blue-600 transition-colors"
      />
    )}
  </button>
);

const WorkflowStep = ({ label, title }: { label: string; title: string }) => (
  <a
    className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 group transition-all"
    href="#"
  >
    <span className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-500 group-hover:bg-brand-amber/10 group-hover:text-brand-amber transition-colors">
      {label}
    </span>
    <span className="text-slate-700 dark:text-slate-300 font-medium">
      {title}
    </span>
  </a>
);

const FinanceCard = ({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) => (
  <a
    className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-primary/30 hover:bg-primary/5 transition-all text-center group"
    href="#"
  >
    <div className="text-slate-400 group-hover:text-primary mb-2 flex justify-center">
      {icon}
    </div>
    <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
      {label}
    </div>
  </a>
);

const ReportSidebarItem = ({
  icon,
  label,
  color,
  active = false,
  onMouseEnter,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  color: string;
  active?: boolean;
  onMouseEnter?: () => void;
  onClick?: () => void;
}) => (
  <button
    onMouseEnter={onMouseEnter}
    onClick={onClick}
    className={`w-full flex items-center justify-between px-6 py-3 transition-colors group ${
      active
        ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400"
        : "hover:bg-slate-100 dark:hover:bg-slate-800"
    }`}
  >
    <div className="flex items-center gap-3">
      <span className={`${active ? "text-blue-600" : color}`}>{icon}</span>
      <span
        className={`font-bold ${active ? "text-blue-700" : "text-slate-700 dark:text-slate-300"}`}
      >
        {label}
      </span>
    </div>
    <ChevronRight
      size={16}
      className={`${active ? "text-blue-500" : "text-slate-400"} group-hover:translate-x-1 transition-transform`}
    />
  </button>
);

const ReportSubItem = ({
  icon,
  label,
  active = false,
  onClick,
  onMouseEnter,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
  onMouseEnter?: () => void;
}) => (
  <button
    onClick={onClick}
    onMouseEnter={onMouseEnter}
    className={`w-full flex items-center justify-between px-6 py-3 transition-colors group ${
      active
        ? "bg-slate-100 dark:bg-slate-800/50"
        : "hover:bg-slate-50 dark:hover:bg-slate-800"
    }`}
  >
    <div className="flex items-center gap-3">
      <span className={`${active ? "text-blue-500" : "text-slate-400"}`}>
        {icon}
      </span>
      <span
        className={`font-semibold ${active ? "text-slate-800 dark:text-white" : "text-slate-600 dark:text-slate-400"}`}
      >
        {label}
      </span>
    </div>
    {active && <ChevronRight size={16} className="text-blue-500" />}
  </button>
);

const ReportCard = ({
  icon,
  title,
  desc,
  color,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  color: string;
  onClick?: () => void;
}) => (
  <button
    onClick={onClick}
    className="group flex items-center gap-4 p-4 rounded-xl hover:bg-white dark:hover:bg-slate-800 hover:shadow-md border border-transparent hover:border-slate-100 dark:hover:border-slate-700 transition-all text-left w-full"
  >
    <div
      className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors ${color}`}
    >
      {icon}
    </div>
    <div>
      <div className="font-bold text-slate-800 dark:text-slate-200">
        {title}
      </div>
      <div className="text-[11px] text-slate-500">{desc}</div>
    </div>
  </button>
);
