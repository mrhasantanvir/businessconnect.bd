import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function migrateStock() {
  console.log("Starting Stock Migration to WMS...");
  
  const stores = await prisma.merchantStore.findMany({
    include: { products: true, warehouses: true }
  });

  for (const store of stores) {
    let defaultWarehouse = store.warehouses.find(w => w.isDefault);
    
    if (!defaultWarehouse) {
      console.log(`Creating default warehouse for store: ${store.name}`);
      defaultWarehouse = await prisma.warehouse.create({
        data: {
          name: "Main Warehouse",
          location: "Primary Hub",
          isDefault: true,
          merchantStoreId: store.id
        }
      });
    }

    for (const product of store.products) {
      // Check if stock is already initialized in this warehouse
      const existingStock = await prisma.warehouseStock.findUnique({
        where: {
          warehouseId_productId: {
            warehouseId: defaultWarehouse.id,
            productId: product.id
          }
        }
      });

      if (!existingStock && product.stock > 0) {
         console.log(`Migrating ${product.stock} units of ${product.name} to Main Warehouse`);
         await prisma.warehouseStock.create({
           data: {
             warehouseId: defaultWarehouse.id,
             productId: product.id,
             quantity: product.stock
           }
         });
      }
    }
  }

  console.log("Migration Complete.");
}

migrateStock()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
