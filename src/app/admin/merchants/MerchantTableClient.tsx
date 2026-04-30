"use client";

import React, { useState } from "react";
import { MessageSquare, Phone, FileText, ExternalLink, Settings, MoreVertical, CheckCircle, XCircle, UploadCloud, RefreshCw } from "lucide-react";
import Link from "next/link";
import { getMediaUrl } from "@/lib/utils/media";
import { DocumentViewerModal } from "@/components/ui/DocumentViewerModal";
import { updateMerchantStatusAction } from "./actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function MerchantTableClient({ merchants, settings }: { merchants: any[], settings: any }) {
  const [viewerDoc, setViewerDoc] = useState<{url: string, title: string} | null>(null);
  const [reuploadStoreId, setReuploadStoreId] = useState<string | null>(null);

  const openDoc = (e: React.MouseEvent, url: string, title: string) => {
    e.preventDefault();
    setViewerDoc({ url: getMediaUrl(url, settings?.storageCdnUrl), title });
  };

  return (
    <>
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
                  
                  <td className="p-6">
                    <span className={`inline-flex px-3 py-1.5 text-[9px] font-black rounded-full uppercase tracking-widest ${
                       m.activationStatus === "ACTIVE" ? "bg-green-50 text-green-600 border border-green-100" :
                       m.activationStatus === "PENDING" ? "bg-amber-50 text-amber-600 border border-amber-100" :
                       m.activationStatus === "DOCUMENTS_REJECTED" ? "bg-purple-50 text-purple-600 border border-purple-100" :
                       "bg-red-50 text-red-600 border border-red-100"
                    }`}>
                       {m.activationStatus === "DOCUMENTS_REJECTED" ? "REUPLOAD REQUIRED" : m.activationStatus || m.plan}
                    </span>
                    {m.activationStatus === "DOCUMENTS_REJECTED" && (
                       <p className="text-[8px] text-purple-500 font-bold mt-1 line-clamp-1 max-w-[120px]">{m.reuploadMessage || "Pending updates"}</p>
                    )}
                  </td>

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

                  <td className="p-6">
                    <div className="flex flex-col gap-2">
                       {m.tradeLicenseUrl && (
                         <button onClick={(e) => openDoc(e, m.tradeLicenseUrl, "Trade License")} className="text-[9px] font-black uppercase px-2 py-1.5 bg-blue-50 hover:bg-blue-100 rounded-lg text-blue-600 flex items-center gap-1.5 w-max transition-colors text-left">
                           <FileText className="w-3 h-3" /> Trade License
                         </button>
                       )}
                       {m.nidFrontUrl && (
                         <button onClick={(e) => openDoc(e, m.nidFrontUrl, "NID Front")} className="text-[9px] font-black uppercase px-2 py-1.5 bg-blue-50 hover:bg-blue-100 rounded-lg text-blue-600 flex items-center gap-1.5 w-max transition-colors text-left">
                           <FileText className="w-3 h-3" /> NID Front
                         </button>
                       )}
                       {m.nidBackUrl && (
                         <button onClick={(e) => openDoc(e, m.nidBackUrl, "NID Back")} className="text-[9px] font-black uppercase px-2 py-1.5 bg-blue-50 hover:bg-blue-100 rounded-lg text-blue-600 flex items-center gap-1.5 w-max transition-colors text-left">
                           <FileText className="w-3 h-3" /> NID Back
                         </button>
                       )}
                    </div>
                  </td>

                  <td className="p-6">
                    <div className="flex items-center justify-end gap-3">
                       <MerchantActionDropdown storeId={m.id} currentStatus={m.activationStatus} onReuploadRequest={() => setReuploadStoreId(m.id)} />
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

      {viewerDoc && (
        <DocumentViewerModal 
          url={viewerDoc.url} 
          title={viewerDoc.title} 
          onClose={() => setViewerDoc(null)} 
        />
      )}

      {reuploadStoreId && (
        <RequestReuploadModal 
          storeId={reuploadStoreId} 
          onClose={() => setReuploadStoreId(null)} 
        />
      )}
    </>
  );
}

function MerchantActionDropdown({ storeId, currentStatus, onReuploadRequest }: { storeId: string, currentStatus: string, onReuploadRequest: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAction = async (action: string) => {
    setOpen(false);
    if (action === "REUPLOAD") {
      onReuploadRequest();
      return;
    }
    
    if (!confirm(`Are you sure you want to ${action.toLowerCase()} this merchant?`)) return;
    
    setLoading(true);
    try {
      const res = await updateMerchantStatusAction(storeId, action, null, null);
      if (res.success) {
        toast.success(`Merchant ${action.toLowerCase()} successfully!`);
        router.refresh();
      } else {
        toast.error(res.error);
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setOpen(!open)}
        disabled={loading}
        className="px-4 py-2.5 bg-blue-600 text-white rounded-xl font-black uppercase text-[9px] tracking-widest hover:bg-blue-700 transition-all shadow-md shadow-blue-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : "Manage Status"}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-xl z-10 overflow-hidden animate-in fade-in slide-in-from-top-2">
           {currentStatus !== "ACTIVE" && (
             <button onClick={() => handleAction("ACTIVE")} className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-green-600 border-b border-gray-50">
               <CheckCircle className="w-3.5 h-3.5" /> Activate
             </button>
           )}
           <button onClick={() => handleAction("REUPLOAD")} className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-amber-600 border-b border-gray-50">
             <UploadCloud className="w-3.5 h-3.5" /> Request Reupload
           </button>
           {currentStatus !== "REJECTED" && (
             <button onClick={() => handleAction("REJECTED")} className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-red-600">
               <XCircle className="w-3.5 h-3.5" /> Reject
             </button>
           )}
        </div>
      )}
    </div>
  );
}

function RequestReuploadModal({ storeId, onClose }: { storeId: string, onClose: () => void }) {
  const [docs, setDocs] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const toggleDoc = (doc: string) => {
    if (docs.includes(doc)) setDocs(docs.filter(d => d !== doc));
    else setDocs([...docs, doc]);
  };

  const handleSubmit = async () => {
    if (docs.length === 0) {
      toast.error("Please select at least one document to reupload.");
      return;
    }
    setLoading(true);
    try {
      const res = await updateMerchantStatusAction(storeId, "DOCUMENTS_REJECTED", docs.join(","), message);
      if (res.success) {
        toast.success("Reupload request sent to merchant!");
        router.refresh();
        onClose();
      } else {
        toast.error(res.error);
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 flex flex-col space-y-6">
         <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Request Documents</h3>
            <p className="text-xs text-slate-500 mt-1">Select the documents the merchant needs to reupload.</p>
         </div>

         <div className="space-y-3">
            {["Trade License", "NID Front", "NID Back"].map(doc => (
              <label key={doc} className="flex items-center gap-3 p-3 border rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                <input type="checkbox" checked={docs.includes(doc)} onChange={() => toggleDoc(doc)} className="w-4 h-4 text-blue-600 rounded" />
                <span className="text-sm font-bold text-slate-700">{doc}</span>
              </label>
            ))}
         </div>

         <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Custom Message (Optional)</label>
            <textarea 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="E.g. Your NID is blurry, please provide a clear copy."
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              rows={3}
            />
         </div>

         <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 py-3 text-slate-500 font-bold text-sm bg-slate-100 rounded-xl hover:bg-slate-200">Cancel</button>
            <button disabled={loading} onClick={handleSubmit} className="flex-1 py-3 text-white font-bold text-sm bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50 flex justify-center items-center">
              {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : "Send Request"}
            </button>
         </div>
      </div>
    </div>
  );
}
