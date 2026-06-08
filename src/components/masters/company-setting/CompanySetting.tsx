import React, { useState } from "react";
import {
  Settings,
  Building2,
  MapPin,
  Receipt,
  Banknote,
  Sliders,
  Store,
  Ruler,
  DollarSign,
  Users,
  Tag,
  FileText,
  Target,
  Map,
  UserCog,
  ShieldCheck,
  Megaphone,
  Image as ImageIcon,
  Search,
  Palette,
} from "lucide-react";
import { BusinessProfileTab } from "./tabs/BusinessProfileTab";
import { StockPlaceTab } from "./tabs/StockPlaceTab";
import { AnnouncementsTab } from "./tabs/AnnouncementsTab";
import { AppearanceTab } from "./tabs/AppearanceTab";

type MainTab =
  | "business-profile"
  | "extra-charges"
  | "stock-place"
  | "unit-master"
  | "currency-master"
  | "sales-person"
  | "item-rate-category"
  | "terms-and-condition"
  | "ledger-targets"
  | "project-site"
  | "user-management"
  | "role"
  | "announcements"
  | "images-and-assets";

export const CompanySetting: React.FC = () => {
  const [activeTab, setActiveTab] = useState<MainTab>("business-profile");
  const [searchTerm, setSearchTerm] = useState("");

  const menuSections = [
    {
      title: "GENERAL",
      items: [
        {
          id: "business-profile",
          title: "Business Profile",
          subtitle: "Company information and branding",
          icon: <Building2 size={18} />,
        },
      ],
    },
    {
      title: "MASTERS",
      items: [
        {
          id: "extra-charges",
          title: "Extra Charges",
          subtitle: "Manage additional fees and charges",
          icon: <DollarSign size={18} />,
        },
        {
          id: "stock-place",
          title: "Stock Place",
          subtitle: "Manage stock place list",
          icon: <Store size={18} />,
        },
        {
          id: "unit-master",
          title: "Unit Master",
          subtitle: "Manage units of measurement",
          icon: <Ruler size={18} />,
        },
        {
          id: "currency-master",
          title: "Currency Master",
          subtitle: "Manage system currencies",
          icon: <Banknote size={18} />,
        },
        {
          id: "sales-person",
          title: "Sales Person",
          subtitle: "Manage sales representatives",
          icon: <Users size={18} />,
        },
        {
          id: "item-rate-category",
          title: "Item Rate Category",
          subtitle: "Configure item rate categories",
          icon: <Tag size={18} />,
        },
        {
          id: "terms-and-condition",
          title: "Terms And Condition",
          subtitle: "Manage standard terms",
          icon: <FileText size={18} />,
        },
        {
          id: "ledger-targets",
          title: "Ledger Targets",
          subtitle: "Set targets for ledgers",
          icon: <Target size={18} />,
        },
        {
          id: "project-site",
          title: "Project Site",
          subtitle: "Manage project locations",
          icon: <Map size={18} />,
        },
      ],
    },
    {
      title: "SYSTEM",
      items: [
        {
          id: "user-management",
          title: "User Management",
          subtitle: "Manage users and permissions",
          icon: <UserCog size={18} />,
        },
        {
          id: "role",
          title: "Role",
          subtitle: "Manage roles and access control",
          icon: <ShieldCheck size={18} />,
        },
        {
          id: "announcements",
          title: "Announcements",
          subtitle: "Company announcements",
          icon: <Megaphone size={18} />,
        },
      ],
    },
    {
      title: "APPEARANCE",
      items: [
        {
          id: "images-and-assets",
          title: "Images & Assets",
          subtitle: "Theme, colors, and display preferences",
          icon: <Palette size={18} />,
        },
      ],
    },
  ];

  const renderActiveTab = () => {
    switch (activeTab) {
      case "business-profile":
        return <BusinessProfileTab />;
      case "stock-place":
        return <StockPlaceTab />;
      case "announcements":
        return <AnnouncementsTab />;
      case "images-and-assets":
        return <AppearanceTab />;
      default:
        // Placeholder for unimplemented tabs
        return (
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-8 text-center h-[500px] flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4 text-slate-400">
              <Settings size={32} />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2">
              {
                menuSections
                  .flatMap((s) => s.items)
                  .find((i) => i.id === activeTab)?.title
              }
            </h3>
            <p className="text-slate-500 dark:text-slate-400">
              This module is currently under development.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="w-full p-2 sm:p-4 lg:px-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Sidebar Container */}
        <div className="w-full lg:w-72 flex-shrink-0 flex flex-col gap-4 h-[calc(100vh-8rem)]">
          {/* Navigation Card */}
          <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden min-h-0">
            {/* Sidebar Header */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 flex-shrink-0 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Settings size={18} />
                </div>
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search settings..."
                    className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                  <Search
                    size={16}
                    className="absolute left-3 top-2.5 text-slate-400"
                  />
                </div>
              </div>
            </div>

          {/* Sidebar Navigation */}
          <div className="flex-1 overflow-y-auto p-3 space-y-6 custom-scrollbar">
            {menuSections.map((section, idx) => {
              const visibleItems = section.items.filter(
                (item) =>
                  !searchTerm ||
                  item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  item.subtitle
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()),
              );

              if (visibleItems.length === 0) return null;

              return (
                <div key={idx} className="space-y-1">
                  <h3 className="px-3 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                    {section.title}
                  </h3>
                  {visibleItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id as MainTab)}
                      className={`w-full flex items-start gap-3 px-3 py-2.5 rounded-xl transition-all text-left group ${
                        activeTab === item.id
                          ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400"
                          : "hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-300"
                      }`}
                    >
                      <div
                        className={`mt-0.5 transition-colors ${
                          activeTab === item.id
                            ? "text-indigo-600 dark:text-indigo-400"
                            : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300"
                        }`}
                      >
                        {item.icon}
                      </div>
                      <div>
                        <div
                          className={`text-sm font-semibold ${
                            activeTab === item.id
                              ? "text-indigo-700 dark:text-indigo-400"
                              : "text-slate-700 dark:text-slate-200"
                          }`}
                        >
                          {item.title}
                        </div>
                        <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                          {item.subtitle}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              );
            })}
          </div>

          </div>

          {/* Help Section Card */}
          <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex-shrink-0">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 mb-2">
              <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                <ShieldCheck size={16} />
              </div>
              <h4 className="font-bold text-sm">Need Help?</h4>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 leading-relaxed">
              Visit our guide or raise a ticket for assistance.
            </p>
            <div className="flex flex-col gap-2">
              <button className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg text-xs font-semibold hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors">
                <FileText size={14} /> How to Guide
              </button>
              <button className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg text-xs font-semibold hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors">
                <UserCog size={14} /> Raise a Ticket
              </button>
            </div>
          </div>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 min-w-0">{renderActiveTab()}</div>
      </div>
    </div>
  );
};
