// src/app/rooms/page.tsx
import Link from "next/link";
import { headers } from "next/headers";
import { auth } from "@/auth";
import RoomsFilters from "./rooms-filters";

type Room = {
  id: string;
  title: string;
  description: string | null;
  price: number;
  capacity: number;
  status: string;
  image: string | null;
};

function formatINR(n: number) {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return `₹${n}`;
  }
}

function RoomCard({
  id,
  title,
  price,
  capacity,
}: Pick<Room, "id" | "title" | "price" | "capacity">) {
  return (
    <div className="rounded-2xl border border-white/12 bg-slate-950/75 p-4 flex flex-col justify-between hover:border-cyan-400/60 hover:shadow-lg transition">
      <div className="space-y-1">
        <Link
          href={`/rooms/${id}`}
          className="text-sm font-semibold text-white hover:underline underline-offset-4"
        >
          {title}
        </Link>
        <div className="text-xs text-white/65">
          Capacity: {capacity} guest{capacity > 1 ? "s" : ""}
        </div>
        <div className="mt-2 text-sm font-medium text-emerald-300">
          {formatINR(price)} <span className="text-xs text-white/60">/ night</span>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2">
        <Link
          href={`/rooms/${id}`}
          className="text-xs font-medium text-cyan-300 hover:text-cyan-200 underline underline-offset-4"
        >
          View details
        </Link>
        <Link
          href={`/bookings/new?roomId=${id}`}
          className="btn-glow inline-flex items-center rounded-full px-3.5 py-1.5 text-xs font-medium bg-gradient-to-r from-cyan-400 via-sky-500 to-indigo-500 text-white"
        >
          Book now
        </Link>
      </div>
    </div>
  );
}

export const revalidate = 0;

export default async function RoomsPage() {
  const session = await auth();
  const role = ((session?.user as any)?.role ?? "USER") as string;
  const isPrivileged = ["ADMIN", "MANAGER"].includes(role);

  const hdrs = await headers();
  const host = hdrs.get("x-forwarded-host") ?? hdrs.get("host");
  const proto = hdrs.get("x-forwarded-proto") ?? "http";
  const base = host ? `${proto}://${host}` : "";

  // Keep simple; fetch all rooms (filters component can manage query client-side)
  const listUrl = `${base}/api/rooms${hdrs.get("x-search") ?? ""}`;

  const res = await fetch(listUrl, { cache: "no-store" });
  if (!res.ok) {
    const snippet = await res
      .text()
      .then((t) => t.slice(0, 200))
      .catch(() => "");
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-white">Rooms</h1>
            <p className="text-sm text-white/70 mt-1">
              Browse available categories and manage inventory.
            </p>
          </div>
          {isPrivileged && (
            <Link
              href="/rooms/new"
              className="inline-flex h-9 items-center rounded-full bg-gradient-to-r from-indigo-500 via-sky-500 to-cyan-400 px-4 text-xs font-medium text-white shadow-sm"
            >
              + New room
            </Link>
          )}
        </div>

        <RoomsFilters />

        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
          Failed to load rooms: {res.status} {res.statusText}. {snippet}
        </div>
      </div>
    );
  }

  const payload = await res
    .json()
    .catch(() => ({ items: [] as Room[], pages: 1, page: 1 }));
  const rooms = (payload.items as Room[]) ?? [];
  const pages = Number(payload.pages ?? 1);
  const page = Number(payload.page ?? 1);

  // Broadcast total pages to client filter for pagination buttons
  const script = `
    window.dispatchEvent(new CustomEvent("rooms:pages", { detail: { pages: ${JSON.stringify(
      pages
    )} } }));
  `;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-white">Rooms</h1>
          <p className="text-sm text-white/70 mt-1">
            Find the right room type and check availability in real time.
          </p>
        </div>
        {isPrivileged && (
          <Link
            href="/rooms/new"
            className="inline-flex h-9 items-center rounded-full bg-gradient-to-r from-indigo-500 via-sky-500 to-cyan-400 px-4 text-xs font-medium text-white shadow-sm"
          >
            + New room
          </Link>
        )}
      </div>

      {/* Filters */}
      <RoomsFilters />

      {/* Results */}
      {rooms.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-6 text-sm text-white/70">
          No rooms found. Try adjusting your filters or check back later.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {rooms.map((r: Room) => (
            <RoomCard
              key={r.id}
              id={r.id}
              title={r.title}
              price={r.price}
              capacity={r.capacity}
            />
          ))}
        </div>
      )}

      <script dangerouslySetInnerHTML={{ __html: script }} />
      {/* page variable still used by pagination via custom event; no UI needed here yet */}
    </div>
  );
}
