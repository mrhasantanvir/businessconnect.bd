"use server";

import { db as prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function createOrUpdateBranchAction(data: {
  id?: string;
  name: string;
  address?: string;
  phone?: string;
  managerId?: string;
  isActive?: boolean;
}) {
  const session = await getSession();
  if (!session || !session.merchantStoreId) throw new Error("Unauthorized");

  const branchData = {
    name: data.name,
    address: data.address,
    phone: data.phone,
    managerId: data.managerId,
    isActive: data.isActive ?? true,
    merchantStoreId: session.merchantStoreId,
  };

  if (data.id) {
    await prisma.branch.update({
      where: { id: data.id },
      data: branchData,
    });
  } else {
    await prisma.branch.create({
      data: branchData,
    });
  }

  revalidatePath("/merchant/branches");
  return { success: true };
}

export async function deleteBranchAction(id: string) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  // Check for dependencies
  const userCount = await prisma.user.count({ where: { branchId: id } });
  const orderCount = await prisma.order.count({ where: { branchId: id } });

  if (userCount > 0 || orderCount > 0) {
    throw new Error("Cannot delete branch. It has active staff or orders.");
  }

  await prisma.branch.delete({ where: { id } });
  revalidatePath("/merchant/branches");
  return { success: true };
}
