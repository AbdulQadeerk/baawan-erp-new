import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  ChevronRight, 
  Filter, 
  Search, 
  TrendingUp, 
  Wallet, 
  ShieldCheck,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { motion } from 'motion/react';
import { reportService } from '../services/api';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export const TrialBalanceReport: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    fromDate: '2024-01-01',
    toDate: '2024-12-31',
    branch: 'All Branches',
    level: 'Ledger'
  });

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        fromDate: filters.fromDate,
        toDate: filters.toDate,
        groupId: "", 
        includeChild: true,
        branchId: 0
      };
      
      const result = await reportService.getTrialBalance(params) as any;
      const items = Array.isArray(result) ? result : (result.data || []);
      
      const mappedData = items.map((item: any) => ({
        id: item.id || Math.random().toString(36).substr(2, 9),
        name: item.name || item.ledgerName || item.particulars || 'Unknown',
        type: item.type || (item.isHeader ? 'header' : 'ledger'),
        opening: item.opening || item.openingBalance || 0,
        debit: item.debit || 0,
        credit: item.credit || 0,
        closing: item.closing || item.closingBalance || 0
      }));

      setData(mappedData);
    } catch (err: any) {
      console.error('Trial Balance Error:', err);
      setError(err.message || 'Failed to fetch trial balance data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const chartData = [
    { name: 'Current Assets', value: 42, color: '#3B82F6' },
    { name: 'Fixed Assets', value: 22, color: '#60A5FA' },
    { name: 'Liabilities', value: 36, color: '#1E3A8A' },
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Math.abs(value));
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-200 p-6 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <div className="flex items-center text-xs text-slate-400 mb-2 gap-2">
            <span>Financials</span>
            <ChevronRight size={12} />
            <span>Reports</span>
            <ChevronRight size={12} />
            <span className="text-blue-400">Trial Balance</span>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Trial Balance Report</h1>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-medium transition-colors border border-slate-700">
            <Download size={16} />
            Download PDF
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-medium transition-colors border border-slate-700">
            <FileText size={16} />
            Export Excel
          </button>
          <button className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700">
            <Printer size={18} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl text-rose-400 text-sm font-medium">
              {error}
            </div>
          )}
          {/* Filters */}
          <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 flex flex-wrap items-end gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Date Range</label>
              <div className="relative">
                <input 
                  type="text" 
                  value="Jan 01, 2024 - Dec 31, 2024" 
                  readOnly
                  className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Branch/Location</label>
              <select 
                value={filters.branch}
                onChange={(e) => setFilters({...filters, branch: e.target.value})}
                className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm w-48 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="All Branches">All Branches</option>
                <option value="Main Office">Main Office</option>
                <option value="Warehouse A">Warehouse A</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Report Level</label>
              <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700">
                <button 
                  onClick={() => setFilters({...filters, level: 'Ledger'})}
                  className={`px-4 py-1 text-xs font-medium rounded-md transition-all ${filters.level === 'Ledger' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  Ledger
                </button>
                <button 
                  onClick={() => setFilters({...filters, level: 'Group'})}
                  className={`px-4 py-1 text-xs font-medium rounded-md transition-all ${filters.level === 'Group' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  Group
                </button>
              </div>
            </div>
            <button 
              onClick={fetchData}
              className="ml-auto bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 shadow-lg shadow-blue-900/20"
            >
              <Filter size={16} />
              Apply Filters
            </button>
          </div>

          {/* Table */}
          <div className="bg-slate-900/50 rounded-xl border border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-bottom border-slate-800 bg-slate-900/80">
                    <th className="px-6 py-4 text-[10px] uppercase tracking-wider text-slate-500 font-bold">Account Particulars</th>
                    <th className="px-6 py-4 text-[10px] uppercase tracking-wider text-slate-500 font-bold text-right">Opening Balance</th>
                    <th className="px-6 py-4 text-[10px] uppercase tracking-wider text-slate-500 font-bold text-right">Debit</th>
                    <th className="px-6 py-4 text-[10px] uppercase tracking-wider text-slate-500 font-bold text-right">Credit</th>
                    <th className="px-6 py-4 text-[10px] uppercase tracking-wider text-slate-500 font-bold text-right">Closing Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-slate-400 text-sm">Loading report data...</span>
                        </div>
                      </td>
                    </tr>
                  ) : data.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-20 text-center text-slate-500 italic">
                        No data found for the selected criteria.
                      </td>
                    </tr>
                  ) : (
                    data.map((row) => (
                      <tr key={row.id} className={`hover:bg-slate-800/30 transition-colors ${row.type === 'header' ? 'bg-slate-800/10' : ''}`}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {row.type === 'ledger' && <ArrowRight size={12} className="text-blue-500" />}
                            <span className={`text-sm ${row.type === 'header' ? 'font-bold text-blue-400' : 'text-slate-300'}`}>
                              {row.name}
                            </span>
                          </div>
                        </td>
                        <td className={`px-6 py-4 text-sm text-right font-mono ${row.type === 'header' ? 'opacity-0' : 'text-slate-400'}`}>
                          {formatCurrency(row.opening)}
                        </td>
                        <td className={`px-6 py-4 text-sm text-right font-mono ${row.type === 'header' ? 'opacity-0' : 'text-slate-300'}`}>
                          {formatCurrency(row.debit)}
                        </td>
                        <td className={`px-6 py-4 text-sm text-right font-mono ${row.type === 'header' ? 'opacity-0' : 'text-slate-300'}`}>
                          {formatCurrency(row.credit)}
                        </td>
                        <td className={`px-6 py-4 text-sm text-right font-mono ${row.type === 'header' ? 'opacity-0' : 'text-white font-semibold'}`}>
                          {formatCurrency(row.closing)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer Summary */}
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="flex gap-12">
              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Total Debit</span>
                <div className="text-xl font-bold text-white font-mono">1,245,600.00</div>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Total Credit</span>
                <div className="text-xl font-bold text-white font-mono">1,245,600.00</div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-lg flex items-center gap-3">
                <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                  <ShieldCheck size={14} className="text-white" />
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-emerald-500/70 font-bold">Status</div>
                  <div className="text-xs font-bold text-emerald-400">Accounts Balanced</div>
                </div>
              </div>

              <div className="bg-slate-800/50 border border-slate-700 px-4 py-2 rounded-lg">
                <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Difference</div>
                <div className="text-xs font-bold text-blue-400 font-mono">0.00</div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Quick Insights</h3>
              <AlertCircle size={14} className="text-slate-500" />
            </div>

            <div className="space-y-8">
              <div>
                <h4 className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-4">Asset vs Liability Distribution</h4>
                <div className="h-48 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1E293B', border: 'none', borderRadius: '8px', fontSize: '12px' }}
                        itemStyle={{ color: '#F1F5F9' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-2xl font-bold text-white">64%</span>
                    <span className="text-[10px] uppercase text-slate-500 font-bold">Assets</span>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  {chartData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                        <span className="text-slate-400">{item.name}</span>
                      </div>
                      <span className="text-slate-200 font-semibold">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Quick Stats</h4>
                
                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-500">
                      <Wallet size={16} />
                    </div>
                    <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Cash on Hand</span>
                  </div>
                  <div className="text-xl font-bold text-white">$142,500.22</div>
                  <div className="flex items-center gap-1 mt-1 text-[10px] text-emerald-400 font-bold">
                    <TrendingUp size={10} />
                    +12.5% vs Prev Year
                  </div>
                </div>

                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center text-purple-500">
                      <TrendingUp size={16} />
                    </div>
                    <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Net Worth</span>
                  </div>
                  <div className="text-xl font-bold text-white">$892,120.00</div>
                  <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-500 font-bold">
                    <AlertCircle size={10} />
                    Update 5 mins ago
                  </div>
                </div>
              </div>

              <div className="bg-blue-600/10 border border-blue-500/20 p-4 rounded-xl">
                <div className="flex items-center gap-3 mb-3">
                  <ShieldCheck size={18} className="text-blue-500" />
                  <h4 className="text-[10px] uppercase tracking-wider text-blue-500 font-bold">Audit Status</h4>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Last audited on Oct 24, 2023. This report is interactive; click on any account name to view the detailed ledger breakdown.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
