import React from "react";
import { db as prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Users } from "lucide-react";
import StaffDirectoryClient from "./StaffDirectoryClient";
import { hasPermission } from "@/lib/permissions";

export default async function MerchantStaffPage() {
  const session = await getSession();
  if (!session || !session.merchantStoreId) redirect("/login");

  const canManage = await hasPermission("staff:manage");
  if (!canManage) {
    return (
       <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <div className="w-20 h-20 bg-rose-50 rounded-[32px] flex items-center justify-center text-rose-500">
             <Users className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter italic">Access Denied</h2>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest text-center max-w-xs">
             Your node is not authorized for HR operations. Please contact the Fleet Commander.
          </p>
       </div>
    );
  }

  const staffMembers = await prisma.user.findMany({
    where: { 
      merchantStoreId: session.merchantStoreId,
      role: { in: ["STAFF", "DRIVER"] }
    },
    include: {
      staffProfile: true,
      branch: true,
      customRole: true,
      _count: { select: { commissions: true, driverOrders: true } }
    },
    orderBy: { createdAt: "desc" }
  });

  const roles = await prisma.role.findMany({
    where: { merchantStoreId: session.merchantStoreId }
  });

  return (
    <div className="w-full max-w-7xl mx-auto py-10">
      <StaffDirectoryClient initialStaff={staffMembers} roles={roles} />
    </div>
  );
}
