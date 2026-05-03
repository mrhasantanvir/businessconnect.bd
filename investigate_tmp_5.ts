import { db as prisma } from "./src/lib/db";

async function investigate() {
  try {
    const roles = await prisma.role.findMany();

    console.log("--- All Roles ---");
    console.log(roles);

    const users = await prisma.user.findMany({
      take: 20,
      select: {
        email: true,
        role: true,
        customRoleId: true
      }
    });
    console.log("\n--- Sample Users ---");
    console.log(users);

  } catch (err) {
    console.error("Investigation error:", err);
  } finally {
    process.exit(0);
  }
}

investigate();
