import React from "react";
import WarehouseClient from "./WarehouseClient";

export const metadata = {
  title: "Warehouse Management | BusinessConnect",
  description: "Advanced warehouse and inventory management for elite merchants.",
};

export default function WarehousePage() {
  return (
    <div className="max-w-[1600px] mx-auto">
      <WarehouseClient />
    </div>
  );
}
