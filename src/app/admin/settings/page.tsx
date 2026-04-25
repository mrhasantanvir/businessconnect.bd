import React from "react";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminSettingsUI } from "@/components/admin/AdminSettingsUI";

export default async function AdminSettingsPage() {
  const session = await getSession();
  
  // Security check: Only SUPER_ADMIN can configure system settings
  if (!session || session.role !== "SUPER_ADMIN") {
    redirect("/login");
  }

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8">
      <AdminSettingsUI />
    </div>
  );
}
