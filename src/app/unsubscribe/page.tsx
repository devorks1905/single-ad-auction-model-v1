"use client";

import { useState } from "react";

export default function UnsubscribePage() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);

    try {
      const r = await fetch("/api/subscribe", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const j = await r.json();
      if (!r.ok) {
        setMsg({ ok: false, text: j.error ?? "Bir şeyler ters gitti." });
      } else {
        setMsg({ ok: true, text: "Abonelikten çıktın. Artık e-posta almayacaksın." });
        setEmail("");
      }
    } catch {
      setMsg({ ok: false, text: "Bağlantı hatası." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-md flex-col justify-center px-5">
      <h1 className="text-2xl font-black">Abonelikten çık</h1>
      <p className="mt-2 text-sm text-slate-400">
        Sabah bildirimlerini almak istemiyorsan e-posta adresini gir. Teklif vermeye devam
        edebilirsin — bu sadece günlük özet e-postalarını durdurur.
      </p>
      <form onSubmit={submit} className="mt-6 space-y-3">
        <input
          required
          type="email"
          autoFocus
          className="input"
          placeholder="E-posta adresin"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button
          disabled={busy}
          className="w-full rounded-xl bg-slate-700 py-2.5 font-bold text-slate-100 transition hover:bg-slate-600 disabled:opacity-50"
        >
          {busy ? "İşleniyor…" : "Abonelikten çık"}
        </button>
        {msg && (
          <p className={`text-sm ${msg.ok ? "text-lime-300" : "text-red-400"}`}>{msg.text}</p>
        )}
      </form>
    </main>
  );
}
