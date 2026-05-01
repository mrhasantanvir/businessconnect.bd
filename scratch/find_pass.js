const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function findPass() {
  const result = await prisma.systemSettings.findFirst({
    where: {
      NOT: { smtpPass: null }
    }
  });
  console.log("Found record with pass:", result ? result.id : "NONE");
  process.exit(0);
}

findPass();
