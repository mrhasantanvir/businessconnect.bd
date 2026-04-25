"use server";

import { db as prisma } from "@/lib/db";
import { encrypt } from "@/lib/auth";
import bcrypt from "bcrypt";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return { error: "Invalid credentials" };
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return { error: "Invalid credentials" };
    }

    const userWithRole = await prisma.user.findUnique({
      where: { email },
      include: { customRole: true }
    });

    if (!userWithRole) return { error: "User not found" };

    // Create the session
    const expires = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours from now
    const session = await encrypt({
      userId: userWithRole.id,
      email: userWithRole.email,
      role: userWithRole.role,
      customRoleId: userWithRole.customRoleId,
      permissions: userWithRole.customRole?.permissions || [],
      merchantStoreId: userWithRole.merchantStoreId,
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
  } catch (error) {
    console.error("Login error:", error);
    return { error: "Something went wrong. Please try again." };
  }

  // Find the correct dashboard based on role
  const user = await prisma.user.findUnique({ where: { email } });
  
  if (user?.role === "SUPER_ADMIN") {
    redirect("/admin");
  } else if (user?.role === "STAFF") {
    redirect("/dashboard"); // Use central dashboard which handles further redirects
  } else {
    redirect("/dashboard"); 
  }
}

export async function logoutAction() {
  (await cookies()).delete("session");
  redirect("/login");
}
