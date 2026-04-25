import React from "react";
import { db as prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { 
  BrainCircuit, 
  Wallet, 
  FileUp, 
  Facebook, 
  Settings2, 
  RefreshCcw, 
  CheckCircle2, 
  AlertCircle,
  Plus
} from "lucide-react";
import Link from "next/link";

export default async function MerchantAiHubPage() {
  const session = await getSession();
  if (!session || !session.merchantStoreId) redirect("/login");

  const store = await prisma.merchantStore.findUnique({
    where: { id: session.merchantStoreId },
    include: { 
       knowledgeBase: true,
       facebookConfig: true
    }
  });

  if (!store) return <div>Auth required.</div>;

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      <div className="flex items-center justify-between">
         <div className="space-y-1">
            <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-widest">
               <BrainCircuit className="w-3.5 h-3.5" /> Commerce Intelligence
            </div>
            <h1 className="text-4xl font-extrabold text-[#0F172A] tracking-tight">AI Workspace</h1>
         </div>
         <button className="px-6 py-3 bg-white text-slate-900 text-slate-900 text-slate-900 border border-slate-100 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-2">
            <Plus className="w-4 h-4" /> Top-up Credits
         </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* AI Wallet & Status */}
         <div className="bg-white  border border-[#E5E7EB]  p-8 rounded-[48px] shadow-sm space-y-8 flex flex-col justify-between">
            <div className="space-y-6">
               <div className="flex items-center justify-between border-b border-gray-50  pb-4">
                  <h3 className="text-xl font-black flex items-center gap-3">
                    <Wallet className="w-5 h-5 text-indigo-500" /> AI Balance
                  </h3>
                  <RefreshCcw className="w-4 h-4 text-gray-300 animate-spin-slow cursor-pointer" />
               </div>
               <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Available Units</div>
                  <div className="text-5xl font-black text-[#0F172A]  tracking-tight">
                    {store.aiBalance.toLocaleString()}
                  </div>
               </div>
            </div>
            <div className="bg-indigo-50  p-4 rounded-3xl border border-indigo-100 ">
               <p className="text-[10px] font-medium text-indigo-700  leading-relaxed">
                  Every ChatGPT-4o response consumes **{store.aiRate} Credit**. <br/>
                  Image Recognition consumes **5 Credits**.
               </p>
            </div>
         </div>

         {/* Knowledge Base Training */}
         <div className="lg:col-span-2 bg-white  border border-[#E5E7EB]  p-8 rounded-[48px] shadow-sm space-y-8">
            <div className="flex items-center justify-between border-b border-gray-50  pb-4">
               <h3 className="text-xl font-black flex items-center gap-3">
                 <FileUp className="w-5 h-5 text-indigo-500" /> Training Documents
               </h3>
               <button className="text-[10px] font-black uppercase text-indigo-600  flex items-center gap-1">
                  Upload PDF <Plus className="w-3 h-3" />
               </button>
            </div>

            <div className="space-y-3">
               {store.knowledgeBase.map(doc => (
                 <div key={doc.id} className="flex items-center justify-between p-4 bg-[#F8F9FA]  rounded-2xl border border-transparent hover:border-indigo-100 transition-all">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 bg-white  rounded-xl flex items-center justify-center border border-gray-100 ">
                          <FileUp className="w-5 h-5 text-gray-400" />
                       </div>
                       <div>
                          <div className="text-sm font-bold text-[#0F172A]  truncate max-w-[200px]">{doc.fileName}</div>
                          <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{doc.fileType} • {new Date(doc.createdAt).toLocaleDateString()}</div>
                       </div>
                    </div>
                    {doc.isIndexed ? (
                      <div className="flex items-center gap-2 text-green-500 text-[10px] font-black uppercase tracking-widest">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Trained
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-orange-500 text-[10px] font-black uppercase tracking-widest">
                        <RefreshCcw className="w-3.5 h-3.5 animate-spin" /> Indexing
                      </div>
                    )}
                 </div>
               ))}
               {store.knowledgeBase.length === 0 && (
                 <div className="py-20 text-center space-y-3 opacity-30">
                    <FileUp className="w-10 h-10 mx-auto" />
                    <p className="text-xs font-bold uppercase tracking-widest">No training data provided yet.</p>
                 </div>
               )}
            </div>
         </div>
      </div>

      {/* Facebook Automation Panel */}
      <div className="bg-white border border-[#E5E7EB] p-10 rounded-[64px] shadow-sm space-y-8 relative overflow-hidden">
         <div className="flex items-center justify-between border-b border-gray-100 pb-6 relative z-10">
            <div className="flex items-center gap-3">
               <div className="p-3 bg-indigo-50 rounded-2xl">
                  <Facebook className="w-6 h-6 text-indigo-600" />
               </div>
               <div>
                  <h2 className="text-2xl font-black tracking-tighter text-slate-900">Facebook Commerce Swarm</h2>
                  <p className="text-xs text-slate-500 font-medium">Automatic comment Filtering & AI Auto-Reply active.</p>
               </div>
            </div>
            <button className="px-6 py-3 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-indigo-600/20 active:scale-95 transition-all">
               Connect Page
            </button>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
            <div className="bg-slate-50 border border-slate-100 p-6 rounded-3xl flex items-center justify-between group hover:bg-slate-100 transition-all cursor-pointer">
               <div>
                  <div className="text-xs font-bold mb-1 text-slate-900">Comment Auto-Reply</div>
                  <div className="text-[9px] text-slate-500 font-medium tracking-wide">Reply dynamically using AI trained context.</div>
               </div>
               <Settings2 className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
            </div>
            <div className="bg-slate-50 border border-slate-100 p-6 rounded-3xl flex items-center justify-between group hover:bg-slate-100 transition-all cursor-pointer">
               <div>
                  <div className="text-xs font-bold mb-1 text-slate-900">Keyword-to-DM</div>
                  <div className="text-[9px] text-slate-500 font-medium tracking-wide">Trigger private messages based on comment keywords.</div>
               </div>
               <Settings2 className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
            </div>
            <div className="bg-slate-50 border border-slate-100 p-6 rounded-3xl flex items-center justify-between group hover:bg-slate-100 transition-all cursor-pointer">
               <div>
                  <div className="text-xs font-bold mb-1 text-slate-900">Vision Link Ordering</div>
                  <div className="text-[9px] text-slate-500 font-medium tracking-wide">Search inventory via AI scan of customer photos.</div>
               </div>
               <Settings2 className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
            </div>
         </div>
      </div>
    </div>
  );
}
