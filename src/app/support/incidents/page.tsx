import React from "react";
import { 
  Search, Filter, Plus, Clock, CheckCircle2, 
  AlertCircle, MessageSquare, ChevronRight, Hash 
} from "lucide-react";
import { db as prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import Link from "next/link";
import { redirect } from "next/navigation";

import { NewIncidentModal } from "@/components/support/NewIncidentModal";

export default async function MerchantIncidentsPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const storeId = session?.merchantStoreId as string | undefined;
  if (!storeId) redirect("/");

  const incidents = await prisma.incident.findMany({
    where: { merchantStoreId: storeId },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { messages: true } } }
  });

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Header & Sub-nav */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">Platform Support Hub</h1>
          <p className="text-sm text-[#64748B] mt-1">Raise and track incidents regarding your BusinessOS platform.</p>
        </div>
        
        <NewIncidentModal />
      </div>

      {/* High-Density Incident Table (Service-Now Style) */}
      <div className="bg-white border border-[#E5E7EB] rounded-[32px] overflow-hidden shadow-sm">
        <div className="p-6 border-b border-[#F1F5F9] flex items-center justify-between bg-[#F8F9FA]/50">
           <div className="flex items-center gap-4">
              <div className="relative group">
                <Search className="w-4 h-4 text-[#A1A1AA] absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  placeholder="Search incidents by ID or subject..." 
                  className="bg-white border border-[#E5E7EB] rounded-lg pl-9 pr-4 py-2 text-sm text-[#0F172A] outline-none focus:border-[#1E40AF] w-80 transition-colors shadow-sm"
                />
              </div>
              <button className="p-2 border border-[#E5E7EB] bg-white text-[#0F172A] rounded-lg hover:bg-[#F8F9FA] transition-colors">
                <Filter className="w-4 h-4" />
              </button>
           </div>
           <div className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-widest">
              Total: {incidents.length} Records
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="text-[10px] text-[#A1A1AA] uppercase bg-[#F8F9FA] sticky top-0 z-10 border-b border-[#E5E7EB] font-bold tracking-widest">
              <tr>
                <th className="px-6 py-4">Number</th>
                <th className="px-6 py-4">Subject</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Priority</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Updated</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {incidents.map((inc) => (
                <tr key={inc.id} className="hover:bg-[#F8F9FA]/50 transition-colors group cursor-pointer">
                  <td className="px-6 py-5">
                     <span className="font-mono font-bold text-[#1E40AF] flex items-center gap-1">
                        <Hash className="w-3 h-3 opacity-30" />
                        {inc.number}
                     </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="max-w-md">
                       <div className="font-bold text-[#0F172A] truncate">{inc.subject}</div>
                       <div className="text-xs text-[#A1A1AA] font-medium flex items-center gap-2 mt-1">
                          <MessageSquare className="w-3 h-3" />
                          {inc._count.messages} activity updates
                       </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center w-max gap-1.5 border ${
                      inc.status === 'NEW' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                      inc.status === 'IN_PROGRESS' ? 'bg-[#FFF7ED] text-[#EA580C] border-[#FFEDD5]' :
                      inc.status === 'RESOLVED' ? 'bg-[#F0FDF4] text-[#16A34A] border-[#BBF7D0]' :
                      'bg-gray-50 text-gray-500 border-gray-100'
                    }`}>
                      {inc.status === 'NEW' && <AlertCircle className="w-3 h-3" />}
                      {inc.status === 'IN_PROGRESS' && <Clock className="w-3 h-3" />}
                      {inc.status === 'RESOLVED' && <CheckCircle2 className="w-3 h-3" />}
                      {inc.status}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                       <div className={`w-2 h-2 rounded-full ${
                         inc.priority === 'CRITICAL' ? 'bg-[#DC2626] animate-pulse' :
                         inc.priority === 'HIGH' ? 'bg-[#EA580C]' :
                         inc.priority === 'MEDIUM' ? 'bg-[#1E40AF]' :
                         'bg-[#64748B]'
                       }`}></div>
                       <span className="text-[10px] font-bold text-[#0F172A]">{inc.priority}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                     <span className="text-[10px] font-bold bg-[#F1F5F9] text-[#64748B] px-2 py-1 rounded tracking-wide">
                        {inc.category}
                     </span>
                  </td>
                  <td className="px-6 py-5 text-[11px] text-[#A1A1AA] font-medium">
                     {new Date(inc.updatedAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-5 text-center">
                    <Link href={`/support/incidents/${inc.id}`} className="p-2 hover:bg-white rounded-xl transition-all shadow-sm group-hover:shadow group-hover:text-[#1E40AF] inline-flex">
                       <ChevronRight className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              ))}
              {incidents.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center">
                     <div className="flex flex-col items-center gap-3">
                        <MessageSquare className="w-12 h-12 text-[#E5E7EB]" />
                        <h3 className="font-bold text-[#64748B]">No active incidents found</h3>
                        <p className="text-sm text-[#A1A1AA]">Need help? Try raising a new incident request.</p>
                     </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="h-12 border-t border-[#E5E7EB] bg-[#F8F9FA]/50 flex items-center justify-between px-6 text-[10px] font-bold text-[#A1A1AA] uppercase tracking-widest">
          <div>Powered by Professional Service-Now Engine</div>
          <div className="flex items-center gap-4">
             <button className="hover:text-[#0F172A] transition-colors">Documentation</button>
             <button className="hover:text-[#0F172A] transition-colors">System Health</button>
          </div>
        </div>
      </div>
    </div>
  );
}
