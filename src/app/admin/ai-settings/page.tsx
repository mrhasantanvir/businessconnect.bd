import React from "react";
import { db as prisma } from "@/lib/db";
import { updateAiGlobalSettingsAction } from "./actions";
import { 
  Cpu, 
  Key, 
  Coins, 
  Activity, 
  ShieldCheck, 
  TrendingUp, 
  DollarSign,
  CloudLightning,
  BrainCircuit
} from "lucide-react";

export default async function AiSettingsPage() {
  const settings = await prisma.systemSettings.findUnique({ where: { id: "GLOBAL" } });

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      <div className="space-y-1">
         <div className="flex items-center gap-2 text-indigo-600  font-bold text-xs uppercase tracking-widest">
            <Cpu className="w-3.5 h-3.5" /> Platform Intelligence
         </div>
         <h1 className="text-4xl font-extrabold text-[#0F172A]  tracking-tight">AI Master Control</h1>
         <p className="text-[#64748B]  text-sm max-w-xl leading-relaxed">
            Configure global API keys and monetization rates for ChatGPT-4o and Google Vision AI services.
         </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Left Column: Master API Keys */}
         <div className="lg:col-span-2 bg-white  border border-[#E5E7EB]  p-10 rounded-[48px] shadow-sm space-y-8">
            <div className="flex items-center justify-between border-b border-gray-50  pb-6">
               <h2 className="text-2xl font-black flex items-center gap-3">
                 <Key className="w-6 h-6 text-indigo-500" /> API Gateway Keys
               </h2>
               <div className="bg-green-50 text-green-700   px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-100 ">
                 Secure Vault
               </div>
            </div>

            <form action={async (formData) => {
               "use server";
               await updateAiGlobalSettingsAction({
                 openaiApiKey: formData.get("openaiApiKey") as string,
                 openaiModel: formData.get("openaiModel") as string,
                 openRouterKey: formData.get("openRouterKey") as string,
                 openRouterModel: formData.get("openRouterModel") as string,
                 geminiKey: formData.get("geminiKey") as string,
                 geminiModel: formData.get("geminiModel") as string,
                 aiProviderPriority: formData.get("aiProviderPriority") as string,
                 googleVisionKey: formData.get("googleVisionKey") as string,
                 fbAppSecret: formData.get("fbAppSecret") as string,
                 aiCreditPrice: parseFloat(formData.get("aiCreditPrice") as string)
               });
            }} className="space-y-12">
               
               {/* Provider 1: OpenRouter (Primary) */}
               <div className="space-y-6 bg-[#F8F9FA]  p-8 rounded-[32px] border border-gray-100 ">
                  <div className="flex items-center justify-between">
                     <h3 className="text-lg font-black flex items-center gap-2">
                        <CloudLightning className="w-5 h-5 text-indigo-500" /> OpenRouter (High Availability)
                     </h3>
                     <span className="text-[10px] font-black uppercase text-indigo-400">Primary Provider</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">API Key</label>
                        <input 
                           name="openRouterKey"
                           type="password"
                           defaultValue={settings?.openRouterKey || ""}
                           placeholder="sk-or-v1-..." 
                           className="w-full bg-white  border border-transparent focus:border-indigo-500 rounded-2xl px-5 py-4 text-xs font-bold outline-none transition-all" 
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Preferred Model</label>
                        <input 
                           name="openRouterModel"
                           type="text"
                           defaultValue={settings?.openRouterModel || "openai/gpt-3.5-turbo"}
                           placeholder="e.g. anthropic/claude-3-opus" 
                           className="w-full bg-white  border border-transparent focus:border-indigo-500 rounded-2xl px-5 py-4 text-xs font-bold outline-none transition-all" 
                        />
                     </div>
                  </div>
               </div>

               {/* Provider 2: OpenAI (Secondary) */}
               <div className="space-y-6 bg-[#F8F9FA]  p-8 rounded-[32px] border border-gray-100 ">
                  <div className="flex items-center justify-between">
                     <h3 className="text-lg font-black flex items-center gap-2">
                        <Cpu className="w-5 h-5 text-green-500" /> OpenAI Native
                     </h3>
                     <span className="text-[10px] font-black uppercase text-green-400">Secondary / Fallback</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">API Key</label>
                        <input 
                           name="openaiApiKey"
                           type="password"
                           defaultValue={settings?.openaiApiKey || ""}
                           placeholder="sk-..." 
                           className="w-full bg-white  border border-transparent focus:border-indigo-500 rounded-2xl px-5 py-4 text-xs font-bold outline-none transition-all" 
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Preferred Model</label>
                        <input 
                           name="openaiModel"
                           type="text"
                           defaultValue={settings?.openaiModel || "gpt-4o"}
                           placeholder="e.g. gpt-4o" 
                           className="w-full bg-white  border border-transparent focus:border-indigo-500 rounded-2xl px-5 py-4 text-xs font-bold outline-none transition-all" 
                        />
                     </div>
                  </div>
               </div>

               {/* Provider 3: Google Gemini (Final) */}
               <div className="space-y-6 bg-[#F8F9FA]  p-8 rounded-[32px] border border-gray-100 ">
                  <div className="flex items-center justify-between">
                     <h3 className="text-lg font-black flex items-center gap-2">
                        <BrainCircuit className="w-5 h-5 text-blue-500" /> Google Gemini
                     </h3>
                     <span className="text-[10px] font-black uppercase text-blue-400">Final Safety Fallback</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Gemini API Key</label>
                        <input 
                           name="geminiKey"
                           type="password"
                           defaultValue={settings?.geminiKey || ""}
                           placeholder="AIza..." 
                           className="w-full bg-white  border border-transparent focus:border-indigo-500 rounded-2xl px-5 py-4 text-xs font-bold outline-none transition-all" 
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Preferred Model</label>
                        <input 
                           name="geminiModel"
                           type="text"
                           defaultValue={settings?.geminiModel || "gemini-1.5-pro"}
                           placeholder="e.g. gemini-1.5-pro" 
                           className="w-full bg-white  border border-transparent focus:border-indigo-500 rounded-2xl px-5 py-4 text-xs font-bold outline-none transition-all" 
                        />
                     </div>
                  </div>
               </div>

               {/* Global Control & Priority */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-gray-50 ">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Fallback Sequence (Priority)</label>
                     <input 
                        name="aiProviderPriority"
                        type="text"
                        defaultValue={settings?.aiProviderPriority || "OPENROUTER,OPENAI,GEMINI"}
                        placeholder="OPENROUTER,OPENAI,GEMINI" 
                        className="w-full bg-[#F8F9FA]  border border-transparent focus:border-indigo-500 rounded-2xl px-5 py-4 text-xs font-black outline-none transition-all" 
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">AI Unit Price (Credits per Inference)</label>
                     <div className="relative">
                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input 
                           name="aiCreditPrice"
                           type="number"
                           step="0.01"
                           defaultValue={settings?.aiCreditPrice || 0.50}
                           className="w-full bg-[#F8F9FA]  border border-transparent focus:border-indigo-500 rounded-2xl pl-10 pr-5 py-4 text-xs font-black outline-none transition-all" 
                        />
                     </div>
                  </div>
               </div>

               <button type="submit" className="w-full bg-white text-slate-900 text-slate-900 border border-slate-100  text-white  font-black py-5 rounded-[32px] hover:scale-[1.01] active:scale-95 transition-all shadow-2xl shadow-indigo-500/20 flex items-center justify-center gap-3">
                  <ShieldCheck className="w-6 h-6" /> Save Bulletproof AI Config
               </button>
            </form>
         </div>

         {/* Right Column: Platform Revenue Stats */}
         <div className="space-y-8">
            <div className="bg-gradient-to-br from-[#1E40AF] to-[#BEF264] p-8 rounded-[48px] text-white space-y-6 shadow-2xl">
               <div className="flex items-center gap-3">
                  <TrendingUp className="w-6 h-6" />
                  <h3 className="text-xl font-black">AI Revenue Stream</h3>
               </div>
               <div>
                  <div className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1">Total Unit Sales</div>
                  <div className="text-4xl font-black tracking-tight">৳ 1,42,500.00</div>
               </div>
               <div className="pt-4 border-t border-white/20 grid grid-cols-2 gap-4">
                  <div>
                     <div className="text-[8px] font-black uppercase opacity-70">Active Subs</div>
                     <div className="text-lg font-bold">142</div>
                  </div>
                  <div>
                     <div className="text-[8px] font-black uppercase opacity-70">Inference/Day</div>
                     <div className="text-lg font-bold">12.4K</div>
                  </div>
               </div>
            </div>

            <div className="bg-white  border border-[#E5E7EB]  p-8 rounded-[40px] shadow-sm space-y-6">
               <h3 className="text-lg font-black flex items-center gap-2">
                 <CloudLightning className="w-5 h-5 text-indigo-500" /> Quick Status
               </h3>
               <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs font-bold">
                     <span className="text-gray-400">OpenAI GPT-4o</span>
                     <span className="text-green-500 flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div> Operational
                     </span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-bold">
                     <span className="text-gray-400">Google Vision</span>
                     <span className="text-green-500 flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div> Active
                     </span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-bold">
                     <span className="text-gray-400">FB Webhooks</span>
                     <span className="text-orange-500 flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div> Standby
                     </span>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
