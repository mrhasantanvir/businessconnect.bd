import React from "react";
import { db as prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Users, Store, ShieldCheck, Settings, CreditCard, MessageSquare, Phone, FileText, ExternalLink } from "lucide-react";
import { ActivationButton } from "./ActivationButton";
import Link from "next/link";
import { getMediaUrl } from "@/lib/utils/media";

export default async function AdminMerchantsPage() {
  const session = await getSession();
  if (!session || session.role !== "SUPER_ADMIN") redirect("/login");

  const merchants = await prisma.merchantStore.findMany({
    include: {
        _count: { select: { users: true, orders: true } }
    },
    orderBy: { createdAt: "desc" }
  });

  const settings = await prisma.systemSettings.findUnique({
    where: { id: "GLOBAL" }
  });

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20">
      <div className="flex items-end justify-between">
         <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 rounded-full">
               <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
               <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Platform Control</span>
            </div>
            <h1 className="text-5xl font-black tracking-tighter text-slate-900 uppercase italic">
               Merchant <span className="text-blue-600">Ecosystem</span>
            </h1>
         </div>
      </div>

      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase tracking-widest text-slate-400">
                <th className="p-6 font-black whitespace-nowrap">Merchant Identity</th>
                <th className="p-6 font-black whitespace-nowrap">Status</th>
                <th className="p-6 font-black whitespace-nowrap">Balances</th>
                <th className="p-6 font-black whitespace-nowrap">Metrics</th>
                <th className="p-6 font-black whitespace-nowrap">Documents</th>
                <th className="p-6 font-black text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {merchants.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/50 transition-colors group">
                  {/* Merchant Identity Column */}
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-[16px] bg-slate-900 flex items-center justify-center text-white text-xl font-black italic shadow-md shrink-0">
                        {m.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-black text-slate-900 tracking-tight uppercase italic flex items-center gap-2">
                           {m.name}
                           {m.businessType && <span className="text-[8px] px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full">{m.businessType}</span>}
                        </div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{m.slug}.businessconnect.bd</div>
                        <div className="text-[9px] font-bold text-slate-300 mt-1">ID: {m.id.slice(-6).toUpperCase()}</div>
                      </div>
                    </div>
                  </td>
                  
                  {/* Status Column */}
                  <td className="p-6">
                    <span className={`inline-flex px-3 py-1.5 text-[9px] font-black rounded-full uppercase tracking-widest ${
                       m.activationStatus === "ACTIVE" ? "bg-green-50 text-green-600 border border-green-100" :
                       m.activationStatus === "PENDING" ? "bg-amber-50 text-amber-600 border border-amber-100" :
                       "bg-red-50 text-red-600 border border-red-100"
                    }`}>
                       {m.activationStatus || m.plan}
                    </span>
                  </td>

                  {/* Balances Column */}
                  <td className="p-6">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                         <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                         <span className="text-xs font-black text-slate-700 tracking-tighter">৳{m.smsBalance.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                         <Phone className="w-3.5 h-3.5 text-slate-400" />
                         <span className="text-xs font-black text-slate-700 tracking-tighter">{m.sipBalance.toLocaleString()}</span>
                      </div>
                    </div>
                  </td>

                  {/* Metrics Column */}
                  <td className="p-6">
                    <div className="flex items-center gap-5">
                      <div className="flex flex-col">
                         <span className="text-sm font-black text-slate-900">{m._count.orders}</span>
                         <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Orders</span>
                      </div>
                      <div className="w-px h-6 bg-slate-200" />
                      <div className="flex flex-col">
                         <span className="text-sm font-black text-slate-900">{m._count.users}</span>
                         <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Staff</span>
                      </div>
                    </div>
                  </td>

                  {/* Documents Column */}
                  <td className="p-6">
                    <div className="flex flex-col gap-2">
                       {m.tradeLicenseUrl && (
                         <a href={m.tradeLicenseUrl === "mock_id" ? "#" : getMediaUrl(m.tradeLicenseUrl, settings?.storageCdnUrl)} target={m.tradeLicenseUrl === "mock_id" ? "_self" : "_blank"} rel="noopener noreferrer" className="text-[9px] font-black uppercase px-2 py-1.5 bg-blue-50 hover:bg-blue-100 rounded-lg text-blue-600 flex items-center gap-1.5 w-max transition-colors">
                           <FileText className="w-3 h-3" /> Trade License <ExternalLink className="w-2.5 h-2.5" />
                         </a>
                       )}
                       {m.nidFrontUrl && (
                         <a href={m.nidFrontUrl === "mock_id" ? "#" : getMediaUrl(m.nidFrontUrl, settings?.storageCdnUrl)} target={m.nidFrontUrl === "mock_id" ? "_self" : "_blank"} rel="noopener noreferrer" className="text-[9px] font-black uppercase px-2 py-1.5 bg-blue-50 hover:bg-blue-100 rounded-lg text-blue-600 flex items-center gap-1.5 w-max transition-colors">
                           <FileText className="w-3 h-3" /> NID Front <ExternalLink className="w-2.5 h-2.5" />
                         </a>
                       )}
                       {m.nidBackUrl && (
                         <a href={m.nidBackUrl === "mock_id" ? "#" : getMediaUrl(m.nidBackUrl, settings?.storageCdnUrl)} target={m.nidBackUrl === "mock_id" ? "_self" : "_blank"} rel="noopener noreferrer" className="text-[9px] font-black uppercase px-2 py-1.5 bg-blue-50 hover:bg-blue-100 rounded-lg text-blue-600 flex items-center gap-1.5 w-max transition-colors">
                           <FileText className="w-3 h-3" /> NID Back <ExternalLink className="w-2.5 h-2.5" />
                         </a>
                       )}
                    </div>
                  </td>

                  {/* Actions Column */}
                  <td className="p-6">
                    <div className="flex items-center justify-end gap-3">
                       {m.activationStatus === "PENDING" && (
                         <ActivationButton storeId={m.id} />
                       )}
                       <Link href={`/admin/merchants/${m.id}/settings`} className="p-3 bg-slate-900 text-white rounded-xl hover:scale-110 active:scale-95 transition-all shadow-md">
                          <Settings className="w-4 h-4" />
                       </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
