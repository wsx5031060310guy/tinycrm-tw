import { NextRequest, NextResponse } from "next/server";
import { buildCheckoutPayload } from "@/lib/payment/newebpay";
import { getPlan } from "@/lib/payment/pricing";
import { createOrder, makeMerchantTradeNo } from "@/lib/payment/order-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function siteUrl(req: NextRequest) {
  return process.env.NEXT_PUBLIC_SITE_URL || req.nextUrl.origin;
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const planCode = String(body.plan ?? "basic");
  const plan = getPlan(planCode);
  if (!plan) {
    return NextResponse.json({ error: "invalid plan" }, { status: 400 });
  }

  const merchantOrderNo = makeMerchantTradeNo("TCRM");
  const customerEmail = typeof body.email === "string" ? body.email : null;
  createOrder({ merchantTradeNo: merchantOrderNo, plan, provider: "NEWEBPAY", customerEmail });

  const base = siteUrl(req);
  const { endpoint, params } = buildCheckoutPayload({
    merchantOrderNo,
    amount: plan.amount,
    itemDesc: plan.name,
    email: customerEmail || "buyer@tinycrm.tw",
    returnUrl: `${base}/api/payment/newebpay/return`,
    notifyUrl: `${base}/api/payment/newebpay/notify`,
    clientBackUrl: `${base}/payment/success?order=${merchantOrderNo}`,
  });

  return NextResponse.json({ endpoint, params, merchantOrderNo });
}
