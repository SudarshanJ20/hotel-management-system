// src/app/my/bookings/page.tsx
import { auth } from "@/auth";
import { headers } from "next/headers";
import Link from "next/link";

export const revalidate = 0;

async function fetchJSON(url: string) {
  const r = await fetch(url, { cache: "no-store" });
  if (!r.ok) return null;
  return r.json();
}

function toDateLabel(v: string) {
  const d = new Date(v);
  return isNaN(+d) ? v : d.toDateString();
}

function StatusBadge({ status }: { status: string }) {
  const base = "inline-flex items-center px-2 py-0.5 rounded text-xs";
  const map: Record<string, string> = {
    CONFIRMED: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30",
    CANCELLED: "bg-red-500/15 text-red-300 border border-red-500/30",
    PENDING: "bg-yellow-500/15 text-yellow-200 border border-yellow-500/30",
    CHECKED_IN: "bg-blue-500/15 text-blue-300 border border-blue-500/30",
    CHECKED_OUT: "bg-slate-500/15 text-slate-300 border border-slate-500/30",
  };
  const cls = map[status] ?? "bg-slate-500/15 text-slate-300 border border-slate-500/30";
  return <span className={`${base} ${cls}`}>{status}</span>;
}

export default async function MyBookingsPage() {
  const session = await auth();
  if (!session?.user) {
    return (
      <div className="p-6">
        <p className="text-white/80">Please sign in to view your bookings.</p>
        <Link href="/login" className="underline text-cyan-300">Login</Link>
      </div>
    );
  }

  const hdrs = await headers();
  const host = hdrs.get("x-forwarded-host") ?? hdrs.get("host");
  const proto = hdrs.get("x-forwarded-proto") ?? "http";
  const base = host ? `${proto}://${host}` : "";

  const data = await fetchJSON(`${base}/api/bookings?me=1`);
  const items = data?.items ?? [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">My Bookings</h1>
        <Link href="/bookings/new" className="px-3 py-1.5 rounded bg-blue-600 text-white text-sm">New booking</Link>
      </div>

      <p className="text-xs text-white/60">
        You can cancel confirmed bookings until check-in time. Refunds, if any, follow the hotel’s policy shown at checkout.
      </p>

      {items.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-slate-900/50 p-6">
          <div className="text-white/80">No bookings yet.</div>
          <div className="mt-2">
            <Link href="/bookings/new" className="text-cyan-300 underline">Create your first booking</Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((b: any) => {
            const now = new Date();
            const ci = new Date(b.checkIn);
            const co = new Date(b.checkOut);
            const future = +ci > +now;
            const cancellable = future && b.status === "CONFIRMED";
            return (
              <div key={b.id} className="rounded-xl border border-white/10 bg-slate-900/50 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-medium">{b.room?.title ?? "Room"}</div>
                  <StatusBadge status={b.status} />
                </div>

                <div className="text-white/70 text-sm">
                  {toDateLabel(b.checkIn)} → {toDateLabel(b.checkOut)}
                </div>

                <div className="text-white/80 text-sm">Guests: {b.guests}</div>
                <div className="text-white/80 text-sm">Total: ₹{b.totalPrice}</div>

                <div className="flex gap-2 pt-1">
                  <Link href={`/bookings/${b.id}`} className="px-3 py-1.5 rounded border border-white/20 text-sm">
                    View
                  </Link>

                  {cancellable && (
                    <form
                      action={`/api/bookings/${b.id}/cancel`}
                      method="POST"
                      onSubmit={(e) => {
                        if (!confirm("Cancel this booking?")) e.preventDefault();
                      }}
                    >
                      <button className="px-3 py-1.5 rounded bg-red-600 text-white text-sm">
                        Cancel
                      </button>
                    </form>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
