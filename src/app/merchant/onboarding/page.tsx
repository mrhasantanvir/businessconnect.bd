import { db as prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { OnboardingWrapper } from "./OnboardingWrapper";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  try {
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
  } catch (error: any) {
    console.error("OnboardingPage Error:", error);
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-8 bg-white rounded-3xl shadow-xl">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
          <p className="text-slate-600 mb-6">{error.message || "Failed to load onboarding"}</p>
          <a href="/login" className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold">Back to Login</a>
        </div>
      </div>
    );
  }
}
