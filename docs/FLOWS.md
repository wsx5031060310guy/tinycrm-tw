# 關鍵流程（FLOWS）

> 以下流程之節點均對應 repo 內真實的頁面、API Route、Server Action 與函式。各流程旁標註對應檔案。

## 1. 瀏覽聯絡人列表與統計（首頁）

對應：`app/page.tsx`、`lib/seed-data.ts`、`lib/utils.ts`

```mermaid
flowchart TD
    A["使用者開啟 /"] --> B["app/page.tsx（server component）"]
    B --> C["讀取 seedContacts（lib/seed-data.ts）"]
    C --> D["計算統計：全部 / 潛在客戶 / 已洽談 / 現有客戶"]
    D --> E["渲染 4 張統計卡 + RWD 表格"]
    E --> F["每列用 STATUS_LABELS / STATUS_BADGE 顯示中文狀態徽章"]
    F --> G{"使用者動作"}
    G -->|"點 ＋ 新增聯絡人"| H["導向 /contacts/new"]
    G -->|"點 匯出 Excel"| I["GET /api/contacts/export"]
    G -->|"點 詳細"| J["導向 /contacts/[id]"]
```

**說明：** 首頁為 server component，資料目前直接來自 `seedContacts`（demo 種子）。狀態以中文徽章顯示（潛在客戶 / 已洽談 / 現有客戶 / 流失），對應 enum `LEAD / QUALIFIED / CUSTOMER / CHURNED`。

---

## 2. 新增聯絡人（demo 模式）

對應：`app/contacts/new/page.tsx`、`app/api/contacts/route.ts`

```mermaid
sequenceDiagram
    actor U as 使用者
    participant Form as "新增表單<br/>(contacts/new/page.tsx)"
    participant API as "POST /api/contacts"

    U->>Form: 填入姓名 / 電話 / Email / LINE ID / 公司 / 標籤 / 狀態 / 備註
    U->>Form: 送出表單
    Form->>Form: tags 以逗號切分為陣列
    Form->>API: fetch POST（JSON body）
    API->>API: 解析 JSON，失敗回 400「Invalid JSON」
    API->>API: 檢查 name，缺少回 400「缺少姓名」
    Note over API: TODO：待 DATABASE_URL 後以 Prisma 寫入
    API-->>Form: 201 { ok: true, demo: true, contact }
    Form-->>U: 顯示「已建立（demo 模式）」
```

**說明：** 表單為 client component。後端目前**不寫入資料庫**，僅驗證姓名後回 `201` 並標 `demo: true`；真正持久化待 Prisma 接線後補上。

---

## 3. 新增互動紀錄（互動時間軸，Server Action）

對應：`app/contacts/[id]/page.tsx`、`InteractionForm.tsx`、`actions.ts`、`lib/seed-data.ts`

```mermaid
sequenceDiagram
    actor U as 使用者
    participant Page as "詳細頁<br/>(contacts/[id]/page.tsx)"
    participant Form as "InteractionForm.tsx<br/>(useActionState)"
    participant Action as "addInteractionAction<br/>(actions.ts)"
    participant Seed as "lib/seed-data.ts"

    U->>Page: 開啟 /contacts/[id]
    Page->>Seed: getInteractionsForContact(id)（依時間排序）
    Page-->>U: 顯示基本欄位 + 備註 + 互動時間軸
    U->>Form: 選類型（電話/訊息/會議/筆記/Email/LINE）+ 填摘要
    Form->>Action: formAction(contactId, formData)
    Action->>Action: 驗證 summary 非空、type 在白名單內
    alt 驗證失敗
        Action-->>Form: { error: "請輸入互動摘要" / "互動類型無效" }
    else 驗證通過
        Action->>Seed: appendInteraction(...)（推入記憶體陣列）
        Action->>Action: revalidatePath(/contacts/[id])
        Action-->>Form: { ok: true } → 顯示「✓ 已加入」
    end
```

**說明：** 透過 React `useActionState` 串接 Server Action。新增的互動以 `appendInteraction` 推入 `seedInteractions` 記憶體陣列（非持久化，伺服器重啟即失效），並用 `revalidatePath` 重新渲染時間軸。

---

## 4. 匯出聯絡人 Excel

對應：`app/api/contacts/export/route.ts`、`lib/seed-data.ts`、`xlsx`

```mermaid
flowchart LR
    A["使用者點『匯出 Excel』"] --> B["GET /api/contacts/export"]
    B --> C["讀取 seedContacts"]
    C --> D["映射中文欄位：姓名/電話/Email/LINE ID/公司/狀態/標籤/備註/來源/建立時間"]
    D --> E["XLSX.utils.json_to_sheet → book_append_sheet"]
    E --> F["XLSX.write（type: buffer, bookType: xlsx）"]
    F --> G["回傳檔案（Content-Disposition: attachment）"]
    G --> H["瀏覽器下載 tinycrm-contacts-YYYY-MM-DD.xlsx"]
```

**說明：** 使用 SheetJS（`xlsx`）即時產生 `.xlsx`。狀態欄以 `STATUS_LABELS` 轉中文，標籤以「、」串接，檔名帶當日日期。

---

## 5. AI 業務筆記摘要

對應：`app/api/lead-summary/route.ts`、`lib/router-client.ts`、Smart Router

```mermaid
sequenceDiagram
    participant Caller as "呼叫端"
    participant API as "POST /api/lead-summary"
    participant Client as "chat()（router-client.ts）"
    participant Router as "Smart Router<br/>(SMART_ROUTER_URL，預設 127.0.0.1:8765)"

    Caller->>API: { notes: "業務自由筆記" }
    API->>API: 無 notes 回 400「notes required」
    API->>Client: chat([system, user], { tier: "free" })
    Client->>Router: GET /route?tier=free（選模型）
    Router-->>Client: { model }
    Client->>Router: POST /v1/chat/completions（model + messages）
    Router-->>Client: choices[0].message.content
    Client-->>API: 模型回應文字
    API->>API: 去除 ```json 圍欄 → JSON.parse
    alt parse 成功
        API-->>Caller: { summary, nextStep }
    else parse 失敗
        API-->>Caller: { summary: 前 40 字, nextStep: "" }
    end
    Note over API: chat() 拋錯時回 502
```

**說明：** 系統提示要求模型輸出 `{"summary","nextStep"}` JSON（繁中、字數上限）。走 Smart Router 免費層（`tier: "free"`），避免消耗付費額度；Router 端點異常時 API 回 `502`。

---

## 6. 藍新金流（NewebPay）訂閱付款

對應：`checkout/route.ts`、`notify/route.ts`、`return/route.ts`、`lib/payment/*`、`app/payment/success/page.tsx`

```mermaid
sequenceDiagram
    actor U as 使用者
    participant App as "TinyCRM"
    participant Checkout as "POST .../newebpay/checkout"
    participant Store as "order-store.ts（in-memory）"
    participant NLib as "newebpay.ts（AES/SHA256）"
    participant MPG as "藍新金流 MPG Gateway"
    participant Notify as "POST .../newebpay/notify"
    participant Return as "POST .../newebpay/return"
    participant Success as "/payment/success"

    U->>App: 選擇方案（basic / pro）
    App->>Checkout: POST { plan, email }
    Checkout->>Checkout: getPlan(plan)，無效回 400
    Checkout->>Store: createOrder（status: PENDING，merchantTradeNo）
    Checkout->>NLib: buildCheckoutPayload（加密 TradeInfo + TradeSha）
    Checkout-->>App: { endpoint, params, merchantOrderNo }
    App->>MPG: 以表單 POST 導向 MPG gateway
    MPG-->>Notify: S2S 通知（TradeInfo, Status）
    Notify->>NLib: decodeTradeInfo（解密取 MerchantOrderNo / TradeNo）
    Notify->>Store: 依 Status → markPaid / markFailed（已 PAID/FAILED 則略過）
    Notify-->>MPG: 固定回應字串 "0"
    MPG-->>Return: 使用者端導回（POST TradeInfo, Status）
    Return->>NLib: 解密取 MerchantOrderNo（best-effort）
    Return-->>U: 303 轉址 /payment/success?order=...&status=...
    U->>Success: 檢視付款結果（成功 / 未完成）
```

**說明：**

- **checkout**：依方案建立 in-memory 訂單（`PENDING`）並產生 MPG 加密參數（AES-256-CBC + SHA256 TradeSha）。
- **notify**：Server-to-server 權威狀態更新，依解密後 `Status === "SUCCESS"` 標記 `markPaid` 否則 `markFailed`，且具冪等保護（訂單已 `PAID`/`FAILED` 則不重複處理），**固定回應 `"0"`** 避免藍新重送風暴。
- **return**：僅作使用者端導回，best-effort 解出訂單編號後 **303 轉址**至 `/payment/success`；狀態變更不在此處進行。
- **success**：依 query 參數 `order` / `status` 顯示「付款完成」或「付款未完成」與客服資訊。
