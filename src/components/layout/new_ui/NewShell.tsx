"use client";

import React from "react";
import { SidebarProvider, useSidebar } from "@/context/SidebarContext";
import AppHeader from "./AppHeader";
import AppSidebar from "./AppSidebar";

const LayoutContent: React.FC<{ children: React.ReactNode, user?: any }> = ({ children, user }) => {
  const { isExpanded, isHovered, isMobileOpen, toggleMobileSidebar } = useSidebar();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="min-h-screen bg-gray-50 font-outfit" />;
  }

  return (
    <div className="min-h-screen xl:flex bg-gray-50 font-outfit">
      {/* Sidebar and Backdrop */}
      <AppSidebar user={user} />
      
      {isMobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-900/50 backdrop-blur-sm lg:hidden"
          onClick={toggleMobileSidebar}
        />
      )}

      <div
        className={`flex-1 transition-all duration-300 ease-in-out ${
          isExpanded || isHovered ? "lg:ml-[290px]" : "lg:ml-[90px]"
        } ${isMobileOpen ? "ml-0" : ""}`}
      >
        <AppHeader user={user} />
        <main className="p-4 mx-auto max-w-screen-2xl md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default function NewShell({ children, user }: { children: React.ReactNode, user?: any }) {
  return (
    <SidebarProvider>
      <LayoutContent user={user}>{children}</LayoutContent>
    </SidebarProvider>
  );
}
