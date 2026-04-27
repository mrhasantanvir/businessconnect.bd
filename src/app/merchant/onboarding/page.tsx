import { db as prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { OnboardingWrapper } from "./OnboardingWrapper";

export default async function OnboardingPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const store = await prisma.merchantStore.findUnique({
    where: { id: session.merchantStoreId || "" },
    select: { isOnboarded: true },
  });

  if (store?.isOnboarded) {
    redirect("/dashboard");
  }

  return <OnboardingWrapper />;
}
