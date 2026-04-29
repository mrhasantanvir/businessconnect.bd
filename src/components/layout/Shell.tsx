"use client";

import React, { useState, useEffect } from "react";
import { 
  BarChart3, 
  Box, 
  LayoutDashboard, 
  Mic, 
  Package, 
  PhoneCall, 
  Search, 
  Users,
  Megaphone,
  Menu,
  Bell,
  Layout,
  Share2,
  MessageSquare,
  LogOut,
  Activity,
  ShieldCheck,
  ShoppingBag,
  AlertCircle,
  CreditCard,
  Wallet,
  ArrowUpRight,
  Warehouse,
  RotateCcw,
  Truck,
  FolderTree,
  Shield,
  AlertTriangle,
  Cpu,
  BrainCircuit,
  ChevronDown,
  ChevronRight,
  Zap,
  Store,
  Building2,
  Star,
  Globe,
  Database,
  X
} from "lucide-react";
import { FileSpreadsheet } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { SipDialer } from "../dialer/SipDialer";
import { logoutAction } from "@/app/login/actions";
import { WebChatWidget } from "../chat/WebChatWidget";
import { useSupport } from "@/context/SupportContext";
import { useLanguage } from "@/context/LanguageContext";
import { Providers } from "./Providers";
import { StaffTracker } from "../staff/StaffTracker";
import { GlobalChatFloatingBar } from "@/app/merchant/staff/chat/GlobalChatFloatingBar";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function Shell({ children, user }: { children: React.ReactNode, user?: any }) {
  const [isSidebarExpanded, setSidebarExpanded] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const pathname = usePathname();
  const { toggle, isEnabled } = useSupport();
  const { language, setLanguage, t } = useLanguage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);



  const role = user?.role || "MERCHANT";

  // Toggle category
  const toggleCategory = (label: string) => {
    setExpandedCategories(prev => 
      prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label]
    );
  };

  // Structured Items
  const NAVIGATION = [
    {
      group: t("core_hub"),
      items: [
        { icon: LayoutDashboard, label: t("dashboard"), href: "/dashboard", roles: ["MERCHANT", "STAFF"] },
        { icon: Zap, label: "Staff Portal", href: "/merchant/staff/dashboard", roles: ["MERCHANT", "STAFF"] },
        { icon: Activity, label: t("intelligence"), href: "/merchant/analytics", roles: ["MERCHANT", "STAFF"] },
        { icon: Database, label: t("data_insights"), roles: ["MERCHANT"], subItems: [
           { label: t("live_reports"), href: "/merchant/reports" },
           { label: t("vat_compliance"), href: "/merchant/reports/vat" },
        ]},
      ]
    },
    {
      group: t("commercial"),
      items: [
        { icon: ShoppingBag, label: t("orders"), href: "/orders", roles: ["MERCHANT", "STAFF"] },
        { icon: CreditCard, label: t("pos"), href: "/merchant/pos", roles: ["MERCHANT", "STAFF"] },
        { icon: Zap, label: "Flash Discount", href: "/merchant/campaigns/flash-sales", roles: ["MERCHANT", "STAFF"] },
        { icon: FolderTree, label: t("catalog"), roles: ["MERCHANT", "STAFF"], subItems: [
           { label: t("products"), href: "/products/add" },
           { label: "Categories", href: "/merchant/catalog/categories" },
           { label: "Brands", href: "/merchant/catalog/brands" },
        ]},
      ]
    },
    {
      group: t("logistics_wms"),
      items: [
        { icon: Warehouse, label: t("warehouse_hub"), href: "/merchant/inventory/warehouses", roles: ["MERCHANT", "STAFF"] },
        { icon: ShieldCheck, label: "Tax & VAT", href: "/merchant/settings/tax", roles: ["MERCHANT", "STAFF"] },
        { icon: Box, label: t("inventory"), roles: ["MERCHANT", "STAFF"], subItems: [
           { label: "Stock Levels", href: "/merchant/wms/inventory" },
           { label: "COD Reconciliation", href: "/merchant/logistics/cod-reconciliation" },
           { label: "Transfers", href: "/merchant/wms/transfers" },
           { label: "Return Hub", href: "/merchant/wms/returns" },
           { label: "Damage Logs", href: "/merchant/wms/damage-report" },
        ]},
        { icon: Truck, label: t("delivery_setup"), href: "/merchant/logistics", roles: ["MERCHANT", "STAFF"] },
      ]
    },
    {
      group: t("growth_ai"),
      items: [
         { icon: Megaphone, label: t("marketing"), roles: ["MERCHANT", "STAFF"], subItems: [
            { label: "Campaigns", href: "/merchant/campaigns" },
            { label: "Facebook Ads", href: "/merchant/marketing/facebook" },
            { label: t("automation"), href: "/merchant/campaigns/marketing-automation" },
         ]},
        { icon: BrainCircuit, label: t("ai_hub"), href: "/merchant/ai-hub", roles: ["MERCHANT", "STAFF"] },
        { icon: Globe, label: t("social_connect"), href: "/merchant/social", roles: ["MERCHANT", "STAFF"] },
      ]
    },
      {
        group: t("communications"),
        items: [
          { icon: MessageSquare, label: t("inbox"), href: "/merchant/inbox", roles: ["MERCHANT", "STAFF"] },
          { icon: Star, label: "Customer Reviews", href: "/merchant/reviews", roles: ["MERCHANT", "STAFF"] },
          { icon: PhoneCall, label: t("cloud_dialer"), href: "#", roles: ["MERCHANT", "STAFF"] },
          { icon: Users, label: t("customer_crm"), href: "/merchant/customers", roles: ["MERCHANT", "STAFF"] },
          { icon: MessageSquare, label: "Internal Staff Chat", href: "/merchant/staff/chat", roles: ["MERCHANT", "STAFF"] },
      ]
    },
    {
      group: t("administration"),
      items: [
        { icon: Shield, label: "Admin Pulse", href: "/admin", roles: ["SUPER_ADMIN"] },
        { icon: Store, label: "Merchant Ecosystem", href: "/admin/merchants", roles: ["SUPER_ADMIN"] },
        { icon: Cpu, label: "Global AI", href: "/admin/ai-settings", roles: ["SUPER_ADMIN"] },
        { icon: Activity, label: "Billings", href: "/admin/billing", roles: ["SUPER_ADMIN"] },
        { icon: Package, label: "Subscriptions", href: "/admin/subscriptions", roles: ["SUPER_ADMIN"] },
        { icon: Zap, label: "System Updates", href: "/admin/system/update", roles: ["SUPER_ADMIN"] },
        { icon: Layout, label: t("business_profile"), href: "/merchant/storefront", roles: ["MERCHANT"] },
          { icon: Share2, label: t("settings"), roles: ["MERCHANT"], subItems: [
             { label: t("storefront_themes"), href: "/merchant/settings/themes" },
             { label: t("payment_gateways"), href: "/merchant/settings/payments" },
            { label: t("sms_gateways"), href: "/merchant/settings/sms" },
            { label: "Document & Print", href: "/merchant/settings/print" },
            { label: "WooCommerce", href: "/merchant/settings/woocommerce" },
            { label: "Google Sheets", href: "/merchant/settings/google-sheets" },
         ]},
        { icon: CreditCard, label: "Billing & Credits", href: "/merchant/billing", roles: ["MERCHANT"] },
        { icon: Users, label: "Team Management", roles: ["MERCHANT"], subItems: [
           { label: "Add & Manage Team", href: "/merchant/staff" },
           { label: "Role & Permissions", href: "/merchant/settings/roles" },
           { label: "Chat Audit Hub", href: "/merchant/staff/chat/audit" },
           { label: "Performance Matrix", href: "/hr" },
        ]},
        { icon: Building2, label: "Branches", href: "/merchant/branches", roles: ["MERCHANT"] },
        { icon: Wallet, label: "Accounting", href: "/merchant/accounting", roles: ["MERCHANT"] },
      ]
    },
    {
       group: "Support Hub",
       items: [
         { icon: MessageSquare, label: "Customer Care", href: "/support", roles: ["MERCHANT", "STAFF"] },
         { icon: AlertCircle, label: "Tickets", href: "/support/incidents", roles: ["MERCHANT", "STAFF"] },
         { icon: PhoneCall, label: "Platform Chat", href: "/support/platform-chat", roles: ["MERCHANT", "STAFF"] },
       ]
    }
  ];

  const headerItems = [
    { icon: AlertCircle, label: "Tickets", href: "/support/incidents", roles: ["MERCHANT", "STAFF"] },
    { icon: PhoneCall, label: "Platform Chat", href: "/support/platform-chat", roles: ["MERCHANT", "STAFF"] },
    { icon: MessageSquare, label: "Merchant Queue", href: "/admin/support", roles: ["SUPER_ADMIN"] },
    { icon: PhoneCall, label: "Support Chat Queue", href: "/admin/support/chats", roles: ["SUPER_ADMIN"] },
  ].filter(item => item.roles.includes(role));

  const isGuestRoute = pathname === "/" || pathname === "/login" || pathname === "/register" || pathname.startsWith("/s/") || pathname === "/merchant/onboarding";

  if (isGuestRoute) {
     return <>{children}</>;
  }

  return (
    <div className={cn("flex h-screen w-full bg-[#F8F9FA] overflow-hidden", language === 'bn' && "font-bn")}>
      {/* Mobile Sidebar Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[45] lg:hidden animate-in fade-in duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      
      {/* Mobile Header (Hidden on Desktop) */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-[#E5E7EB] flex items-center justify-between px-6 z-40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-tr from-[#1E40AF] to-blue-400 rounded-lg flex items-center justify-center">
            <Box className="w-5 h-5 text-white" />
          </div>
          <span className="font-black text-sm uppercase tracking-tighter">Business<span className="text-[#1E40AF]">Connect</span></span>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-all"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar (Desktop) */}
      <aside 
        className={cn(
          "h-full bg-white border-r border-[#E5E7EB] transition-all duration-300 flex flex-col z-50 lg:relative fixed inset-y-0 left-0 lg:translate-x-0 shadow-2xl lg:shadow-none",
          isSidebarExpanded ? "w-72" : "w-20",
          isMobileMenuOpen ? "translate-x-0 w-72" : "-translate-x-full lg:translate-x-0"
        )}
        onMouseEnter={() => setSidebarExpanded(true)}
        onMouseLeave={() => {
          setSidebarExpanded(false);
          setExpandedCategories([]);
        }}
      >
        {/* Logo Section */}
        <div className="h-16 flex items-center px-6 border-b border-[#E5E7EB]">
          <div className="w-8 h-8 bg-gradient-to-tr from-[#1E40AF] to-blue-400 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Box className="w-5 h-5 text-white" />
          </div>
          {(isSidebarExpanded || isMobileMenuOpen) && (
            <span className="ml-3 font-black text-sm text-[#0F172A] uppercase tracking-tighter flex-1">
              Business<span className="text-[#1E40AF]">Connect</span>.BD
            </span>
          )}
          {isMobileMenuOpen && (
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden p-2 text-gray-400 hover:text-red-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <nav className="flex-1 py-4 flex flex-col gap-1 px-3 overflow-y-auto">
          {NAVIGATION.map((group) => {
            const isInactiveMerchant = user?.role === "MERCHANT" && user?.activationStatus !== "ACTIVE";
            
            const visibleItems = group.items.filter(item => {
              const isRoleAllowed = item.roles.includes(role);
              if (!isRoleAllowed) return false;
              
              // If inactive merchant, restrict access to certain groups/items
              if (isInactiveMerchant) {
                // Allow Dashboard, Catalog (for adding products), and Profile
                const allowedLabels = [t("dashboard"), t("catalog"), t("business_profile"), "Support Hub"];
                const isAllowed = allowedLabels.includes(item.label) || group.group === "Support Hub";
                if (!isAllowed) return false;
              }
              
              return true;
            });
            
            if (visibleItems.length === 0) return null;

            return (
              <div key={group.group} className="mb-4">
                {(isSidebarExpanded || isMobileMenuOpen) && (
                  <div className="px-4 py-2 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-0.5">
                    {group.group}
                  </div>
                )}
                
                <div className="space-y-1">
                  {visibleItems.map((item) => {
                    const hasSubItems = !!item.subItems;
                    const isExpanded = expandedCategories.includes(item.label);
                    const isActive = pathname === item.href || item.subItems?.some(s => s.href === pathname);

                    return (
                      <div key={item.label}>
                        {hasSubItems ? (
                          <button
                            onClick={() => toggleCategory(item.label)}
                            className={cn(
                              "w-full flex items-center gap-3 px-4 py-2 rounded-xl transition-all group relative",
                              isActive 
                                ? "bg-indigo-50 text-indigo-700" 
                                : "text-gray-500 hover:bg-gray-50"
                            )}
                          >
                            <item.icon className="w-5 h-5 flex-shrink-0" />
                            {(isSidebarExpanded || isMobileMenuOpen) && (
                              <>
                                <span className={cn("flex-1 text-xs font-semibold text-left", language === 'bn' && "text-sm")}>{item.label}</span>
                                {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                              </>
                            )}
                          </button>
                        ) : (
                          <Link 
                            href={item.href || "#"}
                            onClick={() => {
                              if (isMobileMenuOpen) setIsMobileMenuOpen(false);
                            }}
                            className={cn(
                              "flex items-center gap-3 px-4 py-2 rounded-xl transition-all group relative",
                              isActive 
                                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200" 
                                : "text-gray-500 hover:bg-gray-50"
                            )}
                          >
                            <item.icon className="w-5 h-5 flex-shrink-0" />
                            {(isSidebarExpanded || isMobileMenuOpen) && (
                              <span className={cn("flex-1 text-xs font-semibold", language === 'bn' && "text-sm")}>{item.label}</span>
                            )}
                          </Link>
                        )}

                        {/* Sub Items Rendering */}
                        {hasSubItems && isExpanded && (isSidebarExpanded || isMobileMenuOpen) && (
                          <div className="mt-1 ml-9 border-l border-gray-100 space-y-0.5 py-0.5">
                            {item.subItems?.map(sub => (
                              <Link
                                key={sub.label}
                                href={sub.href}
                                className={cn(
                                  "block px-4 py-1 text-[10px] font-semibold transition-all relative",
                                  pathname === sub.href 
                                    ? "text-indigo-600 before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-1.5 before:h-1.5 before:bg-indigo-600 before:rounded-full before:-ml-[5px]"
                                    : "text-gray-400 hover:text-indigo-600"
                                )}
                              >
                                {sub.label}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* User / Logout */}
        <div className="p-4 border-t border-[#E5E7EB]">
           <button 
             onClick={() => logoutAction()}
             className="w-full flex items-center gap-4 px-3 py-3 rounded-none text-[#DC2626] hover:bg-[#FEF2F2] transition-colors group relative"
           >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              {(isSidebarExpanded || isMobileMenuOpen) && <span className="font-bold text-sm">Sign Out</span>}
              {!isSidebarExpanded && (
                <div className="absolute left-16 hidden group-hover:flex items-center px-2 py-1 bg-[#DC2626] text-white text-[10px] rounded-none shadow-soft z-50 whitespace-nowrap">
                  Sign Out
                </div>
              )}
           </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative pt-14 lg:pt-0">
        
        {/* Activation Status Banner */}
        {user?.role === "MERCHANT" && user?.activationStatus !== "ACTIVE" && (
          <div className="bg-[#FFFBEB] border-b border-amber-100 px-8 py-3 flex items-center justify-between animate-in slide-in-from-top duration-500">
             <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                   <AlertTriangle className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                   <h4 className="text-[10px] font-black text-amber-900 uppercase tracking-widest">
                      {user?.activationStatus === "PENDING" ? "Account Pending Activation" : "Activation Rejected"}
                   </h4>
                   <p className="text-[10px] text-amber-700 font-medium uppercase mt-0.5">
                      {user?.activationStatus === "PENDING" 
                         ? "Our admin team is reviewing your documents. You can add products but cannot take orders yet."
                         : "Please re-upload valid documents in the onboarding section."}
                   </p>
                </div>
             </div>
             <Link 
               href="/merchant/onboarding" 
               className="bg-amber-600 text-white text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-lg hover:bg-amber-700 transition-all shadow-sm"
             >
                {user?.activationStatus === "PENDING" ? "View Submission" : "Re-Onboard Now"}
             </Link>
          </div>
        )}
        {/* Transparent Glass-morphism Header */}
        <header className="h-14 w-full bg-white sticky top-0 z-40 flex items-center justify-between px-4 lg:px-8 border-b border-[#E5E7EB]/50 shrink-0">
          <div className="flex items-center gap-4 lg:hidden">
            {/* The actual mobile toggle is handled by the sticky header added earlier */}
          </div>

          {/* AI Omnibar */}
          <div className="flex-1 max-w-2xl mx-auto flex items-center relative hidden md:flex h-full py-1.5">
            <div className="w-full h-full bg-white/50 border border-[#E5E7EB] rounded-none px-4 flex items-center shadow-sm backdrop-blur-sm transition-all focus-within:ring-2 focus-within:ring-[#1E40AF]">
              <Search className="w-4 h-4 text-[#A1A1AA] mr-3" />
              <input 
                type="text" 
                placeholder={role === 'SUPER_ADMIN' ? 'Search merchants or systems...' : 'Search in GadgetGear inventory...'}
                className="flex-1 bg-transparent border-none outline-none text-sm text-[#0F172A] placeholder:text-[#A1A1AA]"
              />
              <button className="ml-2 group relative">
                <Mic className="w-4 h-4 text-[#A1A1AA] group-hover:text-[#1E40AF] transition-colors" />
                <span className="absolute -inset-1 rounded-none bg-[#BEF264]/20 animate-pulse group-hover:block hidden"></span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4 ml-auto lg:ml-0">
            {/* System Pulse Ticker */}
            <div className="hidden lg:flex items-center gap-2 bg-[#BEF264]/10 text-[#65A30D] px-3 py-1 rounded-none text-[10px] font-semibold w-max border border-[#BEF264]/20">
              <span className="w-1.5 h-1.5 rounded-none bg-current animate-pulse"></span>
              Pulse: Scaled
            </div>

          <div className="flex items-center gap-1 mx-2">
            {/* Language Toggle */}
            <button 
              onClick={() => setLanguage(language === 'en' ? 'bn' : 'en')}
              className="px-3 py-1 text-[10px] font-black uppercase tracking-widest border border-slate-200 rounded-none hover:bg-slate-100 transition-all text-slate-600"
            >
              {language === 'en' ? 'বাংলা' : 'English'}
            </button>

            {headerItems.map((item) => {
              const isPlatformChat = item.href === "/support/platform-chat";
              
              if (isPlatformChat && !isEnabled && role !== "SUPER_ADMIN") {
                return null;
              }

              if (isPlatformChat) {
                return (
                  <button 
                    key={item.label}
                    onClick={toggle}
                    title={item.label}
                    className="p-2 text-[#64748B] hover:text-[#1E40AF] hover:bg-white transition-all group relative border border-transparent hover:border-[#E5E7EB]"
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#1E40AF] rounded-none opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  </button>
                );
              }
                return (
                  <Link 
                    key={item.label}
                    href={item.href}
                    title={item.label}
                    className="p-2 text-[#64748B] hover:text-[#1E40AF] hover:bg-white transition-all group relative border border-transparent hover:border-[#E5E7EB]"
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#1E40AF] rounded-none opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  </Link>
                );
              })}
            </div>

            <button className="p-2 text-[#0F172A] hover:bg-gray-100 rounded-none transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-none border-2 border-white"></span>
            </button>
            
            <div className="flex items-center gap-3 ml-2">
               {(isSidebarExpanded || isMobileMenuOpen) && (
                 <div className="text-right hidden sm:block">
                   <div className="text-[10px] font-black text-[#A1A1AA] uppercase leading-none mb-1">{user?.role}</div>
                   <div className="text-xs font-bold text-[#0F172A] leading-none">{user?.name}</div>
                 </div>
               )}
               <div className="w-7 h-7 rounded-none bg-gradient-to-tr from-[#1E40AF] to-[#BEF264] flex items-center justify-center text-white font-bold text-[10px] shadow-soft cursor-pointer">
                {user?.name?.charAt(0) || "U"}
               </div>
            </div>
          </div>
        </header>

        {/* Scrollable Page Content */}
        <div className="flex-1 overflow-y-auto pt-4 md:pt-8 p-4 lg:p-8 relative">
          {children}
        </div>
        
        {/* Support Drawer */}
        <WebChatWidget user={user} />
        
        {/* SIP Cloud Dialer */}
        {user?.id && (
          <SipDialer userId={user?.id} merchantStoreId={user?.merchantStoreId} />
        )}

        {/* Elite Staff Activity Tracker */}
        {user?.id && (
          <StaffTracker userId={user?.id} merchantStoreId={user?.merchantStoreId!} />
        )}
        {/* Global Staff Chat Listener & Bar */}
        {user && (user.role === "MERCHANT" || user.role === "STAFF") && (
          <GlobalChatFloatingBar userId={user.id} merchantStoreId={user.merchantStoreId} userName={user.name} />
        )}
      </main>
    </div>
  );
}
