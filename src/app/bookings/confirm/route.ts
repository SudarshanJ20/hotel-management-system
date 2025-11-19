import { NextResponse } from "next/server";
import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

export async function POST(req: Request) {
  // TODO: read booking data from req and update DB (keep your existing logic)

  if (!resend) {
    console.warn("RESEND_API_KEY is missing; skipping confirmation email.");
    return NextResponse.json({ ok: true, emailSkipped: true });
  }

  // Example shape – fill in your real values:
  await resend.emails.send({
    from: "Hotel RMS <no-reply@yourdomain.com>",
    to: ["guest@example.com"],
    subject: "Booking confirmation",
    html: "<p>Your booking is confirmed.</p>",
  });

  return NextResponse.json({ ok: true });
}
