import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { PaymentService } from "@/services/PaymentService";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const amount = parseFloat(searchParams.get("amount") || "0");
  const type = searchParams.get("type") || "";
  const storeId = searchParams.get("storeId") || "";
  const invoiceId = searchParams.get("invoiceId") || "";
  const planId = searchParams.get("planId") || "";
  const credits = searchParams.get("credits") || "0";

  // Simulation page content
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>bKash Simulation</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
          body { font-family: 'Inter', sans-serif; }
        </style>
      </head>
      <body class="bg-[#e2136e] min-h-screen flex items-center justify-center p-4">
        <div class="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-300">
          <div class="bg-[#e2136e] p-8 text-center text-white">
            <div class="w-20 h-20 bg-white rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-xl">
               <span class="text-[#e2136e] font-black text-2xl">bKash</span>
            </div>
            <h1 class="text-xl font-black uppercase italic tracking-tighter">Merchant Checkout</h1>
            <p class="text-pink-100 text-xs font-bold uppercase tracking-widest mt-1 opacity-80">Payment Simulation</p>
          </div>
          
          <div class="p-8 space-y-6">
            <div class="flex justify-between items-center pb-4 border-b border-gray-100">
              <span class="text-slate-400 text-xs font-bold uppercase tracking-widest">Amount to Pay</span>
              <span class="text-2xl font-black text-slate-900 italic">৳${amount.toLocaleString()}</span>
            </div>
            
            <div class="space-y-4">
               <div class="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Payment Purpose</p>
                  <p class="text-sm font-bold text-slate-800">${type.replace('_', ' ')}</p>
               </div>
            </div>

            <form action="/api/payments/bkash/simulate" method="POST" class="space-y-4">
              <input type="hidden" name="amount" value="${amount}">
              <input type="hidden" name="type" value="${type}">
              <input type="hidden" name="storeId" value="${storeId}">
              <input type="hidden" name="invoiceId" value="${invoiceId}">
              <input type="hidden" name="planId" value="${planId}">
              <input type="hidden" name="credits" value="${credits}">
              
              <button type="submit" name="status" value="success" class="w-full bg-[#e2136e] text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-pink-200">
                Confirm Payment
              </button>
              <button type="submit" name="status" value="cancel" class="w-full bg-slate-100 text-slate-400 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-200 transition-all">
                Cancel
              </button>
            </form>
          </div>
          
          <div class="bg-slate-50 p-4 text-center">
             <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">BusinessConnect.bd Secure Gateway</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return new NextResponse(html, { headers: { "Content-Type": "text/html" } });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const status = formData.get("status");
  const amount = parseFloat(formData.get("amount") as string || "0");
  const type = formData.get("type") as string || "";
  const storeId = formData.get("storeId") as string || "";
  const userId = session.userId;
  
  const metadata = {
    invoiceId: formData.get("invoiceId"),
    planId: formData.get("planId"),
    credits: formData.get("credits")
  };

  if (status === "success") {
    const trxId = `SIM-BK-${Math.random().toString(36).substring(7).toUpperCase()}`;
    await PaymentService.completeTransaction(storeId, userId, amount, type, "BKASH", trxId, metadata);
    return NextResponse.redirect(new URL("/merchant/billing?payment=success", req.url));
  } else {
    return NextResponse.redirect(new URL("/merchant/billing?payment=cancelled", req.url));
  }
}
