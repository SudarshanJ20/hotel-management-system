// src/app/api/bookings/availability/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) {
  return aStart < bEnd && bStart < aEnd;
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const roomId: string | undefined = body?.roomId;
  const checkInStr: string | undefined = body?.checkIn;
  const checkOutStr: string | undefined = body?.checkOut;

  if (!roomId || !checkInStr || !checkOutStr) {
    return NextResponse.json({ ok: false, reason: "Missing fields" }, { status: 400 });
  }

  const checkIn = new Date(checkInStr);
  const checkOut = new Date(checkOutStr);
  if (!(checkIn < checkOut)) {
    return NextResponse.json({ ok: false, reason: "Invalid date range" }, { status: 400 });
  }

  const room = await prisma.room.findUnique({ where: { id: roomId } });
  if (!room) return NextResponse.json({ ok: false, reason: "Room not found" }, { status: 404 });

  const conflicts = await prisma.booking.findMany({
    where: { roomId },
    select: { checkIn: true, checkOut: true, status: true },
  });

  const hasConflict = conflicts
    .filter((b) => b.status !== "CANCELLED")
    .some((b) => overlaps(checkIn, checkOut, b.checkIn, b.checkOut));

  if (hasConflict) return NextResponse.json({ ok: false, reason: "Booking not available" });

  return NextResponse.json({ ok: true });
}
