/**
 * AG Grid Custom Controls — React equivalent of Angular's custom-ag-controls module
 * Includes renderers for actions, buttons, and custom headers.
 */
import React from 'react';
import { Edit2, Trash2, Eye, FileText, Printer, FileDown, ArrowRightLeft, Plus } from 'lucide-react';
import { usePermission } from './hooks/useShared';

export const AgActionButtonRenderer = (props: any) => {
  const isEditGranted = usePermission(props.permissions?.edit);
  const isDeleteGranted = usePermission(props.permissions?.delete);

  return (
    <div className="flex items-center gap-2 h-full">
      {isEditGranted && (
        <button
          onClick={(e) => props.onClick && props.onClick({ event: e, rowData: props.data })}
          className="text-blue-600 hover:text-blue-800 transition-colors p-1"
          title="Edit"
        >
          <Edit2 size={16} />
        </button>
      )}
      {isDeleteGranted && (
        <button
          onClick={(e) => props.onDelClick && props.onDelClick({ event: e, rowData: props.data })}
          className="text-rose-600 hover:text-rose-800 transition-colors p-1"
          title="Delete"
        >
          <Trash2 size={16} />
        </button>
      )}
    </div>
  );
};

export const AgViewButtonRenderer = (props: any) => (
  <div className="flex items-center h-full">
    <button
      onClick={(e) => props.onClick && props.onClick({ event: e, rowData: props.data })}
      className="text-emerald-600 hover:text-emerald-800 transition-colors p-1"
      title="View"
    >
      <Eye size={16} />
    </button>
  </div>
);

export const AgPdfButtonRenderer = (props: any) => (
  <div className="flex items-center h-full">
    <button
      onClick={(e) => props.onClick && props.onClick({ event: e, rowData: props.data })}
      className="text-slate-600 hover:text-slate-800 transition-colors p-1"
      title="PDF"
    >
      <FileDown size={16} />
    </button>
  </div>
);

export const AgPrintButtonRenderer = (props: any) => (
  <div className="flex items-center h-full">
    <button
      onClick={(e) => props.onClick && props.onClick({ event: e, rowData: props.data })}
      className="text-slate-600 hover:text-slate-800 transition-colors p-1"
      title="Print"
    >
      <Printer size={16} />
    </button>
  </div>
);

export const AgPdfWithCodeButtonRenderer = (props: any) => (
  <div className="flex items-center h-full">
    <button
      onClick={(e) => props.onClick && props.onClick({ event: e, rowData: props.data })}
      className="text-slate-600 hover:text-slate-800 transition-colors p-1"
      title="PDF with Item Code"
    >
      <FileText size={16} />
    </button>
  </div>
);

export const AgAddButtonRenderer = (props: any) => (
  <div className="flex items-center h-full">
    <button
      onClick={(e) => props.onClick && props.onClick({ event: e, rowData: props.data })}
      className="text-blue-600 hover:text-blue-800 transition-colors p-1"
      title="Add"
    >
      <Plus size={16} />
    </button>
  </div>
);

export const AgEditButtonRenderer = (props: any) => {
  const isGranted = usePermission(props.permissions?.edit);
  if (!isGranted) return null;

  return (
    <div className="flex items-center h-full">
      <button
        onClick={(e) => props.onClick && props.onClick({ event: e, rowData: props.data })}
        className="text-blue-600 hover:text-blue-800 transition-colors p-1"
        title="Edit"
      >
        <Edit2 size={16} />
      </button>
    </div>
  );
};

export const AgDeleteButtonRenderer = (props: any) => {
  const isGranted = usePermission(props.permissions?.delete);
  if (!isGranted) return null;

  return (
    <div className="flex items-center h-full">
      <button
        onClick={(e) => props.onClick && props.onClick({ event: e, rowData: props.data })}
        className="text-rose-600 hover:text-rose-800 transition-colors p-1"
        title="Delete"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
};

export const AgDiscountHeader = (props: any) => {
  const onToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (props.onToggleClick) {
      props.onToggleClick();
    }
  };

  return (
    <div className="flex items-center w-full h-full">
      <span className="flex-grow truncate">{props.displayName}</span>
      <button
        onClick={onToggle}
        className="ml-1 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
        title={props.enableIcon ? `Switch to ${props.discountMode === 'percentage' ? 'Amount' : 'Percentage'}` : ''}
      >
        <ArrowRightLeft size={14} />
      </button>
    </div>
  );
};
