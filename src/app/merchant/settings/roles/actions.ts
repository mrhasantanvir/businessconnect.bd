"use server";

import { db as prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function createRoleAction(data: { name: string, permissions: string[] }) {
  const session = await getSession();
  if (!session || !session.merchantStoreId) throw new Error("Unauthorized");

  const role = await prisma.role.create({
    data: {
      name: data.name,
      permissions: JSON.stringify(data.permissions),
      merchantStoreId: session.merchantStoreId
    }
  });

  revalidatePath("/merchant/settings/roles");
  return role;
}

export async function updateRoleAction(id: string, data: { name: string, permissions: string[] }) {
  const session = await getSession();
  if (!session || !session.merchantStoreId) throw new Error("Unauthorized");

  const role = await prisma.role.update({
    where: { id, merchantStoreId: session.merchantStoreId },
    data: {
      name: data.name,
      permissions: JSON.stringify(data.permissions)
    }
  });

  revalidatePath("/merchant/settings/roles");
  return role;
}

export async function deleteRoleAction(id: string) {
  const session = await getSession();
  if (!session || !session.merchantStoreId) throw new Error("Unauthorized");

  await prisma.role.delete({
    where: { id, merchantStoreId: session.merchantStoreId }
  });

  revalidatePath("/merchant/settings/roles");
  return { success: true };
}

