import React from "react";
import { FolderOpen, FileText, RefreshCw } from "lucide-react";
import {
  formatNumber,
  getProcessedOpeningBalance,
  getOpeningDrCr,
  getProcessedDebit,
  getProcessedCredit,
  getProcessedClosingBalance,
  getClosingDrCr,
  getPrecision,
  getTotalProcessedOpeningBalance,
  getOpeningDrCrForGroup,
  getTotalProcessedDebit,
  getTotalProcessedCredit,
  getNetAmount,
  getClosingDrCrForGroup,
} from "../trialBalanceHelpers";

interface Props {
  groupItem: any;
  showOpeningBalance: boolean;
  showDebit: boolean;
  showCredit: boolean;
  onItemSelected: (item: any) => void;
  onRefresh: () => void;
}

export const TrialBalanceGroupDetail: React.FC<Props> = ({
  groupItem,
  showOpeningBalance,
  showDebit,
  showCredit,
  onItemSelected,
  onRefresh,
}) => {
  const precision = getPrecision();

  const getFooterOpening = () =>
    groupItem.processedOpeningBalance !== undefined
      ? groupItem.processedOpeningBalance
      : groupItem.OPENINGBAL !== undefined
        ? Math.abs(groupItem.OPENINGBAL)
        : getTotalProcessedOpeningBalance(groupItem.childNodeData || []);
  const getFooterOpeningDrCr = () =>
    groupItem.openingDrCr !== undefined
      ? groupItem.openingDrCr
      : getOpeningDrCrForGroup(groupItem.childNodeData || []);
  const getFooterDebit = () =>
    groupItem.processedDebit !== undefined
      ? groupItem.processedDebit
      : groupItem.DEBIT !== undefined
        ? Math.abs(groupItem.DEBIT)
        : getTotalProcessedDebit(groupItem.childNodeData || []);
  const getFooterCredit = () =>
    groupItem.processedCredit !== undefined
      ? groupItem.processedCredit
      : groupItem.CREDIT !== undefined
        ? Math.abs(groupItem.CREDIT)
        : getTotalProcessedCredit(groupItem.childNodeData || []);
  const getFooterClosing = () =>
    groupItem.processedClosingBalance !== undefined
      ? groupItem.processedClosingBalance
      : groupItem.originalClosingBalance !== undefined
        ? Math.abs(groupItem.originalClosingBalance)
        : getNetAmount(groupItem.childNodeData || []);
  const getFooterClosingDrCr = () =>
    groupItem.closingDrCr !== undefined
      ? groupItem.closingDrCr
      : getClosingDrCrForGroup(groupItem.childNodeData || []);

  return (
    <div className="mt-2">
      {groupItem?.ISGROUP && groupItem?.parentName && (
        <div className="mb-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-semibold">
            <FolderOpen size={13} /> Parent Group: <b>{groupItem.parentName}</b>
          </span>
        </div>
      )}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-auto max-h-[calc(100vh-320px)]">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-10">
              <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                <th className="px-4 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Name
                </th>
                {showOpeningBalance && (
                  <th className="px-3 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">
                    Opening Balance
                  </th>
                )}
                {showDebit && (
                  <th className="px-3 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">
                    Debit
                  </th>
                )}
                {showCredit && (
                  <th className="px-3 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">
                    Credit
                  </th>
                )}
                <th className="px-3 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">
                  Closing Balance
                  <button
                    onClick={onRefresh}
                    className="ml-2 p-1 bg-blue-500 hover:bg-blue-600 text-white rounded transition-all inline-flex"
                    title="Refresh Group Data"
                  >
                    <RefreshCw size={10} />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {!groupItem?.childNodeData?.length ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-sm text-slate-400"
                  >
                    No records found
                  </td>
                </tr>
              ) : (
                groupItem.childNodeData.map((child: any, idx: number) => (
                  <tr
                    key={idx}
                    className="hover:bg-blue-50/50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
                    onClick={() => onItemSelected(child)}
                  >
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        {child.ISGROUP ? (
                          <FolderOpen size={14} className="text-emerald-500" />
                        ) : (
                          <FileText size={14} className="text-slate-400" />
                        )}
                        <span className="text-sm font-semibold text-blue-600 dark:text-blue-400 group-hover:underline">
                          {child.NAME}
                        </span>
                      </div>
                    </td>
                    {showOpeningBalance && (
                      <td className="px-3 py-2.5 text-center text-xs font-mono text-slate-600 dark:text-slate-400">
                        {formatNumber(
                          getProcessedOpeningBalance(child),
                          precision,
                        )}
                        {getOpeningDrCr(child) && (
                          <span className="ml-1 text-slate-400">
                            {getOpeningDrCr(child)}
                          </span>
                        )}
                      </td>
                    )}
                    {showDebit && (
                      <td className="px-3 py-2.5 text-center text-xs font-mono text-slate-600 dark:text-slate-400">
                        {formatNumber(getProcessedDebit(child), precision)}
                      </td>
                    )}
                    {showCredit && (
                      <td className="px-3 py-2.5 text-center text-xs font-mono text-slate-600 dark:text-slate-400">
                        {formatNumber(getProcessedCredit(child), precision)}
                      </td>
                    )}
                    <td className="px-3 py-2.5 text-right text-sm font-mono font-bold text-slate-800 dark:text-slate-200">
                      {formatNumber(
                        getProcessedClosingBalance(child),
                        precision,
                      )}
                      {getClosingDrCr(child) && (
                        <span className="ml-1 text-xs font-normal text-slate-400">
                          {getClosingDrCr(child)}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {groupItem && (
              <tfoot>
                <tr className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800 font-bold border-t-2 border-blue-200 dark:border-slate-600">
                  <td className="px-4 py-2.5 text-sm text-slate-800 dark:text-slate-200">
                    {groupItem.NAME}
                  </td>
                  {showOpeningBalance && (
                    <td className="px-3 py-2.5 text-center text-xs font-mono text-slate-800 dark:text-slate-200">
                      {formatNumber(getFooterOpening(), precision)}
                      {getFooterOpeningDrCr() && (
                        <span className="ml-1">{getFooterOpeningDrCr()}</span>
                      )}
                    </td>
                  )}
                  {showDebit && (
                    <td className="px-3 py-2.5 text-center text-xs font-mono text-slate-800 dark:text-slate-200">
                      {formatNumber(getFooterDebit(), precision)}
                    </td>
                  )}
                  {showCredit && (
                    <td className="px-3 py-2.5 text-center text-xs font-mono text-slate-800 dark:text-slate-200">
                      {formatNumber(getFooterCredit(), precision)}
                    </td>
                  )}
                  <td className="px-3 py-2.5 text-right text-sm font-mono text-slate-800 dark:text-slate-200">
                    {formatNumber(getFooterClosing(), precision)}
                    {getFooterClosingDrCr() && (
                      <span className="ml-1 text-xs">
                        {getFooterClosingDrCr()}
                      </span>
                    )}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
};
