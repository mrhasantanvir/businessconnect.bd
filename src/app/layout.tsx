import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/layout/Providers";
import { Shell } from "@/components/layout/Shell";
import { getSession } from "@/lib/auth";
import { db as prisma } from "@/lib/db";
import { Toaster } from "sonner";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
});

export const metadata: Metadata = {
  title: "BusinessConnect.bd | Enterprise Business OS",
  description: "The leading AI-First Business Operating System for Bangladesh.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let session = null;
  try {
    session = await getSession();
  } catch (error) {
    console.error("Failed to get session:", error);
  }

  let activationStatus = "ACTIVE"; // Default for staff/admin
  let adminNotifications = 0;

  try {
    if (session?.role === "MERCHANT" && session?.merchantStoreId) {
       const store = await prisma.merchantStore.findUnique({
          where: { id: session.merchantStoreId },
          select: { activationStatus: true, invoices: { where: { status: 'PENDING', dueDate: { lt: new Date() } } } }
       });
       activationStatus = store?.activationStatus || "PENDING";
       
       if (store?.invoices && store.invoices.length > 0) {
          activationStatus = "BILLING_RESTRICTED";
       }
    } else if (session?.role === "STAFF" && session?.userId) {
       const profile = await prisma.staffProfile.findUnique({
          where: { userId: session.userId },
          select: { status: true }
       });
       if (profile?.status === "ONBOARDING") {
          activationStatus = "STAFF_ONBOARDING";
       } else if (profile?.status === "SUSPENDED") {
          activationStatus = "SUSPENDED";
       }
    } else if (session?.role === "SUPER_ADMIN") {
       const pendingOnboarding = await prisma.merchantStore.count({ where: { activationStatus: "PENDING" } });
       const pendingDocs = await prisma.merchantStore.count({ where: { activationStatus: "DOCUMENTS_REJECTED" } });
       adminNotifications = pendingOnboarding + pendingDocs;
    }
  } catch (error) {
    console.error("Database access error in RootLayout:", error);
    // Fallback to default values if DB is down
  }

  return (
    <html lang="en" className={`${jakarta.variable} h-full`} suppressHydrationWarning>
      <body className="h-full antialiased font-sans">
        <Providers>
          <Shell user={{ ...session, activationStatus, adminNotifications }}>
            {children}
          </Shell>
          <Toaster position="top-right" richColors />
        </Providers>
      </body>
    </html>
  );
}
