"use server";

import { db as prisma } from "@/lib/db";
import { cookies } from "next/headers";
import { decrypt } from "@/lib/auth";
import { revalidatePath } from "next/cache";

async function getSession() {
  const session = (await cookies()).get("session")?.value;
  if (!session) return null;
  return await decrypt(session);
}

export async function getWarehousesAction() {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  return await prisma.warehouse.findMany({
    where: { merchantStoreId: session.merchantStoreId as string },
    include: {
      stocks: {
        include: {
          product: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
}

export async function createWarehouseAction(data: { name: string; location: string; isDefault: boolean }) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const warehouse = await prisma.warehouse.create({
    data: {
      ...data,
      merchantStoreId: session.merchantStoreId as string,
      createdBy: session.userId,
      updatedBy: session.userId
    }
  });

  if (data.isDefault) {
    await prisma.warehouse.updateMany({
      where: {
        merchantStoreId: session.merchantStoreId as string,
        id: { not: warehouse.id }
      },
      data: { isDefault: false }
    });
  }

  revalidatePath("/merchant/inventory/warehouses");
  return warehouse;
}

export async function updateWarehouseAction(id: string, data: { name: string; location: string; isDefault: boolean }) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const warehouse = await prisma.warehouse.update({
    where: { id, merchantStoreId: session.merchantStoreId as string },
    data
  });

  if (data.isDefault) {
    await prisma.warehouse.updateMany({
      where: {
        merchantStoreId: session.merchantStoreId as string,
        id: { not: warehouse.id }
      },
      data: { isDefault: false }
    });
  }

  revalidatePath("/merchant/inventory/warehouses");
  return warehouse;
}

export async function deleteWarehouseAction(id: string) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  await prisma.warehouse.delete({
    where: { id, merchantStoreId: session.merchantStoreId as string }
  });

  revalidatePath("/merchant/inventory/warehouses");
  return { success: true };
}

export async function updateStockAction(warehouseId: string, productId: string, quantity: number, type: 'ADD' | 'SET') {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const existingStock = await prisma.warehouseStock.findUnique({
    where: {
      warehouseId_productId: {
        warehouseId,
        productId
      }
    }
  });

  const newQuantity = type === 'SET' ? quantity : (existingStock?.quantity || 0) + quantity;

  await prisma.warehouseStock.upsert({
    where: {
      warehouseId_productId: {
        warehouseId,
        productId
      }
    },
    update: { quantity: newQuantity },
    create: {
      warehouseId,
      productId,
      quantity: newQuantity
    }
  });

  // [Advanced Accounting] Record Purchase Cost if quantity added
  if (type === 'ADD' && quantity > 0) {
    try {
      const product = await prisma.product.findUnique({ where: { id: productId } });
      if (product && product.purchasePrice > 0) {
        const totalCost = product.purchasePrice * quantity;
        
        // Find or Create "Inventory Purchase" category
        let purchaseCategory = await prisma.accountCategory.findFirst({
           where: { name: "Inventory Purchase", merchantStoreId: session.merchantStoreId as string }
        });

        if (!purchaseCategory) {
           purchaseCategory = await prisma.accountCategory.create({
              data: { name: "Inventory Purchase", type: "EXPENSE", merchantStoreId: session.merchantStoreId as string }
           });
        }

        // Find Default Cash Account
        const defaultAccount = await prisma.businessAccount.findFirst({
           where: { merchantStoreId: session.merchantStoreId as string, type: "CASH" }
        });

        await prisma.ledgerTransaction.create({
           data: {
              amount: totalCost,
              type: "EXPENSE",
              description: `Automated Purchase: ${product.name} (Qty: ${quantity})`,
              merchantStoreId: session.merchantStoreId as string,
              userId: session.userId,
              categoryId: purchaseCategory.id,
              accountId: defaultAccount?.id || null,
              date: new Date()
           }
        });

        // Update Account Balance
        if (defaultAccount) {
           await prisma.businessAccount.update({
              where: { id: defaultAccount.id },
              data: { balance: { decrement: totalCost } }
           });
        }
      }
    } catch (err) {
      console.error("[Purchase Accounting Failed]:", err);
    }
  }

  revalidatePath("/merchant/inventory/warehouses");
  return { success: true };
}

export async function initializeWarehousesAction() {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  const storeId = session.merchantStoreId as string;

  // 1. Create Main Hub
  const mainHub = await prisma.warehouse.create({
    data: {
      name: "Main Distribution Center",
      location: "Dhaka Central",
      isDefault: true,
      merchantStoreId: storeId,
      createdBy: session.userId,
      updatedBy: session.userId
    }
  });

  // 2. Create Secondary Hub
  await prisma.warehouse.create({
    data: {
      name: "Secondary Storage Hub",
      location: "Chittagong Port",
      isDefault: false,
      merchantStoreId: storeId,
      createdBy: session.userId,
      updatedBy: session.userId
    }
  });

  // 3. Get all products
  const products = await prisma.product.findMany({
    where: { merchantStoreId: storeId }
  });

  // 4. Move all products to Main Hub with current stock
  if (products.length > 0) {
    // Check if they already have stocks in this warehouse to avoid unique constraint issues
    for (const p of products) {
      await prisma.warehouseStock.upsert({
        where: {
          warehouseId_productId: {
            warehouseId: mainHub.id,
            productId: p.id
          }
        },
        update: { quantity: p.stock || 0 },
        create: {
          warehouseId: mainHub.id,
          productId: p.id,
          quantity: p.stock || 0
        }
      });
    }
  }

  revalidatePath("/merchant/inventory/warehouses");
  return { success: true, productCount: products.length };
}
