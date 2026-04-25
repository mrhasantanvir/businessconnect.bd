import { sendEmail } from "./mail";

export async function sendOrderNotification({ order, store, customerEmail }: { order: any, store: any, customerEmail: string }) {
  if (!customerEmail) return;

  const orderUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://businessconnect.bd"}/s/${store.slug}/order/${order.id}`;
  
  const html = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <div style="padding: 40px; background-color: #f9fafb; border-radius: 24px; border: 1px solid #e5e7eb;">
        <h1 style="color: #4f46e5; margin-bottom: 24px; font-size: 28px; font-weight: 800; letter-spacing: -0.025em; text-transform: uppercase; font-style: italic;">
          ${store.name}
        </h1>
        
        <p style="font-size: 18px; font-weight: 600; margin-bottom: 16px;">Order Confirmed! 🎉</p>
        <p style="font-size: 14px; line-height: 1.6; color: #6b7280; margin-bottom: 32px;">
          Thank you for your purchase. We are processing your order and will notify you as soon as it's on its way.
        </p>

        <div style="padding: 24px; background-color: #ffffff; border-radius: 16px; border: 1px solid #f3f4f6; margin-bottom: 32px;">
          <h2 style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; color: #9ca3af; margin-bottom: 12px;">Order Summary</h2>
          <p style="font-size: 14px; font-weight: 700; margin: 0;">Order ID: #${order.id.slice(-8).toUpperCase()}</p>
          <p style="font-size: 14px; font-weight: 700; margin: 4px 0;">Total Amount: ৳${order.total.toLocaleString()}</p>
        </div>

        <a href="${orderUrl}" style="display: inline-block; padding: 16px 32px; background-color: #111827; color: #ffffff; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em;">
          Track My Order & View Invoice
        </a>

        <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #e5e7eb; text-align: center;">
          <p style="font-size: 12px; color: #9ca3af;">
            If you have any questions, reply to this email or visit our store.
          </p>
          <p style="font-size: 10px; color: #d1d5db; margin-top: 8px; font-style: italic;">
            Powered by BusinessConnect.bd - AI-First Business OS
          </p>
        </div>
      </div>
    </div>
  `;

  return await sendEmail({
    to: customerEmail,
    subject: `Order Confirmed: #${order.id.slice(-8).toUpperCase()} from ${store.name}`,
    html
  });
}

export async function sendOrderStatusUpdate({ order, store, customerEmail, status }: { order: any, store: any, customerEmail: string, status: string }) {
  if (!customerEmail) return;

  const orderUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://businessconnect.bd"}/s/${store.slug}/order/${order.id}`;
  
  const statusMessages: Record<string, string> = {
    "SHIPPED": "Your order is on the way! 🚚",
    "DELIVERED": "Your order has been delivered! 🎁",
    "CANCELLED": "Your order has been cancelled.",
  };

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="padding: 40px; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 20px;">
        <h2 style="color: #4f46e5;">${store.name}</h2>
        <p style="font-size: 18px; font-weight: bold;">${statusMessages[status] || `Your order status is now ${status}`}</p>
        <p>Order ID: #${order.id.slice(-8).toUpperCase()}</p>
        <br/>
        <a href="${orderUrl}" style="padding: 12px 24px; background: #111827; color: #fff; text-decoration: none; border-radius: 8px; font-weight: bold;">
          View Live Status
        </a>
      </div>
    </div>
  `;

  return await sendEmail({
    to: customerEmail,
    subject: `Update on Order #${order.id.slice(-8).toUpperCase()}`,
    html
  });
}
