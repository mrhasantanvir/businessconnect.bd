"use server";

import { db as prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getShippingRatesAction() {
  const session = await getSession();
  if (!session || !session.merchantStoreId) return [];

  return prisma.shippingRate.findMany({
    where: { merchantStoreId: session.merchantStoreId }
  });
}

export async function saveShippingRateAction(data: any) {
  const session = await getSession();
  if (!session || !session.merchantStoreId) throw new Error("Unauthorized");

  const rate = await prisma.shippingRate.upsert({
    where: {
      merchantStoreId_courierName: {
        merchantStoreId: session.merchantStoreId,
        courierName: data.courierName
      }
    },
    update: {
      insideDhaka: data.insideDhaka,
      outsideDhaka: data.outsideDhaka,
      subDhaka: data.subDhaka,
      baseWeightKg: data.baseWeightKg,
      extraWeightFee: data.extraWeightFee,
      liquidSurcharge: data.liquidSurcharge,
      courierLogo: data.courierLogo,
      isActive: data.isActive
    },
    create: {
      merchantStoreId: session.merchantStoreId,
      courierName: data.courierName,
      courierLogo: data.courierLogo,
      insideDhaka: data.insideDhaka,
      outsideDhaka: data.outsideDhaka,
      subDhaka: data.subDhaka,
      baseWeightKg: data.baseWeightKg,
      extraWeightFee: data.extraWeightFee,
      liquidSurcharge: data.liquidSurcharge,
      isActive: data.isActive
    }
  });

  revalidatePath("/merchant/settings/shipping");
  return rate;
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

  revalidatePath("/merchant/settings/shipping");
  return { success: true };
}

export async function uploadCourierLogoAction(formData: FormData) {
  const file = formData.get("file") as File;
  if (!file) throw new Error("No file provided");

  // In a real app, upload to S3/Cloudinary. 
  // For local demo, we'll use a data URL or a mock path.
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const base64 = buffer.toString("base64");
  const dataUrl = `data:${file.type};base64,${base64}`;

  return { url: dataUrl };
}
