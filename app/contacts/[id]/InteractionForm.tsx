"use client";

import { useActionState } from "react";
import { addInteractionAction, type AddInteractionState } from "./actions";

const TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: "CALL", label: "電話" },
  { value: "MESSAGE", label: "訊息" },
  { value: "MEETING", label: "會議" },
  { value: "NOTE", label: "筆記" },
  { value: "EMAIL", label: "Email" },
  { value: "LINE", label: "LINE" },
];

export default function InteractionForm({ contactId }: { contactId: string }) {
  const action = addInteractionAction.bind(null, contactId);
  const [state, formAction, pending] = useActionState<AddInteractionState | undefined, FormData>(
    action,
    undefined
  );

  return (
    <form
      action={formAction}
      className="space-y-3 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="text-xs">
          <span className="text-zinc-500">類型</span>
          <select
            name="type"
            defaultValue="NOTE"
            className="mt-1 block w-full rounded border border-zinc-300 bg-white px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800"
          >
            {TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs sm:col-span-2">
          <span className="text-zinc-500">通路（選填，例：LINE / LinkedIn / Zoom）</span>
          <input
            name="channel"
            type="text"
            className="mt-1 block w-full rounded border border-zinc-300 bg-white px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800"
          />
        </label>
      </div>
      <label className="block text-xs">
        <span className="text-zinc-500">摘要</span>
        <textarea
          name="summary"
          required
          rows={3}
          placeholder="例：今日致電確認需求，客戶決定下週二簽約"
          className="mt-1 block w-full rounded border border-zinc-300 bg-white px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800"
        />
      </label>
      <div className="flex items-center justify-between">
        <span className="text-xs text-zinc-500">
          {state?.error ? <span className="text-red-600">{state.error}</span> : state?.ok ? "✓ 已加入" : ""}
        </span>
        <button
          type="submit"
          disabled={pending}
          className="rounded bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-zinc-400"
        >
          {pending ? "新增中..." : "+ 新增互動"}
        </button>
      </div>
    </form>
  );
}
