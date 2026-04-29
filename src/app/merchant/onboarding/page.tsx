import { db as prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { OnboardingWrapper } from "./OnboardingWrapper";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  if (!session.merchantStoreId) {
     return <OnboardingWrapper />;
  }

  const store = await prisma.merchantStore.findUnique({
    where: { id: session.merchantStoreId },
    select: { isOnboarded: true },
  });

  if (store?.isOnboarded) {
    redirect("/dashboard");
  }

  return <OnboardingWrapper />;
}
