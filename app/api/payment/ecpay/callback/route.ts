import { NextRequest, NextResponse } from "next/server";
import { getEcpayConfig, verifyCallback } from "@/lib/payment/ecpay";
import { markFailed, markPaid } from "@/lib/payment/order-store";

// ECPay posts application/x-www-form-urlencoded to ReturnURL.
// We must reply with the literal "1|OK" body to acknowledge receipt;
// any other response makes ECPay retry.
export async function POST(req: NextRequest) {
  const body = await req.text();
  const params = Object.fromEntries(new URLSearchParams(body));

  const { hashKey, hashIV } = getEcpayConfig();
  const ok = verifyCallback(params, hashKey, hashIV);
  if (!ok) {
    return new NextResponse("0|CheckMacFailed", { status: 400 });
  }

  const merchantTradeNo = params.MerchantTradeNo;
  if (!merchantTradeNo) {
    return new NextResponse("0|MissingTradeNo", { status: 400 });
  }

  const rtnCode = params.RtnCode;
  if (rtnCode === "1") {
    markPaid({
      merchantTradeNo,
      providerRef: params.TradeNo ?? null,
      rawCallback: params,
    });
  } else {
    markFailed({ merchantTradeNo, rawCallback: params });
  }

  return new NextResponse("1|OK", { status: 200 });
}

// Some ECPay environments send GET probes; respond cleanly so health checks pass.
export async function GET() {
  return NextResponse.json({ status: "ok" });
}
