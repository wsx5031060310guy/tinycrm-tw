"use server";

import { revalidatePath } from "next/cache";
import { appendInteraction, type InteractionType } from "@/lib/seed-data";

const VALID_TYPES: InteractionType[] = ["CALL", "MESSAGE", "MEETING", "NOTE", "EMAIL", "LINE"];

export type AddInteractionState = {
  error?: string;
  ok?: boolean;
};

export async function addInteractionAction(
  contactId: string,
  _prev: AddInteractionState | undefined,
  formData: FormData
): Promise<AddInteractionState> {
  const typeRaw = (formData.get("type") as string | null)?.trim() ?? "";
  const summary = (formData.get("summary") as string | null)?.trim() ?? "";
  const channel = (formData.get("channel") as string | null)?.trim() || undefined;

  if (!summary) return { error: "請輸入互動摘要" };
  if (!VALID_TYPES.includes(typeRaw as InteractionType)) return { error: "互動類型無效" };

  appendInteraction({
    contactId,
    type: typeRaw as InteractionType,
    channel,
    summary,
  });

  revalidatePath(`/contacts/${contactId}`);
  return { ok: true };
}
