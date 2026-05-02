"use server";

import { db as prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import bcrypt from "bcrypt";

export async function updateProfileAction(data: {
  name?: string;
  email?: string;
  phone?: string;
  image?: string;
  coverImage?: string;
  currentPassword?: string;
  newPassword?: string;
}) {
  const session = await getSession();
  if (!session || !session.id) {
    throw new Error("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.id }
  });

  if (!user) throw new Error("User not found");

  const updateData: any = {};

  if (data.name) updateData.name = data.name;
  if (data.email && data.email !== user.email) {
    // Check if email already exists
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw new Error("Email already in use");
    updateData.email = data.email;
  }
  if (data.phone) updateData.phone = data.phone;
  if (data.image) updateData.image = data.image;
  if (data.coverImage) updateData.coverImage = data.coverImage;

  // Password change logic
  if (data.newPassword) {
    if (!data.currentPassword) throw new Error("Current password required to set new password");
    
    const isMatch = await bcrypt.compare(data.currentPassword, user.password);
    if (!isMatch) throw new Error("Incorrect current password");

    updateData.password = await bcrypt.hash(data.newPassword, 10);
  }

  await prisma.user.update({
    where: { id: session.id },
    data: updateData
  });

  revalidatePath("/");
  return { success: true };
}
