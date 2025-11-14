// src/app/guests/[id]/edit/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Guest = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  notes: string | null;
};

export default function EditGuestPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [guest, setGuest] = useState<Guest | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let canceled = false;
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/guests/${id}`);
        if (!res.ok) {
          setError(`Failed to load guest: ${res.status} ${res.statusText}`);
          setLoading(false);
          return;
        }
        const data = (await res.json()) as Guest;
        if (!canceled) {
          setGuest(data);
          setLoading(false);
        }
      } catch (e: any) {
        if (!canceled) {
          setError(e.message ?? "Failed to load guest");
          setLoading(false);
        }
      }
    };
    load();
    return () => {
      canceled = true;
    };
  }, [id]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guest) return;
    if (!guest.name.trim()) {
      setError("Name is required");
      return;
    }
    setSaving(true);
    setError(null);

    const res = await fetch(`/api/guests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(guest),
    });
    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data?.error ?? `Failed: ${res.status} ${res.statusText}`);
      return;
    }

    router.push(`/guests/${id}`);
    router.refresh();
  };

  const remove = async () => {
    if (!confirm("Delete this guest? This action cannot be undone.")) return;
    setSaving(true);
    const res = await fetch(`/api/guests/${id}`, { method: "DELETE" });
    setSaving(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data?.error ?? `Failed: ${res.status} ${res.statusText}`);
      return;
    }
    router.push("/guests");
    router.refresh();
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-sm text-white/70">
        Loading guest…
      </div>
    );
  }

  if (!guest) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-sm text-red-300">
        Guest not found.
      </div>
    );
  }

  const label =
    "block text-xs font-medium mb-1 text-white/80 tracking-wide uppercase";
  const input =
    "w-full h-10 rounded-md border border-white/15 bg-white/5 px-3 text-sm text-white placeholder:text-white/60 outline-none focus:ring-2 focus:ring-cyan-400/40";

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-white">Edit guest</h1>
          <p className="mt-1 text-sm text-white/70">
            Update contact details and notes for this guest.
          </p>
        </div>
        <button
          onClick={remove}
          disabled={saving}
          className="inline-flex items-center rounded-full border border-red-400/70 bg-red-500/10 px-5 py-2.5 text-xs font-medium text-red-200 hover:bg-red-500/20 disabled:opacity-60"
        >
          {saving ? "Working…" : "Delete guest"}
        </button>
      </div>

      <div className="glass rounded-3xl p-6 border border-white/15 space-y-5">
        {error && (
          <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-200">
            {error}
          </div>
        )}

        <form onSubmit={save} className="space-y-5">
          <div>
            <label className={label}>Name</label>
            <input
              className={input}
              value={guest.name}
              onChange={(e) => setGuest({ ...guest, name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={label}>Email</label>
              <input
                className={input}
                value={guest.email || ""}
                onChange={(e) =>
                  setGuest({ ...guest, email: e.target.value })
                }
                type="email"
              />
            </div>
            <div>
              <label className={label}>Phone</label>
              <input
                className={input}
                value={guest.phone || ""}
                onChange={(e) =>
                  setGuest({ ...guest, phone: e.target.value })
                }
              />
            </div>
          </div>

          <div>
            <label className={label}>Address</label>
            <textarea
              className={`${input} min-h-24 py-2 resize-none`}
              value={guest.address || ""}
              onChange={(e) =>
                setGuest({ ...guest, address: e.target.value })
              }
            />
          </div>

          <div>
            <label className={label}>Notes</label>
            <textarea
              className={`${input} min-h-24 py-2 resize-none`}
              value={guest.notes || ""}
              onChange={(e) =>
                setGuest({ ...guest, notes: e.target.value })
              }
            />
          </div>

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
              className="inline-flex items-center justify-center rounded-full border border-white/25 bg-transparent px-5 py-2.5 text-sm font-medium text-white/85 hover:bg-white/10"
              onClick={() => router.back()}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
