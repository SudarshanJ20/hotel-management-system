// app/register/page.tsx
"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

function Toast({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div className="fixed inset-x-0 top-4 z-50 flex justify-center">
      <div className="animate-[fade-in_0.2s_ease-out] rounded-full bg-black/80 px-4 py-2 text-sm text-white shadow-lg backdrop-blur">
        {message}
      </div>
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const [toast, setToast] = useState("");

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
        setMsg("Account created. Redirecting to login…");
        setToast("Account created successfully");
        setTimeout(() => {
          router.push("/login");
        }, 900);
      } catch (e: any) {
        setErr(e.message || "Something went wrong");
      }
    });
  };

  return (
    <div className="min-h-[100vh] flex items-center justify-center px-4">
      <Toast message={toast} />

      <div className="relative flex w-full max-w-5xl items-center gap-10 lg:gap-16">
        {/* Left: hotel-focused copy */}
        <div className="hidden md:block flex-1 text-white space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-300">
            Start your stay
          </p>
          <h1 className="text-3xl sm:text-4xl font-semibold leading-snug">
            Create an account to{" "}
            <span className="text-cyan-300">book your perfect room.</span>
          </h1>
          <p className="text-sm text-white/75 max-w-md">
            Save your details once and enjoy faster bookings for every visit,
            from business trips to weekend getaways.
          </p>
          <ul className="mt-2 text-xs text-white/70 space-y-1.5">
            <li>• Reserve deluxe, suite, and classic rooms in a few taps.</li>
            <li>• See all upcoming and past stays in one place.</li>
            <li>• Make repeat bookings easier with stored guest info.</li>
          </ul>
        </div>

        {/* Right: registration card */}
        <div className="flex-1 flex justify-end">
          <div className="w-full max-w-md rounded-3xl bg-slate-950/85 border border-white/12 shadow-[0_24px_70px_rgba(15,23,42,0.9)] backdrop-blur-xl px-6 py-8 sm:px-8 sm:py-9">
            <div className="text-left">
              <h2 className="text-2xl font-semibold text-white">
                Create your account
              </h2>
              <p className="mt-2 text-sm text-white/70">
                A few details and you are ready to start booking.
              </p>
            </div>

            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="name"
                  className="text-sm font-medium text-white/85"
                >
                  Full name
                </label>
                <input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-11 rounded-2xl border border-white/15 bg-white/5 px-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-cyan-400/70 focus:ring-2 focus:ring-cyan-400/30"
                  placeholder="Your name"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-white/85"
                >
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-11 rounded-2xl border border-white/15 bg-white/5 px-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-cyan-400/70 focus:ring-2 focus:ring-cyan-400/30"
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-white/85"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={pwd}
                  onChange={(e) => setPwd(e.target.value)}
                  className="w-full h-11 rounded-2xl border border-white/15 bg-white/5 px-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-cyan-400/70 focus:ring-2 focus:ring-cyan-400/30"
                  placeholder="Create a strong password"
                  required
                  minLength={6}
                />
              </div>

              {msg && (
                <p className="text-xs text-emerald-300">
                  {msg}
                </p>
              )}
              {err && (
                <p className="text-xs text-rose-300">
                  {err}
                </p>
              )}

              <button
                type="submit"
                disabled={pending}
                className="mt-1 w-full h-11 rounded-2xl bg-gradient-to-r from-indigo-600 via-sky-500 to-cyan-400 text-sm font-semibold text-white shadow-[0_18px_55px_rgba(59,130,246,0.7)] hover:opacity-95 disabled:opacity-60"
              >
                {pending ? "Creating…" : "Create account"}
              </button>
            </form>

            <div className="mt-5 text-center text-xs text-white/70">
              <span>Already have a booking profile? </span>
              <Link
                href="/login"
                className="font-medium text-cyan-300 hover:text-cyan-200"
              >
                Sign in to continue
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
