import { NextRequest, NextResponse } from "next/server";
import { chat } from "@/lib/router-client";

// POST /api/lead-summary
// Body: { notes: string }
// Returns: { summary: string, nextStep: string }
//
// Compresses a sales-rep's free-form notes into a one-line summary +
// a single concrete next step. Uses the Smart Router free tier so it's
// safe to call on every lead update without blowing through paid quota.
export async function POST(req: NextRequest) {
  const { notes } = (await req.json()) as { notes?: string };
  if (!notes) return NextResponse.json({ error: "notes required" }, { status: 400 });

  const system =
    "你是業務助手。讀取業務筆記後，用繁體中文回覆 JSON：" +
    '{"summary":"一句話摘要 ≤ 40 字","nextStep":"具體下一步 ≤ 30 字"}。' +
    "只輸出 JSON，不要其他文字。";

  try {
    const text = await chat(
      [
        { role: "system", content: system },
        { role: "user", content: notes },
      ],
      { tier: "free" }
    );
    const cleaned = text.replace(/```json|```/g, "").trim();
    let parsed: { summary?: string; nextStep?: string };
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      parsed = { summary: cleaned.slice(0, 40), nextStep: "" };
    }
    return NextResponse.json({
      summary: parsed.summary || "",
      nextStep: parsed.nextStep || "",
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 502 });
  }
}
