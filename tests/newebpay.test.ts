// NewebPay crypto helpers.
//   npm test
import assert from "node:assert/strict";
import { createCipheriv } from "node:crypto";
import { describe, it } from "node:test";
import {
  buildCheckoutPayload, computeTradeSha, decodeTradeInfo, encodeTradeInfo, readPaymentCallback,
} from "@/lib/payment/newebpay";

const HASH_KEY = "12345678901234567890123456789012";
const HASH_IV = "1234567890123456";

function encryptRaw(buf: Buffer, hashKey = HASH_KEY, hashIv = HASH_IV) {
  const cipher = createCipheriv("aes-256-cbc", hashKey, hashIv);
  cipher.setAutoPadding(false);
  return Buffer.concat([cipher.update(buf), cipher.final()]).toString("hex");
}
function encrypt(text: string) {
  const body = Buffer.from(text);
  const pad = 32 - (body.length % 32);
  return encryptRaw(Buffer.concat([body, Buffer.alloc(pad, pad)]));
}
const read = (hex: string, sha = computeTradeSha(hex, HASH_KEY, HASH_IV)) =>
  readPaymentCallback(hex, sha, HASH_KEY, HASH_IV);
const paid = (Message = "授權成功") =>
  JSON.stringify({
    Status: "SUCCESS", Message,
    Result: { Amt: 499, MerchantOrderNo: "TCRM1", TradeNo: "T1", PaymentType: "CREDIT", PayTime: "2023-09-27 14:21:59" },
  });

describe("NewebPay padding", () => {
  // Ciphertext produced by the gateway (manual NDNP-1.0.8 §4.4.2, public sample keys), padded with 20 bytes.
  it("decrypts gateway ciphertext padded past 16 bytes", () => {
    const hex = "e88f62186b6d5dd96a9f6dbc57a84547957e8cb8534d81cbed42dcffa93783a32940ba6716e1ebb85f3d92fbcf0497897d312c0181e878b2d1be5cafe7d7c2f81ab3327ed1b4529ced6c5c4c6d07c52e9943e9ec8f0735e8c9329c23789e3927e540f8f2a56517ddf37d6ee7196d41e0139d173616ccf964b40764109f8647851cf17a5eb3d75eb0fe017d45790e528528c59adfe84cf2518dbf7cf71776bed9768ca6a74103332dbfb7d0356fbeb230d9bcda35763ca6eaaad51033ab6f35195780ea6ac3f584adc78940e9a053858b657461a94a20942fd559f54f9843433a";
    const out = JSON.parse(decodeTradeInfo(hex, "IaWudQJsuOT994cpHRWzv7Ge67yC1cE3", "C1dLm3nxZRVlmBSP"));
    assert.equal(out.Status, "SUCCESS");
    assert.equal(out.Result.PeriodNo, "P231115153213aMDNWZ");
  });

  it("rejects padding that is not 1–32 identical bytes", () => {
    const body = Buffer.from("x".repeat(30));
    for (const tail of [[0, 0], [33, 33], [1, 2]]) {
      assert.throws(() => decodeTradeInfo(encryptRaw(Buffer.concat([body, Buffer.from(tail)])), HASH_KEY, HASH_IV), /bad padding/);
    }
    // Claims 32 bytes of padding in a 16-byte message.
    assert.throws(() => decodeTradeInfo(encryptRaw(Buffer.alloc(16, 32)), HASH_KEY, HASH_IV), /bad padding/);
  });

  it("encode → decode round-trips", () => {
    const hex = encodeTradeInfo({ MerchantOrderNo: "TCRM1", Amt: 499 }, HASH_KEY, HASH_IV);
    const decoded = new URLSearchParams(decodeTradeInfo(hex, HASH_KEY, HASH_IV));
    assert.equal(decoded.get("MerchantOrderNo"), "TCRM1");
    assert.equal(decoded.get("Amt"), "499");
  });
});

describe("NewebPay payment callback", () => {
  it("reads a signed JSON result at every padding length the gateway uses (1–32)", () => {
    const pads = new Set<number>();
    for (let i = 0; i < 32; i += 1) {
      const text = paid("x".repeat(i));
      pads.add(32 - (Buffer.byteLength(text) % 32));
      const cb = read(encrypt(text));
      assert.deepEqual(
        { outcome: cb.outcome, merchantOrderNo: cb.merchantOrderNo, amount: cb.amount, tradeNo: cb.tradeNo },
        { outcome: "PAID", merchantOrderNo: "TCRM1", amount: 499, tradeNo: "T1" },
      );
    }
    assert.equal(pads.size, 32);
  });

  it("tells paid, not yet paid and failed apart", () => {
    const outcome = (Status: string, PayTime?: string) =>
      read(encrypt(JSON.stringify({ Status, Result: { MerchantOrderNo: "TCRM1", PayTime } }))).outcome;
    assert.equal(outcome("SUCCESS", "2023-09-27 14:21:59"), "PAID");
    assert.equal(outcome("SUCCESS"), "PENDING");
    assert.equal(outcome("MPG03009", "2023-09-27 14:21:59"), "FAILED");
  });

  it("checks TradeSha before decrypting", () => {
    const hex = encrypt(paid());
    const sha = computeTradeSha(hex, HASH_KEY, HASH_IV);
    assert.throws(() => read(hex, ""), /TradeSha/);
    assert.throws(() => read(hex, sha.slice(0, -1)), /TradeSha/);
    assert.throws(() => read("zz", sha), /TradeSha/);
    assert.throws(() => read(encrypt(paid("other")), sha), /TradeSha/);
  });

  // Manual NDNF-1.1.9 §4.1.4 sample: a real signed result, but in the String format we do not ask for.
  it("matches the gateway's TradeSha and still accepts only JSON results", () => {
    const key = "Fs5cX1TGqYM2PpdbE14a9H83YQSQF5jn";
    const iv = "C6AcmfqJILwgnhIP";
    const sha = "C80876AEBAC0036268C0E240E5BFF69C0470DE9606EEE083C5C8DD64FDB3347A";
    const hex = "ee11d1501e6dc8433c75988258f2343d11f4d0a423be672e8e02aaf373c53c2363aeffdb4992579693277359b3e449ebe644d2075fdfbc10150b1c40e7d24cb215febefdb85b16a5cde449f6b06c58a5510d31e8d34c95284d459ae4b52afc1509c2800976a5c0b99ef24cfd28a2dfc8004215a0c98a1d3c77707773c2f2132f9a9a4ce3475cb888c2ad372485971876f8e2fec0589927544c3463d30c785c2d3bd947c06c8c33cf43e131f57939e1f7e3b3d8c3f08a84f34ef1a67a08efe177f1e663ecc6bedc7f82640a1ced807b548633cfa72d060864271ec79854ee2f5a170aa902000e7c61d1269165de330fce7d10663d1668c711571776365bfdcd7ddc915dcb90d31a9f27af9b79a443ca8302e508b0dbaac817d44cfc44247ae613075dde4ac960f1bdff4173b915e4344bc4567bd32e86be7d796e6d9b9cf20476e4996e98ccc315f1ed03a34139f936797d971f2a3f90bc18f8a155a290bcbcf04f4277171c305bf554f5cba243154b30082748a81f2e5aa432ef9950cc9668cd4330ef7c37537a6dcb5e6ef01b4eca9705e4b097cf6913ee96e81d0389e5f775";
    assert.equal(computeTradeSha(hex, key, iv), sha);
    assert.throws(() => readPaymentCallback(hex, sha, key, iv), (e: Error) => !/TradeSha/.test(e.message));
  });

  it("rejects signed content that is not a payment result", () => {
    const request = encodeTradeInfo({ MerchantID: "TEST123", MerchantOrderNo: "TCRM1", Amt: 499 }, HASH_KEY, HASH_IV);
    assert.throws(() => read(request));
    const flat = { Status: "SUCCESS", MerchantOrderNo: "TCRM1", Amt: 499, PayTime: "2023-09-27 14:21:59" };
    assert.throws(() => read(encodeTradeInfo(flat, HASH_KEY, HASH_IV)));
    for (const body of [flat, { Status: "SUCCESS" }, { Status: "SUCCESS", Result: [] }, { Status: "SUCCESS", Result: { MerchantOrderNo: "" } }, null, "x"]) {
      assert.throws(() => read(encrypt(JSON.stringify(body))), /not a payment result/, JSON.stringify(body));
    }
  });

  it("asks the gateway for the JSON results that readPaymentCallback understands", () => {
    Object.assign(process.env, { NEWEBPAY_MERCHANT_ID: "TEST123", NEWEBPAY_HASH_KEY: HASH_KEY, NEWEBPAY_HASH_IV: HASH_IV });
    const { params } = buildCheckoutPayload({
      merchantOrderNo: "TCRM1", amount: 499, itemDesc: "Pro", email: "a@example.com",
      returnUrl: "http://localhost/r", notifyUrl: "http://localhost/n", clientBackUrl: "http://localhost/c",
    });
    const sent = new URLSearchParams(decodeTradeInfo(params.TradeInfo, HASH_KEY, HASH_IV));
    assert.equal(sent.get("RespondType"), "JSON");
    assert.equal(sent.get("NotifyURL"), "http://localhost/n");
  });

  it("fails closed when the keys are not configured", () => {
    const hex = encrypt(paid());
    assert.throws(() => readPaymentCallback(hex, computeTradeSha(hex, "", ""), "", ""));
  });
});
