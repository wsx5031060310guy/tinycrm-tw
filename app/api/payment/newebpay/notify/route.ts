import { NextRequest, NextResponse } from "next/server";
import { getNewebpayConfig, readPaymentCallback, type PaymentCallback } from "@/lib/payment/newebpay";
import { findByMerchantTradeNo, markFailed, markPaid } from "@/lib/payment/order-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// NewebPay server-to-server notify. The gateway retries up to 3 times until it
// sees HTTP 200, so anything that should be retried must not answer 200.
export async function POST(req: NextRequest) {
  let callback: PaymentCallback;
  try {
    const form = await req.formData();
    const { hashKey, hashIv } = getNewebpayConfig();
    callback = readPaymentCallback(
      String(form.get("TradeInfo") ?? ""),
      String(form.get("TradeSha") ?? ""),
      hashKey,
      hashIv,
    );
  } catch (e) {
    console.error("[newebpay/notify] rejected", e);
    return new NextResponse("rejected", { status: 400 });
  }
  const { outcome, merchantOrderNo, amount, tradeNo, payload } = callback;

  const order = findByMerchantTradeNo(merchantOrderNo);
  if (!order) return new NextResponse("0");
  if (outcome === "PENDING") {
    console.warn("[newebpay/notify] SUCCESS without PayTime, not credited", { merchantOrderNo });
    return new NextResponse("0");
  }
  if (outcome === "PAID" && amount !== order.amount) {
    console.error("[newebpay/notify] amount mismatch", { merchantOrderNo, amount, expected: order.amount });
    return new NextResponse("0");
  }

  // Check and update with no await in between, so repeated notifies credit once.
  // A payment may succeed after a failed attempt, so FAILED can still become PAID.
  const rawCallback = { payload };
  if (outcome === "PAID" && (order.status === "PENDING" || order.status === "FAILED")) {
    markPaid({ merchantTradeNo: merchantOrderNo, providerRef: tradeNo ?? null, rawCallback });
  } else if (outcome === "FAILED" && order.status === "PENDING") {
    markFailed({ merchantTradeNo: merchantOrderNo, rawCallback });
  }
  return new NextResponse("0");
}
