// src/app/rooms/rooms-filters.tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function RoomsFilters() {
  const router = useRouter();
  const sp = useSearchParams();

  const [q, setQ] = useState(sp.get("q") ?? "");
  const [page, setPage] = useState(Number(sp.get("page") ?? "1"));
  const [pages, setPages] = useState<number | null>(null);

  useEffect(() => {
    setQ(sp.get("q") ?? "");
    setPage(Number(sp.get("page") ?? "1"));
  }, [sp]);

  // Allow parent page to pass total pages via a custom event
  useEffect(() => {
    const handler = (e: any) => {
      if (typeof e.detail?.pages === "number") setPages(e.detail.pages);
    };
    window.addEventListener("rooms:pages", handler as any);
    return () => window.removeEventListener("rooms:pages", handler as any);
  }, []);

  const apply = () => {
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (page > 1) params.set("page", String(page));
    router.push(`/rooms?${params.toString()}`);
    router.refresh();
  };

  const go = (p: number) => {
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (p > 1) params.set("page", String(p));
    router.push(`/rooms?${params.toString()}`);
    router.refresh();
  };

  return (
    <div className="rounded-xl border border-white/10 bg-slate-900/50 p-4 flex flex-wrap gap-3">
      <input
        className="h-10 rounded-md border border-white/15 bg-white/5 px-3 text-sm text-white placeholder:text-white/60 outline-none"
        placeholder="Search rooms"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && apply()}
      />
      <button
        onClick={apply}
        className="h-10 px-4 rounded-md bg-gradient-to-r from-indigo-600 via-sky-600 to-cyan-500 text-white text-sm"
      >
        Search
      </button>

      <div className="ml-auto flex items-center gap-2">
        <button
          onClick={() => go(Math.max(1, page - 1))}
          className="h-9 px-3 rounded-md border border-white/15 text-white/80 disabled:opacity-40"
          disabled={page <= 1}
        >
          Prev
        </button>
        <span className="text-white/70 text-sm">
          Page {page}
          {pages ? ` / ${pages}` : ""}
        </span>
        <button
          onClick={() => go((pages ?? page + 1) > page ? page + 1 : page + 1)}
          className="h-9 px-3 rounded-md border border-white/15 text-white/80 disabled:opacity-40"
          disabled={!!pages && page >= pages}
        >
          Next
        </button>
      </div>
    </div>
  );
}
