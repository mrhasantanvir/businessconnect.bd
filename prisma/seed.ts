import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const superAdminEmail = "admin@businessconnect.bd";
  const superAdminPassword = "adminp@ssword2026";
  const hashedPassword = await bcrypt.hash(superAdminPassword, 10);

  // 1. Super Admin
  const existingAdmin = await prisma.user.findUnique({
    where: { email: superAdminEmail },
  });

  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        email: superAdminEmail,
        password: hashedPassword,
        name: "Super Admin",
        role: "SUPER_ADMIN",
      },
    });
    console.log("Super Admin created");
  }

  // 2. Merchant Store
  const store = await prisma.merchantStore.upsert({
    where: { id: "gadget-gear-id" },
    update: {},
    create: {
      id: "gadget-gear-id",
      name: "GadgetGear BD",
      slug: "gadget-gear",
      plan: "GROWTH",
    },
  });
  console.log("Merchant Store created: GadgetGear BD");

  // 3. Merchant Owner
  const merchantEmail = "owner@gadgetgear.bd";
  const existingMerchant = await prisma.user.findUnique({
    where: { email: merchantEmail },
  });

  if (!existingMerchant) {
    await prisma.user.create({
      data: {
        email: merchantEmail,
        password: await bcrypt.hash("owner123", 10),
        name: "Sabbir Ahmed",
        role: "MERCHANT",
        merchantStoreId: store.id,
      },
    });
    console.log("Merchant Owner created: owner@gadgetgear.bd");
  }

  // 4. Products for GadgetGear
  const products = [
    { name: "MagSafe Charger Case", price: 1200, stock: 45, category: "Accessories" },
    { name: "Apple AirPods Pro Gen 2", price: 24500, stock: 12, category: "Audio" },
    { name: "Samsung 25W Adapter", price: 1800, stock: 80, category: "Charging" },
    { name: "Logitech MX Master 3S", price: 11500, stock: 8, category: "Peripherals" },
    { name: "Belkin USB-C Hub", price: 6500, stock: 15, category: "Accessories" },
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { id: `prod-${p.name.replace(/\s+/g, '-').toLowerCase()}` },
      update: { stock: p.stock, price: p.price },
      create: {
        id: `prod-${p.name.replace(/\s+/g, '-').toLowerCase()}`,
        name: p.name,
        slug: `prod-${p.name.replace(/\s+/g, '-').toLowerCase()}`,
        price: p.price,
        stock: p.stock,
        merchantStoreId: store.id,
      },
    });
  }
  console.log("Products seeded");

  // 5. Staff Members (assigned to GadgetGear)
  const staffMembers = [
    { email: "rahim@businessconnect.bd", name: "Rahim Uddin", jobRole: "Warehouse Lead", attendance: 98, basePay: 25000, commission: 4200 },
    { email: "sumaiya@businessconnect.bd", name: "Sumaiya Akhter", jobRole: "Customer Support", attendance: 100, basePay: 18000, commission: 5100 },
    { email: "kamal@businessconnect.bd", name: "Kamal Hossain", jobRole: "Delivery Rider", attendance: 92, basePay: 15000, commission: 8400 },
  ];

  for (const staff of staffMembers) {
    const existingStaff = await prisma.user.findUnique({
      where: { email: staff.email },
    });

    if (!existingStaff) {
      await prisma.user.create({
        data: {
          email: staff.email,
          name: staff.name,
          password: await bcrypt.hash("staff123", 10),
          role: "STAFF",
          merchantStoreId: store.id,
          staffProfile: {
            create: {
              jobRole: staff.jobRole,
              attendance: staff.attendance,
              basePay: staff.basePay,
              commission: staff.commission,
            },
          },
        },
      });
    } else {
      // Update existing staff to link to store
      await prisma.user.update({
        where: { email: staff.email },
        data: { merchantStoreId: store.id }
      });
    }
  }
  console.log("Staff seeded and linked to store");

  // 6. Customers & Orders (Simplified for mock visuals)
  const customerEmail = "customer@gmail.com";
  let customerUser = await prisma.user.findUnique({ where: { email: customerEmail } });
  
  if (!customerUser) {
    customerUser = await prisma.user.create({
      data: {
        email: customerEmail,
        password: await bcrypt.hash("customer123", 10),
        name: "Abul Hayat",
        role: "CUSTOMER",
        merchantStoreId: store.id,
        customerProfile: {
          create: {
            loyaltyPoints: 150,
            savedAddress: "Dhanmondi, Dhaka",
          }
        }
      }
    });
  }

  // Add 15 quick orders to make dashboard look busy
  const couriers = ["REDX", "PATHAO", "STEADFAST"];
  for (let i = 0; i < 15; i++) {
    await prisma.order.create({
      data: {
        total: Math.floor(Math.random() * 5000) + 500,
        status: i % 4 === 0 ? "DELIVERED" : (i % 4 === 1 ? "SHIPPED" : "PENDING"),
        paymentStatus: i % 4 === 0 ? "UNPAID" : (i % 4 === 1 ? "UNPAID" : "UNPAID"),
        merchantStoreId: store.id,
        customerId: customerUser.id,
        customerName: "Abul Hayat",
        customerPhone: "01700000000",
        preferredCourier: couriers[i % 3],
        courierTrxId: `TRX-${Math.random().toString(36).substring(7).toUpperCase()}`,
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 20) * 24 * 60 * 60 * 1000), 
      }
    });
  }
  console.log("Sample orders seeded");

  // 7. Incidents (Merchant to Super Admin)
  const merchantUser = await prisma.user.findUnique({ where: { email: merchantEmail } });
  const adminUser = await prisma.user.findUnique({ where: { email: superAdminEmail } });

  if (merchantUser && adminUser) {
    const incidents = [
      { 
        number: "INC00001", 
        subject: "Payment Gateway integration issue", 
        description: "I am unable to link my SSLCommerz account with the portal. Getting timeout error.",
        category: "TECHNICAL",
        priority: "HIGH",
        status: "IN_PROGRESS"
      },
      { 
        number: "INC00002", 
        subject: "Incorrect billing for last month", 
        description: "The platform fee was charged twice on my invoice #INV-2023-01.",
        category: "BILLING",
        priority: "MEDIUM",
        status: "NEW"
      }
    ];

    for (const inc of incidents) {
      await prisma.incident.upsert({
        where: { number: inc.number },
        update: {},
        create: {
          number: inc.number,
          subject: inc.subject,
          description: inc.description,
          category: inc.category,
          priority: inc.priority,
          status: inc.status,
          merchantStoreId: store.id,
          userId: merchantUser.id,
          assignedToId: inc.status === "IN_PROGRESS" ? adminUser.id : null,
          messages: {
            create: [
              { userId: merchantUser.id, content: inc.description },
              ...(inc.status === "IN_PROGRESS" ? [{ userId: adminUser.id, content: "We are looking into the SSLCommerz connection logs. Will update you soon." }] : [])
            ]
          }
        }
      });
    }
    console.log("Sample incidents seeded");
  }

  // 8. SaaS Subscription Plans (Demo Data)
  const saasPlans = [
    { 
      name: "Starter", 
      monthlyPrice: 1000, 
      maxProducts: 50, 
      maxStaff: 2, 
      badgeColor: "blue",
      features: ["Basic Analytics", "Courier Integration", "1 Storefront"]
    },
    { 
      name: "Growth", 
      monthlyPrice: 5000, 
      maxProducts: 500, 
      maxStaff: 10, 
      badgeColor: "indigo",
      features: ["Advanced Insights", "Priority Support", "Custom SEO", "10 Support Tickets/mo"]
    },
    { 
      name: "Enterprise", 
      monthlyPrice: 15000, 
      maxProducts: -1, // Unlimited
      maxStaff: -1, // Unlimited
      badgeColor: "emerald",
      features: ["Dedicated Manager", "White-label Options", "API Access", "Unlimited Everything"]
    }
  ];

  for (const plan of saasPlans) {
    const seededPlan = await prisma.subscriptionPlan.upsert({
      where: { name: plan.name },
      update: {
        monthlyPrice: plan.monthlyPrice,
        maxProducts: plan.maxProducts,
        maxStaff: plan.maxStaff,
        badgeColor: plan.badgeColor,
        featuresData: JSON.stringify(plan.features)
      },
      create: {
        name: plan.name,
        monthlyPrice: plan.monthlyPrice,
        maxProducts: plan.maxProducts,
        maxStaff: plan.maxStaff,
        badgeColor: plan.badgeColor,
        featuresData: JSON.stringify(plan.features)
      }
    });

    // Link default store (GadgetGear) to Growth plan as demo
    if (plan.name === "Growth") {
      await prisma.merchantStore.update({
        where: { id: "gadget-gear-id" },
        data: { 
          subscriptionPlanId: seededPlan.id,
          subscriptionExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days expiry
          subscriptionStatus: "ACTIVE",
          plan: "GROWTH" // Sync legacy field
        }
      });
    }
  }
  // 9. Payment & SMS Configurations (Demo Data)
  const paymentProviders = ["BKASH", "NAGAD", "SSLCOMMERZ"];
  for (const provider of paymentProviders) {
    await prisma.paymentConfig.upsert({
      where: { merchantStoreId_provider: { merchantStoreId: store.id, provider } },
      update: {},
      create: {
        merchantStoreId: store.id,
        provider,
        isActive: provider === "BKASH", 
        isTestMode: true,
        merchantId: provider === "NAGAD" ? "123456" : null,
        storeId: provider === "SSLCOMMERZ" ? "test_store_123" : null,
        storePass: provider === "SSLCOMMERZ" ? "test_pass_123" : null,
      }
    });
  }
  console.log("Demo payment configurations seeded");

  const smsProviders = ["BULKSMSBD", "GREENWEB"];
  for (const provider of smsProviders) {
    await prisma.smsConfig.upsert({
      where: { merchantStoreId_provider: { merchantStoreId: store.id, provider } },
      update: {},
      create: {
        merchantStoreId: store.id,
        provider,
        isActive: provider === "BULKSMSBD",
        apiKey: "demo_api_key_123",
        senderId: "BusinessConnect",
      }
    });
  }
  // Seed Abandoned Carts
  const abandonedNames = ["Karim Ullah", "Salma Begum", "Tanvir Hasan"];
  for (let i = 0; i < 3; i++) {
    await prisma.abandonedCart.create({
      data: {
        merchantStoreId: store.id,
        customerName: abandonedNames[i],
        customerPhone: `018${Math.floor(Math.random() * 100000000)}`,
        cartData: JSON.stringify({ total: Math.floor(Math.random() * 3000) + 1000 }),
        status: "PENDING",
      }
    });
  }

  console.log("Abandoned Carts seeded");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
