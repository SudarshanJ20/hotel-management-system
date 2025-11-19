import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { bookingId } = await req.json();

    if (!bookingId) {
      return NextResponse.json({ error: "Missing bookingId" }, { status: 400 });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        guest: true,
        room: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (!booking.guest.email) {
      return NextResponse.json(
        { error: "Guest email missing" },
        { status: 400 }
      );
    }

    // If you need to mark the booking as confirmed, keep/update this logic:
    // await prisma.booking.update({
    //   where: { id: bookingId },
    //   data: { status: "CONFIRMED" },
    // });

    // Email sending removed – just respond success
    return NextResponse.json({ message: "Booking processed (no email sent)" });
  } catch (error) {
    console.error("Booking confirm error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
