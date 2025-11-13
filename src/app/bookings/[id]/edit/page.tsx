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
      const [b, r] = await Promise.all([
        fetch(`/api/bookings/${id}`).then((r) => r.json()),
        fetch(`/api/rooms`).then((r) => r.json()),
      ]);
      setBooking(b);
      setRooms(Array.isArray(r) ? r : r.items);
    };
    load();
  }, [id]);

  const selectedRoom = useMemo(() => rooms.find((x) => x.id === booking?.roomId), [rooms, booking?.roomId]);

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

  if (!booking) return <div className="p-6 text-white/70">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Edit Booking</h1>
        <button onClick={remove} disabled={saving} className="h-10 px-4 rounded-md bg-red-600 text-white text-sm disabled:opacity-50">
          {saving ? "Working..." : "Delete"}
        </button>
      </div>

      {error && (
        <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
          {error}
        </div>
      )}

      <form onSubmit={save} className="space-y-4">
        <div>
          <label className="block text-sm text-white/80 mb-1">Status</label>
          <select
            className="w-full h-10 rounded-md border border-white/15 bg-white/5 px-3 text-sm text-white outline-none"
            value={booking.status}
            onChange={(e) => setBooking({ ...booking, status: e.target.value })}
          >
            <option value="PENDING">PENDING</option>
            <option value="CONFIRMED">CONFIRMED</option>
            <option value="CHECKED_IN">CHECKED_IN</option>
            <option value="CHECKED_OUT">CHECKED_OUT</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>

        <div>
          <label className="block text-sm text-white/80 mb-1">Room</label>
          <select
            className="w-full h-10 rounded-md border border-white/15 bg-white/5 px-3 text-sm text-white outline-none"
            value={booking.roomId}
            onChange={(e) => setBooking({ ...booking, roomId: e.target.value })}
          >
            {rooms.map((r) => (
              <option key={r.id} value={r.id}>
                {r.title} (₹{r.price}/night, {r.capacity} pax)
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-white/80 mb-1">Check-in</label>
            <input
              type="date"
              className="w-full h-10 rounded-md border border-white/15 bg-white/5 px-3 text-sm text-white outline-none"
              value={booking.checkIn.substring(0, 10)}
              onChange={(e) => setBooking({ ...booking, checkIn: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm text-white/80 mb-1">Check-out</label>
            <input
              type="date"
              className="w-full h-10 rounded-md border border-white/15 bg-white/5 px-3 text-sm text-white outline-none"
              value={booking.checkOut.substring(0, 10)}
              onChange={(e) => setBooking({ ...booking, checkOut: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-white/80 mb-1">Guests</label>
          <input
            className="w-full h-10 rounded-md border border-white/15 bg-white/5 px-3 text-sm text-white outline-none"
            value={booking.guests}
            onChange={(e) => setBooking({ ...booking, guests: Number(e.target.value) || 1 })}
            inputMode="numeric"
          />
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="h-10 px-4 rounded-md bg-blue-600 text-white text-sm disabled:opacity-50">
            {saving ? "Saving..." : "Save"}
          </button>
          <button type="button" className="h-10 px-4 rounded-md border border-white/20 text-white text-sm" onClick={() => history.back()}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
