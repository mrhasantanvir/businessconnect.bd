"use server";

import { db as prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function stockInAction(barcode: string, quantity: number, warehouseId?: string, binLocation?: string) {
  const session = await getSession();
  if (!session || !session.merchantStoreId) throw new Error("Unauthorized");

  // @ts-ignore - Handle SKU/Barcode before Prisma client regeneration is complete
  const product = await prisma.product.findFirst({
    where: {
      merchantStoreId: session.merchantStoreId,
      OR: [
        { barcode },
        // @ts-ignore
        { sku: barcode }
      ]
    }
  });

  if (!product) {
    return { success: false, error: "Product not found. Please register the barcode first." };
  }

  let targetWarehouseId = warehouseId;
  if (!targetWarehouseId) {
    const defaultWH = await prisma.warehouse.findFirst({
      where: { merchantStoreId: session.merchantStoreId, isDefault: true }
    });
    targetWarehouseId = defaultWH?.id;
  }

  if (!targetWarehouseId) {
    return { success: false, error: "No warehouse found. Please create a warehouse first." };
  }

  const stock = await prisma.warehouseStock.upsert({
    where: {
      warehouseId_productId: {
        warehouseId: targetWarehouseId,
        productId: product.id
      }
    },
    update: { 
      quantity: { increment: quantity },
      // @ts-ignore
      binLocation: binLocation || undefined
    },
    create: {
      warehouseId: targetWarehouseId,
      productId: product.id,
      quantity: quantity,
      // @ts-ignore
      binLocation: binLocation || null
    }
  });

  await prisma.product.update({
    where: { id: product.id },
    data: { stock: { increment: quantity } }
  });

  await prisma.inventoryLog.create({
    data: {
      merchantStoreId: session.merchantStoreId,
      warehouseId: targetWarehouseId,
      productId: product.id,
      userId: session.userId,
      type: "STOCK_IN",
      quantity: quantity,
      previousStock: product.stock,
      newStock: product.stock + quantity,
      reason: "Barcode Scanner Inbound"
    }
  });

  revalidatePath("/merchant/wms/inventory");
  return { success: true, productName: product.name, newTotal: product.stock + quantity };
}

/** RESTORED ACTIONS */

export async function adjustStockAction(data: {
  warehouseId: string;
  productId: string;
  type: "STOCK_IN" | "STOCK_OUT" | "ADJUSTMENT" | "DAMAGE";
  quantity: number;
  reason: string;
}) {
  const session = await getSession();
  if (!session || !session.merchantStoreId) throw new Error("Unauthorized");

  const { warehouseId, productId, type, quantity, reason } = data;

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw new Error("Product not found");

  const currentWHStock = await prisma.warehouseStock.findUnique({
    where: { warehouseId_productId: { warehouseId, productId } }
  });

  const prevStock = currentWHStock?.quantity || 0;
  let newStock = prevStock;

  if (type === "STOCK_IN") newStock += quantity;
  else if (type === "STOCK_OUT" || type === "DAMAGE") newStock -= quantity;
  else newStock = quantity; // Absolute adjustment

  await prisma.warehouseStock.upsert({
    where: { warehouseId_productId: { warehouseId, productId } },
    update: { quantity: newStock },
    create: { warehouseId, productId, quantity: newStock }
  });

  // Log
  await prisma.inventoryLog.create({
    data: {
      merchantStoreId: session.merchantStoreId,
      warehouseId,
      productId,
      type,
      quantity,
      previousStock: prevStock,
      newStock,
      reason,
      userId: session.userId
    }
  });

  revalidatePath("/merchant/wms/inventory");
}

export async function processReturnAction(data: {
  orderId: string;
  warehouseId: string;
  status: "RESTOCKED" | "DAMAGED" | "REJECTED";
  reason: string;
  items: any[];
}) {
  const session = await getSession();
  if (!session || !session.merchantStoreId) throw new Error("Unauthorized");

  const { orderId, warehouseId, status, reason, items } = data;

  return await prisma.$transaction(async (tx) => {
    // 1. Create Return Request
    const record = await tx.returnRequest.create({
       data: {
         merchantStoreId: session.merchantStoreId!,
         orderId,
         warehouseId,
         status,
         reason,
         items: JSON.stringify(items)
       }
    });

    // 2. If RESTOCKED, update stock
    if (status === "RESTOCKED") {
      for (const item of items) {
        const whStock = await tx.warehouseStock.upsert({
          where: { warehouseId_productId: { warehouseId, productId: item.productId } },
          update: { quantity: { increment: item.quantity } },
          create: { warehouseId, productId: item.productId, quantity: item.quantity }
        });

        await tx.inventoryLog.create({
          data: {
            merchantStoreId: session.merchantStoreId!,
            warehouseId,
            productId: item.productId,
            type: "RETURN",
            quantity: item.quantity,
            previousStock: whStock.quantity - item.quantity,
            newStock: whStock.quantity,
            reason: `RMA Restock: ${orderId}`,
            userId: session.userId
          }
        });
      }
    }

    // 3. Update Order status if needed
    await tx.order.update({
      where: { id: orderId },
      data: { status: "RETURNED" }
    });

    return record;
  });
}

export async function initiateTransferAction(data: {
  fromWarehouseId: string;
  toWarehouseId: string;
  items: { productId: string; quantity: number }[];
  notes?: string;
}) {
  const session = await getSession();
  if (!session || !session.merchantStoreId) throw new Error("Unauthorized");

  const { fromWarehouseId, toWarehouseId, items, notes } = data;

  await prisma.$transaction(async (tx) => {
    for (const item of items) {
      // Deduct from Source
      await tx.warehouseStock.update({
        where: { warehouseId_productId: { warehouseId: fromWarehouseId, productId: item.productId } },
        data: { quantity: { decrement: item.quantity } }
      });

      // Add to Destination
      await tx.warehouseStock.upsert({
        where: { warehouseId_productId: { warehouseId: toWarehouseId, productId: item.productId } },
        update: { quantity: { increment: item.quantity } },
        create: { warehouseId: toWarehouseId, productId: item.productId, quantity: item.quantity }
      });
    }

    // Create Transfer Record
    await tx.stockTransfer.create({
      data: {
        merchantStoreId: session.merchantStoreId!,
        fromWarehouseId,
        toWarehouseId,
        status: "COMPLETED",
        items: JSON.stringify(items),
        notes
      }
    });
  });

  revalidatePath("/merchant/wms/transfers");
}

export async function upsertWarehouseAction(data: {
  id?: string;
  name: string;
  location?: string;
  isDefault?: boolean;
}) {
  const session = await getSession();
  if (!session || !session.merchantStoreId) throw new Error("Unauthorized");

  const { id, name, location, isDefault } = data;

  if (id) {
    return await prisma.warehouse.update({
      where: { id },
      data: { name, location, isDefault }
    });
  } else {
    return await prisma.warehouse.create({
      data: {
        merchantStoreId: session.merchantStoreId,
        name,
        location,
        isDefault
      }
    });
  }
}
