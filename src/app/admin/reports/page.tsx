// app/admin/reports/page.tsx
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { BookingStatus } from "@prisma/client";
import { startOfMonth, endOfMonth } from "date-fns";

export const metadata = {
  title: "Reports | Admin",
};

const formatINR = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

const formatDate = (date: Date) =>
  new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);

export default async function ReportsPage() {
  const session = await auth();

  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return (
      <div className="max-w-3xl mx-auto mt-10 text-center text-red-300">
        You must be an admin to access this page.
      </div>
    );
  }

  const today = new Date();
  const from = startOfMonth(today);
  const to = endOfMonth(today);

  // All bookings this month
  const bookings = await prisma.booking.findMany({
    where: {
      createdAt: {
        gte: from,
        lte: to,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      room: true,
      guest: true,
    },
  });

  const totalBookings = bookings.length;
  const totalRevenue =
    bookings.reduce((sum, b) => sum + (b.totalPrice ?? 0), 0) ?? 0;

  const totalNights = bookings.reduce((sum, b) => {
    const nights = Math.max(
      1,
      Math.round(
        (b.checkOut.getTime() - b.checkIn.getTime()) / (1000 * 60 * 60 * 24)
      )
    );
    return sum + nights;
  }, 0);
  const avgNights = totalBookings > 0 ? totalNights / totalBookings : 0;

  const confirmedCount = bookings.filter(
    (b) =>
      b.status === BookingStatus.CONFIRMED ||
      b.status === BookingStatus.CHECKED_IN ||
      b.status === BookingStatus.CHECKED_OUT
  ).length;
  const cancelledCount = bookings.filter(
    (b) => b.status === BookingStatus.CANCELLED
  ).length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
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
          <li className="text-white/90">Reports</li>
        </ol>
      </nav>

      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-white">Reports</h1>
          <p className="text-sm text-white/70 mt-1">
            Monthly overview of bookings and revenue.
          </p>
          <p className="text-xs text-white/50 mt-1">
            Period: {formatDate(from)} – {formatDate(to)}
          </p>
        </div>
        <Link
          href="/admin/dashboard"
          className="text-xs font-medium text-white/70 hover:text-white underline underline-offset-2"
        >
          Back to dashboard
        </Link>
      </div>

      {/* KPI cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
          <div className="text-xs uppercase tracking-wide text-white/50">
            Total bookings
          </div>
          <div className="mt-2 text-2xl font-semibold text-white">
            {totalBookings}
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
          <div className="text-xs uppercase tracking-wide text-white/50">
            Revenue (this month)
          </div>
          <div className="mt-2 text-2xl font-semibold text-white">
            {formatINR(totalRevenue)}
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
          <div className="text-xs uppercase tracking-wide text-white/50">
            Avg. nights per booking
          </div>
          <div className="mt-2 text-2xl font-semibold text-white">
            {avgNights.toFixed(1)}
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
          <div className="text-xs uppercase tracking-wide text-white/50">
            Status
          </div>
          <div className="mt-2 text-sm text-white/80 space-y-1">
            <div>
              <span className="inline-block w-20 text-white/60">
                Active:
              </span>
              <span className="font-semibold text-white">
                {confirmedCount}
              </span>
            </div>
            <div>
              <span className="inline-block w-20 text-white/60">
                Cancelled:
              </span>
              <span className="font-semibold text-white">
                {cancelledCount}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Bookings table */}
      <section className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-medium text-white/90">
            Bookings this month
          </div>
          <div className="text-[11px] text-white/50">
            {totalBookings === 0
              ? "No bookings for this period."
              : `${totalBookings} booking${totalBookings === 1 ? "" : "s"}`}
          </div>
        </div>

        {totalBookings === 0 ? (
          <div className="h-32 flex items-center justify-center text-sm text-white/60">
            No bookings found for this period.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs text-left text-white/80">
              <thead>
                <tr className="border-b border-white/10 text-[11px] uppercase tracking-wide text-white/50">
                  <th className="py-2 pr-4">Date</th>
                  <th className="py-2 pr-4">Guest</th>
                  <th className="py-2 pr-4">Room</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr
                    key={b.id}
                    className="border-b border-white/5 last:border-none"
                  >
                    <td className="py-2 pr-4 align-top">
                      <div>{formatDate(b.checkIn)}</div>
                      <div className="text-[11px] text-white/50">
                        {formatDate(b.checkOut)}
                      </div>
                    </td>
                    <td className="py-2 pr-4 align-top">
                      <div>{b.guest?.name ?? "—"}</div>
                      <div className="text-[11px] text-white/50">
                        {b.guest?.email ?? ""}
                      </div>
                    </td>
                    <td className="py-2 pr-4 align-top">
                      {b.room?.title ?? "—"}
                    </td>
                    <td className="py-2 pr-4 align-top">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border border-white/10 bg-white/5">
                        {b.status}
                      </span>
                    </td>
                    <td className="py-2 pr-4 align-top text-right">
                      {formatINR(b.totalPrice)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
