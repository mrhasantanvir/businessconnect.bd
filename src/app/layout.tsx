import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/layout/Providers";
import { Shell } from "@/components/layout/Shell";
import { getSession } from "@/lib/auth";
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

  return (
    <html lang="en" className={`${jakarta.variable} h-full`} suppressHydrationWarning>
      <body className="h-full antialiased font-sans">
        <Providers>
          <Shell user={session}>
            {children}
          </Shell>
          <Toaster position="top-right" richColors />
        </Providers>
      </body>
    </html>
  );
}
