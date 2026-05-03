import React from "react";
import { getSession } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { AdminSettingsUI } from "@/components/admin/AdminSettingsUI";

export default async function AdminSettingsTabPage({ params }: { params: any }) {
  const { tab } = await params;
  const session = await getSession();
  
  // Security check: Only SUPER_ADMIN can configure system settings
  if (!session || session.role !== "SUPER_ADMIN") {
    redirect("/login");
  }

  const validTabs = [
    "general", "sms", "realtime", "mail", "whatsapp", 
    "pricing", "google", "seo", "storage", "email-templates", "payments"
  ];

  if (tab === "ai") {
    redirect("/admin/ai-settings");
  }

  if (!validTabs.includes(tab)) {
    notFound();
  }

  // Map URL param to component Tab type
  const tabMap: Record<string, any> = {
    "general": "GENERAL",
    "sms": "SMS",
    "realtime": "REALTIME",
    "mail": "MAIL",
    "whatsapp": "WHATSAPP",
    "pricing": "PRICING",
    "google": "GOOGLE",
    "seo": "SEO",
    "storage": "STORAGE",
    "email-templates": "EMAIL_TEMPLATES",
    "payments": "PAYMENTS"
  };

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8">
      <AdminSettingsUI activeTab={tabMap[tab]} />
    </div>
  );
}
