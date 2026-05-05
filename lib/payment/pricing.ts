export type Plan = {
  code: string;
  name: string;
  amount: number;
  description: string;
  interval?: "month" | "year" | "one_time";
};

export const TINYCRM_PLANS: Record<string, Plan> = {
  basic: {
    code: "basic",
    name: "TinyCRM 基礎版",
    amount: 499,
    description: "50 位客戶上限 + 預約紀錄 + 客戶分群",
    interval: "month",
  },
  pro: {
    code: "pro",
    name: "TinyCRM 進階版",
    amount: 899,
    description: "無限客戶 + 自動 SMS 提醒 + 消費分析",
    interval: "month",
  },
};

export function getPlan(code: string): Plan | null {
  return TINYCRM_PLANS[code] ?? null;
}
