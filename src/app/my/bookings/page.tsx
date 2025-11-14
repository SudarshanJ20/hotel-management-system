// src/app/my/bookings/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

type BookingItem = {
  id: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  status: string;
  room?: {
    id: string;
    title: string;
    price: number;
  } | null;
};

function toDateLabel(v: string) {
  const d = new Date(v);
  return isNaN(+d) ? v : d.toDateString();
}

function StatusBadge({ status }: { status: string }) {
  const base = "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium";
  const map: Record<string, string> = {
    CONFIRMED:
      "bg-emerald-500/10 text-emerald-300 border border-emerald-500/30",
    CANCELLED:
      "bg-red-500/10 text-red-300 border border-red-500/30",
    PENDING:
      "bg-yellow-500/10 text-yellow-200 border border-yellow-500/30",
    CHECKED_IN:
      "bg-blue-500/10 text-blue-300 border border-blue-500/30",
    CHECKED_OUT:
      "bg-slate-500/10 text-slate-300 border border-slate-500/30",
  };
  const cls =
    map[status] ??
    "bg-slate-500/10 text-slate-300 border border-slate-500/30";
  return <span className={`${base} ${cls}`}>{status}</span>;
}

export default function MyBookingsPage() {
  const { data: session, status } = useSession();
  const [items, setItems] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;

    if (!session?.user) {
      setLoading(false);
      return;
    }

    async function load() {
      try {
        const res = await fetch("/api/bookings?me=1", {
          method: "GET",
          credentials: "include",
        });
        const data = await res.json();
        console.log("MyBookingsPage client data:", data);
        setItems(Array.isArray(data.items) ? data.items : []);
      } catch (e) {
        console.error("Failed to load bookings", e);
        setItems([]);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [session, status]);

  if (status === "loading" || loading) {
    return (
      <div className="p-6">
        <p className="text-white/80">Loading your bookings...</p>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="p-6">
        <p className="text-white/80">
          Please sign in to view your bookings.
        </p>
        <Link href="/login" className="underline text-cyan-300">
          Login
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-white">
            My bookings
          </h1>
          <p className="mt-1 text-sm text-white/60">
            View and manage all your upcoming and past stays.
          </p>
        </div>
        <Link
          href="/bookings/new"
          className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-500 text-sm font-medium text-white shadow-sm transition"
        >
          + New booking
        </Link>
      </div>

      {/* Content */}
      {items.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-8 text-center space-y-3">
          <div className="text-lg font-medium text-white/90">
            You have no bookings yet
          </div>
          <p className="text-sm text-white/60">
            When you book a room, your reservations will appear here so you
            can manage them easily.
          </p>
          <Link
            href="/bookings/new"
            className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-500 text-sm font-medium text-white transition"
          >
            Book a room
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {items.map((b) => {
            const now = new Date();
            const ci = new Date(b.checkIn);
            const future = +ci > +now;
            const cancellable = future && b.status === "CONFIRMED";

            return (
              <div
                key={b.id}
                className="group rounded-2xl border border-slate-800 bg-slate-950/70 hover:bg-slate-900/80 hover:border-slate-700 transition shadow-sm hover:shadow-md flex flex-col"
              >
                <div className="px-4 pt-4 pb-3 flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs text-white/50 uppercase tracking-wide">
                      {b.room?.id ? `Room #${b.room.id.slice(-4)}` : "Room"}
                    </div>
                    <div className="mt-1 text-base font-semibold text-white">
                      {b.room?.title ?? "Room booking"}
                    </div>
                  </div>
                  <StatusBadge status={b.status} />
                </div>

                <div className="px-4 pb-3 space-y-1 text-sm text-white/70">
                  <div className="flex items-center justify-between">
                    <span className="text-white/50">Check-in</span>
                    <span>{toDateLabel(b.checkIn)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/50">Check-out</span>
                    <span>{toDateLabel(b.checkOut)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/50">Guests</span>
                    <span>{b.guests}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/50">Total</span>
                    <span className="font-semibold text-emerald-300">
                      ₹{b.totalPrice.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="mt-auto px-4 pb-4 flex items-center justify-between gap-2">
                  <Link
                    href={`/bookings/${b.id}`}
                    className="inline-flex items-center justify-center px-3 py-1.5 rounded-full border border-slate-700 text-xs font-medium text-white/90 hover:border-slate-500 hover:bg-slate-800/80 transition"
                  >
                    View details
                  </Link>

                  {cancellable && (
                    <form
                      action={`/api/bookings/${b.id}/cancel`}
                      method="POST"
                      onSubmit={(e) => {
                        if (!confirm("Cancel this booking?")) {
                          e.preventDefault();
                        }
                      }}
                    >
                      <button
                        type="submit"
                        className="inline-flex items-center justify-center px-3 py-1.5 rounded-full bg-red-600 hover:bg-red-500 text-xs font-medium text-white transition"
                      >
                        Cancel booking
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
