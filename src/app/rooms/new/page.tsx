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
          // IMPORTANT: matches your API (expects title, price, capacity, …)
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
    "w-full h-10 rounded-md border border-white/15 bg-white/5 px-3 text-sm text-white placeholder:text-white/60 outline-none";
  const labelClass = "block text-sm mb-1 text-white/90";

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-semibold text-white mb-4">Create Room</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className={labelClass}>Name</label>
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

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Price (INR)</label>
            <input
              className={inputClass}
              type="number"
              min={0}
              value={price}
              onChange={(e) => setPrice(e.target.value === "" ? "" : Number(e.target.value))}
              placeholder="3500"
            />
          </div>
          <div>
            <label className={labelClass}>Capacity</label>
            <input
              className={inputClass}
              type="number"
              min={1}
              value={capacity}
              onChange={(e) => setCapacity(e.target.value === "" ? "" : Number(e.target.value))}
              placeholder="2"
            />
          </div>
        </div>

        <label className="inline-flex items-center gap-2 text-white">
          <input
            type="checkbox"
            className="h-4 w-4"
            checked={available}
            onChange={(e) => setAvailable(e.target.checked)}
          />
          <span>Available</span>
        </label>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="border border-white/20 text-white px-4 py-2 rounded"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
