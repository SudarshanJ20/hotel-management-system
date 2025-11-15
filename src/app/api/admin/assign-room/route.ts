// app/api/admin/assign-room/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BookingStatus } from "@prisma/client";

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const bookingId =
    typeof body?.bookingId === "string" ? body.bookingId : undefined;
  const roomId = typeof body?.roomId === "string" ? body.roomId : undefined;

  if (!bookingId || !roomId) {
    return NextResponse.json(
      { error: "bookingId and roomId are required" },
      { status: 400 }
    );
  }

  // Load booking
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: {
      id: true,
      roomId: true,
      checkIn: true,
      checkOut: true,
      status: true,
    },
  });

  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  // Only allow assigning if booking is PENDING or CONFIRMED
  if (
    booking.status !== BookingStatus.PENDING &&
    booking.status !== BookingStatus.CONFIRMED
  ) {
    return NextResponse.json(
      { error: "Only pending or confirmed bookings can be assigned" },
      { status: 400 }
    );
  }

  // Check room availability for the booking's dates
  const overlapping = await prisma.booking.findFirst({
    where: {
      roomId,
      id: { not: bookingId },
      status: { in: [BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN] },
      checkIn: { lt: booking.checkOut },
      checkOut: { gt: booking.checkIn },
    },
    select: { id: true },
  });

  if (overlapping) {
    return NextResponse.json(
      { error: "Room is not available for the selected dates" },
      { status: 400 }
    );
  }

  const updated = await prisma.booking.update({
    where: { id: bookingId },
    data: {
      roomId,
      status: BookingStatus.CONFIRMED,
    },
    include: {
      room: true,
      guest: true,
    },
  });

  return NextResponse.json({
    id: updated.id,
    status: updated.status,
    room: { id: updated.room?.id, title: updated.room?.title },
    guest: { id: updated.guest.id, name: updated.guest.name },
  });
}
