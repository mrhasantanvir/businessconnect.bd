const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function initSettings() {
  const oldAdminEmail = "admin@businessconnect.bd";
  const newAdminEmail = "smmhasantanvir@gmail.com";
  
  // 1. Ensure the new admin email exists with correct role
  const admin = await prisma.user.upsert({
    where: { email: newAdminEmail },
    update: {
      role: "SUPER_ADMIN",
      name: "Tanvir Hasan"
    },
    create: {
      email: newAdminEmail,
      name: "Tanvir Hasan",
      role: "SUPER_ADMIN",
      password: "adminp@ssword2026"
    }
  });
  console.log(`Super Admin ensured: ${newAdminEmail}`);

  // 2. Delete old admin if it exists
  try {
    await prisma.user.delete({ where: { email: oldAdminEmail } });
    console.log(`Old admin ${oldAdminEmail} deleted.`);
  } catch (e) {
    // Already deleted or doesn't exist
  }

  // 3. Initialize System Settings for SMTP
  await prisma.systemSettings.upsert({
    where: { id: "GLOBAL" },
    update: {
      smtpHost: "smtp.gmail.com",
      smtpPort: 587,
      smtpUser: newAdminEmail,
      smtpFrom: `BusinessConnect <${newAdminEmail}>`,
      siteTitle: "BusinessConnect.bd",
      siteDescription: "Premium Business Management Platform"
    },
    create: {
      id: "GLOBAL",
      smtpHost: "smtp.gmail.com",
      smtpPort: 587,
      smtpUser: newAdminEmail,
      smtpFrom: `BusinessConnect <${newAdminEmail}>`,
      siteTitle: "BusinessConnect.bd",
      siteDescription: "Premium Business Management Platform",
      updatedAt: new Date()
    }
  });
  console.log("GLOBAL System Settings initialized with Gmail SMTP defaults.");
  process.exit(0);
}

initSettings();
