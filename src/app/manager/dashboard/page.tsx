// app/manager/dashboard/page.tsx
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

export const revalidate = 0;

async function fetchJSON(url: string) {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

export default async function ManagerDashboardPage() {
  const session = await auth();
  const role = ((session?.user as any)?.role ?? "USER") as string;
  if (!["ADMIN", "MANAGER"].includes(role)) redirect("/403");

  const hdrs = await headers();
  const host = hdrs.get("x-forwarded-host") ?? hdrs.get("host");
  const proto = hdrs.get("x-forwarded-proto") ?? "http";
  const base = host ? `${proto}://${host}` : "";

  // Simple stats
  const [roomsData, bookingsData] = await Promise.all([
    fetchJSON(`${base}/api/rooms`),
    fetchJSON(`${base}/api/bookings`),
  ]);

  const rooms = Array.isArray(roomsData) ? roomsData : roomsData?.items ?? [];
  const bookings = bookingsData?.items ?? [];

  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);

  const todayCheckIns = bookings.filter((b: any) => String(b.checkIn).slice(0,10) === todayStr).length;
  const todayCheckOuts = bookings.filter((b: any) => String(b.checkOut).slice(0,10) === todayStr).length;

  const occupiedNow = bookings.filter((b: any) => {
    const ci = new Date(b.checkIn);
    const co = new Date(b.checkOut);
    return ci <= today && today < co;
  }).length;

  const occupancyPct = rooms.length ? Math.round((occupiedNow / rooms.length) * 100) : 0;

  const month = today.getMonth();
  const year = today.getFullYear();
  const monthBookings = bookings.filter((b: any) => {
    const ci = new Date(b.checkIn);
    return ci.getMonth() === month && ci.getFullYear() === year;
  });
  const revenue = monthBookings.reduce((sum: number, b: any) => sum + (b.totalPrice || 0), 0);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Manager Dashboard</h1>
        <p className="text-white/70 mt-1">Overview of operations today and this month.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Today Check-ins" value={todayCheckIns} />
        <StatCard label="Today Check-outs" value={todayCheckOuts} />
        <StatCard label="Occupancy" value={`${occupancyPct}%`} />
        <StatCard label="Revenue (month)" value={`₹${revenue}`} />
      </div>

      <div className="rounded-xl border border-white/10 bg-slate-900/50 p-4">
        <div className="font-medium mb-2">Quick actions</div>
        <div className="flex gap-3 flex-wrap">
          <a className="px-3 py-2 rounded-md bg-blue-600 text-white text-sm" href="/bookings/new">New booking</a>
          <a className="px-3 py-2 rounded-md border border-white/20 text-white text-sm" href="/guests/new">Add guest</a>
          <a className="px-3 py-2 rounded-md border border-white/20 text-white text-sm" href="/rooms">Manage rooms</a>
          <a className="px-3 py-2 rounded-md border border-white/20 text-white text-sm" href="/bookings">All bookings</a>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-white/10 bg-slate-900/50 p-4">
      <div className="text-white/70 text-sm">{label}</div>
      <div className="mt-2 text-xl font-semibold">{value}</div>
    </div>
  );
}
