"use client";

import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { IoEye, IoEyeOff } from "react-icons/io5";

type Mode = "login" | "register";

interface Props {
  mode: Mode;
  status?: { type: "idle" | "loading" | "success" | "error"; message?: string };
}

export default function AuthForm({ mode, status }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [localStatus, setLocalStatus] = useState<{ type: "idle" | "loading" | "success" | "error"; message?: string }>({ type: "idle" });

  const isLoading = status?.type === "loading" || localStatus.type === "loading";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      setLocalStatus({ type: "loading", message: mode === "login" ? "Signing in..." : "Creating account..." });
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Request failed");
      }
      setLocalStatus({ type: "success", message: mode === "login" ? "Signed in successfully." : "Account created." });
      // Optional redirect:
      // window.location.href = mode === "login" ? "/" : "/login";
    } catch (err: any) {
      setLocalStatus({ type: "error", message: err.message || "Something went wrong" });
    }
  }

  function handleGoogle() {
    window.location.href = "/api/auth/google";
  }

  return (
    <div className="w-full max-w-md rounded-2xl glass p-6 sm:p-8 glow">
      <h1 className="text-2xl font-semibold text-white mb-2">
        {mode === "login" ? "Welcome back" : "Create an account"}
      </h1>
      <p className="text-sm text-gray-200/80 mb-6">
        {mode === "login" ? "Sign in to manage bookings, rooms, and guests." : "Register to start managing the hotel system."}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm mb-1 text-white/90">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@domain.com"
            className="w-full rounded-xl border border-white/20 bg-white/10 text-white placeholder-white/60 px-4 py-3 outline-none transition input-glow"
          />
        </div>

        <div>
          <label className="block text-sm mb-1 text-white/90">Password</label>
          <div className="relative">
            <input
              type={show ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-white/20 bg-white/10 text-white placeholder-white/60 px-4 py-3 pr-12 outline-none transition input-glow"
            />
            <button
              type="button"
              aria-label="Toggle password visibility"
              onClick={() => setShow((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/80 hover:text-white transition"
            >
              {show ? <IoEyeOff size={20} /> : <IoEye size={20} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-xl bg-gradient-to-r from-indigo-500 via-sky-500 to-cyan-400 text-white font-medium px-4 py-3 transition transform hover:-translate-y-0.5 btn-glow disabled:opacity-60"
        >
          {isLoading ? (mode === "login" ? "Signing in..." : "Creating...") : mode === "login" ? "Sign in" : "Create account"}
        </button>

        <div className="relative my-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/20" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-transparent px-2 text-white/70">or continue with</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleGoogle}
          className="w-full rounded-xl bg-white/95 text-gray-900 font-medium px-4 py-3 flex items-center justify-center gap-3 hover:bg-white transition btn-glow"
        >
          <FcGoogle size={20} />
          Continue with Google
        </button>
      </form>

      <div className="mt-4 min-h-[24px]">
        {status?.type === "error" && <p className="text-sm text-red-300">{status.message || "Authentication failed"}</p>}
        {status?.type === "success" && <p className="text-sm text-emerald-300">{status.message || "Success"}</p>}
        {localStatus.type === "error" && <p className="text-sm text-red-300">{localStatus.message}</p>}
        {localStatus.type === "success" && <p className="text-sm text-emerald-300">{localStatus.message}</p>}
      </div>
    </div>
  );
}
