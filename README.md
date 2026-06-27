# TinyCRM TW

> 為台灣中小型業務量身打造的迷你 CRM — 手機優先、LINE 備註、一鍵匯出 Excel，內建藍新金流訂閱與 AI 業務筆記摘要。

**狀態：** 開發中（demo 模式優先）。前端、API、金流加解密邏輯與法務頁均已實作；資料層目前以 demo 種子 / in-memory 運作，Prisma schema 已備妥待接 PostgreSQL。

## 專案簡介

TinyCRM TW 是一套輕量級客戶關係管理工具，鎖定業務、房仲、保險、接案者與教育招生等需要隨手記錄客戶與跟進的場景。介面以手機優先設計，支援聯絡人管理、互動歷史時間軸、Excel 匯出，並整合藍新金流（NewebPay）訂閱付款與透過 Smart Router 的 AI 業務筆記摘要。

目前資料層以內建 demo 種子資料運作，方便在未連接資料庫前直接試用；Prisma schema 已備妥（`Contact` / `Interaction` / `Order` / `Subscription`），待設定 `DATABASE_URL` 後即可接上 PostgreSQL 持久化。

## 📚 專案文件

| 文件 | 說明 |
| --- | --- |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | 專案總覽、技術棧、架構圖與 DB 實體關係圖（Prisma schema） |
| [docs/FLOWS.md](docs/FLOWS.md) | 6 個關鍵流程的圖解（列表 / 新增 / 互動 / 匯出 / AI 摘要 / 金流） |
| [docs/PAGES.md](docs/PAGES.md) | 頁面路由表 + API endpoint 表 + 共用模組與方案定價 |
| [docs/OPERATIONS.md](docs/OPERATIONS.md) | 安裝 / 啟動指令、環境變數清單、部署與維運操作 |

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
  - `POST /api/payment/newebpay/return`：使用者端導回，解碼訂單編號後 303 轉址至付款結果頁 `/payment/success`。
- **方案定價**（`lib/payment/pricing.ts`）：基礎版 NT$499/月（50 位客戶上限）、進階版 NT$899/月（無限客戶 + SMS 提醒 + 消費分析）。
- **法務頁與付款結果頁**：`/pricing`、`/terms`、`/privacy`、`/refund`、`/payment/success`（公司資訊單一來源於 `lib/company.ts`）。

> 備註：目前 `/api/contacts` 與互動操作為 demo / 記憶體模式（回傳成功但尚未寫入資料庫），聯絡人 / 互動畫面讀取的是 `lib/seed-data.ts` 的種子資料；訂單與訂閱亦以 in-memory store（`lib/payment/order-store.ts`）暫存。所有持久化待 `DATABASE_URL` 設定並執行 `prisma db push` 後切換為 Prisma Client。

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

完整技術棧與版本見 [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)。

## 快速開始

需求：Node.js 20+。

```bash
# 1. 安裝相依套件
npm install

# 2. 設定環境變數（見 docs/OPERATIONS.md）
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

環境變數清單與部署方式詳見 [docs/OPERATIONS.md](docs/OPERATIONS.md)。

## 授權

本專案未附授權檔（無 `LICENSE`），預設為 **Private — All rights reserved**。未經授權請勿散布或商用。
