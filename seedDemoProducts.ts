import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const merchantStoreId = 'gadget-gear-id';

  // Fetch some categories to link products
  const electronics = await prisma.category.findUnique({ where: { slug: 'electronics' } });
  const food = await prisma.category.findUnique({ where: { slug: 'groceries-pets' } });
  const home = await prisma.category.findUnique({ where: { slug: 'home-living' } });

  const products = [
    {
      name: "Apple iPhone 15 Pro - 256GB Natural Titanium",
      description: "The latest iPhone with A17 Pro chip, Titanium design, and pro camera system.",
      price: 165000,
      stock: 15,
      sku: "IPH15P-256-NT",
      categoryId: electronics?.id,
      unitType: "piece",
      unitWeight: 0.187,
      allowedDistricts: "Dhaka, Chittagong, Sylhet",
      preferredCourier: "STEADFAST",
      seoTitle: "iPhone 15 Pro Price in Bangladesh | GadgetGear BD",
      seoDescription: "Buy Apple iPhone 15 Pro at the best price in Bangladesh. 100% authentic products with official warranty.",
      image: "https://images.unsplash.com/photo-1696446701796-da61225697cc?q=80&w=800&auto=format&fit=crop"
    },
    {
      name: "Sundarban Premium Khalisha Flower Honey (500g)",
      description: "100% pure and organic honey collected from the Sundarbans forest.",
      price: 850,
      stock: 120,
      sku: "HON-SUND-500",
      categoryId: food?.id,
      unitType: "g",
      unitWeight: 500,
      allowedDistricts: "All Bangladesh",
      preferredCourier: "REDX",
      seoTitle: "Pure Sundarban Honey (Khalisha) - 500g | GadgetGear BD",
      seoDescription: "Organic honey from Sundarban forest. No additives or preservatives. Boost your immunity today.",
      image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?q=80&w=800&auto=format&fit=crop"
    },
    {
      name: "Modern Minimalist Ceramic Vase - Matte White",
      description: "Elegant ceramic vase for home decoration. Perfect for dried flowers.",
      price: 1200,
      stock: 45,
      sku: "HOME-VASE-WHT",
      categoryId: home?.id,
      unitType: "piece",
      unitWeight: 0.8,
      allowedDistricts: "Dhaka, Gazipur, Narayanganj",
      preferredCourier: "STEADFAST",
      seoTitle: "Modern Ceramic Vase for Home Decor | GadgetGear BD",
      seoDescription: "Enhance your living space with this minimalist ceramic vase. Sleek matte finish.",
      image: "https://images.unsplash.com/photo-1581783898377-1c85bf937427?q=80&w=800&auto=format&fit=crop"
    },
    {
      name: "Xiaomi Mi Smart TV 5A 32 Inch",
      description: "Smart TV with HD-Ready display, Dolby Audio, and PatchWall 4.",
      price: 22000,
      stock: 30,
      sku: "TV-XIA-32-5A",
      categoryId: electronics?.id,
      unitType: "piece",
      unitWeight: 4.5,
      allowedDistricts: "All Bangladesh",
      preferredCourier: "REDX",
      seoTitle: "Xiaomi Mi TV 5A 32 Inch Price in BD | GadgetGear BD",
      seoDescription: "Get the best deal on Xiaomi Mi Smart TV 5A 32 inch. High quality sound and display.",
      image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?q=80&w=800&auto=format&fit=crop"
    },
    {
      name: "Organic Mustard Oil (Ghani) - 1 Liter",
      description: "Cold-pressed mustard oil for healthy cooking.",
      price: 240,
      stock: 200,
      sku: "OIL-MUST-1L",
      categoryId: food?.id,
      unitType: "l",
      unitWeight: 1,
      allowedDistricts: "All Bangladesh",
      preferredCourier: "REDX",
      seoTitle: "Pure Ghani Mustard Oil 1L Price in Bangladesh",
      seoDescription: "Cold pressed mustard oil for traditional Bangladeshi cooking. 100% pure.",
      image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?q=80&w=800&auto=format&fit=crop"
    }
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { 
        merchantStoreId_sku: {
          merchantStoreId,
          sku: p.sku
        }
      },
      update: {},
      create: {
        ...p,
        slug: p.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, ''),
        merchantStoreId
      }
    });
  }

  console.log('Demo products added successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
