"use server";

import { db as prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/permissions";

export async function createAccountCategoryAction(data: { name: string; type: string }) {
  const session = await getSession();
  if (!session || !session.merchantStoreId) throw new Error("Unauthorized");
  await requirePermission("accounting:manage");

  await prisma.accountCategory.create({
    data: {
      name: data.name,
      type: data.type,
      merchantStoreId: session.merchantStoreId,
    },
  });

  revalidatePath("/merchant/accounting");
  return { success: true };
}

export async function updateAccountBalanceAction(accountId: string, amount: number, type: "INCOME" | "EXPENSE") {
  const account = await prisma.businessAccount.findUnique({ where: { id: accountId } });
  if (!account) return;

  const newBalance = type === "INCOME" ? account.balance + amount : account.balance - amount;

  await prisma.businessAccount.update({
    where: { id: accountId },
    data: { balance: newBalance },
  });
}

export async function createLedgerTransactionAction(data: {
  amount: number;
  type: string;
  description: string;
  branchId?: string;
  categoryId: string;
  accountId?: string;
  date?: Date;
}) {
  const session = await getSession();
  if (!session || !session.merchantStoreId) throw new Error("Unauthorized");
  await requirePermission("accounting:manage");

  const transaction = await prisma.ledgerTransaction.create({
    data: {
      amount: data.amount,
      type: data.type,
      description: data.description,
      branchId: data.branchId || null,
      categoryId: data.categoryId,
      accountId: data.accountId || null,
      date: data.date || new Date(),
      merchantStoreId: session.merchantStoreId,
      userId: session.userId,
    },
  });

  // Update account balance if accountId is provided
  if (data.accountId) {
    await updateAccountBalanceAction(data.accountId, data.amount, data.type as any);
  }

  revalidatePath("/merchant/accounting");
  return { success: true };
}

export async function upsertBudgetAction(data: {
  amount: number;
  categoryId: string;
  branchId?: string;
  startDate: Date;
}) {
  const session = await getSession();
  if (!session || !session.merchantStoreId) throw new Error("Unauthorized");
  await requirePermission("accounting:manage");

  const endDate = new Date(data.startDate);
  endDate.setMonth(endDate.getMonth() + 1);

  await prisma.budget.upsert({
    where: {
      merchantStoreId_branchId_categoryId_startDate: {
        merchantStoreId: session.merchantStoreId,
        branchId: data.branchId || null,
        categoryId: data.categoryId,
        startDate: data.startDate,
      },
    },
    update: { amount: data.amount },
    create: {
      amount: data.amount,
      startDate: data.startDate,
      endDate: endDate,
      branchId: data.branchId || null,
      categoryId: data.categoryId,
      merchantStoreId: session.merchantStoreId,
    },
  });

  revalidatePath("/merchant/accounting");
  return { success: true };
}

export async function createRecurringTransactionAction(data: {
  amount: number;
  type: string;
  description: string;
  frequency: string;
  nextRunDate: Date;
  categoryId: string;
  branchId?: string;
}) {
  const session = await getSession();
  if (!session || !session.merchantStoreId) throw new Error("Unauthorized");
  await requirePermission("accounting:manage");

  await prisma.recurringTransaction.create({
    data: {
      amount: data.amount,
      type: data.type,
      description: data.description,
      frequency: data.frequency,
      nextRunDate: data.nextRunDate,
      branchId: data.branchId || null,
      categoryId: data.categoryId,
      merchantStoreId: session.merchantStoreId,
    },
  });

  revalidatePath("/merchant/accounting");
  return { success: true };
}

export async function createBusinessAccountAction(data: {
  name: string;
  type: string;
  accountNumber?: string;
  bankName?: string;
  branchId?: string;
  initialBalance?: number;
}) {
  const session = await getSession();
  if (!session || !session.merchantStoreId) throw new Error("Unauthorized");
  await requirePermission("accounting:manage");

  await prisma.businessAccount.create({
    data: {
      name: data.name,
      type: data.type,
      accountNumber: data.accountNumber,
      bankName: data.bankName,
      branchId: data.branchId || null,
      balance: data.initialBalance || 0,
      merchantStoreId: session.merchantStoreId,
    },
  });

  revalidatePath("/merchant/accounting");
  return { success: true };
}

export async function recordDisbursementAction(data: {
  amount: number;
  categoryName: string;
  description: string;
  accountId: string;
  branchId?: string;
}) {
  const session = await getSession();
  if (!session || !session.merchantStoreId) throw new Error("Unauthorized");
  await requirePermission("accounting:manage");

  // 1. Find or Create Category
  let category = await prisma.accountCategory.findFirst({
    where: { name: data.categoryName, merchantStoreId: session.merchantStoreId }
  });

  if (!category) {
    category = await prisma.accountCategory.create({
      data: { name: data.categoryName, type: "EXPENSE", merchantStoreId: session.merchantStoreId }
    });
  }

  // 2. Create Transaction
  await prisma.ledgerTransaction.create({
    data: {
      amount: data.amount,
      type: "EXPENSE",
      description: data.description,
      categoryId: category.id,
      accountId: data.accountId,
      branchId: data.branchId || null,
      merchantStoreId: session.merchantStoreId,
      userId: session.userId,
      date: new Date()
    }
  });

  // 3. Update Account Balance
  await updateAccountBalanceAction(data.accountId, data.amount, "EXPENSE");

  revalidatePath("/merchant/accounting");
  return { success: true };
}

export async function deleteLedgerTransactionAction(id: string) {
  const session = await getSession();
  if (!session || !session.merchantStoreId) throw new Error("Unauthorized");
  await requirePermission("accounting:manage");

  const transaction = await prisma.ledgerTransaction.findUnique({
    where: { id, merchantStoreId: session.merchantStoreId }
  });

  if (!transaction) throw new Error("Transaction not found");

  // Revert balance if account was linked
  if (transaction.accountId) {
    const revertType = transaction.type === "INCOME" ? "EXPENSE" : "INCOME";
    await updateAccountBalanceAction(transaction.accountId, transaction.amount, revertType as any);
  }

  await prisma.ledgerTransaction.delete({
    where: { id }
  });

  revalidatePath("/merchant/accounting");
  return { success: true };
}
