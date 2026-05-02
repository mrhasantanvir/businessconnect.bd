import { db as prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import StaffProfileView from "./StaffProfileView";

export default async function StaffProfilePage({ params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session || session.role !== "MERCHANT") redirect("/login");

  const { id } = await params;

  const staff = await prisma.user.findUnique({
    where: { 
      id,
      merchantStoreId: session.merchantStoreId
    },
    include: {
      staffProfile: {
        include: {
          documents: true,
          merchantStore: true
        }
      }
    }
  });

  if (!staff) notFound();

  return (
    <div className="max-w-5xl mx-auto py-8">
       <StaffProfileView staff={staff} />
    </div>
  );
}
