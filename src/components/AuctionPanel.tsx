"use client";

import { useCallback, useEffect, useState } from "react";

type BidRow = {
  id: number;
  bidder: string;
  amount: number;
  adHeadline: string;
  adEmoji: string;
  createdAt: string;
};

type AuctionData = {
  slotDate: string;
  closesAt: string;
  highest: number;
  minNext: number;
  bidCount: number;
  topBids: BidRow[];
};

function useCountdown(target?: string) {
  const [left, setLeft] = useState("--:--:--");
  useEffect(() => {
    if (!target) return;
    const tick = () => {
      const ms = new Date(target).getTime() - Date.now();
      if (ms <= 0) return setLeft("00:00:00");
      const h = Math.floor(ms / 3600000);
      const m = Math.floor((ms % 3600000) / 60000);
      const s = Math.floor((ms % 60000) / 1000);
      setLeft(
        [h, m, s].map((n) => String(n).padStart(2, "0")).join(":"),
      );
    };
    tick();
    const i = setInterval(tick, 1000);
    return () => clearInterval(i);
  }, [target]);
  return left;
}

export default function AuctionPanel({ compact = false }: { compact?: boolean }) {
  const [data, setData] = useState<AuctionData | null>(null);
  const [form, setForm] = useState({
    bidder: "",
    email: "",
    amount: "",
    adHeadline: "",
    adBody: "",
    adUrl: "",
    adEmoji: "🚀",
  });
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const r = await fetch("/api/auction", { cache: "no-store" });
      if (r.ok) setData(await r.json());
    } catch {
      /* noop — tekrar denecek */
    }
  }, []);

  useEffect(() => {
    load();
    const i = setInterval(load, 5000);
    return () => clearInterval(i);
  }, [load]);

  const left = useCountdown(data?.closesAt);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      const r = await fetch("/api/bids", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, amount: Number(form.amount) }),
      });
      const j = await r.json();
      if (!r.ok) return setMsg({ ok: false, text: j.error ?? "Bir şeyler ters gitti." });
      setMsg({ ok: true, text: "Teklifin en yükseği! Gece kapanışa kadar dayanırsa slot senin." });
      setForm((f) => ({ ...f, amount: "" }));
      load();
    } catch {
      setMsg({ ok: false, text: "Bağlantı hatası. Tekrar dene." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <div className="flex items-center justify-between text-xs uppercase tracking-widest text-slate-400">
          <span>Yarının tek slotu · {data?.slotDate ?? "…"}</span>
          <span className="rounded-full bg-lime-300/10 px-2 py-1 text-lime-300">CANLI</span>
        </div>
        <div className="mt-4 text-6xl font-black tabular-nums text-lime-300">
          ${(data?.highest ?? 0).toLocaleString("en-US")}
        </div>
        <p className="mt-1 text-sm text-slate-400">
          {data?.bidCount ?? 0} teklif · minimum sıradaki teklif $
          {(data?.minNext ?? 50).toLocaleString("en-US")}
        </p>
        <div className="mt-5 rounded-xl bg-black/40 p-4">
          <div className="text-xs uppercase tracking-widest text-slate-500">Kapanışa kalan</div>
          <div className="font-mono text-3xl font-bold">{left}</div>
        </div>

        {!compact && (
          <ul className="mt-5 space-y-2 text-sm">
            {(data?.topBids ?? []).map((b, i) => (
              <li
                key={b.id}
                className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2"
              >
                <span className="truncate">
                  <span className="mr-2 text-slate-500">#{i + 1}</span>
                  {b.adEmoji} <strong>{b.bidder}</strong>{" "}
                  <span className="text-slate-500">— {b.adHeadline}</span>
                </span>
                <span className="ml-3 shrink-0 font-mono text-lime-300">
                  ${b.amount.toLocaleString("en-US")}
                </span>
              </li>
            ))}
            {data && data.topBids.length === 0 && (
              <li className="text-slate-500">Henüz teklif yok. İlk teklifi sen ver, tarihe geç.</li>
            )}
          </ul>
        )}
      </div>

      <form
        onSubmit={submit}
        className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 space-y-3"
      >
        <h3 className="text-lg font-bold">Teklif ver</h3>
        <p className="text-xs text-slate-400">
          Kazanan tek kişi. Yarın bu sitedeki tek reklam senin olur. Ödeme kapanıştan sonra
          e-posta ile alınır — kredi kartı bilgisi istemiyoruz.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <input
            required
            placeholder="Adın / markan"
            maxLength={100}
            className="input"
            value={form.bidder}
            onChange={(e) => setForm({ ...form, bidder: e.target.value })}
          />
          <input
            required
            type="email"
            placeholder="E-posta"
            maxLength={200}
            className="input"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-[1fr_5rem] gap-3">
          <input
            required
            type="number"
            min={1}
            step="1"
            placeholder={`Teklif ($${data?.minNext ?? 50}+)`}
            className="input"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
          />
          <input
            placeholder="Emoji"
            className="input text-center"
            value={form.adEmoji}
            onChange={(e) => setForm({ ...form, adEmoji: e.target.value })}
          />
        </div>
        <input
          required
          maxLength={70}
          placeholder="Reklam başlığı (70 karakter)"
          className="input"
          value={form.adHeadline}
          onChange={(e) => setForm({ ...form, adHeadline: e.target.value })}
        />
        <input
          maxLength={140}
          placeholder="Alt metin (140 karakter)"
          className="input"
          value={form.adBody}
          onChange={(e) => setForm({ ...form, adBody: e.target.value })}
        />
        <input
          required
          maxLength={500}
          placeholder="https://siten.com"
          className="input"
          value={form.adUrl}
          onChange={(e) => setForm({ ...form, adUrl: e.target.value })}
        />
        <button
          disabled={busy}
          className="w-full rounded-xl bg-lime-300 px-4 py-3 font-bold text-black transition hover:bg-lime-200 disabled:opacity-50"
        >
          {busy ? "Gönderiliyor…" : "Teklifi gönder"}
        </button>
        {msg && (
          <p className={`text-sm ${msg.ok ? "text-lime-300" : "text-red-400"}`}>{msg.text}</p>
        )}
      </form>
    </div>
  );
}
