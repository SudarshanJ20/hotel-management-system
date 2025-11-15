// app/admin/rooms/assign/page.tsx
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { BookingStatus } from "@prisma/client";
import AssignRoomClient from "@/components/admin/AssignRoomClient";

export const metadata = {
  title: "Assign room | Admin",
};

export default async function AssignRoomPage() {
  const session = await auth();

  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return (
      <div className="max-w-3xl mx-auto mt-10 text-center text-red-300">
        You must be an admin to access this page.
      </div>
    );
  }

  // Bookings that still need confirmation (PENDING), ordered by check-in
  const bookingsNeedingRoom = await prisma.booking.findMany({
    where: {
      status: BookingStatus.PENDING,
      // roomId filter removed because roomId is non-nullable in schema
    },
    orderBy: { checkIn: "asc" },
    include: {
      guest: true,
    },
  });

  // All rooms
  const rooms = await prisma.room.findMany({
    orderBy: { title: "asc" },
  });

  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);

  const formatTime = (date: Date) =>
    new Intl.DateTimeFormat("en-IN", {
      hour: "numeric",
      minute: "2-digit",
    }).format(date);

  const initialData = bookingsNeedingRoom.map((b) => ({
    id: b.id,
    guestName: b.guest.name,
    checkIn: formatDate(b.checkIn),
    checkOut: formatDate(b.checkOut),
    checkInTime: formatTime(b.checkIn),
    checkOutTime: formatTime(b.checkOut),
    nights: Math.max(
      1,
      Math.round(
        (b.checkOut.getTime() - b.checkIn.getTime()) / (1000 * 60 * 60 * 24)
      )
    ),
  }));

  const roomsData = rooms.map((r) => ({
    id: r.id,
    title: r.title,
  }));

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="text-xs font-medium text-white/60"
      >
        <ol className="flex items-center gap-2">
          <li>
            <Link
              href="/admin"
              className="hover:text-white/90"
              aria-label="Admin home"
            >
              Admin
            </Link>
          </li>
          <li aria-hidden="true">›</li>
          <li>
            <Link
              href="/admin/dashboard"
              className="hover:text-white/90"
              aria-label="Dashboard"
            >
              Dashboard
            </Link>
          </li>
          <li aria-hidden="true">›</li>
          <li className="text-white/90">Assign room</li>
        </ol>
      </nav>

      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-white">Assign room</h1>
          <p className="text-sm text-white/70 mt-1">
            Allocate rooms to pending bookings and confirm their stay.
          </p>
        </div>
        <Link
          href="/admin/dashboard"
          className="text-xs font-medium text-white/70 hover:text-white underline underline-offset-2"
        >
          Back to dashboard
        </Link>
      </div>

      {initialData.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-6 text-center text-sm text-white/70">
          No pending bookings need room assignment right now.
          <div className="mt-2">
            <Link
              href="/admin/bookings/new"
              className="text-xs font-medium underline underline-offset-2 hover:text-white"
            >
              Create a new booking
            </Link>
          </div>
        </div>
      ) : (
        <AssignRoomClient bookings={initialData} rooms={roomsData} />
      )}
    </div>
  );
}
