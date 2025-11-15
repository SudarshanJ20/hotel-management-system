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
  const limit = Math.min(
    Math.max(parseInt(searchParams.get("limit") || "12", 10), 1),
    50
  );
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
    console.log(
      "GET /api/bookings session:",
      JSON.stringify(session, null, 2)
    );
    const uid = (session?.user as any)?.id as string | undefined;
    console.log("GET /api/bookings uid:", uid);

    // If not logged in or id missing, return empty list
    if (!uid) {
      return NextResponse.json({
        items: [],
        total: 0,
        page,
        limit,
        pages: 1,
      });
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
        guest: {
          select: { id: true, name: true, email: true, phone: true },
        },
        room: {
          select: { id: true, title: true, price: true },
        },
      },
    }),
    prisma.booking.count({ where }),
  ]);

  console.log(
    "GET /api/bookings result:",
    JSON.stringify({ total, page, limit }, null, 2)
  );

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
  console.log(
    "POST /api/bookings session:",
    JSON.stringify(session, null, 2)
  );

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Accept JSON or FormData
  const tryJson = await req.clone().json().catch(() => null);
  const body = tryJson ?? (await req.formData().catch(() => null));
  const get = (k: string) =>
    body instanceof FormData ? body.get(k) : (body as any)?.[k];

  const roomId: string | undefined =
    String(get("roomId") || "") || undefined;
  let guestId: string | undefined =
    String(get("guestId") || "") || undefined;
  const checkInStr: string | undefined =
    String(get("checkIn") || "") || undefined;
  const checkOutStr: string | undefined =
    String(get("checkOut") || "") || undefined;
  const guestsVal = get("guests");
  const guests: number | undefined =
    guestsVal != null ? Number(guestsVal) : undefined;

  // NEW FIELDS
  const roomsCountVal = get("roomsCount");
  const roomsCount: number =
    roomsCountVal != null ? Number(roomsCountVal) : 1;

  const extraBedRaw = get("extraBed");
  const extraBed: boolean =
    typeof extraBedRaw === "string"
      ? extraBedRaw === "true" || extraBedRaw === "on" || extraBedRaw === "1"
      : Boolean(extraBedRaw);

  const mealPlanRaw = get("mealPlan");
  const mealPlan: string =
    (typeof mealPlanRaw === "string" && mealPlanRaw) || "ROOM_ONLY";

  const role = ((session.user as any)?.role ?? "USER") as string;

  // Resolve guestId
  if (role === "USER") {
    // Bind to signed-in user's guest record by email
    const email = (session.user as any)?.email as string | undefined;
    const name = (session.user as any)?.name as string | undefined;
    if (!email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const existing = await prisma.guest.findFirst({ where: { email } });
    if (existing) guestId = existing.id;
    else {
      const createdGuest = await prisma.guest.create({
        data: {
          email,
          name: name ?? email.split("@")[0],
          phone: null,
        },
      });
      guestId = createdGuest.id;
    }
  } else {
    // ADMIN or MANAGER must provide a guestId
    if (!guestId) {
      return NextResponse.json(
        { error: "Guest is required" },
        { status: 400 }
      );
    }
  }

  if (
    !roomId ||
    !checkInStr ||
    !checkOutStr ||
    !guests ||
    !roomsCount
  ) {
    return NextResponse.json(
      { error: "Missing fields" },
      { status: 400 }
    );
  }

  if (roomsCount < 1) {
    return NextResponse.json(
      { error: "roomsCount must be at least 1" },
      { status: 400 }
    );
  }

  const checkIn = new Date(checkInStr);
  const checkOut = new Date(checkOutStr);
  if (!(checkIn < checkOut)) {
    return NextResponse.json(
      { error: "Invalid date range" },
      { status: 400 }
    );
  }

  const room = await prisma.room.findUnique({ where: { id: roomId } });
  if (!room) {
    return NextResponse.json(
      { error: "Room not found" },
      { status: 404 }
    );
  }
  if (guests > room.capacity * roomsCount) {
    return NextResponse.json(
      { error: "Guests exceed total capacity for selected rooms" },
      { status: 400 }
    );
  }

  // Availability: ignore CANCELLED, block overlaps
  const conflicts = await prisma.booking.findMany({
    where: { roomId, status: { not: "CANCELLED" } },
    select: { checkIn: true, checkOut: true },
  });
  const hasConflict = conflicts.some((b) =>
    overlaps(checkIn, checkOut, b.checkIn, b.checkOut)
  );
  if (hasConflict) {
    return NextResponse.json(
      { error: "Room not available for these dates" },
      { status: 409 }
    );
  }

  const nights = Math.max(
    1,
    Math.ceil((+checkOut - +checkIn) / (1000 * 60 * 60 * 24))
  );

  // Base: room price * nights * number of rooms
  let totalPrice = room.price * nights * roomsCount;

  // Add simple extra‑bed charge (e.g. 30% of one room per night if extraBed is true)
  if (extraBed) {
    const extraPerNight = Math.round(room.price * 0.3);
    totalPrice += extraPerNight * nights;
  }

  // Adjust price based on meal plan
  // (You can tweak these multipliers later)
  if (mealPlan === "BREAKFAST_INCLUDED") {
    totalPrice += 200 * nights * roomsCount; // example flat add-on
  } else if (mealPlan === "HALF_BOARD") {
    totalPrice += 400 * nights * roomsCount;
  } else if (mealPlan === "FULL_BOARD") {
    totalPrice += 600 * nights * roomsCount;
  }

  const userId = (session.user as any)?.id
    ? String((session.user as any).id)
    : null;
  console.log("POST /api/bookings using userId:", userId);

  const created = await prisma.booking.create({
    data: {
      roomId,
      guestId: guestId!, // resolved above
      userId, // tie booking to current app user
      checkIn,
      checkOut,
      guests,
      totalPrice,
      status: "CONFIRMED",
      roomsCount,
      extraBed,
      mealPlan: mealPlan as any,
    },
    select: { id: true },
  });

  console.log("POST /api/bookings created:", created);

  return NextResponse.json(created, { status: 201 });
}
