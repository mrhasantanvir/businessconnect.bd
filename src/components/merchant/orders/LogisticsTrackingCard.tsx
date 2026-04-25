"use client";

import { logisticsHub, TrackingResult } from "@/lib/logistics/hub";
import { useState, useEffect } from "react";
import { TrackingTimeline } from "./TrackingTimeline";
import { RefreshCcw, Truck } from "lucide-react";

interface LogisticsTrackingCardProps {
  trackingCode: string | null;
  courierName: string | null;
}

export function LogisticsTrackingCard({ trackingCode, courierName }: LogisticsTrackingCardProps) {
  const [trackingData, setTrackingData] = useState<TrackingResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTracking = async () => {
    if (!trackingCode) return;
    setLoading(true);
    setError(null);
    try {
      // In a real app, we'd use a server action. 
      // For now, using the hub directly since it's a client component for real-time polling
      const result = await logisticsHub.getTracking(trackingCode, courierName || undefined);
      setTrackingData(result);
    } catch (err) {
      setError("Failed to fetch tracking information.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTracking();
  }, [trackingCode]);

  if (!trackingCode) {
    return (
      <div className="bg-slate-50 rounded-2xl p-8 text-center border-2 border-dashed border-slate-200">
        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Truck className="w-6 h-6 text-slate-400" />
        </div>
        <h3 className="text-slate-900 font-semibold mb-1">No Logistics Info</h3>
        <p className="text-slate-500 text-sm max-w-xs mx-auto">
          Prepare this order for shipment to generate a tracking code and live timeline.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-900 flex items-center gap-2">
            <Truck className="w-5 h-5 text-indigo-600" />
            Live Tracking: {courierName || "Auto-detected"}
          </h3>
          <p className="text-sm text-slate-500 font-mono mt-1">Ref: {trackingCode}</p>
        </div>
        <button 
          onClick={fetchTracking}
          disabled={loading}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCcw className={`w-4 h-4 text-slate-600 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="p-6 bg-slate-50/50">
        {loading && !trackingData ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-3">
            <RefreshCcw className="w-8 h-8 text-indigo-400 animate-spin" />
            <p className="text-slate-500 text-sm animate-pulse">Fetching global logistics data...</p>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 text-red-600 text-sm rounded-xl">
            {error}
          </div>
        ) : (
          <TrackingTimeline 
            events={trackingData?.events || []} 
            currentStatus={trackingData?.currentStatus || "UNKNOWN"} 
            provider={trackingData?.provider || "Courier"}
          />
        )}
      </div>
    </div>
  );
}
