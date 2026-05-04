'use client';

import React, { useEffect, useState } from "react";
import { getCourierTimelineAction } from "../merchant/orders/fulfillmentActions";
import { Truck, Clock, AlertCircle, MapPin } from "lucide-react";

export function CourierTimeline({ orderId }: { orderId: string }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTimeline() {
      try {
        const res = await getCourierTimelineAction(orderId);
        setData(res);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchTimeline();
  }, [orderId]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-gray-100 rounded w-1/4"></div>
        <div className="space-y-3">
          <div className="h-10 bg-gray-50 rounded-2xl w-full"></div>
          <div className="h-10 bg-gray-50 rounded-2xl w-full"></div>
        </div>
      </div>
    );
  }

  if (!data || !data.consignment) {
    return (
      <div className="p-6 bg-amber-50  border border-amber-100  rounded-[32px] flex items-center gap-3">
        <AlertCircle className="w-5 h-5 text-amber-500" />
        <p className="text-xs font-bold text-amber-700">Awaiting courier sync data...</p>
      </div>
    );
  }

  // Note: Steadfast usually returns 'consignment' object with 'status' and some history.
  // This is a representative mapping.
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase text-gray-400 tracking-widest flex items-center gap-2">
          <Truck className="w-4 h-4 text-indigo-500" /> Courier Live Pipeline
        </h3>
        <span className="px-3 py-1 bg-indigo-50  text-indigo-600  text-[10px] font-black uppercase rounded-full border border-indigo-100 ">
          Last Check: Just Now
        </span>
      </div>

      <div className="p-8 bg-white  border border-gray-100  rounded-[40px] space-y-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500" />
        
        <div className="flex items-start gap-4">
           <div className="w-12 h-12 rounded-2xl bg-indigo-50  flex items-center justify-center shrink-0">
             <MapPin className="w-6 h-6 text-indigo-600" />
           </div>
           <div>
              <p className="text-[10px] font-black uppercase text-gray-400 tracking-tighter mb-1">Current Destination Status</p>
              <h4 className="text-lg font-black text-[#0F172A]  capitalize">{data.consignment.status.replace("_", " ")}</h4>
              <p className="text-xs font-medium text-gray-500 mt-2 leading-relaxed">
                 The parcel is currently being managed by the Steadfast logistical hub. Expected transition within the next update cycle.
              </p>
           </div>
        </div>

        {/* Dummy/Simulated Timeline from External Status */}
        <div className="space-y-6 pt-4 border-t border-gray-50 ">
           <div className="flex items-center gap-4 opacity-70">
              <Clock className="w-4 h-4 text-gray-400" />
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Tracking Info Updated: {new Date().toLocaleTimeString()}</p>
           </div>
        </div>
      </div>
    </div>
  );
}
