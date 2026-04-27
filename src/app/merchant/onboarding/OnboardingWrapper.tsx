"use client";

import dynamic from "next/dynamic";

const OnboardingClient = dynamic(
  () => import("./OnboardingClient").then((mod) => mod.OnboardingClient),
  { ssr: false }
);

export function OnboardingWrapper() {
  return <OnboardingClient />;
}
