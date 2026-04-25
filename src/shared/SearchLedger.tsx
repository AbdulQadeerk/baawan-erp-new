/**
 * SearchLedger — React equivalent of Angular's SearchLedgerComponent
 * Angular: src/app/shared/search-ledger/search-ledger.component.ts
 */
import React, { useState, useEffect, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Search, ListPlus, ArrowRight } from 'lucide-react';
import { AgGridReact } from 'ag-grid-react';
import { apiClient } from '../lib/api-client';
import { storage } from '../lib/storage';
import { STORAGE_KEYS } from '../lib/constants';
import { getGroupChildren } from './shared.service';
import { toast } from '../lib/toast';

interface SearchLedgerProps {
  onAddToList?: (selectedRows: any[]) => void;
  onNext?: () => void;
  initialValues?: any;
}

export const SearchLedger: React.FC<SearchLedgerProps> = ({
  onAddToList,
  onNext,
  initialValues,
}) => {
  const { register, handleSubmit, control, reset } = useForm({
    defaultValues: {
      name: '',
      assignedUserID: '',
      groupId: '',
      includeChildGroups: true,
      toDate: new Date().toISOString().split('T')[0],
      ...initialValues,
    },
  });

  const [ledgerList, setLedgerList] = useState<any[]>([]);
  const [groupList, setGroupList] = useState<any[]>([]);
  const [salesPersonList, setSalesPersonList] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [gridApi, setGridApi] = useState<any>(null);

  useEffect(() => {
    // Fetch Sales Persons
    apiClient.post('/api/Common/Dropdown', { table: 18 })
      .then((data) => setSalesPersonList(data || []))
      .catch(console.error);

    // Fetch Groups
    apiClient.post('/api/Group/Search', {})
      .then((data) => {
        const list = data?.list || [];
        const baseGroups = list.filter((x: any) => x.id === 16 || x.id === 17);
        let childGroups: number[] = [];

        baseGroups.forEach((v: any) => {
          childGroups.push(v.id);
          childGroups = [...childGroups, ...getGroupChildren(v.id, list)];
        });

        const filtered = list.filter((x: any) => childGroups.includes(x.id));
        filtered.sort((a: any, b: any) => a.name.localeCompare(b.name));
        setGroupList(filtered);
      })
      .catch(console.error);
  }, []);

  const columnDefs = useMemo(() => [
    {
      headerName: '',
      field: 'ledger_id',
      headerCheckboxSelection: true,
      headerCheckboxSelectionFilteredOnly: true,
      checkboxSelection: true,
      width: 50,
    },
    { field: 'name', headerName: 'Ledger', sortable: true, filter: true, flex: 2, wrapText: true, autoHeight: true },
    { field: 'group', headerName: 'Group', sortable: true, filter: true, flex: 1 },
  ], []);

  const onSubmit = async (values: any) => {
    setIsSearching(true);
    const toDateStr = values.toDate ? `${values.toDate.split('-').reverse().join('/')} 23:59:59` : null;

    const payload = {
      isSync: false,
      name: values.name || null,
      assignedUserID: values.assignedUserID || null,
      groups: values.groupId ? [Number(values.groupId)] : [],
      includeChildGroups: values.includeChildGroups,
      toDate: toDateStr,
      lockFreeze: false,
    };

    try {
      const data = await apiClient.post('/api/Ledger/Search', payload);
      const allowedGroupNames = groupList.map((g) => g.name);
      const filtered = (data?.list || []).filter((ledger: any) => allowedGroupNames.includes(ledger.group));
      
      const sorted = filtered.sort((a: any, b: any) => {
        const nameA = a.name?.toLowerCase() || '';
        const nameB = b.name?.toLowerCase() || '';
        return nameA.localeCompare(nameB);
      });
      
      setLedgerList(sorted);
    } catch (err: any) {
      toast.error(err.message || 'Search failed');
      setLedgerList([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddToList = () => {
    if (!gridApi) return;
    const selectedRows = gridApi.getSelectedRows();
    if (selectedRows.length) {
      onAddToList?.(selectedRows);
    } else {
      toast.warning('Please select ledger(s)');
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Search Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-4 rounded-xl shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">Ledger Name</label>
            <input
              {...register('name')}
              type="text"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
              placeholder="Search by name..."
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">Sales Person</label>
            <select
              {...register('assignedUserID')}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
            >
              <option value="">All</option>
              {salesPersonList.map((sp) => (
                <option key={sp.id} value={sp.id}>{sp.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">Group</label>
            <select
              {...register('groupId')}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
            >
              <option value="">All</option>
              {groupList.map((g) => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
            <div className="flex items-center gap-1.5 mt-1">
              <input type="checkbox" id="includeChildGroups" {...register('includeChildGroups')} className="rounded text-blue-600 focus:ring-blue-500 bg-slate-100 border-slate-300 dark:bg-slate-800 dark:border-slate-600" />
              <label htmlFor="includeChildGroups" className="text-[10px] text-slate-500 cursor-pointer">Include Child Groups</label>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">To Date</label>
            <input
              {...register('toDate')}
              type="date"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isSearching}
              className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              <Search size={16} /> {isSearching ? '...' : 'Search'}
            </button>
            <button
              type="button"
              onClick={() => reset()}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-sm font-bold rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      </form>

      {/* Grid actions */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Ledgers ({ledgerList.length})</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={handleAddToList}
            className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-sm font-semibold rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors flex items-center gap-1.5"
          >
            <ListPlus size={16} /> Add to List
          </button>
          <button
            onClick={onNext}
            className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-sm font-semibold rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors flex items-center gap-1.5"
          >
            Next <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="ag-theme-alpine dark:ag-theme-alpine-dark flex-1 min-h-[400px] w-full rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
        <AgGridReact
          rowData={ledgerList}
          columnDefs={columnDefs}
          defaultColDef={{ resizable: true, sortable: true, filter: true }}
          rowSelection="multiple"
          onGridReady={(params) => setGridApi(params.api)}
          animateRows={true}
          rowHeight={40}
          headerHeight={44}
          suppressCellFocus={true}
        />
      </div>
    </div>
  );
};
