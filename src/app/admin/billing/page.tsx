import React from "react";
import { db as prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Activity, ShieldAlert, BadgeCheck, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { ManualAdjustForm } from "./ManualAdjustForm";
import Link from "next/link";

type Props = {
  searchParams: Promise<{ q?: string; page?: string }>;
};

export default async function AdminBillingControlPage(props: Props) {
  const session = await getSession();
  if (!session || session.role !== "SUPER_ADMIN") redirect("/login");

  const searchParams = await props.searchParams;
  const q = searchParams.q || "";
  const page = Math.max(1, parseInt(searchParams.page || "1", 10));
  const pageSize = 10;
  const skip = (page - 1) * pageSize;

  const where = q ? { name: { contains: q } } : {};

  const [merchants, totalCount] = await Promise.all([
    prisma.merchantStore.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
      include: {
        _count: {
          select: { users: true, transactions: true }
        }
      }
    }),
    prisma.merchantStore.count({ where })
  ]);

  // Aggregate totals across all merchants (not just paginated)
  const allTotals = await prisma.merchantStore.aggregate({
    _sum: { smsBalance: true, sipBalance: true }
  });
  const totalSmsInSystem = allTotals._sum.smsBalance || 0;
  const totalSipInSystem = allTotals._sum.sipBalance || 0;

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="p-6 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Activity className="w-6 h-6 text-indigo-600" />
            Billing Control Center
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Global Hub for Merchant Resources & API Limits.
          </p>
        </div>
      </div>

      {/* Global Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
          <p className="text-sm text-gray-500 font-medium mb-1">Active Merchants</p>
          <p className="text-3xl font-black text-gray-900">{merchants.length}</p>
        </div>
        <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
          <p className="text-sm text-gray-500 font-medium mb-1">Total SMS Floating</p>
          <p className="text-3xl font-black text-indigo-600">{totalSmsInSystem}</p>
        </div>
        <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
          <p className="text-sm text-gray-500 font-medium mb-1">Total SIP Floating (Min)</p>
          <p className="text-3xl font-black text-emerald-600">{totalSipInSystem}</p>
        </div>
      </div>

      {/* Merchants Ledger */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="font-semibold text-gray-800">Merchant Resource Ledger</h2>
          <form action="/admin/billing" method="GET" className="flex items-center">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                name="q"
                defaultValue={q}
                placeholder="Search merchants..."
                className="pl-9 pr-4 py-1.5 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none w-full md:w-64"
              />
            </div>
          </form>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-medium">Merchant Store</th>
                <th className="px-6 py-4 font-medium text-center">SMS Left</th>
                <th className="px-6 py-4 font-medium text-center">SIP Left</th>
                <th className="px-6 py-4 font-medium">Manual Adjust</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {merchants.map((merchant) => (
                <tr key={merchant.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900 flex items-center gap-1.5">
                      {merchant.name} 
                      {merchant.plan === "ENTERPRISE" && <BadgeCheck className="w-4 h-4 text-blue-500" />}
                    </div>
                    <div className="text-[10px] text-gray-400 font-mono mt-0.5">ID: {merchant.id}</div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      merchant.smsBalance < 100 ? "bg-red-50 text-red-600" : "bg-indigo-50 text-indigo-600"
                    }`}>
                      {merchant.smsBalance}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      merchant.sipBalance < 50 ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"
                    }`}>
                      {merchant.sipBalance}
                    </span>
                  </td>
                  <td className="px-6 py-4 min-w-[280px]">
                    <ManualAdjustForm merchantStoreId={merchant.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {merchants.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            {q ? "No merchants found for your search." : "No merchants onboarded yet."}
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between text-sm">
            <span className="text-gray-500">
              Showing {skip + 1} to {Math.min(skip + pageSize, totalCount)} of {totalCount}
            </span>
            <div className="flex items-center gap-2">
              <Link 
                href={`/admin/billing?q=${encodeURIComponent(q)}&page=${Math.max(page - 1, 1)}`}
                className={`p-1.5 rounded border border-gray-200 hover:bg-gray-50 ${page === 1 ? 'opacity-50 pointer-events-none' : ''}`}
              >
                <ChevronLeft className="w-4 h-4" />
              </Link>
              <div className="px-3 font-medium text-gray-700">
                Page {page} of {totalPages}
              </div>
              <Link 
                href={`/admin/billing?q=${encodeURIComponent(q)}&page=${Math.min(page + 1, totalPages)}`}
                className={`p-1.5 rounded border border-gray-200 hover:bg-gray-50 ${page === totalPages ? 'opacity-50 pointer-events-none' : ''}`}
              >
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
