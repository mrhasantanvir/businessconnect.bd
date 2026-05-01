import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting data cleanup...");

  // Order matters for tables with foreign key constraints
  // We'll use a sequence that minimizes constraint issues or just use executeRaw for TRUNCATE if needed.
  // But since we are deleting almost everything, we can just do it in order.

  const tablesToClear = [
    "OrderItem",
    "OrderActivity",
    "ShipmentItem",
    "Shipment",
    "ProductReview",
    "ReviewImage",
    "FlashSaleItem",
    "FlashSale",
    "InventoryLog",
    "WarehouseStock",
    "Warehouse",
    "StockTransfer",
    "UnifiedMessage",
    "UnifiedConversation",
    "KnowledgeBase",
    "CampaignLog",
    "MarketingCampaign",
    "Coupon",
    "CustomerProfile",
    "Customer",
    "StaffDocument",
    "StaffActivityFrame",
    "StaffWorkLog",
    "IncrementRule",
    "StaffCommission",
    "CommissionPayout",
    "StaffProfile",
    "PayoutRequest",
    "InternalMessage",
    "ChatModerationAlert",
    "ChatChannelMember",
    "ChatChannel",
    "IncidentMessage",
    "IncidentActivity",
    "Incident",
    "CallLog",
    "PaymentTransaction",
    "AbandonedCart",
    "CourierConfig",
    "SmsConfig",
    "SipConfig",
    "PaymentConfig",
    "ShippingRate",
    "WcConfig",
    "GoogleSheetsConfig",
    "FacebookConfig",
    "LedgerTransaction",
    "AccountingAttachment",
    "RecurringTransaction",
    "Budget",
    "BusinessAccount",
    "AccountCategory",
    "CommissionRule",
    "Branch",
    "Category",
    "Brand",
    "Product",
    "InvoiceItem",
    "Invoice",
    "UserStatusLog",
    "Otp",
    "Order",
  ];

  for (const table of tablesToClear) {
    try {
      // @ts-ignore
      await prisma[table.charAt(0).toLowerCase() + table.slice(1)].deleteMany({});
      console.log(`Cleared table: ${table}`);
    } catch (error) {
      console.error(`Error clearing table ${table}:`, error);
    }
  }

  // Handle MerchantStore separately (might have cycles or just do it last)
  try {
    await prisma.merchantStore.deleteMany({});
    console.log("Cleared MerchantStore");
  } catch (error) {
    console.error("Error clearing MerchantStore:", error);
  }

  // Handle User separately (preserve SUPER_ADMIN)
  try {
    const deletedUsers = await prisma.user.deleteMany({
      where: {
        role: {
          not: "SUPER_ADMIN"
        }
      }
    });
    console.log(`Deleted ${deletedUsers.count} users (preserved SUPER_ADMIN)`);
  } catch (error) {
    console.error("Error clearing User:", error);
  }

  console.log("Cleanup complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
