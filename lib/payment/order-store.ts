// In-memory order store. Mirrors the Prisma `Order` model so the webhook
// flow is testable before DATABASE_URL is set. Swap the implementation for
// a Prisma client once Postgres is provisioned — the API surface is stable.

import crypto from "node:crypto";
import type { Plan } from "./pricing";

export type OrderProvider = "ECPAY" | "STRIPE";
export type OrderStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

export interface StoredOrder {
  id: string;
  merchantTradeNo: string;
  planCode: string;
  amount: number;
  currency: string;
  provider: OrderProvider;
  providerRef: string | null;
  status: OrderStatus;
  customerEmail: string | null;
  rawCallback: Record<string, unknown> | null;
  paidAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const globalForStore = globalThis as unknown as {
  __tinycrmOrders?: StoredOrder[];
};
const store: StoredOrder[] =
  globalForStore.__tinycrmOrders ?? (globalForStore.__tinycrmOrders = []);

export function makeMerchantTradeNo(prefix = "TCRM"): string {
  // ECPay limit: 20 chars, alphanumeric only.
  const stamp = Date.now().toString(36).toUpperCase();
  const rand = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `${prefix}${stamp}${rand}`.slice(0, 20);
}

export function createOrder(input: {
  merchantTradeNo: string;
  plan: Plan;
  provider: OrderProvider;
  customerEmail?: string | null;
}): StoredOrder {
  const now = new Date();
  const order: StoredOrder = {
    id: crypto.randomBytes(8).toString("hex"),
    merchantTradeNo: input.merchantTradeNo,
    planCode: input.plan.code,
    amount: input.plan.amount,
    currency: "TWD",
    provider: input.provider,
    providerRef: null,
    status: "PENDING",
    customerEmail: input.customerEmail ?? null,
    rawCallback: null,
    paidAt: null,
    createdAt: now,
    updatedAt: now,
  };
  store.push(order);
  return order;
}

export function findByMerchantTradeNo(no: string): StoredOrder | null {
  return store.find((o) => o.merchantTradeNo === no) ?? null;
}

export function markPaid(input: {
  merchantTradeNo: string;
  providerRef?: string | null;
  rawCallback: Record<string, unknown>;
}): StoredOrder | null {
  const order = findByMerchantTradeNo(input.merchantTradeNo);
  if (!order) return null;
  order.status = "PAID";
  order.providerRef = input.providerRef ?? order.providerRef;
  order.paidAt = new Date();
  order.rawCallback = input.rawCallback;
  order.updatedAt = new Date();
  return order;
}

export function markFailed(input: {
  merchantTradeNo: string;
  rawCallback: Record<string, unknown>;
}): StoredOrder | null {
  const order = findByMerchantTradeNo(input.merchantTradeNo);
  if (!order) return null;
  order.status = "FAILED";
  order.rawCallback = input.rawCallback;
  order.updatedAt = new Date();
  return order;
}

export function listOrders(): StoredOrder[] {
  return [...store].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  );
}
