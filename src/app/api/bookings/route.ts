// src/app/api/bookings/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Helper: date overlap check
function overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) {
  return aStart < bEnd && bStart < aEnd;
}

// GET /api/bookings?status=&guestId=&roomId=&from=&to=&page=&limit=
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") ?? undefined;
  const guestId = searchParams.get("guestId") ?? undefined;
  const roomId = searchParams.get("roomId") ?? undefined;
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1);
  const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "12", 10), 1), 50);
  const offset = (page - 1) * limit;

  const where: any = {};
  if (status) where.status = status;
  if (guestId) where.guestId = guestId;
  if (roomId) where.roomId = roomId;
  if (from || to) {
    // Rough filter; exact availability is enforced on create/update
    if (from) where.checkOut = { gte: new Date(from) };
    if (to) where.checkIn = { lte: new Date(to) };
  }

  const [items, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
      include: {
        guest: { select: { id: true, name: true, email: true, phone: true } },
        room: { select: { id: true, title: true, price: true } },
      },
    }),
    prisma.booking.count({ where }),
  ]);

  return NextResponse.json({
    items,
    total,
    page,
    limit,
    pages: Math.max(1, Math.ceil(total / limit)),
  });
}

// POST /api/bookings
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const roomId: string | undefined = body?.roomId;
  const guestId: string | undefined = body?.guestId;
  const checkInStr: string | undefined = body?.checkIn;
  const checkOutStr: string | undefined = body?.checkOut;
  const guests: number | undefined = body?.guests;

  if (!roomId || !guestId || !checkInStr || !checkOutStr || !guests) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const checkIn = new Date(checkInStr);
  const checkOut = new Date(checkOutStr);
  if (!(checkIn < checkOut)) {
    return NextResponse.json({ error: "Invalid date range" }, { status: 400 });
  }

  const room = await prisma.room.findUnique({ where: { id: roomId } });
  if (!room) return NextResponse.json({ error: "Room not found" }, { status: 404 });
  if (guests > room.capacity) {
    return NextResponse.json({ error: "Guests exceed room capacity" }, { status: 400 });
  }

  // Availability: ensure no booking overlaps for this room
  const conflicts = await prisma.booking.findMany({
    where: { roomId },
    select: { checkIn: true, checkOut: true },
  });

  const hasConflict = conflicts.some((b) => overlaps(checkIn, checkOut, b.checkIn, b.checkOut));
  if (hasConflict) {
    return NextResponse.json({ error: "Room not available for these dates" }, { status: 409 });
  }

  const nights = Math.max(1, Math.ceil((+checkOut - +checkIn) / (1000 * 60 * 60 * 24)));
  const totalPrice = room.price * nights;

  const created = await prisma.booking.create({
    data: {
      roomId,
      guestId,
      userId: (session.user as any)?.id ?? null,
      checkIn,
      checkOut,
      guests,
      totalPrice,
      status: "CONFIRMED",
    },
  });

  return NextResponse.json(created, { status: 201 });
}
