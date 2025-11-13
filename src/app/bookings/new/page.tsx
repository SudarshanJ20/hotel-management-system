// src/app/bookings/new/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";

type Guest = { id: string; name: string; email: string | null; phone: string | null };
type Room = { id: string; title: string; price: number; capacity: number };

export default function NewBookingPage() {
  const router = useRouter();
  const search = useSearchParams();
  const { data: session } = useSession();
  const role = ((session?.user as any)?.role ?? "USER") as string;
  const isPrivileged = role === "ADMIN" || role === "MANAGER";

  const [guests, setGuests] = useState<Guest[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [guestId, setGuestId] = useState(""); // for ADMIN/MANAGER or auto for USER
  const [roomId, setRoomId] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [count, setCount] = useState("1");
  const [error, setError] = useState<string | null>(null);
  const [posting, setPosting] = useState(false);

  // Load rooms and, if needed, guests or self guest
  useEffect(() => {
    const load = async () => {
      // Rooms
      const roomsRes = await fetch("/api/rooms", { cache: "no-store" });
      const roomsJson = await roomsRes.json();
      const roomsList: Room[] = Array.isArray(roomsJson) ? roomsJson : roomsJson.items ?? [];
      setRooms(roomsList);

      // Preselect from query param if present
      const qpRoomId = search.get("roomId");
      if (!roomId) {
        if (qpRoomId && roomsList.some((r) => r.id === qpRoomId)) {
          setRoomId(qpRoomId);
        } else if (roomsList.length) {
          setRoomId(roomsList[0].id);
        }
      }

      if (isPrivileged) {
        // Load all guests for staff selection
        const gRes = await fetch("/api/guests", { cache: "no-store" });
        const gJson = await gRes.json();
        const gList: Guest[] = gJson.items ?? [];
        setGuests(gList);
        if (!guestId && gList.length) setGuestId(gList[0].id);
      } else {
        // USER: resolve their own guest record
        const me = await fetch("/api/guests/me", { cache: "no-store" }).then((r) => r.json()).catch(() => null);
        if (me?.id) setGuestId(me.id);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPrivileged]);

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

  const instantBook = async () => {
    setError(null);
    if (!roomId || !checkIn || !checkOut) {
      setError("Select room and dates");
      return;
    }
    const guestsNum = Number(count);
    if (!Number.isInteger(guestsNum) || guestsNum <= 0) {
      setError("Guests must be a positive integer");
      return;
    }
    if (!guestId) {
      setError(isPrivileged ? "Select a guest" : "Could not resolve your guest profile, please try again");
      return;
    }

    setPosting(true);

    // 1) Availability check for quick feedback
    const availResp = await fetch("/api/bookings/availability", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomId, checkIn, checkOut }),
    });
    if (!availResp.ok) {
      const text = await availResp.text().catch(() => "");
      setPosting(false);
      setError(`Availability failed: ${availResp.status} ${availResp.statusText} ${text.slice(0,100)}`);
      return;
    }
    const avail = await availResp.json().catch(() => null);
    if (!avail?.ok) {
      setPosting(false);
      setError(avail?.reason || "Booking not available");
      return;
    }

    // 2) Create booking (server still validates availability)
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

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      setPosting(false);
      setError(`Create failed: ${res.status} ${res.statusText} ${text.slice(0,120)}`);
      return;
    }

    const created = await res.json().catch(() => null);
    setPosting(false);
    if (!created?.id) {
      setError("Create returned no id");
      return;
    }
    // Redirect to detail or to /my/bookings if you keep detail staff-only
    // router.push(`/bookings/${created.id}`);
    router.push("/my/bookings?created=1");

    router.refresh();
  };

  // Submit ties to instantBook
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await instantBook();
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-xl font-semibold">New Booking</h1>

      <style jsx global>{`
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
        {/* Guest section */}
        {isPrivileged ? (
          <div>
            <label className="block text-sm text-white/80 mb-1">Guest</label>
            <select
              className="w-full h-10 rounded-md border border-white/15 bg-slate-800 px-3 text-sm text-white outline-none"
              value={guestId}
              onChange={(e) => setGuestId(e.target.value)}
              required
            >
              {guests.length === 0 && <option value="">No guests found</option>}
              {guests.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name} {g.email ? `(${g.email})` : ""}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="rounded-md border border-white/15 bg-slate-900/60 p-3">
            <div className="text-sm text-white/70">Guest</div>
            <div className="mt-1 text-white/90">
              {(session?.user as any)?.name || (session?.user as any)?.email || "You"}
            </div>
            {guestId && <input type="hidden" name="guestId" value={guestId} />}
          </div>
        )}

        <div>
          <label className="block text-sm text-white/80 mb-1">Room</label>
          <select
            className="w-full h-10 rounded-md border border-white/15 bg-slate-800 px-3 text-sm text-white outline-none"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            required
          >
            {!roomId && <option value="">Select a room</option>}
            {rooms.map((r) => (
              <option key={r.id} value={r.id}>
                {r.title} (₹{r.price}/night, {r.capacity} pax)
              </option>
            ))}
          </select>
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
              required
            />
          </div>
          <div>
            <label className="block text-sm text-white/80 mb-1">Check-out</label>
            <input
              type="date"
              className="w-full h-10 rounded-md border border-white/15 bg-white/90 text-black px-3 text-sm outline-none"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm text-white/80 mb-1">Guests</label>
            <input
              className="w-full h-10 rounded-md border border-white/15 bg-white/5 px-3 text-sm text-white outline-none"
              value={count}
              onChange={(e) => setCount(e.target.value)}
              inputMode="numeric"
              required
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
            {posting ? "Booking..." : "Instant Book"}
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
