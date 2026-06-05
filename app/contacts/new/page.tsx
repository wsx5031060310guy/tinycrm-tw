"use client";

import Link from "next/link";
import { useId, useState } from "react";

export default function NewContactPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [lineId, setLineId] = useState("");
  const [company, setCompany] = useState("");
  const [tags, setTags] = useState("");
  const [status, setStatus] = useState("LEAD");
  const [notes, setNotes] = useState("");
  const [result, setResult] = useState<{ ok?: boolean; error?: string } | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/contacts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        phone,
        email,
        lineId,
        company,
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
        status,
        notes,
      }),
    });
    const json = await res.json();
    setResult(res.ok ? { ok: true } : { error: json.error ?? "送出失敗" });
  };

  return (
    <main className="mx-auto max-w-2xl p-4 sm:p-8 space-y-6">
      <Link href="/" className="text-sm text-blue-600 hover:underline">← 回列表</Link>
      <h1 className="text-2xl font-bold">新增聯絡人</h1>

      <form onSubmit={submit} className="space-y-4">
        <Input label="姓名" value={name} onChange={setName} required />
        <Input label="電話" value={phone} onChange={setPhone} />
        <Input label="Email" value={email} onChange={setEmail} />
        <Input label="LINE ID" value={lineId} onChange={setLineId} />
        <Input label="公司" value={company} onChange={setCompany} />
        <Input label="標籤（用逗號分隔）" value={tags} onChange={setTags} />

        <div className="space-y-1">
          <label htmlFor="contact-status" className="block text-sm font-medium">狀態</label>
          <select
            id="contact-status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full rounded border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          >
            <option value="LEAD">潛在客戶</option>
            <option value="QUALIFIED">已洽談</option>
            <option value="CUSTOMER">現有客戶</option>
            <option value="CHURNED">流失</option>
          </select>
        </div>

        <div className="space-y-1">
          <label htmlFor="contact-notes" className="block text-sm font-medium">備註</label>
          <textarea
            id="contact-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full rounded border border-zinc-300 bg-white px-3 py-2 text-sm min-h-24 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </div>

        <button
          type="submit"
          className="w-full rounded bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          建立聯絡人
        </button>

        {result?.ok && <p className="text-sm text-green-600">已建立（demo 模式 — 待 DATABASE_URL 設定後寫入 DB）</p>}
        {result?.error && <p className="text-sm text-red-600">{result.error}</p>}
      </form>
    </main>
  );
}

function Input({
  label,
  value,
  onChange,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  const id = useId();
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-sm font-medium">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      <input
        id={id}
        type="text"
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
      />
    </div>
  );
}
