"use client";

import { useState } from "react";

export default function Subscribe() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      const r = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const j = await r.json();
      if (!r.ok) {
        setMsg({ ok: false, text: j.error ?? "Bir şeyler ters gitti." });
      } else {
        setMsg({ ok: true, text: "Kaydedildi! Yarın sabah ilk e-postayı alacaksın." });
        setEmail("");
      }
    } catch {
      setMsg({ ok: false, text: "Bağlantı hatası." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <form onSubmit={submit} className="flex gap-3">
        <input
          required
          type="email"
          placeholder="ornek@mail.com"
          className="input flex-1"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button
          disabled={busy}
          className="shrink-0 rounded-xl bg-lime-300 px-5 py-2.5 font-bold text-black transition hover:bg-lime-200 disabled:opacity-50"
        >
          {busy ? "…" : "Katıl"}
        </button>
      </form>
      {msg && (
        <p className={`mt-2 text-sm ${msg.ok ? "text-lime-300" : "text-red-400"}`}>{msg.text}</p>
      )}
      <p className="mt-2 text-[11px] text-slate-600">
        İstediğin zaman{" "}
        <a href="/unsubscribe" className="underline hover:text-lime-300">
          abonelikten çıkabilirsin
        </a>
        .
      </p>
    </div>
  );
}
