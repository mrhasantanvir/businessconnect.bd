import React from "react";
import { db as prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Shield, Plus, Globe } from "lucide-react";
import { BrandList } from "./BrandList";
import { BrandForm } from "./BrandForm";

export default async function MerchantBrandsPage() {
  const session = await getSession();
  if (!session || !session.merchantStoreId) redirect("/login");

  const brands = await prisma.brand.findMany({
    where: { merchantStoreId: session.merchantStoreId },
    include: {
      _count: { select: { products: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#0F172A] tracking-tight">Enterprise Brand Vault</h1>
          <p className="text-[#64748B] text-sm font-medium mt-1">
            Build authority by linking your products to verified brand identities.
          </p>
        </div>
        <div className="flex items-center gap-3">
           <div className="bg-[#BEF264]/20 text-[#65A30D] px-4 py-2.5 rounded-full text-xs font-bold border border-[#BEF264]/40 flex items-center gap-2">
              <Shield className="w-4 h-4" /> {brands.length} Brands Registered
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left: Brand List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-[#E5E7EB] rounded-[32px] p-8 shadow-sm">
            <h2 className="text-xl font-bold text-[#0F172A] mb-6 flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-500" /> Verified Entities
            </h2>
            <BrandList brands={brands} />
          </div>
        </div>

        {/* Right: Form Panel */}
        <div className="space-y-6 sticky top-8">
           <BrandForm />
        </div>
      </div>
    </div>
  );
}

