"use client";

import React, { useEffect } from "react";
import { X, ExternalLink, Download } from "lucide-react";

interface DocumentViewerModalProps {
  url: string;
  title: string;
  onClose: () => void;
}

export function DocumentViewerModal({ url, title, onClose }: DocumentViewerModalProps) {
  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const isPdf = url.toLowerCase().endsWith(".pdf");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl h-full max-h-[90vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-white shrink-0">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 uppercase tracking-tight">{title}</h3>
            <p className="text-xs font-bold text-slate-400 mt-0.5">Document Viewer</p>
          </div>
          <div className="flex items-center gap-2">
            <a 
              href={url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
              title="Open in new tab"
            >
              <ExternalLink className="w-5 h-5" />
            </a>
            <a 
              href={url} 
              download
              className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
              title="Download"
            >
              <Download className="w-5 h-5" />
            </a>
            <button 
              onClick={onClose}
              className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors ml-2"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto bg-slate-50 p-4 sm:p-8 flex items-center justify-center">
          {url === "mock_id" ? (
            <div className="text-center space-y-2">
               <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ExternalLink className="w-8 h-8" />
               </div>
               <h4 className="text-xl font-black text-slate-900">Pending Upload</h4>
               <p className="text-sm text-slate-500 max-w-sm">This document has not been uploaded yet or is pending cloud integration.</p>
            </div>
          ) : isPdf ? (
            <iframe 
              src={`${url}#toolbar=0`} 
              className="w-full h-full min-h-[60vh] rounded-xl shadow-sm bg-white"
              title={title}
            />
          ) : (
            <img 
              src={url} 
              alt={title} 
              className="max-w-full max-h-full object-contain rounded-xl shadow-sm bg-white"
            />
          )}
        </div>
      </div>
    </div>
  );
}
