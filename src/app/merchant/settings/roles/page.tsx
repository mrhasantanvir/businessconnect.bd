import React from "react";
import { db as prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import RoleManagement from "./RoleManagement";

export default async function RolesPage() {
  const session = await getSession();
  if (!session || !session.merchantStoreId) redirect("/login");

  const roles = await prisma.role.findMany({
    where: { merchantStoreId: session.merchantStoreId },
    include: {
      _count: { select: { users: true } }
    },
    orderBy: { createdAt: "desc" }
  });

  const parsedRoles = roles.map(role => ({
    ...role,
    permissions: JSON.parse(role.permissions as string || "[]")
  }));

  return (
    <div className="max-w-7xl mx-auto p-8">
      <RoleManagement initialRoles={parsedRoles} />
    </div>
  );
}
