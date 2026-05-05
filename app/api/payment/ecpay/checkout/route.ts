import { NextRequest, NextResponse } from "next/server";
import { buildCheckoutParams } from "@/lib/payment/ecpay";
import { getPlan } from "@/lib/payment/pricing";

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

  const merchantTradeNo = `TCRM${Date.now()}${Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0")}`.slice(0, 20);

  // TODO: persist Order(merchantTradeNo, plan, status=PENDING) once Order model is added to schema.

  const base = siteUrl(req);
  const { endpoint, params } = buildCheckoutParams({
    merchantTradeNo,
    amount: plan.amount,
    itemName: plan.name,
    tradeDesc: plan.description,
    returnUrl: `${base}/api/payment/ecpay/callback`,
    clientBackUrl: `${base}/payment/success?order=${merchantTradeNo}`,
    orderResultUrl: `${base}/payment/success?order=${merchantTradeNo}`,
  });

  return NextResponse.json({ endpoint, params, merchantTradeNo });
}
