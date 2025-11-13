// src/app/api/bookings/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

function overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) {
  return aStart < bEnd && bStart < aEnd;
}

type Params = { params: { id: string } };

// GET /api/bookings/:id
export async function GET(_req: Request, { params }: Params) {
  const b = await prisma.booking.findUnique({
    where: { id: params.id },
    include: {
      guest: true,
      room: true,
    },
  });
  if (!b) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(b);
}

// PATCH /api/bookings/:id (ADMIN or MANAGER)
export async function PATCH(req: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  if (!role || (role !== "ADMIN" && role !== "MANAGER")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

  const existing = await prisma.booking.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const roomId = (body.roomId as string) ?? existing.roomId;
  const checkIn = body.checkIn ? new Date(body.checkIn) : existing.checkIn;
  const checkOut = body.checkOut ? new Date(body.checkOut) : existing.checkOut;
  const guests = (body.guests as number) ?? existing.guests;
  const status = (body.status as string) ?? existing.status;

  if (!(checkIn < checkOut)) {
    return NextResponse.json({ error: "Invalid date range" }, { status: 400 });
  }

  const room = await prisma.room.findUnique({ where: { id: roomId } });
  if (!room) return NextResponse.json({ error: "Room not found" }, { status: 404 });
  if (guests > room.capacity) {
    return NextResponse.json({ error: "Guests exceed room capacity" }, { status: 400 });
  }

  const conflicts = await prisma.booking.findMany({
    where: { roomId, NOT: { id: params.id } },
    select: { checkIn: true, checkOut: true },
  });
  const hasConflict = conflicts.some((b) => overlaps(checkIn, checkOut, b.checkIn, b.checkOut));
  if (hasConflict) {
    return NextResponse.json({ error: "Room not available for these dates" }, { status: 409 });
  }

  const nights = Math.max(1, Math.ceil((+checkOut - +checkIn) / (1000 * 60 * 60 * 24)));
  const totalPrice = room.price * nights;

  const updated = await prisma.booking.update({
    where: { id: params.id },
    data: {
      roomId,
      checkIn,
      checkOut,
      guests,
      status,
      totalPrice,
    },
  });

  return NextResponse.json(updated);
}

// DELETE /api/bookings/:id (ADMIN or MANAGER)
export async function DELETE(_req: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  if (!role || (role !== "ADMIN" && role !== "MANAGER")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const deleted = await prisma.booking.delete({ where: { id: params.id } }).catch(() => null);
  if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ ok: true });
}
