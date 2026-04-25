"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { useSidebar } from "@/context/SidebarContext";
import { ThemeToggleButton, NotificationDropdown, UserDropdown } from "./header/HeaderComponents";

export default function AppHeader({ user }: { user?: any }) {
  const { isMobileOpen, toggleSidebar, toggleMobileSidebar } = useSidebar();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleToggle = () => {
    if (window.innerWidth >= 1024) {
      toggleSidebar();
    } else {
      toggleMobileSidebar();
    }
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <header className="sticky top-0 flex w-full bg-white/80 backdrop-blur-md border-b border-gray-200 z-40 dark:border-gray-800 dark:bg-gray-900/80">
      <div className="flex flex-col items-center justify-between flex-grow lg:flex-row lg:px-6">
        <div className="flex items-center justify-between w-full gap-2 px-3 py-3 border-b border-gray-200 dark:border-gray-800 sm:gap-4 lg:justify-normal lg:border-b-0 lg:px-0 lg:py-4">
          <button
            className="flex items-center justify-center w-10 h-10 text-gray-500 border border-gray-200 rounded-lg dark:border-gray-800 dark:text-gray-400 hover:bg-gray-50 transition-colors"
            onClick={handleToggle}
            aria-label="Toggle Sidebar"
          >
            <svg width="16" height="12" viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M0.583252 1C0.583252 0.585788 0.919038 0.25 1.33325 0.25H14.6666C15.0808 0.25 15.4166 0.585786 15.4166 1C15.4166 1.41421 15.0808 1.75 14.6666 1.75L1.33325 1.75C0.919038 1.75 0.583252 1.41422 0.583252 1ZM0.583252 11C0.583252 10.5858 0.919038 10.25 1.33325 10.25L14.6666 10.25C15.0808 10.25 15.4166 10.5858 15.4166 11C15.4166 11.4142 15.0808 11.75 14.6666 11.75L1.33325 11.75C0.919038 11.75 0.583252 11.4142 0.583252 11ZM1.33325 5.25C0.919038 5.25 0.583252 5.58579 0.583252 6C0.583252 6.41421 0.919038 6.75 1.33325 6.75L7.99992 6.75C8.41413 6.75 8.74992 6.41421 8.74992 6C8.74992 5.58579 8.41413 5.25 7.99992 5.25L1.33325 5.25Z" fill="currentColor"/>
            </svg>
          </button>

          <Link href="/" className="lg:hidden ml-2">
            <span className="font-black text-lg text-[#0F172A] uppercase tracking-tighter">
              B<span className="text-brand-500">C</span>
            </span>
          </Link>

          <div className="hidden lg:block ml-4">
            <div className="relative">
              <span className="absolute -translate-y-1/2 pointer-events-none left-4 top-1/2">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" clipRule="evenodd" d="M3.04175 9.37363C3.04175 5.87693 5.87711 3.04199 9.37508 3.04199C12.8731 3.04199 15.7084 5.87693 15.7084 9.37363C15.7084 12.8703 12.8731 15.7053 9.37508 15.7053C5.87711 15.7053 3.04175 12.8703 3.04175 9.37363ZM9.37508 1.54199C5.04902 1.54199 1.54175 5.04817 1.54175 9.37363C1.54175 13.6991 5.04902 17.2053 9.37508 17.2053C11.2674 17.2053 13.003 16.5344 14.357 15.4176L17.177 18.238C17.4699 18.5309 17.9448 18.5309 18.2377 18.238C18.5306 17.9451 18.5306 17.4703 18.2377 17.1774L15.418 14.3573C16.5365 13.0033 17.2084 11.2669 17.2084 9.37363C17.2084 5.04817 13.7011 1.54199 9.37508 1.54199Z" fill="#94A3B8"/>
                </svg>
              </span>
              <input
                ref={inputRef}
                type="text"
                placeholder="Search or type command..."
                className="h-10 w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-12 pr-14 text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-4 focus:ring-brand-500/5 transition-all xl:w-[400px]"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1 items-center px-1.5 py-0.5 rounded border border-gray-200 bg-white text-[10px] font-bold text-gray-400 uppercase">
                <span>⌘</span>
                <span>K</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 px-5 py-4 lg:px-0">
          <ThemeToggleButton />
          <NotificationDropdown />
          <div className="h-6 w-[1px] bg-gray-200 mx-2"></div>
          <UserDropdown user={user} />
        </div>
      </div>
    </header>
  );
}
