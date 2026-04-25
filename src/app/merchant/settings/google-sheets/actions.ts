"use server";

import { db as prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { pushOrdersToSheet, pullProductsFromSheet } from "@/lib/google-sheets";

export async function updateGoogleSheetsSettingsAction(data: { spreadsheetId: string, sheetName: string }) {
  const session = await getSession();
  if (!session || !session.merchantStoreId) throw new Error("Unauthorized");

  await prisma.googleSheetsConfig.update({
    where: { merchantStoreId: session.merchantStoreId },
    data: {
      spreadsheetId: data.spreadsheetId,
      sheetName: data.sheetName
    }
  });

  revalidatePath("/merchant/settings/google-sheets");
  return { success: true };
}

export async function disconnectGoogleSheetsAction() {
  const session = await getSession();
  if (!session || !session.merchantStoreId) throw new Error("Unauthorized");

  await prisma.googleSheetsConfig.update({
    where: { merchantStoreId: session.merchantStoreId },
    data: {
      isActive: false,
      accessToken: null,
      refreshToken: null,
      expiryDate: null
    }
  });

  revalidatePath("/merchant/settings/google-sheets");
  return { success: true };
}

export async function manualPushOrdersToSheetAction() {
  const session = await getSession();
  if (!session || !session.merchantStoreId) throw new Error("Unauthorized");

  const orders = await prisma.order.findMany({
    where: { merchantStoreId: session.merchantStoreId },
    orderBy: { createdAt: "desc" },
    take: 50 // Pull last 50 for testing/manual sync
  });

  try {
    await pushOrdersToSheet(session.merchantStoreId, orders);
    return { success: true, count: orders.length };
  } catch (err: any) {
    console.error("Manual Push Error:", err);
    return { success: false, error: err.message };
  }
}

export async function importProductsFromSheetAction() {
  const session = await getSession();
  if (!session || !session.merchantStoreId) throw new Error("Unauthorized");

  try {
    const productsFromSheet = await pullProductsFromSheet(session.merchantStoreId);
    
    // Process each product
    for (const item of productsFromSheet) {
      if (!item.sku) continue;

      // Ensure SKU is unique slug if missing
      const slug = item.name.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "") + "-" + item.sku;

      await prisma.product.upsert({
        where: { 
          merchantStoreId_sku: {
            merchantStoreId: session.merchantStoreId,
            sku: item.sku
          }
        },
        update: {
          name: item.name,
          price: item.price,
          originalPrice: item.originalPrice,
          description: item.description,
          stock: item.stock
        },
        create: {
          merchantStoreId: session.merchantStoreId,
          sku: item.sku,
          name: item.name,
          slug: slug,
          price: item.price,
          originalPrice: item.originalPrice,
          description: item.description,
          stock: item.stock
        }
      });

      // Update Warehouse Stock (Default Warehouse)
      const defaultWarehouse = await prisma.warehouse.findFirst({
        where: { merchantStoreId: session.merchantStoreId, isDefault: true }
      });

      if (defaultWarehouse) {
        const product = await prisma.product.findFirst({
            where: { merchantStoreId: session.merchantStoreId, sku: item.sku }
        });

        if (product) {
            await prisma.warehouseStock.upsert({
              where: {
                warehouseId_productId: {
                  warehouseId: defaultWarehouse.id,
                  productId: product.id
                }
              },
              update: { quantity: item.stock },
              create: {
                warehouseId: defaultWarehouse.id,
                productId: product.id,
                quantity: item.stock
              }
            });
        }
      }
    }

    revalidatePath("/merchant/catalog/products");
    return { success: true, count: productsFromSheet.length };

  } catch (err: any) {
    console.error("Manual Pull Products Error:", err);
    return { success: false, error: err.message };
  }
}
