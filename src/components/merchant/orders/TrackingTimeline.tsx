"use client";

import { TrackingEvent, TrackingStatus } from "@/lib/logistics/hub";
import { CheckCircle2, Truck, Box, Clock, XCircle, RefreshCcw } from "lucide-react";

interface TrackingTimelineProps {
  events: TrackingEvent[];
  currentStatus: TrackingStatus;
  provider: string;
}

const statusConfig: Record<TrackingStatus, { color: string; icon: any; label: string }> = {
  PENDING: { color: "text-amber-500", icon: Clock, label: "Pending" },
  PICKED_UP: { color: "text-blue-500", icon: Box, label: "Picked Up" },
  IN_TRANSIT: { color: "text-indigo-500", icon: Truck, label: "In Transit" },
  OUT_FOR_DELIVERY: { color: "text-purple-500", icon: Truck, label: "Out for Delivery" },
  DELIVERED: { color: "text-emerald-500", icon: CheckCircle2, label: "Delivered" },
  RETURNED: { color: "text-red-500", icon: RefreshCcw, label: "Returned" },
  CANCELLED: { color: "text-slate-500", icon: XCircle, label: "Cancelled" },
  UNKNOWN: { color: "text-slate-400", icon: Clock, label: "Unknown" },
};

export function TrackingTimeline({ events, currentStatus, provider }: TrackingTimelineProps) {
  if (!events || events.length === 0) {
    return (
      <div className="bg-slate-50 rounded-xl p-6 text-center border-2 border-dashed border-slate-200">
        <p className="text-slate-500 font-medium">No tracking events found for this {provider} parcel.</p>
      </div>
    );
  }

  return (
    <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
      {events.map((event, index) => {
        const config = statusConfig[event.status] || statusConfig.UNKNOWN;
        const Icon = config.icon;

        return (
          <div key={index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            {/* Icon */}
            <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-100 group-[.is-active]:bg-white text-slate-500 group-[.is-active]:text-indigo-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
              <Icon className={`w-5 h-5 ${index === 0 ? "text-indigo-600 animate-pulse" : config.color}`} />
            </div>
            {/* Content Card */}
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between space-x-2 mb-1">
                <div className={`font-bold ${config.color}`}>{config.label}</div>
                <time className="font-medium text-xs text-slate-500 uppercase">
                  {new Date(event.timestamp).toLocaleString('en-BD', { 
                    day: 'numeric', 
                    month: 'short', 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </time>
              </div>
              <div className="text-slate-600 text-sm">
                {event.description}
                {event.location && (
                  <span className="block mt-1 font-semibold text-slate-800">
                    📍 {event.location}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
