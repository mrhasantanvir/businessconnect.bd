"use server";

import { db as prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function uploadKnowledgeBaseAction(data: {
  fileName: string,
  fileUrl: string,
  fileType: string
}) {
  const session = await getSession();
  if (!session || !session.merchantStoreId) throw new Error("Unauthorized");

  await prisma.knowledgeBase.create({
    data: {
      merchantStoreId: session.merchantStoreId,
      fileName: data.fileName,
      fileUrl: data.fileUrl,
      fileType: data.fileType,
      isIndexed: false // Will be processed by background workers
    }
  });

  revalidatePath("/merchant/ai-hub");
  return { success: true };
}

export async function updateFacebookAutomationAction(data: {
  pageId?: string,
  accessToken?: string,
  isActive?: boolean,
  autoReplyComments?: boolean,
  keywordDmEnabled?: boolean
}) {
  const session = await getSession();
  if (!session || !session.merchantStoreId) throw new Error("Unauthorized");

  await prisma.facebookConfig.upsert({
    where: { merchantStoreId: session.merchantStoreId },
    update: data,
    create: {
      merchantStoreId: session.merchantStoreId,
      ...data
    }
  });

  revalidatePath("/merchant/ai-hub");
  return { success: true };
}
