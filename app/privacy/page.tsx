import type { Metadata } from "next";
import { COMPANY } from "@/lib/company";

export const metadata: Metadata = {
  title: "隱私權政策 — TinyCRM TW",
  description: "TinyCRM TW 隱私權政策：依個人資料保護法第 8 條告知蒐集目的、類別、利用方式與當事人權利。",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto w-full max-w-3xl p-4 sm:p-8">
      <h1 className="text-3xl font-bold tracking-tight">隱私權政策</h1>
      <p className="mt-2 text-sm text-zinc-500">最後更新日期：2026 年 6 月 12 日</p>

      <div className="mt-8 space-y-8 text-sm leading-7 text-zinc-700 dark:text-zinc-300">
        <Section title="一、蒐集機關（蒐集者）">
          <p>
            「TinyCRM TW」（下稱「本服務」）由 {COMPANY.legalName}（下稱「本公司」）營運。
            本公司依個人資料保護法（下稱「個資法」）第 8 條，向您告知下列事項。
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>統一編號：{COMPANY.taxId}</li>
            <li>地址：{COMPANY.address}</li>
            <li>Email：{COMPANY.email}</li>
          </ul>
        </Section>

        <Section title="二、蒐集之目的">
          <ul className="list-disc space-y-1 pl-5">
            <li>提供本服務之會員管理、身分確認與客戶服務（法定特定目的項目代號 090 消費者、客戶管理與服務）。</li>
            <li>處理訂閱付款、開立交易憑證與帳務管理（069 契約、類似契約或其他法律關係事務、181 其他經營合於營業登記項目或組織章程所定之業務）。</li>
            <li>服務品質改善、系統安全維護與法令義務之履行。</li>
          </ul>
        </Section>

        <Section title="三、蒐集之個人資料類別">
          <p>1. 帳號與交易資料：您註冊或付款時提供之姓名、Email、電話、付款紀錄（不含完整卡號）。</p>
          <p className="mt-2">2. 系統紀錄：IP 位址、瀏覽器資訊、使用紀錄與 Cookie。</p>
          <p className="mt-2">
            3. <strong>使用者匯入之聯絡人個人資料</strong>：您於本服務中建立或匯入之客戶聯絡人資料
            （如姓名、電話、Email、LINE ID、公司、互動紀錄等）。
            <strong>
              就該等資料，您為個資法上之蒐集者（資料控管者），應確保其蒐集、處理及利用符合個資法規定；
              本公司僅立於受您委託處理之地位
            </strong>
            （個資法第 4 條），僅依您的指示及提供服務之必要範圍處理該等資料，不會將其用於自身行銷或其他目的。
          </p>
        </Section>

        <Section title="四、利用之期間、地區、對象及方式">
          <ul className="list-disc space-y-1 pl-5">
            <li>期間：自蒐集時起至您終止使用本服務後 6 個月內，或法令要求之保存期間（如交易帳務資料）。</li>
            <li>地區：中華民國境內，及本服務所使用之雲端主機與下列協力廠商之服務所在地。</li>
            <li>
              對象與方式：除本公司外，於提供服務之必要範圍內提供予下列第三方處理：
              <ul className="mt-1 list-disc space-y-1 pl-5">
                <li>金流服務：藍新金流股份有限公司（NewebPay），處理線上付款。</li>
                <li>雲端基礎設施：本服務所使用之雲端主機與資料庫代管服務。</li>
                <li>
                  AI 摘要服務：您使用「AI 業務筆記摘要」功能時，所輸入之筆記內容會經由本公司之模型路由服務
                  傳送至第三方 AI 語言模型服務處理，以產生摘要結果；請避免於筆記中輸入非必要之敏感個人資料。
                </li>
              </ul>
            </li>
            <li>本公司不會將您的個人資料販售或提供予無關之第三人。</li>
          </ul>
        </Section>

        <Section title="五、當事人權利">
          <p>
            依個資法第 3 條，您就本公司保有之您的個人資料，得行使下列權利：查詢或請求閱覽、請求製給複製本、
            請求補充或更正、請求停止蒐集處理或利用、請求刪除。行使方式：來信 {COMPANY.email} 或致電{" "}
            {COMPANY.phone}，本公司將於法定期間內處理。
            若您選擇不提供必要之個人資料，可能無法完成註冊、付款或使用部分功能。
          </p>
          <p className="mt-2">
            就您匯入之聯絡人個人資料，其當事人如向本公司行使前述權利，本公司將轉知您處理，或依您的指示協助處理。
          </p>
        </Section>

        <Section title="六、Cookie 之使用">
          <p>
            本服務使用 Cookie 及類似技術維持登入狀態與改善使用體驗。您可於瀏覽器設定中拒絕或刪除
            Cookie，惟部分功能可能因此無法正常使用。
          </p>
        </Section>

        <Section title="七、安全維護措施">
          <p>
            本公司採取與個人資料保護相當之安全措施，包含傳輸加密（HTTPS）、存取權限控管與付款資料交由
            合格金流業者處理。如發生個人資料事故，本公司將依法令通知您並進行處置。
          </p>
        </Section>

        <Section title="八、政策修訂">
          <p>
            本政策如有修訂，將公告於本頁並更新「最後更新日期」；重大變更將以站內公告或 Email 通知。
            如有任何疑問，歡迎來信 {COMPANY.email}。
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
