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

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-sm text-white/70">
        Loading room details…
      </div>
    );
  }

  if (!form) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-sm text-white/70">
        Room not found.
      </div>
    );
  }

  const input =
    "w-full h-10 rounded-md border border-white/15 bg-white/5 px-3 text-sm text-white placeholder:text-white/60 outline-none focus:ring-2 focus:ring-cyan-400/40";
  const label =
    "block text-xs font-medium mb-1 text-white/80 tracking-wide uppercase";

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-white">Edit room</h1>
          <p className="mt-1 text-sm text-white/70">
            Update details, pricing, and availability for this room.
          </p>
        </div>
      </div>

      <div className="glass rounded-3xl p-6 border border-white/15">
        <form onSubmit={save} className="space-y-5">
          <div className="space-y-4">
            <div>
              <label className={label}>Title</label>
              <input
                className={input}
                value={form.title ?? ""}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>

            <div>
              <label className={label}>Description</label>
              <textarea
                className={`${input} h-24 resize-none py-2`}
                value={form.description ?? ""}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={label}>Price (INR)</label>
                <input
                  className={input}
                  type="number"
                  min={0}
                  value={form.price ?? 0}
                  onChange={(e) =>
                    setForm({ ...form, price: Number(e.target.value) })
                  }
                />
                <p className="mt-1 text-[11px] text-white/55">
                  Base rate per night before taxes.
                </p>
              </div>
              <div>
                <label className={label}>Capacity</label>
                <input
                  className={input}
                  type="number"
                  min={1}
                  value={form.capacity ?? 1}
                  onChange={(e) =>
                    setForm({ ...form, capacity: Number(e.target.value) })
                  }
                />
              </div>
            </div>

            <div>
              <label className={label}>Status</label>
              <select
                className={input}
                value={form.status ?? "AVAILABLE"}
                onChange={(e) =>
                  setForm({ ...form, status: e.target.value })
                }
              >
                <option className="bg-slate-900" value="AVAILABLE">
                  AVAILABLE
                </option>
                <option className="bg-slate-900" value="UNAVAILABLE">
                  UNAVAILABLE
                </option>
              </select>
            </div>
          </div>

          {error && (
            <p className="text-red-300 text-xs bg-red-500/10 border border-red-500/40 rounded-md px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex flex-wrap gap-3 pt-1">
            <button
              type="submit"
              disabled={saving}
              className="btn-glow inline-flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 via-sky-500 to-cyan-400 px-6 py-2.5 text-sm font-medium text-white shadow-md disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
            <button
              type="button"
              onClick={remove}
              className="inline-flex items-center justify-center rounded-full border border-red-400/70 bg-red-500/10 px-5 py-2.5 text-sm font-medium text-red-200 hover:bg-red-500/20"
            >
              Delete room
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
