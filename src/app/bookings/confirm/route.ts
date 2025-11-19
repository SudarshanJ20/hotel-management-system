import { NextResponse } from "next/server";

export async function POST(req: Request) {
  // Placeholder for any future confirmation logic (DB updates, etc.)
  // Previously this route only attempted to send emails; now it simply
  // returns success so other flows (webhooks, etc.) continue to work.

  return NextResponse.json({ ok: true, emailSent: false });
}
