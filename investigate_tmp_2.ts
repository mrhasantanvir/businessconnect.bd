import { db as prisma } from "./src/lib/db";

async function investigate() {
  try {
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { email: { contains: "tanvir" } },
          { name: { contains: "tanvir" } }
        ]
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        readableId: true,
        merchantStoreId: true
      }
    });

    console.log("--- Users matching 'tanvir' ---");
    console.log(users);

    // Also check for the specific email but with case-insensitive search if possible
    // or just list first 10 users to see common emails
    const firstUsers = await prisma.user.findMany({ take: 10, select: { email: true } });
    console.log("\n--- First 10 Users ---");
    console.log(firstUsers);

  } catch (err) {
    console.error("Investigation error:", err);
  } finally {
    process.exit(0);
  }
}

investigate();
