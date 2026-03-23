import React, { useState } from 'react';
import { 
  Check, 
  ChevronRight, 
  FileText, 
  Truck, 
  ShieldCheck, 
  Info, 
  ChevronDown, 
  Plus, 
  Save,
  RefreshCcw,
  UserCheck,
  ArrowLeft,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { motion } from 'motion/react';
import { invoiceService } from '../services/api';

interface LineItem {
  id: string;
  name: string;
  sku: string;
  hsn: string;
  ordQty: number;
  remQty: number;
  qtyToInvoice: number;
  unitPrice: number;
}

const initialItems: LineItem[] = [
  { id: '1', name: 'Industrial Motor Hub', sku: 'IM-990', hsn: '8413', ordQty: 10, remQty: 5, qtyToInvoice: 5, unitPrice: 12000 },
  { id: '2', name: 'Steel Fasteners Set', sku: 'SF-221', hsn: '7318', ordQty: 500, remQty: 200, qtyToInvoice: 100, unitPrice: 45 },
  { id: '3', name: 'Control Panel Alpha', sku: 'CP-A1', hsn: '8537', ordQty: 2, remQty: 1, qtyToInvoice: 1, unitPrice: 45000 },
];

export const ScheduleToInvoice: React.FC = () => {
  const [items, setItems] = useState<LineItem[]>(initialItems);
  const [autoEwayBill, setAutoEwayBill] = useState(true);
  const [confirmed, setConfirmed] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const handleQtyChange = (id: string, value: string) => {
    const qty = parseInt(value) || 0;
    setItems(items.map(item => item.id === id ? { ...item, qtyToInvoice: qty } : item));
  };

  const taxableAmount = items.reduce((sum, item) => sum + (item.qtyToInvoice * item.unitPrice), 0);
  const igst = taxableAmount * 0.18;
  const freight = 0;
  const discount = taxableAmount * 0.05;
  const grandTotal = taxableAmount + igst + freight - discount;

  const handleConvertAndSave = async () => {
    if (!confirmed) {
      setSaveStatus({ type: 'error', message: 'Please confirm the items and quantities before saving.' });
      return;
    }

    setIsSaving(true);
    setSaveStatus(null);

    try {
      const invoiceData = {
        id: 0,
        inv_Type: 0,
        spCode: 0,
        ledger_ID: 0,
        gstType: 0,
        invoiceNo: 0,
        bill_No: "string",
        date: new Date().toISOString(),
        useInCompany: true,
        refNo: "SCH-2023-0891",
        refDate: "2023-10-24T00:00:00.000Z",
        orderNo: "string",
        orderDate: new Date().toISOString(),
        projectSiteId: 0,
        projectSiteAddress: "string",
        invoiceItemDetail: items.map((item, index) => ({
          id: 0,
          invDetID: 0,
          sno: index + 1,
          item_ID: parseInt(item.id) || 0,
          sp_Code: 0,
          mfrItemName: item.name,
          invType: 0,
          std_Qty: item.qtyToInvoice,
          conv_Qty: item.qtyToInvoice,
          conv_Unit: 0,
          std_Rate: item.unitPrice,
          conv_Rate: item.unitPrice,
          vatPer: 18,
          discount1: 5,
          discount2: 0,
          amount: item.qtyToInvoice * item.unitPrice,
          cost_Rate: 0,
          itemDescription: item.name,
          inventoryMoved: 0,
          invoiceItemSubDetail: [],
          invoiceItemPendingPO: [],
          invoiceSupplyInfo: [],
          invoiceItemBatches: [],
          rateDiscount: 0,
          discount3: 0,
          landing: 0,
          mrp: 0,
          profit: 0,
          cgstPer: 9,
          cgstAmt: (item.qtyToInvoice * item.unitPrice) * 0.09,
          sgstPer: 9,
          sgstAmt: (item.qtyToInvoice * item.unitPrice) * 0.09,
          igstPer: 0,
          igstAmt: 0,
          hsn: item.hsn,
          scheduleDate: "2023-10-24T00:00:00.000Z",
          rateAfterVat: item.unitPrice * 1.18,
          priceCategoryID: 0,
          units: "PCS",
          unittext: "PCS",
          itempcs: "string",
          priceCategoryText: "string",
          sp_text: "string",
          particular: "string",
          conversion: 0,
          itemRow: "string",
          ledger: "string",
          currentStck: 0,
          itemImagePath: "string",
          batchDetails: "string",
          unitConsumed: "string"
        })),
        invoiceExtraCharges: [],
        invoiceTncMap: [],
        item_SubTotal: taxableAmount,
        extra_SubTotal: 0,
        grandTotal: grandTotal,
        roundOff: 0,
        shipToName: "Global Logistics Solutions Ltd.",
        shipToAddress: "string",
        partyName: "Global Logistics Solutions Ltd.",
        partyAddress: "string",
        attenTo: "string",
        subject: "string",
        recBy: "string",
        recAmt: 0,
        dueDays: 30,
        footerXML: [],
        isMaxVAT: true,
        isRoundOff: true,
        precision: 2,
        profit: 0,
        profitPer: 0,
        billStatus: 0,
        refPerson: "string",
        refPersonNo: "string",
        baseCurrency: 0,
        convertedCurrency: 0,
        convertedRate: 0,
        convertedGrandTotal: 0,
        subsidiaryOption: 0,
        schemePointValue: 0,
        quotationByUserID: 0,
        orderByUserID: 0,
        salesByUserID: 0,
        preparedByUserID: 0,
        approvedByUserID: 0,
        loginByUserID: 0,
        referenceByUserID: 0,
        regVehicleNumber: "MH-04-ER-9921",
        regChassisNumber: "string",
        jobCardNumber: "string",
        state: "string",
        custName: "string",
        custMobile: "string",
        custEmail: "string",
        custRemarks: "string",
        note: "string",
        ewayNote: "string",
        supplierPONo: "string",
        supplierPODate: new Date().toISOString(),
        inwardDate: new Date().toISOString(),
        expenseLedgerId: 0
      };

      const result = await invoiceService.create(invoiceData) as any;
      setSaveStatus({ type: 'success', message: `Invoice created successfully! Doc No: ${result.docNo || 'N/A'}` });
    } catch (err: any) {
      console.error('Error creating invoice:', err);
      setSaveStatus({ type: 'error', message: err.response?.data?.message || 'Failed to create invoice. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 font-sans text-slate-700">
      {/* Stepper Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-8 py-8">
        <div className="max-w-4xl mx-auto flex items-center justify-between relative">
          {/* Step 1 */}
          <div className="flex flex-col items-center gap-3 z-10">
            <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Check size={20} strokeWidth={3} />
            </div>
            <span className="text-[11px] font-bold text-emerald-600">1. Select Schedule</span>
          </div>

          {/* Line 1-2 */}
          <div className="absolute left-[15%] right-[55%] top-5 h-[2px] bg-slate-100 dark:bg-slate-800 -z-0" />

          {/* Step 2 */}
          <div className="flex flex-col items-center gap-3 z-10">
            <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <span className="font-bold">2</span>
            </div>
            <span className="text-[11px] font-bold text-slate-900 dark:text-white">2. Review Items</span>
          </div>

          {/* Line 2-3 */}
          <div className="absolute left-[55%] right-[15%] top-5 h-[2px] bg-slate-100 dark:bg-slate-800 -z-0" />

          {/* Step 3 */}
          <div className="flex flex-col items-center gap-3 z-10">
            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
              <span className="font-bold">3</span>
            </div>
            <span className="text-[11px] font-bold text-slate-400">3. Generate Invoice</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-8 max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Form & Items */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Schedule Header Card */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-xl flex items-center justify-center">
                <FileText size={28} />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">SCH-2023-0891</h2>
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-[10px] font-bold uppercase tracking-widest rounded">PENDING SO</span>
                </div>
                <p className="text-sm text-slate-500 font-medium">Global Logistics Solutions Ltd. • 24 Oct 2023</p>
              </div>
            </div>
            <div className="flex items-center gap-8">
              <div className="text-right">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Warehouse</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Bhiwandi Main-01</p>
              </div>
              <button className="px-6 py-2.5 bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 rounded-lg text-xs font-bold hover:bg-emerald-100 transition-all">
                Change Selection
              </button>
            </div>
          </div>

          {/* Line Items Section */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Line Items to Invoice</h3>
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-400">Show:</span>
                <div className="relative">
                  <select className="pl-4 pr-10 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold outline-none appearance-none cursor-pointer">
                    <option>All Remaining</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
                    <th className="px-6 py-4">PRODUCT DETAILS</th>
                    <th className="px-6 py-4 text-center">ORD. QTY</th>
                    <th className="px-6 py-4 text-center">REM. QTY</th>
                    <th className="px-6 py-4 text-center">QTY TO INVOICE</th>
                    <th className="px-6 py-4 text-right">UNIT PRICE</th>
                    <th className="px-6 py-4 text-right">TOTAL</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-6">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-900 dark:text-white">{item.name}</span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                            SKU: {item.sku} | HSN: {item.hsn}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-6 text-center text-sm font-bold text-slate-600 dark:text-slate-400">{item.ordQty}</td>
                      <td className="px-6 py-6 text-center text-sm font-bold text-emerald-600">{item.remQty}</td>
                      <td className="px-6 py-6">
                        <div className="flex justify-center">
                          <input 
                            type="number" 
                            value={item.qtyToInvoice}
                            onChange={(e) => handleQtyChange(item.id, e.target.value)}
                            className="w-24 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-center text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                          />
                        </div>
                      </td>
                      <td className="px-6 py-6 text-right text-sm font-bold text-slate-600 dark:text-slate-400">₹{item.unitPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td className="px-6 py-6 text-right text-sm font-bold text-slate-900 dark:text-white">₹{(item.qtyToInvoice * item.unitPrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-6 bg-slate-50/50 dark:bg-slate-800/30 flex justify-center">
              <button className="flex items-center gap-2 text-[11px] font-bold text-emerald-600 uppercase tracking-widest hover:opacity-80 transition-opacity">
                <Plus size={14} />
                ADD EXTRA CHARGES (FREIGHT/PACKING)
              </button>
            </div>
          </div>

          {/* Bottom Settings Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Logistics Settings */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <div className="flex items-center gap-3">
                <Truck className="text-emerald-500" size={20} />
                <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest">Logistics Settings</h4>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Auto-generate E-way Bill</span>
                <button 
                  onClick={() => setAutoEwayBill(!autoEwayBill)}
                  className={`w-11 h-6 rounded-full transition-all relative ${autoEwayBill ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${autoEwayBill ? 'left-6' : 'left-1'}`} />
                </button>
              </div>
              <div className="bg-emerald-50/50 dark:bg-emerald-900/10 p-4 rounded-lg border border-emerald-100 dark:border-emerald-900/30">
                <label className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-2 block">VEHICLE NUMBER</label>
                <input 
                  type="text" 
                  defaultValue="MH-04-ER-9921"
                  className="w-full bg-transparent text-sm font-bold text-emerald-900 dark:text-emerald-400 outline-none uppercase tracking-widest"
                />
              </div>
            </div>

            {/* Compliance & Terms */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <div className="flex items-center gap-3">
                <ShieldCheck className="text-emerald-500" size={20} />
                <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest">Compliance & Terms</h4>
              </div>
              <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800">
                <Info size={16} className="text-slate-400 mt-0.5" />
                <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                  GST will be calculated based on the delivery state (IGST 18% applied).
                </p>
              </div>
              <div className="relative">
                <select className="w-full pl-4 pr-10 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold outline-none appearance-none cursor-pointer">
                  <option>Standard Payment Terms (Net 30)</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Summary & Actions */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden sticky top-8">
            <div className="p-8 bg-slate-900 text-white space-y-4">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">FINAL GRAND TOTAL</span>
                <span className="text-4xl font-bold tracking-tight">₹{grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-400 text-[10px] font-bold uppercase tracking-widest">
                <Check size={14} strokeWidth={3} />
                REAL-TIME TAX CALCULATION ACTIVE
              </div>
            </div>

            <div className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm font-medium text-slate-500">
                  <span>Taxable Amount</span>
                  <span className="text-slate-900 dark:text-white">₹{taxableAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex items-center justify-between text-sm font-medium text-slate-500">
                  <span>IGST (18%)</span>
                  <span className="text-slate-900 dark:text-white">₹{igst.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex items-center justify-between text-sm font-medium text-emerald-600">
                  <span>Freight Charges</span>
                  <span>+ ₹{freight.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex items-center justify-between text-sm font-medium text-rose-600">
                  <span>Discount (5%)</span>
                  <span>- ₹{discount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-6">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div 
                    onClick={() => setConfirmed(!confirmed)}
                    className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-all ${confirmed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 dark:border-slate-700 group-hover:border-emerald-500'}`}
                  >
                    {confirmed && <Check size={12} strokeWidth={4} />}
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium leading-tight">
                    I confirm the items and quantities are correct for invoicing.
                  </span>
                </label>

                <div className="space-y-3">
                  {saveStatus && (
                    <div className={`p-4 rounded-xl flex items-center gap-3 text-sm font-medium ${
                      saveStatus.type === 'success' 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                        : 'bg-rose-50 text-rose-700 border border-rose-100'
                    }`}>
                      {saveStatus.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
                      {saveStatus.message}
                    </div>
                  )}
                  <button 
                    onClick={handleConvertAndSave}
                    disabled={isSaving}
                    className="w-full py-4 bg-emerald-500 text-white rounded-xl text-sm font-bold uppercase tracking-widest shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      <Check size={20} strokeWidth={3} />
                    )}
                    {isSaving ? 'PROCESSING...' : 'CONVERT & SAVE INVOICE'}
                  </button>
                  <button className="w-full py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl text-sm font-bold uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                    <Save size={18} />
                    Save as Draft
                  </button>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-xl flex items-center justify-center">
                    <UserCheck size={24} />
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">Platinum Customer</h5>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Credit Limit: ₹25.0L available</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Status Message */}
          <div className="p-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/30 flex items-center gap-3">
            <RefreshCcw size={16} className="text-blue-500 animate-spin" />
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Recalculating IGST based on updated quantities...</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-8 py-4 flex items-center justify-between text-[11px] font-medium text-slate-400">
        <p>© 2023 baawan.com ERP v4.2.0 • System Status: Optimal</p>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Active Session: Admin_Bhiwandi_01</span>
          </div>
          <button className="hover:text-slate-600 transition-colors">Documentation</button>
          <button className="hover:text-slate-600 transition-colors">Support Desk</button>
        </div>
      </div>
    </div>
  );
};
