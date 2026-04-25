/**
 * PrintViewModal — React equivalent of Angular's PrintViewModalComponent
 * Angular: src/app/shared/print-view-modal/print-view-modal.component.ts
 *
 * Displays a PDF blob URL in an iframe for preview/print.
 */
import React from 'react';
import { X, Printer, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PrintViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  blobUrl: string;
  billNo?: string;
  ledger?: string;
  type?: string;
}

export const PrintViewModal: React.FC<PrintViewModalProps> = ({
  isOpen,
  onClose,
  blobUrl,
  billNo = '',
  ledger = '',
  type = '',
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    const iframe = document.getElementById('print-iframe') as HTMLIFrameElement;
    if (iframe?.contentWindow) {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    }
  };

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = `${type}_${billNo || 'document'}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[150] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-5xl h-[90vh] overflow-hidden flex flex-col border border-slate-200 dark:border-slate-700"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
            <div className="text-sm">
              <h3 className="font-bold text-slate-800 dark:text-slate-100">{type || 'Print Preview'}</h3>
              {billNo && <p className="text-slate-500">{billNo}{ledger ? ` • ${ledger}` : ''}</p>}
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handlePrint} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 rounded-lg transition-colors text-blue-700 dark:text-blue-300 text-sm font-medium">
                <Printer size={14} /> Print
              </button>
              <button onClick={handleDownload} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 dark:bg-emerald-900/30 hover:bg-emerald-200 rounded-lg transition-colors text-emerald-700 dark:text-emerald-300 text-sm font-medium">
                <Download size={14} /> Download
              </button>
              <button onClick={onClose} className="p-2 bg-rose-100 dark:bg-rose-900/30 hover:bg-rose-200 rounded-lg transition-colors text-rose-600 dark:text-rose-400">
                <X size={16} />
              </button>
            </div>
          </div>

          {/* PDF Viewer */}
          <div className="flex-1">
            <iframe
              id="print-iframe"
              src={blobUrl}
              className="w-full h-full border-0"
              title="Print Preview"
            />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
