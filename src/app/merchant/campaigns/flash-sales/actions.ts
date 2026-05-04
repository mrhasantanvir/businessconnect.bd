"use server";

import { db as prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function createFlashSaleAction(data: {
  name: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  items: {
    productId: string;
    salePrice: number;
    stockLimit: number;
  }[];
}) {
  const session = await getSession();
  if (!session?.merchantStoreId) throw new Error("Unauthorized");

  const flashSale = await prisma.flashSale.create({
    data: {
      merchantStoreId: session.merchantStoreId,
      name: data.name,
      description: data.description,
      startTime: data.startTime,
      endTime: data.endTime,
      items: {
        create: data.items.map(item => ({
          productId: item.productId,
          salePrice: item.salePrice,
          stockLimit: item.stockLimit,
        }))
      },
      createdBy: session.userId,
      updatedBy: session.userId
    }
  });

  revalidatePath("/merchant/campaigns/flash-sales");
  return flashSale;
}

export async function getFlashSalesAction() {
  const session = await getSession();
  if (!session?.merchantStoreId) throw new Error("Unauthorized");

  return await prisma.flashSale.findMany({
    where: { merchantStoreId: session.merchantStoreId },
    include: {
      items: {
        include: {
          product: true
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });
}

export async function updateFlashSaleStatusAction(id: string, status: string) {
  const session = await getSession();
  if (!session?.merchantStoreId) throw new Error("Unauthorized");

  await prisma.flashSale.update({
    where: { id, merchantStoreId: session.merchantStoreId },
    data: { status }
  });

  revalidatePath("/merchant/campaigns/flash-sales");
}

export async function deleteFlashSaleAction(id: string) {
  const session = await getSession();
  if (!session?.merchantStoreId) throw new Error("Unauthorized");

  await prisma.flashSale.delete({
    where: { id, merchantStoreId: session.merchantStoreId }
  });

  revalidatePath("/merchant/campaigns/flash-sales");
}
