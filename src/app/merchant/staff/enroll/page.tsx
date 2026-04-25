import React from "react";
import { db as prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { UserPlus, ArrowLeft } from "lucide-react";
import { StaffForm } from "../StaffForm";
import Link from "next/link";

export default async function StaffEnrollPage() {
  const session = await getSession();
  if (!session || !session.merchantStoreId) redirect("/login");

  const branches = await prisma.branch.findMany({
    where: { merchantStoreId: session.merchantStoreId }
  });

  const roles = await prisma.role.findMany({
    where: { merchantStoreId: session.merchantStoreId }
  });

  return (
    <div className="w-full max-w-3xl mx-auto space-y-8 animate-in slide-in-from-bottom-10 duration-700 pb-20">
      <div className="flex items-center justify-between">
        <Link href="/merchant/staff" className="flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors group">
          <div className="w-10 h-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-all">
            <ArrowLeft className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest">Back to Directory</span>
        </Link>
      </div>

      <div className="text-center space-y-2">
        <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase italic">Personnel Enrollment</h1>
        <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em]">Recruit and deploy new operational units to your fleet.</p>
      </div>

      <StaffForm branches={branches} roles={roles} />
    </div>
  );
}
