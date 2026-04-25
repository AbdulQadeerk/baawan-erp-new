import { storage } from '../lib/storage';
import { STORAGE_KEYS } from '../lib/constants';
import { groupApi } from './group.service';
import { apiClient } from '../lib/api-client';

export const masterSyncService = {
  /**
   * Checks if company ID has changed and clears sync data if different
   */
  checkAndClearIfCompanyChanged: (newCompanyId: number | string) => {
    const company = storage.getItem<any>(STORAGE_KEYS.COMPANY_INFO);
    const storedCompanyId = company?.id || company?.compId;
    if (!storedCompanyId) return false;
    
    const storedIdStr = storedCompanyId.toString();
    const newIdStr = newCompanyId?.toString();
    
    if (newIdStr && storedIdStr !== newIdStr) {
      console.log(`Company ID changed from ${storedIdStr} to ${newIdStr}. Clearing sync data...`);
      storage.removeItem(STORAGE_KEYS.GROUP_LIST);
      storage.removeItem(STORAGE_KEYS.LEDGER_LIST);
      storage.removeItem(STORAGE_KEYS.ITEM_LIST);
      storage.removeItem(STORAGE_KEYS.CURRENCY_LIST);
      return true;
    }
    return false;
  },

  /**
   * Clears all stored master data and forces a full sync.
   */
  clearData: () => {
    storage.removeItem(STORAGE_KEYS.GROUP_LIST);
    storage.removeItem(STORAGE_KEYS.LEDGER_LIST);
    storage.removeItem(STORAGE_KEYS.ITEM_LIST);
    storage.removeItem(STORAGE_KEYS.CURRENCY_LIST);
    masterSyncService.syncAll();
  },

  /**
   * Forces a full sync by clearing all sync data and re-syncing
   */
  forceFullSync: () => {
    console.log('Forcing full sync - clearing all sync data...');
    masterSyncService.clearData();
  },

  /**
   * Syncs all master data types
   */
  syncAll: () => {
    masterSyncService.syncGroups();
    masterSyncService.syncLedgers();
    masterSyncService.syncCurrency();
    masterSyncService.syncItems();
  },

  /**
   * Syncs Group data from the server based on the last modified date.
   */
  syncGroups: async () => {
    try {
      const grpList = storage.getItem<any[]>(STORAGE_KEYS.GROUP_LIST) || [];
      let lastModifiedDate = null;

      if (Array.isArray(grpList) && grpList.length) {
        lastModifiedDate = new Date(
          Math.max(...grpList.map(e => (e && e.modifiedDate ? new Date(e.modifiedDate).getTime() : 0)))
        );
      }

      const fdata = {
        isSync: true,
        lastModifiedDate: lastModifiedDate ? lastModifiedDate.toISOString() : null
      };

      const data = await groupApi.sync(fdata);
      
      let lst: any[] = [];
      if (data && Array.isArray(data.list)) {
        lst = data.list;
      } else if (Array.isArray(data)) {
        lst = data;
      }

      if (!fdata.lastModifiedDate) {
        if (lst.length) storage.setItem(STORAGE_KEYS.GROUP_LIST, lst);
      } else {
        const existingList = storage.getItem<any[]>(STORAGE_KEYS.GROUP_LIST);
        if (!Array.isArray(existingList) || !existingList.length) {
          if (lst.length) storage.setItem(STORAGE_KEYS.GROUP_LIST, lst);
        } else {
          for (let i = 0; i < lst.length; i++) {
            const ele = lst[i];
            if (ele && ele.id) {
              const idx = existingList.findIndex(x => x && x.id && x.id === ele.id);
              if (idx !== -1) {
                existingList[idx] = ele;
              } else {
                existingList.push(ele);
              }
            }
          }
          if (existingList.length) storage.setItem(STORAGE_KEYS.GROUP_LIST, existingList);
        }
      }
    } catch (error) {
      console.error('Group sync failed', error);
    }
  },

  /**
   * Syncs Ledger data from the server based on the last modified date.
   */
  syncLedgers: async () => {
    try {
      const ldrList = storage.getItem<any[]>(STORAGE_KEYS.LEDGER_LIST) || [];
      let lastModifiedDate = null;

      if (Array.isArray(ldrList) && ldrList.length > 0) {
        lastModifiedDate = new Date(
          Math.max(...ldrList.map(e => (e && e.modified_Date ? new Date(e.modified_Date).getTime() : 0)))
        );
      }

      const fdata = {
        isSync: true,
        lastModifiedDate: lastModifiedDate ? lastModifiedDate.toISOString() : null
      };

      console.log('Ledger sync payload:', fdata);
      const data = await apiClient.post<any>('/api/Ledger/Sync', fdata);
      console.log('Ledger sync response:', data);
      
      let lst: any[] = [];
      if (data && Array.isArray(data.list)) {
        lst = data.list;
      } else if (Array.isArray(data)) {
        lst = data;
      }

      if (!fdata.lastModifiedDate) {
        if (lst.length) storage.setItem(STORAGE_KEYS.LEDGER_LIST, lst);
      } else {
        const existingList = storage.getItem<any[]>(STORAGE_KEYS.LEDGER_LIST);
        if (!Array.isArray(existingList) || !existingList.length) {
          if (lst.length) storage.setItem(STORAGE_KEYS.LEDGER_LIST, lst);
        } else {
          for (let i = 0; i < lst.length; i++) {
            const ele = lst[i];
            const idx = existingList.findIndex(x => x.id === ele.id);
            if (idx !== -1) {
              existingList[idx] = ele;
            } else {
              existingList.push(ele);
            }
          }
          if (existingList.length) storage.setItem(STORAGE_KEYS.LEDGER_LIST, existingList);
        }
      }
    } catch (error) {
      console.error('Ledger sync failed', error);
    }
  },

  /**
   * Syncs Item data from the server based on the last modified date.
   */
  syncItems: async () => {
    try {
      const itemList = storage.getItem<any[]>(STORAGE_KEYS.ITEM_LIST) || [];
      let lastModifiedDate = null;

      if (Array.isArray(itemList) && itemList.length > 0) {
        lastModifiedDate = new Date(
          Math.max(...itemList.map(e => (e && e.md ? new Date(e.md).getTime() : 0)))
        );
      }

      const fdata = {
        isSync: true,
        lastModifiedDate: lastModifiedDate ? lastModifiedDate.toISOString() : null
      };

      console.log('Item sync payload:', fdata);
      const data = await apiClient.post<any>('/api/item/Sync', fdata);
      console.log('Item sync response:', data);
      
      let lst: any[] = [];
      if (data && Array.isArray(data.list)) {
        lst = data.list;
      } else if (Array.isArray(data)) {
        lst = data;
      }

      if (!fdata.lastModifiedDate) {
        if (lst.length) storage.setItem(STORAGE_KEYS.ITEM_LIST, lst);
      } else {
        const existingList = storage.getItem<any[]>(STORAGE_KEYS.ITEM_LIST);
        if (!Array.isArray(existingList) || !existingList.length) {
          if (lst.length) storage.setItem(STORAGE_KEYS.ITEM_LIST, lst);
        } else {
          for (let i = 0; i < lst.length; i++) {
            const ele = lst[i];
            const idx = existingList.findIndex(x => x.iid === ele.iid);
            if (idx !== -1) {
              existingList[idx] = ele;
            } else {
              existingList.push(ele);
            }
          }
          if (existingList.length) storage.setItem(STORAGE_KEYS.ITEM_LIST, existingList);
        }
      }
    } catch (error) {
      console.error('Item sync failed', error);
    }
  },

  /**
   * Syncs Currency data from the server based on the last modified date.
   */
  syncCurrency: async () => {
    try {
      const recordList = storage.getItem<any[]>(STORAGE_KEYS.CURRENCY_LIST) || [];
      let lastModifiedDate = null;

      if (Array.isArray(recordList) && recordList.length) {
        lastModifiedDate = new Date(
          Math.max(...recordList.map(e => (e && e.modifiedDate ? new Date(e.modifiedDate).getTime() : 0)))
        );
      }

      const fdata = {
        isSync: true,
        lastModifiedDate: lastModifiedDate ? lastModifiedDate.toISOString() : null
      };

      const data = await apiClient.post<any>('/api/Currency/Sync', fdata);
      
      let lst: any[] = [];
      if (data && Array.isArray(data.list)) {
        lst = data.list;
      } else if (Array.isArray(data)) {
        lst = data;
      }

      if (!fdata.lastModifiedDate) {
        if (lst.length) storage.setItem(STORAGE_KEYS.CURRENCY_LIST, lst);
      } else {
        const existingList = storage.getItem<any[]>(STORAGE_KEYS.CURRENCY_LIST);
        if (!Array.isArray(existingList) || !existingList.length) {
          if (lst.length) storage.setItem(STORAGE_KEYS.CURRENCY_LIST, lst);
        } else {
          for (let i = 0; i < lst.length; i++) {
            const ele = lst[i];
            if (ele && ele.id) {
              const idx = existingList.findIndex(x => x && x.id && x.id === ele.id);
              if (idx !== -1) {
                existingList[idx] = ele;
              } else {
                existingList.push(ele);
              }
            }
          }
          if (existingList.length) storage.setItem(STORAGE_KEYS.CURRENCY_LIST, existingList);
        }
      }
    } catch (error) {
      console.error('Currency sync failed', error);
    }
  }
};
