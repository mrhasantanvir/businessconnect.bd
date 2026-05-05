import { db as prisma } from "@/lib/db";
import { slugify } from "@/lib/utils";

export interface ImportedProduct {
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  image?: string;
  gallery?: string[];
  sku?: string;
  externalSource: string;
  externalId: string;
  attributes?: Record<string, any>;
  variations?: Array<{
    name: string;
    sku?: string;
    price?: number;
    stock: number;
    image?: string;
  }>;
}

/**
 * Global Product Importer Service
 */
export class ProductImporter {
  
  /**
   * Import from AliExpress URL
   * Note: In a real environment, this would use a scraping API or headless browser.
   */
  static async fromAliExpress(url: string): Promise<ImportedProduct> {
    console.log(`[Importer] Fetching from AliExpress: ${url}`);
    
    // Logic for scraping would go here. 
    // For now, we return a structured skeleton or use an AI Vision proxy if needed.
    // Placeholder implementation:
    const aliId = url.match(/item\/(\d+)\.html/)?.[1] || "ali-" + Date.now();
    
    return {
      name: "AliExpress Product",
      price: 0,
      externalSource: "ALIEXPRESS",
      externalId: aliId,
    };
  }

  /**
   * Process Bulk CSV Data
   */
  static async fromCSV(rows: any[], merchantStoreId: string) {
    let imported = 0;
    
    for (const row of rows) {
      try {
        const slug = slugify(row.name || "product") + "-" + Math.random().toString(36).substring(2, 5);
        
        await prisma.product.create({
          data: {
            name: row.name,
            slug,
            price: parseFloat(row.price) || 0,
            stock: parseInt(row.stock) || 0,
            sku: row.sku,
            merchantStoreId,
            description: row.description,
            image: row.image,
          }
        });
        imported++;
      } catch (err) {
        console.error(`[Importer] Failed to import row:`, err);
      }
    }
    
    return imported;
  }

  /**
   * Save an imported product to the database
   */
  static async saveToStore(product: ImportedProduct, merchantStoreId: string) {
    const slug = slugify(product.name) + "-" + Math.random().toString(36).substring(2, 5);

    return await prisma.product.create({
      data: {
        name: product.name,
        slug,
        description: product.description,
        price: product.price,
        originalPrice: product.originalPrice || 0,
        image: product.image,
        externalSource: product.externalSource,
        externalId: product.externalId,
        merchantStoreId,
        sku: product.sku || `IMP-${Date.now()}`,
        gallery: {
          create: product.gallery?.map(url => ({ url })) || []
        },
        variations: {
          create: product.variations?.map(v => ({
            name: v.name,
            sku: v.sku,
            price: v.price,
            stock: v.stock,
            image: v.image
          })) || []
        }
      }
    });
  }
}
