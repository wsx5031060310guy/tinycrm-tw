// NewebPay callback routes against the in-memory order store.
//   npm test
import assert from "node:assert/strict";
import { createCipheriv } from "node:crypto";
import { before, describe, it, mock } from "node:test";
import { NextRequest } from "next/server";
import { computeTradeSha } from "@/lib/payment/newebpay";
import { findByMerchantTradeNo } from "@/lib/payment/order-store";
import { POST as checkout } from "@/app/api/payment/newebpay/checkout/route";
import { POST as notify } from "@/app/api/payment/newebpay/notify/route";
import { POST as back } from "@/app/api/payment/newebpay/return/route";

const HASH_KEY = "12345678901234567890123456789012";
const HASH_IV = "1234567890123456";
const AMOUNT = 499; // plan "basic"

type Fields = Record<string, string>;

/** Encrypt and sign a payload the way the gateway does. */
function seal(payload: unknown, hashKey = HASH_KEY): Fields {
  const body = Buffer.from(JSON.stringify(payload));
  const pad = 32 - (body.length % 32);
  const cipher = createCipheriv("aes-256-cbc", hashKey, HASH_IV);
  cipher.setAutoPadding(false);
  const TradeInfo = Buffer.concat([cipher.update(Buffer.concat([body, Buffer.alloc(pad, pad)])), cipher.final()]).toString("hex");
  return { Status: "SUCCESS", MerchantID: "TEST123", TradeInfo, TradeSha: computeTradeSha(TradeInfo, hashKey, HASH_IV), Version: "2.0" };
}

function result(order: string, over: { Status?: string; Result?: Record<string, unknown> } = {}) {
  return {
    Status: over.Status ?? "SUCCESS",
    Message: "授權成功",
    Result: {
      MerchantID: "TEST123", Amt: AMOUNT, TradeNo: "23092714215835071", MerchantOrderNo: order,
      RespondType: "JSON", PaymentType: "CREDIT", PayTime: "2023-09-27 14:21:59", ...over.Result,
    },
  };
}

const post = (path: string, body: BodyInit, headers: Fields = {}) =>
  new NextRequest(`http://localhost${path}`, { method: "POST", body, headers });
const callback = (fields: Fields) => notify(post("/api/payment/newebpay/notify", new URLSearchParams(fields)));

/** Create an order through the checkout route; returns what the buyer's browser receives. */
async function buy() {
  const res = await checkout(post("/api/payment/newebpay/checkout", JSON.stringify({ plan: "basic" }), {
    "content-type": "application/json",
  }));
  const { params, merchantOrderNo } = (await res.json()) as { params: Fields; merchantOrderNo: string };
  return { params, order: merchantOrderNo };
}
const order = (no: string) => findByMerchantTradeNo(no)!;

describe("newebpay callbacks", () => {
  before(() => {
    Object.assign(process.env, {
      NEWEBPAY_MERCHANT_ID: "TEST123", NEWEBPAY_HASH_KEY: HASH_KEY, NEWEBPAY_HASH_IV: HASH_IV,
      NEWEBPAY_API_BASE: "", NEXT_PUBLIC_SITE_URL: "http://localhost", NEWEBPAY_CHECKOUT_ENABLED: "1",
    });
    for (const m of ["error", "warn"] as const) mock.method(console, m, () => {});
  });

  it("marks the order paid on a signed payment result", async () => {
    const { order: no } = await buy();
    const res = await callback(seal(result(no)));
    assert.equal(res.status, 200);
    assert.equal(order(no).status, "PAID");
    assert.equal(order(no).providerRef, "23092714215835071");
  });

  it("does not accept the checkout form as a payment result", async () => {
    const { order: no, params } = await buy();
    const attempts: Fields[] = [{ ...params, Status: "SUCCESS" }, { Status: "SUCCESS", TradeInfo: params.TradeInfo }];
    for (const fields of attempts) {
      const res = await callback(fields);
      assert.equal(order(no).status, "PENDING");
      assert.equal(res.status, 400);
    }
  });

  it("rejects a result whose TradeSha is missing, wrong or made with another key", async () => {
    const { order: no } = await buy();
    const good = seal(result(no));
    const otherKey = seal(result(no), "x".repeat(32));
    for (const fields of [
      { ...good, TradeSha: "" },
      { ...good, TradeSha: "0".repeat(64) },
      { ...good, TradeInfo: otherKey.TradeInfo },
      otherKey,
    ]) {
      assert.equal((await callback(fields)).status, 400);
    }
    assert.equal((await notify(post("/api/payment/newebpay/notify", "{}", { "content-type": "application/json" }))).status, 400);
    assert.equal(order(no).status, "PENDING");
  });

  it("takes the status from the signed payload, not from the form field", async () => {
    const { order: no } = await buy();
    await callback({ ...seal(result(no, { Status: "MPG03009" })), Status: "SUCCESS" });
    assert.equal(order(no).status, "FAILED");
  });

  it("credits a payment that succeeds after an earlier failed attempt, and never undoes a paid order", async () => {
    const { order: no } = await buy();
    const failed = seal(result(no, { Status: "MPG03009" }));
    await callback(failed);
    assert.equal(order(no).status, "FAILED");
    await callback(seal(result(no)));
    assert.equal(order(no).status, "PAID");
    await callback(failed);
    assert.equal(order(no).status, "PAID");
  });

  it("does not credit an order that was closed by hand", async () => {
    const { order: no } = await buy();
    order(no).status = "REFUNDED";
    await callback(seal(result(no)));
    assert.equal(order(no).status, "REFUNDED");
  });

  it("leaves the order pending when the paid amount differs", async () => {
    const { order: no } = await buy();
    for (const Amt of [1, AMOUNT - 1, `${AMOUNT}abc`, null, undefined]) await callback(seal(result(no, { Result: { Amt } })));
    assert.equal(order(no).status, "PENDING");
  });

  it("leaves the order pending when a payment code was issued but nothing is paid yet", async () => {
    const { order: no } = await buy();
    for (const PayTime of [undefined, ""]) {
      const res = await callback(seal(result(no, { Result: { PaymentType: "VACC", PayTime, ExpireDate: "2026-12-01", CodeNo: "1" } })));
      assert.equal(res.status, 200);
    }
    assert.equal(order(no).status, "PENDING");
    assert.equal(order(no).paidAt, null);

    await callback(seal(result(no, { Result: { PaymentType: "VACC" } })));
    assert.equal(order(no).status, "PAID");
  });

  it("credits once when the same result arrives many times", async () => {
    const { order: no } = await buy();
    const fields = seal(result(no));
    const codes = await Promise.all(Array.from({ length: 10 }, () => callback(fields).then((r) => r.status)));
    assert.deepEqual(new Set(codes), new Set([200]));
    const paidAt = order(no).paidAt;
    await callback(fields);
    assert.equal(order(no).paidAt, paidAt);
  });

  it("ignores results for unknown orders", async () => {
    assert.equal((await callback(seal(result("TCRM000000000000000")))).status, 200);
  });

  it("sends the buyer back to their order only for a signed result", async () => {
    const { order: no, params } = await buy();
    const go = async (f: Fields) =>
      (await back(post("/api/payment/newebpay/return", new URLSearchParams(f)))).headers.get("location");
    // The success page shows the gateway status; it must come from the signed result too.
    assert.equal(await go(seal(result(no))), `http://localhost/payment/success?order=${no}&status=SUCCESS`);
    assert.equal(
      await go({ ...seal(result(no, { Status: "MPG03009" })), Status: "SUCCESS" }),
      `http://localhost/payment/success?order=${no}&status=MPG03009`,
    );
    assert.equal(await go({ ...params, Status: "SUCCESS" }), "http://localhost/payment/success");
    assert.equal(await go({ ...seal(result(no)), TradeSha: "0".repeat(64) }), "http://localhost/payment/success");
    assert.equal(order(no).status, "PENDING");
  });
});
