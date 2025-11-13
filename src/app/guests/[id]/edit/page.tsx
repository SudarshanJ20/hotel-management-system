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
    return <div className="p-6 text-white/70">Loading...</div>;
  }

  if (!guest) {
    return <div className="p-6 text-red-300">Guest not found.</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Edit Guest</h1>
        <button
          onClick={remove}
          disabled={saving}
          className="h-10 px-4 rounded-md bg-red-600 text-white text-sm disabled:opacity-50"
        >
          {saving ? "Working..." : "Delete"}
        </button>
      </div>

      {error && (
        <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
          {error}
        </div>
      )}

      <form onSubmit={save} className="space-y-4">
        <div>
          <label className="block text-sm text-white/80 mb-1">Name</label>
          <input
            className="w-full h-10 rounded-md border border-white/15 bg-white/5 px-3 text-sm text-white outline-none"
            value={guest.name}
            onChange={(e) => setGuest({ ...guest, name: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-white/80 mb-1">Email</label>
            <input
              className="w-full h-10 rounded-md border border-white/15 bg-white/5 px-3 text-sm text-white outline-none"
              value={guest.email || ""}
              onChange={(e) => setGuest({ ...guest, email: e.target.value })}
              type="email"
            />
          </div>
          <div>
            <label className="block text-sm text-white/80 mb-1">Phone</label>
            <input
              className="w-full h-10 rounded-md border border-white/15 bg-white/5 px-3 text-sm text-white outline-none"
              value={guest.phone || ""}
              onChange={(e) => setGuest({ ...guest, phone: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-white/80 mb-1">Address</label>
          <textarea
            className="w-full min-h-24 rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none"
            value={guest.address || ""}
            onChange={(e) => setGuest({ ...guest, address: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm text-white/80 mb-1">Notes</label>
          <textarea
            className="w-full min-h-24 rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none"
            value={guest.notes || ""}
            onChange={(e) => setGuest({ ...guest, notes: e.target.value })}
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="h-10 px-4 rounded-md bg-blue-600 text-white text-sm disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save"}
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
