// src/app/api/bookings/[id]/cancel/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth/config";
import { prisma } from "@/lib/prisma";

export async function POST(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = ((session.user as any)?.role ?? "USER") as string;
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      guest: { select: { email: true, name: true } },
      room: { select: { title: true } },
    },
  });
  if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const now = new Date();
  const isFuture = booking.checkIn > now;

  // 24-hour cancellation policy
  const ms24h = 24 * 60 * 60 * 1000;
  const within24h = +booking.checkIn - +now < ms24h;

  const isPrivileged = role === "ADMIN" || role === "MANAGER";
  const isOwner = booking.userId && (session.user as any)?.id === booking.userId;

  if (!isPrivileged) {
    // USER rules
    if (!isOwner) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (!isFuture) {
      return NextResponse.json({ error: "Cannot cancel past/ongoing booking" }, { status: 400 });
    }
    if (booking.status !== "CONFIRMED") {
      return NextResponse.json({ error: "Only confirmed bookings can be cancelled" }, { status: 400 });
    }
    if (within24h) {
      return NextResponse.json({ error: "Cannot cancel within 24 hours of check-in" }, { status: 400 });
    }
  }
  // If you also want to restrict staff within 24h, uncomment:
  // else if (within24h) {
  //   return NextResponse.json({ error: "Policy: no cancel within 24 hours" }, { status: 400 });
  // }

  const updated = await prisma.booking.update({
    where: { id: booking.id },
    data: { status: "CANCELLED" },
    include: {
      guest: { select: { email: true, name: true } },
      room: { select: { title: true } },
    },
  });

  // TODO: trigger email notification
  // import { sendMail, bookingCancelledHtml } from "@/lib/mailer";
  // if (updated.guest?.email) {
  //   sendMail({
  //     to: updated.guest.email,
  //     subject: "Your booking has been cancelled",
  //     html: bookingCancelledHtml(updated),
  //   }).catch(() => {});
  // }

  return NextResponse.json(updated);
}
