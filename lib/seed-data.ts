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

export type InteractionType = "CALL" | "MESSAGE" | "MEETING" | "NOTE" | "EMAIL" | "LINE";

export interface SeedInteraction {
  id: string;
  contactId: string;
  type: InteractionType;
  channel?: string;
  summary: string;
  occurredAt: string;
}

export const INTERACTION_LABELS: Record<InteractionType, string> = {
  CALL: "電話",
  MESSAGE: "訊息",
  MEETING: "會議",
  NOTE: "筆記",
  EMAIL: "Email",
  LINE: "LINE",
};

export const seedInteractions: SeedInteraction[] = [
  {
    id: "int-1",
    contactId: "demo-1",
    type: "MEETING",
    summary: "現場簡報：logo 改版方向 + 包裝延伸 4 件，提案分三階段",
    occurredAt: "2026-05-01T15:30:00+08:00",
  },
  {
    id: "int-2",
    contactId: "demo-1",
    type: "EMAIL",
    summary: "寄出正式報價 PDF (NT$ 78,000)，含修改 2 次",
    occurredAt: "2026-04-26T10:00:00+08:00",
  },
  {
    id: "int-3",
    contactId: "demo-2",
    type: "LINE",
    summary: "客戶反應預約系統穩定，下個月想加 SMS 提醒模組",
    occurredAt: "2026-04-30T11:20:00+08:00",
  },
  {
    id: "int-4",
    contactId: "demo-3",
    type: "MESSAGE",
    channel: "LinkedIn",
    summary: "對方詢問 NDA 中英對照模板與簽約流程",
    occurredAt: "2026-05-03T14:00:00+08:00",
  },
];

export function getInteractionsForContact(contactId: string): SeedInteraction[] {
  return seedInteractions
    .filter((i) => i.contactId === contactId)
    .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());
}

export function appendInteraction(input: {
  contactId: string;
  type: InteractionType;
  channel?: string;
  summary: string;
}): SeedInteraction {
  const interaction: SeedInteraction = {
    id: `int-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    contactId: input.contactId,
    type: input.type,
    channel: input.channel,
    summary: input.summary,
    occurredAt: new Date().toISOString(),
  };
  seedInteractions.push(interaction);
  return interaction;
}
