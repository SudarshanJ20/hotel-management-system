// src/app/bookings/[id]/edit/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Booking = {
  id: string;
  status: string;
  roomId: string;
  guestId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
};

type Room = { id: string; title: string; price: number; capacity: number };

export default function EditBookingPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [bRes, rRes] = await Promise.all([
          fetch(`/api/bookings/${id}`),
          fetch(`/api/rooms`),
        ]);
        if (!bRes.ok) throw new Error("Failed to load booking");
        const b = (await bRes.json()) as Booking;
        const rJson = await rRes.json();
        const rList: Room[] = Array.isArray(rJson) ? rJson : rJson.items ?? [];
        setBooking(b);
        setRooms(rList);
      } catch (e: any) {
        setError(e.message ?? "Failed to load");
      }
    };
    load();
  }, [id]);

  const selectedRoom = useMemo(
    () => rooms.find((x) => x.id === booking?.roomId),
    [rooms, booking?.roomId]
  );

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!booking) return;
    setSaving(true);
    setError(null);

    const res = await fetch(`/api/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(booking),
    });
    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data?.error ?? `Failed: ${res.status} ${res.statusText}`);
      return;
    }

    router.push(`/bookings/${id}`);
    router.refresh();
  };

  const remove = async () => {
    if (!confirm("Cancel this booking?")) return;
    setSaving(true);
    const res = await fetch(`/api/bookings/${id}`, { method: "DELETE" });
    setSaving(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data?.error ?? `Failed: ${res.status} ${res.statusText}`);
      return;
    }
    router.push(`/bookings`);
    router.refresh();
  };

  if (!booking) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-sm text-white/70">
        Loading booking…
      </div>
    );
  }

  const label =
    "block text-xs font-medium mb-1 text-white/80 tracking-wide uppercase";
  const input =
    "w-full h-10 rounded-md border border-white/15 bg-white/5 px-3 text-sm text-white placeholder:text-white/60 outline-none focus:ring-2 focus:ring-cyan-400/40";

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-white">Edit booking</h1>
          <p className="mt-1 text-sm text-white/70">
            Update status, dates, and room assignment.
          </p>
        </div>
        <button
          onClick={remove}
          disabled={saving}
          className="inline-flex items-center rounded-full border border-red-400/70 bg-red-500/10 px-5 py-2.5 text-xs font-medium text-red-200 hover:bg-red-500/20 disabled:opacity-60"
        >
          {saving ? "Working…" : "Cancel booking"}
        </button>
      </div>

      <div className="glass rounded-3xl p-6 border border-white/15 space-y-5">
        {error && (
          <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-200">
            {error}
          </div>
        )}

        <form onSubmit={save} className="space-y-5">
          {/* Status */}
          <div>
            <label className={label}>Status</label>
            <select
              className={input}
              value={booking.status}
              onChange={(e) =>
                setBooking({ ...booking, status: e.target.value })
              }
            >
              <option value="PENDING">PENDING</option>
              <option value="CONFIRMED">CONFIRMED</option>
              <option value="CHECKED_IN">CHECKED_IN</option>
              <option value="CHECKED_OUT">CHECKED_OUT</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>

          {/* Room */}
          <div>
            <label className={label}>Room</label>
            <select
              className={input}
              value={booking.roomId}
              onChange={(e) =>
                setBooking({ ...booking, roomId: e.target.value })
              }
            >
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.title} (₹{r.price}/night, {r.capacity} pax)
                </option>
              ))}
            </select>
            {selectedRoom && (
              <p className="mt-1 text-[11px] text-white/55">
                Current: {selectedRoom.title} · ₹{selectedRoom.price}/night ·{" "}
                {selectedRoom.capacity} pax
              </p>
            )}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={label}>Check-in</label>
              <input
                type="date"
                className={input}
                value={booking.checkIn.substring(0, 10)}
                onChange={(e) =>
                  setBooking({ ...booking, checkIn: e.target.value })
                }
              />
            </div>
            <div>
              <label className={label}>Check-out</label>
              <input
                type="date"
                className={input}
                value={booking.checkOut.substring(0, 10)}
                onChange={(e) =>
                  setBooking({ ...booking, checkOut: e.target.value })
                }
              />
            </div>
          </div>

          {/* Guests */}
          <div>
            <label className={label}>Guests</label>
            <input
              className={input}
              value={booking.guests}
              onChange={(e) =>
                setBooking({
                  ...booking,
                  guests: Number(e.target.value) || 1,
                })
              }
              inputMode="numeric"
            />
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3 pt-1">
            <button
              type="submit"
              disabled={saving}
              className="btn-glow inline-flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 via-sky-500 to-cyan-400 px-6 py-2.5 text-sm font-medium text-white shadow-md disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-full border border-white/25 bg-transparent px-5 py-2.5 text-sm font-medium text-white/85 hover:bg-white/10"
              onClick={() => router.back()}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
