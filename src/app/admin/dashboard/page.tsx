// app/admin/dashboard/page.tsx
import { auth } from "@/lib/auth";
import Link from "next/link";
import OnceParamClear from "@/components/OnceParamClear";
import AccountSummary from "@/components/dashboard/AccountSummary";

// Banner for one-time welcome via ?welcome=1
function WelcomeBanner({ welcome }: { welcome: boolean }) {
  if (!welcome) return null;
  return (
    <div className="rounded-lg border border-emerald-700/40 bg-emerald-600/15 text-emerald-200 px-4 py-3">
      Signed in successfully. Welcome back!
    </div>
  );
}

// Banner to nudge profile completion
function ProfileNudge({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <div className="rounded-lg border border-amber-700/40 bg-amber-600/15 text-amber-200 px-4 py-3">
      Complete your profile to personalize your experience.{" "}
      <Link href="/profile" className="underline underline-offset-2 hover:text-amber-100" aria-label="Go to Profile page">
        Go to Profile
      </Link>
    </div>
  );
}

function StatCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-slate-900/50 p-5">
      <div className="text-white/70 text-sm">{label}</div>
      <div className="text-2xl font-semibold mt-1">{value}</div>
      {hint && <div className="text-xs text-white/60 mt-1">{hint}</div>}
    </div>
  );
}

function CheckItem({ name, room, time, type }: { name: string; room: string; time: string; type: "in" | "out" }) {
  return (
    <div className="rounded-xl border border-white/10 bg-slate-900/50 p-4 flex items-center justify-between">
      <div>
        <div className="font-medium">{name}</div>
        <div className="text-sm text-white/70">
          {type === "in" ? "Check-in" : "Check-out"} • {room}
        </div>
      </div>
      <div className="text-sm text-white/70">{time}</div>
    </div>
  );
}

function EmptyState({ title, ctaHref, ctaText }: { title: string; ctaHref: string; ctaText: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.03] p-6 text-center">
      <div className="text-white/70 mb-2">{title}</div>
      <Link href={ctaHref} className="text-sm underline underline-offset-2 hover:text-white" aria-label={ctaText}>
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

  // Example arrays to enable empty-state logic
  const upcomingCheckIns: Array<{ name: string; room: string; time: string }> = [
    { name: "Ananya Rao", room: "Room 302", time: "11:00 AM" },
    { name: "Vikram Shah", room: "Room 415", time: "12:30 PM" },
    { name: "Meera N.", room: "Room 221", time: "1:15 PM" },
  ];
  const upcomingCheckOuts: Array<{ name: string; room: string; time: string }> = [
    { name: "Rahul S.", room: "Room 518", time: "10:00 AM" },
    { name: "Neha K.", room: "Room 207", time: "10:30 PM" },
    { name: "Arjun P.", room: "Room 116", time: "11:00 AM" },
  ];

  return (
    <div className="space-y-6">
      {/* One-time banner via ?welcome=1 and auto-clear */}
      <WelcomeBanner welcome={!!welcome} />
      <OnceParamClear keyName="welcome" />

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="text-sm text-white/70">
        <ol className="flex items-center gap-2">
          <li><Link href="/admin" className="hover:text-white" aria-label="Admin home">Admin</Link></li>
          <li aria-hidden="true">›</li>
          <li className="text-white">Dashboard</li>
        </ol>
      </nav>

      {/* Greeting + role badge */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Welcome, {name}</h1>
          <p className="text-white/70 mt-1">Today’s overview of rooms, bookings, and guests.</p>
        </div>
        {role === "ADMIN" && (
          <span className="px-2 py-1 text-xs rounded-full bg-emerald-600/20 text-emerald-300 border border-emerald-600/40">
            Admin
          </span>
        )}
      </div>

      {/* Account summary card (replaces raw JSON) */}
      <AccountSummary user={session?.user as any} />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total Rooms" value="120" hint="20 suites, 100 standard" />
        <StatCard label="Booked" value="84" hint="70% occupancy" />
        <StatCard label="Guests Today" value="156" hint="Arrivals + in-house" />
        <StatCard label="Revenue (est.)" value="₹4.2L" hint="Incl. taxes" />
      </div>

      {/* Quick actions (role-aware) */}
      <div className="rounded-xl border border-white/10 bg-slate-900/50 p-4 flex flex-wrap gap-3">
        <Link
          href="/admin/bookings/new"
          aria-label="Create a new booking"
          className={`rounded-lg px-4 py-2 text-sm ${
            role === "ADMIN"
              ? "bg-gradient-to-r from-indigo-600 via-sky-600 to-cyan-500 text-white"
              : "bg-gray-700/60 text-white/60 pointer-events-none"
          }`}
          aria-disabled={role !== "ADMIN"}
          tabIndex={role !== "ADMIN" ? -1 : undefined}
        >
          New Booking
        </Link>
        <Link
          href="/admin/rooms/assign"
          aria-label="Assign a room"
          className={`rounded-lg px-4 py-2 text-sm border ${
            role === "ADMIN"
              ? "border-white/15 bg-white/5 text-white hover:bg-white/10"
              : "border-white/10 bg-gray-800/60 text-white/60 pointer-events-none"
          }`}
          aria-disabled={role !== "ADMIN"}
          tabIndex={role !== "ADMIN" ? -1 : undefined}
        >
          Assign Room
        </Link>
        <Link
          href="/admin/reports"
          aria-label="View reports"
          className="rounded-lg px-4 py-2 text-sm border border-white/15 bg-white/5 text-white hover:bg-white/10"
        >
          View Reports
        </Link>
      </div>

      {/* Chart placeholder with empty-state CTA */}
      <div className="rounded-xl border border-white/10 bg-slate-900/50 p-6">
        <div className="text-white/80">Occupancy trend (last 7 days)</div>
        <div className="mt-3 h-48 rounded-lg bg-white/[0.04] border border-white/10 flex flex-col items-center justify-center text-white/60 gap-2">
          <div>No data yet.</div>
          <Link
            href="/admin/bookings/new"
            aria-label="Create a booking to see trends"
            className="text-sm underline underline-offset-2 hover:text-white/80"
          >
            Create a booking to see trends
          </Link>
        </div>
      </div>

      {/* Upcoming check-ins/outs with empty states */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-3">
          <h2 className="text-lg font-medium">Upcoming Check-ins</h2>
          {upcomingCheckIns.length === 0 ? (
            <EmptyState title="No check-ins scheduled." ctaHref="/admin/bookings/new" ctaText="Create a booking" />
          ) : (
            <>
              {upcomingCheckIns.map((x) => (
                <CheckItem key={`${x.name}-${x.room}-${x.time}`} name={x.name} room={x.room} time={x.time} type="in" />
              ))}
              <div className="text-right">
                <Link href="/admin/bookings" className="text-sm text-white/70 hover:text-white" aria-label="View all bookings">
                  View all
                </Link>
              </div>
            </>
          )}
        </div>
        <div className="space-y-3">
          <h2 className="text-lg font-medium">Upcoming Check-outs</h2>
          {upcomingCheckOuts.length === 0 ? (
            <EmptyState title="No check-outs scheduled." ctaHref="/admin/bookings/new" ctaText="Create a booking" />
          ) : (
            <>
              {upcomingCheckOuts.map((x) => (
                <CheckItem key={`${x.name}-${x.room}-${x.time}`} name={x.name} room={x.room} time={x.time} type="out" />
              ))}
              <div className="text-right">
                <Link href="/admin/bookings" className="text-sm text-white/70 hover:text-white" aria-label="View all bookings">
                  View all
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
