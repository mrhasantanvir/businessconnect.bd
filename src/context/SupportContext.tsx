"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { getSystemSettingsAction } from "@/app/admin/settings/actions";

const SupportContext = createContext<{
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  toggle: () => void;
  isEnabled: boolean;
}>({
  isOpen: false,
  setIsOpen: () => {},
  toggle: () => {},
  isEnabled: true,
});

export function SupportProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isEnabled, setIsEnabled] = useState(true);
  const toggle = () => {
    if (isEnabled) setIsOpen(prev => !prev);
  };

  useEffect(() => {
    async function checkStatus() {
      const settings = await getSystemSettingsAction();
      if (settings) {
        setIsEnabled(settings.isLiveChatEnabled);
      }
    }
    checkStatus();
  }, []);

  return (
    <SupportContext.Provider value={{ isOpen, setIsOpen, toggle, isEnabled }}>
      {children}
    </SupportContext.Provider>
  );
}

export const useSupport = () => useContext(SupportContext);
