import React from "react";
import { db as prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  Landmark, 
  PieChart, 
  ArrowUpRight, 
  ArrowDownLeft, 
  LayoutGrid, 
  Target, 
  Zap,
  BarChart3,
  Calendar,
  Layers,
  History,
  CreditCard,
  Banknote
} from "lucide-react";
import { TransactionForm } from "./TransactionForm";
import { CategoryManager } from "./CategoryManager";
import { BranchLedger } from "./BranchLedger";
import { BudgetPlanner } from "./BudgetPlanner";
import { RecurringManager } from "./RecurringManager";
import { AccountManager } from "./AccountManager";
import { DisbursementManager } from "./DisbursementManager";

import { hasPermission } from "@/lib/permissions";

export default async function MerchantAccountingPage() {
  const session = await getSession();
  if (!session || !session.merchantStoreId) redirect("/login");

  const canView = await hasPermission("accounting:view");
  if (!canView) {
    return (
       <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <div className="w-20 h-20 bg-rose-50 rounded-[32px] flex items-center justify-center text-rose-500">
             <Zap className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Access Denied</h2>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest text-center max-w-xs">
             You do not have permission to access the Accounting module.
          </p>
       </div>
    );
  }

  const categories = await prisma.accountCategory.findMany({
    where: { merchantStoreId: session.merchantStoreId },
    include: { transactions: { where: { merchantStoreId: session.merchantStoreId } } },
    orderBy: { name: "asc" }
  });

  const branches = await prisma.branch.findMany({
    where: { merchantStoreId: session.merchantStoreId }
  });

  const transactions = await prisma.ledgerTransaction.findMany({
    where: { merchantStoreId: session.merchantStoreId },
    include: { branch: true, category: true, account: true },
    orderBy: { date: "desc" }
  });

  const budgets = await prisma.budget.findMany({
    where: { merchantStoreId: session.merchantStoreId },
    include: { category: { include: { transactions: true } }, branch: true }
  });

  const recurrings = await prisma.recurringTransaction.findMany({
    where: { merchantStoreId: session.merchantStoreId },
    include: { category: true, branch: true }
  });

  const accounts = await prisma.businessAccount.findMany({
    where: { merchantStoreId: session.merchantStoreId },
    include: { branch: true }
  });

  // Calculate Stats
  const totalIncome = transactions.filter(t => t.type === "INCOME").reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === "EXPENSE").reduce((acc, t) => acc + t.amount, 0);
  const netProfit = totalIncome - totalExpense;
  const totalLiquidity = accounts.reduce((acc, a) => acc + a.balance, 0);

  // Branch-wise Stats
  const branchStats = branches.map(b => {
    const branchTrx = transactions.filter(t => t.branchId === b.id);
    const income = branchTrx.filter(t => t.type === "INCOME").reduce((acc, t) => acc + t.amount, 0);
    const expense = branchTrx.filter(t => t.type === "EXPENSE").reduce((acc, t) => acc + t.amount, 0);
    return { name: b.name, income, expense, profit: income - expense };
  });

  return (
    <div className="w-full max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
      {/* Premium Header Container */}
      <div className="relative p-12 bg-white border border-[#E5E7EB] rounded-[56px] shadow-sm overflow-hidden group">
         <div className="absolute top-0 right-0 p-24 bg-indigo-50/50 rounded-full blur-[100px] transform translate-x-1/3 -translate-y-1/3 group-hover:bg-indigo-100 transition-colors duration-1000" />
         
         <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div className="space-y-4">
               <div className="flex items-center gap-3">
                  <div className="px-4 py-1.5 bg-slate-900 text-[#BEF264] text-[10px] font-black uppercase tracking-[0.3em] rounded-full flex items-center gap-2">
                     <Zap className="w-3 h-3 fill-current" /> Merchant Accounting Hub
                  </div>
                  <span className="text-slate-300 font-medium">/</span>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Accounts Management</div>
               </div>
               <h1 className="text-7xl font-black text-slate-900 tracking-tighter leading-none">
                  ACCOUNTS<span className="text-indigo-600">.</span>
               </h1>
               <p className="max-w-md text-slate-500 font-medium text-lg leading-relaxed uppercase tracking-tight">
                  Manage your store's income, expenses, and profitability in one place.
               </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch gap-4">
               <div className="px-10 py-8 bg-slate-50 border border-slate-100 rounded-[40px] flex flex-col justify-center min-w-[220px] group/card hover:bg-white hover:shadow-xl transition-all duration-500">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                     <TrendingUp className="w-3 h-3 text-emerald-500" /> Total Revenue
                  </p>
                  <p className="text-4xl font-black text-slate-900 tracking-tighter">৳{totalIncome.toLocaleString()}</p>
               </div>
               <div className="px-10 py-8 bg-slate-900 text-white rounded-[40px] shadow-2xl shadow-indigo-100 flex flex-col justify-center min-w-[220px] relative overflow-hidden">
                  <div className="absolute inset-0 bg-indigo-600/10 group-hover:bg-indigo-600/20 transition-all" />
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 relative z-10 flex items-center gap-2">
                     <Landmark className="w-3 h-3 text-[#BEF264]" /> Cash Liquidity
                  </p>
                  <p className="text-4xl font-black text-[#BEF264] tracking-tighter relative z-10">৳{totalLiquidity.toLocaleString()}</p>
               </div>
            </div>
         </div>
      </div>

      {/* Control Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
         
         {/* Left Column: Primary Ledger (8 Cols) */}
         <div className="lg:col-span-8 space-y-10">
            
            {/* Account & Disbursement Grid */}
            <div className="grid grid-cols-1 gap-10">
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  <AccountManager branches={branches} accounts={accounts} />
                  <DisbursementManager accounts={accounts} branches={branches} />
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <TransactionForm branches={branches} categories={categories} accounts={accounts} />
                  <div className="space-y-8">
                     <BudgetPlanner categories={categories} branches={branches} budgets={budgets} />
                     <RecurringManager categories={categories} branches={branches} recurrings={recurrings} />
                  </div>
               </div>
            </div>

            {/* Performance Visualization */}
            <div className="bg-white border border-[#E5E7EB] rounded-[56px] p-12 shadow-sm">
               <div className="flex items-center justify-between mb-10">
                  <div className="flex items-center gap-4">
                     <div className="w-14 h-14 bg-emerald-50 rounded-3xl flex items-center justify-center text-emerald-600">
                        <BarChart3 className="w-7 h-7" />
                     </div>
                     <div>
                        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Profitability Report</h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Real-time branch profitability analysis</p>
                     </div>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {branchStats.map(bs => (
                    <div key={bs.name} className="p-8 bg-slate-50/50 rounded-[40px] border border-slate-100 group hover:bg-slate-900 transition-all duration-500 transform hover:-translate-y-1">
                       <div className="flex items-center justify-between mb-6">
                          <p className="text-[11px] font-black text-indigo-500 uppercase tracking-[0.3em] group-hover:text-indigo-300">{bs.name}</p>
                          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${bs.profit >= 0 ? 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-500/20' : 'bg-rose-50 text-rose-600 group-hover:bg-rose-500/20'}`}>
                             {bs.profit >= 0 ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownLeft className="w-5 h-5" />}
                          </div>
                       </div>
                       <div className="space-y-4">
                          <div className="flex items-center justify-between">
                             <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                <span className="text-[10px] font-bold text-slate-500 uppercase group-hover:text-slate-400 tracking-tighter">Gross Inflow</span>
                             </div>
                             <span className="text-sm font-black text-slate-900 group-hover:text-white">৳{bs.income.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center justify-between">
                             <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                <span className="text-[10px] font-bold text-slate-500 uppercase group-hover:text-slate-400 tracking-tighter">Operating Cost</span>
                             </div>
                             <span className="text-sm font-black text-slate-900 group-hover:text-white">৳{bs.expense.toLocaleString()}</span>
                          </div>
                          <div className="pt-5 border-t border-slate-200 group-hover:border-slate-800 flex items-center justify-between">
                             <span className="text-xs font-black text-slate-900 uppercase group-hover:text-slate-400 tracking-tighter">Branch Yield</span>
                             <span className={`text-xl font-black ${bs.profit >= 0 ? 'text-emerald-600 group-hover:text-[#BEF264]' : 'text-rose-600'}`}>৳{bs.profit.toLocaleString()}</span>
                          </div>
                       </div>
                    </div>
                 ))}
               </div>
            </div>

            <BranchLedger transactions={transactions} />
         </div>

         {/* Right Column: Intelligence & Reports (4 Cols) */}
         <div className="lg:col-span-4 space-y-10 sticky top-8">
            <CategoryManager categories={categories} />
            
            {/* Quick Insights Card */}
            <div className="p-12 bg-indigo-600 text-white rounded-[56px] shadow-2xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-24 bg-white/10 rounded-full blur-[80px] transform translate-x-1/3 -translate-y-1/3" />
               <div className="relative z-10 space-y-6">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center text-[#BEF264] border border-white/20 shadow-xl">
                     <Layers className="w-8 h-8" />
                  </div>
                  <h4 className="text-4xl font-black tracking-tighter leading-[0.9] uppercase">Accounting<br/>Insights</h4>
                  <p className="text-sm font-medium text-indigo-100 leading-relaxed uppercase tracking-tight opacity-90">
                     Track Buy, Sell, Salaries and Courier settlements in one unified dashboard.
                  </p>
                  <div className="pt-8 border-t border-white/10 flex items-center justify-between">
                     <div className="flex flex-col">
                        <span className="text-[9px] font-black uppercase tracking-widest text-indigo-300">Net Profit</span>
                        <span className="text-2xl font-black">৳{netProfit.toLocaleString()}</span>
                     </div>
                     <div className="w-12 h-12 rounded-full border-2 border-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <TrendingUp className="w-5 h-5 text-[#BEF264]" />
                     </div>
                  </div>
               </div>
            </div>

            {/* Recent History Mini-Widget */}
            <div className="bg-white border border-[#E5E7EB] rounded-[56px] p-10 shadow-sm">
               <div className="flex items-center gap-3 mb-8">
                  <History className="w-5 h-5 text-slate-400" />
                  <h5 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">Latest Movements</h5>
               </div>
               <div className="space-y-6">
                  {transactions.slice(0, 10).map(t => (
                     <div key={t.id} className="flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                           <div className={`w-2 h-2 rounded-full ${t.type === 'INCOME' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                           <div>
                              <p className="text-[11px] font-black text-slate-800 leading-none group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{t.category.name}</p>
                              <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">
                                 {t.account?.name || "Internal Log"} {t.branch ? `• ${t.branch.name}` : ""}
                              </p>
                           </div>
                        </div>
                        <span className={`text-xs font-black ${t.type === 'INCOME' ? 'text-emerald-600' : 'text-slate-900'}`}>৳{t.amount.toLocaleString()}</span>
                     </div>
                  ))}
               </div>
            </div>
         </div>

      </div>
    </div>
  );
}
