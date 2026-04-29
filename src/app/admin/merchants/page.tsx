import React from "react";
import { db as prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Users, Store, ShieldCheck, Settings, CreditCard, MessageSquare, Phone } from "lucide-react";
import { ActivationButton } from "./ActivationButton";

export default async function AdminMerchantsPage() {
  const session = await getSession();
  if (!session || session.role !== "SUPER_ADMIN") redirect("/login");

  const merchants = await prisma.merchantStore.findMany({
    include: {
        _count: { select: { users: true, orders: true } }
    },
    orderBy: { createdAt: "desc" }
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
         {merchants.map((m) => (
           <div key={m.id} className={`bg-white border rounded-[40px] p-8 space-y-8 shadow-sm hover:shadow-2xl transition-all group ${m.activationStatus === "PENDING" ? "border-amber-200 ring-4 ring-amber-50" : "border-slate-100"}`}>
              <div className="flex items-start justify-between">
                 <div className="w-16 h-16 rounded-[24px] bg-slate-900 flex items-center justify-center text-white text-2xl font-black italic shadow-xl">
                    {m.name.charAt(0)}
                 </div>
                 <div className="flex flex-col items-end gap-2">
                    <span className={`px-4 py-1.5 text-[10px] font-black rounded-full uppercase tracking-widest ${
                       m.activationStatus === "ACTIVE" ? "bg-green-50 text-green-600" :
                       m.activationStatus === "PENDING" ? "bg-amber-50 text-amber-600" :
                       "bg-red-50 text-red-600"
                    }`}>
                       {m.activationStatus || m.plan}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">ID: {m.id.slice(-6).toUpperCase()}</span>
                 </div>
              </div>

              <div>
                 <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase italic">{m.name}</h3>
                 <p className="text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{m.slug}.businessconnect.bd</p>
                 {m.businessType && <p className="text-[10px] font-black text-blue-600 uppercase mt-2">Type: {m.businessType}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="bg-slate-50 p-4 rounded-2xl">
                    <div className="flex items-center gap-2 text-slate-400 mb-1">
                       <MessageSquare className="w-3 h-3" />
                       <span className="text-[9px] font-black uppercase">SMS Credits</span>
                    </div>
                    <div className="text-lg font-black text-slate-900 tracking-tighter">৳{m.smsBalance.toLocaleString()}</div>
                 </div>
                 <div className="bg-slate-50 p-4 rounded-2xl">
                    <div className="flex items-center gap-2 text-slate-400 mb-1">
                       <Phone className="w-3 h-3" />
                       <span className="text-[9px] font-black uppercase">SIP Minutes</span>
                    </div>
                    <div className="text-lg font-black text-slate-900 tracking-tighter">{m.sipBalance.toLocaleString()}</div>
                 </div>
              </div>

              {m.activationStatus === "PENDING" && (
                <div className="space-y-4">
                   <div className="flex gap-2">
                      {m.tradeLicenseUrl && <div className="text-[8px] font-black uppercase px-2 py-1 bg-slate-100 rounded text-slate-500">Trade License</div>}
                      {m.nidFrontUrl && <div className="text-[8px] font-black uppercase px-2 py-1 bg-slate-100 rounded text-slate-500">NID Front</div>}
                      {m.nidBackUrl && <div className="text-[8px] font-black uppercase px-2 py-1 bg-slate-100 rounded text-slate-500">NID Back</div>}
                   </div>
                   <ActivationButton storeId={m.id} />
                </div>
              )}

              <div className="pt-8 border-t border-slate-50 flex items-center justify-between">
                 <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                       <span className="text-[10px] font-black text-slate-900">{m._count.orders}</span>
                       <span className="text-[8px] font-bold text-slate-400 uppercase">Orders</span>
                    </div>
                    <div className="w-px h-6 bg-slate-100" />
                    <div className="flex flex-col">
                       <span className="text-[10px] font-black text-slate-900">{m._count.users}</span>
                       <span className="text-[8px] font-bold text-slate-400 uppercase">Staff</span>
                    </div>
                 </div>
                 <Link 
                   href={`/admin/merchants/${m.id}`}
                   className="p-3 bg-slate-900 text-white rounded-2xl hover:scale-110 active:scale-95 transition-all shadow-lg"
                 >
                    <Settings className="w-5 h-5" />
                 </Link>
              </div>
           </div>
         ))}
      </div>
    </div>
  );
}
