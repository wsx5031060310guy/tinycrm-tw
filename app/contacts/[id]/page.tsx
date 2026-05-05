import Link from "next/link";
import { notFound } from "next/navigation";
import { seedContacts } from "@/lib/seed-data";
import { STATUS_BADGE, STATUS_LABELS } from "@/lib/utils";

export default async function ContactDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const contact = seedContacts.find((c) => c.id === id);
  if (!contact) notFound();

  return (
    <main className="mx-auto max-w-3xl p-4 sm:p-8 space-y-6">
      <Link href="/" className="text-sm text-blue-600 hover:underline">← 回列表</Link>
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">{contact.name}</h1>
        <div className="text-sm text-zinc-500">
          <span className={`inline-flex rounded-full px-2 py-0.5 text-xs mr-2 ${STATUS_BADGE[contact.status]}`}>
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
        <p className="whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300">{contact.notes ?? "—"}</p>
      </section>
    </main>
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
