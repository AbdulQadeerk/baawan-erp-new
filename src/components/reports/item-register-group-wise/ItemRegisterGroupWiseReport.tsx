import React, { useState, useEffect, useCallback } from 'react';
import Select from 'react-select';
import { Search, RotateCcw, FileSpreadsheet, Loader2, Printer, BarChart2, CheckSquare, Eye } from 'lucide-react';
import { reportApi } from '../../../services/report.service';
import { commonApi } from '../../../services/common.service';
import { storage } from '../../../lib/storage';
import { STORAGE_KEYS } from '../../../lib/constants';
import { toast } from '../../../lib/toast';
import * as H from '../outstanding/outstandingHelpers';
import { ItemRegisterGroupWiseDetails } from './ItemRegisterGroupWiseDetails';

export const ItemRegisterGroupWiseReport: React.FC = () => {
  const precision = H.getPrecision();

  // Detail View State
  const [detailView, setDetailView] = useState<any | null>(null);

  // Filter Data Sources
  const [itemList, setItemList] = useState<any[]>([]);
  const [brandList, setBrandList] = useState<any[]>([]);
  const [categoryList, setCategoryList] = useState<any[]>([]);
  const [sizeList, setSizeList] = useState<any[]>([]);
  const [stockPlaceList, setStockPlaceList] = useState<any[]>([]);

  // Filter States
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<any | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<any | null>(null);
  const [selectedSize, setSelectedSize] = useState<any | null>(null);
  const [selectedStockPlace, setSelectedStockPlace] = useState<string>('');
  
  const [isOpeningStock, setIsOpeningStock] = useState(false);
  const [stockDetail, setStockDetail] = useState(false);

  const [fromDate, setFromDate] = useState<string>(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 3);
    d.setDate(1);
    return d.toISOString().split('T')[0];
  });
  const [toDate, setToDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(0);
    return d.toISOString().split('T')[0];
  });

  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [printLoading, setPrintLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    // Load local items
    const rawItems = storage.getItem<any[]>(STORAGE_KEYS.ITEM_LIST) || [];
    const formattedItems = rawItems
      .filter(x => x.isact)
      .map(ele => {
        const particular = [ele.nm, ele.ict, ele.typ, ele.brd, ele.siz, ele.ig].filter(Boolean).join(" ");
        return {
          value: ele.iid,
          label: ele.ict + ' ' + ele.nm,
          particular: particular,
          raw: ele
        };
      });
    setItemList(formattedItems);

    // Load common dropdowns
    commonApi.getDistinctValues({ table: 0, column: 'Brand' }).then(res => {
      setBrandList(res.map(x => ({ value: x.name, label: x.name })));
    }).catch(() => {});

    commonApi.getDistinctValues({ table: 0, column: 'Category' }).then(res => {
      setCategoryList(res.map(x => ({ value: x.name, label: x.name })));
    }).catch(() => {});

    commonApi.getDistinctValues({ table: 0, column: 'Sizes' }).then(res => {
      setSizeList(res.map(x => ({ value: x.name, label: x.name })));
    }).catch(() => {});

    commonApi.getDropdown({ table: 4 }).then(res => {
      setStockPlaceList(res || []);
    }).catch(() => {});
  }, []);

  const getFilters = useCallback(() => {
    return {
      fromDate: fromDate || null,
      toDate: toDate || null,
      isOpeningStock,
      stockDetail,
      spIds: (!isOpeningStock && selectedStockPlace) ? [parseInt(selectedStockPlace)] : null,
      itemIds: selectedItems.length > 0 ? selectedItems.map(x => x.value) : [],
      category: selectedCategory ? selectedCategory.value : null,
      sizes: selectedSize ? selectedSize.value : null,
      brand: selectedBrand ? selectedBrand.value : null,
      resultType: 1
    };
  }, [fromDate, toDate, isOpeningStock, stockDetail, selectedStockPlace, selectedItems, selectedCategory, selectedSize, selectedBrand]);

  const validate = () => {
    if (!selectedItems.length && !selectedCategory && !selectedSize && !selectedBrand) {
      toast.error("Please select Items, Brand, Category, or Sub Category.");
      return false;
    }
    if (!fromDate || !toDate) {
      toast.error("Please select From Date and To Date.");
      return false;
    }
    return true;
  };

  const processData = (rawData: any[]) => {
    const monthlyTotalsMap = new Map<string, any>();

    for (const itemGroup of rawData) {
      for (const itemId in itemGroup) {
        if (itemGroup.hasOwnProperty(itemId)) {
          const transactions = itemGroup[itemId];
          transactions.sort((a: any, b: any) => {
            const dateA = new Date(a.BillDate || '').getTime();
            const dateB = new Date(b.BillDate || '').getTime();
            return dateA - dateB;
          });

          let currentMonthKey: string | null = null;
          let closingQuantity: number | null = null;
          let closingValue: number | null = null;

          transactions.forEach((transaction: any) => {
            let monthKey;
            if (transaction.BillDate) {
              const billDate = new Date(transaction.BillDate);
              monthKey = `${billDate.getFullYear()}-${billDate.getMonth() + 1}`;
            } else {
              monthKey = "No Date";
            }

            if (monthKey !== currentMonthKey) {
              if (currentMonthKey !== null) {
                const previousMonth = monthlyTotalsMap.get(`${itemId}-${currentMonthKey}`);
                if (previousMonth) {
                  previousMonth.closingQuantity = closingQuantity;
                  previousMonth.closingValue = closingValue;
                }
              }

              closingQuantity = transaction.Balance || 0;
              closingValue = (transaction.Balance || 0) * (transaction.NetRate || 0);
              currentMonthKey = monthKey;
            } else {
              closingQuantity = transaction.Balance || 0;
              closingValue = (transaction.Balance || 0) * (transaction.NetRate || 0);
            }

            const inwardsQuantity = transaction.Received || 0;
            const inwardsValue = (transaction.Received || 0) * (transaction.NetRate || 0);
            const outwardsQuantity = transaction.Issued || 0;
            const outwardsValue = (transaction.Issued || 0) * (transaction.NetRate || 0);

            const itemMonthKey = `${itemId}-${monthKey}`;
            if (!monthlyTotalsMap.has(itemMonthKey)) {
              monthlyTotalsMap.set(itemMonthKey, {
                itemId,
                month: transaction.BillDate
                  ? `${new Date(transaction.BillDate).toLocaleString('default', { month: 'long' })} ${new Date(transaction.BillDate).getFullYear()}`
                  : "No Date",
                inwardsQuantity,
                inwardsValue,
                outwardsQuantity,
                outwardsValue,
                closingQuantity: null,
                closingValue: null,
                unit: (transaction.StdUnit && transaction.UnitConsumed && transaction.StdUnit !== transaction.UnitConsumed) 
                  ? `${transaction.StdUnit} (${transaction.UnitConsumed})` 
                  : (transaction.StdUnit || transaction.UnitConsumed || '')
              });
            } else {
              const existingMonth = monthlyTotalsMap.get(itemMonthKey);
              existingMonth.inwardsQuantity += inwardsQuantity;
              existingMonth.inwardsValue += inwardsValue;
              existingMonth.outwardsQuantity += outwardsQuantity;
              existingMonth.outwardsValue += outwardsValue;
            }
          });

          if (currentMonthKey !== null) {
            const lastMonth = monthlyTotalsMap.get(`${itemId}-${currentMonthKey}`);
            if (lastMonth) {
              lastMonth.closingQuantity = closingQuantity;
              lastMonth.closingValue = closingValue;
            }
          }
        }
      }
    }

    const totalsArray = Array.from(monthlyTotalsMap.values()).filter(month => month.month !== 'January 1970');

    // Attach Item Names from raw items
    const rawItems = storage.getItem<any[]>(STORAGE_KEYS.ITEM_LIST) || [];
    totalsArray.forEach(element => {
      const rec = rawItems.find(x => x.iid === element.itemId);
      if (rec) {
        element.itemName = rec.nm;
        element.itemCode = rec.ict;
      }
    });

    // Group by Item Name for the UI
    const groupedData: any[] = [];
    const groupedObj = totalsArray.reduce((acc: any, val: any) => {
      const key = val.itemName || 'Unknown Item';
      if (!acc[key]) acc[key] = [];
      acc[key].push(val);
      return acc;
    }, {});

    Object.keys(groupedObj).forEach(key => {
      groupedData.push({
        key,
        value: groupedObj[key]
      });
    });

    setData(groupedData);
  };

  const submitSearch = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const filters = getFilters();
      const payload = {
        ...filters,
        fromDate: filters.fromDate ? filters.fromDate + ' 00:00:00' : null,
        toDate: filters.toDate ? filters.toDate + ' 23:59:59' : null,
      };

      const res = await reportApi.itemRegisterWithGroups(payload);
      if (res && res.length) {
        processData(res);
      } else {
        setData([]);
        toast.info("No data found.");
      }
    } catch (err: any) {
      toast.error(err?.message || "Search failed");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const clear = () => {
    setSelectedItems([]);
    setSelectedBrand(null);
    setSelectedCategory(null);
    setSelectedSize(null);
    setSelectedStockPlace('');
    setIsOpeningStock(false);
    setStockDetail(false);
    setData([]);
    
    const d = new Date();
    d.setMonth(d.getMonth() - 3);
    d.setDate(1);
    setFromDate(d.toISOString().split('T')[0]);
    const d2 = new Date();
    d2.setDate(0);
    setToDate(d2.toISOString().split('T')[0]);
  };

  const submitExport = async () => {
    if (!validate()) return;
    setExportLoading(true);
    try {
      const filters = getFilters();
      const payload = {
        ...filters,
        fromDate: filters.fromDate ? filters.fromDate + ' 00:00:00' : null,
        toDate: filters.toDate ? filters.toDate + ' 23:59:59' : null,
        resultType: 2
      };

      const blob = await reportApi.itemRegisterExport(payload);
      if (blob?.size) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `item-register-group-wise.xlsx`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        toast.info("No data found to export.");
      }
    } catch (err: any) {
      toast.error(err?.message || "Export failed");
    } finally {
      setExportLoading(false);
    }
  };

  const handlePrint = () => {
    toast.info("Print requires backend mapping.");
  };

  // Switch to detail view
  if (detailView) {
    return (
      <ItemRegisterGroupWiseDetails
        filters={getFilters()}
        itemId={detailView.itemId}
        itemCode={detailView.itemCode}
        itemName={detailView.itemName}
        monthString={detailView.month}
        onBack={() => setDetailView(null)}
      />
    );
  }

  // React-select custom styles for dark mode compatibility
  const selectStyles = {
    control: (base: any, state: any) => ({
      ...base,
      backgroundColor: 'transparent',
      borderColor: state.isFocused ? '#0ea5e9' : 'transparent',
      boxShadow: state.isFocused ? '0 0 0 1px #0ea5e9' : 'none',
      '&:hover': {
        borderColor: state.isFocused ? '#0ea5e9' : 'transparent'
      },
      minHeight: '38px',
      borderRadius: '0.5rem',
    }),
    menu: (base: any) => ({
      ...base,
      zIndex: 50,
      borderRadius: '0.5rem',
      overflow: 'hidden',
      backgroundColor: 'white',
      border: '1px solid #e2e8f0',
    }),
    option: (base: any, state: any) => ({
      ...base,
      backgroundColor: state.isSelected ? '#0ea5e9' : state.isFocused ? '#f0f9ff' : 'white',
      color: state.isSelected ? 'white' : '#334155',
      '&:active': {
        backgroundColor: '#0ea5e9'
      }
    }),
    multiValue: (base: any) => ({
      ...base,
      backgroundColor: '#e0f2fe',
      borderRadius: '4px',
    }),
    multiValueLabel: (base: any) => ({
      ...base,
      color: '#0369a1',
    }),
    multiValueRemove: (base: any) => ({
      ...base,
      color: '#0369a1',
      ':hover': {
        backgroundColor: '#bae6fd',
        color: '#0c4a6e',
      },
    }),
    singleValue: (base: any) => ({
      ...base,
      color: 'inherit',
    })
  };

  let totalRowsCount = 0;
  data.forEach(group => {
    const rows = group.value.filter((m: any) => m.month !== 'No Date');
    totalRowsCount += rows.length;
  });

  return (
    <div className="font-sans text-slate-700 dark:text-slate-200 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="bg-sky-100 dark:bg-sky-900/30 p-2.5 rounded-xl text-sky-600 dark:text-sky-400">
            <CheckSquare size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">
              Item Register Group Wise
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Hierarchical analysis of item movements
            </p>
          </div>
        </div>
      </div>

      {/* Filters Card */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-5 mb-5">
        
        {/* Row 1: Dropdowns and Checkboxes */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-4 items-end">
          
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Items</label>
            <div className="border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800">
              <Select
                isMulti
                options={itemList}
                value={selectedItems}
                onChange={(val: any) => setSelectedItems(val)}
                styles={selectStyles}
                placeholder="Items"
                classNamePrefix="react-select"
                className="text-sm font-semibold dark:text-slate-800"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Brand</label>
            <div className="border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800">
              <Select
                options={brandList}
                value={selectedBrand}
                onChange={(val: any) => setSelectedBrand(val)}
                styles={selectStyles}
                isClearable
                placeholder="Brand"
                className="text-sm font-semibold dark:text-slate-800"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Category</label>
            <div className="border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800">
              <Select
                options={categoryList}
                value={selectedCategory}
                onChange={(val: any) => setSelectedCategory(val)}
                styles={selectStyles}
                isClearable
                placeholder="Category"
                className="text-sm font-semibold dark:text-slate-800"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Sub Category</label>
            <div className="border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800">
              <Select
                options={sizeList}
                value={selectedSize}
                onChange={(val: any) => setSelectedSize(val)}
                styles={selectStyles}
                isClearable
                placeholder="Sub Category"
                className="text-sm font-semibold dark:text-slate-800"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Stock Place</label>
            <select
              className="w-full h-[38px] min-h-[38px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 text-sm font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              value={selectedStockPlace}
              onChange={(e) => setSelectedStockPlace(e.target.value)}
            >
              <option value="">Select Stock Place</option>
              {stockPlaceList.map((sp: any) => (
                <option key={sp.id} value={sp.id}>{sp.name}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2 pb-1">
            <label className="flex items-center gap-2 cursor-pointer group">
              <div className="relative flex items-center">
                <input type="checkbox" className="peer sr-only" checked={isOpeningStock} onChange={(e) => setIsOpeningStock(e.target.checked)} />
                <div className="w-4 h-4 rounded border-2 border-slate-300 dark:border-slate-600 peer-checked:bg-sky-500 peer-checked:border-sky-500 transition-colors flex items-center justify-center">
                  <CheckSquare size={12} className="text-white opacity-0 peer-checked:opacity-100" />
                </div>
              </div>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">All Stock Places</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer group">
              <div className="relative flex items-center">
                <input type="checkbox" className="peer sr-only" checked={stockDetail} onChange={(e) => setStockDetail(e.target.checked)} />
                <div className="w-4 h-4 rounded border-2 border-slate-300 dark:border-slate-600 peer-checked:bg-sky-500 peer-checked:border-sky-500 transition-colors flex items-center justify-center">
                  <CheckSquare size={12} className="text-white opacity-0 peer-checked:opacity-100" />
                </div>
              </div>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors leading-tight">Stock Balance In Details</span>
            </label>
          </div>

        </div>

        {/* Row 2: Dates and Buttons */}
        <div className="flex flex-wrap items-end gap-4">
          
          <div className="flex gap-4">
            <div className="space-y-1 w-32">
              <label className="block text-[10px] font-bold text-rose-500 uppercase tracking-wider">From Date *</label>
              <input
                type="date"
                className="w-full h-[38px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 text-sm font-semibold text-slate-800 dark:text-slate-200 focus:outline-none"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>
            <div className="space-y-1 w-32">
              <label className="block text-[10px] font-bold text-rose-500 uppercase tracking-wider">To Date *</label>
              <input
                type="date"
                className="w-full h-[38px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 text-sm font-semibold text-slate-800 dark:text-slate-200 focus:outline-none"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pb-[1px]">
            <button onClick={submitSearch} disabled={loading} title="Search" className="w-10 h-[38px] flex items-center justify-center bg-[#2D9E75] text-white rounded-lg hover:opacity-90 transition-all shadow-sm cursor-pointer disabled:opacity-70">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
            </button>
            <button onClick={clear} title="Reset" className="w-10 h-[38px] flex items-center justify-center bg-lime-500 text-white rounded-lg hover:opacity-90 transition-all shadow-sm cursor-pointer">
              <RotateCcw size={16} />
            </button>
            <button onClick={submitExport} disabled={exportLoading || loading || !data.length} title="Excel Export" className="w-10 h-[38px] flex items-center justify-center bg-emerald-600 text-white rounded-lg hover:opacity-90 transition-all shadow-sm cursor-pointer disabled:opacity-70">
              {exportLoading ? <Loader2 size={16} className="animate-spin" /> : <FileSpreadsheet size={16} />}
            </button>
            <button onClick={handlePrint} disabled={printLoading || loading || !data.length} title="Print PDF" className="w-10 h-[38px] flex items-center justify-center bg-rose-500 text-white rounded-lg hover:opacity-90 transition-all shadow-sm cursor-pointer disabled:opacity-70">
              {printLoading ? <Loader2 size={16} className="animate-spin" /> : <Printer size={16} />}
            </button>
          </div>

        </div>
      </div>

      {/* Tab UI simulation */}
      <div className="mb-2">
        <div className="inline-flex items-center bg-white dark:bg-slate-800 rounded-t-lg border border-b-0 border-slate-200 dark:border-slate-700 px-4 py-2">
          <span className="text-xs font-bold text-sky-600 dark:text-sky-400">MONTHWISE</span>
        </div>
        <div className="h-[2px] bg-sky-500 w-full" />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="bg-white dark:bg-slate-900 rounded-b-xl border border-t-0 border-slate-200 dark:border-slate-700 shadow-sm flex flex-col items-center justify-center py-16">
          <Loader2 size={28} className="animate-spin text-sky-500 mb-3" />
          <span className="text-sm text-slate-500 font-medium">Loading...</span>
        </div>
      ) : !data.length ? (
        <div className="bg-white dark:bg-slate-900 rounded-b-xl border border-t-0 border-slate-200 dark:border-slate-700 shadow-sm text-center py-16">
          <BarChart2 size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
          <p className="text-slate-500 text-sm">No results found.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-b-xl border border-t-0 border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="overflow-auto max-h-[500px] custom-scrollbar">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead className="sticky top-0 z-10 bg-slate-50 dark:bg-slate-800 shadow-sm">
                <tr>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase">Month</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase text-right">Inwards Quantity</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase text-right">Inwards Value</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase text-right">Outwards Quantity</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase text-right">Outwards Value</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase text-right">Closing Quantity</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase text-right">Closing Value</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase text-center w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {data.map((group, gIdx) => {
                  const filteredRows = group.value.filter((m: any) => m.month !== 'No Date');
                  if (!filteredRows.length) return null;

                  return (
                    <React.Fragment key={gIdx}>
                      {/* Group Header */}
                      <tr className="bg-slate-100/50 dark:bg-slate-800/30">
                        <td colSpan={8} className="px-4 py-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                          {group.key} {filteredRows[0]?.unit ? <span className="text-slate-400 ml-1">({filteredRows[0].unit})</span> : null}
                        </td>
                      </tr>
                      {/* Rows */}
                      {filteredRows.map((row: any, rIdx: number) => (
                        <tr key={`${gIdx}-${rIdx}`} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400">{row.month}</td>
                          <td className="px-4 py-2 text-xs font-mono text-right text-slate-700 dark:text-slate-300">{row.inwardsQuantity}</td>
                          <td className="px-4 py-2 text-xs font-mono text-right text-slate-700 dark:text-slate-300">{H.formatNumber(row.inwardsValue, precision)}</td>
                          <td className="px-4 py-2 text-xs font-mono text-right text-slate-700 dark:text-slate-300">{row.outwardsQuantity}</td>
                          <td className="px-4 py-2 text-xs font-mono text-right text-slate-700 dark:text-slate-300">{H.formatNumber(row.outwardsValue, precision)}</td>
                          <td className="px-4 py-2 text-xs font-mono text-right text-slate-700 dark:text-slate-300">{row.closingQuantity}</td>
                          <td className="px-4 py-2 text-xs font-mono text-right text-slate-700 dark:text-slate-300">{H.formatNumber(row.closingValue, precision)}</td>
                          <td className="px-4 py-2 text-center">
                            <button 
                              onClick={() => setDetailView(row)}
                              className="text-emerald-500 hover:text-emerald-600 transition-colors p-1"
                              title="View Details"
                            >
                              <Eye size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sticky Summary Footer */}
      {data.length > 0 && (
        <div className="sticky bottom-0 z-10 bg-brand-yellow dark:bg-brand-yellow/10 rounded-xl border border-brand-yellow/20 dark:border-brand-yellow/5 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] p-4 select-none mt-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <span className="text-xs font-bold text-slate-800 dark:text-brand-yellow/90 uppercase">
              Total Rows :{" "}
              <span className="text-slate-950 dark:text-brand-yellow font-extrabold">
                {totalRowsCount}
              </span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
