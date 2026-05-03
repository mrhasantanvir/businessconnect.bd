import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const storeCount = await (prisma as any).merchantstore.count();
  const userCount = await (prisma as any).user.count();
  const customerCount = await (prisma as any).customer.count();
  
  console.log("DB COUNTS:", {
    stores: storeCount,
    users: userCount,
    customers: customerCount
  });

  const stores = await (prisma as any).merchantstore.findMany({ take: 5 });
  console.log("STORES:", JSON.stringify(stores, null, 2));

  const users = await prisma.user.findMany({
    take: 10,
    select: {
      id: true,
      email: true,
      phone: true,
      role: true,
      isActive: true,
      readableId: true
    }
  });
  console.log("USERS IN DB:", JSON.stringify(users, null, 2));
  
  const targetPhone = "01321141788";
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { email: targetPhone },
        { phone: targetPhone }
      ]
    }
  });
  
  if (user) {
    console.log("FOUND TARGET USER:", JSON.stringify(user, null, 2));
  } else {
    console.log("TARGET USER NOT FOUND");
    // Try fuzzy match
    const fuzzy = await prisma.user.findMany({
      where: {
        phone: { contains: targetPhone.slice(-10) }
      }
    });
    console.log("FUZZY MATCHES:", JSON.stringify(fuzzy, null, 2));
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
