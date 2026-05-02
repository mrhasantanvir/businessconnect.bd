"use client";

import React, { useState } from "react";
import { Terminal, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { testAiConnectionAction } from "@/app/admin/ai-settings/actions";

export function AiTestButton({ provider }: { provider: string }) {
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await testAiConnectionAction(provider);
      setTestResult(res);
    } catch (err: any) {
      setTestResult({ success: false, error: err.message });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="mt-6 p-6 bg-slate-900 rounded-none border border-slate-800 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-black text-white uppercase tracking-[0.2em] flex items-center gap-2">
          <Terminal className="w-4 h-4 text-emerald-400" /> API Diagnostic Tool
        </h4>
        <button 
          type="button"
          onClick={handleTest}
          disabled={testing}
          className="px-4 py-2 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all disabled:opacity-50 flex items-center gap-2"
        >
          {testing && <Loader2 className="w-3 h-3 animate-spin" />}
          {testing ? "Testing..." : "Run Connection Test"}
        </button>
      </div>
      
      {testResult && (
        <div className={`p-4 rounded-none border text-xs font-mono ${testResult.success ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-400' : 'bg-rose-950/30 border-rose-500/30 text-rose-400'}`}>
          <div className="flex items-center gap-2 mb-2 font-bold uppercase">
            {testResult.success ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
            {testResult.success ? "Connection Secure" : "Connection Failed"}
          </div>
          <pre className="whitespace-pre-wrap">{testResult.message || testResult.error || JSON.stringify(testResult, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
