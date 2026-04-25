"use server";

import { db as prisma } from "@/lib/db";
import { encrypt } from "@/lib/auth-edge";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

export async function customerSignupAction(formData: any, storeId: string) {
  const { name, email, phone, password } = formData;

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) return { error: "Email already registered." };

  const hashedPassword = await bcrypt.hash(password, 10);

  // Create User and Customer profile
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: "CUSTOMER",
      merchantStoreId: storeId,
      customer: {
        create: {
          name,
          phone,
          merchantStoreId: storeId,
        }
      }
    },
    include: { customer: true }
  });

  // Create Session
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  const session = await encrypt({ 
    userId: user.id, 
    role: user.role, 
    customerId: user.customer?.id,
    merchantStoreId: storeId,
    expires 
  });

  (await cookies()).set("session", session, { expires, httpOnly: true });

  return { success: true };
}

export async function customerLoginAction(formData: any, storeId: string) {
  const { email, password } = formData;

  const user = await prisma.user.findUnique({ 
    where: { email },
    include: { customer: true }
  });

  if (!user || user.role !== "CUSTOMER") return { error: "Invalid credentials." };

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) return { error: "Invalid credentials." };

  // Create Session
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  const session = await encrypt({ 
    userId: user.id, 
    role: user.role, 
    customerId: user.customer?.id,
    merchantStoreId: storeId,
    expires 
  });

  (await cookies()).set("session", session, { expires, httpOnly: true });

  return { success: true };
}
