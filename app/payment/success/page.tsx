import type { Metadata } from "next";
import Link from "next/link";
import { COMPANY } from "@/lib/company";

export const metadata: Metadata = {
  title: "付款結果 — TinyCRM TW",
  description: "TinyCRM TW 藍新金流付款結果頁：顯示訂單付款結果、方案開通說明與客服聯絡方式。",
};

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const order = typeof sp.order === "string" ? sp.order : null;
  const status = typeof sp.status === "string" ? sp.status : null;
  const failed = status !== null && status !== "SUCCESS";

  return (
    <main className="mx-auto w-full max-w-3xl p-4 sm:p-8">
      <h1 className="text-3xl font-bold tracking-tight">
        {failed ? "付款未完成" : "付款完成"}
      </h1>
      <p className="mt-2 text-sm text-zinc-500">
        {failed
          ? "您的付款未成功或已取消，尚未完成訂閱。"
          : "感謝您的訂購！我們已收到您透過藍新金流回傳的付款資訊。"}
      </p>

      <div className="mt-8 space-y-8 text-sm leading-7 text-zinc-700 dark:text-zinc-300">
        {(order || status) && (
          <section className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">交易資訊</h2>
            <dl className="mt-2 space-y-1">
              {order && (
                <div className="flex flex-wrap gap-x-2">
                  <dt className="text-zinc-500">訂單編號：</dt>
                  <dd className="font-mono">{order}</dd>
                </div>
              )}
              {failed && status && (
                <div className="flex flex-wrap gap-x-2">
                  <dt className="text-zinc-500">狀態代碼：</dt>
                  <dd className="font-mono">{status}</dd>
                </div>
              )}
            </dl>
            {order && (
              <p className="mt-2 text-xs text-zinc-500">
                如需查詢交易或申請退款，請保留此訂單編號以利核對。
              </p>
            )}
          </section>
        )}

        {failed ? (
          <section>
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">下一步</h2>
            <p className="mt-2">
              本次交易未完成，您可以重新選擇方案再次付款；若您確認已遭扣款，請聯絡客服協助查證。
            </p>
            <Link
              href="/pricing"
              className="mt-4 inline-block rounded bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800"
            >
              重新選擇方案
            </Link>
          </section>
        ) : (
          <section>
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">方案開通說明</h2>
            <p className="mt-2">
              系統將於收到藍新金流付款確認通知後，自動為您開通當期方案（一般於付款完成後數分鐘內生效）。
              開通後即可開始建立聯絡人、記錄互動並匯出 Excel。
            </p>
            <Link
              href="/contacts"
              className="mt-4 inline-block rounded bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800"
            >
              開始使用 TinyCRM
            </Link>
          </section>
        )}

        <section>
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">聯絡客服</h2>
          <p className="mt-2">
            如對本次交易有任何疑問，歡迎透過下列方式聯絡 {COMPANY.name} 客服：
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>
              Email：
              {COMPANY.email.includes("待補") ? (
                COMPANY.email
              ) : (
                <a href={`mailto:${COMPANY.email}`} className="text-blue-600 underline">
                  {COMPANY.email}
                </a>
              )}
            </li>
            <li>LINE 官方帳號：{COMPANY.lineId}</li>
          </ul>
          <p className="mt-2 text-xs text-zinc-500">
            退款相關權益請參閱
            <Link href="/refund" className="text-blue-600 underline">退款政策</Link>。
          </p>
        </section>
      </div>
    </main>
  );
}
