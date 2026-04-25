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
  const currentCompany = company;

  if (!result) return null;

  switch (templateType) {
    case 'item':
      return (
        <div className="flex flex-col py-1">
          <span className="font-medium text-slate-800 dark:text-slate-200">
            {result.ict && `${result.ict} `}{result.nm || result.name}
          </span>
          <span className="text-xs text-slate-500">
            {[result.typ, result.brd, result.siz, result.ig].filter(Boolean).join(' | ')}
          </span>
        </div>
      );
    case 'ledger':
      return (
        <div className="flex flex-col py-1">
          <span className="font-medium text-slate-800 dark:text-slate-200">{result.name}</span>
          <span className="text-xs text-slate-500 truncate max-w-full">
            {[result.address, result.city, result.mobile].filter(Boolean).join(', ')}
          </span>
          {result.group && <span className="text-[10px] text-blue-600 bg-blue-50 px-1 py-0.5 rounded w-fit mt-0.5">{result.group}</span>}
        </div>
      );
    default:
      return <span className="text-slate-800 dark:text-slate-200">{result.name || result.particular}</span>;
  }
};
