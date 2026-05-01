const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkPass() {
  const settings = await prisma.systemSettings.findUnique({ where: { id: "GLOBAL" } });
  if (settings) {
    console.log("SMTP Host:", settings.smtpHost);
    console.log("SMTP User:", settings.smtpUser);
    console.log("Has SMTP Pass:", !!settings.smtpPass);
  } else {
    console.log("No GLOBAL settings found.");
  }
  process.exit(0);
}

checkPass();
