// src/app/rooms/new/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewRoomPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [type, setType] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [capacity, setCapacity] = useState<number | "">(2);
  const [available, setAvailable] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description: type,
          price: Number(price),
          capacity: Number(capacity),
          status: available ? "AVAILABLE" : "UNAVAILABLE",
          image: null,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || `Failed: ${res.status}`);
      }
      router.push("/rooms");
      router.refresh();
    } catch (err: any) {
      setError(err.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full h-10 rounded-md border border-white/15 bg-white/5 px-3 text-sm text-white placeholder:text-white/60 outline-none focus:ring-2 focus:ring-cyan-400/40";
  const labelClass = "block text-xs font-medium mb-1 text-white/80 tracking-wide uppercase";

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-white">Create room</h1>
        <p className="mt-1 text-sm text-white/70">
          Add a new room category to your inventory and set its base rate.
        </p>
      </div>

      <div className="glass rounded-3xl p-6 border border-white/15">
        <form onSubmit={onSubmit} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={labelClass}>Room name</label>
              <input
                className={inputClass}
                placeholder="Deluxe King 101"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div>
              <label className={labelClass}>Type</label>
              <input
                className={inputClass}
                placeholder="Deluxe / Suite / Standard"
                value={type}
                onChange={(e) => setType(e.target.value)}
              />
            </div>

            <div>
              <label className={labelClass}>Capacity</label>
              <input
                className={inputClass}
                type="number"
                min={1}
                value={capacity}
                onChange={(e) =>
                  setCapacity(e.target.value === "" ? "" : Number(e.target.value))
                }
                placeholder="2"
              />
            </div>

            <div>
              <label className={labelClass}>Price (INR)</label>
              <input
                className={inputClass}
                type="number"
                min={0}
                value={price}
                onChange={(e) =>
                  setPrice(e.target.value === "" ? "" : Number(e.target.value))
                }
                placeholder="3500"
              />
              <p className="mt-1 text-[11px] text-white/55">
                Base rate per night before taxes.
              </p>
            </div>

            <div className="flex items-center gap-2 mt-1 sm:mt-7">
              <label className="inline-flex items-center gap-2 text-xs font-medium text-white/85">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-white/40 bg-transparent"
                  checked={available}
                  onChange={(e) => setAvailable(e.target.checked)}
                />
                <span>Mark as available</span>
              </label>
            </div>
          </div>

          {error && (
            <p className="text-red-300 text-xs bg-red-500/10 border border-red-500/40 rounded-md px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="btn-glow inline-flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 via-sky-500 to-cyan-400 px-6 py-2.5 text-sm font-medium text-white shadow-md disabled:opacity-60"
            >
              {loading ? "Creating..." : "Create room"}
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
