"use client";

import React from "react";
import { StaffProfileCard } from "@/components/merchant/staff/StaffProfileCard";
import { updateStaffInfoAction } from "../staffActions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Settings2 } from "lucide-react";
import Link from "next/link";
import { getStaffActivityStatsAction } from "../staffActions";

export default function StaffProfileView({ staff }: { staff: any }) {
  const router = useRouter();
  const [activityStats, setActivityStats] = React.useState<any>(null);

  React.useEffect(() => {
    getStaffActivityStatsAction(staff.id).then(setActivityStats).catch(console.error);
  }, [staff.id]);

  const handleUpdate = async (data: any) => {
    try {
      const res = await updateStaffInfoAction(staff.id, {
        name: staff.name,
        jobRole: staff.staffProfile.jobRole,
        roleId: staff.customRoleId || "",
        baseSalary: staff.staffProfile.baseSalary,
        wageType: staff.staffProfile.wageType,
        ...data
      });
      if (res.success) {
        router.refresh();
        return res;
      }
    } catch (err: any) {
      toast.error(err.message);
      throw err;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link 
          href="/merchant/staff" 
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-bold text-xs uppercase tracking-widest"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Team
        </Link>
        <div className="flex items-center gap-3">
           <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100">
             Official Profile
           </span>
        </div>
      </div>

      <StaffProfileCard 
        user={staff} 
        isEditable={true} 
        activityStats={activityStats}
        onUpdate={handleUpdate} 
      />

      <div className="bg-blue-600 rounded-[32px] p-8 text-white flex items-center justify-between shadow-xl shadow-blue-600/20">
         <div className="space-y-1">
            <h3 className="text-xl font-black uppercase">Management Console</h3>
            <p className="text-blue-100 text-xs font-bold uppercase tracking-widest">Adjust permissions and access for this staff member</p>
         </div>
         <Link 
           href="/merchant/staff" // In a real app, this might open the manage modal
           className="bg-white text-blue-600 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-lg"
         >
            Settings
         </Link>
      </div>
    </div>
  );
}
