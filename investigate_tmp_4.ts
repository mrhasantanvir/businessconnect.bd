import { db as prisma } from "./src/lib/db";

async function investigate() {
  try {
    const users = await prisma.user.findMany({
      where: {
        role: "STAFF"
      },
      select: {
        id: true,
        email: true,
        name: true,
        readableId: true,
        customRoleId: true
      }
    });

    console.log("--- All STAFF Users ---");
    console.log(users);

  } catch (err) {
    console.error("Investigation error:", err);
  } finally {
    process.exit(0);
  }
}

investigate();
