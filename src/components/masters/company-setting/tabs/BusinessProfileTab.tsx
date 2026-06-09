import React, { useState, useEffect, useMemo } from "react";
import {
  Building2,
  MapPin,
  FileText,
  Receipt,
  Banknote,
  Sliders,
  Save,
  Loader2,
  Link as LinkIcon,
  Mail,
  Phone,
  CheckCircle2,
  GripVertical,
  Eye,
} from "lucide-react";
import { toast } from "../../../../lib/toast";
import { settingsApi } from "../../../../services/settings.service";
import { storage } from "../../../../lib/storage";
import { STORAGE_KEYS } from "../../../../lib/constants";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { CountrySelect } from "./CountrySelect";

const ParticularFormatOptions = [
  { text: "Item Name", value: "item name", lsKey: "nm", apiKey: "name" },
  { text: "Item Code", value: "item code", lsKey: "ict", apiKey: "item_CodeTxt" },
  { text: "Brand", value: "brand", lsKey: "brd", apiKey: "brand" },
  { text: "Category", value: "category", lsKey: "cat", apiKey: "category" },
  { text: "Sub Category", value: "sub category", lsKey: "siz", apiKey: "sizes" },
  { text: "Type", value: "type", lsKey: "typ", apiKey: "type" },
  { text: "Brand Code", value: "brandcode", lsKey: "ig", apiKey: "itemGroup" },
  { text: "HSN Code", value: "hsn code", lsKey: "hsn", apiKey: "hsnNo" },
];

interface ParticularItem {
  option: typeof ParticularFormatOptions[number];
  enabled: boolean;
}

export const BusinessProfileTab: React.FC = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [allParticulars, setAllParticulars] = useState<ParticularItem[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Single comprehensive state for the Company settings
  const [formData, setFormData] = useState({
    id: 0,
    compName: "",
    shortCode: "",
    phone_1: "",
    phone_2: "",
    fax: "",
    mobile: "",
    email: "",
    website: "",
    contact_Person: "",
    country: "India",
    state: "",
    city: "",
    area: "",
    address: "",
    pinCode: "",
    gstNo: "",
    panCardNo: "",
    baseCurrency: 0,
    currentFYStarts: "",
    currentFYEnds: "",
    taxType: "",
    billFormat: "",
    billNoSplitChar: "",
    billNoIncludeFY: false,
    billNoOnCompanyShortCode: false,
    particularFormat: "",
    bankName: "",
    branchName: "",
    acNo: "",
    ifscCode: "",
    isPdf: false,
    tallyTransferItemwise: false,
    eInvApiUser: "",
    eInvApiPass: "",
    onPartyPriceListRate: false,
    unitViewFull: false,
    isUseEinvoice: false,
    isUseProjectSite: false,
  });

  const initializeParticulars = (particularFormatStr: string | null | undefined) => {
    const selected = (particularFormatStr || "")
      .split(",")
      .map((p) => p.toLowerCase().trim())
      .filter(Boolean);

    const configured: ParticularItem[] = [];
    const unconfigured: ParticularItem[] = [];

    ParticularFormatOptions.forEach((opt) => {
      const isEnabled = selected.includes(opt.value);
      if (isEnabled) {
        configured.push({ option: opt, enabled: true });
      } else {
        unconfigured.push({ option: opt, enabled: false });
      }
    });

    configured.sort((a, b) => selected.indexOf(a.option.value) - selected.indexOf(b.option.value));
    setAllParticulars([...configured, ...unconfigured]);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
  };

  const handleDrop = (index: number) => {
    if (draggedIndex === null || draggedIndex === index) return;
    const newItems = [...allParticulars];
    const [draggedItem] = newItems.splice(draggedIndex, 1);
    newItems.splice(index, 0, draggedItem);
    setAllParticulars(newItems);
    setDraggedIndex(null);
    updateParticularsState(newItems);
  };

  const toggleParticular = (index: number) => {
    const newItems = allParticulars.map((item, idx) => {
      if (idx === index) {
        return { ...item, enabled: !item.enabled };
      }
      return item;
    });
    setAllParticulars(newItems);
    updateParticularsState(newItems);
  };

  const updateParticularsState = (items: ParticularItem[]) => {
    const selected = items.filter((p) => p.enabled).map((p) => p.option.value);
    const formatStr = selected.join(",");
    setFormData((prev) => ({ ...prev, particularFormat: formatStr }));
  };

  const getInvoiceNoPreview = () => {
    const shortCode = formData.shortCode || "SUP";
    const useShortCode = formData.billNoOnCompanyShortCode;
    const includeFY = formData.billNoIncludeFY;
    const format = formData.billFormat || "Format 1";
    const splitChar = formData.billNoSplitChar || "/";

    const code = useShortCode && shortCode ? shortCode.toUpperCase() : "";
    const prefix = code ? `${code}-` : "";

    let yy = "26";
    let fyear = "2026-27";

    const fyStarts = formData.currentFYStarts;
    if (fyStarts) {
      const startDate = new Date(fyStarts);
      if (!isNaN(startDate.getTime())) {
        const startYear = startDate.getFullYear();
        yy = (startYear % 100).toString().padStart(2, "0");
        const endYearStr = ((startYear + 1) % 100).toString().padStart(2, "0");
        fyear = `${yy}-${endYearStr}`;
      }
    }

    const invoiceNo = "0125";
    const invoiceNoShort = "125";

    if (format === "Format 1") {
      const fyPart = includeFY ? `${yy}${splitChar}` : "";
      return `${prefix}${fyPart}${invoiceNoShort}`;
    } else if (format === "Format 2") {
      const fyPart = includeFY ? `${splitChar}${fyear}` : "";
      return `${prefix}${fyPart ? fyPart.substring(1) : ""}${splitChar}${invoiceNo}`;
    } else if (format === "Format 3") {
      const fyPart = includeFY ? `${splitChar}${fyear}` : "";
      return `${prefix}${invoiceNo}${fyPart}`;
    } else if (format === "Format 4") {
      const fyPart = includeFY ? `${splitChar}${fyear}` : "";
      return `${prefix}${invoiceNo}${fyPart}`;
    }

    return "";
  };

  const getParticularPreviewItems = () => {
    try {
      const lsItems = JSON.parse(localStorage.getItem("item-list") || "[]");
      if (Array.isArray(lsItems) && lsItems.length > 0) {
        return lsItems.slice(0, 3);
      }
    } catch {}
    return [
      { name: "BOND TITE ADHESIVES", item_CodeTxt: "AD-001", type: "Adhesive", brand: "Ast", sizes: "900GMS", itemGroup: "AST", category: "Industrial", std_Unit: "GMS", batch: "B123", expiryDate: "2026-12-31", mrp: 250, hsnNo: "35061000", barcode: "8901234567890" },
      { name: "DR FIXIT WATERPROOFING", item_CodeTxt: "WF-110", type: "Chemical", brand: "Pidilite", sizes: "1L", itemGroup: "PID", category: "Construction", std_Unit: "LTR", batch: "B456", expiryDate: "2027-01-15", mrp: 500, hsnNo: "32141000", barcode: "8909876543210" },
      { name: "Cotton Shirt", item_CodeTxt: "CS-001", type: "Regular", brand: "Bay", sizes: "M", itemGroup: "BAY", category: "Apparel", std_Unit: "PCS", batch: "B789", expiryDate: "2025-06-30", mrp: 999, hsnNo: "62052000", barcode: "1234567890123" },
    ];
  };

  const formatParticularForPreview = (item: any, selectedParts: string[]) => {
    if (!selectedParts || selectedParts.length === 0) {
      return `${item.item_CodeTxt || item.ict || ""}  ${item.name || item.nm || ""}`.trim();
    }

    const out: string[] = [];
    selectedParts.forEach((part) => {
      const option = ParticularFormatOptions.find((o) => o.value === part);
      if (option) {
        const val = item[option.apiKey] || item[option.lsKey];
        if (val) {
          out.push(val);
        }
      }
    });

    if (out.length === 0) {
      return `${item.item_CodeTxt || item.ict || ""}  ${item.name || item.nm || ""}`.trim();
    }
    return out.join("  ");
  };

  const particularPreviewLines = useMemo(() => {
    const selectedParts = allParticulars.filter((p) => p.enabled).map((p) => p.option.value);
    const items = getParticularPreviewItems();
    return items.map((item, idx) => ({
      title: `Example ${idx + 1}`,
      value: formatParticularForPreview(item, selectedParts),
    }));
  }, [allParticulars]);

  useEffect(() => {
    loadCompanySettings();
  }, []);

  const loadCompanySettings = async () => {
    setIsLoading(true);
    try {
      const tokenInfo = storage.getItem<any>(STORAGE_KEYS.TOKEN_INFO);
      const companyId = tokenInfo?.company?.id || tokenInfo?.company?.compId || 1;

      const res = await settingsApi.get({ id: companyId });
      if (res) {
        setFormData((prev) => ({
          ...prev,
          ...res,
          currentFYStarts: res.currentFYStarts
            ? res.currentFYStarts.split("T")[0]
            : "",
          currentFYEnds: res.currentFYEnds
            ? res.currentFYEnds.split("T")[0]
            : "",
        }));
        initializeParticulars(res.particularFormat);
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to load company settings.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.compName) {
      toast.error("Company Name is required.");
      return;
    }

    setIsSaving(true);
    try {
      await settingsApi.companySetting(formData);
      toast.success("Company settings updated successfully.");
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to save settings.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value, type } = e.target;

    // Type narrowing for checkbox input elements
    if (type === "checkbox" && "checked" in e.target) {
      setFormData((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const tabs = [
    {
      id: "profile",
      label: "Profile",
      icon: <Building2 size={16} />,
      desc: "Company information and contact details",
      img: "Untitled.png",
      bg: "from-indigo-50/80 to-blue-50/80 dark:from-indigo-950/30 dark:to-blue-900/20 border-indigo-100 dark:border-indigo-800/30",
    },
    {
      id: "location",
      label: "Location",
      icon: <MapPin size={16} />,
      desc: "Physical and registered address details",
      img: "Untitled2.png",
      bg: "from-emerald-50/80 to-teal-50/80 dark:from-emerald-950/30 dark:to-teal-900/20 border-emerald-100 dark:border-emerald-800/30",
    },
    {
      id: "tax-fy",
      label: "Tax & FY",
      icon: <FileText size={16} />,
      desc: "Taxation details and financial year settings",
      img: "Untitled3.png",
      bg: "from-purple-50/80 to-fuchsia-50/80 dark:from-purple-950/30 dark:to-fuchsia-900/20 border-purple-100 dark:border-purple-800/30",
    },
    {
      id: "invoice",
      label: "Invoice",
      icon: <Receipt size={16} />,
      desc: "Invoice numbering and display preferences",
      img: "Untitled5.png",
      bg: "from-amber-50/80 to-orange-50/80 dark:from-amber-950/30 dark:to-orange-900/20 border-amber-100 dark:border-amber-800/30",
    },
    {
      id: "bank-details",
      label: "Bank Details",
      icon: <Banknote size={16} />,
      desc: "Company bank accounts and routing info",
      img: "Untitled6.png",
      bg: "from-cyan-50/80 to-sky-50/80 dark:from-cyan-950/30 dark:to-sky-900/20 border-cyan-100 dark:border-cyan-800/30",
    },
    {
      id: "preferences",
      label: "Preferences",
      icon: <Sliders size={16} />,
      desc: "System level switches and integrations",
      img: "Untitled4.png",
      bg: "from-rose-50/80 to-pink-50/80 dark:from-rose-950/30 dark:to-pink-900/20 border-rose-100 dark:border-rose-800/30",
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full opacity-50">
        <Loader2 size={32} className="animate-spin text-indigo-600 mb-4" />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col lg:h-[calc(100vh-10.5rem)] h-auto">
      {/* Header */}
      <div className="py-3.5 px-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            Update company information and billing preferences
          </h3>
        </div>
      </div>

      {/* Horizontal Navigation */}
      <div className="border-b-2 border-slate-100 dark:border-slate-800 px-5 bg-white dark:bg-slate-900">
        <div className="flex w-full overflow-x-auto custom-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-shrink-0 lg:flex-1 relative flex items-center justify-center gap-2 px-4 lg:px-2 py-3.5 text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? "text-indigo-600 dark:text-indigo-400"
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              {tab.icon}
              {tab.label}
              <div
                className={`absolute bottom-0 left-0 w-full h-[2px] bg-indigo-600 dark:bg-indigo-400 transition-transform duration-200 origin-center ${
                  activeTab === tab.id ? "scale-x-100" : "scale-x-0"
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <div className="p-4 flex-1 overflow-y-auto custom-scrollbar bg-slate-50/30 dark:bg-slate-800/20">
        <div className="w-full space-y-4">
          {/* Banner */}
          {(() => {
            const currentTab = tabs.find((t) => t.id === activeTab);
            return (
              <div
                className={`bg-gradient-to-r ${currentTab?.bg} border p-4 md:p-5 rounded-xl flex items-center justify-between gap-4 mb-5 shadow-sm relative overflow-hidden transition-all duration-300 min-h-[90px]`}
              >
                {/* Subtle background decoration */}
                <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-white/40 to-transparent dark:from-slate-900/40 pointer-events-none"></div>

                <div className="flex items-center gap-4 relative z-10">
                  <div className="p-3 bg-white/80 dark:bg-slate-900/80 shadow-sm rounded-lg border border-white/50 dark:border-slate-700/50 text-indigo-600 backdrop-blur-sm">
                    {currentTab?.icon}
                  </div>
                  <div>
                    <h2 className="text-base font-black text-slate-800 dark:text-white leading-tight">
                      {currentTab?.label}
                    </h2>
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                      {currentTab?.desc}
                    </p>
                  </div>
                </div>
                <div className="hidden md:block absolute right-0 bottom-0 z-10 pointer-events-none pr-2">
                  <img
                    src={`/assets/companysettings/${currentTab?.img}`}
                    alt={currentTab?.label}
                    className="h-20 md:h-24 object-contain object-bottom drop-shadow-sm"
                  />
                </div>
              </div>
            );
          })()}

          {/* PROFILE TAB */}
          {activeTab === "profile" && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="space-y-6">
                {/* Row 1 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2 relative">
                    <label className="absolute left-4 top-2.5 text-[10px] text-slate-400 font-semibold tracking-wide">
                      Company Name
                    </label>
                    <input
                      type="text"
                      name="compName"
                      value={formData.compName}
                      onChange={handleChange}
                      className="w-full px-3 pt-7 pb-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:border-indigo-500 outline-none text-sm font-semibold text-slate-800 dark:text-slate-100"
                    />
                  </div>
                  <div className="relative">
                    <label className="absolute left-4 top-2.5 text-[10px] text-slate-400 font-semibold tracking-wide">
                      Short Code
                    </label>
                    <input
                      type="text"
                      name="shortCode"
                      value={formData.shortCode}
                      onChange={handleChange}
                      className="w-full px-3 pt-7 pb-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:border-indigo-500 outline-none text-sm font-semibold text-slate-800 dark:text-slate-100"
                    />
                  </div>
                </div>

                {/* Row 2 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <input
                      type="text"
                      name="phone_1"
                      value={formData.phone_1}
                      onChange={handleChange}
                      placeholder="Phone1"
                      className="w-full px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:border-indigo-500 outline-none text-sm font-semibold placeholder:font-normal placeholder:text-slate-400 text-slate-800 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      name="phone_2"
                      value={formData.phone_2}
                      onChange={handleChange}
                      placeholder="Phone2"
                      className="w-full px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:border-indigo-500 outline-none text-sm font-semibold placeholder:font-normal placeholder:text-slate-400 text-slate-800 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      name="fax"
                      value={formData.fax}
                      onChange={handleChange}
                      placeholder="Fax"
                      className="w-full px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:border-indigo-500 outline-none text-sm font-semibold placeholder:font-normal placeholder:text-slate-400 text-slate-800 dark:text-slate-100"
                    />
                  </div>
                </div>

                {/* Row 3 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex flex-col">
                    <div className="relative flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus-within:border-indigo-500 w-full transition-all [&_.PhoneInputInput]:w-full [&_.PhoneInputInput]:bg-transparent [&_.PhoneInputInput]:border-none [&_.PhoneInputInput]:outline-none [&_.PhoneInputInput]:text-sm [&_.PhoneInputInput]:font-semibold [&_.PhoneInputInput]:text-slate-800 dark:[&_.PhoneInputInput]:text-slate-100 [&_.PhoneInputInput]:placeholder:font-normal [&_.PhoneInputInput]:placeholder:text-slate-400 [&_.PhoneInputInput]:px-3 [&_.PhoneInputInput]:py-2.5">
                      <PhoneInput
                        defaultCountry="IN"
                        placeholder="Mobile"
                        value={formData.mobile}
                        onChange={(val) => setFormData((prev) => ({ ...prev, mobile: val || "" }))}
                        countrySelectComponent={CountrySelect}
                      />
                    </div>
                    {formData.mobile && !isValidPhoneNumber(formData.mobile) && (
                      <span className="text-[11px] text-rose-500 dark:text-rose-400 font-semibold mt-1.5 pl-1 animate-in fade-in slide-in-from-top-1 duration-200">
                        Invalid phone number for selected country.
                      </span>
                    )}
                  </div>
                  <div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Email"
                      className="w-full px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:border-indigo-500 outline-none text-sm font-semibold placeholder:font-normal placeholder:text-slate-400 text-slate-800 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                      placeholder="Website"
                      className="w-full px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:border-indigo-500 outline-none text-sm font-semibold placeholder:font-normal placeholder:text-slate-400 text-slate-800 dark:text-slate-100"
                    />
                  </div>
                </div>

                {/* Row 4 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <input
                      type="text"
                      name="contact_Person"
                      value={formData.contact_Person}
                      onChange={handleChange}
                      placeholder="Contact Person"
                      className="w-full px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:border-indigo-500 outline-none text-sm font-semibold placeholder:font-normal placeholder:text-slate-400 text-slate-800 dark:text-slate-100"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* LOCATION TAB */}
          {activeTab === "location" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                  Country
                </label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-semibold text-sm focus:border-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                  State
                </label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-semibold text-sm focus:border-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-semibold text-sm focus:border-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                  Area / District
                </label>
                <input
                  type="text"
                  name="area"
                  value={formData.area}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-semibold text-sm focus:border-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                  Address
                </label>
                <textarea
                  name="address"
                  rows={3}
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-semibold text-sm focus:border-indigo-500 outline-none resize-none"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                  Pin Code
                </label>
                <input
                  type="text"
                  name="pinCode"
                  value={formData.pinCode}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-semibold text-sm focus:border-indigo-500 outline-none"
                />
              </div>
            </div>
          )}

          {/* TAX & FY TAB */}
          {activeTab === "tax-fy" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                  GST No
                </label>
                <input
                  type="text"
                  name="gstNo"
                  value={formData.gstNo}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-semibold text-sm focus:border-indigo-500 outline-none uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                  PAN Card No
                </label>
                <input
                  type="text"
                  name="panCardNo"
                  value={formData.panCardNo}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-semibold text-sm focus:border-indigo-500 outline-none uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                  Tax Type
                </label>
                <select
                  name="taxType"
                  value={formData.taxType}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-semibold text-sm focus:border-indigo-500 outline-none"
                >
                  <option value="">Select Tax Type</option>
                  <option value="GST">GST</option>
                  <option value="VAT">VAT</option>
                  <option value="None">None</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                  Base Currency
                </label>
                <select
                  name="baseCurrency"
                  value={formData.baseCurrency}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-semibold text-sm focus:border-indigo-500 outline-none"
                >
                  <option value={0}>Select Currency</option>
                  <option value={1}>INR</option>
                  <option value={2}>USD</option>
                  <option value={3}>EUR</option>
                </select>
              </div>

              <div className="md:col-span-2 border-t border-slate-100 dark:border-slate-800 pt-6 mt-2">
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                  <FileText size={16} className="text-amber-500" /> Financial
                  Year Settings
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                      FY Starts On
                    </label>
                    <input
                      type="date"
                      name="currentFYStarts"
                      value={formData.currentFYStarts}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-semibold text-sm focus:border-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                      FY Ends On
                    </label>
                    <input
                      type="date"
                      name="currentFYEnds"
                      value={formData.currentFYEnds}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-semibold text-sm focus:border-indigo-500 outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* INVOICE TAB */}
          {activeTab === "invoice" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                  Bill Format
                </label>
                <select
                  name="billFormat"
                  value={formData.billFormat || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-semibold text-sm focus:border-indigo-500 outline-none"
                >
                  <option value="" disabled>--Select Format--</option>
                  <option value="Format 1">Format 1</option>
                  <option value="Format 2">Format 2</option>
                  <option value="Format 3">Format 3</option>
                  <option value="Format 4">Format 4</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                  Bill No Split Char
                </label>
                <select
                  name="billNoSplitChar"
                  value={formData.billNoSplitChar || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-semibold text-sm focus:border-indigo-500 outline-none"
                >
                  <option value="" disabled>--Select Split Char--</option>
                  <option value="/">/</option>
                  <option value="-">-</option>
                </select>
              </div>

              <div className="md:col-span-2 space-y-3 mt-2">
                <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
                  <div>
                    <h5 className="font-bold text-sm text-slate-800 dark:text-slate-200 mb-1">
                      Include Financial Year in Bill No
                    </h5>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Append the current financial year to your invoice numbering series
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer select-none shrink-0">
                    <input
                      type="checkbox"
                      name="billNoIncludeFY"
                      checked={formData.billNoIncludeFY}
                      onChange={handleChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 peer-focus:outline-none rounded-full peer after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-[22px] peer-checked:bg-indigo-600 peer-checked:border-indigo-600 dark:peer-checked:bg-indigo-500 dark:peer-checked:border-indigo-500"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
                  <div>
                    <h5 className="font-bold text-sm text-slate-800 dark:text-slate-200 mb-1">
                      Use Company Short Code
                    </h5>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Prefix bill numbers with your registered company short code
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer select-none shrink-0">
                    <input
                      type="checkbox"
                      name="billNoOnCompanyShortCode"
                      checked={formData.billNoOnCompanyShortCode}
                      onChange={handleChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 peer-focus:outline-none rounded-full peer after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-[22px] peer-checked:bg-indigo-600 peer-checked:border-indigo-600 dark:peer-checked:bg-indigo-500 dark:peer-checked:border-indigo-500"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-dashed border-sky-500/30 dark:border-sky-500/20 bg-sky-500/5 dark:bg-sky-500/10 rounded-xl shadow-sm">
                  <div className="flex items-start gap-2.5">
                    <div className="mt-0.5 text-sky-600 dark:text-sky-400">
                      <Eye size={16} />
                    </div>
                    <div>
                      <h5 className="font-bold text-sm text-sky-600 dark:text-sky-400 mb-1">
                        Live Bill Number Preview
                      </h5>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Based on your current settings, this will be your invoice number pattern.
                      </p>
                    </div>
                  </div>
                  <span className="px-3 py-1.5 bg-sky-500/10 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400 font-bold rounded-lg border border-sky-500/20 text-sm tracking-wider font-mono shadow-sm shrink-0">
                    {getInvoiceNoPreview() || "N/A"}
                  </span>
                </div>
              </div>

              {/* Dynamic Item Description (Particular Format) */}
              <div className="md:col-span-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl p-5 mt-2 space-y-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <Sliders size={18} className="text-indigo-600 dark:text-indigo-400" />
                    Dynamic Item Description (Particular Format)
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Select fields in order. Drag items to reorder. Preview updates instantly using 2-3 items.
                  </p>
                </div>

                <div className="space-y-2">
                  {allParticulars.map((item, index) => (
                    <div
                      key={item.option.value}
                      draggable
                      onDragStart={() => handleDragStart(index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDrop={() => handleDrop(index)}
                      className={`flex items-center justify-between p-3 border rounded-lg transition-all ${
                        item.enabled
                          ? "bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 opacity-100"
                          : "bg-slate-50/40 dark:bg-slate-900/10 border-slate-100 dark:border-slate-800/60 opacity-60"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="cursor-grab hover:text-slate-700 dark:hover:text-slate-300 text-slate-400 p-1">
                          <GripVertical size={16} />
                        </div>
                        <span className="text-xs font-bold text-slate-400 dark:text-slate-500 w-5">
                          {index + 1}
                        </span>
                        <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                          {item.option.text}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleParticular(index)}
                        className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all ${
                          item.enabled
                            ? "bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                            : "bg-slate-200/50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 border border-slate-200/30"
                        }`}
                      >
                        {item.enabled ? "Enabled" : "Disabled"}
                      </button>
                    </div>
                  ))}
                </div>

                <p className="text-xs text-slate-400 dark:text-slate-500 italic mt-2">
                  Drag to reorder • Only enabled fields will appear in reports and invoices
                </p>

                {/* Preview box */}
                <div className="border-t border-slate-100 dark:border-slate-800 pt-4 mt-2">
                  <h5 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-3">
                    Preview
                  </h5>
                  <div className="space-y-2.5">
                    {particularPreviewLines.map((line, idx) => (
                      <div key={idx} className="border-b border-dashed border-slate-200 dark:border-slate-800 pb-2 last:border-0 last:pb-0">
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-0.5">
                          {line.title}
                        </span>
                        <div className="text-xs font-bold text-slate-800 dark:text-slate-200 font-mono">
                          {line.value || <span className="text-slate-400 dark:text-slate-600 italic">Empty</span>}
                        </div>
                      </div>
                    ))}
                    {particularPreviewLines.length === 0 && (
                      <div className="text-xs text-slate-400 dark:text-slate-500 italic">
                        No preview items available.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* BANK DETAILS TAB */}
          {activeTab === "bank-details" && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                  IFSC Code
                </label>
                <input
                  type="text"
                  name="ifscCode"
                  value={formData.ifscCode}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-semibold text-sm focus:border-indigo-500 outline-none uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                  Bank Name
                </label>
                <input
                  type="text"
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-semibold text-sm focus:border-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                  Branch Name
                </label>
                <input
                  type="text"
                  name="branchName"
                  value={formData.branchName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-semibold text-sm focus:border-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                  Account Number
                </label>
                <input
                  type="text"
                  name="acNo"
                  value={formData.acNo}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-semibold text-sm focus:border-indigo-500 outline-none"
                />
              </div>
            </div>
          )}

          {/* PREFERENCES TAB */}
          {activeTab === "preferences" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {/* System Preferences Card List */}
              <div className="space-y-3">
                {/* Use Customized PDF */}
                <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
                  <div>
                    <h5 className="font-bold text-sm text-slate-800 dark:text-slate-200 mb-1">
                      Use Customized PDF
                    </h5>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Apply custom branding and layout templates to your invoice PDFs
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer select-none shrink-0">
                    <input
                      type="checkbox"
                      name="isPdf"
                      checked={!formData.isPdf}
                      onChange={() => setFormData((prev) => ({ ...prev, isPdf: !prev.isPdf }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 peer-focus:outline-none rounded-full peer after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-[22px] peer-checked:bg-indigo-600 peer-checked:border-indigo-600 dark:peer-checked:bg-indigo-500 dark:peer-checked:bg-indigo-500"></div>
                  </label>
                </div>

                {/* Tally Transfer Itemwise */}
                <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
                  <div>
                    <h5 className="font-bold text-sm text-slate-800 dark:text-slate-200 mb-1">
                      Tally Transfer Itemwise
                    </h5>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Export transaction details to Tally on an item-by-item basis
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer select-none shrink-0">
                    <input
                      type="checkbox"
                      name="tallyTransferItemwise"
                      checked={formData.tallyTransferItemwise}
                      onChange={handleChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 peer-focus:outline-none rounded-full peer after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-[22px] peer-checked:bg-indigo-600 peer-checked:border-indigo-600 dark:peer-checked:bg-indigo-500 dark:peer-checked:bg-indigo-500"></div>
                  </label>
                </div>

                {/* Show Party Last Rate */}
                <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
                  <div>
                    <h5 className="font-bold text-sm text-slate-800 dark:text-slate-200 mb-1">
                      Show Party Last Rate
                    </h5>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Display the last sold price for a customer during billing entry
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer select-none shrink-0">
                    <input
                      type="checkbox"
                      name="onPartyPriceListRate"
                      checked={formData.onPartyPriceListRate}
                      onChange={handleChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 peer-focus:outline-none rounded-full peer after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-[22px] peer-checked:bg-indigo-600 peer-checked:border-indigo-600 dark:peer-checked:bg-indigo-500 dark:peer-checked:bg-indigo-500"></div>
                  </label>
                </div>

                {/* Unit View Full */}
                <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
                  <div>
                    <h5 className="font-bold text-sm text-slate-800 dark:text-slate-200 mb-1">
                      Unit View Full
                    </h5>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Display full unit names instead of short abbreviations
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer select-none shrink-0">
                    <input
                      type="checkbox"
                      name="unitViewFull"
                      checked={formData.unitViewFull}
                      onChange={handleChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 peer-focus:outline-none rounded-full peer after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-[22px] peer-checked:bg-indigo-600 peer-checked:border-indigo-600 dark:peer-checked:bg-indigo-500 dark:peer-checked:bg-indigo-500"></div>
                  </label>
                </div>

                {/* Enable Project Site */}
                <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
                  <div>
                    <h5 className="font-bold text-sm text-slate-800 dark:text-slate-200 mb-1">
                      Enable Project Site
                    </h5>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Track inventory and billing by specific project sites or locations
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer select-none shrink-0">
                    <input
                      type="checkbox"
                      name="isUseProjectSite"
                      checked={formData.isUseProjectSite}
                      onChange={handleChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 peer-focus:outline-none rounded-full peer after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-[22px] peer-checked:bg-indigo-600 peer-checked:border-indigo-600 dark:peer-checked:bg-indigo-500 dark:peer-checked:bg-indigo-500"></div>
                  </label>
                </div>
              </div>

              {/* Action Button for System Preferences */}
              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-8 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-all shadow-md shadow-indigo-600/20 active:scale-95 disabled:opacity-50 text-sm font-bold cursor-pointer"
                >
                  {isSaving ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Save size={18} />
                  )}
                  Update Preferences
                </button>
              </div>

              {/* System Preferences Tips */}
              <div className="flex flex-col md:flex-row gap-4 p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                <div className="space-y-2.5 flex-1">
                  <div className="flex items-start gap-2.5">
                    <span className="text-sky-500 mt-0.5"><CheckCircle2 size={16} /></span>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Enable Customized PDF only if templates and assets are configured.
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="text-emerald-500 mt-0.5"><CheckCircle2 size={16} /></span>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Show Party Last Rate is helpful for quick pricing decisions.
                    </p>
                  </div>
                </div>
                <div className="space-y-2.5 flex-1">
                  <div className="flex items-start gap-2.5">
                    <span className="text-emerald-500 mt-0.5"><CheckCircle2 size={16} /></span>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Use the Update button after changes to apply system-wide.
                    </p>
                  </div>
                </div>
              </div>

              {/* E-Invoice Settings Divider / Banner Header */}
              <div className="bg-gradient-to-r from-purple-50/80 to-fuchsia-50/80 dark:from-purple-950/30 dark:to-fuchsia-900/20 border border-purple-100 dark:border-purple-800/30 p-4 md:p-5 rounded-xl flex items-center justify-between gap-4 mt-6 shadow-sm relative overflow-hidden transition-all duration-300 min-h-[90px]">
                <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-white/40 to-transparent dark:from-slate-900/40 pointer-events-none"></div>
                <div className="flex items-center gap-4 relative z-10">
                  <div className="p-3 bg-white/80 dark:bg-slate-900/80 shadow-sm rounded-lg border border-white/50 dark:border-slate-700/50 text-indigo-600 backdrop-blur-sm">
                    <FileText size={16} />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-slate-800 dark:text-white leading-tight">
                      E-Invoice Settings
                    </h2>
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                      Configure government portal integration credentials
                    </p>
                  </div>
                </div>
                <div className="hidden md:block absolute right-0 bottom-0 z-10 pointer-events-none pr-2">
                  <img
                    src="/assets/companysettings/Untitled.png"
                    alt="E-Invoice Settings"
                    className="h-20 md:h-24 object-contain object-bottom drop-shadow-sm"
                  />
                </div>
              </div>

              {/* Enable E-Invoice card */}
              <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
                <div>
                  <h5 className="font-bold text-sm text-slate-800 dark:text-slate-200 mb-1">
                    Enable E-Invoice
                  </h5>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Integrate with the government e-invoicing portal for automatic generation
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer select-none shrink-0">
                  <input
                    type="checkbox"
                    name="isUseEinvoice"
                    checked={formData.isUseEinvoice}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 peer-focus:outline-none rounded-full peer after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-[22px] peer-checked:bg-indigo-600 peer-checked:border-indigo-600 dark:peer-checked:bg-indigo-500 dark:peer-checked:bg-indigo-500"></div>
                </label>
              </div>

              {/* E-Invoice API inputs */}
              {formData.isUseEinvoice && (
                <div className="p-5 border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-900/10 rounded-lg mt-4 space-y-4">
                  <h4 className="font-bold text-sm text-amber-800 dark:text-amber-500">
                    E-Invoice API Credentials
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                        API Username
                      </label>
                      <input
                        type="text"
                        name="eInvApiUser"
                        value={formData.eInvApiUser}
                        onChange={handleChange}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-semibold text-sm focus:border-indigo-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                        API Password
                      </label>
                      <input
                        type="password"
                        name="eInvApiPass"
                        value={formData.eInvApiPass}
                        onChange={handleChange}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-semibold text-sm focus:border-indigo-500 outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* E-Invoice Action Button */}
              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-8 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-all shadow-md shadow-indigo-600/20 active:scale-95 disabled:opacity-50 text-sm font-bold cursor-pointer"
                >
                  {isSaving ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Save size={18} />
                  )}
                  Update E-Invoice
                </button>
              </div>

              {/* E-Invoice Tips */}
              <div className="flex items-start gap-2.5 p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                <span className="text-emerald-500 mt-0.5"><CheckCircle2 size={16} /></span>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  E-Invoice settings should match your government portal credentials.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Action Button & Hints Footer */}
        {activeTab !== "preferences" && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-8 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-all shadow-md shadow-indigo-600/20 active:scale-95 disabled:opacity-50 text-sm font-bold cursor-pointer"
            >
              {isSaving ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Save size={18} />
              )}
              {activeTab === "profile" && "Update Profile"}
              {activeTab === "location" && "Update Location"}
              {activeTab === "tax-fy" && "Update Tax & FY"}
              {activeTab === "invoice" && "Update Invoice"}
              {activeTab === "bank-details" && "Update Bank Details"}
            </button>
          </div>
        )}

        {activeTab !== "preferences" && (
          <div className="flex flex-col md:flex-row gap-4 mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
            {activeTab === "profile" && (
              <>
                <div className="flex items-start gap-3 flex-1">
                  <div className="mt-0.5 text-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 rounded-full p-1">
                    <CheckCircle2 size={16} />
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Add your complete business profile details to improve document
                    accuracy and company branding across the ERP.
                  </p>
                </div>
                <div className="flex items-start gap-3 flex-1">
                  <div className="mt-0.5 text-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 rounded-full p-1">
                    <CheckCircle2 size={16} />
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Keep your business name, contact details, and registration
                    information updated for smooth communication and reporting.
                  </p>
                </div>
              </>
            )}

            {activeTab === "location" && (
              <>
                <div className="flex items-start gap-3 flex-1">
                  <div className="mt-0.5 text-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 rounded-full p-1">
                    <CheckCircle2 size={16} />
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Enter the complete business location including city, state, and Pincode to ensure
                    accurate invoicing and reporting.
                  </p>
                </div>
                <div className="flex items-start gap-3 flex-1">
                  <div className="mt-0.5 text-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 rounded-full p-1">
                    <CheckCircle2 size={16} />
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Use your primary operating location so taxes, delivery details, and branch-wise
                    reports work correctly.
                  </p>
                </div>
              </>
            )}

            {activeTab === "tax-fy" && (
              <>
                <div className="flex items-start gap-3 flex-1">
                  <div className="mt-0.5 text-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 rounded-full p-1">
                    <CheckCircle2 size={16} />
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Select the correct tax settings and financial year to ensure accurate GST filing
                    and financial reports.
                  </p>
                </div>
                <div className="flex items-start gap-3 flex-1">
                  <div className="mt-0.5 text-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 rounded-full p-1">
                    <CheckCircle2 size={16} />
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Review your financial year dates carefully before saving, as they affect invoices,
                    accounting, and compliance records.
                  </p>
                </div>
              </>
            )}

            {activeTab === "invoice" && (
              <>
                <div className="flex items-start gap-3 flex-1">
                  <div className="mt-0.5 text-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 rounded-full p-1">
                    <CheckCircle2 size={16} />
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Configure invoice and billing settings correctly to maintain accurate GST
                    calculations and professional invoices.
                  </p>
                </div>
                <div className="flex items-start gap-3 flex-1">
                  <div className="mt-0.5 text-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 rounded-full p-1">
                    <CheckCircle2 size={16} />
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Review invoice prefixes, payment terms, and tax settings before creating customer
                    invoices.
                  </p>
                </div>
              </>
            )}

            {activeTab === "bank-details" && (
              <>
                <div className="flex items-start gap-3 flex-1">
                  <div className="mt-0.5 text-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 rounded-full p-1">
                    <CheckCircle2 size={16} />
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Enter the bank account details carefully to avoid payment and transaction
                    errors.
                  </p>
                </div>
                <div className="flex items-start gap-3 flex-1">
                  <div className="mt-0.5 text-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 rounded-full p-1">
                    <CheckCircle2 size={16} />
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Use the company’s official bank account information for invoices, payments, and
                    financial reports.
                  </p>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
