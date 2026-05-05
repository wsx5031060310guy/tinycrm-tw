export interface SeedContact {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  lineId?: string;
  company?: string;
  tags: string[];
  status: "LEAD" | "QUALIFIED" | "CUSTOMER" | "CHURNED";
  notes?: string;
  source?: string;
  createdAt: string;
  updatedAt: string;
}

export const seedContacts: SeedContact[] = [
  {
    id: "demo-1",
    name: "陳家明",
    phone: "0912-345-678",
    email: "chen@example.com",
    lineId: "@chen-jiaming",
    company: "明日設計工作室",
    tags: ["設計", "高潛力"],
    status: "QUALIFIED",
    notes: "上週洽談 logo 重新設計，預算 80k",
    source: "QuoteKit 報價單",
    createdAt: "2026-04-22T10:00:00+08:00",
    updatedAt: "2026-05-01T15:30:00+08:00",
  },
  {
    id: "demo-2",
    name: "林雅婷",
    phone: "0987-654-321",
    company: "雅婷美學",
    tags: ["美業", "現有客戶"],
    status: "CUSTOMER",
    notes: "BeautySchedule TW 月費客戶，每月 1500",
    source: "BeautySchedule TW",
    createdAt: "2026-03-15T09:00:00+08:00",
    updatedAt: "2026-04-30T11:20:00+08:00",
  },
  {
    id: "demo-3",
    name: "Alex Chen",
    email: "alex@startup.tw",
    lineId: "@alex-chen",
    company: "AI Startup",
    tags: ["B2B", "MQL"],
    status: "LEAD",
    notes: "從 LinkedIn 來，問 NDA 範本",
    source: "DocGen TW",
    createdAt: "2026-05-03T14:00:00+08:00",
    updatedAt: "2026-05-03T14:00:00+08:00",
  },
];
