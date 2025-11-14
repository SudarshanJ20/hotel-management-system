// src/app/rooms/[id]/page.tsx
import { headers } from "next/headers";
import Link from "next/link";
import { auth } from "@/auth";

type Room = {
  id: string;
  title: string;
  description: string | null;
  price: number;
  capacity: number;
  status: string;
  image: string | null;
};

export const revalidate = 0;

function StatusBadge({ status }: { status: string }) {
  const base =
    "inline-flex items-center rounded-full px-3 py-1 text-[11px] font-medium border";
  const map: Record<string, string> = {
    AVAILABLE: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
    UNAVAILABLE: "border-red-500/40 bg-red-500/10 text-red-300",
    MAINTENANCE: "border-yellow-500/40 bg-yellow-500/10 text-yellow-200",
  };
  const cls = map[status] ?? "border-white/25 bg-white/5 text-white/70";
  return <span className={`${base} ${cls}`}>{status}</span>;
}

export default async function RoomDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;

  // Get session to decide if privileged
  const session = await auth();
  const role = ((session?.user as any)?.role ?? "USER") as string;
  const isPrivileged = ["ADMIN", "MANAGER"].includes(role);

  // Next 15: headers() must be awaited
  const hdrs = await headers();
  const host = hdrs.get("x-forwarded-host") ?? hdrs.get("host");
  const proto = hdrs.get("x-forwarded-proto") ?? "http";
  const base = host ? `${proto}://${host}` : "";
  const url = `${base}/api/rooms/${id}`;

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold text-white">Room not found</h1>
        <p className="text-sm text-white/70">
          The room you are looking for does not exist or has been removed.
        </p>
        <Link
          href="/rooms"
          className="inline-flex items-center rounded-full px-4 py-2 text-sm font-medium border border-white/20 text-white hover:bg-white/10"
        >
          ← Back to rooms
        </Link>
      </div>
    );
  }

  const room = (await res.json()) as Room;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-white">
            {room.title}
          </h1>
          <p className="text-sm text-white/70 mt-1">
            Sleeps {room.capacity} • Perfect for business and leisure stays.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={room.status} />
          {isPrivileged && (
            <Link
              href={`/rooms/${room.id}/edit`}
              className="inline-flex items-center rounded-full border border-white/25 bg-white/5 px-4 py-1.5 text-xs font-medium text-white hover:bg-white/10"
            >
              Edit room
            </Link>
          )}
          <Link
            href="/rooms"
            className="inline-flex items-center rounded-full border border-white/20 px-4 py-1.5 text-xs font-medium text-white/85 hover:bg-white/10"
          >
            Back
          </Link>
        </div>
      </div>

      {/* Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-6">
        {/* Left: gallery + description */}
        <div className="space-y-4">
          <div className="glass rounded-3xl p-4 sm:p-5 border border-white/15">
            <div className="h-60 sm:h-72 rounded-2xl bg-white/[0.04] border border-white/12 flex items-center justify-center text-sm text-white/60">
              Image gallery coming soon
            </div>
          </div>

          <div className="rounded-3xl border border-white/12 bg-slate-950/75 p-5 space-y-3">
            <h2 className="text-base font-semibold text-white">
              About this room
            </h2>
            <p className="text-sm text-white/75 leading-relaxed">
              {room.description ||
                "A comfortable and well‑appointed room designed to offer a calm stay with all essentials for both short and extended visits."}
            </p>
            <ul className="mt-1 text-xs text-white/70 space-y-1.5">
              <li>• Complimentary high‑speed Wi‑Fi</li>
              <li>• Fresh linen and daily housekeeping</li>
              <li>• In‑room workspace and power outlets</li>
            </ul>
          </div>
        </div>

        {/* Right: pricing / actions */}
        <aside className="glass rounded-3xl p-5 border border-white/15 h-fit">
          <div className="text-sm font-medium text-white/85">
            Rate & booking
          </div>
          <div className="mt-3 text-2xl font-semibold text-emerald-300">
            ₹{room.price.toLocaleString("en-IN")}
            <span className="text-xs text-white/65 font-normal">
              {" "}
              / night
            </span>
          </div>
          <p className="mt-2 text-xs text-white/65">
            Taxes may apply at checkout. Final amount is shown before
            confirmation.
          </p>

          <div className="mt-5 flex flex-col gap-3">
            <Link
              href={`/bookings/new?roomId=${room.id}`}
              className="btn-glow inline-flex items-center justify-center rounded-full bg-gradient-to-r from-cyan-400 via-sky-500 to-indigo-500 px-5 py-2.5 text-sm font-medium text-white shadow-md"
            >
              Book this room
            </Link>
            <Link
              href="/rooms"
              className="inline-flex items-center justify-center rounded-full border border-white/25 bg-transparent px-5 py-2.5 text-xs font-medium text-white/85 hover:bg-white/10"
            >
              View all rooms
            </Link>
          </div>

          <div className="mt-5 text-[11px] text-white/55 space-y-1.5">
            <p>• Free cancellation up to 24 hours before check‑in.</p>
            <p>• Check‑in: 2:00 PM • Check‑out: 11:00 AM.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
