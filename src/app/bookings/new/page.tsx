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
  const [guestId, setGuestId] = useState("");
  const [roomId, setRoomId] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [count, setCount] = useState("1");
  const [error, setError] = useState<string | null>(null);
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    const load = async () => {
      // Rooms
      const roomsRes = await fetch("/api/rooms", { cache: "no-store" });
      const roomsJson = await roomsRes.json();
      const roomsList: Room[] = Array.isArray(roomsJson)
        ? roomsJson
        : roomsJson.items ?? [];
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
        const me = await fetch("/api/guests/me", {
          cache: "no-store",
        })
          .then((r) => r.json())
          .catch(() => null);
        if (me?.id) setGuestId(me.id);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPrivileged]);

  const selectedRoom = useMemo(
    () => rooms.find((r) => r.id === roomId) || null,
    [rooms, roomId]
  );

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
      setError("Select room and dates.");
      return;
    }
    const guestsNum = Number(count);
    if (!Number.isInteger(guestsNum) || guestsNum <= 0) {
      setError("Guests must be a positive integer.");
      return;
    }
    if (!guestId) {
      setError(
        isPrivileged
          ? "Select a guest."
          : "Could not find your guest profile, please try again."
      );
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
      setError(
        `Availability failed: ${availResp.status} ${availResp.statusText} ${text.slice(
          0,
          100
        )}`
      );
      return;
    }
    const avail = await availResp.json().catch(() => null);
    if (!avail?.ok) {
      setPosting(false);
      setError(avail?.reason || "Booking not available for those dates.");
      return;
    }

    // 2) Create booking
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
      setError(
        `Create failed: ${res.status} ${res.statusText} ${text.slice(0, 120)}`
      );
      return;
    }

    const created = await res.json().catch(() => null);
    setPosting(false);
    if (!created?.id) {
      setError("Booking created but no id returned.");
      return;
    }

    // For now, send user to My Bookings
    router.push("/my/bookings?created=1");
    router.refresh();
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await instantBook();
  };

  const label =
    "block text-xs font-medium mb-1 text-white/80 tracking-wide uppercase";
  const input =
    "w-full h-10 rounded-md border border-white/15 bg-white/5 px-3 text-sm text-white placeholder:text-white/60 outline-none focus:ring-2 focus:ring-cyan-400/40";

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-5">
        <h1 className="text-2xl font-semibold text-white">New booking</h1>
        <p className="mt-1 text-sm text-white/70">
          Choose a room, set the dates, and confirm the stay in one step.
        </p>
      </div>

      <div className="glass rounded-3xl p-6 border border-white/15 space-y-5">
        {error && (
          <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-200">
            {error}
          </div>
        )}

        <form onSubmit={submit} className="space-y-5">
          {/* Guest section */}
          {isPrivileged ? (
            <div>
              <label className={label}>Guest</label>
              <select
                className={input}
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
            <div className="rounded-2xl border border-white/15 bg-slate-950/70 p-4">
              <div className="text-xs font-medium text-white/65 uppercase tracking-wide">
                Guest
              </div>
              <div className="mt-1 text-sm text-white/90">
                {(session?.user as any)?.name ||
                  (session?.user as any)?.email ||
                  "You"}
              </div>
              <p className="mt-1 text-[11px] text-white/55">
                Bookings are automatically linked to your profile.
              </p>
              {guestId && <input type="hidden" name="guestId" value={guestId} />}
            </div>
          )}

          {/* Room */}
          <div>
            <label className={label}>Room</label>
            <select
              className={input}
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
              <div className="mt-1 text-xs text-white/65">
                Selected: {selectedRoom.title} · ₹{selectedRoom.price}/night ·{" "}
                {selectedRoom.capacity} pax
              </div>
            )}
          </div>

          {/* Dates & guests */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className={label}>Check-in</label>
              <input
                type="date"
                className="w-full h-10 rounded-md border border-white/15 bg-white/95 text-black px-3 text-sm outline-none"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                required
              />
            </div>
            <div>
              <label className={label}>Check-out</label>
              <input
                type="date"
                className="w-full h-10 rounded-md border border-white/15 bg-white/95 text-black px-3 text-sm outline-none"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                required
              />
            </div>
            <div>
              <label className={label}>Guests</label>
              <input
                className={input}
                value={count}
                onChange={(e) => setCount(e.target.value)}
                inputMode="numeric"
                required
              />
            </div>
          </div>

          {/* Summary */}
          <div className="rounded-2xl border border-white/15 bg-slate-950/80 p-4 text-xs text-white/70 space-y-1">
            <div>
              Nights: <span className="font-medium text-white">{nights}</span>
            </div>
            <div>
              Estimated total:{" "}
              <span className="font-semibold text-emerald-300">
                ₹{total.toLocaleString("en-IN")}
              </span>
            </div>
            <div className="text-[11px]">
              Final amount may include taxes and fees. Availability is checked
              again when you confirm.
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3 pt-1">
            <button
              type="submit"
              disabled={posting}
              className="btn-glow inline-flex items-center justify-center rounded-full bg-gradient-to-r from-cyan-400 via-sky-500 to-indigo-500 px-6 py-2.5 text-sm font-medium text-white shadow-md disabled:opacity-60"
            >
              {posting ? "Booking…" : "Confirm booking"}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex items-center justify-center rounded-full border border-white/25 bg-transparent px-5 py-2.5 text-sm font-medium text-white/85 hover:bg-white/10"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
