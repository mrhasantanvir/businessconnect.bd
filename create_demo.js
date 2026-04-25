const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const prisma = new PrismaClient();

async function main() {
  const store = await prisma.merchantStore.findFirst();
  if (!store) {
    console.log("No store found.");
    return;
  }

  const email = "demo@customer.com";
  const password = await bcrypt.hash("customer123", 10);

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log("Demo customer already exists.");
    console.log("Email: " + email);
    console.log("Password: customer123");
    console.log("Store: " + store.slug);
    return;
  }

  const user = await prisma.user.create({
    data: {
      name: "Demo Customer",
      email: email,
      password: password,
      role: "CUSTOMER",
      merchantStoreId: store.id,
      customer: {
        create: {
          name: "Demo Customer",
          phone: "+8801700000000",
          merchantStoreId: store.id,
          loyaltyPoints: 100
        }
      }
    }
  });

  console.log("Demo Customer Created!");
  console.log("Email: " + email);
  console.log("Password: customer123");
  console.log("Store URL: /s/" + store.slug);
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
