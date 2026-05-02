import React from "react";
import { db as prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import TaskDashboardClient from "./TaskDashboard";

export default async function TaskManagementPage() {
  const session = await getSession();
  if (!session || !session.merchantStoreId) redirect("/login");

  const [tasks, staff] = await Promise.all([
    prisma.task.findMany({
      where: { merchantStoreId: session.merchantStoreId },
      include: {
        assignee: { 
          select: { 
            id: true, 
            name: true, 
            image: true, 
            email: true,
            staffProfile: { select: { jobRole: true } }
          } 
        },
        creator: { select: { id: true, name: true } },
        order: { select: { id: true, orderNumber: true } }
      },
      orderBy: { createdAt: "desc" }
    }),
    prisma.user.findMany({
      where: { 
        merchantStoreId: session.merchantStoreId,
        role: "STAFF"
      },
      select: { 
        id: true, 
        name: true, 
        email: true,
        staffProfile: { select: { jobRole: true } }
      }
    })
  ]);

  return (
    <div className="p-8">
      <TaskDashboardClient 
        tasks={tasks} 
        staff={staff} 
        merchantStoreId={session.merchantStoreId} 
      />
    </div>
  );
}
