import { NextResponse } from "next/server";

interface ContactPayload {
  name?: string;
  phone?: string;
  email?: string;
  lineId?: string;
  company?: string;
  tags?: string[];
  status?: string;
  notes?: string;
}

export async function POST(req: Request) {
  let body: ContactPayload;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!body.name) return NextResponse.json({ error: "缺少姓名" }, { status: 400 });

  // TODO: persist via Prisma once DATABASE_URL is configured.
  return NextResponse.json({ ok: true, demo: true, contact: body }, { status: 201 });
}
