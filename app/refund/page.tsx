import type { Metadata } from "next";
import Link from "next/link";
import { COMPANY } from "@/lib/company";

export const metadata: Metadata = {
  title: "退款政策 — TinyCRM TW",
  description: "TinyCRM TW 退款政策：七日猶豫期之適用與例外、訂閱取消、退款申請管道與處理時程。",
};

export default function RefundPage() {
  return (
    <main className="mx-auto w-full max-w-3xl p-4 sm:p-8">
      <h1 className="text-3xl font-bold tracking-tight">退款政策</h1>
      <p className="mt-2 text-sm text-zinc-500">最後更新日期：2026 年 6 月 12 日</p>

      <div className="mt-8 space-y-8 text-sm leading-7 text-zinc-700 dark:text-zinc-300">
        <Section title="一、適用範圍">
          <p>
            本政策適用於您透過本網站訂閱「TinyCRM TW」付費方案（售價詳見
            <Link href="/pricing" className="text-blue-600 underline">方案與定價</Link>）之退款事宜，
            由 {COMPANY.legalName} 提供服務。
          </p>
        </Section>

        <Section title="二、七日猶豫期與線上服務之例外">
          <p>
            依消費者保護法第 19 條，通訊交易之消費者享有收受商品或接受服務後七日內解除契約之權利。
            惟本服務屬「非以有形媒介提供之數位內容或一經提供即為完成之線上服務」，依
            「通訊交易解除權合理例外情事適用準則」第 2 條第 5 款，經消費者事先同意始提供者，
            得排除七日解除權之適用。您於付款前勾選同意並開通服務，即屬前述事先同意。
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>
              付款後 7 日內且尚未實際開始使用服務（未登入使用、未匯入資料）者，得申請全額退款。
            </li>
            <li>已開始使用服務者，該計費週期之費用恕不退還。</li>
          </ul>
        </Section>

        <Section title="三、訂閱取消">
          <p>
            您得隨時取消訂閱；取消後本服務將持續提供至當期計費週期結束，次期起不再計費。
            當期已支付之費用，除前條情形外不予退還、亦不按比例退費。
          </p>
        </Section>

        <Section title="四、可歸責於本公司之退款">
          <p>
            因本公司因素導致服務無法提供（如重大系統故障且未能於合理期間修復）、重複扣款或溢收費用者，
            本公司將主動或依您的申請辦理退款，不受第二條例外規定之限制。
          </p>
        </Section>

        <Section title="五、退款申請方式與處理時程">
          <ul className="list-disc space-y-1 pl-5">
            <li>申請管道：來信 {COMPANY.email}，或致電 {COMPANY.phone}（亦可透過 LINE 官方帳號：{COMPANY.lineId}）。</li>
            <li>請提供訂單編號、付款日期與申請事由，以利核對。</li>
            <li>本公司將於收到申請後 7 個工作天內回覆審核結果。</li>
            <li>
              退款一律以原付款方式退回：信用卡付款將透過藍新金流辦理退刷，實際入帳時間依各發卡銀行作業為準
              （一般約 7–14 個工作天）。
            </li>
          </ul>
        </Section>

        <Section title="六、爭議處理">
          <p>
            如對退款結果有疑義，請先與本公司客服聯繫（{COMPANY.email}），我們將盡力協助處理。
            您亦得依消費者保護法向所在地直轄市、縣（市）政府消費者服務中心或消費者保護官申訴，
            或撥打 1950 消費者服務專線。
          </p>
        </Section>
      </div>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">{title}</h2>
      <div className="mt-2">{children}</div>
    </section>
  );
}
