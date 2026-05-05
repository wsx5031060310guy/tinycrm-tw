import * as XLSX from "xlsx";
import { seedContacts } from "@/lib/seed-data";
import { STATUS_LABELS } from "@/lib/utils";

export async function GET() {
  const rows = seedContacts.map((c) => ({
    姓名: c.name,
    電話: c.phone ?? "",
    Email: c.email ?? "",
    "LINE ID": c.lineId ?? "",
    公司: c.company ?? "",
    狀態: STATUS_LABELS[c.status] ?? c.status,
    標籤: c.tags.join("、"),
    備註: c.notes ?? "",
    來源: c.source ?? "",
    建立時間: c.createdAt,
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Contacts");
  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;

  return new Response(new Uint8Array(buf), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename=tinycrm-contacts-${new Date().toISOString().slice(0, 10)}.xlsx`,
    },
  });
}
