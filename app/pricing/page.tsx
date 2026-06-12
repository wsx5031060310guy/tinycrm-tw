import type { Metadata } from "next";
import Link from "next/link";
import { TINYCRM_PLANS } from "@/lib/payment/pricing";

export const metadata: Metadata = {
  title: "方案與定價 — TinyCRM TW",
  description: "TinyCRM TW 訂閱方案與售價：基礎版 NT$499/月、進階版 NT$899/月，透過藍新金流安全付款。",
};

const INTERVAL_LABELS: Record<string, string> = {
  month: "月",
  year: "年",
  one_time: "次",
};

export default function PricingPage() {
  const plans = Object.values(TINYCRM_PLANS);

  return (
    <main className="mx-auto w-full max-w-5xl p-4 sm:p-8 space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">方案與定價</h1>
        <p className="mt-2 text-sm text-zinc-500">
          所有價格以新臺幣（NT$）計價，採訂閱制按期計費。
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2">
        {plans.map((plan) => (
          <div
            key={plan.code}
            className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <h2 className="text-lg font-semibold">{plan.name}</h2>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-3xl font-bold">NT${plan.amount.toLocaleString()}</span>
              <span className="text-sm text-zinc-500">
                /{INTERVAL_LABELS[plan.interval ?? "month"]}
              </span>
            </div>
            <ul className="mt-4 space-y-2 text-sm text-zinc-600 dark:text-zinc-300">
              {plan.description.split(" + ").map((feature) => (
                <li key={feature} className="flex gap-2">
                  <span aria-hidden className="text-zinc-400">✓</span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <section className="space-y-3 text-sm leading-7 text-zinc-600 dark:text-zinc-300">
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">服務說明</h2>
        <p>
          TinyCRM TW 為線上提供之雲端客戶關係管理（CRM）軟體服務，鎖定業務、房仲、保險、接案者與教育招生等
          需要隨手記錄客戶與跟進的使用情境。功能包含聯絡人管理、互動歷史時間軸、LINE 備註、Excel
          匯出與 AI 業務筆記摘要；以手機優先介面設計，付款開通後即可於瀏覽器使用，無需安裝軟體。
        </p>
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">付款方式</h2>
        <p>
          透過「藍新金流 NewebPay」付款（信用卡），交易過程由藍新金流以加密機制處理，本公司不會儲存您的完整卡號。
          付款完成後系統將為您開通當期服務。
        </p>
        <p className="text-xs text-zinc-500">
          訂閱前請詳閱
          <Link href="/terms" className="text-blue-600 hover:underline">服務條款</Link>、
          <Link href="/refund" className="text-blue-600 hover:underline">退款政策</Link>與
          <Link href="/privacy" className="text-blue-600 hover:underline">隱私權政策</Link>。
        </p>
      </section>
    </main>
  );
}
