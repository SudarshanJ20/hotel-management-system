// src/app/bookings/page.tsx
import Link from "next/link";
import { headers } from "next/headers";
import { auth } from "@/auth";

type Booking = {
  id: string;
  status: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  room: { id: string; title: string; price: number };
  guest: { id: string; name: string; email: string | null; phone: string | null };
};

export const revalidate = 0;

export default async function BookingsPage() {
  const session = await auth();
  const role = ((session?.user as any)?.role ?? "USER") as string;
  const isPrivileged = ["ADMIN", "MANAGER"].includes(role);

  // Guard: only staff can view this page; users should use /my/bookings
  if (!isPrivileged) {
    return (
      <div className="p-6">
        <div className="rounded-md border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-200">
          This page is for staff. View your bookings in My bookings.
        </div>
        <div className="mt-4">
          <Link
            href="/my/bookings"
            className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm text-white"
          >
            Go to My bookings
          </Link>
        </div>
      </div>
    );
  }

  const hdrs = await headers();
  const host = hdrs.get("x-forwarded-host") ?? hdrs.get("host");
  const proto = hdrs.get("x-forwarded-proto") ?? "http";
  const base = host ? `${proto}://${host}` : "";

  // Pass any filters from the URL to the API
  const search = hdrs.get("x-search") ?? "";
  const listUrl = `${base}/api/bookings${search}`;

  const res = await fetch(listUrl, { cache: "no-store" });
  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    return (
      <div className="p-6 text-red-300">
        Failed to load bookings: {res.status} {res.statusText}. {msg}
      </div>
    );
  }

  const payload = await res.json().catch(() => ({ items: [] as Booking[] }));
  const items: Booking[] = payload.items ?? [];

  // Optional created banner if staff creates and returns here with ?created=1
  const created = (hdrs.get("x-search") || "").includes("created=1");

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Bookings</h1>
          <p className="text-white/70 mt-1">Manage and review bookings.</p>
        </div>
        {isPrivileged && (
          <Link
            href="/bookings/new"
            className="h-10 inline-flex items-center rounded-md bg-blue-600 px-4 text-sm text-white"
          >
            New Booking
          </Link>
        )}
      </div>

      {created && (
        <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-200">
          Booking created successfully.
        </div>
      )}

      {items.length === 0 ? (
        <div className="text-white/70">No bookings found.</div>
      ) : (
        <div className="space-y-3">
          {items.map((b) => (
            <Link
              key={b.id}
              href={`/bookings/${b.id}`}
              className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-900/50 p-4 hover:border-white/20"
            >
              <div>
                <div className="font-medium">{b.guest.name}</div>
                <div className="text-sm text-white/70">
                  {new Date(b.checkIn).toDateString()} → {new Date(b.checkOut).toDateString()}
                </div>
              </div>
              <div className="text-right">
                <div className="text-white/90">{b.room.title}</div>
                <div className="text-sm text-white/70">
                  {b.status} · ₹{b.totalPrice}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
