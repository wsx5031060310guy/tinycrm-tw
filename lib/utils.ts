import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const STATUS_LABELS: Record<string, string> = {
  LEAD: "潛在客戶",
  QUALIFIED: "已洽談",
  CUSTOMER: "現有客戶",
  CHURNED: "流失",
};

export const STATUS_BADGE: Record<string, string> = {
  LEAD: "bg-blue-100 text-blue-700",
  QUALIFIED: "bg-amber-100 text-amber-700",
  CUSTOMER: "bg-emerald-100 text-emerald-700",
  CHURNED: "bg-zinc-200 text-zinc-700",
};
