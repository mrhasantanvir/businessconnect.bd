import React from "react";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import PaymentConfigClient from "@/components/merchant/settings/PaymentConfigClient";
import { getPaymentConfigsAction } from "./actions";

export default async function MerchantPaymentSettingsPage() {
  const session = await getSession();
  if (!session || session.role !== "MERCHANT") {
    redirect("/login");
  }

  const configs = await getPaymentConfigsAction();

  return (
    <div className="p-4 md:p-10">
      <PaymentConfigClient initialConfigs={configs} />
    </div>
  );
}
