import React from "react";
import Link from "next/link";
import { 
  Package, 
  Clock, 
  Truck, 
  CheckCircle2, 
  XCircle, 
  ArrowLeftRight, 
  AlertTriangle,
  Calendar
} from "lucide-react";

type StatItem = {
  label: string;
  count: number;
  value: number;
  icon: React.ReactElement;
  colorClass: string;
  bgWhite: string;
  bgDark: string;
  href: string;
};

export function OrderOverview({ 
  statsData, 
  todaysPendingData,
  damagedCount
}: { 
  statsData: any[],
  todaysPendingData: any,
  damagedCount: number
}) {
  
  // Helper to extract from grouping
  const getStat = (status: string) => {
    const found = statsData.find(s => s.status === status);
    return {
      count: found?._count?._all || 0,
      value: found?._sum?.total || 0,
    };
  };

  const pending = getStat("PENDING");
  const ready = getStat("READY_TO_SHIP");
  const shipped = getStat("SHIPPED");
  const delivered = getStat("DELIVERED");
  const cancelled = getStat("CANCELLED");
  const returned = getStat("RETURNED");

  const todayPendingCount = todaysPendingData._count?._all || 0;
  const todayPendingValue = todaysPendingData._sum?.total || 0;

  const cards: StatItem[] = [
    {
      label: "Total Pending",
      count: pending.count,
      value: pending.value,
      icon: <Clock className="w-6 h-6" />,
      colorClass: "text-amber-600",
      bgWhite: "bg-amber-50",
      bgDark: "",
      href: "/orders/list?status=PENDING"
    },
    {
      label: "Today's Pending",
      count: todayPendingCount,
      value: todayPendingValue,
      icon: <Calendar className="w-6 h-6" />,
      colorClass: "text-orange-600",
      bgWhite: "bg-orange-50",
      bgDark: "",
      href: "/orders/list?status=PENDING&today=true"
    },
    {
      label: "Ready to Ship",
      count: ready.count,
      value: ready.value,
      icon: <Package className="w-6 h-6" />,
      colorClass: "text-blue-600",
      bgWhite: "bg-blue-50",
      bgDark: "",
      href: "/orders/list?status=READY_TO_SHIP"
    },
    {
      label: "Total Shipped",
      count: shipped.count,
      value: shipped.value,
      icon: <Truck className="w-6 h-6" />,
      colorClass: "text-indigo-600",
      bgWhite: "bg-indigo-50",
      bgDark: "",
      href: "/orders/list?status=SHIPPED"
    },
    {
      label: "Delivered",
      count: delivered.count,
      value: delivered.value,
      icon: <CheckCircle2 className="w-6 h-6" />,
      colorClass: "text-emerald-600",
      bgWhite: "bg-emerald-50",
      bgDark: "",
      href: "/orders/list?status=DELIVERED"
    },
    {
      label: "Cancelled",
      count: cancelled.count,
      value: cancelled.value,
      icon: <XCircle className="w-6 h-6" />,
      colorClass: "text-rose-600",
      bgWhite: "bg-rose-50",
      bgDark: "",
      href: "/orders/list?status=CANCELLED"
    },
    {
      label: "Returned",
      count: returned.count,
      value: returned.value,
      icon: <ArrowLeftRight className="w-6 h-6" />,
      colorClass: "text-purple-600",
      bgWhite: "bg-purple-50",
      bgDark: "",
      href: "/orders/list?status=RETURNED"
    },
    {
      label: "Damaged",
      count: damagedCount,
      value: 0, 
      icon: <AlertTriangle className="w-6 h-6" />,
      colorClass: "text-red-600",
      bgWhite: "bg-red-50",
      bgDark: "",
      href: "/orders/list?status=DAMAGED"
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {cards.map((card, i) => (
        <Link 
          href={card.href}
          key={i} 
          className={`relative overflow-hidden bg-white border border-gray-100 rounded-2xl p-3.5 md:p-4 shadow-sm hover:border-indigo-500/30 transition-all group block cursor-pointer`}
        >
          {/* Subtle Background Icon */}
          <div className={`absolute -right-4 -top-4 opacity-5 pointer-events-none transition-transform group-hover:scale-110 ${card.colorClass}`}>
            {React.cloneElement(card.icon as React.ReactElement<{ className?: string }>, { className: 'w-24 h-24' })}
          </div>

          <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3 relative z-10">
            <div className={`w-7 h-7 md:w-8 md:h-8 rounded-lg flex items-center justify-center ${card.bgWhite} ${card.colorClass} group-hover:scale-105 transition-transform duration-300`}>
               {React.cloneElement(card.icon as React.ReactElement, { className: 'w-3.5 h-3.5 md:w-4 md:h-4' })}
            </div>
            <h3 className="text-[8px] md:text-[9px] font-black text-gray-400 uppercase tracking-widest leading-tight">{card.label}</h3>
          </div>

          <div className="space-y-1 relative z-10">
            <p className="text-lg md:text-xl font-black text-[#0F172A] group-hover:text-indigo-600 transition-colors leading-none">
              {card.count}
            </p>
            {card.label !== "Damaged" && (
              <p className={`text-[8px] md:text-[10px] font-bold ${card.colorClass} mt-1`}>
                ৳{card.value.toLocaleString('en-US')}
              </p>
            )}
            {card.label === "Damaged" && (
              <p className="text-xs font-bold text-gray-400">Items Count</p>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}
