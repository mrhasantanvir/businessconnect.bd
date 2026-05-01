const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function findSmtp() {
  const settings = await prisma.systemSettings.findFirst({
    where: {
      NOT: { smtpHost: null }
    }
  });
  console.log("Existing SMTP Settings:", JSON.stringify(settings, null, 2));
  process.exit(0);
}

findSmtp();
