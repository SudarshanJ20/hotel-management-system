"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export default function NewRoomPage() {
  const router = useRouter();
  const [form, setForm] = useState({ title: "", description: "", price: "", capacity: "", image: "" });
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    const priceNum = Math.max(0, Number(form.price || 0));
    const capNum = Math.max(1, Number(form.capacity || 1));
    start(async () => {
      const res = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title.trim(),
          description: form.description,
          price: priceNum,
          capacity: capNum,
          image: form.image?.trim() || null,
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setErr(j?.error || "Failed to create");
        return;
      }
      setOk("Created!");
      setTimeout(() => router.push("/admin/rooms"), 400);
    });
  };

  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      <h1 className="text-xl font-semibold">New Room</h1>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <input
          className="w-full rounded-md bg-white/5 border border-white/15 px-3 py-2"
          placeholder="Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
        />

        <textarea
          className="w-full rounded-md bg-white/5 border border-white/15 px-3 py-2"
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={4}
        />

        <div className="grid grid-cols-2 gap-3">
          <div>
            <input
              className="w-full rounded-md bg-white/5 border border-white/15 px-3 py-2"
              placeholder="Price (₹)"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value.replace(/\D/g, "") })}
              inputMode="numeric"
              min={0}
              required
            />
            {!form.price && <p className="mt-1 text-xs text-white/50">Enter a number in ₹</p>}
          </div>
          <div>
            <input
              className="w-full rounded-md bg-white/5 border border-white/15 px-3 py-2"
              placeholder="Capacity"
              value={form.capacity}
              onChange={(e) => setForm({ ...form, capacity: e.target.value.replace(/\D/g, "") })}
              inputMode="numeric"
              min={1}
              required
            />
            {!form.capacity && <p className="mt-1 text-xs text-white/50">How many guests?</p>}
          </div>
        </div>

        <input
          className="w-full rounded-md bg-white/5 border border-white/15 px-3 py-2"
          placeholder="Image URL"
          value={form.image}
          onChange={(e) => setForm({ ...form, image: e.target.value })}
        />

        {ok && <p className="text-emerald-300 text-sm">{ok}</p>}
        {err && <p className="text-rose-300 text-sm">{err}</p>}

        <button type="submit" disabled={pending} className="rounded-lg px-4 py-2 bg-cyan-600 text-white hover:bg-cyan-500">
          {pending ? "Creating..." : "Create"}
        </button>
      </form>
    </div>
  );
}
