// src/app/bookings/new/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Guest = { id: string; name: string; email: string | null; phone: string | null };
type Room = { id: string; title: string; price: number; capacity: number };

export default function NewBookingPage() {
  const router = useRouter();

  const [guests, setGuests] = useState<Guest[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [guestId, setGuestId] = useState("");
  const [roomId, setRoomId] = useState(""); // keep empty until we load, so placeholder shows
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [count, setCount] = useState("1");
  const [error, setError] = useState<string | null>(null);
  const [posting, setPosting] = useState(false);

  // Load lists
  useEffect(() => {
    const load = async () => {
      const [g, r] = await Promise.all([
        fetch("/api/guests").then((r) => r.json()).then((x) => x.items as Guest[]),
        fetch("/api/rooms").then((r) => r.json()) as Promise<Room[]>,
      ]);
      const roomsList = Array.isArray(r) ? (r as any) : (r as any).items;
      setGuests(g);
      setRooms(roomsList);

      // Preselect the first items but only after rendering the placeholder once
      if (!guestId && g.length) setGuestId(g[0].id);
      if (!roomId && roomsList.length) setRoomId(roomsList[0].id);
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedRoom = useMemo(() => rooms.find((r) => r.id === roomId) || null, [rooms, roomId]);
  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 0;
    const a = new Date(checkIn);
    const b = new Date(checkOut);
    const d = Math.ceil((+b - +a) / (1000 * 60 * 60 * 24));
    return Math.max(0, d);
  }, [checkIn, checkOut]);

  const total = useMemo(() => {
    if (!selectedRoom || nights <= 0) return 0;
    return selectedRoom.price * nights;
  }, [selectedRoom, nights]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!guestId || !roomId || !checkIn || !checkOut) {
      setError("All fields are required");
      return;
    }
    const guestsNum = Number(count);
    if (!Number.isInteger(guestsNum) || guestsNum <= 0) {
      setError("Guests must be a positive integer");
      return;
    }

    setPosting(true);
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        guestId,
        roomId,
        checkIn,
        checkOut,
        guests: guestsNum,
      }),
    });
    setPosting(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data?.error ?? `Failed: ${res.status} ${res.statusText}`);
      return;
    }

    const created = await res.json();
    router.push(`/bookings/${created.id}`);
    router.refresh();
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-xl font-semibold">New Booking</h1>

      <style jsx global>{`
        /* Make native date picker use light popover for better contrast */
        input[type="date"] {
          color-scheme: light;
        }
      `}</style>

      {error && (
        <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
          {error}
        </div>
      )}

      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-sm text-white/80 mb-1">Guest</label>
          <select
            className="w-full h-10 rounded-md border border-white/15 bg-slate-800 px-3 text-sm text-white outline-none"
            value={guestId}
            onChange={(e) => setGuestId(e.target.value)}
          >
            {guests.length === 0 && <option value="">No guests found</option>}
            {guests.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name} {g.email ? `(${g.email})` : ""}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-white/80 mb-1">Room</label>
          <select
            className="w-full h-10 rounded-md border border-white/15 bg-slate-800 px-3 text-sm text-white outline-none"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
          >
            {/* Force a visible placeholder until value is set */}
            {!roomId && <option value="">Select a room</option>}
            {rooms.map((r) => (
              <option key={r.id} value={r.id}>
                {r.title} (₹{r.price}/night, {r.capacity} pax)
              </option>
            ))}
          </select>
          {/* Helper text so details are visible without opening the dropdown */}
          {selectedRoom && (
            <div className="mt-1 text-white/70 text-sm">
              Selected: {selectedRoom.title} · ₹{selectedRoom.price}/night · {selectedRoom.capacity} pax
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-white/80 mb-1">Check-in</label>
            <input
              type="date"
              className="w-full h-10 rounded-md border border-white/15 bg-white/90 text-black px-3 text-sm outline-none"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm text-white/80 mb-1">Check-out</label>
            <input
              type="date"
              className="w-full h-10 rounded-md border border-white/15 bg-white/90 text-black px-3 text-sm outline-none"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm text-white/80 mb-1">Guests</label>
            <input
              className="w-full h-10 rounded-md border border-white/15 bg-white/5 px-3 text-sm text-white outline-none"
              value={count}
              onChange={(e) => setCount(e.target.value)}
              inputMode="numeric"
            />
          </div>
        </div>

        <div className="text-white/80">
          Nights: {nights} · Total: ₹{total}
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={posting}
            className="h-10 px-4 rounded-md bg-blue-600 text-white text-sm disabled:opacity-50"
          >
            {posting ? "Creating..." : "Create Booking"}
          </button>
          <button
            type="button"
            className="h-10 px-4 rounded-md border border-white/20 text-white text-sm"
            onClick={() => history.back()}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
