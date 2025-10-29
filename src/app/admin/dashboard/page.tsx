import Link from "next/link";

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

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <p className="text-white/70 mt-1">Today’s overview of rooms, bookings, and guests.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total Rooms" value="120" hint="20 suites, 100 standard" />
        <StatCard label="Booked" value="84" hint="70% occupancy" />
        <StatCard label="Guests Today" value="156" hint="Arrivals + in-house" />
        <StatCard label="Revenue (est.)" value="₹4.2L" hint="Incl. taxes" />
      </div>

      {/* Quick actions */}
      <div className="rounded-xl border border-white/10 bg-slate-900/50 p-4 flex flex-wrap gap-3">
        <Link
          href="/bookings/new"
          className="rounded-lg px-4 py-2 text-sm bg-gradient-to-r from-indigo-600 via-sky-600 to-cyan-500 text-white"
        >
          New Booking
        </Link>
        <Link
          href="/rooms"
          className="rounded-lg px-4 py-2 text-sm border border-white/15 bg-white/5 text-white hover:bg-white/10"
        >
          Assign Room
        </Link>
        <Link
          href="/reports"
          className="rounded-lg px-4 py-2 text-sm border border-white/15 bg-white/5 text-white hover:bg-white/10"
        >
          View Reports
        </Link>
      </div>

      {/* Chart placeholder */}
      <div className="rounded-xl border border-white/10 bg-slate-900/50 p-6">
        <div className="text-white/80">Occupancy trend (last 7 days)</div>
        <div className="mt-3 h-48 rounded-lg bg-white/[0.04] border border-white/10 flex items-center justify-center text-white/60">
          Chart coming soon
        </div>
      </div>

      {/* Upcoming check-ins/outs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-3">
          <h2 className="text-lg font-medium">Upcoming Check-ins</h2>
          <CheckItem name="Ananya Rao" room="Room 302" time="11:00 AM" type="in" />
          <CheckItem name="Vikram Shah" room="Room 415" time="12:30 PM" type="in" />
          <CheckItem name="Meera N." room="Room 221" time="1:15 PM" type="in" />
        </div>
        <div className="space-y-3">
          <h2 className="text-lg font-medium">Upcoming Check-outs</h2>
          <CheckItem name="Rahul S." room="Room 518" time="10:00 AM" type="out" />
          <CheckItem name="Neha K." room="Room 207" time="10:30 AM" type="out" />
          <CheckItem name="Arjun P." room="Room 116" time="11:00 AM" type="out" />
        </div>
      </div>
    </div>
  );
}
