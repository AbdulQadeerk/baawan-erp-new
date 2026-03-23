import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquare, 
  PhoneCall, 
  Share2, 
  FileText, 
  GitBranch, 
  Edit3, 
  Trash2,
  MoreVertical,
  ChevronRight,
  Send,
  Download,
  Printer,
  X,
  Smartphone,
  MessageCircle,
  ExternalLink,
  ShieldCheck,
  Ban
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface VoucherActionMenuProps {
  onViewDependency: () => void;
  onCancel: () => void;
  onCorrect: () => void;
  onExport: () => void;
  onEwayBill: () => void;
  onSMS: () => void;
  onWhatsApp: () => void;
}

export const VoucherActionMenu: React.FC<VoucherActionMenuProps> = ({
  onViewDependency,
  onCancel,
  onCorrect,
  onExport,
  onEwayBill,
  onSMS,
  onWhatsApp
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const menuItems = [
    { label: 'SMS', icon: <Smartphone size={18} className="text-slate-500" />, onClick: onSMS },
    { label: 'WhatsApp', icon: <MessageCircle size={18} className="text-emerald-500" />, onClick: onWhatsApp },
    { label: 'Export', icon: <Download size={18} className="text-blue-500" />, onClick: onExport },
    { label: 'E-way Bill', icon: <ShieldCheck size={18} className="text-indigo-500" />, onClick: onEwayBill },
    { label: 'View Dependency', icon: <GitBranch size={18} className="text-purple-500" />, onClick: onViewDependency },
    { label: 'Correct Voucher', icon: <Edit3 size={18} className="text-orange-500" />, onClick: onCorrect },
    { label: 'Cancel', icon: <Ban size={18} className="text-red-500" />, onClick: onCancel },
  ];

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 rounded-lg transition-all duration-200 ${
          isOpen 
            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
            : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-200'
        }`}
      >
        <MoreVertical size={20} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10, x: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10, x: -10 }}
            className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 z-50 overflow-hidden py-2"
          >
            {menuItems.map((item, index) => (
              <button
                key={index}
                onClick={() => {
                  item.onClick();
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-4 px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-all group"
              >
                <span className="flex-shrink-0 transition-transform group-hover:scale-110">
                  {item.icon}
                </span>
                <span className="flex-grow text-left">{item.label}</span>
                <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-400" />
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
