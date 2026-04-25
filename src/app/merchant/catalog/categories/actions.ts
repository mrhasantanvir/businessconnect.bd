"use server";

import { db as prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function createOrUpdateCategoryAction(data: {
  id?: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string | null;
  seoTitle?: string;
  seoDescription?: string;
  isFeatured?: boolean;
  image?: string;
}) {
  const session = await getSession();
  if (!session || !session.merchantStoreId) throw new Error("Unauthorized");

  const categoryData = {
    name: data.name,
    slug: data.slug,
    description: data.description,
    parentId: data.parentId || null,
    seoTitle: data.seoTitle,
    seoDescription: data.seoDescription,
    isFeatured: data.isFeatured ?? false,
    image: data.image,
    merchantStoreId: session.merchantStoreId,
  };

  if (data.id) {
    await prisma.category.update({
      where: { id: data.id },
      data: categoryData,
    });
  } else {
    await prisma.category.create({
      data: categoryData,
    });
  }

  revalidatePath("/merchant/catalog/categories");
  return { success: true };
}

export async function deleteCategoryAction(id: string) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  // Check for sub-categories or products
  const countChildren = await prisma.category.count({ where: { parentId: id } });
  const countProducts = await prisma.product.count({ where: { categoryId: id } });

  if (countChildren > 0 || countProducts > 0) {
    throw new Error("Cannot delete category. Move its sub-categories or products first.");
  }

  await prisma.category.delete({ where: { id } });
  revalidatePath("/merchant/catalog/categories");
  return { success: true };
}
