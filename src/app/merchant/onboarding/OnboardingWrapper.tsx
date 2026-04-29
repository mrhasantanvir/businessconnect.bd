"use client";

import dynamic from "next/dynamic";

const OnboardingClient = dynamic(
  () => import("./OnboardingClient").then((mod) => mod.OnboardingClient),
  { ssr: false, loading: () => (
    <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
      <div className="animate-pulse font-black text-indigo-600 uppercase tracking-widest text-sm">Initializing Onboarding Grid...</div>
    </div>
  ) }
);

export function OnboardingWrapper() {
  return <OnboardingClient />;
}
