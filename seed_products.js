const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const DATA = [
  {
    category: "Electronics",
    products: [
      { name: "iPhone 15 Pro Max", price: 150000, image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&q=80&w=400" },
      { name: "Samsung Galaxy S24 Ultra", price: 140000, image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&q=80&w=400" },
      { name: "Sony WH-1000XM5", price: 35000, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=400" },
      { name: "MacBook Air M2", price: 120000, image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=400" },
      { name: "Logitech MX Master 3S", price: 10000, image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&q=80&w=400" }
    ]
  },
  {
    category: "Fashion",
    products: [
      { name: "Premium Cotton Panjabi", price: 3500, image: "https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?auto=format&fit=crop&q=80&w=400" },
      { name: "Silk Saree Exclusive", price: 8500, image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=400" },
      { name: "Levi's 501 Original", price: 5500, image: "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&q=80&w=400" },
      { name: "Adidas Ultraboost", price: 18000, image: "https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?auto=format&fit=crop&q=80&w=400" },
      { name: "Leather Formal Shoes", price: 4500, image: "https://images.unsplash.com/photo-1449247709967-d4461a6a6103?auto=format&fit=crop&q=80&w=400" }
    ]
  },
  {
    category: "Grocery",
    products: [
      { name: "Pure Rajshahi Mangoes (10kg)", price: 1200, image: "https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&q=80&w=400" },
      { name: "Organic Mustard Oil (5L)", price: 950, image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=400" },
      { name: "Premium Basmati Rice", price: 850, image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=400" },
      { name: "Deshi Ghee (1kg)", price: 1400, image: "https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?auto=format&fit=crop&q=80&w=400" },
      { name: "Fresh Organic Honey", price: 600, image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=400" }
    ]
  },
  {
    category: "Beauty",
    products: [
      { name: "L'Oreal Revitalift", price: 1800, image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=400" },
      { name: "MAC Matte Lipstick", price: 2200, image: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&q=80&w=400" },
      { name: "The Ordinary Niacinamide", price: 1100, image: "https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&q=80&w=400" },
      { name: "Maybelline Foundation", price: 950, image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=400" },
      { name: "Cerave Hydrating Cleanser", price: 1600, image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=400" }
    ]
  },
  {
    category: "Home & Kitchen",
    products: [
      { name: "Prestige Non-Stick Set", price: 4500, image: "https://images.unsplash.com/photo-1584990344119-a2cbc309403d?auto=format&fit=crop&q=80&w=400" },
      { name: "Philips Air Fryer", price: 12000, image: "https://images.unsplash.com/photo-1585515320310-259814833e62?auto=format&fit=crop&q=80&w=400" },
      { name: "Cotton Bed Sheet Set", price: 2500, image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=400" },
      { name: "Modern Wall Clock", price: 1200, image: "https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?auto=format&fit=crop&q=80&w=400" },
      { name: "Glass Bottle Set", price: 1500, image: "https://images.unsplash.com/photo-1602143393494-14309395f87b?auto=format&fit=crop&q=80&w=400" }
    ]
  },
  {
    category: "Health",
    products: [
      { name: "BP Monitor Digital", price: 2800, image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=400" },
      { name: "N95 Face Mask (Box)", price: 1200, image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=400" },
      { name: "Multivitamin Tabs", price: 850, image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=400" },
      { name: "Whey Protein 2lbs", price: 3500, image: "https://images.unsplash.com/photo-1593095199071-f37cfbc262fa?auto=format&fit=crop&q=80&w=400" },
      { name: "Premium Yoga Mat", price: 1500, image: "https://images.unsplash.com/photo-1592432111431-77862295627e?auto=format&fit=crop&q=80&w=400" }
    ]
  },
  {
    category: "Sports",
    products: [
      { name: "Wilson Tennis Racket", price: 12000, image: "https://images.unsplash.com/photo-1622279457486-62dcc4a4977b?auto=format&fit=crop&q=80&w=400" },
      { name: "Nike Football Size 5", price: 2500, image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=400" },
      { name: "Dumbbell Set 20kg", price: 4000, image: "https://images.unsplash.com/photo-1586401100295-7a8096fd231a?auto=format&fit=crop&q=80&w=400" },
      { name: "English Willow Bat", price: 15000, image: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&q=80&w=400" },
      { name: "Cycling Helmet", price: 2200, image: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=400" }
    ]
  },
  {
    category: "Books",
    products: [
      { name: "Atomic Habits", price: 450, image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=400" },
      { name: "Sapiens", price: 600, image: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=400" },
      { name: "Pather Panchali", price: 350, image: "https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&q=80&w=400" },
      { name: "The Alchemist", price: 400, image: "https://images.unsplash.com/photo-1543004218-ee1411049754?auto=format&fit=crop&q=80&w=400" },
      { name: "Deep Work", price: 500, image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=400" }
    ]
  },
  {
    category: "Toys",
    products: [
      { name: "LEGO Star Wars Set", price: 8500, image: "https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?auto=format&fit=crop&q=80&w=400" },
      { name: "RC Racing Car", price: 3500, image: "https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?auto=format&fit=crop&q=80&w=400" },
      { name: "Barbie Dream House", price: 12000, image: "https://images.unsplash.com/photo-1559466273-d95e72debaf8?auto=format&fit=crop&q=80&w=400" },
      { name: "Puzzle Set 1000pcs", price: 1500, image: "https://images.unsplash.com/photo-1585155770447-2f66e2a397b5?auto=format&fit=crop&q=80&w=400" },
      { name: "Teddy Bear Large", price: 1800, image: "https://images.unsplash.com/photo-1559454403-b8fb88521f11?auto=format&fit=crop&q=80&w=400" }
    ]
  },
  {
    category: "Automotive",
    products: [
      { name: "Car Vacuum Cleaner", price: 2500, image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=400" },
      { name: "Motorcycle Helmet", price: 4500, image: "https://images.unsplash.com/photo-1558981403-c5f9199ad25e?auto=format&fit=crop&q=80&w=400" },
      { name: "Microfiber Cloths", price: 500, image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=400" },
      { name: "Car Air Freshener", price: 350, image: "https://images.unsplash.com/photo-1601362840469-51e4d8d59085?auto=format&fit=crop&q=80&w=400" },
      { name: "Dash Cam 4K", price: 8000, image: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&q=80&w=400" }
    ]
  }
];

async function main() {
  const store = await prisma.merchantStore.findFirst();
  if (!store) {
    console.log("No store found.");
    return;
  }

  // Aggressive cleanup for testing
  await prisma.inventoryLog.deleteMany({ where: { product: { merchantStoreId: store.id } } });
  await prisma.warehouseStock.deleteMany({ where: { product: { merchantStoreId: store.id } } });
  await prisma.productReview.deleteMany({ where: { product: { merchantStoreId: store.id } } });
  await prisma.orderItem.deleteMany({ where: { product: { merchantStoreId: store.id } } });
  await prisma.flashSaleItem.deleteMany({ where: { product: { merchantStoreId: store.id } } });
  await prisma.product.deleteMany({ where: { merchantStoreId: store.id } });
  await prisma.category.deleteMany({ where: { merchantStoreId: store.id } });

  console.log("Existing data cleared.");

  for (const item of DATA) {
    const category = await prisma.category.create({
      data: {
        name: item.category,
        slug: item.category.toLowerCase().replace(/ & /g, "-").replace(/ /g, "-"),
        merchantStoreId: store.id
      }
    });

    for (const p of item.products) {
      await prisma.product.create({
        data: {
          name: p.name,
          price: p.price,
          image: p.image,
          categoryId: category.id,
          merchantStoreId: store.id,
          stock: 50,
          description: `Premium ${p.name} for your lifestyle. Highly recommended.`
        }
      });
    }
  }

  console.log("Seeding complete: 10 Categories and 50 Products added.");
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
