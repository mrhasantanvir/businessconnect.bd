"use client";

import React from "react";

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

export function UserDropdown({ user }: { user?: any }) {
  return (
    <div className="flex items-center gap-3 cursor-pointer">
      <div className="hidden text-right lg:block">
        <p className="text-sm font-semibold text-gray-900 dark:text-white">{user?.name || "User"}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{user?.role || "Merchant"}</p>
      </div>
      <div className="w-9 h-9 bg-brand-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
        {user?.name?.charAt(0) || "U"}
      </div>
    </div>
  );
}
