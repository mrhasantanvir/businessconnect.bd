"use server";

import { db as prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function createOrUpdateBrandAction(data: {
  id?: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  website?: string;
  seoTitle?: string;
  seoDescription?: string;
  isFeatured?: boolean;
}) {
  const session = await getSession();
  if (!session || !session.merchantStoreId) throw new Error("Unauthorized");

  const brandData = {
    name: data.name,
    slug: data.slug,
    description: data.description,
    logo: data.logo,
    website: data.website,
    seoTitle: data.seoTitle,
    seoDescription: data.seoDescription,
    isFeatured: data.isFeatured ?? false,
    merchantStoreId: session.merchantStoreId,
  };

  if (data.id) {
    await prisma.brand.update({
      where: { id: data.id },
      data: brandData,
    });
  } else {
    await prisma.brand.create({
      data: brandData,
    });
  }

  revalidatePath("/merchant/catalog/brands");
  return { success: true };
}

export async function deleteBrandAction(id: string) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const countProducts = await prisma.product.count({ where: { brandId: id } });
  if (countProducts > 0) {
    throw new Error("Cannot delete brand. Some products are still linked to it.");
  }

  await prisma.brand.delete({ where: { id } });
  revalidatePath("/merchant/catalog/brands");
  return { success: true };
}
