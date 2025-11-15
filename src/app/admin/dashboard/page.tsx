// app/admin/dashboard/page.tsx
import { auth } from "@/lib/auth";
import Link from "next/link";
import OnceParamClear from "@/components/OnceParamClear";
import AccountSummary from "@/components/dashboard/AccountSummary";
import { prisma } from "@/lib/prisma";
import { startOfDay, endOfDay, startOfMonth, subDays } from "date-fns";

// Banner for one-time welcome via ?welcome=1
function WelcomeBanner({ welcome }: { welcome: boolean }) {
  if (!welcome) return null;
  return (
    <div className="rounded-2xl border border-emerald-600/40 bg-emerald-500/15 text-emerald-200 px-4 py-3 text-sm">
      Signed in successfully. Welcome back!
    </div>
  );
}

// Banner to nudge profile completion
function ProfileNudge({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <div className="rounded-2xl border border-amber-600/40 bg-amber-500/15 text-amber-100 px-4 py-3 text-sm">
      Complete your profile to personalize your experience.{" "}
      <Link
        href="/profile"
        className="underline underline-offset-2 hover:text-amber-50"
        aria-label="Go to Profile page"
      >
        Go to Profile
      </Link>
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5 shadow-sm hover:border-white/20 transition">
      <div className="text-xs font-medium uppercase tracking-wide text-white/50">
        {label}
      </div>
      <div className="mt-2 text-3xl font-semibold text-white">{value}</div>
      {hint && (
        <div className="mt-2 text-xs text-white/60">
          {hint}
        </div>
      )}
    </div>
  );
}

function CheckItem({
  name,
  room,
  date,
  time,
  type,
}: {
  name: string;
  room: string;
  date: string;
  time: string;
  type: "in" | "out";
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 flex items-center justify-between hover:border-white/20 transition">
      <div>
        <div className="font-medium text-white">{name}</div>
        <div className="text-xs text-white/70 mt-0.5">
          {type === "in" ? "Check-in" : "Check-out"} • {room}
        </div>
        <div className="text-[11px] text-white/60 mt-0.5">{date}</div>
      </div>
      <div className="text-sm text-white/70">{time}</div>
    </div>
  );
}

function EmptyState({
  title,
  ctaHref,
  ctaText,
}: {
  title: string;
  ctaHref: string;
  ctaText: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-6 text-center">
      <div className="text-sm text-white/70 mb-2">{title}</div>
      <Link
        href={ctaHref}
        className="text-xs font-medium underline underline-offset-2 hover:text-white"
        aria-label={ctaText}
      >
        {ctaText}
      </Link>
    </div>
  );
}

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function AdminDashboardPage({ searchParams }: PageProps) {
  const session = await auth();
  const sp = await searchParams;
  const welcome = sp?.welcome === "1";

  const name = session?.user?.name ?? session?.user?.email ?? "Guest";
  const role = (session?.user as any)?.role ?? "USER";
  const missingProfile = !session?.user?.name || !session?.user?.image;

  // --- Real metrics ---
  const today = new Date();
  const todayStart = startOfDay(today);
  const todayEnd = endOfDay(today);

  // Total rooms
  const totalRooms = await prisma.room.count();

  // Booked rooms overlapping today (confirmed or checked-in)
  const activeBookings = await prisma.booking.findMany({
    where: {
      status: { in: ["CONFIRMED", "CHECKED_IN"] },
      checkIn: { lte: todayEnd },
      checkOut: { gt: todayStart }, // stays that include today
    },
    select: { roomId: true },
  });

  const bookedRoomIds = Array.from(new Set(activeBookings.map((b) => b.roomId)));
  const bookedRoomsCount = bookedRoomIds.length;

  const occupancy =
    totalRooms > 0 ? Math.round((bookedRoomsCount / totalRooms) * 100) : 0;

  // Guests today: arrivals today + in-house
  const arrivalsToday = await prisma.booking.count({
    where: {
      status: { in: ["CONFIRMED", "CHECKED_IN"] },
      checkIn: { gte: todayStart, lte: todayEnd },
    },
  });

  const inHouseToday = await prisma.booking.count({
    where: {
      status: { in: ["CONFIRMED", "CHECKED_IN"] },
      checkIn: { lt: todayStart },
      checkOut: { gt: todayStart },
    },
  });

  const guestsToday = arrivalsToday + inHouseToday;

  // Revenue this month (est.)
  const monthStart = startOfMonth(today);
  const revenueThisMonthAgg = await prisma.booking.aggregate({
    _sum: {
      totalPrice: true,
    },
    where: {
      status: { in: ["CONFIRMED", "CHECKED_IN"] },
      createdAt: { gte: monthStart, lte: todayEnd },
    },
  });
  const revenueThisMonth = revenueThisMonthAgg._sum.totalPrice ?? 0;

  const formatINR = (value: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);

  // --- Occupancy trend: last 7 days ---
  const days: { label: string; occupancy: number }[] = [];

  for (let i = 6; i >= 0; i--) {
    const day = subDays(today, i);
    const dayStart = startOfDay(day);
    const dayEnd = endOfDay(day);

    const dayActiveBookings = await prisma.booking.findMany({
      where: {
        status: { in: ["CONFIRMED", "CHECKED_IN"] },
        checkIn: { lte: dayEnd },
        checkOut: { gt: dayStart },
      },
      select: { roomId: true },
    });

    const dayBookedRoomIds = Array.from(
      new Set(dayActiveBookings.map((b) => b.roomId))
    );
    const dayBookedRoomsCount = dayBookedRoomIds.length;

    const dayOccupancy =
      totalRooms > 0
        ? Math.round((dayBookedRoomsCount / totalRooms) * 100)
        : 0;

    const label = new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
    }).format(day);

    days.push({ label, occupancy: dayOccupancy });
  }

  // Upcoming check-ins & check-outs
  const upcomingCheckInsRaw = await prisma.booking.findMany({
    where: {
      status: { in: ["CONFIRMED", "CHECKED_IN"] },
      checkIn: { gte: todayStart },
    },
    orderBy: { checkIn: "asc" },
    take: 3,
    include: {
      guest: true,
      room: true,
    },
  });

  const upcomingCheckOutsRaw = await prisma.booking.findMany({
    where: {
      status: { in: ["CONFIRMED", "CHECKED_IN"] },
      checkOut: { gte: todayStart },
    },
    orderBy: { checkOut: "asc" },
    take: 3,
    include: {
      guest: true,
      room: true,
    },
  });

  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);

  const CHECK_IN_TIME = "11:00 am";
  const CHECK_OUT_TIME = "10:00 pm";

  const upcomingCheckIns = upcomingCheckInsRaw.map((b) => ({
    id: b.id,
    name: b.guest.name,
    room: b.room.title,
    date: formatDate(b.checkIn),
    time: CHECK_IN_TIME,
  }));

  const upcomingCheckOuts = upcomingCheckOutsRaw.map((b) => ({
    id: b.id,
    name: b.guest.name,
    room: b.room.title,
    date: formatDate(b.checkOut),
    time: CHECK_OUT_TIME,
  }));

  return (
    <div className="space-y-6">
      {/* One-time banner via ?welcome=1 and auto-clear */}
      <WelcomeBanner welcome={!!welcome} />
      <OnceParamClear keyName="welcome" />

      {/* Profile nudge */}
      <ProfileNudge show={missingProfile} />

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
          <li className="text-white/90">Dashboard</li>
        </ol>
      </nav>

      {/* Greeting + role badge */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-white">
            Welcome, {name}
          </h1>
          <p className="text-sm text-white/70 mt-1">
            Today’s overview of rooms, bookings, and guests.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 text-xs rounded-full bg-slate-900/70 border border-white/10 text-white/70">
            Role: <span className="font-semibold text-white"> {role}</span>
          </span>
          {role === "ADMIN" && (
            <span className="px-3 py-1.5 text-xs rounded-full bg-emerald-600/20 text-emerald-300 border border-emerald-600/40">
              Admin access
            </span>
          )}
        </div>
      </div>

      {/* Account summary */}
      <AccountSummary user={session?.user as any} />

      {/* Stats */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Total rooms"
          value={String(totalRooms)}
        />
        <StatCard
          label="Booked"
          value={String(bookedRoomsCount)}
          hint={`${occupancy}% occupancy`}
        />
        <StatCard
          label="Guests today"
          value={String(guestsToday)}
          hint="Arrivals + in-house"
        />
        <StatCard
          label="Revenue (est.)"
          value={formatINR(revenueThisMonth)}
          hint="This month · confirmed + in-house"
        />
      </section>

      {/* Quick actions */}
      <section className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 flex flex-wrap gap-3">
        <Link
          href="/admin/bookings/new"
          aria-label="Create a new booking"
          className={`rounded-full px-4 py-2 text-sm font-medium ${
            role === "ADMIN"
              ? "bg-gradient-to-r from-indigo-600 via-sky-600 to-cyan-500 text-white shadow-sm"
              : "bg-gray-700/60 text-white/60 pointer-events-none"
          }`}
          aria-disabled={role !== "ADMIN"}
          tabIndex={role !== "ADMIN" ? -1 : undefined}
        >
          New booking
        </Link>
        <Link
          href="/admin/rooms/assign"
          aria-label="Assign a room"
          className={`rounded-full px-4 py-2 text-sm font-medium border ${
            role === "ADMIN"
              ? "border-white/15 bg-white/5 text-white hover:bg-white/10"
              : "border-white/10 bg-gray-800/60 text-white/60 pointer-events-none"
          }`}
          aria-disabled={role !== "ADMIN"}
          tabIndex={role !== "ADMIN" ? -1 : undefined}
        >
          Assign room
        </Link>
        <Link
          href="/admin/reports"
          aria-label="View reports"
          className="rounded-full px-4 py-2 text-sm font-medium border border-white/15 bg-white/5 text-white hover:bg-white/10"
        >
          View reports
        </Link>
      </section>

      {/* Occupancy trend (last 7 days) */}
      <section className="rounded-2xl border border-white/10 bg-slate-950/60 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm font-medium text-white/90">
            Occupancy trend (last 7 days)
          </div>
          <span className="text-[11px] uppercase tracking-wide text-white/40">
            Rooms occupied per day
          </span>
        </div>

        {days.length === 0 ? (
          <div className="h-40 rounded-xl bg-white/[0.03] border border-white/10 flex flex-col items-center justify-center text-white/60 gap-2">
            <div>No data yet.</div>
            <Link
              href="/admin/bookings/new"
              aria-label="Create a booking to see trends"
              className="text-xs font-medium underline underline-offset-2 hover:text-white/80"
            >
              Create a booking to see trends
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {days.map((d) => (
              <div
                key={d.label}
                className="flex items-center gap-3 text-xs text-white/70"
              >
                <span className="w-14">{d.label}</span>
                <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-indigo-500"
                    style={{ width: `${d.occupancy}%` }}
                  />
                </div>
                <span className="w-10 text-right">{d.occupancy}%</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Upcoming check-ins/outs */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">
              Upcoming check-ins
            </h2>
            <span className="text-xs text-white/50">
              Next few guests arriving
            </span>
          </div>
          {upcomingCheckIns.length === 0 ? (
            <EmptyState
              title="No check-ins scheduled."
              ctaHref="/admin/bookings/new"
              ctaText="Create a booking"
            />
          ) : (
            <>
              {upcomingCheckIns.map((x) => (
                <CheckItem
                  key={x.id}
                  name={x.name}
                  room={x.room}
                  date={x.date}
                  time={x.time}
                  type="in"
                />
              ))}
              <div className="text-right">
                <Link
                  href="/bookings"
                  className="text-xs font-medium text-white/70 hover:text-white"
                  aria-label="View all bookings"
                >
                  View all
                </Link>
              </div>
            </>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">
              Upcoming check-outs
            </h2>
            <span className="text-xs text-white/50">
              Guests scheduled to leave
            </span>
          </div>
          {upcomingCheckOuts.length === 0 ? (
            <EmptyState
              title="No check-outs scheduled."
              ctaHref="/admin/bookings/new"
              ctaText="Create a booking"
            />
          ) : (
            <>
              {upcomingCheckOuts.map((x) => (
                <CheckItem
                  key={x.id}
                  name={x.name}
                  room={x.room}
                  date={x.date}
                  time={x.time}
                  type="out"
                />
              ))}
              <div className="text-right">
                <Link
                  href="/bookings"
                  className="text-xs font-medium text-white/70 hover:text-white"
                  aria-label="View all bookings"
                >
                  View all
                </Link>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
