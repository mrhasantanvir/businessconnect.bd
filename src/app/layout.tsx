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
  const session = await getSession();
  let activationStatus = "ACTIVE"; // Default for staff/admin
  
  if (session?.role === "MERCHANT" && session?.merchantStoreId) {
     const store = await prisma.merchantStore.findUnique({
        where: { id: session.merchantStoreId },
        select: { activationStatus: true, invoices: { where: { status: 'PENDING', dueDate: { lt: new Date() } } } }
     });
     activationStatus = store?.activationStatus || "PENDING";
     
     if (store?.invoices && store.invoices.length > 0) {
        activationStatus = "BILLING_RESTRICTED";
     }
  }

  return (
    <html lang="en" className={`${jakarta.variable} h-full`} suppressHydrationWarning>
      <body className="h-full antialiased font-sans">
        <Providers>
          <Shell user={{ ...session, activationStatus }}>
            {children}
          </Shell>
          <Toaster position="top-right" richColors />
        </Providers>
      </body>
    </html>
  );
}
