// src/app/bookings/new/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";

type Guest = { id: string; name: string; email: string | null; phone: string | null };
type Room = { id: string; title: string; price: number; capacity: number };

type MealPlan = "ROOM_ONLY" | "BREAKFAST_INCLUDED" | "HALF_BOARD" | "FULL_BOARD";

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
  const [guestCount, setGuestCount] = useState("1");

  // NEW STATE
  const [roomsCount, setRoomsCount] = useState("1");
  const [extraBed, setExtraBed] = useState(false);
  const [mealPlan, setMealPlan] = useState<MealPlan>("ROOM_ONLY");

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

  const parsedRoomsCount = useMemo(() => {
    const rc = Number(roomsCount);
    return Number.isFinite(rc) && rc > 0 ? rc : 1;
  }, [roomsCount]);

  const parsedGuests = useMemo(() => {
    const g = Number(guestCount);
    return Number.isFinite(g) && g > 0 ? g : 1;
  }, [guestCount]);

  const total = useMemo(() => {
    if (!selectedRoom || nights <= 0) return 0;

    // Base: room price * nights * roomsCount
    let price = selectedRoom.price * nights * parsedRoomsCount;

    // Extra bed charge (simple example: 30% of one room per night)
    if (extraBed) {
      const extraPerNight = Math.round(selectedRoom.price * 0.3);
      price += extraPerNight * nights;
    }

    // Meal plan charges (must match server logic)
    if (mealPlan === "BREAKFAST_INCLUDED") {
      price += 200 * nights * parsedRoomsCount;
    } else if (mealPlan === "HALF_BOARD") {
      price += 400 * nights * parsedRoomsCount;
    } else if (mealPlan === "FULL_BOARD") {
      price += 600 * nights * parsedRoomsCount;
    }

    return price;
  }, [selectedRoom, nights, parsedRoomsCount, extraBed, mealPlan]);

  const instantBook = async () => {
    setError(null);
    if (!roomId || !checkIn || !checkOut) {
      setError("Select room and dates.");
      return;
    }

    const guestsNum = parsedGuests;
    if (!Number.isInteger(guestsNum) || guestsNum <= 0) {
      setError("Guests must be a positive integer.");
      return;
    }

    const roomsNum = parsedRoomsCount;
    if (!Number.isInteger(roomsNum) || roomsNum <= 0) {
      setError("Number of rooms must be a positive integer.");
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
        roomsCount: roomsNum,
        extraBed,
        mealPlan,
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

    router.push("/my/bookings?created=1");
    router.refresh();
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await instantBook();
  };

  // UI helpers
  const label =
    "block text-[11px] font-semibold mb-1 text-white/90 tracking-[0.16em] uppercase";

  const input =
    "w-full h-10 rounded-md border border-cyan-200/40 bg-cyan-900/25 px-3 text-sm text-white placeholder:text-white/65 outline-none focus:ring-2 focus:ring-cyan-400/70 focus:border-cyan-300/80";

  const selectInput =
    "w-full h-10 rounded-md border border-cyan-200/40 bg-sky-900/30 px-3 text-sm text-white outline-none focus:ring-2 focus:ring-cyan-400/70 focus:border-cyan-300/80";

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Page heading */}
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-white">New booking</h1>
        <p className="mt-2 text-sm text-white/85">
          Choose a room, set the dates, and confirm the stay in one step.
        </p>
      </div>

      {/* Card */}
      <div className="rounded-3xl border border-white/20 bg-sky-900/20 shadow-2xl backdrop-blur-xl p-6 sm:p-7 space-y-6">
        {error && (
          <div className="rounded-2xl border border-red-500/50 bg-red-500/15 p-3 text-xs text-red-100">
            {error}
          </div>
        )}

        <form onSubmit={submit} className="space-y-6">
          {/* Guest section */}
          <section className="space-y-3">
            <h2 className="text-[11px] font-semibold tracking-[0.18em] uppercase text-white/75">
              Guest
            </h2>
            {isPrivileged ? (
              <div>
                <label className={label}>Select guest</label>
                <select
                  className={selectInput}
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
              <div className="rounded-2xl border border-white/20 bg-sky-900/25 px-4 py-3">
                <div className="text-[11px] font-semibold text-white/70 uppercase tracking-wide">
                  Booked as
                </div>
                <div className="mt-1 text-sm text-white">
                  {(session?.user as any)?.name ||
                    (session?.user as any)?.email ||
                    "You"}
                </div>
                <p className="mt-1 text-[11px] text-white/70">
                  Bookings are automatically linked to your profile.
                </p>
                {guestId && <input type="hidden" name="guestId" value={guestId} />}
              </div>
            )}
          </section>

          {/* Room section */}
          <section className="space-y-3">
            <h2 className="text-[11px] font-semibold tracking-[0.18em] uppercase text-white/75">
              Room
            </h2>
            <div>
              <label className={label}>Select room</label>
              <select
                className={selectInput}
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
                <div className="mt-1 text-xs text-white/80">
                  Selected: {selectedRoom.title} · ₹{selectedRoom.price}/night ·{" "}
                  {selectedRoom.capacity} pax
                </div>
              )}
            </div>
          </section>

          {/* Dates, guests, rooms */}
          <section className="space-y-3">
            <h2 className="text-[11px] font-semibold tracking-[0.18em] uppercase text-white/75">
              Stay details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className={label}>Check-in</label>
                <input
                  type="date"
                  className={input}
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className={label}>Check-out</label>
                <input
                  type="date"
                  className={input}
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className={label}>Guests</label>
                <input
                  className={input}
                  value={guestCount}
                  onChange={(e) => setGuestCount(e.target.value)}
                  inputMode="numeric"
                  required
                />
              </div>
              <div>
                <label className={label}>Rooms</label>
                <input
                  className={input}
                  value={roomsCount}
                  onChange={(e) => setRoomsCount(e.target.value)}
                  inputMode="numeric"
                  required
                />
              </div>
            </div>
          </section>

          {/* Extra bed + meal plan */}
          <section className="space-y-3">
            <h2 className="text-[11px] font-semibold tracking-[0.18em] uppercase text-white/75">
              Options
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={label}>Extra bed</label>
                <div className="flex items-center gap-2 text-sm text-white/90">
                  <input
                    id="extraBed"
                    type="checkbox"
                    className="h-4 w-4 rounded border border-white/80 bg-transparent"
                    checked={extraBed}
                    onChange={(e) => setExtraBed(e.target.checked)}
                  />
                  <label htmlFor="extraBed" className="text-xs text-white/85">
                    Add extra bed for this stay (additional charges apply)
                  </label>
                </div>
              </div>
              <div>
                <label className={label}>Meal plan</label>
                <select
                  className={selectInput}
                  value={mealPlan}
                  onChange={(e) => setMealPlan(e.target.value as MealPlan)}
                >
                  <option value="ROOM_ONLY">Room only</option>
                  <option value="BREAKFAST_INCLUDED">Breakfast included</option>
                  <option value="HALF_BOARD">Half board (breakfast + one meal)</option>
                  <option value="FULL_BOARD">Full board (all meals)</option>
                </select>
              </div>
            </div>
          </section>

          {/* Summary – keep dark */}
          <section className="space-y-2">
            <h2 className="text-[11px] font-semibold tracking-[0.18em] uppercase text-white/75">
              Summary
            </h2>
            <div className="rounded-2xl border border-white/18 bg-slate-950/90 p-4 text-xs text-white/80 space-y-1">
              <div>
                Nights: <span className="font-medium text-white">{nights}</span>
              </div>
              <div>
                Rooms:{" "}
                <span className="font-medium text-white">{parsedRoomsCount}</span>
              </div>
              <div>
                Estimated total:{" "}
                <span className="font-semibold text-emerald-300">
                  ₹{total.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="text-[11px] text-white/60">
                Final amount may include taxes and fees. Availability is checked
                again when you confirm.
              </div>
            </div>
          </section>

          {/* Actions */}
          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="submit"
              disabled={posting}
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-cyan-400 via-sky-500 to-indigo-500 px-6 py-2.5 text-sm font-medium text-white shadow-md disabled:opacity-60"
            >
              {posting ? "Booking…" : "Confirm booking"}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex items-center justify-center rounded-full border border-white/30 bg-transparent px-5 py-2.5 text-sm font-medium text-white/90 hover:bg-white/10"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
