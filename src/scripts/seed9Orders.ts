const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding 9 demo orders...");

  // 1. Get or create a default merchant store
  let store = await prisma.merchantStore.findFirst();
  if (!store) {
    store = await prisma.merchantStore.create({
      data: {
        name: "Demo Store",
        slug: "demo-store-" + Date.now(),
        plan: "STARTER"
      }
    });
    console.log("Created fresh MerchantStore:", store.name);
  } else {
    console.log("Using existing MerchantStore:", store.name);
  }

  // 2. Get or create some products
  let products = await prisma.product.findMany({
    where: { merchantStoreId: store.id },
    take: 3
  });

  if (products.length === 0) {
    const p1 = await prisma.product.create({
      data: {
        name: "Demo Product 1",
        price: 1500,
        stock: 50,
        merchantStoreId: store.id
      }
    });

    const p2 = await prisma.product.create({
      data: {
        name: "Demo Product 2",
        price: 2500,
        stock: 30,
        merchantStoreId: store.id
      }
    });

    products = [p1, p2];
    console.log("Created dummy products.");
  }

  // 3. Statuses and other details
  const statuses = [
    "PENDING", "CONFIRMED", "PROCESSING", 
    "READY_TO_SHIP", "SHIPPED", "DELIVERED", 
    "CANCELLED", "RETURNED", "PENDING"
  ];

  // 4. Create 9 Demo Orders
  for (let i = 0; i < 9; i++) {
    const p = products[i % products.length];
    const qty = (i % 3) + 1;
    const total = p.price * qty;
    const status = statuses[i];
    
    // Create or find a formal Customer entity
    const phone = `0171100000${i}`;
    let customer = await prisma.customer.findUnique({
      where: {
        merchantStoreId_phone: {
          merchantStoreId: store.id,
          phone: phone,
        }
      }
    });

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          name: `Demo Customer ${i + 1}`,
          phone: phone,
          merchantStoreId: store.id,
          totalSpend: 0,
          orderCount: 0
        }
      });
    }

    const orderEntity = await prisma.order.create({
      data: {
        total: total,
        status: status,
        paymentStatus: i % 2 === 0 ? "UNPAID" : "PAID",
        merchantStoreId: store.id,
        
        // Link to Customer
        customerEntityId: customer.id,
        
        // Legacy Fields
        customerName: customer.name,
        customerPhone: customer.phone,
        deliveryAddress: `House ${i + 1}, Road 10, Dhaka`,
        
        items: {
          create: [
            {
              productId: p.id,
              quantity: qty,
              price: p.price
            }
          ]
        }
      }
    });

    // Update customer stats
    await prisma.customer.update({
      where: { id: customer.id },
      data: {
        totalSpend: { increment: total },
        orderCount: { increment: 1 }
      }
    });

    console.log(`Created Order ${i + 1}: ${orderEntity.id} - ${status} (${total} BDT) for ${customer.name}`);
  }

  console.log("Done generating 9 demo orders!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
