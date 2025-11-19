import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);

// Overlap check
function overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) {
  return aStart < bEnd && bStart < aEnd;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") ?? undefined;
  const guestId = searchParams.get("guestId") ?? undefined;
  const roomId = searchParams.get("roomId") ?? undefined;
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const me = searchParams.get("me") === "1";
  const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1);
  const limit = Math.min(
    Math.max(parseInt(searchParams.get("limit") || "12", 10), 1),
    50
  );
  const offset = (page - 1) * limit;

  const where: any = {};
  if (status) where.status = status;
  if (guestId) where.guestId = guestId;
  if (roomId) where.roomId = roomId;
  if (from) where.checkOut = { gte: new Date(from) };
  if (to) where.checkIn = { lte: new Date(to) };

  if (me) {
    const session = await auth();
    const uid = (session?.user as any)?.id;
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

// POST /api/bookings — create booking AND send confirmation email
export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Parse JSON or FormData
  const tryJson = await req.clone().json().catch(() => null);
  const body = tryJson ?? (await req.formData().catch(() => null));
  const get = (k: string) =>
    body instanceof FormData ? body.get(k) : (body as any)?.[k];

  const roomId = String(get("roomId") || "");
  let guestId = String(get("guestId") || "");
  const checkInStr = String(get("checkIn") || "");
  const checkOutStr = String(get("checkOut") || "");
  const guests = Number(get("guests"));
  const roomsCount = Number(get("roomsCount") ?? 1);
  const extraBed = ["true", "on", "1"].includes(String(get("extraBed")));
  const mealPlan = String(get("mealPlan") || "ROOM_ONLY");

  const role = (session.user as any)?.role ?? "USER";

  // USER auto-bind guest
  if (role === "USER") {
    const email = (session.user as any)?.email;
    const name = (session.user as any)?.name;

    if (!email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let guest = await prisma.guest.findFirst({ where: { email } });
    if (!guest) {
      guest = await prisma.guest.create({
        data: {
          email,
          name: name ?? email.split("@")[0],
          phone: null,
        },
      });
    }
    guestId = guest.id;
  } else {
    if (!guestId) {
      return NextResponse.json(
        { error: "Guest is required" },
        { status: 400 }
      );
    }
  }

  if (!roomId || !checkInStr || !checkOutStr || !guests || !roomsCount) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const checkIn = new Date(checkInStr);
  const checkOut = new Date(checkOutStr);

  if (!(checkIn < checkOut)) {
    return NextResponse.json({ error: "Invalid date range" }, { status: 400 });
  }

  const room = await prisma.room.findUnique({ where: { id: roomId } });

  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }

  if (guests > room.capacity * roomsCount) {
    return NextResponse.json(
      { error: "Guests exceed total capacity" },
      { status: 400 }
    );
  }

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
    Math.ceil((+checkOut - +checkIn) / 86400000)
  );

  let totalPrice = room.price * nights * roomsCount;
  if (extraBed) totalPrice += Math.round(room.price * 0.3) * nights;

  if (mealPlan === "BREAKFAST_INCLUDED") {
    totalPrice += 200 * nights * roomsCount;
  } else if (mealPlan === "HALF_BOARD") {
    totalPrice += 400 * nights * roomsCount;
  } else if (mealPlan === "FULL_BOARD") {
    totalPrice += 600 * nights * roomsCount;
  }

  const userId = (session.user as any)?.id ?? null;

  // ★ CREATE BOOKING
  const created = await prisma.booking.create({
    data: {
      roomId,
      guestId: guestId!,
      userId,
      checkIn,
      checkOut,
      guests,
      totalPrice,
      status: "CONFIRMED",
      roomsCount,
      extraBed,
      mealPlan: mealPlan as any,
    },
    include: {
      guest: true,
      room: true,
    },
  });

  // ★ SEND EMAIL
  if (created.guest.email) {
    try {
      const emailResult: any = await resend.emails.send({
        from: "Acme <onboarding@resend.dev>",
        to: created.guest.email,
        subject: "Your Hotel Booking Confirmation ✔",
        html: `
          <div style="font-family:Arial;padding:20px;">
            <h2>Booking Confirmed</h2>
            <p>Hi <strong>${created.guest.name}</strong>,</p>
            <p>Your hotel booking is confirmed. Here are your details:</p>

            <h3>Booking Info</h3>
            <p>Room: <strong>${created.room.title}</strong></p>
            <p>Check-in: ${created.checkIn.toDateString()}</p>
            <p>Check-out: ${created.checkOut.toDateString()}</p>
            <p>Guests: ${created.guests}</p>
            <p>Total Price: ₹${created.totalPrice}</p>

            <h3>Extras</h3>
            <p>Meal plan: ${created.mealPlan}</p>
            <p>Rooms booked: ${created.roomsCount}</p>
            <p>Extra Bed: ${created.extraBed ? "Yes" : "No"}</p>

            <hr/>
            <p>Thank you for booking with us!</p>
          </div>
        `,
      });

      console.log("EMAIL SENT →", emailResult);
    } catch (err) {
      console.error("EMAIL SEND FAILED →", err);
    }
  }

  return NextResponse.json({ id: created.id }, { status: 201 });
}
