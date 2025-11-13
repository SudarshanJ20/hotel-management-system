// src/app/api/bookings/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

// Helper: date overlap check
function overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) {
  return aStart < bEnd && bStart < aEnd;
}

// GET /api/bookings?status=&guestId=&roomId=&from=&to=&page=&limit=&me=1
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") ?? undefined;
  const guestId = searchParams.get("guestId") ?? undefined;
  const roomId = searchParams.get("roomId") ?? undefined;
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const me = searchParams.get("me") === "1"; // true when scoping to current user
  const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1);
  const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "12", 10), 1), 50);
  const offset = (page - 1) * limit;

  // Build base where
  const where: any = {};
  if (status) where.status = status;
  if (guestId) where.guestId = guestId;
  if (roomId) where.roomId = roomId;
  if (from || to) {
    // Rough range filter; exact overlap is enforced on create/update
    if (from) where.checkOut = { gte: new Date(from) };
    if (to) where.checkIn = { lte: new Date(to) };
  }

  // If caller asks for their own bookings, scope by userId from session
  if (me) {
    const session = await auth();
    const uid = (session?.user as any)?.id as string | undefined;
    if (!uid) {
      return NextResponse.json({ items: [], total: 0, page, limit, pages: 1 });
    }
    where.userId = uid;
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
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Accept JSON or FormData
  const tryJson = await req.clone().json().catch(() => null);
  const body = tryJson ?? (await req.formData().catch(() => null));
  const get = (k: string) => (body instanceof FormData ? body.get(k) : (body as any)?.[k]);

  const roomId: string | undefined = String(get("roomId") || "") || undefined;
  let guestId: string | undefined = String(get("guestId") || "") || undefined;
  const checkInStr: string | undefined = String(get("checkIn") || "") || undefined;
  const checkOutStr: string | undefined = String(get("checkOut") || "") || undefined;
  const guestsVal = get("guests");
  const guests: number | undefined = guestsVal != null ? Number(guestsVal) : undefined;

  const role = ((session.user as any)?.role ?? "USER") as string;

  // Resolve guestId
  if (role === "USER") {
    // Bind to signed-in user's guest record by email
    const email = (session.user as any)?.email as string | undefined;
    const name = (session.user as any)?.name as string | undefined;
    if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const existing = await prisma.guest.findFirst({ where: { email } });
    if (existing) guestId = existing.id;
    else {
      const createdGuest = await prisma.guest.create({
        data: { email, name: name ?? email.split("@")[0], phone: null },
      });
      guestId = createdGuest.id;
    }
  } else {
    // ADMIN or MANAGER must provide a guestId
    if (!guestId) {
      return NextResponse.json({ error: "Guest is required" }, { status: 400 });
    }
  }

  if (!roomId || !checkInStr || !checkOutStr || !guests) {
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

  // Availability: ignore CANCELLED, block overlaps
  const conflicts = await prisma.booking.findMany({
    where: { roomId, status: { not: "CANCELLED" } },
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
      guestId: guestId!, // resolved above
      userId: (session.user as any)?.id ?? null, // ensures My bookings shows it
      checkIn,
      checkOut,
      guests,
      totalPrice,
      status: "CONFIRMED",
    },
    select: { id: true },
  });

  return NextResponse.json(created, { status: 201 });
}
