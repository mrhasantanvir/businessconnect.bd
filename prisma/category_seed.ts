import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const mainCategories = [
  {
    name: "Electronics",
    slug: "electronics",
    subcategories: [
      { name: "Mobiles & Tablets", slug: "mobiles-tablets" },
      { name: "Computers & Laptops", slug: "computers-laptops" },
      { name: "Audio & Gadgets", slug: "audio-gadgets" },
      { name: "Cameras & Optics", slug: "cameras-optics" },
    ],
  },
  {
    name: "Fashion",
    slug: "fashion",
    subcategories: [
      { name: "Men's Apparel", slug: "mens-apparel" },
      { name: "Women's Apparel", slug: "womens-apparel" },
      { name: "Footwear", slug: "footwear" },
      { name: "Watches & Accessories", slug: "watches-accessories" },
    ],
  },
  {
    name: "Health & Beauty",
    slug: "health-beauty",
    subcategories: [
      { name: "Skincare", slug: "skincare" },
      { name: "Hair Care", slug: "hair-care" },
      { name: "Fragrances", slug: "fragrances" },
      { name: "Personal Care", slug: "personal-care" },
    ],
  },
  {
    name: "Home & Living",
    slug: "home-living",
    subcategories: [
      { name: "Kitchen & Dining", slug: "kitchen-dining" },
      { name: "Home Decor", slug: "home-decor" },
      { name: "Furniture", slug: "furniture" },
      { name: "Home Appliances", slug: "home-appliances" },
    ],
  },
  {
    name: "Groceries & Pets",
    slug: "groceries-pets",
    subcategories: [
      { name: "Beverages", slug: "beverages" },
      { name: "Snacks & Sweets", slug: "snacks-sweets" },
      { name: "Pet Supplies", slug: "pet-supplies" },
      { name: "Household Essentials", slug: "household-essentials" },
    ],
  },
  {
    name: "Sports & Outdoors",
    slug: "sports-outdoors",
    subcategories: [
      { name: "Fitness & Gym", slug: "fitness-gym" },
      { name: "Outdoor Recreation", slug: "outdoor-recreation" },
      { name: "Sports Equipment", slug: "sports-equipment" },
    ],
  },
];

async function seedCategories() {
  const storeId = "gadget-gear-id"; // Default seed store

  console.log("🌱 Seeding eCommerce categories...");

  for (const main of mainCategories) {
    const parent = await prisma.category.upsert({
      where: { slug: main.slug },
      update: {},
      create: {
        name: main.name,
        slug: main.slug,
        merchantStoreId: storeId,
      },
    });

    console.log(`✅ Main category: ${main.name}`);

    for (const sub of main.subcategories) {
      await prisma.category.upsert({
        where: { slug: sub.slug },
        update: { parentId: parent.id },
        create: {
          name: sub.name,
          slug: sub.slug,
          parentId: parent.id,
          merchantStoreId: storeId,
        },
      });
      console.log(`   └─ Subcategory: ${sub.name}`);
    }
  }

  console.log("🎉 Seeding complete!");
}

seedCategories()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
