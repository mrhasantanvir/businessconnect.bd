import { NextRequest, NextResponse } from "next/server";
import { db as prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-wc-webhook-secret");
  const storeId = req.headers.get("x-store-id");

  if (!secret || !storeId) {
    return NextResponse.json({ error: "Missing authentication headers" }, { status: 401 });
  }

  try {
    const config = await prisma.wcConfig.findUnique({
      where: { merchantStoreId: storeId },
      include: { merchantStore: true }
    });

    if (!config || config.webhookSecret !== secret) {
      return NextResponse.json({ error: "Invalid secret or store ID" }, { status: 403 });
    }

    const contentType = req.headers.get("content-type") || "";
    let body;
    if (contentType.includes("application/json")) {
      body = await req.json();
    } else {
      const formData = await req.formData();
      body = Object.fromEntries(formData);
      // WooCommerce often nests things in a 'payload' when form-encoded
      if (body.payload) body = JSON.parse(body.payload as string);
    }
    
    // 1. Check if order already exists to prevent duplicates
    const existing = await prisma.order.findFirst({
      where: { 
        merchantStoreId: storeId, 
        externalId: body.id.toString(),
        source: "WOOCOMMERCE"
      }
    });

    if (existing) {
      return NextResponse.json({ message: "Order already synced", id: existing.id });
    }

    // 2. Process Line Items and Map to Local Products
    const itemsData = [];
    for (const item of body.line_items) {
      const internalProduct = await prisma.product.findFirst({
        where: { 
          merchantStoreId: storeId, 
          sku: item.sku 
        }
      });

      itemsData.push({
        productId: internalProduct?.id || null,
        name: item.name,
        quantity: item.quantity,
        price: parseFloat(item.total) / item.quantity
      });

      // Optional: Deduct inventory
      if (config.deductInventory && internalProduct) {
        await prisma.product.update({
          where: { id: internalProduct.id },
          data: { stock: { decrement: item.quantity } }
        });
      }
    }

    // 3. Create the Order
    const order = await prisma.order.create({
      data: {
        merchantStoreId: storeId,
        externalId: body.id.toString(),
        source: "WOOCOMMERCE",
        total: parseFloat(body.total),
        status: mapStatus(body.status),
        customerName: `${body.customer.first_name} ${body.customer.last_name}`,
        customerEmail: body.customer.email,
        customerPhone: body.customer.phone,
        deliveryAddress: body.customer.address,
        items: {
          create: itemsData
        }
      }
    });

    return NextResponse.json({ success: true, internalOrderId: order.id });

  } catch (err: any) {
    console.error("WooCommerce Webhook Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

function mapStatus(wcStatus: string) {
  const mapping: Record<string, string> = {
    'pending': 'PENDING',
    'processing': 'CONFIRMED',
    'on-hold': 'HOLD',
    'completed': 'DELIVERED',
    'cancelled': 'CANCELLED',
    'refunded': 'RETURNED',
    'failed': 'CANCELLED'
  };
  return mapping[wcStatus] || 'PENDING';
}
