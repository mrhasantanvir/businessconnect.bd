import { db as prisma } from "./src/lib/db";

async function investigate() {
  try {
    const users = await prisma.user.findMany({
      where: {
        email: { contains: "hasantanvir" }
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        readableId: true,
        customRoleId: true
      }
    });

    console.log("--- Users matching 'hasantanvir' ---");
    console.log(users);

  } catch (err) {
    console.error("Investigation error:", err);
  } finally {
    process.exit(0);
  }
}

investigate();
