# TinyCRM TW

> 為台灣中小型業務量身打造的迷你 CRM — 手機優先、LINE 備註、一鍵匯出 Excel，內建藍新金流訂閱與 AID 業務筆記摘要。

## 專案簡介

TinyCRM TW 是一套輕量級客戶關係管理工具，鎖定業務、房仲、保險、接案者與教育招生等需要隨手記錄客戶與跟進的場景。介面以手機優先設計，支援聯絡人管理、互動歷史時間軸、Excel 匯出，並整合藍新金流（NewebPay）訂閱付款與透過 Smart Router 的 AI 業務筆記摘要。

目前資料層以內建 demo 種子資料運作，方便在未連接資料庫前直接試用；Prisma schema 已備妥（`Contact` / `Interaction` / `Order` / `Subscription`），待設定 `DATABASE_URL` 後即可接上 PostgreSQL 持久化。

## 核心功能

依實際程式碼與路由實作：

- **聯絡人列表與統計**（`/`）：全部 / 潛在客戶 / 已洽談 / 現有客戶 計數卡片 + RWD 表格，顯示姓名、公司、狀態徽章、標籤。
- **新增聯絡人**（`/contacts/new`）：表單收集姓名、電話、Email、LINE ID、公司、標籤、狀態、備註，送出至 `POST /api/contacts`。
- **聯絡人詳細頁與互動時間軸**（`/contacts/[id]`）：顯示基本欄位、備註，與依時間排序的互動歷史；可透過 Server Action（`addInteractionAction`）新增互動（電話 / 訊息 / 會議 / 筆記 / Email / LINE）。
- **Excel 匯出**（`GET /api/contacts/export`）：以 `xlsx` 產生 `.xlsx`，欄位含姓名、電話、Email、LINE ID、公司、狀態、標籤、備註、來源、建立時間。
- **AI 業務筆記摘要**（`POST /api/lead-summary`）：將業務自由筆記壓縮成「一句話摘要 + 具體下一步」，經由本機 Smart Router 免費層呼叫 LLM，避免消耗付費額度。
- **藍新金流訂閱付款**（NewebPay MPG）：
  - `POST /api/payment/newebpay/checkout`：依方案（`basic` / `pro`）建立訂單並產生 MPG 加密參數（AES-256-CBC + SHA256 TradeSha）。
  - `POST /api/payment/newebpay/notify`：Server-to-server 付款通知，驗證並更新訂單狀態，固定回應 `0`。
  - `POST /api/payment/newebpay/return`：使用者端導回，解碼訂單編號後 303 轉址至付款結果頁。
- **方案定價**（`lib/payment/pricing.ts`）：基礎版 NT$499/月（50 位客戶上限）、進階版 NT$899/月（無限客戶 + SMS 提醒 + 消費分析）。

> 備註：目前 `/api/contacts` 與互動操作為 demo 模式（回傳成功但尚未寫入資料庫），聯絡人 / 互動畫面讀取的是 `lib/seed-data.ts` 的種子資料；訂單與訂閱亦以 in-memory store（`lib/payment/order-store.ts`）暫存。所有持久化待 `DATABASE_URL` 設定並執行 `prisma db push` 後切換為 Prisma Client。付款流程導回的 `/payment/success` 結果頁尚未建立。

## 技術棧

| 類別 | 技術 |
| --- | --- |
| 框架 | Next.js 16.2.4（App Router）、React 19.2.4 |
| 語言 | TypeScript 5 |
| 樣式 | Tailwind CSS v4（`@tailwindcss/postcss`） |
| UI 工具 | `lucide-react`、`class-variance-authority`、`clsx`、`tailwind-merge` |
| 資料庫 | Prisma 6 + PostgreSQL（Neon / Supabase 任選） |
| 匯出 | `xlsx`（SheetJS） |
| 金流 | 藍新金流 NewebPay MPG（Node `crypto`，無額外 SDK） |
| AI | 本機 Smart Router（OpenAI 相容 `/v1/chat/completions`） |
| Lint | ESLint 9 + `eslint-config-next` |

## 目錄結構

```
.
├── app/
│   ├── api/
│   │   ├── contacts/
│   │   │   ├── route.ts            # POST 新增聯絡人（demo）
│   │   │   └── export/route.ts     # GET 匯出 Excel
│   │   ├── lead-summary/route.ts   # POST AI 筆記摘要
│   │   └── payment/newebpay/
│   │       ├── checkout/route.ts   # 建立訂單 + MPG 參數
│   │       ├── notify/route.ts     # S2S 付款通知
│   │       └── return/route.ts     # 使用者端導回
│   ├── contacts/
│   │   ├── new/page.tsx            # 新增聯絡人表單
│   │   └── [id]/
│   │       ├── page.tsx            # 詳細頁 + 互動時間軸
│   │       ├── InteractionForm.tsx # 新增互動表單
│   │       └── actions.ts          # 互動 Server Action
│   ├── layout.tsx
│   ├── page.tsx                    # 聯絡人列表 + 統計
│   └── globals.css
├── lib/
│   ├── payment/
│   │   ├── newebpay.ts             # MPG 加解密 / TradeSha
│   │   ├── order-store.ts          # in-memory 訂單儲存
│   │   └── pricing.ts              # 方案定價
│   ├── router-client.ts            # Smart Router LLM client
│   ├── seed-data.ts                # demo 聯絡人 / 互動資料
│   └── utils.ts                    # cn() + 狀態標籤
├── prisma/
│   └── schema.prisma               # Contact / Interaction / Order / Subscription
├── public/
├── .env.example
├── next.config.ts
├── package.json
└── tsconfig.json
```

## 本機開發

需求：Node.js 20+。

```bash
# 1. 安裝相依套件
npm install

# 2. 設定環境變數（見下節）
cp .env.example .env

# 3.（可選）連接資料庫後同步 schema
npx prisma db push

# 4. 啟動開發伺服器（http://localhost:3000）
npm run dev
```

其他指令（來自 `package.json` scripts）：

```bash
npm run build   # 正式建置
npm run start   # 啟動正式伺服器
npm run lint    # ESLint 檢查
```

> 不設定資料庫也能啟動：列表 / 詳細 / 匯出 會直接使用 demo 種子資料。

## 環境變數

以下為程式碼（`app/`、`lib/`、`prisma/schema.prisma`）實際讀取的變數。**必填** 標示為服務正常運作所需。

| 變數 | 必填 | 說明 |
| --- | --- | --- |
| `DATABASE_URL` | ✅（接資料庫時） | PostgreSQL 連線字串（Prisma `datasource`）。未設定則以 demo 種子資料運作。 |
| `DATABASE_URL_UNPOOLED` | 選填 | Prisma `directUrl`，供 migration / `db push` 使用的非連線池直連（Neon 建議設定）。 |
| `NEXT_PUBLIC_SITE_URL` | 建議 | 站台公開網址，用於組合金流 return / notify / clientBack URL；未設定時 fallback 為請求來源。本機預設 `http://localhost:3000`。 |
| `NEWEBPAY_MERCHANT_ID` | ✅（啟用金流時） | 藍新金流商店代號。 |
| `NEWEBPAY_HASH_KEY` | ✅（啟用金流時） | 藍新金流 HashKey（AES / SHA256）。 |
| `NEWEBPAY_HASH_IV` | ✅（啟用金流時） | 藍新金流 HashIV。 |
| `NEWEBPAY_API_BASE` | 選填 | 藍新金流 API base，預設 `https://ccore.newebpay.com`（測試環境）。正式環境改為 `https://core.newebpay.com`。 |
| `SMART_ROUTER_URL` | 選填 | Smart Router 端點，供 `/api/lead-summary` 呼叫 LLM，預設 `http://127.0.0.1:8765`。 |

> ⚠️ 注意：repo 內 `.env.example` 目前列有 `ECPAY_*` 與 `STRIPE_*`，但**現行程式碼並未使用**這些變數（金流實作為藍新 NewebPay）；同時 `.env.example` 尚未包含 `DATABASE_URL_UNPOOLED`、`NEWEBPAY_*`、`SMART_ROUTER_URL`。請以上表為準。

## 部署（Vercel）

1. 將 repo 連接至 Vercel（GitHub → Import Project）。
2. 在 Vercel 專案的 **Settings → Environment Variables** 設定上節所列變數（至少 `DATABASE_URL`；啟用金流再加 `NEWEBPAY_*`、`NEXT_PUBLIC_SITE_URL`）。
3. 資料庫建議使用 Neon Postgres（或 Supabase），於 build 前以 `prisma db push` 或 migration 建表。
4. 推送至預設分支 `main` 即觸發部署。

> 提醒：`/api/lead-summary` 依賴本機 Smart Router（`SMART_ROUTER_URL`），在 Vercel 上需指向可公開存取的相容端點，否則該 API 會回傳 502。

## 授權

本專案未附授權檔（無 `LICENSE`），預設為 **Private — All rights reserved**。未經授權請勿散布或商用。
