"use client";

import React, { useState, useRef } from "react";
import { Send, Loader2, Image as ImageIcon, X, Lock } from "lucide-react";
import { addReplyAction } from "@/app/support/incidents/actions";

interface ReplyFormProps {
  incidentId: string;
  isAdmin?: boolean;
}

export function ReplyForm({ incidentId, isAdmin = false }: ReplyFormProps) {
  const [isPending, setIsPending] = useState(false);
  const [isInternal, setIsInternal] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPreviewUrl(URL.createObjectURL(file));
    setIsUploading(true);

    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url) setUploadedUrl(data.url);
    } catch {
      alert("Image upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);
    const fd = new FormData(e.currentTarget);
    fd.set("incidentId", incidentId);
    fd.set("isInternal", String(isInternal));
    fd.set("attachmentUrl", uploadedUrl || "");
    try {
      await addReplyAction(fd);
      formRef.current?.reset();
      setPreviewUrl(null);
      setUploadedUrl(null);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-3">
      {isAdmin && (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsInternal(!isInternal)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-none text-xs font-bold border transition-all ${
              isInternal
                ? "bg-amber-50 text-amber-700 border-amber-200"
                : "bg-[#F8F9FA] text-[#64748B] border-[#E5E7EB]"
            }`}
          >
            <Lock className="w-3 h-3" />
            {isInternal ? "Internal Note (Hidden from Merchant)" : "Public Reply"}
          </button>
        </div>
      )}

      {previewUrl && (
        <div className="relative inline-block">
          <img src={previewUrl} alt="Preview" className="h-24 rounded-none border border-[#E5E7EB] object-cover" />
          <button
            type="button"
            onClick={() => { setPreviewUrl(null); setUploadedUrl(null); }}
            className="absolute -top-2 -right-2 bg-white border border-[#E5E7EB] rounded-none p-1 shadow-sm"
          >
            <X className="w-3 h-3" />
          </button>
          {isUploading && (
            <div className="absolute inset-0 rounded-none bg-black/40 flex items-center justify-center">
              <Loader2 className="w-5 h-5 text-white animate-spin" />
            </div>
          )}
        </div>
      )}

      <div className={`flex items-end gap-3 p-3 rounded-none border transition-all focus-within:ring-2 focus-within:ring-[#1E40AF]/10 ${
        isInternal ? "bg-amber-50 border-amber-200" : "bg-white border-[#E5E7EB]"
      }`}>
        <textarea
          name="content"
          required
          rows={2}
          placeholder={isInternal ? "Write an internal note..." : "Write a reply..."}
          className="flex-1 bg-transparent outline-none resize-none text-sm text-[#0F172A] placeholder:text-[#A1A1AA]"
        />
        <div className="flex items-center gap-2 shrink-0">
          <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="p-2 text-[#A1A1AA] hover:text-[#1E40AF] hover:bg-[#F1F5F9] rounded-none transition-colors"
            title="Attach image"
          >
            <ImageIcon className="w-5 h-5" />
          </button>
          <button
            type="submit"
            disabled={isPending || isUploading}
            className="p-2.5 bg-[#1E40AF] text-white rounded-none hover:bg-[#1E3A8A] transition-all disabled:opacity-50 flex items-center justify-center"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </form>
  );
}
