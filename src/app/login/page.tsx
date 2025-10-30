// app/login/page.tsx
"use client";

import { useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function Orb({ className = "" }: { className?: string }) {
  // pointer-events-none prevents blocking clicks
  return (
    <div
      className={`pointer-events-none absolute rounded-full blur-3xl opacity-30 ${className}`}
      aria-hidden="true"
    />
  );
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [show, setShow] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    start(async () => {
      const res = await signIn("credentials", { email, password: pwd, redirect: false });
      if (res?.error) return setErr(res.error);
      window.location.href = "/admin/dashboard?welcome=1";
    });
  };

  return (
    <div className="relative min-h-[100svh] overflow-hidden">
      {/* Animated gradient background */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_20%_0%,rgba(59,130,246,0.25)_0%,transparent_60%),radial-gradient(100%_80%_at_100%_100%,rgba(236,72,153,0.18)_0%,transparent_60%),radial-gradient(90%_70%_at_0%_100%,rgba(14,165,233,0.18)_0%,transparent_60%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[url('data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'160\\' height=\\'160\\' viewBox=\\'0 0 160 160\\'><path d=\\'M0 0h160v160H0z\\' fill=\\'none\\'/><g fill=\\'%23ffffff10\\'><circle cx=\\'1\\' cy=\\'1\\' r=\\'1\\'/></g></svg>')] opacity-30" />
      <div className="pointer-events-none absolute inset-0 backdrop-blur-[3px]" />

      {/* Floating orbs */}
      <Orb className="left-[-100px] top-[10%] h-72 w-72 bg-cyan-500" />
      <Orb className="right-[-80px] top-[30%] h-64 w-64 bg-fuchsia-500" />
      <Orb className="left-[20%] bottom-[-100px] h-80 w-80 bg-indigo-500" />

      <div className="relative mx-auto max-w-6xl px-6 py-16 grid lg:grid-cols-2 gap-10 items-center">
        {/* Hero copy */}
        <div className="text-center lg:text-left">
          <div className="inline-flex items-center justify-center lg:justify-start rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/70">
            Welcome to HMS
          </div>
          <h1 className="mt-4 text-4xl sm:text-5xl font-extrabold tracking-tight text-white drop-shadow">
            Sign in with style
          </h1>
          <p className="mt-3 text-white/75 max-w-xl">
            Access your hotel operations dashboard with enterprise-grade security and a world-class finish. You’ll love coming back here.
          </p>
        </div>

        {/* Glass card */}
        <div className="relative">
          <div className="rounded-3xl border border-white/10 bg-white/[0.06] backdrop-blur-xl p-6 sm:p-8 shadow-[0_20px_80px_-20px_rgba(0,0,0,0.6)]">
            {/* Big icon + heading */}
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-cyan-500 to-indigo-500 text-white text-2xl">
                🔐
              </div>
              <div>
                <div className="text-xl font-semibold text-white">Login</div>
                <div className="text-sm text-white/70">Choose your preferred method</div>
              </div>
            </div>

            {/* OAuth */}
            <div className="mt-6 space-y-3">
              <Button
                type="button"
                onClick={() => signIn("google", { callbackUrl: "/admin/dashboard?welcome=1" })}
                className="w-full justify-center rounded-xl bg-white text-black hover:bg-white/90 h-11 text-sm font-medium"
              >
                <span className="text-lg mr-2">🟡</span> Continue with Google
              </Button>
            </div>

            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-white/15" />
              <span className="text-xs text-white/60">or sign in with email</span>
              <div className="h-px flex-1 bg-white/15" />
            </div>

            {/* Credentials */}
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="email" className="text-white/85">Email</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-base">@</span>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9 h-11 bg-white/10 border-white/15 text-white placeholder:text-white/40"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password" className="text-white/85">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={show ? "text" : "password"}
                    value={pwd}
                    onChange={(e) => setPwd(e.target.value)}
                    className="pr-24 h-11 bg-white/10 border-white/15 text-white placeholder:text-white/40"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShow((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-white/80 hover:text-white bg-white/10 border border-white/15 rounded-md px-2 py-1"
                  >
                    {show ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {err && <p className="text-rose-300 text-sm">{err}</p>}

              <Button
                type="submit"
                disabled={pending}
                className="w-full h-11 rounded-xl bg-gradient-to-r from-indigo-600 via-sky-600 to-cyan-500 hover:opacity-95"
              >
                {pending ? "Signing in…" : "Sign in"}
              </Button>
            </form>

            <p className="mt-4 text-sm text-white/70 text-center">
              New here?{" "}
              <Link href="/register" className="text-cyan-300 hover:text-cyan-200 underline underline-offset-4">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
