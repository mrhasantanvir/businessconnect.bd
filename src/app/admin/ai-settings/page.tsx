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

  // Fetch AI Usage Stats for the current month
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const usageStats = await prisma.aiTransaction.groupBy({
    by: ["provider"],
    where: {
      createdAt: { gte: startOfMonth },
      type: { in: ["USAGE", "VISION_USAGE"] }
    },
    _count: { _all: true },
    _sum: { amount: true }
  });

  // Actual Provider Costs (Estimated based on standard pricing)
  // These are used for "Real Costing" display
  const providerPrices: Record<string, { pricePerUnit: number, label: string }> = {
    "OPENAI": { pricePerUnit: 0.15, label: "GPT-4o (Avg/Request)" },
    "GROQ": { pricePerUnit: 0.01, label: "Llama 3 (High Speed)" },
    "GEMINI": { pricePerUnit: 0.05, label: "Gemini Pro" },
    "DEEPSEEK": { pricePerUnit: 0.02, label: "DeepSeek Chat" },
    "OPENROUTER": { pricePerUnit: 0.10, label: "Aggregated" }
  };

  const totalInferences = usageStats.reduce((acc, curr) => acc + curr._count._all, 0);
  const totalInternalCost = usageStats.reduce((acc, curr) => {
    const price = providerPrices[curr.provider || ""]?.pricePerUnit || 0.05;
    return acc + (curr._count._all * price);
  }, 0);

   const usageByProvider = usageStats.reduce<Record<string, number>>((acc, curr) => {
      const provider = curr.provider || "UNKNOWN";
      acc[provider] = curr._count._all;
      return acc;
   }, {});

   const providerCallCounts = Object.entries(providerPrices).map(([provider, info]) => ({
      provider,
      label: info.label,
      count: usageByProvider[provider] || 0,
   }));

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      <div className="space-y-1">
         <div className="flex items-center gap-2 text-indigo-600  font-bold text-xs uppercase tracking-widest">
            <Cpu className="w-3.5 h-3.5" /> Platform Intelligence
         </div>
         <h1 className="text-2xl font-bold text-[#0F172A]  tracking-tight">AI Master Control</h1>
         <p className="text-[#64748B]  text-sm max-w-xl leading-relaxed">
            Configure global API keys and monetization rates for ChatGPT-4o and Google Vision AI services.
         </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Left Column: Master API Keys */}
         <div className="lg:col-span-2 bg-white border border-[#E5E7EB] p-10 rounded-none shadow-sm space-y-8">
            <div className="flex items-center justify-between border-b border-gray-50  pb-6">
               <h2 className="text-2xl font-bold flex items-center gap-3">
                 <Key className="w-6 h-6 text-indigo-500" /> API Gateway Keys
               </h2>
               <div className="bg-[#BEF264] text-[#1E40AF] px-3 py-1 rounded-none text-[10px] font-bold uppercase tracking-widest border border-[#1E40AF]/10">
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
                 aiProviderPriority: [
                    formData.get("priority1"),
                    formData.get("priority2"),
                    formData.get("priority3")
                  ].filter(Boolean).join(","),
                 googleVisionKey: formData.get("googleVisionKey") as string,
                 fbAppSecret: formData.get("fbAppSecret") as string,
                 aiCreditPrice: parseFloat(formData.get("aiCreditPrice") as string)
               });
            }} className="space-y-12">
               
               {/* Provider 1: OpenAI (Primary) */}
               <div className="space-y-6 bg-white border border-gray-100 p-8 rounded-none shadow-sm">
                  <div className="flex items-center justify-between">
                     <h3 className="text-lg font-bold flex items-center gap-2">
                        <Cpu className="w-5 h-5 text-[#1E40AF]" /> OpenAI Native (GPT-4o)
                     </h3>
                     <span className="text-[10px] font-bold uppercase text-[#1E40AF] bg-blue-50 px-2 py-0.5 border border-blue-100">Primary Provider</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="md:col-span-2 space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">API Key</label>
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
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
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
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Preferred Model</label>
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
                     <h3 className="text-lg font-bold flex items-center gap-2">
                        <BrainCircuit className="w-5 h-5 text-indigo-600" /> Google Gemini
                     </h3>
                     <span className="text-[10px] font-bold uppercase text-indigo-600 bg-indigo-50 px-2 py-0.5 border border-indigo-100">Intelligent Fallback</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Gemini API Key</label>
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
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Preferred Model</label>
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
                     <h3 className="text-lg font-bold flex items-center gap-2">
                        <CloudLightning className="w-5 h-5 text-emerald-600" /> DeepSeek (Recommended for Cost)
                     </h3>
                     <span className="text-[10px] font-bold uppercase text-emerald-600 bg-emerald-50 px-2 py-0.5 border border-emerald-100">Economic Choice</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">DeepSeek API Key</label>
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
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Preferred Model</label>
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
                     <h3 className="text-lg font-bold flex items-center gap-2">
                        <Zap className="w-5 h-5 text-orange-600" /> Groq Cloud
                     </h3>
                     <span className="text-[10px] font-bold uppercase text-orange-600 bg-orange-50 px-2 py-0.5 border border-orange-100">High Speed</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Groq API Key</label>
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
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Preferred Model</label>
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
                     <h3 className="text-lg font-bold flex items-center gap-2">
                        <CloudLightning className="w-5 h-5 text-slate-500" /> OpenRouter
                     </h3>
                     <span className="text-[10px] font-bold uppercase text-slate-500">Universal Gateway</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">API Key</label>
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
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Preferred Model</label>
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
                         <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Bulletproof Priority Sequence</label>
                         <span className="text-[8px] bg-emerald-100 text-emerald-700 px-2 py-0.5 font-bold uppercase tracking-tight">Automatic Failover Active</span>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                         {[1, 2, 3].map((num) => {
                            const priorities = settings?.aiProviderPriority?.split(",") || ["GROQ", "OPENAI", "GEMINI"];
                            const currentVal = priorities[num-1] || "";
                            return (
                               <div key={num} className="space-y-1">
                                  <div className="text-[8px] font-bold text-gray-400 uppercase tracking-tight ml-1">Priority {num}</div>
                                  <select 
                                     name={`priority${num}`}
                                     defaultValue={currentVal}
                                     className="w-full bg-slate-50 border border-slate-200 focus:border-[#1E40AF] rounded-none px-2 py-3 text-[10px] font-bold uppercase tracking-tight outline-none transition-all cursor-pointer"
                                  >
                                     <option value="">None</option>
                                     <option value="GROQ">Groq</option>
                                     <option value="OPENAI">OpenAI</option>
                                     <option value="GEMINI">Gemini</option>
                                     <option value="OPENROUTER">OpenRouter</option>
                                     <option value="DEEPSEEK">DeepSeek</option>
                                  </select>
                               </div>
                            );
                         })}
                      </div>
                      <div className="mt-2 text-[9px] text-gray-400 font-bold">
                         Select your top 3 providers. System will automatically jump to the next one if the previous fails.
                      </div>
                   </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">AI Unit Price (Credits per Inference)</label>
                     <div className="relative">
                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input 
                           name="aiCreditPrice"
                           type="number"
                           step="0.01"
                           defaultValue={settings?.aiCreditPrice || 0.50}
                           className="w-full bg-gray-50 border border-gray-100 focus:border-[#1E40AF] rounded-none pl-10 pr-5 py-4 text-xs font-bold outline-none transition-all" 
                        />
                     </div>
                  </div>
               </div>

                <button type="submit" className="w-full bg-[#1E40AF] text-white font-bold py-5 rounded-none hover:bg-black transition-all shadow-xl flex items-center justify-center gap-3">
                   <ShieldCheck className="w-6 h-6" /> Save Bulletproof AI Config
                </button>
            </form>
         </div>

         {/* Right Column: Platform Revenue Stats */}
         <div className="space-y-8">
            <div className="bg-white p-8 rounded-none text-black space-y-6 shadow-sm border border-[#E5E7EB]">
               <div className="flex items-center gap-3">
                  <TrendingUp className="w-6 h-6 text-[#1E40AF]" />
                  <h3 className="text-xl font-bold">AI Revenue Stream</h3>
               </div>
               <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Total Internal AI Cost (This Month)</div>
                  <div className="text-2xl font-bold tracking-tight flex items-baseline gap-1">
                     <span className="text-xl">$</span>{totalInternalCost.toFixed(2)}
                  </div>
                  <div className="text-[10px] mt-1 text-gray-500">Estimated base cost paid to providers</div>
               </div>
               <div className="pt-4 border-t border-gray-100 grid grid-cols-2 gap-4">
                  <div>
                     <div className="text-[8px] font-bold uppercase text-gray-500">Total Inferences</div>
                     <div className="text-lg font-bold">{totalInferences.toLocaleString()}</div>
                  </div>
                  <div>
                     <div className="text-[8px] font-bold uppercase text-gray-500">Revenue (Estimated)</div>
                     <div className="text-lg font-bold">৳ {(totalInferences * (settings?.aiCreditPrice || 0.5)).toLocaleString()}</div>
                  </div>
               </div>
               <div className="pt-4 border-t border-gray-100 space-y-2">
                  <div className="text-[9px] font-bold uppercase tracking-widest text-gray-500">Per Provider Call Count</div>
                  {providerCallCounts.map((item) => (
                    <div key={item.provider} className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-gray-700">{item.label}</span>
                      <span className="font-bold text-[#0F172A]">{item.count.toLocaleString()} calls</span>
                    </div>
                  ))}
               </div>
            </div>

            <div className="bg-white border border-[#E5E7EB] p-8 rounded-none shadow-sm space-y-6">
               <h3 className="text-lg font-bold flex items-center gap-2">
                  <Activity className="w-5 h-5 text-emerald-500" /> Monthly Provider Usage
               </h3>
               <div className="space-y-4">
                  {usageStats.length === 0 ? (
                     <div className="text-xs text-gray-400">No usage tracked yet this month.</div>
                  ) : (
                     usageStats.map((stat) => {
                        const provider = stat.provider || "UNKNOWN";
                        const info = providerPrices[provider] || { pricePerUnit: 0.05, label: provider };
                        const cost = stat._count._all * info.pricePerUnit;
                        return (
                           <div key={provider} className="group border-b border-gray-50 pb-3 last:border-0">
                              <div className="flex items-center justify-between text-xs font-bold mb-1">
                                 <span className="text-gray-900">{info.label}</span>
                                 <span className="text-emerald-600">{(stat._count._all).toLocaleString()} reqs</span>
                              </div>
                              <div className="flex items-center justify-between text-[10px] font-medium text-gray-400">
                                 <span>Monthly Usage</span>
                                 <span className="text-gray-500 font-bold">Est. Cost: ${cost.toFixed(2)}</span>
                              </div>
                           </div>
                        );
                     })
                  )}
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}