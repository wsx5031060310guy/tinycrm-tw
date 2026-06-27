# 維運手冊（OPERATIONS）

## 環境需求

- **Node.js 20+**（`@types/node` 為 `^20`）。
- npm（repo 內含 `package-lock.json`）。
- （可選）PostgreSQL 連線，用於接上 Prisma 持久化。

## 安裝與啟動

指令來自 `package.json` 的 `scripts`。

```bash
# 1. 安裝相依套件
npm install

# 2. 設定環境變數（見下節），複製範例後依需求填值
cp .env.example .env

# 3.（可選）接上資料庫後同步 Prisma schema
npx prisma db push

# 4. 啟動開發伺服器（預設 http://localhost:3000）
npm run dev
```

| 指令 | 說明 |
| --- | --- |
| `npm run dev` | 啟動 Next.js 開發伺服器（`next dev`） |
| `npm run build` | 正式建置（`next build`） |
| `npm run start` | 啟動正式伺服器（`next start`，需先 `build`） |
| `npm run lint` | 執行 ESLint（`eslint`） |

> 不設定資料庫也能啟動：列表 / 詳細 / 匯出會直接使用 `lib/seed-data.ts` 的 demo 種子資料；新增聯絡人 / 互動為 demo / 記憶體模式（不持久化）。

## 環境變數

以下變數為程式碼（`app/`、`lib/`、`prisma/schema.prisma`）實際讀取者。**請勿在文件或版控中填入真實值。**

| 變數 | 必填 | 讀取位置 | 說明 |
| --- | --- | --- | --- |
| `DATABASE_URL` | 接 DB 時必填 | `prisma/schema.prisma` `datasource.url` | PostgreSQL 連線字串。未設定則以 demo 種子 / in-memory 運作 |
| `DATABASE_URL_UNPOOLED` | 選填 | `prisma/schema.prisma` `datasource.directUrl` | Prisma `directUrl`，供 migration / `db push` 使用的非連線池直連（Neon 建議設定） |
| `NEXT_PUBLIC_SITE_URL` | 建議 | `checkout/route.ts`、`return/route.ts` | 站台公開網址，用於組合金流 return / notify / clientBack URL；未設定時 fallback 為 `req.nextUrl.origin`。本機建議 `http://localhost:3000` |
| `NEWEBPAY_MERCHANT_ID` | 啟用金流時必填 | `lib/payment/newebpay.ts` | 藍新金流商店代號 |
| `NEWEBPAY_HASH_KEY` | 啟用金流時必填 | `lib/payment/newebpay.ts` | 藍新 HashKey（AES-256-CBC 金鑰 / SHA256） |
| `NEWEBPAY_HASH_IV` | 啟用金流時必填 | `lib/payment/newebpay.ts` | 藍新 HashIV（AES IV） |
| `NEWEBPAY_API_BASE` | 選填 | `lib/payment/newebpay.ts` | 藍新 API base，預設 `https://ccore.newebpay.com`（測試環境）。正式環境改為 `https://core.newebpay.com` |
| `SMART_ROUTER_URL` | 選填 | `lib/router-client.ts` | Smart Router 端點，供 `/api/lead-summary` 呼叫 LLM，預設 `http://127.0.0.1:8765` |

> `.env.example` 目前列有 `DATABASE_URL`、`DATABASE_URL_UNPOOLED`、`NEWEBPAY_MERCHANT_ID`、`NEWEBPAY_HASH_KEY`、`NEWEBPAY_HASH_IV`、`NEWEBPAY_API_BASE`、`SMART_ROUTER_URL`、`NEXT_PUBLIC_SITE_URL`，與上表一致。

## 資料庫接線（Prisma）

目前資料層為 demo / in-memory，要切換為持久化：

1. 準備 PostgreSQL（如 Neon / Supabase），取得連線字串。
2. 設定 `DATABASE_URL`（與 Neon 建議的 `DATABASE_URL_UNPOOLED`）。
3. 建立資料表結構：

   ```bash
   npx prisma db push      # 直接同步 schema（開發 / 首次建表）
   # 或
   npx prisma migrate dev  # 以 migration 管理（需互動環境）
   npx prisma generate     # 產生 Prisma Client
   ```

4. 將下列以 seed / in-memory 實作的模組改用 Prisma Client：
   - `lib/seed-data.ts`（`Contact` / `Interaction` 讀寫）
   - `app/api/contacts/route.ts`（目前 `TODO: persist via Prisma`）
   - `app/contacts/[id]/actions.ts` 的 `appendInteraction`
   - `lib/payment/order-store.ts`（`Order`；in-memory store 已刻意鏡像 Prisma `Order` 欄位，API surface 穩定可直接替換）

## 部署（建議 Vercel）

1. 將 repo 連接至 Vercel（GitHub → Import Project）。
2. 在 **Settings → Environment Variables** 設定上節變數（至少 `DATABASE_URL`；啟用金流再加 `NEWEBPAY_*` 與 `NEXT_PUBLIC_SITE_URL`）。
3. 資料庫建議使用 Neon Postgres（或 Supabase）；於 build 前以 `prisma db push` 或 migration 建表。
4. 推送至預設分支即觸發部署。

> 注意事項：
> - `/api/lead-summary` 依賴 Smart Router（`SMART_ROUTER_URL`，預設指向 `127.0.0.1:8765` 本機）。部署到雲端後須改指向**可公開存取**的相容端點，否則該 API 會回 `502`。
> - in-memory 訂單 store（`order-store.ts`）掛在 `globalThis`，在 serverless / 多實例環境下**不可靠**（跨請求 / 跨實例不共享、冷啟動會清空）。正式金流務必先完成 Prisma `Order` 接線。
> - 金流相關路由已標 `runtime = "nodejs"` 與 `dynamic = "force-dynamic"`。

## 常見維運操作

| 情境 | 操作 |
| --- | --- |
| 查看 / 編輯資料（接 DB 後） | `npx prisma studio` |
| 修改方案 / 價格 | 編輯 `lib/payment/pricing.ts`（`TINYCRM_PLANS`），全站定價 / checkout 自動套用 |
| 更新公司資訊（名稱 / 統編 / 地址 / Email / LINE） | 編輯 `lib/company.ts`（`COMPANY`），footer 與法務頁全站生效 |
| 調整 demo 種子資料 | 編輯 `lib/seed-data.ts` |
| 切換藍新測試 / 正式環境 | 設定 `NEWEBPAY_API_BASE`（測試 `ccore`、正式 `core`） |
| 程式碼風格檢查 | `npm run lint` |
| 本機驗證正式建置 | `npm run build && npm run start` |

## 金流串接備忘（藍新 NewebPay MPG）

- 加密：AES-256-CBC（PKCS7，block 32），輸出 hex（`encodeTradeInfo`）。
- 驗章：SHA256，格式 `HashKey={KEY}&{HEX}&HashIV={IV}`，輸出大寫 hex；加密 hex **不加 `TradeInfo=` 前綴**（`computeTradeSha`）。
- checkout 送出的固定欄位：`Version: "2.0"`、`RespondType: "JSON"`、`ItemDesc` 截斷 50 字。
- `notify` 須**永遠回應字串 `"0"`**（含例外情況），否則藍新會觸發重送風暴。
- `merchantTradeNo` 由 `makeMerchantTradeNo("TCRM")` 產生並截斷為 20 字（藍新上限 30 字）。

## 待辦 / 已知限制

- `POST /api/contacts` 與新增互動為 demo / 記憶體模式，尚未寫入資料庫。
- 訂單 / 訂閱以 in-memory store 暫存，未接 Prisma。
- `Subscription` 模型已定義，但目前程式碼**未有任何讀寫**該表的邏輯。
- `lib/company.ts` 的 `taxId` 與 `lineId` 為待補佔位字串（「（統編待補）」/「（LINE 官方帳號待補）」）。
- `/payment/success` 的「開始使用」按鈕連向 `/contacts`，但該路由不存在（列表在首頁 `/`）。
- 無使用者驗證 / 登入機制；所有頁面與 API 皆公開。
