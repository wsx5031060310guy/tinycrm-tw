import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/payment/stripe";
import { markFailed, markPaid } from "@/lib/payment/order-store";

// Stripe webhook receiver. Stripe sends raw bytes — we must read the body
// as text and verify against STRIPE_WEBHOOK_SECRET to prevent spoofing.
export async function POST(req: NextRequest) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) {
    return NextResponse.json(
      { error: "Stripe not configured" },
      { status: 503 }
    );
  }

  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const raw = await req.text();
  let event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, secret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as { id: string; metadata?: Record<string, string> };
    const merchantTradeNo = session.metadata?.merchantTradeNo;
    if (merchantTradeNo) {
      markPaid({
        merchantTradeNo,
        providerRef: session.id,
        rawCallback: event.data.object as unknown as Record<string, unknown>,
      });
    }
  } else if (
    event.type === "checkout.session.async_payment_failed" ||
    event.type === "checkout.session.expired"
  ) {
    const session = event.data.object as { metadata?: Record<string, string> };
    const merchantTradeNo = session.metadata?.merchantTradeNo;
    if (merchantTradeNo) {
      markFailed({
        merchantTradeNo,
        rawCallback: event.data.object as unknown as Record<string, unknown>,
      });
    }
  }

  return NextResponse.json({ received: true });
}

export const dynamic = "force-dynamic";
