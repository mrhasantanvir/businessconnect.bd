import React from "react";
import { db as prisma } from "@/lib/db";
import { updateAiGlobalSettingsAction } from "./actions";
import { AiTestButton } from "@/components/admin/AiTestButton";
import { 
  Cpu, 
  Key, 
  Coins, 
  Activity, 
  ShieldCheck, 
  TrendingUp, 
  DollarSign,
  CloudLightning,
  BrainCircuit,
  Zap
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
         <div className="lg:col-span-2 bg-white border border-[#E5E7EB] p-10 rounded-none shadow-sm space-y-8">
            <div className="flex items-center justify-between border-b border-gray-50  pb-6">
               <h2 className="text-2xl font-black flex items-center gap-3">
                 <Key className="w-6 h-6 text-indigo-500" /> API Gateway Keys
               </h2>
               <div className="bg-[#BEF264] text-[#1E40AF] px-3 py-1 rounded-none text-[10px] font-black uppercase tracking-widest border border-[#1E40AF]/10">
                 Secure Vault
               </div>
            </div>

            <form action={async (formData) => {
               "use server";
               await updateAiGlobalSettingsAction({
                 openaiApiKey: formData.get("openaiApiKey") as string,
                 openaiOrgId: formData.get("openaiOrgId") as string,
                 openaiProjectId: formData.get("openaiProjectId") as string,
                 openaiModel: formData.get("openaiModel") as string,
                 openRouterKey: formData.get("openRouterKey") as string,
                 openRouterModel: formData.get("openRouterModel") as string,
                 geminiKey: formData.get("geminiKey") as string,
                 geminiModel: formData.get("geminiModel") as string,
                 deepseekKey: formData.get("deepseekKey") as string,
                 deepseekModel: formData.get("deepseekModel") as string,
                 groqKey: formData.get("groqKey") as string,
                 groqModel: formData.get("groqModel") as string,
                 aiProviderPriority: formData.get("aiProviderPriority") as string,
                 googleVisionKey: formData.get("googleVisionKey") as string,
                 fbAppSecret: formData.get("fbAppSecret") as string,
                 aiCreditPrice: parseFloat(formData.get("aiCreditPrice") as string)
               });
            }} className="space-y-12">
               
               {/* Provider 1: OpenAI (Primary) */}
               <div className="space-y-6 bg-white border border-gray-100 p-8 rounded-none shadow-sm">
                  <div className="flex items-center justify-between">
                     <h3 className="text-lg font-black flex items-center gap-2">
                        <Cpu className="w-5 h-5 text-[#1E40AF]" /> OpenAI Native (GPT-4o)
                     </h3>
                     <span className="text-[10px] font-black uppercase text-[#1E40AF] bg-blue-50 px-2 py-0.5 border border-blue-100">Primary Provider</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="md:col-span-2 space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">API Key</label>
                        <input 
                           id="openaiApiKey"
                           name="openaiApiKey"
                           type="password"
                           defaultValue={settings?.openaiApiKey || ""}
                           placeholder="sk-proj-..." 
                           className="w-full bg-gray-50 border border-gray-100 focus:border-[#1E40AF] rounded-none px-5 py-4 text-xs font-bold outline-none transition-all" 
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                           Project ID <span className="normal-case font-normal text-gray-300">(required for sk-proj- keys)</span>
                        </label>
                        <input 
                           name="openaiProjectId"
                           type="text"
                           defaultValue={settings?.openaiProjectId || ""}
                           placeholder="proj_XXXXXXXXXXXXXXXXXXXXXXXX" 
                           className="w-full bg-gray-50 border border-gray-100 focus:border-[#1E40AF] rounded-none px-5 py-4 text-xs font-bold outline-none transition-all" 
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Preferred Model</label>
                        <input 
                           id="openaiModel"
                           name="openaiModel"
                           type="text"
                           defaultValue={settings?.openaiModel || "gpt-4o"}
                           placeholder="e.g. gpt-4o" 
                           className="w-full bg-gray-50 border border-gray-100 focus:border-[#1E40AF] rounded-none px-5 py-4 text-xs font-bold outline-none transition-all" 
                        />
                     </div>
                  </div>
                  <AiTestButton provider="OPENAI" apiKeyInputId="openaiApiKey" modelInputId="openaiModel" />
               </div>

               {/* Provider 2: Google Gemini (Fallback) */}
               <div className="space-y-6 bg-white border border-gray-100 p-8 rounded-none shadow-sm">
                  <div className="flex items-center justify-between">
                     <h3 className="text-lg font-black flex items-center gap-2">
                        <BrainCircuit className="w-5 h-5 text-indigo-600" /> Google Gemini
                     </h3>
                     <span className="text-[10px] font-black uppercase text-indigo-600 bg-indigo-50 px-2 py-0.5 border border-indigo-100">Intelligent Fallback</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Gemini API Key</label>
                        <input 
                           id="geminiKey"
                           name="geminiKey"
                           type="password"
                           defaultValue={settings?.geminiKey || ""}
                           placeholder="AIza..." 
                           className="w-full bg-gray-50 border border-gray-100 focus:border-[#1E40AF] rounded-none px-5 py-4 text-xs font-bold outline-none transition-all" 
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Preferred Model</label>
                        <input 
                           id="geminiModel"
                           name="geminiModel"
                           type="text"
                           defaultValue={settings?.geminiModel || "gemini-1.5-pro"}
                           placeholder="e.g. gemini-1.5-pro" 
                           className="w-full bg-gray-50 border border-gray-100 focus:border-[#1E40AF] rounded-none px-5 py-4 text-xs font-bold outline-none transition-all" 
                        />
                     </div>
                  </div>
                  <AiTestButton provider="GEMINI" apiKeyInputId="geminiKey" modelInputId="geminiModel" />
               </div>

               {/* Provider 3: DeepSeek (Ultra Low Cost) */}
               <div className="space-y-6 bg-white border border-gray-100 p-8 rounded-none shadow-sm">
                  <div className="flex items-center justify-between">
                     <h3 className="text-lg font-black flex items-center gap-2">
                        <CloudLightning className="w-5 h-5 text-emerald-600" /> DeepSeek (Recommended for Cost)
                     </h3>
                     <span className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 px-2 py-0.5 border border-emerald-100">Economic Choice</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">DeepSeek API Key</label>
                        <input 
                           id="deepseekKey"
                           name="deepseekKey"
                           type="password"
                           defaultValue={settings?.deepseekKey || ""}
                           placeholder="sk-..." 
                           className="w-full bg-gray-50 border border-gray-100 focus:border-[#1E40AF] rounded-none px-5 py-4 text-xs font-bold outline-none transition-all" 
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Preferred Model</label>
                        <input 
                           id="deepseekModel"
                           name="deepseekModel"
                           type="text"
                           defaultValue={settings?.deepseekModel || "deepseek-chat"}
                           placeholder="deepseek-chat" 
                           className="w-full bg-gray-50 border border-gray-100 focus:border-[#1E40AF] rounded-none px-5 py-4 text-xs font-bold outline-none transition-all" 
                        />
                     </div>
                  </div>
                  <AiTestButton provider="DEEPSEEK" apiKeyInputId="deepseekKey" modelInputId="deepseekModel" />
               </div>

               {/* Provider 4: Groq (Blazing Fast) */}
               <div className="space-y-6 bg-white border border-gray-100 p-8 rounded-none shadow-sm">
                  <div className="flex items-center justify-between">
                     <h3 className="text-lg font-black flex items-center gap-2">
                        <Zap className="w-5 h-5 text-orange-600" /> Groq Cloud
                     </h3>
                     <span className="text-[10px] font-black uppercase text-orange-600 bg-orange-50 px-2 py-0.5 border border-orange-100">High Speed</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Groq API Key</label>
                        <input 
                           id="groqKey"
                           name="groqKey"
                           type="password"
                           defaultValue={settings?.groqKey || ""}
                           placeholder="gsk_..." 
                           className="w-full bg-gray-50 border border-gray-100 focus:border-[#1E40AF] rounded-none px-5 py-4 text-xs font-bold outline-none transition-all" 
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Preferred Model</label>
                        <input 
                           id="groqModel"
                           name="groqModel"
                           type="text"
                           defaultValue={settings?.groqModel || "llama-3.3-70b-versatile"}
                           placeholder="e.g. llama-3.3-70b-versatile" 
                           className="w-full bg-gray-50 border border-gray-100 focus:border-[#1E40AF] rounded-none px-5 py-4 text-xs font-bold outline-none transition-all" 
                        />
                     </div>
                  </div>
                  <AiTestButton provider="GROQ" apiKeyInputId="groqKey" modelInputId="groqModel" />
               </div>

               {/* Provider 5: OpenRouter (Legacy Support) */}
               <div className="space-y-6 bg-white border border-gray-100 p-8 rounded-none shadow-sm opacity-60">
                  <div className="flex items-center justify-between">
                     <h3 className="text-lg font-black flex items-center gap-2">
                        <CloudLightning className="w-5 h-5 text-slate-500" /> OpenRouter
                     </h3>
                     <span className="text-[10px] font-black uppercase text-slate-500">Universal Gateway</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">API Key</label>
                        <input 
                           id="openRouterKey"
                           name="openRouterKey"
                           type="password"
                           defaultValue={settings?.openRouterKey || ""}
                           placeholder="sk-or-v1-..." 
                           className="w-full bg-gray-50 border border-gray-100 focus:border-[#1E40AF] rounded-none px-5 py-4 text-xs font-bold outline-none transition-all" 
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Preferred Model</label>
                        <input 
                           id="openRouterModel"
                           name="openRouterModel"
                           type="text"
                           defaultValue={settings?.openRouterModel || "openai/gpt-3.5-turbo"}
                           className="w-full bg-gray-50 border border-gray-100 focus:border-[#1E40AF] rounded-none px-5 py-4 text-xs font-bold outline-none transition-all" 
                        />
                     </div>
                  </div>
                  <AiTestButton provider="OPENROUTER" apiKeyInputId="openRouterKey" modelInputId="openRouterModel" />
               </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-gray-100">
                   <div className="space-y-4">
                      <div className="flex items-center justify-between">
                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Bulletproof Priority Sequence</label>
                         <span className="text-[8px] bg-emerald-100 text-emerald-700 px-2 py-0.5 font-bold uppercase tracking-tighter">Automatic Failover Enabled</span>
                      </div>
                      <div className="relative">
                         <input 
                            name="aiProviderPriority"
                            type="text"
                            defaultValue={settings?.aiProviderPriority || "GROQ,OPENAI,GEMINI,DEEPSEEK"}
                            placeholder="GROQ,OPENAI,GEMINI" 
                            className="w-full bg-slate-50 border-2 border-slate-100 focus:border-[#1E40AF] rounded-none px-5 py-5 text-sm font-black uppercase tracking-widest outline-none transition-all placeholder:text-gray-300" 
                         />
                         <div className="mt-2 text-[9px] text-gray-400 font-bold italic">
                            Order: 1. Primary → 2. Fallback → 3. Final Safety. (e.g. GROQ,OPENAI,GEMINI)
                         </div>
                      </div>
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
                           className="w-full bg-gray-50 border border-gray-100 focus:border-[#1E40AF] rounded-none pl-10 pr-5 py-4 text-xs font-black outline-none transition-all" 
                        />
                     </div>
                  </div>
               </div>

                <button type="submit" className="w-full bg-[#1E40AF] text-white font-black py-5 rounded-none hover:bg-black transition-all shadow-xl flex items-center justify-center gap-3">
                   <ShieldCheck className="w-6 h-6" /> Save Bulletproof AI Config
                </button>
            </form>
         </div>

         {/* Right Column: Platform Revenue Stats */}
         <div className="space-y-8">
            <div className="bg-[#1E40AF] p-8 rounded-none text-white space-y-6 shadow-xl border border-[#1E40AF]">
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

            <div className="bg-white border border-[#E5E7EB] p-8 rounded-none shadow-sm space-y-6">
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