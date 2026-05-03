import { db as prisma } from "./src/lib/db";

async function investigate() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: "rjhasantanvir@gmail.com" }
    });

    console.log("--- User Investigation: rjhasantanvir@gmail.com ---");
    if (user) {
      console.log("ID:", user.id);
      console.log("Role:", user.role);
      console.log("Custom Role ID:", user.customRoleId);
      console.log("Custom Role Name:", user.customRole?.name);
      console.log("Permissions:", user.customRole?.permissions);
      console.log("Merchant Store ID:", user.merchantStoreId);
      console.log("Readable ID:", user.readableId);
    } else {
      console.log("User not found.");
    }

    const sequences = await prisma.systemSequence.findFirst();
    console.log("\n--- System Sequences ---");
    console.log(sequences);

    const mSequences = await prisma.merchantSequence.findMany({ take: 5 });
    console.log("\n--- Merchant Sequences (First 5) ---");
    console.log(mSequences);
  } catch (err) {
    console.error("Investigation error:", err);
  } finally {
    process.exit(0);
  }
}

investigate();
