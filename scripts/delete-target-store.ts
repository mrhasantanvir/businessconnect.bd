import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function run() {
  const id = "cmokq6acv0002jx5imx3u1f86";
  try {
    const store = await prisma.merchantStore.findUnique({ where: { id } });
    if (store) {
      // Find associated users first to avoid foreign key issues if needed
      // But cascading should handle it if configured, or we can do it manually
      const users = await prisma.user.findMany({ where: { merchantStoreId: id } });
      for (const user of users) {
        await prisma.user.delete({ where: { id: user.id } });
      }
      await prisma.merchantStore.delete({ where: { id } });
      console.log("DELETED SUCCESS: " + id);
    } else {
      console.log("NOT FOUND: " + id);
    }
  } catch (e) {
    console.error("ERROR: ", e);
  } finally {
    await prisma.$disconnect();
  }
}
run();
