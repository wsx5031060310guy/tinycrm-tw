import { NextRequest, NextResponse } from "next/server";
import { createCheckoutSession } from "@/lib/payment/stripe";
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

  const base = siteUrl(req);
  try {
    const session = await createCheckoutSession({
      amountTwd: plan.amount,
      itemName: plan.name,
      successUrl: `${base}/payment/success?session={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${base}/payment/cancelled`,
    });
    return NextResponse.json({ url: session.url, id: session.id });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "stripe error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
