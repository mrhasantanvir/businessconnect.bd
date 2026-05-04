import React from "react";
import { db as prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { TaxSettingsClient } from "./TaxSettingsClient";

export default async function TaxSettingsPage() {
  const session = await getSession();
  if (!session || !session.merchantStoreId) redirect("/login");

  // Use queryRaw to bypass stale Prisma Client on Windows
  const stores = await prisma.$queryRaw<any[]>`
    SELECT isVatEnabled, vatRate, binNumber, name 
    FROM MerchantStore 
    WHERE id = ${session.merchantStoreId}
    LIMIT 1
  `;
  const store = stores[0];

  if (!store) redirect("/dashboard");

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20">
      <div className="space-y-4">
         <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">
            NBR <span className="text-indigo-600">Tax & VAT</span> Compliance
         </h1>
         <p className="text-slate-500 text-sm font-bold max-w-xl uppercase tracking-widest leading-relaxed">
            Configure your business for Bangladesh National Board of Revenue (NBR) standards.
         </p>
      </div>

      <TaxSettingsClient initialData={store} />
    </div>
  );
}

