// app/register/page.tsx
"use client";

import { useState, FormEvent } from "react";
import { signIn } from "next-auth/react";

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr("");
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setErr(j.error || "Failed to register");
      setLoading(false);
      return;
    }

    const si = await signIn("credentials", {
      redirect: false,
      email: form.email,
      password: form.password,
      callbackUrl: "/dashboard",
    });
    setLoading(false);
    if (si?.ok) window.location.href = "/dashboard";
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-lg border p-6 shadow-sm bg-white/5">
        <h1 className="text-2xl font-semibold mb-6 text-center">Create account</h1>

        {/* Google sign up */}
        <button
          onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          className="w-full flex items-center justify-center gap-2 rounded bg-red-600 text-white py-2 hover:bg-red-700"
        >
          Continue with Google
        </button>

        <div className="my-4 text-center text-sm text-gray-400">or</div>

        {/* Email/password registration */}
        <form onSubmit={onSubmit} className="space-y-3">
          <input
            type="text"
            placeholder="Full name"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            className="w-full border border-gray-600 bg-transparent rounded px-3 py-2"
          />
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
            className="w-full border border-gray-600 bg-transparent rounded px-3 py-2"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
            className="w-full border border-gray-600 bg-transparent rounded px-3 py-2"
            required
          />
          {err && <p className="text-red-400 text-sm">{err}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-green-600 text-white py-2 hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create account"}
          </button>
        </form>
      </div>
    </div>
  );
}
