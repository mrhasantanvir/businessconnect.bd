import { db as prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import DocumentReuploadClient from "./DocumentReuploadClient";

export default async function DocumentReuploadPage() {
  const session = await getSession();
  if (!session || !session.merchantStoreId) redirect("/login");

  const store = await prisma.merchantStore.findUnique({
    where: { id: session.merchantStoreId },
    select: { name: true, activationStatus: true, reuploadMessage: true }
  });

  if (!store || store.activationStatus !== "DOCUMENTS_REJECTED") {
    redirect("/dashboard");
  }

  return <DocumentReuploadClient store={store} />;
}
