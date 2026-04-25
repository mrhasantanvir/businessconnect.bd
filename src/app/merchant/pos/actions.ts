"use server";

import { db as prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function createPosOrderAction(data: {
    items: { productId: string; quantity: number; price: number; name: string }[];
    total: number;
    paymentMethod: string;
    customerId?: string;
    customerPhone?: string;
    customerName?: string;
}) {
    const session = await getSession();
    if (!session || !session.merchantStoreId) return { success: false, error: "Unauthorized" };

    try {
        const order = await prisma.order.create({
            data: {
                merchantStoreId: session.merchantStoreId,
                total: data.total,
                status: "DELIVERED", // POS orders are usually immediate
                paymentStatus: "PAID",
                source: "POS",
                customerEntityId: data.customerId,
                customerPhone: data.customerPhone,
                customerName: data.customerName,
                items: {
                    create: data.items.map(item => ({
                        productId: item.productId,
                        quantity: item.quantity,
                        price: item.price,
                        name: item.name,
                    }))
                },
                activities: {
                    create: {
                        type: "STATUS_CHANGE",
                        message: `Order created via Cloud POS. Paid via ${data.paymentMethod}.`,
                        userId: session.userId,
                    }
                }
            }
        });

        // Deduct Inventory (Simplified)
        for (const item of data.items) {
            await prisma.product.update({
                where: { id: item.productId },
                data: { stock: { decrement: item.quantity } }
            });
        }

        revalidatePath("/merchant/pos");
        revalidatePath("/merchant/inventory");
        return { success: true, orderId: order.id };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function searchPosProductsAction(query: string) {
    const session = await getSession();
    if (!session || !session.merchantStoreId) return [];

    return prisma.product.findMany({
        where: {
            merchantStoreId: session.merchantStoreId,
            OR: [
                { name: { contains: query } },
                { sku: { contains: query } },
                { barcode: { contains: query } },
            ]
        },
        take: 10
    });
}
