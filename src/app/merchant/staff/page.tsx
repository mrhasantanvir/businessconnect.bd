import React from "react";
import { getStaffListAction } from "./staffActions";
import { StaffManagementClient } from "./StaffManagementClient";

export default async function StaffManagementPage() {
  const staff = await getStaffListAction();

  return (
    <div className="p-6 md:p-10 space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#0F172A] tracking-tight">Staff Management</h1>
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Build and manage your business team</p>
        </div>
      </div>

      <StaffManagementClient initialStaff={staff} />
    </div>
  );
}
