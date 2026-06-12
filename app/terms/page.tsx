import type { Metadata } from "next";
import Link from "next/link";
import { COMPANY } from "@/lib/company";

export const metadata: Metadata = {
  title: "服務條款 — TinyCRM TW",
  description: "TinyCRM TW 服務條款：服務內容、付款與金流、退款、智慧財產權、責任限制與準據法。",
};

export default function TermsPage() {
  return (
    <main className="mx-auto w-full max-w-3xl p-4 sm:p-8">
      <h1 className="text-3xl font-bold tracking-tight">服務條款</h1>
      <p className="mt-2 text-sm text-zinc-500">最後更新日期：2026 年 6 月 12 日</p>

      <div className="mt-8 space-y-8 text-sm leading-7 text-zinc-700 dark:text-zinc-300">
        <Section title="一、營運者資訊">
          <p>
            「TinyCRM TW」（下稱「本服務」）由 {COMPANY.legalName}（下稱「本公司」）營運。
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>統一編號：{COMPANY.taxId}</li>
            <li>地址：{COMPANY.address}</li>
            <li>電話：{COMPANY.phone}</li>
            <li>Email：{COMPANY.email}</li>
          </ul>
          <p className="mt-2">
            您註冊、付款或使用本服務，即表示您已閱讀、瞭解並同意本服務條款之全部內容。
          </p>
        </Section>

        <Section title="二、帳號註冊與管理">
          <p>
            您應提供正確、最新之資料註冊帳號，並妥善保管帳號及密碼，不得轉讓或出借予第三人使用。
            因帳號保管不當所生之損害，由您自行負責；如發現帳號遭未經授權使用，請立即通知本公司。
          </p>
        </Section>

        <Section title="三、服務內容與變更">
          <p>
            本服務為雲端客戶關係管理（CRM）軟體服務，功能包含聯絡人管理、互動紀錄、Excel 匯出與 AI
            筆記摘要等，實際功能以各方案說明為準（詳見
            <Link href="/pricing" className="text-blue-600 hover:underline">方案與定價</Link>）。
            本公司得視營運需要新增、調整或停止部分功能；如有重大變更或服務終止，將於合理期間前公告或通知。
          </p>
        </Section>

        <Section title="四、付款與金流">
          <p>
            本服務採訂閱制，售價依
            <Link href="/pricing" className="text-blue-600 hover:underline">方案與定價</Link>
            頁面之公告為準，以新臺幣計價。線上付款透過第三方金流服務「藍新金流 NewebPay」處理（信用卡），
            本公司不會儲存您的完整卡號。價格如有調整，將於生效前公告，調整後之價格自次一計費週期起適用。
          </p>
        </Section>

        <Section title="五、退款政策">
          <p>
            退款相關規定（含七日猶豫期之適用與例外）詳見
            <Link href="/refund" className="text-blue-600 hover:underline">退款政策</Link>，
            該政策為本條款之一部分。
          </p>
        </Section>

        <Section title="六、智慧財產權與您的資料">
          <p>
            本服務之軟體、介面、商標與文件之智慧財產權均屬本公司或其授權人所有。
            您於本服務中建立或匯入之客戶資料、互動紀錄與筆記（下稱「使用者資料」）之權利歸您所有；
            本公司僅於提供服務之必要範圍內處理使用者資料，不會將其用於服務目的以外之用途。
            您得隨時透過匯出功能取回使用者資料。
          </p>
        </Section>

        <Section title="七、禁止行為">
          <p>您使用本服務時，不得有下列行為：</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>違反法令蒐集、處理或利用個人資料，或未經當事人同意匯入他人個資。</li>
            <li>以本服務發送垃圾訊息、進行詐欺或其他不法行為。</li>
            <li>干擾、破壞服務運作，或未經授權存取系統、他人帳號或資料。</li>
            <li>對本服務進行還原工程、轉售或以自動化方式大量存取。</li>
          </ul>
          <p className="mt-2">違反者，本公司得暫停或終止您的帳號，且不退還已支付之費用。</p>
        </Section>

        <Section title="八、個人資料保護">
          <p>
            本公司如何蒐集、處理及利用您的個人資料，詳見
            <Link href="/privacy" className="text-blue-600 hover:underline">隱私權政策</Link>。
          </p>
        </Section>

        <Section title="九、免責聲明與責任限制">
          <p>
            本服務依「現況」提供。因系統維護、第三方服務（含金流、雲端主機、AI 模型服務）異常或不可抗力
            導致服務中斷或資料延遲，本公司將盡速修復，但不負擔由此所生之間接損害。
            於法律允許之最大範圍內，本公司就本服務所負之全部賠償責任，以您最近三個月已支付之服務費用總額為上限。
            本條不適用於依法不得預先排除或限制之責任。
          </p>
        </Section>

        <Section title="十、契約終止">
          <p>
            您得隨時停止使用並取消訂閱。您嚴重違反本條款時，本公司得終止契約並停止服務。
            契約終止後，本公司將依隱私權政策所定期間保留或刪除您的資料；建議您於終止前先行匯出。
          </p>
        </Section>

        <Section title="十一、準據法與管轄法院">
          <p>
            本條款之解釋與適用，以中華民國法律為準據法。因本條款所生之爭議，雙方同意以臺灣臺北地方法院為
            第一審管轄法院；但消費者保護法等法令另有規定者，從其規定。
          </p>
        </Section>

        <Section title="十二、聯絡方式">
          <ul className="list-disc space-y-1 pl-5">
            <li>Email：{COMPANY.email}</li>
            <li>電話：{COMPANY.phone}</li>
            <li>LINE 官方帳號：{COMPANY.lineId}</li>
          </ul>
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
