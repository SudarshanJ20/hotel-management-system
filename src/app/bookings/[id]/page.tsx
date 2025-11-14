// src/app/bookings/[id]/page.tsx
import Link from "next/link";
import { headers } from "next/headers";
import { auth } from "@/auth";

export const revalidate = 0;

function StatusBadge({ status }: { status: string }) {
  const base =
    "inline-flex items-center rounded-full px-3 py-1 text-[11px] font-medium border";
  const map: Record<string, string> = {
    CONFIRMED: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
    PENDING: "border-amber-500/40 bg-amber-500/10 text-amber-200",
    CANCELLED: "border-red-500/40 bg-red-500/10 text-red-300",
    CHECKED_IN: "border-sky-500/40 bg-sky-500/10 text-sky-300",
    CHECKED_OUT: "border-indigo-500/40 bg-indigo-500/10 text-indigo-300",
  };
  const cls = map[status] ?? "border-white/25 bg-white/5 text-white/70";
  return <span className={`${base} ${cls}`}>{status}</span>;
}

export default async function BookingDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await auth();
  const role = ((session?.user as any)?.role ?? "USER") as string;
  const isPrivileged = ["ADMIN", "MANAGER"].includes(role);

  const hdrs = await headers();
  const host = hdrs.get("x-forwarded-host") ?? hdrs.get("host");
  const proto = hdrs.get("x-forwarded-proto") ?? "http";
  const base = host ? `${proto}://${host}` : "";

  const res = await fetch(`${base}/api/bookings/${params.id}`, {
    cache: "no-store",
  });
  if (!res.ok) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold text-white">
          Booking not found
        </h1>
        <p className="text-sm text-white/70">
          The booking you are looking for does not exist or may have been
          removed.
        </p>
        <Link
          href="/bookings"
          className="inline-flex items-center rounded-full border border-white/25 px-4 py-2 text-xs font-medium text-white hover:bg-white/10"
        >
          ← Back to bookings
        </Link>
      </div>
    );
  }

  const b = await res.json();

  const checkInDate = new Date(b.checkIn);
  const checkOutDate = new Date(b.checkOut);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-white">
            Booking details
          </h1>
          <p className="text-sm text-white/70 mt-1">
            {checkInDate.toDateString()} → {checkOutDate.toDateString()} •{" "}
            {b.guests} guest{b.guests > 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={b.status} />
          {isPrivileged && (
            <Link
              href={`/bookings/${b.id}/edit`}
              className="inline-flex items-center rounded-full border border-white/25 bg-white/5 px-4 py-1.5 text-xs font-medium text-white hover:bg-white/10"
            >
              Edit booking
            </Link>
          )}
          <Link
            href="/bookings"
            className="inline-flex items-center rounded-full border border-white/20 px-4 py-1.5 text-xs font-medium text-white/85 hover:bg-white/10"
          >
            Back
          </Link>
        </div>
      </div>

      {/* Main cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Guest card */}
        <div className="glass rounded-3xl p-5 border border-white/15">
          <div className="text-sm font-semibold text-white/85">Guest</div>
          <div className="mt-3 text-sm text-white/80 space-y-1.5">
            <div>{b.guest?.name}</div>
            <div className="text-xs text-white/65">
              {b.guest?.email ?? "No email provided"}
            </div>
            <div className="text-xs text-white/65">
              {b.guest?.phone ?? "No phone provided"}
            </div>
          </div>
        </div>

        {/* Room / pricing card */}
        <div className="glass rounded-3xl p-5 border border-white/15">
          <div className="text-sm font-semibold text-white/85">
            Room & pricing
          </div>
          <div className="mt-3 text-sm text-white/80 space-y-1.5">
            <div>{b.room?.title}</div>
            <div className="text-xs text-white/65">
              ₹{b.room?.price} / night
            </div>
            <div className="text-xs text-white/65">
              Guests: {b.guests}
            </div>
            <div className="pt-2 text-sm">
              Total amount:{" "}
              <span className="font-semibold text-emerald-300">
                ₹{b.totalPrice}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Meta info */}
      <div className="rounded-3xl border border-white/12 bg-slate-950/75 p-4 text-xs text-white/65 space-y-1.5">
        <div>
          Booking ID:{" "}
          <span className="font-mono text-white/80">{b.id}</span>
        </div>
        <div>
          Created at:{" "}
          {b.createdAt
            ? new Date(b.createdAt).toLocaleString()
            : "Not available"}
        </div>
        <div>
          Updated at:{" "}
          {b.updatedAt
            ? new Date(b.updatedAt).toLocaleString()
            : "Not available"}
        </div>
      </div>
    </div>
  );
}
