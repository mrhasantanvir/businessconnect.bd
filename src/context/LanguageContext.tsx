"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "en" | "bn";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    dashboard: "Dashboard",
    orders: "Orders",
    products: "Products",
    customers: "Customers",
    logistics: "Logistics",
    pos: "POS Terminal",
    settings: "Settings",
    recharge: "Recharge Wallet",
    active_cart: "Active Cart",
    total_payable: "Total Payable",
    complete_checkout: "Complete Checkout",
    inventory: "Inventory",
    marketing: "Marketing",
    ai_hub: "AI Hub",
    inbox: "Inbox",
    marketing_automation: "Marketing Automation",
    automation: "Automation",
    total_sales: "Total Sales",
    total_orders: "Total Orders",
    new_customers: "New Customers",
    active_deliveries: "Active Deliveries",
    search_placeholder: "Search anything...",
    add_product: "Add Product",
    view_all: "View All",
    recent_orders: "Recent Orders",
    order_id: "Order ID",
    status: "Status",
    amount: "Amount",
    date: "Date",
    action: "Action",
    cash: "Cash",
    card: "Card",
    bkash: "bKash",
    nagad: "Nagad",
    payment_method: "Payment Method",
    customer_info: "Customer Info",
    phone: "Phone",
    name: "Name",
    subtotal: "Subtotal",
    tax: "Tax",
    discount: "Discount",
    grand_total: "Grand Total",
    order_details: "Order Details",
    fulfillment: "Fulfillment Status",
    manage: "Manage",
    awaiting_confirmation: "Awaiting Confirmation",
    book_courier: "Book Courier",
    shipping_config: "Shipping Configuration",
    inside_dhaka: "Inside Dhaka",
    outside_dhaka: "Outside Dhaka",
    sub_dhaka: "Sub-Dhaka",
    sync_config: "Sync Config",
    intelligence: "Intelligence",
    data_insights: "Data Insights",
    live_reports: "Live Reports",
    vat_compliance: "VAT Compliance",
    warehouse_hub: "Warehouse Hub",
    inventory_management: "Inventory Management",
    delivery_setup: "Delivery Setup",
    marketing_automation: "Marketing Automation",
    social_connect: "Social Connect",
    customer_crm: "Customer CRM",
    cloud_dialer: "Cloud Dialer",
    storefront_themes: "Storefront Themes",
    payment_gateways: "Payment Gateways",
    sms_gateways: "SMS Gateways",
    business_profile: "Business Profile",
    catalog: "Catalog",
    core_hub: "Core Hub",
    commercial: "Commercial",
    logistics_wms: "Logistics & WMS",
    growth_ai: "Growth & AI",
    communications: "Communications",
    administration: "Administration",
    staff_management: "Staff Management",
  },
  bn: {
    dashboard: "ড্যাশবোর্ড",
    orders: "অর্ডারসমূহ",
    products: "পণ্যসমূহ",
    customers: "গ্রাহকগণ",
    logistics: "লজিস্টিকস",
    pos: "পিওএস টার্মিনাল",
    settings: "সেটিংস",
    recharge: "রিচার্জ করুন",
    active_cart: "সক্রিয় কার্ট",
    total_payable: "মোট প্রদেয়",
    complete_checkout: "চেকআউট সম্পন্ন করুন",
    inventory: "ইনভেন্টরি",
    marketing: "মার্কেটিং",
    ai_hub: "এআই হাব",
    inbox: "ইনবক্স",
    marketing_automation: "মার্কেটিং অটোমেশন",
    automation: "অটোমেশন",
    total_sales: "মোট বিক্রয়",
    total_orders: "মোট অর্ডার",
    new_customers: "নতুন গ্রাহক",
    active_deliveries: "চলমান ডেলিভারি",
    search_placeholder: "যেকোনো কিছু খুঁজুন...",
    add_product: "পণ্য যোগ করুন",
    view_all: "সব দেখুন",
    recent_orders: "সাম্প্রতিক অর্ডারসমূহ",
    order_id: "অর্ডার আইডি",
    status: "অবস্থা",
    amount: "পরিমাণ",
    date: "তারিখ",
    action: "অ্যাকশন",
    cash: "নগদ",
    card: "কার্ড",
    bkash: "বিকাশ",
    nagad: "নগদ",
    payment_method: "পেমেন্ট পদ্ধতি",
    customer_info: "গ্রাহকের তথ্য",
    phone: "ফোন",
    name: "নাম",
    subtotal: "উপ-মোট",
    tax: "ট্যাক্স",
    discount: "ডিসকাউন্ট",
    grand_total: "সর্বমোট",
    order_details: "অর্ডারের বিবরণ",
    fulfillment: "ফুলফিলমেন্ট অবস্থা",
    manage: "ম্যানেজ করুন",
    awaiting_confirmation: "নিশ্চিতকরণের অপেক্ষায়",
    book_courier: "কুরিয়ার বুক করুন",
    shipping_config: "শিপিং কনফিগারেশন",
    inside_dhaka: "ঢাকার ভেতরে",
    outside_dhaka: "ঢাকার বাইরে",
    sub_dhaka: "ঢাকার পাশে",
    sync_config: "সিঙ্ক করুন",
    intelligence: "ইন্টেলিজেন্স",
    data_insights: "ডাটা ইনসাইটস",
    live_reports: "লাইভ রিপোর্টস",
    vat_compliance: "ভ্যাট কমপ্লায়েন্স",
    warehouse_hub: "ওয়ারহাউজ হাব",
    inventory_management: "ইনভেন্টরি ম্যানেজমেন্ট",
    delivery_setup: "ডেলিভারি সেটআপ",
    marketing_automation: "মার্কেটিং অটোমেশন",
    social_connect: "সোশ্যাল কানেক্ট",
    customer_crm: "কাস্টমার সিআরএম",
    cloud_dialer: "ক্লাউড ডায়ালার",
    storefront_themes: "স্টোরফ্রন্ট থিম",
    payment_gateways: "পেমেন্ট গেটওয়ে",
    sms_gateways: "এসএমএস গেটওয়ে",
    business_profile: "বিজনেস প্রোফাইল",
    catalog: "ক্যাটালগ",
    core_hub: "কোর হাব",
    commercial: "কমার্শিয়াল",
    logistics_wms: "লজিস্টিকস ও ডব্লিউএমএস",
    growth_ai: "গ্রোথ ও এআই",
    communications: "কমিউনিকেশনস",
    administration: "অ্যাডমিনিস্ট্রেশন",
    staff_management: "স্টাফ ম্যানেজমেন্ট",
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");

  // Load language from localStorage on mount
  useEffect(() => {
    const savedLang = localStorage.getItem("bc_lang") as Language;
    if (savedLang && (savedLang === "en" || savedLang === "bn")) {
      setLanguage(savedLang);
    }
  }, []);

  // Save language to localStorage when it changes
  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem("bc_lang", lang);
  };

  const t = (key: string) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
}
