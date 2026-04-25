"use server";

import { db as prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getShippingRatesAction() {
  const session = await getSession();
  if (!session || !session.merchantStoreId) throw new Error("Unauthorized");
  return await prisma.shippingRate.findMany({
    where: { merchantStoreId: session.merchantStoreId }
  });
}

export async function saveShippingRateAction(data: any) {
  const session = await getSession();
  if (!session || !session.merchantStoreId) throw new Error("Unauthorized");

  return await prisma.shippingRate.upsert({
    where: {
      merchantStoreId_courierName: {
        merchantStoreId: session.merchantStoreId,
        courierName: data.courierName.toUpperCase()
      }
    },
    update: {
      insideDhaka: data.insideDhaka,
      outsideDhaka: data.outsideDhaka,
      subDhaka: data.subDhaka,
      perKgInsideDhaka: data.perKgInsideDhaka,
      perKgOutsideDhaka: data.perKgOutsideDhaka,
      perLiterInsideDhaka: data.perLiterInsideDhaka,
      perLiterOutsideDhaka: data.perLiterOutsideDhaka,
      homeDeliveryInsideDhaka: data.homeDeliveryInsideDhaka,
      homeDeliveryOutsideDhaka: data.homeDeliveryOutsideDhaka,
      baseWeightKg: data.baseWeightKg,
      extraWeightFee: data.extraWeightFee,
      liquidSurcharge: data.liquidSurcharge,
      courierLogo: data.courierLogo,
      isActive: data.isActive
    },
    create: {
      merchantStoreId: session.merchantStoreId,
      courierName: data.courierName.toUpperCase(),
      courierLogo: data.courierLogo,
      insideDhaka: data.insideDhaka,
      outsideDhaka: data.outsideDhaka,
      subDhaka: data.subDhaka,
      perKgInsideDhaka: data.perKgInsideDhaka,
      perKgOutsideDhaka: data.perKgOutsideDhaka,
      perLiterInsideDhaka: data.perLiterInsideDhaka,
      perLiterOutsideDhaka: data.perLiterOutsideDhaka,
      homeDeliveryInsideDhaka: data.homeDeliveryInsideDhaka,
      homeDeliveryOutsideDhaka: data.homeDeliveryOutsideDhaka,
      baseWeightKg: data.baseWeightKg,
      extraWeightFee: data.extraWeightFee,
      liquidSurcharge: data.liquidSurcharge,
      isActive: data.isActive
    }
  });
}

export async function initializeCourierAction(data: {
  courierName: string;
  hasApi: boolean;
  apiKey?: string;
  apiSecret?: string;
}) {
  const session = await getSession();
  if (!session || !session.merchantStoreId) throw new Error("Unauthorized");

  const upperName = data.courierName.toUpperCase();

  // 1. Create/Update Shipping Rate
  await prisma.shippingRate.upsert({
    where: {
      merchantStoreId_courierName: {
        merchantStoreId: session.merchantStoreId,
        courierName: upperName
      }
    },
    update: { isActive: true },
    create: {
      merchantStoreId: session.merchantStoreId,
      courierName: upperName,
      isActive: true
    }
  });

  // 2. Create/Update API Config if requested
  if (data.hasApi) {
    await prisma.courierConfig.upsert({
      where: {
        merchantStoreId_providerName: {
          merchantStoreId: session.merchantStoreId,
          providerName: upperName
        }
      },
      update: {
        apiKey: data.apiKey,
        apiSecret: data.apiSecret,
        isActive: true,
        type: "API"
      },
      create: {
        merchantStoreId: session.merchantStoreId,
        providerName: upperName,
        apiKey: data.apiKey,
        apiSecret: data.apiSecret,
        isActive: true,
        type: "API"
      }
    });
  }

  revalidatePath("/merchant/logistics");
  return { success: true };
}

export async function uploadCourierLogoAction(formData: FormData) {
  const file = formData.get("file") as File;
  if (!file) throw new Error("No file provided");
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const base64 = buffer.toString("base64");
  return { url: `data:${file.type};base64,${base64}` };
}

export async function upsertCourierConfigAction(data: {
  providerName: string;
  apiKey?: string;
  apiSecret?: string;
  type?: string;
  trackingUrlTemplate?: string;
  isActive: boolean;
}) {
  const session = await getSession();
  if (!session || !session.merchantStoreId) throw new Error("Unauthorized");

  const config = await prisma.courierConfig.upsert({
    where: {
      merchantStoreId_providerName: {
        merchantStoreId: session.merchantStoreId,
        providerName: data.providerName.toUpperCase()
      }
    },
    update: {
      apiKey: data.apiKey,
      apiSecret: data.apiSecret,
      type: data.type || "API",
      trackingUrlTemplate: data.trackingUrlTemplate,
      isActive: data.isActive
    },
    create: {
      merchantStoreId: session.merchantStoreId,
      providerName: data.providerName.toUpperCase(),
      apiKey: data.apiKey,
      apiSecret: data.apiSecret,
      type: data.type || "API",
      trackingUrlTemplate: data.trackingUrlTemplate,
      isActive: data.isActive
    }
  });

  revalidatePath("/merchant/logistics");
  return { success: true, config };
}
