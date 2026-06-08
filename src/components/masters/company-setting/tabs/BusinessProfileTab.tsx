import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import { toast } from "../../../../lib/toast";
import { settingsApi } from "../../../../services/settings.service";

export const BusinessProfileTab: React.FC = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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

  useEffect(() => {
    loadCompanySettings();
  }, []);

  const loadCompanySettings = async () => {
    setIsLoading(true);
    try {
      // In old app, getById gets company using auth companyId.
      // We pass an empty object or the local user's company ID if available. Let's assume it resolves via auth token context on backend or we pass { id: 1 } for now
      // Here we just make the call and hope backend handles it, or use the token info
      const companyInfoStr = localStorage.getItem("erp_user");
      const companyId = companyInfoStr
        ? JSON.parse(companyInfoStr)?.company?.id
        : 1;

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
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-white">
            Company
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Update company information and billing preferences
          </p>
        </div>
      </div>

      {/* Horizontal Navigation */}
      <div className="border-b border-slate-100 dark:border-slate-800 px-5 pt-3 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex w-full overflow-x-auto custom-scrollbar pb-1 gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-t-xl text-sm font-semibold transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border border-slate-200 dark:border-slate-700 border-b-white dark:border-b-slate-800 relative translate-y-[1px]"
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50 border border-transparent"
              }`}
            >
              {tab.icon}
              {tab.label}
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
                  <div className="relative flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus-within:border-indigo-500 overflow-hidden">
                    <div className="px-3 py-2.5 flex items-center gap-2 border-r border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                      <span className="text-lg leading-none">🇮🇳</span>
                    </div>
                    <input
                      type="text"
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleChange}
                      placeholder="Mobile"
                      className="w-full px-3 py-2.5 bg-transparent outline-none text-sm font-semibold placeholder:font-normal placeholder:text-slate-400 text-slate-800 dark:text-slate-100"
                    />
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
              <div className="md:col-span-2">
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
                  Bill Format Prefix
                </label>
                <input
                  type="text"
                  name="billFormat"
                  value={formData.billFormat}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-semibold text-sm focus:border-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                  Bill No Split Character
                </label>
                <input
                  type="text"
                  name="billNoSplitChar"
                  value={formData.billNoSplitChar}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-semibold text-sm focus:border-indigo-500 outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                  Particulars Display Format
                </label>
                <input
                  type="text"
                  name="particularFormat"
                  value={formData.particularFormat}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-semibold text-sm focus:border-indigo-500 outline-none"
                  placeholder="item code,item name"
                />
                <p className="text-xs text-slate-500 mt-2">
                  Comma separated fields. E.g. "item code,item name"
                </p>
              </div>

              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <label className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer hover:border-indigo-300 transition-colors">
                  <input
                    type="checkbox"
                    name="billNoIncludeFY"
                    checked={formData.billNoIncludeFY}
                    onChange={handleChange}
                    className="w-5 h-5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                  />
                  <div>
                    <div className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                      Include FY in Bill No
                    </div>
                    <div className="text-xs text-slate-500">
                      Append financial year to invoice numbers
                    </div>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer hover:border-indigo-300 transition-colors">
                  <input
                    type="checkbox"
                    name="billNoOnCompanyShortCode"
                    checked={formData.billNoOnCompanyShortCode}
                    onChange={handleChange}
                    className="w-5 h-5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                  />
                  <div>
                    <div className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                      Use Company Short Code
                    </div>
                    <div className="text-xs text-slate-500">
                      Prefix bill number with company short code
                    </div>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* BANK DETAILS TAB */}
          {activeTab === "bank-details" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="md:col-span-2">
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

              <div className="md:col-span-2">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer hover:border-indigo-300 transition-colors">
                  <input
                    type="checkbox"
                    name="isPdf"
                    checked={formData.isPdf}
                    onChange={handleChange}
                    className="w-5 h-5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                  />
                  <div className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                    Default PDF Generation
                  </div>
                </label>

                <label className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer hover:border-indigo-300 transition-colors">
                  <input
                    type="checkbox"
                    name="tallyTransferItemwise"
                    checked={formData.tallyTransferItemwise}
                    onChange={handleChange}
                    className="w-5 h-5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                  />
                  <div className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                    Tally Transfer Itemwise
                  </div>
                </label>

                <label className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer hover:border-indigo-300 transition-colors">
                  <input
                    type="checkbox"
                    name="onPartyPriceListRate"
                    checked={formData.onPartyPriceListRate}
                    onChange={handleChange}
                    className="w-5 h-5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                  />
                  <div className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                    On Party Price List Rate
                  </div>
                </label>

                <label className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer hover:border-indigo-300 transition-colors">
                  <input
                    type="checkbox"
                    name="unitViewFull"
                    checked={formData.unitViewFull}
                    onChange={handleChange}
                    className="w-5 h-5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                  />
                  <div className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                    View Full Unit
                  </div>
                </label>

                <label className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer hover:border-indigo-300 transition-colors">
                  <input
                    type="checkbox"
                    name="isUseEinvoice"
                    checked={formData.isUseEinvoice}
                    onChange={handleChange}
                    className="w-5 h-5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                  />
                  <div className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                    Use E-Invoice Integration
                  </div>
                </label>

                <label className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer hover:border-indigo-300 transition-colors">
                  <input
                    type="checkbox"
                    name="isUseProjectSite"
                    checked={formData.isUseProjectSite}
                    onChange={handleChange}
                    className="w-5 h-5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                  />
                  <div className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                    Use Project Sites
                  </div>
                </label>
              </div>

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
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-semibold text-sm focus:border-amber-500 outline-none"
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
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-semibold text-sm focus:border-amber-500 outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Button & Hints Footer */}
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-8 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-all shadow-md shadow-indigo-600/20 active:scale-95 disabled:opacity-50"
          >
            {isSaving ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Save size={18} />
            )}
            Update Profile
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
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
        </div>
      </div>
    </div>
  );
};
