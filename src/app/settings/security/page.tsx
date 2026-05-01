import React from "react";
import { db as prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { TwoFactorSetup } from "@/components/auth/TwoFactorSetup";
import { ShieldCheck, Lock, History } from "lucide-react";

export default async function SecuritySettingsPage() {
  const session = await getSession();
  if (!session || !session.userId) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { isTwoFactorEnabled: true }
  });

  if (!user) redirect("/login");

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black text-[#0F172A] tracking-tight">Account Security</h1>
        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Manage your authentication and security settings</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          {/* Two Factor Authentication Section */}
          <TwoFactorSetup isEnabledInitial={user.isTwoFactorEnabled} />

          {/* Password Change Section (Placeholder for future) */}
          <div className="bg-white border border-gray-100 rounded-3xl p-8 space-y-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-[#0F172A]">Login Password</h3>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-tight">Last changed: Recently</p>
              </div>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              We recommend using a unique password that you don't use for other online services.
            </p>
            <button className="px-6 py-3 bg-white border border-gray-100 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-50 transition-all">
              Change Password
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-[#1E40AF] rounded-[32px] p-8 text-white space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
            <ShieldCheck className="w-12 h-12 text-[#BEF264]" />
            <h3 className="text-xl font-black leading-tight">Your account is safe with us.</h3>
            <p className="text-xs font-medium text-blue-100 leading-relaxed">
              We use industry-standard encryption and security protocols to protect your business data.
            </p>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider">
                <div className="w-1.5 h-1.5 bg-[#BEF264] rounded-full" /> 256-bit AES Encryption
              </li>
              <li className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider">
                <div className="w-1.5 h-1.5 bg-[#BEF264] rounded-full" /> Distributed Cloud Infra
              </li>
              <li className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider">
                <div className="w-1.5 h-1.5 bg-[#BEF264] rounded-full" /> Zero-Trust Architecture
              </li>
            </ul>
          </div>

          <div className="bg-white border border-gray-100 rounded-3xl p-6 space-y-4 shadow-sm">
             <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#0F172A]">
               <History className="w-4 h-4 text-indigo-500" /> Recent Activity
             </div>
             <div className="space-y-4">
                <div className="flex items-start gap-3">
                   <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5" />
                   <div>
                      <p className="text-[10px] font-bold text-[#0F172A]">Successful Login</p>
                      <p className="text-[9px] text-gray-400">Windows • Chrome • Just now</p>
                   </div>
                </div>
                <div className="flex items-start gap-3 opacity-50">
                   <div className="w-2 h-2 bg-gray-300 rounded-full mt-1.5" />
                   <div>
                      <p className="text-[10px] font-bold text-[#0F172A]">Security Settings Updated</p>
                      <p className="text-[9px] text-gray-400">Windows • Chrome • 1 hour ago</p>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
