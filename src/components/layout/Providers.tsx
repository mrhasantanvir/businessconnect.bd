"use client";

import { SupportProvider } from "@/context/SupportContext";
import { LanguageProvider } from "@/context/LanguageContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <SupportProvider>
        {children}
      </SupportProvider>
    </LanguageProvider>
  );
}
