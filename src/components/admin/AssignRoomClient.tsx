// src/components/admin/AssignRoomClient.tsx
"use client";

import { useState, useTransition } from "react";

type BookingRow = {
  id: string;
  guestName: string;
  checkIn: string;
  checkOut: string;
  checkInTime: string;
  checkOutTime: string;
  nights: number;
};

type RoomOption = {
  id: string;
  title: string;
};

export default function AssignRoomClient({
  bookings,
  rooms,
}: {
  bookings: BookingRow[];
  rooms: RoomOption[];
}) {
  const [selectedRoom, setSelectedRoom] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const onAssign = (bookingId: string) => {
    const roomId = selectedRoom[bookingId];
    setMsg(null);
    setErr(null);

    if (!roomId) {
      setErr("Please select a room first.");
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch("/api/admin/assign-room", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bookingId, roomId }),
        });

        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          throw new Error(j?.error || "Failed to assign room");
        }

        const data = await res.json().catch(() => null);
        setMsg(
          `Room assigned: ${data?.room?.title ?? ""} for ${data?.guest?.name ?? ""}`
        );
        // Optionally you can refresh the page to remove the row
        window.location.reload();
      } catch (e: any) {
        setErr(e.message || "Something went wrong");
      }
    });
  };

  const label = "text-xs font-medium text-white/60";
  const chip =
    "inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border border-white/10 bg-white/5 text-white/70";

  return (
    <div className="space-y-4 rounded-2xl border border-white/10 bg-slate-950/60 p-4">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-white/90">
          Pending bookings
        </div>
        <div className="text-[11px] text-white/50">
          {bookings.length} booking{bookings.length === 1 ? "" : "s"} need a room
        </div>
      </div>

      {msg && (
        <div className="rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200">
          {msg}
        </div>
      )}
      {err && (
        <div className="rounded-md border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
          {err}
        </div>
      )}

      <div className="space-y-3">
        {bookings.map((b) => (
          <div
            key={b.id}
            className="rounded-xl border border-white/10 bg-slate-950/80 px-4 py-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="space-y-1">
              <div className="text-sm font-medium text-white">
                {b.guestName}
              </div>
              <div className="flex flex-wrap gap-2 text-[11px] text-white/60">
                <span className={chip}>
                  Check-in: {b.checkIn} · {b.checkInTime}
                </span>
                <span className={chip}>
                  Check-out: {b.checkOut} · {b.checkOutTime}
                </span>
                <span className={chip}>{b.nights} night{b.nights === 1 ? "" : "s"}</span>
              </div>
            </div>

            <div className="flex flex-col sm:items-end gap-2">
              <div className="flex items-center gap-2">
                <label className={label}>Room</label>
                <select
                  className="rounded-md bg-slate-900 border border-white/15 text-xs px-2 py-1 text-white/90"
                  value={selectedRoom[b.id] ?? ""}
                  onChange={(e) =>
                    setSelectedRoom((prev) => ({
                      ...prev,
                      [b.id]: e.target.value,
                    }))
                  }
                  disabled={pending}
                >
                  <option value="">Select room</option>
                  {rooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.title}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                disabled={pending}
                onClick={() => onAssign(b.id)}
                className="self-start sm:self-end rounded-md px-3 py-1.5 text-xs font-medium bg-indigo-600 text-white disabled:opacity-50"
              >
                {pending ? "Assigning..." : "Assign room"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
