import React from 'react';
import { 
  Receipt, 
  ShoppingCart, 
  Wallet, 
  CreditCard, 
  Package, 
  BarChart3, 
  BookOpen, 
  AlertCircle,
  Bolt,
  Info,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  History,
  User,
  MessageSquare,
  Bell,
  FileText,
  LayoutGrid,
  MoreHorizontal,
  Users,
  Box,
  Layers,
  Settings2,
  PieChart,
  TrendingUp,
  Loader2
} from 'lucide-react';
import { motion } from 'motion/react';
import { dashboardService } from '../services/api';

export const Dashboard: React.FC<{ onModuleClick?: (type: any, title: string) => void }> = ({ onModuleClick }) => {
  const [purchaseTrend, setPurchaseTrend] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const today = new Date();
        const lastWeek = new Date(today);
        lastWeek.setDate(today.getDate() - 7);

        const formatDate = (date: Date) => {
          const y = date.getFullYear();
          const m = String(date.getMonth() + 1).padStart(2, '0');
          const d = String(date.getDate()).padStart(2, '0');
          return `${y}-${m}-${d}`;
        };

        const params = {
          fromDate: formatDate(lastWeek),
          toDate: formatDate(today),
          branchId: 0,
          filterParams: ""
        };

        const trendData = await dashboardService.getPurchaseTrend(params);
        setPurchaseTrend(trendData || []);
      } catch (error: any) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-[1600px] mx-auto px-6 py-8"
    >
      <div className="grid grid-cols-12 gap-6">
        {/* Main Content Area */}
        <div className="col-span-12 lg:col-span-9 space-y-6">
          {/* Welcome Banner */}
          <div className="relative overflow-hidden bg-white dark:bg-slate-900 rounded-2xl p-10 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center">
            <div className="relative z-10 space-y-2">
              <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Welcome back, <span className="text-primary">Admin</span>
              </h1>
              <p className="text-slate-500 dark:text-slate-400 max-w-lg">
                Manage your business operations seamlessly with the latest insights and powerful ERP tools at your fingertips.
              </p>
              <div className="pt-4">
                <button className="bg-primary text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-primary-dark transition-all flex items-center gap-2 shadow-lg shadow-primary/20">
                  <Bolt size={18} />
                  Quick Actions
                </button>
              </div>
            </div>
            <div className="absolute right-[-5%] top-1/2 -translate-y-1/2 opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
              <div className="w-96 h-96 bg-primary rounded-full blur-3xl"></div>
            </div>
          </div>

          {/* Quick Modules Grid */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800 dark:text-white">
                <LayoutGrid size={20} className="text-primary" />
                Quick Modules
              </h2>
              <button 
                onClick={() => window.dispatchEvent(new CustomEvent('open-widget-library'))}
                className="text-primary text-sm font-semibold hover:underline"
              >
                Customize Grid
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <ModuleCard 
                icon={<Receipt size={24} />} 
                title="Sales Invoice" 
                subtitle="Manage revenue" 
                color="blue" 
                onClick={() => onModuleClick?.('invoice-list', 'Sales Invoice')}
              />
              <ModuleCard 
                icon={<ShoppingCart size={24} />} 
                title="Purchase Invoice" 
                subtitle="Vendor records" 
                color="amber" 
                onClick={() => onModuleClick?.('purchase-invoice-list', 'Purchase Invoice')}
              />
              <ModuleCard 
                icon={<Wallet size={24} />} 
                title="Receipt Voucher" 
                subtitle="Incoming cash" 
                color="emerald" 
                onClick={() => onModuleClick?.('receipt-voucher-list', 'Receipt Vouchers')}
              />
              <ModuleCard 
                icon={<CreditCard size={24} />} 
                title="Payment Voucher" 
                subtitle="Outgoing expenses" 
                color="red" 
                onClick={() => onModuleClick?.('payment-voucher-list', 'Payment Vouchers')}
              />
              <ModuleCard 
                icon={<Package size={24} />} 
                title="Inventory Report" 
                subtitle="Stock status" 
                color="indigo" 
              />
              <ModuleCard 
                icon={<BarChart3 size={24} />} 
                title="Current Stock" 
                subtitle="Live tracking" 
                color="slate" 
                onClick={() => onModuleClick?.('current-stock-report', 'Current Stock Report')}
              />
              <ModuleCard 
                icon={<BookOpen size={24} />} 
                title="Ledger Outstanding" 
                subtitle="Balance tracking" 
                color="cyan" 
                onClick={() => onModuleClick?.('ledger-outstanding-list', 'Ledger Outstanding')}
              />
              <ModuleCard 
                icon={<AlertCircle size={24} />} 
                title="Aging Analysis" 
                subtitle="Detailed aging" 
                color="rose" 
                onClick={() => onModuleClick?.('aging-analysis', 'Aging Analysis Detail')}
              />
            </div>
          </div>

          {/* Master Management Section */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800 dark:text-white">
                <Settings2 size={20} className="text-rose-600" />
                Master Management
              </h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <ModuleCard 
                icon={<Users size={24} />} 
                title="Ledger Master" 
                subtitle="Manage accounts" 
                color="blue" 
                onClick={() => onModuleClick?.('ledger-list', 'Ledger Master')}
              />
              <ModuleCard 
                icon={<Box size={24} />} 
                title="Item Master" 
                subtitle="Product catalog" 
                color="amber" 
                onClick={() => onModuleClick?.('item-list', 'Item Master')}
              />
              <ModuleCard 
                icon={<Layers size={24} />} 
                title="BOM Master" 
                subtitle="Assembly data" 
                color="indigo" 
                onClick={() => onModuleClick?.('bom-list', 'BOM Master')}
              />
              <ModuleCard 
                icon={<User size={24} />} 
                title="User Master" 
                subtitle="Staff access" 
                color="red" 
                onClick={() => onModuleClick?.('user-list', 'User Master')}
              />
              <ModuleCard 
                icon={<TrendingUp size={24} />} 
                title="Profit & Loss" 
                subtitle="Financial health" 
                color="emerald" 
                onClick={() => onModuleClick?.('profit-loss', 'Profit & Loss Statement')}
              />
              <ModuleCard 
                icon={<PieChart size={24} />} 
                title="BI Dashboard" 
                subtitle="Analytics & KPIs" 
                color="indigo" 
                onClick={() => onModuleClick?.('bi-dashboard', 'Business Intelligence')}
              />
            </div>
          </div>

          {/* Charts and Task Priorities */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-lg text-slate-800 dark:text-white">Revenue Summary</h3>
                <span className="text-xs font-semibold px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-md">+12.5%</span>
              </div>
              <div className="h-48 flex items-end gap-2 px-2">
                {isLoading ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <Loader2 className="animate-spin text-primary/20" size={32} />
                  </div>
                ) : purchaseTrend.length > 0 ? (
                  purchaseTrend.slice(0, 7).map((item, i) => {
                    const maxAmount = Math.max(...purchaseTrend.map(t => t.amount || 0)) || 1;
                    const height = ((item.amount || 0) / maxAmount) * 100;
                    return (
                      <div 
                        key={i}
                        className={`flex-1 rounded-t-lg transition-all duration-500 bg-slate-100 dark:bg-slate-800 hover:bg-primary/40`}
                        style={{ height: `${Math.max(height, 5)}%` }}
                        title={`${item.date}: ${item.amount}`}
                      ></div>
                    );
                  })
                ) : (
                  [40, 65, 45, 80, 95, 50, 75].map((height, i) => (
                    <div 
                      key={i}
                      className={`flex-1 rounded-t-lg transition-all duration-500 ${
                        i === 4 ? 'bg-primary' : 'bg-slate-100 dark:bg-slate-800 hover:bg-primary/40'
                      }`}
                      style={{ height: `${height}%` }}
                    ></div>
                  ))
                )}
              </div>
              <div className="flex justify-between mt-4 text-[10px] text-slate-400 uppercase font-bold tracking-widest">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => <span key={day}>{day}</span>)}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg text-slate-800 dark:text-white">Task Priorities</h3>
                <button className="text-slate-400 hover:text-slate-600"><MoreHorizontal size={20} /></button>
              </div>
              <div className="space-y-4">
                <TaskItem color="bg-red-500" title="Approve Pending Vouchers" subtitle="Finance Team • 2h ago" />
                <TaskItem color="bg-amber-500" title="Inventory Restock Alert" subtitle="Warehouse • 5h ago" />
                <TaskItem color="bg-blue-500" title="Monthly GST Filing" subtitle="Compliance • 1d ago" />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Area */}
        <aside className="col-span-12 lg:col-span-3 space-y-6">
          {/* Notifications */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold flex items-center gap-2 text-slate-800 dark:text-white">
                <Bell size={18} className="text-primary" />
                Notifications
              </h3>
              <span className="w-5 h-5 bg-red-500 text-[10px] text-white flex items-center justify-center rounded-full font-bold">4</span>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              <NotificationItem 
                type="info" 
                icon={<Info size={16} />} 
                message="Backup completed successfully." 
                time="10 mins ago" 
              />
              <NotificationItem 
                type="warning" 
                icon={<AlertTriangle size={16} />} 
                message="New login attempt from London." 
                time="2 hours ago" 
              />
              <NotificationItem 
                type="success" 
                icon={<CheckCircle2 size={16} />} 
                message="Payroll processing is final." 
                time="Yesterday" 
              />
            </div>
            <button className="w-full py-4 text-xs font-bold text-primary hover:bg-slate-50 dark:hover:bg-slate-800 uppercase tracking-widest transition-colors">
              View All Activities
            </button>
          </div>

          {/* Recent Activity */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold flex items-center gap-2 text-slate-800 dark:text-white">
                <History size={18} className="text-slate-400" />
                Recent
              </h3>
            </div>
            <div className="p-4 space-y-4">
              <RecentItem 
                icon={<FileText size={18} />} 
                title="SI-2024-0012" 
                subtitle="Sales Invoice" 
                time="2h ago" 
                onClick={() => onModuleClick?.('invoice-list', 'SI-2024-0012')}
              />
              <RecentItem 
                icon={<User size={18} />} 
                title="ABC Traders Ltd." 
                subtitle="Customer Profile" 
                time="4h ago" 
              />
              <RecentItem 
                icon={<Package size={18} />} 
                title="Item-992-BX" 
                subtitle="Stock Item" 
                time="1d ago" 
              />
            </div>
          </div>

          {/* Support Card */}
          <div className="bg-gradient-to-br from-primary to-indigo-700 rounded-2xl p-6 text-white relative overflow-hidden group cursor-pointer shadow-lg shadow-primary/20">
            <div className="relative z-10">
              <h4 className="font-bold mb-1">Need help?</h4>
              <p className="text-xs text-white/80 mb-4">Contact our priority support for instant assistance.</p>
              <div className="flex items-center gap-2 text-sm font-bold bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg px-3 py-2 w-fit transition-colors">
                <MessageSquare size={16} />
                Live Chat
              </div>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
              <MessageSquare size={120} />
            </div>
          </div>
        </aside>
      </div>
    </motion.div>
  );
};

// Helper Components
const ModuleCard = ({ icon, title, subtitle, color, onClick }: { icon: React.ReactNode, title: string, subtitle: string, color: string, onClick?: () => void }) => {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-50/50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800/50 text-blue-600 dark:text-blue-200',
    amber: 'bg-amber-50/50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800/50 text-amber-500 dark:text-amber-200',
    emerald: 'bg-emerald-50/50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800/50 text-emerald-500 dark:text-emerald-200',
    red: 'bg-red-50/50 dark:bg-red-900/20 border-red-100 dark:border-red-800/50 text-red-500 dark:text-red-200',
    indigo: 'bg-indigo-50/50 dark:bg-indigo-900/20 border-indigo-100 dark:border-indigo-800/50 text-indigo-500 dark:text-indigo-200',
    slate: 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200',
    cyan: 'bg-cyan-50/50 dark:bg-cyan-900/20 border-cyan-100 dark:border-cyan-800/50 text-cyan-500 dark:text-cyan-200',
    rose: 'bg-rose-50/50 dark:bg-rose-900/20 border-rose-100 dark:border-rose-800/50 text-rose-500 dark:text-rose-200',
  };

  return (
    <div 
      onClick={onClick}
      className={`group p-6 rounded-2xl border flex flex-col items-center justify-center text-center cursor-pointer transition-all hover:-translate-y-1 hover:shadow-lg ${colorClasses[color]}`}
    >
      <div className={`w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 shadow-sm mb-4 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors`}>
        {icon}
      </div>
      <h3 className="font-bold">{title}</h3>
      <p className="text-xs opacity-70 mt-1">{subtitle}</p>
    </div>
  );
};

const TaskItem = ({ color, title, subtitle }: { color: string, title: string, subtitle: string }) => (
  <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group cursor-pointer">
    <div className={`w-2 h-10 rounded-full ${color}`}></div>
    <div className="flex-1">
      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{title}</p>
      <p className="text-xs text-slate-500">{subtitle}</p>
    </div>
    <ChevronRight size={18} className="text-slate-300 group-hover:text-primary transition-colors" />
  </div>
);

const NotificationItem = ({ type, icon, message, time }: { type: string, icon: React.ReactNode, message: string, time: string }) => {
  const typeClasses: Record<string, string> = {
    info: 'bg-blue-100 dark:bg-blue-900/40 text-blue-600',
    warning: 'bg-amber-100 dark:bg-amber-900/40 text-amber-600',
    success: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600',
  };

  return (
    <div className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex gap-3 cursor-pointer">
      <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${typeClasses[type]}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-tight mb-1">{message}</p>
        <p className="text-[10px] text-slate-400 uppercase tracking-tighter font-bold">{time}</p>
      </div>
    </div>
  );
};

const RecentItem = ({ icon, title, subtitle, time, onClick }: { icon: React.ReactNode, title: string, subtitle: string, time: string, onClick?: () => void }) => (
  <div 
    onClick={onClick}
    className="flex items-center justify-between group cursor-pointer"
  >
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
        {icon}
      </div>
      <div>
        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">{title}</p>
        <p className="text-[10px] text-slate-500">{subtitle}</p>
      </div>
    </div>
    <span className="text-[10px] text-slate-400 font-medium">{time}</span>
  </div>
);
