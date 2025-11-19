import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);

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

    const checkIn = booking.checkIn.toDateString();
    const checkOut = booking.checkOut.toDateString();

    await resend.emails.send({
      from: "Acme <onboarding@resend.dev>",
      to: booking.guest.email,
      subject: "Your Hotel Booking Confirmation",
      html: `
        <div style="font-family:Arial;padding:20px;">
          <h2>Booking Confirmed ✔</h2>

          <p>Hello <strong>${booking.guest.name ?? "Guest"}</strong>,</p>
          <p>Your hotel booking has been successfully confirmed.</p>

          <h3>Booking Details</h3>
          <p><strong>Room:</strong> ${booking.room.title}</p>
          <p><strong>Check-In:</strong> ${checkIn}</p>
          <p><strong>Check-Out:</strong> ${checkOut}</p>
          <p><strong>Total Price:</strong> ₹${booking.totalPrice}</p>
          <p><strong>Guests:</strong> ${booking.guests}</p>

          <h3>Extras</h3>
          <p><strong>Rooms Count:</strong> ${booking.roomsCount}</p>
          <p><strong>Meal Plan:</strong> ${booking.mealPlan}</p>
          <p><strong>Extra Bed:</strong> ${booking.extraBed ? "Yes" : "No"}</p>

          <hr style="margin:20px 0">

          <p>Thank you for choosing our hotel!</p>
        </div>
      `,
    });

    return NextResponse.json({ message: "Email sent" });
  } catch (error) {
    console.error("Booking email error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
