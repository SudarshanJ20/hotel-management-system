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
  roomsCount?: number;
  extraBed?: boolean;
  mealPlan?: string;
  room: { id: string; title: string; price: number };
  guest: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
  };
};
// my name is ramnath
export const revalidate = 0;

const STATUS_BADGE_BASE =
  "inline-flex items-center rounded-full px-3 py-1 text-[11px] font-medium border";
const STATUS_CLASS_MAP: Record<string, string> = {
  CONFIRMED: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
  PENDING: "border-amber-500/40 bg-amber-500/10 text-amber-200",
  CANCELLED: "border-red-500/40 bg-red-500/10 text-red-300",
  CHECKED_IN: "border-sky-500/40 bg-sky-500/10 text-sky-300",
  CHECKED_OUT: "border-indigo-500/40 bg-indigo-500/10 text-indigo-300",
};

type BookingResponse = {
  items?: Booking[];
};

type RequestMeta = {
  baseUrl: string;
  searchSuffix: string;
  createdFlag: boolean;
};

function StatusBadge({ status }: { status: string }) {
  const cls = STATUS_CLASS_MAP[status] ?? "border-white/25 bg-white/5 text-white/70";
  return <span className={`${STATUS_BADGE_BASE} ${cls}`}>{status}</span>;
}

function extractRequestMeta(hdrs: Headers): RequestMeta {
  const host = hdrs.get("x-forwarded-host") ?? hdrs.get("host");
  const proto = hdrs.get("x-forwarded-proto") ?? "http";
  const baseUrl = host ? `${proto}://${host}` : "";
  const searchSuffix = hdrs.get("x-search") ?? "";
  return {
    baseUrl,
    searchSuffix,
    createdFlag: searchSuffix.includes("created=1"),
  };
}

function partitionBookings(bookings: Booking[], today: Date) {
  const current: Booking[] = [];
  const pastIds: string[] = [];

  for (const booking of bookings) {
    const checkOutDate = new Date(booking.checkOut);
    checkOutDate.setHours(0, 0, 0, 0);

    if (checkOutDate < today) {
      pastIds.push(booking.id);
    } else {
      current.push(booking);
    }
  }

  return { current, pastIds } as const;
}

const joinInternalUrl = (baseUrl: string, path: string) => (baseUrl ? `${baseUrl}${path}` : path);

async function deletePastBookings(baseUrl: string, bookingIds: string[]) {
  try {
    await Promise.all(
      bookingIds.map(async (bookingId) => {
        try {
          await fetch(joinInternalUrl(baseUrl, `/api/bookings/${bookingId}`), {
            method: "DELETE",
            cache: "no-store",
          });
          console.log(`[Admin Bookings] Deleted past booking: ${bookingId}`);
        } catch (error) {
          console.error(`[Admin Bookings] Failed to delete booking ${bookingId}:`, error);
        }
      })
    );
  } catch (err) {
    console.error("[Admin Bookings] Bulk deletion error:", err);
  }
}

const formatExtras = (booking: Booking) => {
  const extras: string[] = [];
  if (booking.roomsCount && booking.roomsCount > 1) {
    extras.push(`${booking.roomsCount} rooms`);
  }
  if (booking.extraBed) {
    extras.push("Extra bed");
  }
  if (booking.mealPlan && booking.mealPlan !== "ROOM_ONLY") {
    const label = booking.mealPlan.replace(/_/g, " ").toLowerCase();
    extras.push(label.charAt(0).toUpperCase() + label.slice(1));
  }
  return extras;
};

export default async function BookingsPage() {
  const session = await auth();
  const role = ((session?.user as any)?.role ?? "USER") as string;
  const isPrivileged = ["ADMIN", "MANAGER"].includes(role);

  // Guard: only staff can view this page; users should use /my/bookings
  if (!isPrivileged) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-100">
          This page is for staff to manage all bookings. To view your own
          stays, use <span className="font-semibold">My bookings</span>.
        </div>
        <Link
          href="/my/bookings"
          className="inline-flex items-center rounded-full bg-gradient-to-r from-indigo-500 via-sky-500 to-cyan-400 px-5 py-2.5 text-xs font-medium text-white shadow-sm"
        >
          Go to My bookings
        </Link>
      </div>
    );
  }

  const hdrs = await headers();
  const { baseUrl, searchSuffix, createdFlag } = extractRequestMeta(hdrs);
  const listUrl = joinInternalUrl(baseUrl, `/api/bookings${searchSuffix}`);

  const res = await fetch(listUrl, { cache: "no-store" });
  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    return (
      <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
        Failed to load bookings: {res.status} {res.statusText}. {msg}
      </div>
    );
  }

  const payload: BookingResponse = await res.json().catch(() => ({ items: [] }));
  const allItems: Booking[] = payload.items ?? [];

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const { current: items, pastIds } = partitionBookings(allItems, today);

  if (pastIds.length > 0) {
    console.log(`[Admin Bookings] Deleting ${pastIds.length} past bookings...`);
    void deletePastBookings(baseUrl, pastIds);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-white">Bookings</h1>
          <p className="text-sm text-white/70 mt-1">
            Manage current and upcoming stays, track status, and review guest details.
          </p>
        </div>
        {isPrivileged && (
          <Link
            href="/bookings/new"
            className="inline-flex h-9 items-center rounded-full bg-gradient-to-r from-indigo-500 via-sky-500 to-cyan-400 px-4 text-xs font-medium text-white shadow-sm"
          >
            + New booking
          </Link>
        )}
      </div>

      {createdFlag && (
        <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm text-emerald-200">
          Booking created successfully.
        </div>
      )}

      {/* List */}
      {items.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-6 text-sm text-white/70">
          No bookings found. Try adjusting filters or create a new booking.
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((b) => {
            const extras = formatExtras(b);
            return (
              <Link
                key={b.id}
                href={`/bookings/${b.id}`}
                className="glass rounded-2xl border border-white/15 p-4 hover:border-cyan-400/60 hover:shadow-lg transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="text-sm font-semibold text-white">
                    {b.guest.name}
                  </div>
                  <div className="text-xs text-white/65">
                    {new Date(b.checkIn).toDateString()} →{" "}
                    {new Date(b.checkOut).toDateString()}
                  </div>
                  <div className="text-xs text-white/55">
                    Guests: {b.guests} • Room: {b.room.title}
                  </div>
                  {extras.length > 0 && (
                    <div className="text-[11px] text-white/55">
                      Extras: {extras.join(" • ")}
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <StatusBadge status={b.status} />
                  <div className="text-sm font-semibold text-emerald-300">
                    ₹{b.totalPrice.toLocaleString("en-IN")}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
