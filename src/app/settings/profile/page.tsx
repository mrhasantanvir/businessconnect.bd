import { db as prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import ProfileClient from "./ProfileClient";

export default async function ProfileSettingsPage() {
  const session = await getSession();
  if (!session || !session.id) redirect("/login");

  if (!session?.id) redirect("/login");
  
  let user;
  try {
    user = await prisma.user.findUnique({
      where: { id: session.id as string },
      include: {
        staffProfile: {
          include: {
            documents: true,
            merchantStore: {
              select: { name: true }
            }
          }
        }
      }
    });
  } catch (err) {
    console.error("Database error in ProfileSettingsPage:", err);
    return <div className="p-10 text-center font-bold text-red-500 bg-red-50 rounded-3xl border border-red-100">Profile module currently unavailable. Please try again later.</div>;
  }

  if (!user) redirect("/login");

  return <ProfileClient user={user} />;
}
