"use client";

import React, { useState } from "react";
import { Upload, CheckCircle2, RefreshCw, ArrowLeft, FileText, UserSquare2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { reuploadDocumentsAction } from "./actions";

export default function DocumentReuploadClient({ store }: { store: any }) {
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<{
    tradeLicense?: File,
    nidFront?: File,
    nidBack?: File
  }>({});
  const [fileNames, setFileNames] = useState<{
    tradeLicense?: string,
    nidFront?: string,
    nidBack?: string
  }>({});

  const router = useRouter();

  const handleFileChange = (type: keyof typeof files, file: File) => {
    if (file.size > 2 * 1024 * 1024) {
      toast.error("File size exceeds 2MB limit.");
      return;
    }
    setFiles(prev => ({ ...prev, [type]: file }));
    setFileNames(prev => ({ ...prev, [type]: file.name }));
  };

  const uploadToS3 = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    if (!res.ok) throw new Error("Upload failed");
    const data = await res.json();
    return data.url;
  };

  const handleSubmit = async () => {
    if (!files.tradeLicense && !files.nidFront && !files.nidBack) {
      toast.error("Please upload at least one new document.");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Uploading documents...");
    try {
      const urls: any = {};
      if (files.tradeLicense) urls.tradeLicenseUrl = await uploadToS3(files.tradeLicense);
      if (files.nidFront) urls.nidFrontUrl = await uploadToS3(files.nidFront);
      if (files.nidBack) urls.nidBackUrl = await uploadToS3(files.nidBack);

      const res = await reuploadDocumentsAction(urls);
      if (res.success) {
        toast.success("Documents re-uploaded successfully! Admin notified.", { id: toastId });
        router.push("/dashboard");
      } else {
        toast.error("Failed to update documents.", { id: toastId });
      }
    } catch (error: any) {
      toast.error(error.message, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-widest">Back to Dashboard</span>
        </Link>

        <div className="bg-white rounded-[40px] p-8 md:p-12 shadow-xl shadow-slate-200/50 border border-slate-100">
           <div className="space-y-4 mb-10">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-rose-50 rounded-full">
                 <RefreshCw className="w-3.5 h-3.5 text-rose-600 animate-spin-slow" />
                 <span className="text-[10px] font-black text-rose-700 uppercase tracking-widest">Update Required</span>
              </div>
              <h1 className="text-4xl font-black text-slate-900 uppercase italic tracking-tighter">Document <span className="text-rose-600">Re-upload</span></h1>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">
                Admin requested a re-upload for your store <strong>{store.name}</strong>.<br />
                {store.reuploadMessage && (
                  <span className="block mt-2 p-4 bg-slate-50 border-l-4 border-rose-500 text-rose-700 rounded-r-xl italic font-bold">
                    Reason: {store.reuploadMessage}
                  </span>
                )}
              </p>
           </div>

           <div className="space-y-6">
              {/* Trade License */}
              <div className="space-y-3 p-6 bg-slate-50 rounded-[32px] border-2 border-dashed border-slate-200 hover:border-indigo-600/20 transition-all">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">Trade License</h4>
                    <p className="text-[10px] text-slate-400 font-medium uppercase mt-1">PDF or Image (Max 2MB)</p>
                  </div>
                  <label className="cursor-pointer bg-white p-3 rounded-2xl shadow-sm hover:shadow-md transition-all">
                    <Upload className="w-5 h-5 text-indigo-600" />
                    <input type="file" className="hidden" accept="image/*,.pdf" onChange={e => e.target.files?.[0] && handleFileChange('tradeLicense', e.target.files[0])} />
                  </label>
                </div>
                {fileNames.tradeLicense && (
                  <div className="flex items-center gap-2 text-green-600 text-[10px] font-bold uppercase tracking-widest bg-green-50 px-3 py-1.5 rounded-xl w-max">
                    <CheckCircle2 className="w-3.5 h-3.5" /> {fileNames.tradeLicense}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* NID Front */}
                <div className="space-y-3 p-6 bg-slate-50 rounded-[32px] border-2 border-dashed border-slate-200 hover:border-indigo-600/20 transition-all">
                  <div className="flex flex-col items-center text-center">
                    <UserSquare2 className="w-8 h-8 text-slate-300 mb-3" />
                    <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">NID Front</h4>
                    <label className="mt-4 cursor-pointer bg-white px-4 py-2 rounded-xl shadow-sm text-[10px] font-black uppercase tracking-widest text-indigo-600 border border-indigo-50">
                      {fileNames.nidFront ? "Change" : "Upload"}
                      <input type="file" className="hidden" accept="image/*" onChange={e => e.target.files?.[0] && handleFileChange('nidFront', e.target.files[0])} />
                    </label>
                  </div>
                  {fileNames.nidFront && (
                    <div className="text-center text-green-600 text-[8px] font-bold uppercase tracking-widest mt-2 truncate w-full px-2">{fileNames.nidFront}</div>
                  )}
                </div>

                {/* NID Back */}
                <div className="space-y-3 p-6 bg-slate-50 rounded-[32px] border-2 border-dashed border-slate-200 hover:border-indigo-600/20 transition-all">
                  <div className="flex flex-col items-center text-center">
                    <UserSquare2 className="w-8 h-8 text-slate-300 mb-3" />
                    <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">NID Back</h4>
                    <label className="mt-4 cursor-pointer bg-white px-4 py-2 rounded-xl shadow-sm text-[10px] font-black uppercase tracking-widest text-indigo-600 border border-indigo-50">
                      {fileNames.nidBack ? "Change" : "Upload"}
                      <input type="file" className="hidden" accept="image/*" onChange={e => e.target.files?.[0] && handleFileChange('nidBack', e.target.files[0])} />
                    </label>
                  </div>
                  {fileNames.nidBack && (
                    <div className="text-center text-green-600 text-[8px] font-bold uppercase tracking-widest mt-2 truncate w-full px-2">{fileNames.nidBack}</div>
                  )}
                </div>
              </div>

              <button 
                disabled={loading}
                onClick={handleSubmit}
                className="w-full bg-slate-900 text-white rounded-[24px] py-6 text-xs font-black uppercase tracking-[0.2em] hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : "Submit Documents"}
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
