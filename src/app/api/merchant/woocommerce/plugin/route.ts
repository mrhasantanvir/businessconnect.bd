import { NextRequest, NextResponse } from "next/server";
import { db as prisma } from "@/lib/db";
import JSZip from "jszip";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const merchantId = searchParams.get("merchantId");

  if (!merchantId) return new NextResponse("Missing Merchant ID", { status: 400 });

  const config = await prisma.wcConfig.findUnique({
    where: { merchantStoreId: merchantId }
  });

  if (!config) return new NextResponse("Configuration not found", { status: 404 });

  const apiBaseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3030";
  const webhookUrl = `${apiBaseUrl}/api/webhooks/woocommerce`;

  const phpContent = `<?php
/**
 * Plugin Name: BusinessConnect Sync
 * Plugin URI: ${apiBaseUrl}
 * Description: Real-time order synchronization for Businessconnect.bd platform.
 * Version: 1.0.0
 * Author: BusinessConnect BD Engineering
 */

if (!defined('ABSPATH')) exit;

add_action('woocommerce_new_order', 'bc_sync_on_new_order', 10, 1);
add_action('woocommerce_order_status_changed', 'bc_sync_on_status_change', 10, 3);

function bc_sync_on_new_order($order_id) {
    bc_sync_dispatch_order($order_id);
}

function bc_sync_on_status_change($order_id, $old_status, $new_status) {
    bc_sync_dispatch_order($order_id);
}

function bc_sync_dispatch_order($order_id) {
    $order = wc_get_order($order_id);
    if (!$order) return;

    $payload = array(
        'id' => $order->get_id(),
        'order_number' => $order->get_order_number(),
        'status' => $order->get_status(),
        'total' => $order->get_total(),
        'currency' => $order->get_currency(),
        'customer' => array(
            'first_name' => $order->get_billing_first_name(),
            'last_name' => $order->get_billing_last_name(),
            'email' => $order->get_billing_email(),
            'phone' => $order->get_billing_phone(),
            'address' => $order->get_billing_address_1() . ', ' . $order->get_billing_city()
        ),
        'line_items' => array()
    );

    foreach ($order->get_items() as $item_id => $item) {
        $product = $item->get_product();
        $payload['line_items'][] = array(
            'product_id' => $item->get_product_id(),
            'name' => $item->get_name(),
            'quantity' => $item->get_quantity(),
            'total' => $item->get_total(),
            'sku' => $product ? $product->get_sku() : ''
        );
    }

    $args = array(
        'body'        => json_encode($payload),
        'timeout'     => 45,
        'headers'     => array(
            'Content-Type' => 'application/json',
            'X-WC-Webhook-Secret' => '${config.webhookSecret}',
            'X-Store-ID' => '${merchantId}'
        ),
    );

    wp_remote_post('${webhookUrl}', $args);
}
`;

  const zip = new JSZip();
  zip.file("businessconnect-sync/businessconnect-sync.php", phpContent);
  const buffer = await zip.generateAsync({ type: "nodebuffer" });

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="businessconnect-sync.zip"`
    }
  });
}
