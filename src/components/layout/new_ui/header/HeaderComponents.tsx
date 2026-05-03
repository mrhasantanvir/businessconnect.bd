"use client";

import React from "react";
import { cn } from "@/lib/utils";

export function ThemeToggleButton() {
  return (
    <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 13.75C12.0711 13.75 13.75 12.0711 13.75 10C13.75 7.92893 12.0711 6.25 10 6.25C7.92893 6.25 6.25 7.92893 6.25 10C6.25 12.0711 7.92893 13.75 10 13.75Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M10 1.25V2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M10 17.5V18.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M3.8125 3.8125L4.69375 4.69375" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M15.3062 15.3062L16.1875 16.1875" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M1.25 10H2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M17.5 10H18.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M3.8125 16.1875L4.69375 15.3062" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M15.3062 4.69375L16.1875 3.8125" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </button>
  );
}

export function NotificationDropdown() {
  return (
    <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg relative">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M15.8333 14.1667H4.16667C3.70643 14.1667 3.33334 13.7936 3.33334 13.3334C3.33334 11.4924 4.82572 10 6.66667 10V6.66667C6.66667 4.82572 8.15905 3.33334 10 3.33334C11.841 3.33334 13.3333 4.82572 13.3333 6.66667V10C15.1743 10 16.6667 11.4924 16.6667 13.3334C16.6667 13.7936 16.2936 14.1667 15.8333 14.1667Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M8.33334 14.1667C8.33334 15.0871 9.07953 15.8333 10 15.8333C10.9205 15.8333 11.6667 15.0871 11.6667 14.1667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
    </button>
  );
}

import { 
  User, Shield, Activity, LogOut, ChevronDown 
} from "lucide-react";
import Link from "next/link";
import { logoutAction } from "@/app/login/actions";

export function UserDropdown({ user }: { user?: any }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-1.5 rounded-none transition-all"
      >
        <div className="hidden text-right lg:block">
          <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight italic">{user?.name || "Member"}</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{user?.role || "Access"}</p>
        </div>
        <div className="relative">
           <div className="w-9 h-9 bg-slate-900 rounded-none flex items-center justify-center text-brand-500 font-black text-xs shadow-lg shadow-slate-200">
             {user?.image ? (
               <img src={user.image} alt="" className="w-full h-full rounded-none object-cover" />
             ) : (
               user?.name?.charAt(0).toUpperCase() || "U"
             )}
           </div>
           <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-white dark:bg-gray-900 rounded-none flex items-center justify-center border border-gray-100 dark:border-gray-800">
              <ChevronDown className={cn("w-2.5 h-2.5 text-gray-400 transition-transform duration-300", isOpen && "rotate-180")} />
           </div>
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-64 bg-white dark:bg-gray-900 rounded-none shadow-2xl border border-slate-900 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300 z-50">
           <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-slate-50/50 dark:bg-gray-800/30">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Account</p>
              <p className="text-sm font-black text-slate-900 dark:text-white truncate italic">{user?.email || "user@businessconnect.bd"}</p>
           </div>
           
           <div className="p-2">
              <Link 
                href="/settings/profile" 
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-3.5 text-xs font-black text-slate-600 dark:text-gray-300 hover:bg-slate-900 hover:text-white rounded-none transition-all group uppercase tracking-widest"
              >
                 <div className="w-8 h-8 bg-slate-100 dark:bg-gray-800 rounded-none flex items-center justify-center text-slate-900 group-hover:bg-white transition-colors">
                    <User className="w-4 h-4" />
                 </div>
                 Profile & Security
              </Link>

              <Link 
                href="/settings/performance" 
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-3.5 text-xs font-black text-slate-600 dark:text-gray-300 hover:bg-slate-900 hover:text-white rounded-none transition-all group uppercase tracking-widest"
              >
                 <div className="w-8 h-8 bg-slate-100 dark:bg-gray-800 rounded-none flex items-center justify-center text-slate-900 group-hover:bg-white transition-colors">
                    <Activity className="w-4 h-4" />
                 </div>
                 Performance Hub
              </Link>
           </div>

           <div className="p-2 border-t border-gray-100 dark:border-gray-800">
              <button 
                onClick={async () => {
                  setIsOpen(false);
                  await logoutAction();
                }}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-xs font-black text-rose-600 hover:bg-rose-600 hover:text-white rounded-none transition-all group uppercase tracking-widest"
              >
                 <div className="w-8 h-8 bg-rose-50 rounded-none flex items-center justify-center text-rose-600 group-hover:bg-white transition-colors">
                    <LogOut className="w-4 h-4" />
                 </div>
                 Sign Out
              </button>
           </div>
        </div>
      )}
    </div>
  );
}
