"use server";

import { db as prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// ─── ServiceNow Standard: Priority Matrix ─────────────────────────────────────
export async function calculatePriority(impact: string, urgency: string): Promise<string> {
  const i = parseInt(impact);
  const u = parseInt(urgency);

  if (i === 1 && u === 1) return "CRITICAL";
  if ((i === 1 && u === 2) || (i === 2 && u === 1)) return "HIGH";
  if ((i === 1 && u === 3) || (i === 2 && u === 2) || (i === 3 && u === 1)) return "MEDIUM";
  return "LOW";
}

// ─── Helper: Log Incident Activity ──────────────────────────────────────────
async function logIncidentActivity(incidentId: string, type: string, message: string, userId?: string) {
  // @ts-ignore
  await prisma.incidentActivity.create({
    data: {
      incidentId,
      userId,
      type,
      message,
    }
  });
}

// ─── Helper: Find the least-loaded available agent (auto-assign logic) ───────
async function findLeastLoadedAgent(): Promise<string | null> {
  const admins = await prisma.user.findMany({
    where: { role: "SUPER_ADMIN" },
    include: {
      assignedIncidents: {
        where: { status: { notIn: ["RESOLVED", "CLOSED"] } }
      }
    }
  });

  if (!admins.length) return null;

  // Sort by number of open incidents (ascending)
  const sorted = admins.sort(
    (a, b) => a.assignedIncidents.length - b.assignedIncidents.length
  );

  return sorted[0].id;
}

// ─── Create Incident (with auto-assign) ──────────────────────────────────────
export async function createIncidentAction(formData: FormData) {
  const session = await getSession();
  if (!session || !session.merchantStoreId) {
    throw new Error("Unauthorized");
  }

  const subject = formData.get("subject") as string;
  const description = formData.get("description") as string;
  const category = formData.get("category") as string;
  const impact = formData.get("impact") as string || "3";
  const urgency = formData.get("urgency") as string || "3";
  const priority = await calculatePriority(impact, urgency);
  const attachmentUrl = formData.get("attachmentUrl") as string | null;
  const contactPhone = (formData.get("contactPhone") as string) || null;

  const count = await prisma.incident.count();
  const number = `INC${(count + 1).toString().padStart(5, "0")}`;

  // Auto-assign to least loaded agent
  const autoAssignedId = await findLeastLoadedAgent();

  const incident = await prisma.incident.create({
    data: {
      number,
      subject,
      description,
      category,
      priority,
      // @ts-ignore
      impact,
      // @ts-ignore
      urgency,
      status: autoAssignedId ? "IN_PROGRESS" : "NEW",
      contactPhone,
      merchantStore: { connect: { id: session.merchantStoreId } },
      user: { connect: { id: session.userId } },
      ...(autoAssignedId
        ? { assignedTo: { connect: { id: autoAssignedId } } }
        : {}),
      messages: {
        create: {
          user: { connect: { id: session.userId } },
          content: description,
          attachmentUrl: attachmentUrl || null,
        },
      },
    },
  });

  // Log Initial Creation
  await logIncidentActivity(incident.id, "STATUS_CHANGE", `Ticket created with ${priority} priority.`, session.userId);
  if (autoAssignedId) {
    await logIncidentActivity(incident.id, "ASSIGNMENT", `Automatically assigned to least-loaded agent.`, session.userId);
  }

  revalidatePath("/support/incidents");
  revalidatePath("/admin/support");
  return { success: true, autoAssigned: !!autoAssignedId };
}

// ─── Add Reply ────────────────────────────────────────────────────────────────
export async function addReplyAction(formData: FormData) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const incidentId = formData.get("incidentId") as string;
  const content = formData.get("content") as string;
  const isInternal = formData.get("isInternal") === "true";
  const attachmentUrl = formData.get("attachmentUrl") as string | null;

  await prisma.incidentMessage.create({
    data: {
      incident: { connect: { id: incidentId } },
      user: { connect: { id: session.userId } },
      content,
      isInternal,
      attachmentUrl: attachmentUrl || null,
    },
  });

  await prisma.incident.update({
    where: { id: incidentId },
    data: { updatedAt: new Date() },
  });

  revalidatePath(`/support/incidents/${incidentId}`);
  revalidatePath(`/admin/support/${incidentId}`);
  return { success: true };
}

// ─── Update Status ────────────────────────────────────────────────────────────
export async function updateIncidentStatusAction(incidentId: string, status: string) {
  const session = await getSession();
  if (!session || session.role !== "SUPER_ADMIN") throw new Error("Unauthorized");

  await prisma.incident.update({
    where: { id: incidentId },
    data: { status, updatedAt: new Date() },
  });

  await logIncidentActivity(incidentId, "STATUS_CHANGE", `Incident status manually changed to ${status}.`, session.userId);

  revalidatePath(`/admin/support/${incidentId}`);
  revalidatePath("/admin/support");
  return { success: true };
}

// ─── Self-Claim (Agent picks up unassigned ticket) ────────────────────────────
export async function claimIncidentAction(incidentId: string) {
  const session = await getSession();
  if (!session || session.role !== "SUPER_ADMIN") throw new Error("Unauthorized");

  await prisma.incident.update({
    where: { id: incidentId },
    data: {
      assignedTo: { connect: { id: session.userId } },
      status: "IN_PROGRESS",
      updatedAt: new Date(),
    },
  });

  await logIncidentActivity(incidentId, "ASSIGNMENT", "Ticket claimed by agent.", session.userId);
  await logIncidentActivity(incidentId, "STATUS_CHANGE", "Status set to In Progress upon claim.", session.userId);

  // Auto-add internal note
  await prisma.incidentMessage.create({
    data: {
      incident: { connect: { id: incidentId } },
      user: { connect: { id: session.userId } },
      content: `Ticket claimed by ${session.name || session.email}. Status set to In Progress.`,
      isInternal: true,
    },
  });

  revalidatePath(`/admin/support/${incidentId}`);
  revalidatePath("/admin/support");
  return { success: true };
}

// ─── Manual Assign (Admin assigns to specific agent) ─────────────────────────
export async function assignIncidentAction(incidentId: string, targetAgentId: string) {
  const session = await getSession();
  if (!session || session.role !== "SUPER_ADMIN") throw new Error("Unauthorized");

  const agent = await prisma.user.findUnique({ where: { id: targetAgentId } });
  if (!agent) throw new Error("Agent not found");

  await prisma.incident.update({
    where: { id: incidentId },
    data: {
      assignedTo: { connect: { id: targetAgentId } },
      status: "IN_PROGRESS",
      updatedAt: new Date(),
    },
  });

  await logIncidentActivity(incidentId, "ASSIGNMENT", `Ticket manually assigned to agent ${agent.name}.`, session.userId);

  // Auto-add internal note about reassignment
  await prisma.incidentMessage.create({
    data: {
      incident: { connect: { id: incidentId } },
      user: { connect: { id: session.userId } },
      content: `Ticket manually assigned to ${agent.name} by ${session.email}.`,
      isInternal: true,
    },
  });

  revalidatePath(`/admin/support/${incidentId}`);
  revalidatePath("/admin/support");
  return { success: true };
}
// ─── AI Support Resolution (Simulation) ─────────────────────────────────────
export async function getAiSupportResolutionAction(subject: string, description: string) {
  // Simulate AI processing delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const text = (subject + " " + description).toLowerCase();
  
  if (text.includes("payment") || text.includes("gateway") || text.includes("ssl")) {
    return {
      success: true,
      suggestion: "It looks like a configuration issue with your SSLCommerz credentials. Please ensure your STORE_ID and STORE_PASSWORD are correct in the site settings. Also, verify that your IP is whitelisted on the merchant panel.",
      kbLink: "/help/sslcommerz-setup"
    };
  }
  
  if (text.includes("billing") || text.includes("invoice") || text.includes("charge")) {
    return {
      success: true,
      suggestion: "Invoices are generated on the 1st of every month. If you see a discrepancy, check the 'Transaction Log' under your wallet. Platform fees are only applied to DELIVERED orders.",
      kbLink: "/help/billing-faq"
    };
  }

  if (text.includes("login") || text.includes("password") || text.includes("access")) {
    return {
      success: true,
      suggestion: "If you are having trouble logging in, try clearing your browser cache or using Incognito mode. Ensure your staff permissions have not been revoked by the store owner.",
      kbLink: "/help/account-security"
    };
  }

  return {
    success: true,
    suggestion: "Based on your description, this might be a unique scenario. However, we recommend checking if your system time matches the global sync. If this persists, please proceed to log a ticket or talk to our live agent.",
    kbLink: "/help/general-troubleshooting"
  };
}

// ─── Create Incident ON BEHALF (Admin usage) ─────────────────────────────────
export async function createIncidentOnBehalfAction(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "SUPER_ADMIN") throw new Error("Unauthorized");

  const targetStoreId = formData.get("storeId") as string;
  const targetUserId = formData.get("userId") as string;
  const subject = formData.get("subject") as string;
  const description = formData.get("description") as string;
  const category = formData.get("category") as string;
  const impact = formData.get("impact") as string || "3";
  const urgency = formData.get("urgency") as string || "3";
  const priority = await calculatePriority(impact, urgency);
  const contactPhone = (formData.get("contactPhone") as string) || null;

  const count = await prisma.incident.count();
  const number = `INC${(count + 1).toString().padStart(5, "0")}`;
  
  const incident = await prisma.incident.create({
    data: {
      number,
      subject,
      description,
      category,
      priority,
      // @ts-ignore
      impact,
      // @ts-ignore
      urgency,
      status: "IN_PROGRESS",
      contactPhone,
      merchantStore: { connect: { id: targetStoreId } },
      user: { connect: { id: targetUserId } },
      assignedTo: { connect: { id: session.userId } },
      messages: {
        create: {
          user: { connect: { id: session.userId } },
          content: `Incident logged on behalf of the customer via Phone/Walk-in. \n\nDescription: ${description}`,
        },
      },
    },
  });

  await logIncidentActivity(incident.id, "STATUS_CHANGE", "Incident logged on behalf of user.", session.userId);
  await logIncidentActivity(incident.id, "ASSIGNMENT", "Ticket automatically assigned to the creator (Admin).", session.userId);

  revalidatePath("/admin/support");
  return { success: true };
}

// ─── Get or Create Support Chat (Widget Usage) ───────────────────────────────
export async function getOrCreateSupportChatAction() {
  const session = await getSession();
  if (!session || !session.merchantStoreId) return { success: false, error: "Unauthorized" };

  let incident = await prisma.incident.findFirst({
    where: {
      merchantStoreId: session.merchantStoreId,
      subject: "PLATFORM_SUPPORT_CHAT",
      status: { not: "CLOSED" }
    },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
        include: { user: true }
      },
      assignedTo: true
    }
  });

  if (!incident) {
    const count = await prisma.incident.count();
    const number = `INC${(count + 1).toString().padStart(5, "0")}`;
    
    incident = await prisma.incident.create({
      data: {
        number,
        subject: "PLATFORM_SUPPORT_CHAT",
        description: "Live Chat Session with Platform Support",
        category: "TECHNICAL",
        priority: "MEDIUM",
        status: "NEW",
        merchantStoreId: session.merchantStoreId,
        userId: session.userId,
        messages: {
          create: {
            userId: session.userId,
            content: "Hello! I need assistance with the platform."
          }
        }
      },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
          include: { user: true }
        },
        assignedTo: true
      }
    });
  }

  return { success: true, incident };
}

// ─── Resolve Incident (ServiceNow Standard) ──────────────────────────────────
export async function resolveIncidentAction(data: {
  incidentId: string;
  resolutionCode: string;
  resolutionNotes: string;
}) {
  const session = await getSession();
  if (!session || session.role !== "SUPER_ADMIN") throw new Error("Unauthorized");

  const { incidentId, resolutionCode, resolutionNotes } = data;

  await prisma.incident.update({
    where: { id: incidentId },
    data: {
      status: "RESOLVED",
      // @ts-ignore
      resolutionCode,
      // @ts-ignore
      resolutionNotes,
      // @ts-ignore
      resolvedAt: new Date(),
      updatedAt: new Date(),
    },
  });

  await logIncidentActivity(incidentId, "STATUS_CHANGE", `Incident resolved. Code: ${resolutionCode}.`, session.userId);

  // Inform customer via public message
  await prisma.incidentMessage.create({
    data: {
      incidentId,
      userId: session.userId,
      content: `### Solution Applied\n**Resolution Code:** ${resolutionCode}\n**Resolution Note:** ${resolutionNotes}\n\nThe issue has been marked as Resolved. If you still have trouble, please reply to reopen the ticket.`,
      isInternal: false,
    }
  });

  revalidatePath(`/admin/support/${incidentId}`);
  revalidatePath("/admin/support");
  return { success: true };
}
