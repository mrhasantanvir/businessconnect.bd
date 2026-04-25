const { PrismaClient } = require("../src/lib/database/generated");
const prisma = new PrismaClient();

async function test() {
  try {
    console.log("Attempting to connect to database...");
    const count = await prisma.user.count();
    console.log("Success! User count:", count);
    process.exit(0);
  } catch (err) {
    console.error("DATABASE_ERROR_DETAILS:");
    console.error("Message:", err.message);
    console.error("Code:", err.code);
    console.error("Stack:", err.stack);
    process.exit(1);
  }
}

test();
