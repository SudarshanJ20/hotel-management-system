// src/app/rooms/[id]/edit/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Room = {
  id: string;
  title: string;
  description: string | null;
  price: number;
  capacity: number;
  status: string;
  image: string | null;
};

export default function EditRoomPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [form, setForm] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/rooms/${id}`);
        if (!res.ok) throw new Error("Failed to load room");
        const r = (await res.json()) as Room;
        setForm(r);
      } catch (e: any) {
        setError(e.message ?? "Failed to load");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/rooms/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          price: Number(form.price),
          capacity: Number(form.capacity),
          status: form.status,
          image: form.image,
        }),
      });
      if (!res.ok) throw new Error("Save failed");
      router.push(`/rooms/${id}`);
      router.refresh();
    } catch (e: any) {
      setError(e.message ?? "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!confirm("Delete this room?")) return;
    setError(null);
    try {
      const res = await fetch(`/api/rooms/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      router.push("/rooms");
      router.refresh();
    } catch (e: any) {
      setError(e.message ?? "Delete failed");
    }
  };

  if (loading) return <div className="p-6 text-white/70">Loading…</div>;
  if (!form) return <div className="p-6 text-white/70">Room not found</div>;

  const input = "w-full h-10 rounded-md border border-white/15 bg-white/5 px-3 text-sm text-white placeholder:text-white/60 outline-none";
  const label = "block text-sm mb-1 text-white/90";

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold text-white">Edit Room</h1>
      <form onSubmit={save} className="space-y-4">
        <div>
          <label className={label}>Title</label>
          <input className={input} value={form.title ?? ""} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </div>
        <div>
          <label className={label}>Description</label>
          <input className={input} value={form.description ?? ""} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={label}>Price (INR)</label>
            <input
              className={input}
              type="number"
              min={0}
              value={form.price ?? 0}
              onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
            />
          </div>
          <div>
            <label className={label}>Capacity</label>
            <input
              className={input}
              type="number"
              min={1}
              value={form.capacity ?? 1}
              onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })}
            />
          </div>
        </div>
        <div>
          <label className={label}>Status</label>
          <select
            className={input}
            value={form.status ?? "AVAILABLE"}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          >
            <option className="bg-slate-900" value="AVAILABLE">AVAILABLE</option>
            <option className="bg-slate-900" value="UNAVAILABLE">UNAVAILABLE</option>
          </select>
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <div className="flex gap-3">
          <button disabled={saving} className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50">
            {saving ? "Saving..." : "Save"}
          </button>
          <button type="button" onClick={remove} className="border border-white/20 text-white px-4 py-2 rounded">
            Delete
          </button>
          <button type="button" onClick={() => router.back()} className="border border-white/20 text-white px-4 py-2 rounded">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
