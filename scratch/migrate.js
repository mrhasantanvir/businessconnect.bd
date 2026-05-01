const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log("Adding columns to User...");
    await prisma.$executeRawUnsafe(`ALTER TABLE User ADD COLUMN IF NOT EXISTS isActive BOOLEAN DEFAULT TRUE`);
    await prisma.$executeRawUnsafe(`ALTER TABLE User ADD COLUMN IF NOT EXISTS currentSessionId VARCHAR(191)`);
    
    console.log("Adding columns to MerchantStore...");
    await prisma.$executeRawUnsafe(`ALTER TABLE MerchantStore ADD COLUMN IF NOT EXISTS billingDay INT DEFAULT 30`);
    await prisma.$executeRawUnsafe(`ALTER TABLE MerchantStore ADD COLUMN IF NOT EXISTS gracePeriodDays INT DEFAULT 5`);

    console.log("Adding columns to SystemSettings...");
    await prisma.$executeRawUnsafe(`ALTER TABLE SystemSettings ADD COLUMN IF NOT EXISTS staffSubscriptionPrice DOUBLE DEFAULT 300`);

    console.log("Creating Invoice table...");
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS Invoice (
        id VARCHAR(191) PRIMARY KEY,
        merchantStoreId VARCHAR(191) NOT NULL,
        amount DOUBLE NOT NULL,
        status VARCHAR(191) DEFAULT 'PENDING',
        billingCycle VARCHAR(191) NOT NULL,
        dueDate DATETIME NOT NULL,
        paidAt DATETIME,
        invoiceUrl VARCHAR(191),
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (merchantStoreId) REFERENCES MerchantStore(id)
      )
    `);

    console.log("Creating InvoiceItem table...");
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS InvoiceItem (
        id VARCHAR(191) PRIMARY KEY,
        invoiceId VARCHAR(191) NOT NULL,
        userId VARCHAR(191),
        name VARCHAR(191) NOT NULL,
        amount DOUBLE NOT NULL,
        days INT NOT NULL,
        FOREIGN KEY (invoiceId) REFERENCES Invoice(id) ON DELETE CASCADE
      )
    `);

    console.log("Creating UserStatusLog table...");
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS UserStatusLog (
        id VARCHAR(191) PRIMARY KEY,
        userId VARCHAR(191) NOT NULL,
        merchantStoreId VARCHAR(191) NOT NULL,
        status VARCHAR(191) NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (merchantStoreId) REFERENCES MerchantStore(id)
      )
    `);

    console.log("Migration successful.");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
