import Link from "next/link";

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 animate-gradient z-0" />
      <div className="absolute inset-0 bg-black/55 z-0" />
      <div className="absolute inset-0 bg-grid z-0" />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-7xl px-6 py-12 space-y-8">
        {/* Hero */}
        <header>
          <h1 className="text-2xl font-semibold">Hotel Management System</h1>
          <p className="text-white/70 mt-2">
            Operate rooms, bookings, guests, and reports from a unified dashboard.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/admin/dashboard"
              className="rounded-lg px-4 py-2 text-sm bg-gradient-to-r from-indigo-600 via-sky-600 to-cyan-500 text-white"
            >
              Open Dashboard
            </Link>
            <Link
              href="/bookings"
              className="rounded-lg px-4 py-2 text-sm border border-white/15 bg-white/5 text-white hover:bg-white/10"
            >
              View Bookings
            </Link>
            <Link
              href="/rooms"
              className="rounded-lg px-4 py-2 text-sm border border-white/15 bg-white/5 text-white hover:bg-white/10"
            >
              Browse Rooms
            </Link>
          </div>
        </header>

        {/* Stats */}
        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="rounded-xl border border-white/10 bg-slate-900/50 p-5">
            <div className="text-white/70 text-sm">Occupancy</div>
            <div className="text-2xl font-semibold mt-1">70%</div>
            <div className="text-xs text-white/60 mt-1">84 / 120 rooms</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-slate-900/50 p-5">
            <div className="text-white/70 text-sm">Rooms Available</div>
            <div className="text-2xl font-semibold mt-1">36</div>
            <div className="text-xs text-white/60 mt-1">Includes 6 suites</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-slate-900/50 p-5">
            <div className="text-white/70 text-sm">Guests In-house</div>
            <div className="text-2xl font-semibold mt-1">156</div>
            <div className="text-xs text-white/60 mt-1">Arrivals included</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-slate-900/50 p-5">
            <div className="text-white/70 text-sm">Est. Revenue</div>
            <div className="text-2xl font-semibold mt-1">₹4.2L</div>
            <div className="text-xs text-white/60 mt-1">Today</div>
          </div>
        </section>

        {/* Recent activity */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">Recent Activity</h2>
            <Link href="/bookings" className="text-sm text-cyan-300 hover:underline">
              View all
            </Link>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <div className="rounded-xl border border-white/10 bg-slate-900/50 p-4 flex items-center justify-between">
              <div>
                <div className="font-medium">Check-in • Ananya Rao</div>
                <div className="text-sm text-white/70">Room 302 • 11:00 AM</div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs border bg-emerald-500/15 text-emerald-300 border-emerald-400/20">
                confirmed
              </span>
            </div>
            <div className="rounded-xl border border-white/10 bg-slate-900/50 p-4 flex items-center justify-between">
              <div>
                <div className="font-medium">Booking • Vikram Shah</div>
                <div className="text-sm text-white/70">Oct 20–22 • 1 guest</div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs border bg-amber-500/15 text-amber-300 border-amber-400/20">
                pending
              </span>
            </div>
            <div className="rounded-xl border border-white/10 bg-slate-900/50 p-4 flex items-center justify-between">
              <div>
                <div className="font-medium">Check-out • Rahul S.</div>
                <div className="text-sm text-white/70">Room 518 • 10:00 AM</div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs border bg-sky-500/15 text-sky-300 border-sky-400/20">
                complete
              </span>
            </div>
          </div>
        </section>

        {/* Announcements */}
        <section>
          <div className="rounded-xl border border-white/10 bg-slate-900/50 p-6">
            <div className="font-medium">Announcements</div>
            <p className="text-white/70 text-sm mt-1">
              Pool maintenance on Oct 18, 2–5 PM. Housekeeping staffing update posted in Reports.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
