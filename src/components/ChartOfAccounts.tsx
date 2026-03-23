import React, { useState } from 'react';
import { 
  ChevronRight, 
  ChevronDown, 
  Folder, 
  FileText, 
  Search, 
  Plus, 
  RefreshCw, 
  Edit3, 
  Download, 
  ArrowRight,
  Wallet,
  Building2,
  Banknote,
  HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AccountNode {
  id: string;
  code: string;
  name: string;
  type: 'group' | 'ledger';
  children?: AccountNode[];
  isOpen?: boolean;
}

const initialTreeData: AccountNode[] = [
  {
    id: '1',
    code: '1000',
    name: 'Assets',
    type: 'group',
    isOpen: true,
    children: [
      {
        id: '1.1',
        code: '1100',
        name: 'Current Assets',
        type: 'group',
        isOpen: true,
        children: [
          { id: '1.1.1', code: '1110', name: 'Bank Accounts', type: 'group' },
          { id: '1.1.2', code: '1120', name: 'Accounts Receivable', type: 'ledger' },
        ]
      },
      { id: '1.2', code: '1200', name: 'Fixed Assets', type: 'group' },
    ]
  },
  { id: '2', code: '2000', name: 'Liabilities', type: 'group' },
  { id: '3', code: '3000', name: 'Equity', type: 'group' },
  { id: '4', code: '4000', name: 'Income', type: 'group' },
  { id: '5', code: '5000', name: 'Expenses', type: 'group' },
];

const ledgerPreviewData = [
  { code: '1111', name: 'Main Operating Bank Account', type: 'Bank', balance: '$320,500.00', status: 'ACTIVE' },
  { code: '1112', name: 'Petty Cash Account', type: 'Cash', balance: '$1,240.00', status: 'ACTIVE' },
  { code: '1121', name: 'Domestic Trade Debtors', type: 'Receivable', balance: '$118,650.00', status: 'ACTIVE' },
  { code: '1122', name: 'International Trade Debtors', type: 'Receivable', balance: '$12,500.00', status: 'REVIEW' },
];

export const ChartOfAccounts: React.FC = () => {
  const [treeData, setTreeData] = useState<AccountNode[]>(initialTreeData);
  const [selectedNode, setSelectedNode] = useState<AccountNode | null>(initialTreeData[0].children![0]);
  const [searchTerm, setSearchTerm] = useState('');

  const toggleNode = (nodeId: string) => {
    const updateNode = (nodes: AccountNode[]): AccountNode[] => {
      return nodes.map(node => {
        if (node.id === nodeId) {
          return { ...node, isOpen: !node.isOpen };
        }
        if (node.children) {
          return { ...node, children: updateNode(node.children) };
        }
        return node;
      });
    };
    setTreeData(updateNode(treeData));
  };

  const renderTree = (nodes: AccountNode[], level: number = 0) => {
    return nodes.map(node => (
      <div key={node.id} className="select-none">
        <div 
          className={`flex items-center gap-2 py-1.5 px-2 rounded-lg cursor-pointer transition-colors group ${
            selectedNode?.id === node.id 
              ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
              : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
          }`}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
          onClick={() => {
            if (node.type === 'group') toggleNode(node.id);
            setSelectedNode(node);
          }}
        >
          {node.type === 'group' ? (
            <span className="text-slate-400">
              {node.isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </span>
          ) : (
            <span className="w-3.5" />
          )}
          
          {node.type === 'group' ? (
            <Folder size={16} className={selectedNode?.id === node.id ? 'text-blue-500' : 'text-slate-400'} />
          ) : (
            <FileText size={16} className="text-slate-400" />
          )}
          
          <span className={`text-sm font-medium truncate ${selectedNode?.id === node.id ? 'font-bold' : ''}`}>
            {node.code} - {node.name}
          </span>
        </div>
        
        {node.type === 'group' && node.isOpen && node.children && (
          <div className="mt-0.5">
            {renderTree(node.children, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className="flex h-[calc(100vh-112px)] overflow-hidden bg-white dark:bg-slate-900 transition-colors">
      {/* Sidebar */}
      <div className="w-80 border-r border-slate-200 dark:border-slate-800 flex flex-col bg-slate-50/30 dark:bg-slate-900/50">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Chart of Accounts</h2>
            <button className="text-blue-600 text-xs font-bold flex items-center gap-1 hover:underline">
              <RefreshCw size={12} /> Refresh
            </button>
          </div>
          
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Find account group..."
              className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <button className="py-2 px-3 bg-slate-100 dark:bg-slate-800 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
              Expand All
            </button>
            <button className="py-2 px-3 bg-slate-100 dark:bg-slate-800 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
              Collapse All
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {renderTree(treeData)}
        </div>
        
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <button className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 transition-all">
            <Plus size={18} /> New Account Group
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto bg-white dark:bg-slate-900 custom-scrollbar">
        <div className="p-8 max-w-6xl mx-auto">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs text-slate-500 mb-4 font-medium">
            <span>Chart of Accounts</span>
            <ChevronRight size={14} />
            <span>Assets</span>
            <ChevronRight size={14} />
            <span className="text-blue-600 font-bold">Current Assets</span>
          </nav>

          {/* Header */}
          <div className="flex items-start justify-between mb-10">
            <div>
              <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
                {selectedNode ? `${selectedNode.code} - ${selectedNode.name}` : 'Select a Group'}
              </h1>
              <p className="text-slate-500 font-medium">Managing short-term liquid assets and receivables.</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                <Edit3 size={18} className="text-slate-400" />
                Edit Group
              </button>
              <button className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                <Download size={18} className="text-slate-400" />
                Export
              </button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <SummaryCard 
              icon={<Folder size={24} className="text-blue-600" />}
              label="Total Sub-groups"
              value="12"
              bgColor="bg-blue-50 dark:bg-blue-900/20"
            />
            <SummaryCard 
              icon={<Building2 size={24} className="text-orange-600" />}
              label="Total Ledgers"
              value="48"
              bgColor="bg-orange-50 dark:bg-orange-900/20"
            />
            <SummaryCard 
              icon={<Wallet size={24} className="text-emerald-600" />}
              label="Current Net Balance"
              value="$452,890.00"
              bgColor="bg-emerald-50 dark:bg-emerald-900/20"
              valueColor="text-emerald-600 dark:text-emerald-400"
            />
          </div>

          {/* Table Section */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-white">Sub-accounts & Ledgers Preview</h3>
              <button className="text-blue-600 text-sm font-bold flex items-center gap-1 hover:underline">
                View All <ArrowRight size={14} />
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-slate-800/50">
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Code</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Name</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Balance</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {ledgerPreviewData.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                      <td className="px-6 py-4 text-sm font-mono text-slate-500">{item.code}</td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-900 dark:text-white">{item.name}</td>
                      <td className="px-6 py-4 text-sm text-slate-500">{item.type}</td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-900 dark:text-white text-right">{item.balance}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black tracking-widest ${
                          item.status === 'ACTIVE' 
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      
      {/* Help Button */}
      <button className="fixed bottom-6 right-6 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-xl shadow-blue-600/30 hover:scale-110 transition-transform z-50">
        <HelpCircle size={24} />
      </button>
    </div>
  );
};

const SummaryCard = ({ icon, label, value, bgColor, valueColor = "text-slate-900 dark:text-white" }: { icon: React.ReactNode, label: string, value: string, bgColor: string, valueColor?: string }) => (
  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex items-center gap-6">
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${bgColor}`}>
      {icon}
    </div>
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{label}</p>
      <p className={`text-2xl font-black ${valueColor}`}>{value}</p>
    </div>
  </div>
);
