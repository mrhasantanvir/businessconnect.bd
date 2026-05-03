"use server";

import { db as prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { generateTaskFromText } from "@/lib/ai/task-engine";
import { sendEmail } from "@/lib/mail";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import fs from "fs";

export async function uploadTaskAttachmentAction(formData: FormData) {
  const session = await getSession();
  if (!session || !session.merchantStoreId) throw new Error("Unauthorized");

  const file = formData.get("file") as File;
  if (!file) throw new Error("No file uploaded");

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const filename = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
  const dirPath = path.join(process.cwd(), "public", "uploads", "tasks");
  
  if (!fs.existsSync(dirPath)) {
    await mkdir(dirPath, { recursive: true });
  }

  const uploadPath = path.join(dirPath, filename);
  await writeFile(uploadPath, buffer);

  return { 
    url: `/uploads/tasks/${filename}`,
    name: file.name,
    size: file.size,
    type: file.type
  };
}

/**
 * Step 1: AI Task Suggestion
 */
export async function suggestTaskAction(rawText: string) {
  const session = await getSession();
  if (!session || !session.merchantStoreId) throw new Error("Unauthorized");

  return await generateTaskFromText(session.merchantStoreId, rawText);
}

/**
 * Step 2: Create Task & Trigger Handshake
 */
export async function createTaskAction(data: {
  title: string;
  description?: string;
  priority: string;
  assigneeId?: string;
  orderId?: string;
  customerId?: string;
  deadline?: Date;
  attachments?: string; // JSON string
}) {
  const session = await getSession();
  if (!session || !session.merchantStoreId) throw new Error("Unauthorized");

  const task = await prisma.task.create({
    data: {
      title: data.title,
      description: data.description,
      priority: data.priority,
      assigneeId: data.assigneeId || null,
      orderId: data.orderId || null,
      customerId: data.customerId || null,
      deadline: data.deadline ? new Date(data.deadline) : null,
      attachments: data.attachments || null,
      merchantStoreId: session.merchantStoreId,
      creatorId: session.userId,
      status: data.assigneeId ? "PENDING_CONFIRMATION" : "ACTIVE"
    },
    include: {
      assignee: true,
      merchantStore: true
    }
  });

  // Mandatory Email Handshake for Staff
  if (task.assigneeId && task.assignee?.email) {
    const confirmationUrl = `https://businessconnect.bd/merchant/tasks/confirm?id=${task.id}`;
    
    await sendEmail({
      to: task.assignee.email,
      subject: `[Task Handshake] New Assignment: ${task.title}`,
      html: `
        <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 2px;">
          <div style="background: #1e40af; padding: 24px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 20px;">New Task Assignment</h1>
          </div>
          <div style="padding: 32px;">
            <h2 style="font-size: 18px; font-weight: 900; margin-bottom: 16px;">${task.title}</h2>
            <p style="color: #64748b; font-size: 14px; line-height: 1.6;">${task.description || 'No description provided.'}</p>
            
            <div style="margin: 24px 0; padding: 16px; bg: #f8fafc; border-radius: 2px;">
              <p style="margin: 0; font-size: 12px; font-weight: bold; color: #94a3b8; text-transform: uppercase;">Priority</p>
              <p style="margin: 4px 0 0; font-weight: 900; color: #1e40af;">${task.priority}</p>
            </div>

            <a href="${confirmationUrl}" style="display: block; width: 100%; padding: 16px; background: #bef264; color: #166534; text-align: center; text-decoration: none; font-weight: 900; font-size: 14px; text-transform: uppercase; border-radius: 2px;">
              Confirm & Start Task
            </a>
          </div>
          <div style="padding: 16px; background: #f8fafc; text-align: center; font-size: 10px; color: #94a3b8;">
            Sent by ${task.merchantStore.name} via BusinessConnect.bd
          </div>
        </div>
      `
    });

    await prisma.taskActivity.create({
      data: {
        taskId: task.id,
        type: "HANDSHAKE_SENT",
        message: `Handshake email sent to ${task.assignee.name}`
      }
    });
  }

  revalidatePath("/merchant/tasks");
  return task;
}

/**
 * Step 3: Confirmation Handshake
 */
export async function confirmTaskAction(taskId: string) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: { assignee: true }
  });

  if (!task || task.assigneeId !== session.id) throw new Error("Unauthorized or task not found");

  await prisma.task.update({
    where: { id: taskId },
    data: {
      status: "ACTIVE",
      confirmedAt: new Date()
    }
  });

  await prisma.taskActivity.create({
    data: {
      taskId,
      userId: session.userId,
      type: "STATUS_CHANGE",
      message: "Staff confirmed the task and moved it to ACTIVE"
    }
  });

  revalidatePath("/merchant/tasks");
  return { success: true };
}

/**
 * Update Status (Linked with Time Tracking)
 */
export async function updateTaskStatusAction(taskId: string, status: string) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const data: any = { status };
  if (status === "COMPLETED") {
    data.completedAt = new Date();
  }

  const task = await prisma.task.update({
    where: { id: taskId },
    data
  });

  // If IN_PROGRESS, we could automatically start a work log if none active
  // This logic depends on how StaffWorkLog is initiated

  await prisma.taskActivity.create({
    data: {
      taskId,
      userId: session.userId,
      type: "STATUS_CHANGE",
      message: `Task moved to ${status}`
    }
  });

  revalidatePath("/merchant/tasks");
  return task;
}

/**
 * Task Messaging
 */
export async function sendTaskMessageAction(taskId: string, content: string) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const message = await prisma.taskMessage.create({
    data: {
      taskId,
      userId: session.userId,
      content
    }
  });

  revalidatePath(`/merchant/tasks/${taskId}`);
  return message;
}

/**
 * Fetch Full Task Details
 */
export async function getTaskAction(taskId: string) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  return await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      assignee: { include: { staffProfile: true } },
      creator: true,
      order: true,
      messages: {
        include: { user: true },
        orderBy: { createdAt: "asc" }
      },
      activities: {
        orderBy: { createdAt: "desc" }
      },
      workLogs: true
    }
  });
}

/**
 * Forward Task to another Staff
 */
export async function forwardTaskAction(taskId: string, newAssigneeId: string) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const task = await prisma.task.update({
    where: { id: taskId },
    data: {
      assigneeId: newAssigneeId,
      status: "PENDING_CONFIRMATION" // Reset status for new handshake
    },
    include: { assignee: true }
  });

  await prisma.taskActivity.create({
    data: {
      taskId,
      userId: session.userId,
      type: "STATUS_CHANGE",
      message: `Task forwarded to ${task.assignee?.name || 'new staff'}`
    }
  });

  revalidatePath("/merchant/tasks");
  return task;
}

/**
 * Start Work Log
 */
export async function startWorkLogAction(taskId: string) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const log = await prisma.staffWorkLog.create({
    data: {
      taskId,
      staffId: session.userId,
      startTime: new Date()
    }
  });

  await prisma.taskActivity.create({
    data: {
      taskId,
      userId: session.userId,
      type: "STATUS_CHANGE",
      message: "Staff started working on this task"
    }
  });

  revalidatePath("/merchant/tasks");
  return log;
}

/**
 * Stop Work Log
 */
export async function stopWorkLogAction(taskId: string) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const activeLog = await prisma.staffWorkLog.findFirst({
    where: { 
      taskId, 
      staffId: session.userId, 
      endTime: null 
    }
  });

  if (!activeLog) return null;

  const endTime = new Date();
  const duration = Math.round((endTime.getTime() - activeLog.startTime.getTime()) / 60000); // minutes

  await prisma.staffWorkLog.update({
    where: { id: activeLog.id },
    data: {
      endTime,
      duration
    }
  });

  await prisma.taskActivity.create({
    data: {
      taskId,
      userId: session.userId,
      type: "STATUS_CHANGE",
      message: `Staff paused/stopped working. Session duration: ${duration}m`
    }
  });

  revalidatePath("/merchant/tasks");
  return { success: true };
}
