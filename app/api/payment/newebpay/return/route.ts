import { NextRequest, NextResponse } from "next/server";
import { getNewebpayConfig, readPaymentCallback } from "@/lib/payment/newebpay";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Browser-side return URL. Best-effort decode of MerchantOrderNo for redirect;
// authoritative state mutation happens in /api/payment/newebpay/notify.
export async function POST(req: NextRequest) {
  const form = await req.formData().catch(() => null);
  let merchantOrderNo: string | null = null;
  let status: string | null = null;
  try {
    const { hashKey, hashIv } = getNewebpayConfig();
    ({ merchantOrderNo, status } = readPaymentCallback(
      String(form?.get("TradeInfo") ?? ""),
      String(form?.get("TradeSha") ?? ""),
      hashKey,
      hashIv,
    ));
  } catch {}
  const base = process.env.NEXT_PUBLIC_SITE_URL || req.nextUrl.origin;
  const qs = new URLSearchParams();
  if (merchantOrderNo) qs.set("order", merchantOrderNo);
  if (status) qs.set("status", status);
  const url = `${base}/payment/success${qs.size > 0 ? `?${qs}` : ""}`;
  return NextResponse.redirect(url, { status: 303 });
}
