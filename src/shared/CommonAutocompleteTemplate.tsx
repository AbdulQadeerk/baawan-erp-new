/**
 * CommonAutocompleteTemplate — React equivalent of Angular's CommonAutocompleteTemplateComponent
 * Angular: src/app/shared/common-autocomplete-template/common-autocomplete-template.component.ts
 */
import React from 'react';
import { useAuth } from '../lib/auth-context';

interface CommonAutocompleteTemplateProps {
  result: any;
  templateType: string;
}

export const CommonAutocompleteTemplate: React.FC<CommonAutocompleteTemplateProps> = ({
  result,
  templateType,
}) => {
  const { company } = useAuth();
  const currentCompany = company || {} as any;

  if (!result) return null;

  switch (templateType) {
    case 'item':
      return (
        <div className="grid grid-cols-12 gap-2 text-sm text-slate-800 dark:text-slate-200">
          <div className="col-span-3 truncate" title={result.ict}>{result.ict}</div>
          <div className="col-span-3 truncate" title={result.nm || result.name}>{result.nm || result.name || ' '}</div>
          <div className="col-span-6">
            <div className={`grid ${currentCompany.taxType === 4 ? 'grid-cols-5' : 'grid-cols-4'} gap-2`}>
              <div className="truncate" title={result.cat}>{result.cat || ' '}</div>
              <div className="truncate" title={result.siz}>{result.siz || ' '}</div>
              <div className="truncate" title={result.typ}>{result.typ || ' '}</div>
              <div className="truncate" title={result.brd}>{result.brd || ' '}</div>
              {currentCompany.taxType === 4 && (
                <div className="truncate" title={result.hsn}>{result.hsn || ' '}</div>
              )}
            </div>
          </div>
        </div>
      );
    case 'ledger':
      return (
        <div className="grid grid-cols-12 gap-2 text-sm text-slate-800 dark:text-slate-200">
          <div className="col-span-3 truncate font-medium" title={result.name}>{result.name}</div>
          <div className="col-span-9">
            <div className="grid grid-cols-12 gap-2">
              <div className="col-span-2 truncate text-xs font-bold" title={result.group}>{result.group || ' '}</div>
              
              {currentCompany.businessType !== 23 ? (
                <div className="col-span-5">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="truncate text-slate-600 dark:text-slate-400" title={result.area}>{result.area || ' '}</div>
                    <div className="truncate text-slate-600 dark:text-slate-400" title={result.city}>{result.city || ' '}</div>
                  </div>
                </div>
              ) : (
                <div className="col-span-5 truncate text-slate-600 dark:text-slate-400" title={result.address}>{result.address || ' '}</div>
              )}
              
              <div className="col-span-2 truncate text-xs font-bold" title={result.mobile}>{result.mobile || ' '}</div>
              
              {currentCompany.businessType !== 23 ? (
                <div className="col-span-3 truncate text-xs font-bold" title={result.gstNo}>{result.gstNo || ' '}</div>
              ) : (
                <>
                  <div className="col-span-2 truncate text-[13px] font-bold" title={result.gstNo}>{result.gstNo || ' '}</div>
                  <div className="col-span-1 truncate text-xs font-bold" title={result.id}>{result.id || ' '}</div>
                </>
              )}
            </div>
          </div>
        </div>
      );
    case 'rate':
      return <div className="text-sm text-slate-800 dark:text-slate-200 truncate">{result.priceCategoryName}</div>;
    default:
      return <div className="text-sm text-slate-800 dark:text-slate-200 truncate">{result.name || result.particular}</div>;
  }
};
