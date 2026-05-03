import { db as prisma } from "./db";

export type DeveloperType = "AI" | "MANUAL";

export async function logDevelopment(data: {
  feature: string;
  action: string;
  developer: DeveloperType;
  developerName?: string;
  details?: string;
}) {
  try {
    const settings = await prisma.systemSettings.findFirst();
    const version = settings?.currentVersion || "1.0.0";

    return await prisma.developmentLog.create({
      data: {
        feature: data.feature,
        action: data.action,
        developer: data.developer,
        developerName: data.developerName || (data.developer === "AI" ? "Antigravity" : "Manual"),
        version,
        details: data.details,
      },
    });
  } catch (error) {
    console.error("Failed to log development:", error);
  }
}
