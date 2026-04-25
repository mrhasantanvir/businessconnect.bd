import React from "react";
import { db as prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Globe, FileSpreadsheet } from "lucide-react";
import { GoogleSheetsSettingsForm } from "./GoogleSheetsSettingsForm";

export default async function GoogleSheetsSettingsPage() {
  const session = await getSession();
  if (!session || !session.merchantStoreId) redirect("/login");

  const config = await prisma.googleSheetsConfig.findUnique({
    where: { merchantStoreId: session.merchantStoreId }
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-8 border-b border-gray-100 ">
         <div>
            <h1 className="text-4xl font-black tracking-tight text-[#0F172A]  uppercase italic">
               Google <span className="text-emerald-600">Sync</span> Engine
            </h1>
            <p className="text-[#64748B]  text-sm font-bold mt-2 uppercase tracking-widest flex items-center gap-2">
               <Globe className="w-4 h-4 text-emerald-500" /> Professional Multi-Tenant Reporting
            </p>
         </div>
      </div>

      <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-6 relative overflow-hidden">
         <div className="absolute right-0 top-0 opacity-10 pointer-events-none text-emerald-900 leading-none">
            <FileSpreadsheet className="w-48 h-48 -mt-6 -mr-6" />
         </div>
         <h2 className="font-extrabold text-emerald-900 mb-2 z-10 relative">Cloud Spreadsheet Integration</h2>
         <p className="text-xs text-emerald-800 z-10 relative max-w-2xl leading-relaxed font-medium">
            Connect your shop to Google Sheets to export live order data, analyze performance in real-time, or share logistical reports with external partners. Our shared app architecture handles the security, while you control the data.
         </p>
      </div>

      <GoogleSheetsSettingsForm config={config} />
      
    </div>
  );
}

