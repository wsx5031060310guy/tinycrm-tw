# 頁面與 API（PAGES）

> 路由依 `app/` 實際目錄結構整理。本專案無登入 / 驗證機制，所有頁面與 API 皆公開（無需登入；「需登入」欄一律為「否」）。

## 頁面 / 路由表（Web）

| 路徑 | 檔案 | 用途 | 需登入 |
| --- | --- | --- | --- |
| `/` | `app/page.tsx` | 首頁：聯絡人列表 + 4 張統計卡（全部 / 潛在客戶 / 已洽談 / 現有客戶），RWD 表格 | 否 |
| `/contacts/new` | `app/contacts/new/page.tsx` | 新增聯絡人表單（姓名 / 電話 / Email / LINE ID / 公司 / 標籤 / 狀態 / 備註），送出至 `POST /api/contacts` | 否 |
| `/contacts/[id]` | `app/contacts/[id]/page.tsx` | 聯絡人詳細頁 + 互動時間軸；可透過 Server Action 新增互動。查無資料時 `notFound()` | 否 |
| `/pricing` | `app/pricing/page.tsx` | 方案與定價（讀 `TINYCRM_PLANS`）：基礎版 NT$499/月、進階版 NT$899/月 + 服務 / 付款說明 | 否 |
| `/payment/success` | `app/payment/success/page.tsx` | 付款結果頁，依 query `order` / `status` 顯示「付款完成 / 未完成」與客服資訊 | 否 |
| `/terms` | `app/terms/page.tsx` | 服務條款 | 否 |
| `/privacy` | `app/privacy/page.tsx` | 隱私權政策（依個資法第 8 條告知） | 否 |
| `/refund` | `app/refund/page.tsx` | 退款政策（七日猶豫期之適用與例外） | 否 |

> 全站 footer（`app/layout.tsx`）固定提供 `/pricing`、`/terms`、`/privacy`、`/refund` 四個法務連結與公司資訊（來源 `lib/company.ts`）。
>
> 注意：`/payment/success` 內有「開始使用 TinyCRM」按鈕連到 `/contacts`，但 repo 內**並無 `/contacts` 路由**（聯絡人列表為首頁 `/`）；此連結目前會導向不存在的頁面。

## API Endpoint 表

| 方法 | 路徑 | 檔案 | 用途 |
| --- | --- | --- | --- |
| `POST` | `/api/contacts` | `app/api/contacts/route.ts` | 新增聯絡人（demo）。驗證 JSON 與 `name`；目前**不寫 DB**，回 `201 { ok, demo, contact }` | 
| `GET` | `/api/contacts/export` | `app/api/contacts/export/route.ts` | 將聯絡人匯出為 `.xlsx`（SheetJS），檔名 `tinycrm-contacts-YYYY-MM-DD.xlsx` |
| `POST` | `/api/lead-summary` | `app/api/lead-summary/route.ts` | AI 業務筆記摘要：body `{ notes }` → 回 `{ summary, nextStep }`；經 Smart Router 免費層；失敗回 `502` |
| `POST` | `/api/payment/newebpay/checkout` | `app/api/payment/newebpay/checkout/route.ts` | 依方案（`basic` / `pro`）建立訂單並產生 MPG 加密參數，回 `{ endpoint, params, merchantOrderNo }` |
| `POST` | `/api/payment/newebpay/notify` | `app/api/payment/newebpay/notify/route.ts` | 藍新 Server-to-server 付款通知；解密驗證後更新訂單狀態；**固定回應字串 `"0"`** |
| `POST` | `/api/payment/newebpay/return` | `app/api/payment/newebpay/return/route.ts` | 使用者端導回；best-effort 解出訂單編號後 **303 轉址**至 `/payment/success` |

### API 請求 / 回應細節

**`POST /api/contacts`**
- Request body（JSON）：`name`（必填）、`phone`、`email`、`lineId`、`company`、`tags`（string[]）、`status`、`notes`
- 回應：
  - `400 { error: "Invalid JSON" }`（JSON 解析失敗）
  - `400 { error: "缺少姓名" }`（缺 `name`）
  - `201 { ok: true, demo: true, contact }`（成功，尚未寫入 DB）

**`POST /api/lead-summary`**
- Request body（JSON）：`{ notes: string }`
- 回應：
  - `400 { error: "notes required" }`
  - `200 { summary, nextStep }`
  - `502 { error }`（Smart Router 端點異常）

**`POST /api/payment/newebpay/checkout`**
- Request body（JSON）：`{ plan?: "basic" | "pro", email?: string }`（`plan` 預設 `basic`）
- 回應：
  - `400 { error: "invalid plan" }`
  - `200 { endpoint, params: { MerchantID, TradeInfo, TradeSha, Version }, merchantOrderNo }`
- 前置：需設定 `NEWEBPAY_MERCHANT_ID` / `NEWEBPAY_HASH_KEY` / `NEWEBPAY_HASH_IV`，否則 `buildCheckoutPayload` 拋 `newebpay env not configured`

**`POST /api/payment/newebpay/notify`**
- Request：藍新以 `multipart/form-data` 傳 `TradeInfo`（加密 hex）、`Status`
- 行為：解密取 `MerchantOrderNo` / `TradeNo`，依 `Status` 標記 `markPaid` / `markFailed`（具冪等保護）
- 回應：一律回 `"0"`（即使例外，避免重送風暴）

**`POST /api/payment/newebpay/return`**
- Request：藍新以 `form-data` 傳 `TradeInfo` / `Status`
- 回應：`303` redirect → `/payment/success?order=...&status=...`

## Server Action

| 名稱 | 檔案 | 用途 |
| --- | --- | --- |
| `addInteractionAction(contactId, prev, formData)` | `app/contacts/[id]/actions.ts` | 在聯絡人詳細頁新增互動：驗證 `summary` 非空、`type` 屬於 `CALL/MESSAGE/MEETING/NOTE/EMAIL/LINE`；以 `appendInteraction` 寫入記憶體並 `revalidatePath` |

## 主要共用模組（`lib/`）

| 模組 | 重要匯出 | 說明 |
| --- | --- | --- |
| `lib/company.ts` | `COMPANY` | 公司資訊單一來源（name / legalName / taxId / address / email / lineId） |
| `lib/seed-data.ts` | `seedContacts`、`seedInteractions`、`getInteractionsForContact`、`appendInteraction`、`INTERACTION_LABELS` | demo 資料與互動 helper |
| `lib/utils.ts` | `cn`、`STATUS_LABELS`、`STATUS_BADGE` | className 合併工具 + 狀態中文標籤 / 徽章樣式 |
| `lib/router-client.ts` | `chat`、`Tier` | Smart Router LLM client（OpenAI 相容） |
| `lib/payment/pricing.ts` | `TINYCRM_PLANS`、`getPlan`、`Plan` | 方案定價（basic / pro） |
| `lib/payment/order-store.ts` | `createOrder`、`findByMerchantTradeNo`、`markPaid`、`markFailed`、`listOrders`、`makeMerchantTradeNo` | in-memory 訂單儲存（鏡像 Prisma `Order`） |
| `lib/payment/newebpay.ts` | `getNewebpayConfig`、`encodeTradeInfo`、`decodeTradeInfo`、`computeTradeSha`、`buildCheckoutPayload` | 藍新 MPG 加解密 / TradeSha |

## 方案定價（`lib/payment/pricing.ts`）

| code | 名稱 | 價格 | 內容 |
| --- | --- | --- | --- |
| `basic` | TinyCRM 基礎版 | NT$499 / 月 | 50 位客戶上限 + 預約紀錄 + 客戶分群 |
| `pro` | TinyCRM 進階版 | NT$899 / 月 | 無限客戶 + 自動 SMS 提醒 + 消費分析 |
