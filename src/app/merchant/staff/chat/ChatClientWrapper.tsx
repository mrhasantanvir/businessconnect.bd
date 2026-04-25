"use client";

import React, { useState } from "react";
import { ChatPolicyModal } from "./ChatPolicyModal";

export function ChatClientWrapper({ 
  hasAcceptedPolicy, 
  children 
}: { 
  hasAcceptedPolicy: boolean, 
  children: React.ReactNode 
}) {
  const [accepted, setAccepted] = useState(hasAcceptedPolicy);

  if (!accepted) {
    return <ChatPolicyModal onAccepted={() => setAccepted(true)} />;
  }

  return <>{children}</>;
}
