# TinyCRM TW

小型 CRM — 業務、房仲、保險、接案者、教育招生使用。手機優先、可匯出 Excel、LINE 備註。

## Stack

- Next.js 16 (App Router) + TypeScript + Tailwind v4
- Prisma + PostgreSQL（Neon / Supabase 任選）
- xlsx（Excel 匯出）

## Quickstart

```bash
npm install
cp .env.example .env  # 填入 DATABASE_URL
npx prisma db push
npm run dev
```

## Roadmap

- [x] Demo 列表 + 篩選 + Excel 匯出
- [x] 聯絡人新增表單
- [x] Prisma schema (Contact + Interaction + status enum)
- [ ] 介接 Prisma Client（待 DATABASE_URL 配置）
- [ ] 與 QuoteKit / DocGen / BeautySchedule 跨專案資料同步
- [ ] LINE webhook 接收 → 自動建立 Interaction

## Deployment

GitHub → Vercel → Neon Postgres。所有環境變數在 Vercel 設定。
