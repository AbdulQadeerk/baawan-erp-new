import React, { useState } from 'react';
import { StockPlaceList } from '../../stock-place/StockPlaceList';
import { StockPlaceCreate } from '../../stock-place/StockPlaceCreate';
import { StockPlaceRecord } from '../../../../services/stock-place.service';

export const StockPlaceTab: React.FC = () => {
  const [view, setView] = useState<'list' | 'create'>('list');
  const [editId, setEditId] = useState<number | null>(null);
  const [pendingSave, setPendingSave] = useState<{ record: StockPlaceRecord; isUpdate: boolean } | null>(null);

  const handleCreateNew = () => {
    setEditId(null);
    setView('create');
  };

  const handleEdit = (id: number) => {
    setEditId(id);
    setView('create');
  };

  const handleBack = () => {
    setView('list');
    setEditId(null);
  };

  const handleSaved = (record: StockPlaceRecord, isUpdate: boolean) => {
    setPendingSave({ record, isUpdate });
    handleBack();
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {view === 'list' ? (
          <StockPlaceList 
            onCreateNew={handleCreateNew}
            onEdit={handleEdit}
            pendingSave={pendingSave}
            onPendingSaveConsumed={() => setPendingSave(null)}
          />
        ) : (
          <StockPlaceCreate 
            onBack={handleBack}
            editId={editId}
            onSaved={handleSaved}
          />
        )}
      </div>
    </div>
  );
};
