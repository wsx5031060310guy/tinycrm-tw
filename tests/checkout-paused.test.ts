// Checkout stays closed unless NEWEBPAY_CHECKOUT_ENABLED=1 (orders are still kept in memory).
//   npm test
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { NextRequest } from "next/server";
import { listOrders } from "@/lib/payment/order-store";
import { POST as checkout } from "@/app/api/payment/newebpay/checkout/route";

const call = () =>
  checkout(new NextRequest("http://localhost/api/payment/newebpay/checkout", {
    method: "POST", body: JSON.stringify({}), headers: { "content-type": "application/json" },
  }));

describe("checkout while paused", () => {
  it("answers 503 and creates no order unless explicitly enabled", async () => {
    Object.assign(process.env, {
      NEWEBPAY_MERCHANT_ID: "TEST123", NEWEBPAY_HASH_KEY: "12345678901234567890123456789012",
      NEWEBPAY_HASH_IV: "1234567890123456", NEWEBPAY_API_BASE: "",
    });
    for (const value of [undefined, "", "0", "true"]) {
      if (value === undefined) delete process.env.NEWEBPAY_CHECKOUT_ENABLED;
      else process.env.NEWEBPAY_CHECKOUT_ENABLED = value;
      const before = listOrders().length;
      const res = await call();
      assert.equal(res.status, 503, `NEWEBPAY_CHECKOUT_ENABLED=${value}`);
      assert.equal(((await res.json()) as { params?: unknown }).params, undefined);
      assert.equal(listOrders().length, before);
    }
  });
});
