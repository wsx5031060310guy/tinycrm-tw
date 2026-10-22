import ExcelJS from "exceljs";
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

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Contacts");
  ws.columns = Object.keys(rows[0] ?? {}).map((key) => ({ header: key, key }));
  ws.addRows(rows);
  const buf = await wb.xlsx.writeBuffer();

  return new Response(new Uint8Array(buf), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename=tinycrm-contacts-${new Date().toISOString().slice(0, 10)}.xlsx`,
    },
  });
}
