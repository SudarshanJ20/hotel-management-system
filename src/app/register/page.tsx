// app/register/page.tsx
"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function Orb({ className = "" }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none absolute rounded-full blur-3xl opacity-30 ${className}`}
      aria-hidden="true"
    />
  );
}

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    setErr(null);
    start(async () => {
      try {
        const res = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password: pwd }),
        });
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          throw new Error(j?.error || "Failed to register");
        }
        setMsg("Account created. You can sign in now.");
      } catch (e: any) {
        setErr(e.message || "Something went wrong");
      }
    });
  };

  return (
    <div className="relative min-h-[100svh] overflow-hidden">
      {/* Background layers */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_20%_0%,rgba(244,63,94,0.22)_0%,transparent_60%),radial-gradient(100%_80%_at_100%_100%,rgba(99,102,241,0.2)_0%,transparent_60%),radial-gradient(90%_70%_at_0%_100%,rgba(6,182,212,0.18)_0%,transparent_60%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[url('data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'160\\' height=\\'160\\' viewBox=\\'0 0 160 160\\'><path d=\\'M0 0h160v160H0z\\' fill=\\'none\\'/><g fill=\\'%23ffffff10\\'><circle cx=\\'1\\' cy=\\'1\\' r=\\'1\\'/></g></svg>')] opacity-30" />
      <div className="pointer-events-none absolute inset-0 backdrop-blur-[3px]" />

      {/* Orbs */}
      <Orb className="left-[-90px] top-[8%] h-72 w-72 bg-pink-500" />
      <Orb className="right-[-80px] top-[32%] h-64 w-64 bg-indigo-500" />
      <Orb className="left-[25%] bottom-[-100px] h-80 w-80 bg-cyan-500" />

      <div className="relative mx-auto max-w-6xl px-6 py-16 grid lg:grid-cols-2 gap-10 items-center">
        {/* Hero copy */}
        <div className="text-center lg:text-left">
          <div className="inline-flex items-center justify-center lg:justify-start rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/70">
            Create your HMS account
          </div>
          <h1 className="mt-4 text-4xl sm:text-5xl font-extrabold tracking-tight text-white drop-shadow">
            Join the experience
          </h1>
          <p className="mt-3 text-white/75 max-w-xl">
            Start managing rooms, bookings, and guests with a beautifully simple workflow.
          </p>
        </div>

        {/* Glass card */}
        <div className="relative">
          <div className="rounded-3xl border border-white/10 bg-white/[0.06] backdrop-blur-xl p-6 sm:p-8 shadow-[0_20px_80px_-20px_rgba(0,0,0,0.6)]">
            {/* Big icon + heading */}
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-pink-500 to-violet-500 text-white text-2xl">
                ✨
              </div>
              <div>
                <div className="text-xl font-semibold text-white">Create account</div>
                <div className="text-sm text-white/70">It only takes a minute</div>
              </div>
            </div>

            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name" className="text-white/85">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-11 bg-white/10 border-white/15 text-white placeholder:text-white/40"
                  placeholder="Your name"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email" className="text-white/85">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 bg-white/10 border-white/15 text-white placeholder:text-white/40"
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password" className="text-white/85">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={pwd}
                  onChange={(e) => setPwd(e.target.value)}
                  className="h-11 bg-white/10 border-white/15 text-white placeholder:text-white/40"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>

              {msg && <p className="text-emerald-300 text-sm">{msg}</p>}
              {err && <p className="text-rose-300 text-sm">{err}</p>}

              <Button
                type="submit"
                disabled={pending}
                className="w-full h-11 rounded-xl bg-gradient-to-r from-pink-600 via-fuchsia-600 to-violet-500 hover:opacity-95"
              >
                {pending ? "Creating…" : "Create account"}
              </Button>
            </form>

            <p className="mt-4 text-sm text-white/70 text-center">
              Already have an account?{" "}
              <Link href="/login" className="text-cyan-300 hover:text-cyan-200 underline underline-offset-4">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
