import { db as prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import dynamic from "next/dynamic";

const OnboardingClientNoSSR = dynamic(
  () => import("./OnboardingClient").then((mod) => mod.OnboardingClient),
  { ssr: false }
);

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

  return <OnboardingClientNoSSR />;
}
