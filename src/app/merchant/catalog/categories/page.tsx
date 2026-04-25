import React from "react";
import { db as prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { FolderTree, Plus, Globe } from "lucide-react";
import { CategoryList } from "./CategoryList";
import { CategoryForm } from "./CategoryForm";

export default async function MerchantCategoriesPage() {
  const session = await getSession();
  if (!session || !session.merchantStoreId) redirect("/login");

  const categories = await prisma.category.findMany({
    where: { merchantStoreId: session.merchantStoreId },
    include: {
      _count: { select: { products: true, children: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Build a three-level tree for the UI
  const rootCategories = categories.filter((c) => !c.parentId);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#0F172A] tracking-tight">International Catalog Hub</h1>
          <p className="text-[#64748B] text-sm font-medium mt-1">
            Manage hierarchical categories with 3-level depth and SEO intelligence.
          </p>
        </div>
        <div className="flex items-center gap-3">
           <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-xs font-bold border border-blue-100 flex items-center gap-2">
              <FolderTree className="w-4 h-4" /> {categories.length} Total Nodes
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left: Category Tree View */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-[#E5E7EB] rounded-[32px] p-8 shadow-sm">
            <h2 className="text-xl font-bold text-[#0F172A] mb-6 flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-500" /> Catalog Hierarchy
            </h2>
            <CategoryList categories={categories} />
          </div>
        </div>

        {/* Right: Form Panel */}
        <div className="space-y-6 sticky top-8">
           <CategoryForm allCategories={categories} />
        </div>
      </div>
    </div>
  );
}

