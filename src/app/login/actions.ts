"use server";

import { db as prisma } from "@/lib/db";
import { encrypt } from "@/lib/auth";
import bcrypt from "bcrypt";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function loginAction(formData: FormData) {
  const identifier = formData.get("email") as string; // Could be email or phone
  const password = formData.get("password") as string;

  if (!identifier || !password) {
    return { error: "Credentials are required" };
  }

  try {
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { phone: identifier }
        ]
      },
      include: { customRole: true }
    });

    if (!user) {
      return { error: "Invalid credentials" };
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return { error: "Invalid credentials" };
    }

    // Create the session
    const expires = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours from now
    const session = await encrypt({
      id: user.id,
      userId: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      customRoleId: user.customRoleId,
      permissions: user.customRole?.permissions || [],
      merchantStoreId: user.merchantStoreId,
      expires,
    });

    // Save session in a cookie
    (await cookies()).set("session", session, {
      expires,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    if (user.role === "SUPER_ADMIN") {
      redirect("/admin");
    } else {
      redirect("/dashboard"); 
    }
  } catch (error: any) {
    if (error.message === "NEXT_REDIRECT") throw error;
    console.error("Login error:", error);
    return { error: "Something went wrong. Please try again." };
  }
}

export async function logoutAction() {
  (await cookies()).delete("session");
  redirect("/login");
}
