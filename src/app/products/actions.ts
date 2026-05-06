"use server";

import { db as prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { writeFile } from "fs/promises";
import path from "path";

/** Catalog Setup */
export async function getStoreCategoriesAction() {
  const session = await getSession();
  if (!session || !session.merchantStoreId) return [];

  // Fetch all categories; we will build the tree on the client or in a helper
  return await prisma.category.findMany({
    where: { merchantStoreId: session.merchantStoreId },
    include: {
      _count: { select: { children: true } }
    }
  });
}

export async function getStoreBrandsAction() {
  const session = await getSession();
  if (!session || !session.merchantStoreId) return [];

  return await prisma.brand.findMany({
    where: { merchantStoreId: session.merchantStoreId },
    orderBy: { name: "asc" }
  });
}

export async function createCategoryAction(data: { name: string, slug: string, parentId?: string }) {
  const session = await getSession();
  if (!session || !session.merchantStoreId) throw new Error("Unauthorized");

  await prisma.category.create({
    data: {
      name: data.name,
      slug: data.slug,
      parentId: data.parentId || null,
      merchantStoreId: session.merchantStoreId,
      createdBy: session.userId,
      updatedBy: session.userId
    }
  });

  revalidatePath("/products/add");
  return { success: true };
}

/** Product Add Extension */
export async function createProductAction(data: {
  name: string;
  description: string;
  price: number;
  stock: number;
  sku?: string;
  barcode?: string;
  categoryId?: string;
  brandId?: string;
  unitType: string;
  unitWeight?: number;
  isHomeDelivery?: boolean;
  isCollectionPoint?: boolean;
  allowedCouriers?: string;
  shippingType?: string;
  paymentPolicy?: string;
  partialAmount?: number;
  purchasePrice?: number;
  discountPrice?: number;
  isFreeDelivery?: boolean;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  allowedDistricts?: string;
  preferredCourier?: string;
  image?: string | null;
}) {
  const session = await getSession();
  if (!session || !session.merchantStoreId) throw new Error("Unauthorized");

  console.log(">>> [createProductAction] Received Data:", data);

  try {
    const product = await prisma.product.create({
      data: {
      name: data.name,
      slug: (data.seoTitle || data.name).toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '') + '-' + Date.now(),
      description: data.description,
      price: data.price,
      stock: data.stock,
      sku: data.sku || `PROD-${Date.now()}`,
      barcode: data.barcode,
      categoryId: data.categoryId || null,
      brandId: data.brandId || null,
      unitType: data.unitType || "piece",
      unitWeight: data.unitWeight,
      allowedDistricts: data.allowedDistricts,
      preferredCourier: data.preferredCourier,
      isHomeDelivery: data.isHomeDelivery ?? true,
      isCollectionPoint: data.isCollectionPoint ?? false,
      allowedCouriers: data.allowedCouriers,
      shippingType: data.shippingType || "GENERAL",
      paymentPolicy: data.paymentPolicy || "COD",
      partialAmount: data.partialAmount || 0,
      purchasePrice: data.purchasePrice || 0,
      originalPrice: data.discountPrice || data.price,
      discountPrice: data.discountPrice || 0,
      isFreeDelivery: data.isFreeDelivery ?? false,
      seoTitle: data.seoTitle,
      seoDescription: data.seoDescription,
      seoKeywords: data.seoKeywords,
      image: data.image,
      wholesalePrice: (data as any).wholesalePrice || 0,
      minWholesaleQty: (data as any).minWholesaleQty || 0,
      width: (data as any).width || 0,
      height: (data as any).height || 0,
      length: (data as any).length || 0,
      handlingClass: (data as any).handlingClass || "GENERAL",
      merchantStoreId: session.merchantStoreId,
      createdBy: session.userId,
      updatedBy: session.userId
    }
  });

    revalidatePath("/products/add");
    revalidatePath("/merchant/catalog");
    return product;
  } catch (err: any) {
    console.error(">>> [createProductAction] ERROR:", err);
    console.error(">>> [createProductAction] ERROR MESSAGE:", err.message);
    console.error(">>> [createProductAction] ERROR CODE:", err.code);
    throw new Error(`Product launch failed: ${err.message}`);
  }
}

export async function uploadProductImageAction(formData: FormData) {
  const file = formData.get("file") as File;
  if (!file) throw new Error("No file uploaded");

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const filename = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
  const uploadPath = path.join(process.cwd(), "public", "uploads", "products", filename);

  await writeFile(uploadPath, buffer);

  return { url: `/uploads/products/${filename}` };
}

export async function getStoreProductsAction() {
  const session = await getSession();
  if (!session || !session.merchantStoreId) return [];

  return await prisma.product.findMany({
    where: { merchantStoreId: session.merchantStoreId },
    include: {
      category: { select: { name: true } },
      brand: { select: { name: true } }
    },
    orderBy: { createdAt: "desc" }
  });
}

export async function deleteProductAction(id: string) {
  const session = await getSession();
  if (!session || !session.merchantStoreId) throw new Error("Unauthorized");

  await prisma.product.delete({
    where: { 
      id,
      merchantStoreId: session.merchantStoreId 
    }
  });

  revalidatePath("/merchant/catalog");
  return { success: true };
}
