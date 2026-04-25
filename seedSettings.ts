import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const settings = await prisma.systemSettings.upsert({
    where: { id: 'GLOBAL' },
    update: {},
    create: {
      id: 'GLOBAL',
      isLiveChatEnabled: true,
      smsActiveProvider: 'FIREBASE',
    },
  });
  console.log('Seeded settings:', settings);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
