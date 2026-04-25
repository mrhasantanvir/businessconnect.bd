'use client';

import React from 'react';
import { Wallet, MessageSquare, PhoneCall } from 'lucide-react';

interface WalletProps {
  smsBalance: number;
  sipBalance: number; // in mins or BDT
  validityDays?: number;
}

export default function ResourceWalletWidget({ smsBalance = 0, sipBalance = 0, validityDays = 30 }: WalletProps) {
  return (
    <div className="flex items-center space-x-2 md:space-x-4 bg-white/50 backdrop-blur-md border border-gray-100 rounded-2xl md:rounded-full px-3 md:px-4 py-1.5 md:py-2 shadow-sm">
      
      {/* SMS Balance */}
      <div className="flex items-center space-x-1.5 md:space-x-2 text-[10px] md:text-sm text-gray-700">
        <div className="bg-blue-100 p-1 md:p-1.5 rounded-full text-blue-600">
          <MessageSquare className="w-3 md:w-4 h-3 md:h-4" />
        </div>
        <div>
          <p className="font-bold leading-none">{smsBalance.toFixed(1)} ৳</p>
          <p className="text-[7px] md:text-[10px] text-gray-400 uppercase tracking-wider hidden xs:block">SMS</p>
        </div>
      </div>

      <div className="h-4 md:h-6 w-px bg-gray-200"></div>

      {/* SIP Balance */}
      <div className="flex items-center space-x-1.5 md:space-x-2 text-[10px] md:text-sm text-gray-700">
        <div className="bg-green-100 p-1 md:p-1.5 rounded-full text-green-600">
          <PhoneCall className="w-3 md:w-4 h-3 md:h-4" />
        </div>
        <div>
          <p className="font-bold leading-none">{sipBalance.toFixed(1)} ৳</p>
          <p className="text-[7px] md:text-[10px] text-gray-400 uppercase tracking-wider hidden xs:block">Talk</p>
        </div>
      </div>
      
      <div className="h-4 md:h-6 w-px bg-gray-200"></div>

      {/* Topup Button */}
      <a 
        href="/merchant/billing"
        className="flex items-center space-x-1 bg-indigo-600 text-white px-2.5 py-1 md:py-1.5 rounded-lg md:rounded-full text-[9px] md:text-xs font-black uppercase transition-all shadow-md shadow-indigo-500/20"
      >
        <Wallet className="w-3 h-3" />
        <span className="hidden sm:inline">Top-up</span>
      </a>

    </div>
  );
}
