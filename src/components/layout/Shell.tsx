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
  X,
  Settings,
  User
} from "lucide-react";
import { FileSpreadsheet } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { SipDialer } from "../dialer/SipDialer";
import { logoutAction } from "@/app/login/actions";
import { WebChatWidget } from "../chat/WebChatWidget";
import { useSupport } from "@/context/SupportContext";
import { useLanguage } from "@/context/LanguageContext";
import { Providers } from "./Providers";
import { UserDropdown } from "./new_ui/header/HeaderComponents";
import { ActivationCelebration } from "../merchant/ActivationCelebration";


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
  const router = useRouter();

  useEffect(() => {
    if (user?.activationStatus === "STAFF_ONBOARDING" && !pathname.startsWith("/staff/onboarding")) {
       router.push("/staff/onboarding");
    }

    if ((user?.role === "MERCHANT" || user?.role === "STAFF") && user?.activationStatus && user.activationStatus !== "ACTIVE") {
       const allowedPaths = ["/dashboard", "/merchant/settings/documents", "/settings/profile"];
       if (!allowedPaths.includes(pathname)) {
          router.push("/dashboard");
       }
    }
  }, [user, pathname, router]);

  const role = user?.role || "MERCHANT";
  const isInactiveStore = (user?.role === "MERCHANT" || user?.role === "STAFF") && user?.activationStatus && user.activationStatus !== "ACTIVE";

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
        { icon: Database, label: t("data_insights"), roles: ["MERCHANT"], permission: "reports:view", subItems: [
           { label: t("live_reports"), href: "/merchant/reports" },
           { label: t("vat_compliance"), href: "/merchant/reports/vat" },
        ]},
      ]
    },
    {
      group: t("commercial"),
      items: [
        { icon: ShoppingBag, label: t("orders"), href: "/orders", roles: ["MERCHANT", "STAFF"], permission: "orders:view" },
        { icon: CreditCard, label: t("pos"), href: "/merchant/pos", roles: ["MERCHANT", "STAFF"], permission: "pos:access" },
        { icon: Zap, label: "Flash Discount", href: "/merchant/campaigns/flash-sales", roles: ["MERCHANT", "STAFF"], permission: "inventory:manage" },
        { icon: FolderTree, label: t("catalog"), roles: ["MERCHANT", "STAFF"], permission: "inventory:manage", subItems: [
           { label: t("products"), href: "/products/add" },
           { label: "Categories", href: "/merchant/catalog/categories" },
           { label: "Brands", href: "/merchant/catalog/brands" },
        ]},
      ]
    },
    {
      group: t("logistics_wms"),
      items: [
        { icon: Warehouse, label: t("warehouse_hub"), href: "/merchant/inventory/warehouses", roles: ["MERCHANT", "STAFF"], permission: "inventory:manage" },
        { icon: ShieldCheck, label: "Tax & VAT", href: "/merchant/settings/tax", roles: ["MERCHANT", "STAFF"], permission: "inventory:manage" },
        { icon: Box, label: t("inventory"), roles: ["MERCHANT", "STAFF"], permission: "inventory:manage", subItems: [
           { label: "Stock Levels", href: "/merchant/wms/inventory" },
           { label: "COD Reconciliation", href: "/merchant/logistics/cod-reconciliation" },
           { label: "Transfers", href: "/merchant/wms/transfers" },
           { label: "Return Hub", href: "/merchant/wms/returns" },
           { label: "Damage Logs", href: "/merchant/wms/damage-report" },
        ]},
        { icon: Truck, label: t("delivery_setup"), href: "/merchant/logistics", roles: ["MERCHANT", "STAFF"], permission: "inventory:manage" },
      ]
    },
    {
      group: t("growth_ai"),
      items: [
         { icon: Megaphone, label: t("marketing"), roles: ["MERCHANT", "STAFF"], permission: "inventory:manage", subItems: [
            { label: "Campaigns", href: "/merchant/campaigns" },
            { label: "Facebook Ads", href: "/merchant/marketing/facebook" },
            { label: t("automation"), href: "/merchant/campaigns/marketing-automation" },
         ]},
        { icon: BrainCircuit, label: t("ai_hub"), href: "/merchant/ai-hub", roles: ["MERCHANT", "STAFF"], permission: "inventory:manage" },
        { icon: Globe, label: t("social_connect"), href: "/merchant/social", roles: ["MERCHANT", "STAFF"], permission: "inventory:manage" },
      ]
    },
    {
        group: t("communications"),
        items: [
          { icon: MessageSquare, label: t("inbox"), href: "/merchant/inbox", roles: ["MERCHANT", "STAFF"], permission: "customers:manage" },
          { icon: Star, label: "Customer Reviews", href: "/merchant/reviews", roles: ["MERCHANT", "STAFF"], permission: "customers:manage" },
          { icon: PhoneCall, label: t("cloud_dialer"), href: "#", roles: ["MERCHANT", "STAFF"], permission: "customers:manage" },
          { icon: Users, label: t("customer_crm"), href: "/merchant/customers", roles: ["MERCHANT", "STAFF"], permission: "customers:manage" },
      ]
    },
    {
      group: t("administration"),
      items: [
        { icon: Shield, label: "Admin Pulse", href: "/admin", roles: ["SUPER_ADMIN"] },
        { icon: Store, label: "Merchant Ecosystem", href: "/admin/merchants", roles: ["SUPER_ADMIN"] },
        { icon: Cpu, label: "Global AI", href: "/admin/ai-settings", roles: ["SUPER_ADMIN"] },
        { icon: Activity, label: "Revenue & Billing", href: "/admin/billing", roles: ["SUPER_ADMIN"] },
        { icon: Zap, label: "System Updates", href: "/admin/system/update", roles: ["SUPER_ADMIN"] },
        { icon: Settings, label: "Global Settings", href: "/admin/settings/general", roles: ["SUPER_ADMIN"] },
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
        { icon: Building2, label: "Branches", href: "/merchant/branches", roles: ["MERCHANT"] },
        { icon: Users, label: t("staff_management"), href: "/merchant/staff", roles: ["MERCHANT"] },
        { icon: Layout, label: "Task Hub", href: "/merchant/tasks", roles: ["MERCHANT", "STAFF"], permission: "orders:view" },
        { icon: Wallet, label: "Accounting", href: "/merchant/accounting", roles: ["MERCHANT"] },
      ]
    },
    {
       group: "Support Hub",
       items: [
         { icon: MessageSquare, label: "Customer Care", href: "/support", roles: ["MERCHANT", "STAFF"], permission: "orders:view" },
         { icon: AlertCircle, label: "Tickets", href: "/support/incidents", roles: ["MERCHANT", "STAFF"], permission: "orders:view" },
         { icon: PhoneCall, label: "Platform Chat", href: "/support/platform-chat", roles: ["MERCHANT", "STAFF"], permission: "orders:view" },
       ]
    },
    {
       group: "Account Security",
       items: [
         { icon: User, label: "Profile & Security", href: "/settings/profile", roles: ["MERCHANT", "SUPER_ADMIN", "STAFF"] },
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

  if (user?.isActive === false) {
    return (
      <div className="fixed inset-0 bg-white z-[9999] flex items-center justify-center p-6 text-center">
         <div className="max-w-md space-y-4">
            <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-none flex items-center justify-center mx-auto mb-6 shadow-sm border border-rose-100">
               <Shield className="w-8 h-8" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-none">
               Account <span className="text-rose-600">Restricted</span>
            </h1>
            <p className="text-slate-500 font-medium text-xs leading-relaxed">
               আপনার অ্যাকাউন্টটি বর্তমানে ডি-অ্যাক্টিভ অবস্থায় আছে। পুনরায় অ্যাক্টিভ করার জন্য অনুগ্রহ করে আপনার শপ ওনার বা অ্যাডমিনের সাথে যোগাযোগ করুন।
            </p>
            <div className="pt-4">
               <button 
                 onClick={() => logoutAction()}
                 className="inline-flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white font-semibold text-xs rounded-none hover:bg-slate-800 transition-all shadow-sm"
               >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out Securely
               </button>
            </div>
         </div>
      </div>
    );
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
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-[#E5E7EB] flex items-center justify-between px-4 z-40">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-[#1E40AF] rounded-[2px] flex items-center justify-center">
            <Box className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-xs uppercase tracking-tight">Business<span className="text-[#1E40AF]">Connect</span></span>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-1.5 hover:bg-gray-100 rounded-none transition-all"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
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
        <div className="h-14 flex items-center px-4 border-b border-[#E5E7EB]">
          <div className="w-7 h-7 bg-[#1E40AF] rounded-[2px] flex items-center justify-center shadow-sm">
            <Box className="w-4 h-4 text-white" />
          </div>
          {(isSidebarExpanded || isMobileMenuOpen) && (
            <span className="ml-2.5 font-bold text-xs text-[#0F172A] uppercase tracking-tight flex-1">
              Business<span className="text-[#1E40AF]">Connect</span> <span className="text-[8px] bg-indigo-100 px-1 rounded">V2.1</span>
            </span>
          )}
          {isMobileMenuOpen && (
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden p-1.5 text-gray-400 hover:text-red-500 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <nav className={cn("flex-1 py-4 flex flex-col gap-1 px-3 overflow-y-auto", isInactiveStore && "pointer-events-none opacity-40 select-none grayscale")}>
          {NAVIGATION.map((group) => {
            
            const visibleItems = group.items.filter(item => {
              if (!item.roles) return false;
              
              // 1. Basic Role Check
              const hasRole = item.roles.includes(role);
              if (!hasRole) return false;

              // 2. Strict Permission Check for STAFF or anyone with a Custom Role
              // If a user has a custom role, they MUST be restricted by permissions
              const isRestricted = role === "STAFF" || user?.customRoleId;
              
              if (isRestricted) {
                // If the item is primarily for MERCHANTS but allows STAFF, 
                // it MUST have a permission key to be visible to STAFF.
                // If it doesn't have a permission key, we assume it's MERCHANT-only.
                if (item.permission) {
                   return user.permissions?.includes(item.permission);
                }
                
                // If no permission key but user is restricted, only allow if item is NOT merchant-only
                // Actually, if it's a restricted user, we only show items they have explicit permission for
                // or common items that don't need protection (but most sidebar items do).
                
                // To be safe: if an item has NO permission key but allows STAFF, 
                // we only show it if the user is NOT restricted.
                // UNLESS it's a basic item (we can add a list of basic items if needed).
                
                // For now, if restricted, and item has no permission key, hide it if it's a merchant-level feature
                if (item.roles.includes("MERCHANT") && !item.permission) {
                   return false;
                }
              }

              // Owners and Super Admins (without custom roles) see everything allowed for their role
              if (role === "SUPER_ADMIN" || (role === "MERCHANT" && !user?.customRoleId)) return true;

              return true;
            });
            
            if (visibleItems.length === 0) return null;

            return (
              <div key={group.group} className="mb-2">
                {(isSidebarExpanded || isMobileMenuOpen) && (
                  <div className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                    {group.group}
                  </div>
                )}
                
                <div className="space-y-0.5">
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
                              "w-full flex items-center gap-2.5 px-3 py-1.5 rounded-none transition-all group relative",
                              isActive 
                                ? "bg-indigo-50 text-indigo-700" 
                                : "text-slate-700 hover:bg-gray-50"
                            )}
                          >
                            <item.icon className="w-4 h-4 flex-shrink-0" />
                            {(isSidebarExpanded || isMobileMenuOpen) && (
                              <>
                                <span className={cn("flex-1 text-[13px] font-medium text-left", language === 'bn' && "text-sm")}>{item.label}</span>
                                {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
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
                              "flex items-center gap-2.5 px-3 py-1.5 rounded-none transition-all group relative",
                              isActive 
                                ? "bg-slate-100 text-slate-900 border-l-2 border-slate-900 shadow-sm" 
                                : "text-slate-700 hover:bg-gray-50"
                            )}
                          >
                             <item.icon className="w-4 h-4 flex-shrink-0" />
                             {(isSidebarExpanded || isMobileMenuOpen) && (
                               <div className="flex-1 flex items-center justify-between">
                                 <span className={cn("text-[13px] font-medium", language === 'bn' && "text-sm")}>{item.label}</span>
                                 {item.label === "Merchant Ecosystem" && user?.adminNotifications > 0 && (
                                   <span className="bg-[#DC2626] text-white text-[10px] font-black px-1.5 py-0.5 rounded-none">
                                     {user.adminNotifications}
                                   </span>
                                 )}
                               </div>
                             )}
                             {!isSidebarExpanded && item.label === "Merchant Ecosystem" && user?.adminNotifications > 0 && (
                               <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#DC2626] text-white text-[9px] font-black flex items-center justify-center rounded-none border border-white">
                                 {user.adminNotifications}
                               </span>
                             )}
                          </Link>
                        )}

                        {/* Sub Items Rendering */}
                        {hasSubItems && isExpanded && (isSidebarExpanded || isMobileMenuOpen) && (
                          <div className="mt-0.5 ml-8 border-l border-gray-100 space-y-0.5 py-0.5">
                            {item.subItems?.map(sub => (
                              <Link
                                key={sub.label}
                                href={sub.href}
                                className={cn(
                                  "block px-3 py-1 text-[12px] font-medium transition-all relative",
                                  pathname === sub.href 
                                    ? "text-indigo-600 before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-1 before:bg-indigo-600 before:rounded-none before:-ml-[4px]"
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
          <div className={cn("px-8 py-3 flex items-center justify-between animate-in slide-in-from-top duration-500 border-b", user?.activationStatus === "BILLING_RESTRICTED" ? "bg-rose-50 border-rose-100" : "bg-[#FFFBEB] border-amber-100")}>
             <div className="flex items-center gap-3">
                <div className={cn("w-8 h-8 rounded-none flex items-center justify-center", user?.activationStatus === "BILLING_RESTRICTED" ? "bg-rose-100" : "bg-amber-100")}>
                   <AlertTriangle className={cn("w-4 h-4", user?.activationStatus === "BILLING_RESTRICTED" ? "text-rose-600" : "text-amber-600")} />
                </div>
                <div>
                   <h4 className={cn("text-[10px] font-black uppercase tracking-widest", user?.activationStatus === "BILLING_RESTRICTED" ? "text-rose-900" : "text-amber-900")}>
                      {user?.activationStatus === "PENDING" ? "Account Pending Activation" : 
                       user?.activationStatus === "BILLING_RESTRICTED" ? "Billing Overdue - Restricted Access" : "Activation Rejected"}
                   </h4>
                   <p className={cn("text-[10px] font-medium uppercase mt-0.5", user?.activationStatus === "BILLING_RESTRICTED" ? "text-rose-700" : "text-amber-700")}>
                      {user?.activationStatus === "PENDING" 
                         ? "Our admin team is reviewing your documents. You can add products but cannot take orders yet."
                         : user?.activationStatus === "BILLING_RESTRICTED" 
                         ? "You have overdue invoices. Please pay to restore full access to your store."
                         : "Please re-upload valid documents in the onboarding section."}
                   </p>
                </div>
             </div>
             <Link 
               href={user?.activationStatus === "BILLING_RESTRICTED" ? "/merchant/billing" : "/merchant/onboarding"} 
               className={cn("text-white text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-none transition-all shadow-sm", user?.activationStatus === "BILLING_RESTRICTED" ? "bg-rose-600 hover:bg-rose-700" : "bg-amber-600 hover:bg-amber-700")}
             >
                {user?.activationStatus === "PENDING" ? "View Submission" : 
                 user?.activationStatus === "BILLING_RESTRICTED" ? "Pay Now" : "Re-Onboard Now"}
             </Link>
          </div>
        )}
        {/* Transparent Glass-morphism Header */}
        <header className="h-14 w-full bg-white sticky top-0 z-40 flex items-center justify-between px-4 lg:px-8 border-b border-[#E5E7EB]/50 shrink-0">
          <div className="flex items-center gap-4 lg:hidden">
            {/* The actual mobile toggle is handled by the sticky header added earlier */}
          </div>

          {/* AI Omnibar */}
          <div className="flex-1 max-w-xl mx-auto flex items-center relative hidden md:flex h-full py-2.5">
            <div className="w-full h-full bg-gray-50/50 border border-[#E5E7EB] rounded-none px-3 flex items-center transition-all focus-within:bg-white focus-within:ring-1 focus-within:ring-indigo-600">
              <Search className="w-3.5 h-3.5 text-gray-400 mr-2" />
              <input 
                type="text" 
                placeholder={role === 'SUPER_ADMIN' ? 'Search merchants...' : 'Search system...'}
                className="flex-1 bg-transparent border-none outline-none text-[13px] text-[#0F172A] placeholder:text-gray-400"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 ml-auto lg:ml-0">
            {/* System Pulse Ticker */}
            <div className="hidden lg:flex items-center gap-1.5 bg-green-50 text-green-700 px-2 py-0.5 rounded-none text-[11px] font-medium border border-green-100">
              <span className="w-1 h-1 rounded-none bg-current animate-pulse"></span>
              System Active
            </div>

          <div className="flex items-center gap-1 mx-2">
            {/* Language Toggle */}
            <button 
              onClick={() => setLanguage(language === 'en' ? 'bn' : 'en')}
              className="px-2 py-1 text-[11px] font-semibold border border-slate-200 rounded-none hover:bg-slate-50 transition-all text-slate-600"
            >
              {language === 'en' ? 'BN' : 'EN'}
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

            <button className="p-1.5 text-gray-500 hover:bg-gray-50 rounded-none transition-colors relative">
              <Bell className="w-4 h-4" />
              {user?.adminNotifications > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-black flex items-center justify-center rounded-none border-2 border-white px-1">
                  {user.adminNotifications}
                </span>
              )}
              {user?.adminNotifications === 0 && (
                <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-none border border-white"></span>
              )}
            </button>
            
            <div className="ml-1">
               <UserDropdown user={user} />
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
        
        {/* Global Activation Celebration */}
        {user?.id && !user?.hasSeenCelebration && (
          <ActivationCelebration 
            userId={user.id}
            storeId={user.merchantStoreId}
            activationStatus={user.role === "MERCHANT" ? user.activationStatus || "PENDING" : "ACTIVE"}
            entityName={user.role === "SUPER_ADMIN" ? "BusinessConnect Admin Panel" : "the store"}
            role={user.role}
            hasSeenCelebration={user.hasSeenCelebration}
          />
        )}
      </main>
    </div>
  );
}
