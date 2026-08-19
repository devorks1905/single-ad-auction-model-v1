"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr("");

    try {
      const r = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        setErr(j.error ?? "Şifre yanlış.");
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setErr("Bağlantı hatası.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-sm flex-col justify-center px-5">
      <h1 className="text-2xl font-black">Admin girişi</h1>
      <form onSubmit={submit} className="mt-4 space-y-3">
        <input
          type="password"
          autoFocus
          className="input"
          placeholder="Şifre"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          disabled={loading}
          className="w-full rounded-xl bg-lime-300 py-2.5 font-bold text-black disabled:opacity-50"
        >
          {loading ? "Giriş yapılıyor…" : "Giriş"}
        </button>
        {err && <p className="text-sm text-red-400">{err}</p>}
      </form>
    </main>
  );
}
