import Link from "next/link";
import { notFound } from "next/navigation";
import {
  seedContacts,
  getInteractionsForContact,
  INTERACTION_LABELS,
  type SeedInteraction,
} from "@/lib/seed-data";
import { STATUS_BADGE, STATUS_LABELS } from "@/lib/utils";
import InteractionForm from "./InteractionForm";

const TYPE_DOT: Record<string, string> = {
  CALL: "bg-blue-500",
  MESSAGE: "bg-violet-500",
  MEETING: "bg-amber-500",
  NOTE: "bg-zinc-400",
  EMAIL: "bg-emerald-500",
  LINE: "bg-green-500",
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export default async function ContactDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const contact = seedContacts.find((c) => c.id === id);
  if (!contact) notFound();

  const interactions = getInteractionsForContact(id);

  return (
    <main className="mx-auto max-w-3xl p-4 sm:p-8 space-y-6">
      <Link href="/" className="text-sm text-blue-600 hover:underline">
        ← 回列表
      </Link>
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">{contact.name}</h1>
        <div className="text-sm text-zinc-500">
          <span
            className={`inline-flex rounded-full px-2 py-0.5 text-xs mr-2 ${STATUS_BADGE[contact.status]}`}
          >
            {STATUS_LABELS[contact.status]}
          </span>
          {contact.company ?? "個人"}．{contact.source ? `來源：${contact.source}` : "—"}
        </div>
      </header>

      <section className="grid gap-3 sm:grid-cols-2">
        <Field label="電話" value={contact.phone} />
        <Field label="Email" value={contact.email} />
        <Field label="LINE ID" value={contact.lineId} />
        <Field label="標籤" value={contact.tags.join("、")} />
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="mb-2 text-sm font-semibold">備註</h2>
        <p className="whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300">
          {contact.notes ?? "—"}
        </p>
      </section>

      <section className="space-y-3">
        <div className="flex items-baseline justify-between">
          <h2 className="text-sm font-semibold">互動歷史</h2>
          <span className="text-xs text-zinc-500">共 {interactions.length} 筆</span>
        </div>
        <InteractionForm contactId={id} />
        {interactions.length === 0 ? (
          <p className="rounded-lg border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-500 dark:border-zinc-700">
            目前沒有互動紀錄。從上方新增第一筆。
          </p>
        ) : (
          <ol className="relative space-y-3 border-l border-zinc-200 pl-5 dark:border-zinc-800">
            {interactions.map((it) => (
              <Timeline key={it.id} item={it} />
            ))}
          </ol>
        )}
      </section>
    </main>
  );
}

function Timeline({ item }: { item: SeedInteraction }) {
  const dot = TYPE_DOT[item.type] ?? "bg-zinc-400";
  return (
    <li className="relative">
      <span
        aria-hidden
        className={`absolute -left-[27px] top-1.5 inline-block h-3 w-3 rounded-full ring-2 ring-white dark:ring-zinc-900 ${dot}`}
      />
      <div className="rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <span className="font-medium text-zinc-700 dark:text-zinc-300">
            {INTERACTION_LABELS[item.type]}
          </span>
          {item.channel && <span>．{item.channel}</span>}
          <span className="ml-auto">{formatDate(item.occurredAt)}</span>
        </div>
        <p className="mt-1.5 whitespace-pre-wrap text-sm">{item.summary}</p>
      </div>
    </li>
  );
}

function Field({ label, value }: { label: string; value?: string }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="text-xs text-zinc-500">{label}</div>
      <div className="mt-1 text-sm">{value || "—"}</div>
    </div>
  );
}
