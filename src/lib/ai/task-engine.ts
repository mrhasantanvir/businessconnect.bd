import { db as prisma } from "@/lib/db";
import { askAI } from "./gateway";

export interface StructuredTask {
  title: string;
  description: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  deadline?: string; // ISO string
  orderId?: string;
  customerId?: string;
}

/**
 * AI Engine to transform raw text/voice into a structured task
 */
export async function generateTaskFromText(merchantStoreId: string, rawText: string): Promise<StructuredTask> {
  // 1. Fetch relevant context (Recent Orders and Customers) to help AI link entities
  const [recentOrders, recentCustomers] = await Promise.all([
    prisma.order.findMany({
      where: { merchantStoreId },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { id: true, customerName: true, customerPhone: true }
    }),
    prisma.customer.findMany({
      where: { merchantStoreId },
      orderBy: { updatedAt: "desc" },
      take: 10,
      select: { id: true, name: true, phone: true }
    })
  ]);

  const contextPrompt = `
    Recent Orders: ${JSON.stringify(recentOrders)}
    Recent Customers: ${JSON.stringify(recentCustomers)}
  `;

  const systemPrompt = `
    You are an AI Task Manager. Transform the following raw input into a structured task.
    Analyze if the input mentions a specific order or customer from the provided context.
    
    Output ONLY a JSON object with:
    - title: Short, actionable title.
    - description: Clear steps to complete the task.
    - priority: One of "LOW", "MEDIUM", "HIGH", "URGENT".
    - deadline: A suggested ISO date string based on priority (e.g., URGENT = today, HIGH = tomorrow).
    - orderId: If a matching order is found in context.
    - customerId: If a matching customer is found in context.
  `;

  const response = await askAI(rawText, {
    systemPrompt: systemPrompt + "\n\nContext:\n" + contextPrompt,
    jsonMode: true
  });

  try {
    const cleaned = response.content.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
  } catch (error) {
    console.error("AI Task Parsing Error:", error);
    throw new Error("Failed to parse AI task structure.");
  }
}

/**
 * AI-suggested performance summaries
 */
export async function generateTaskEfficiencyReport(staffId: string, taskLogs: any[]) {
  const prompt = `
    Analyze the following staff work logs for a specific task and provide a 1-sentence efficiency summary.
    Logs: ${JSON.stringify(taskLogs)}
  `;
  
  const response = await askAI(prompt, {
    systemPrompt: "You are a Business Performance Analyst. Be concise and professional."
  });

  return response.content;
}
