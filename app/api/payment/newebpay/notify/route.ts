import { NextRequest, NextResponse } from "next/server";
import { decodeTradeInfo, getNewebpayConfig } from "@/lib/payment/newebpay";
import { findByMerchantTradeNo, markFailed, markPaid } from "@/lib/payment/order-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// NewebPay server-to-server notify. ALWAYS echo "0" — anything else triggers retry storm.
export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const tradeInfoHex = String(form.get("TradeInfo") ?? "");
    const status = String(form.get("Status") ?? "");
    const { hashKey, hashIv } = getNewebpayConfig();

    const decoded = decodeTradeInfo(tradeInfoHex, hashKey, hashIv);
    let result: Record<string, unknown> = {};
    try {
      result = JSON.parse(decoded.JSONResult ?? decoded.Result ?? "{}");
    } catch {
      result = {};
    }
    const merchantOrderNo: string =
      (result.MerchantOrderNo as string) ?? decoded.MerchantOrderNo ?? "";
    const tradeNo: string | undefined = result.TradeNo as string | undefined;

    if (!merchantOrderNo) return new NextResponse("0");

    const order = findByMerchantTradeNo(merchantOrderNo);
    if (!order) return new NextResponse("0");
    if (order.status === "PAID" || order.status === "FAILED") {
      return new NextResponse("0");
    }

    if (status === "SUCCESS") {
      markPaid({
        merchantTradeNo: merchantOrderNo,
        providerRef: tradeNo ?? null,
        rawCallback: { status, decoded, result },
      });
    } else {
      markFailed({
        merchantTradeNo: merchantOrderNo,
        rawCallback: { status, decoded, result },
      });
    }
  } catch (e) {
    console.error("[newebpay/notify]", e);
  }
  return new NextResponse("0");
}
