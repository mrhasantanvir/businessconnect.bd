"use server";

import { db as prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { checkCustomerGlobalStatus } from "@/lib/logistics/steadfast";

export async function getCombinedTrustInsightAction(phone: string, storeId: string) {
  const session = await getSession();
  if (!session || session.merchantStoreId !== storeId) throw new Error("Unauthorized");

  // 1. Local Store History
  const localOrders = await prisma.order.findMany({
    where: { 
      customerPhone: phone,
      merchantStoreId: storeId
    },
    select: {
      status: true,
      total: true
    }
  });

  const localStats = {
    total: localOrders.length,
    delivered: localOrders.filter(o => o.status === "DELIVERED").length,
    returned: localOrders.filter(o => o.status === "RETURNED" || o.status === "CANCELLED").length,
    totalSpent: localOrders.filter(o => o.status === "DELIVERED").reduce((sum, o) => sum + o.total, 0)
  };

  // 2. Global Courier History (Fetch from Steadfast)
  // Check if Fraud Control is enabled by Super Admin
  const systemSettings = await prisma.systemSettings.findUnique({ where: { id: "GLOBAL" } });
  const isGlobalIntelligenceEnabled = systemSettings?.isFraudCheckEnabled ?? true;

  let globalStats = { delivered: 0, returned: 0, total: 0 };
  
  if (isGlobalIntelligenceEnabled) {
    const config = await prisma.courierConfig.findUnique({
      where: {
        merchantStoreId_providerName: {
          merchantStoreId: storeId,
          providerName: "STEADFAST"
        }
      }
    });

    const globalResult = await checkCustomerGlobalStatus(
      config?.apiKey || "DEMO",
      config?.apiSecret || "DEMO",
      phone
    );

    globalStats = {
       delivered: globalResult.total_delivered || 0,
       returned: (globalResult.total_returned || 0) + (globalResult.total_cancelled || 0),
       total: (globalResult.total_delivered || 0) + (globalResult.total_returned || 0) + (globalResult.total_cancelled || 0)
    };
  }

  // 3. Trust Score Calculation
  // Weighted: Local (60%) + Global (40%)
  const calculateRate = (delivered: number, total: number) => total > 0 ? (delivered / total) * 100 : 100;
  
  const localRate = calculateRate(localStats.delivered, localStats.total);
  const globalRate = calculateRate(globalStats.delivered, globalStats.total);
  
  const trustScore = Math.round((localRate * 0.6) + (globalRate * 0.4));

  // 4. Recommendation
  let recommendation = "Trustworthy: Safe for COD.";
  let riskLevel: "LOW" | "MEDIUM" | "HIGH" = "LOW";
  let actionRequired = false;

  if (trustScore < 50) {
    recommendation = "High Risk: Return rate is alarming. Require 20% advance payment.";
    riskLevel = "HIGH";
    actionRequired = true;
  } else if (trustScore < 75) {
    recommendation = "Medium Risk: Consider verifying via phone call before dispatch.";
    riskLevel = "MEDIUM";
  }

  return {
    localStats,
    globalStats,
    trustScore,
    recommendation,
    riskLevel,
    actionRequired
  };
}
