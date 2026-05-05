import Link from "next/link";
import { seedContacts } from "@/lib/seed-data";
import { STATUS_BADGE, STATUS_LABELS } from "@/lib/utils";

export default function Home() {
  const stats = {
    total: seedContacts.length,
    leads: seedContacts.filter((c) => c.status === "LEAD").length,
    qualified: seedContacts.filter((c) => c.status === "QUALIFIED").length,
    customers: seedContacts.filter((c) => c.status === "CUSTOMER").length,
  };

  return (
    <main className="mx-auto max-w-5xl p-4 sm:p-8 space-y-8">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">TinyCRM TW</h1>
          <p className="text-sm text-zinc-500">小型 CRM．手機優先．LINE 備註．Excel 匯出</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/contacts/new"
            className="rounded bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            ＋ 新增聯絡人
          </Link>
          <Link
            href="/api/contacts/export"
            className="rounded border border-zinc-300 px-3 py-2 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
          >
            匯出 Excel
          </Link>
        </div>
      </header>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="全部" value={stats.total} />
        <Stat label="潛在客戶" value={stats.leads} />
        <Stat label="已洽談" value={stats.qualified} />
        <Stat label="現有客戶" value={stats.customers} />
      </section>

      <section className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 text-left text-xs uppercase tracking-wide text-zinc-500 dark:bg-zinc-900">
            <tr>
              <th className="px-3 py-2">姓名</th>
              <th className="px-3 py-2 hidden sm:table-cell">公司</th>
              <th className="px-3 py-2">狀態</th>
              <th className="px-3 py-2 hidden md:table-cell">標籤</th>
              <th className="px-3 py-2">操作</th>
            </tr>
          </thead>
          <tbody>
            {seedContacts.map((c) => (
              <tr key={c.id} className="border-t border-zinc-100 dark:border-zinc-800">
                <td className="px-3 py-3">
                  <div className="font-medium">{c.name}</div>
                  <div className="text-xs text-zinc-500">{c.phone ?? c.email}</div>
                </td>
                <td className="px-3 py-3 hidden sm:table-cell text-zinc-600 dark:text-zinc-300">{c.company ?? "-"}</td>
                <td className="px-3 py-3">
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-xs ${STATUS_BADGE[c.status]}`}>
                    {STATUS_LABELS[c.status]}
                  </span>
                </td>
                <td className="px-3 py-3 hidden md:table-cell">
                  <div className="flex flex-wrap gap-1">
                    {c.tags.map((t) => (
                      <span key={t} className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                        {t}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-3 py-3">
                  <Link href={`/contacts/${c.id}`} className="text-xs text-blue-600 hover:underline">
                    詳細
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <footer className="text-xs text-zinc-500">
        Demo data shown above. 實際資料需設定 DATABASE_URL 並執行 `prisma db push`。
      </footer>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="text-xs text-zinc-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
    </div>
  );
}
