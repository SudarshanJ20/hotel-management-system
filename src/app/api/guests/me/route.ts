// app/api/guests/me/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma"; // adjust import to your prisma client

export async function GET() {
  const session = await auth();
  const email = (session?.user as any)?.email as string | undefined;
  const name = (session?.user as any)?.name as string | undefined;
  if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Find or create a Guest tied to this email
  const existing = await prisma.guest.findFirst({ where: { email } });
  if (existing) return NextResponse.json(existing);

  const created = await prisma.guest.create({
    data: {
      name: name ?? email.split("@")[0],
      email,
    },
  });

  return NextResponse.json(created);
}
