"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export type AdminBid = {
  id: number;
  bidder: string;
  email: string;
  amount: number;
  adHeadline: string;
  adBody: string;
  adUrl: string;
  adEmoji: string;
  rejected: boolean;
  isWinner: boolean;
  paymentStatus: string;
  paymentLink: string | null;
  createdAt: string;
};

function useAction() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string>("");
  const run = async (payload: Record<string, unknown>) => {
    setMsg("");
    const r = await fetch("/api/admin/actions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const j = await r.json().catch(() => ({}));
    setMsg(r.ok ? (j.info ?? j.url ?? "Tamam ✓") : (j.error ?? "Hata"));
    start(() => router.refresh());
  };
  return { run, pending, msg };
}

const btn =
  "rounded-lg border border-white/15 px-2.5 py-1 text-xs hover:border-lime-300 hover:text-lime-300 transition";

export function BidRow({ b }: { b: AdminBid }) {
  const { run, msg } = useAction();
  const [link, setLink] = useState("");
  return (
    <div
      className={`rounded-xl border p-4 ${
        b.rejected
          ? "border-red-500/30 bg-red-500/5 opacity-60"
          : b.isWinner
            ? "border-lime-300/50 bg-lime-300/5"
            : "border-white/10 bg-white/[0.02]"
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="font-semibold">
            {b.adEmoji} {b.bidder}{" "}
            <span className="font-mono text-lime-300">
              ${b.amount.toLocaleString("en-US")}
            </span>
            {b.isWinner && <span className="ml-2 text-xs text-lime-300">KAZANAN</span>}
          </div>
          <div className="truncate text-xs text-slate-500">
            {b.email} · {b.adUrl}
          </div>
          <div className="mt-1 text-sm text-slate-300">{b.adHeadline}</div>
          {b.adBody && <div className="text-xs text-slate-500">{b.adBody}</div>}
        </div>
        <span
          className={`rounded-full px-2 py-1 text-[11px] ${
            b.paymentStatus === "paid"
              ? "bg-lime-300/15 text-lime-300"
              : b.paymentStatus === "unpaid"
                ? "bg-red-500/15 text-red-300"
                : "bg-white/10 text-slate-300"
          }`}
        >
          {b.paymentStatus}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button className={btn} onClick={() => run({ action: "mark_paid", id: b.id })}>
          Ödendi
        </button>
        <button className={btn} onClick={() => run({ action: "mark_unpaid", id: b.id })}>
          Ödemedi → sıradakine geç
        </button>
        <button className={btn} onClick={() => run({ action: "payment_link", id: b.id })}>
          Stripe linki oluştur
        </button>
        <button className={btn} onClick={() => run({ action: "email_winner", id: b.id })}>
          Kazanana e-posta
        </button>
        {b.rejected ? (
          <button className={btn} onClick={() => run({ action: "restore", id: b.id })}>
            Geri al
          </button>
        ) : (
          <button className={btn} onClick={() => run({ action: "reject", id: b.id })}>
            Reddet
          </button>
        )}
        <button className={btn} onClick={() => run({ action: "block", value: b.email })}>
          E-postayı engelle
        </button>
      </div>

      <div className="mt-2 flex gap-2">
        <input
          className="input py-1.5 text-xs"
          placeholder="Manuel ödeme linki (IBAN sayfası, Gumroad vb.)"
          value={link}
          onChange={(e) => setLink(e.target.value)}
        />
        <button
          className={btn}
          onClick={() => run({ action: "payment_link", id: b.id, url: link })}
        >
          Kaydet
        </button>
      </div>
      {b.paymentLink && (
        <a
          href={b.paymentLink}
          target="_blank"
          rel="noreferrer"
          className="mt-2 block truncate text-xs text-lime-300 underline"
        >
          {b.paymentLink}
        </a>
      )}
      {msg && <p className="mt-2 text-xs text-slate-400">{msg}</p>}
    </div>
  );
}

export function AuctionControls({
  slotDate,
  minBid,
}: {
  slotDate: string;
  minBid: number;
}) {
  const { run, msg } = useAction();
  const [v, setV] = useState(String(minBid));
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] p-4">
      <span className="text-xs text-slate-400">Taban fiyat ($)</span>
      <input
        className="input w-24 py-1.5 text-xs"
        value={v}
        onChange={(e) => setV(e.target.value)}
      />
      <button className={btn} onClick={() => run({ action: "set_min_bid", slotDate, value: v })}>
        Kaydet
      </button>
      <button className={btn} onClick={() => run({ action: "close_now", slotDate })}>
        Şimdi kapat
      </button>
      <button className={btn} onClick={() => run({ action: "reopen", slotDate })}>
        Yeniden aç
      </button>
      {msg && <span className="text-xs text-slate-400">{msg}</span>}
    </div>
  );
}

export function SettingsForm({ values }: { values: Record<string, string> }) {
  const { run, msg } = useAction();
  const [state, setState] = useState(values);
  const fields: [string, string][] = [
    ["floor_price", "Varsayılan taban fiyat ($)"],
    ["bid_increment", "Minimum artış ($)"],
    ["close_hour_utc", "Kapanış saati (UTC, 0-23)"],
    ["site_tagline", "Site sloganı"],
    ["payment_note", "Ödeme notu"],
  ];
  return (
    <div className="space-y-3 rounded-xl border border-white/10 bg-white/[0.02] p-4">
      {fields.map(([k, label]) => (
        <div key={k} className="flex flex-wrap items-center gap-2">
          <span className="w-56 text-xs text-slate-400">{label}</span>
          <input
            className="input flex-1 py-1.5 text-xs"
            value={state[k] ?? ""}
            onChange={(e) => setState({ ...state, [k]: e.target.value })}
          />
          <button className={btn} onClick={() => run({ action: "setting", key: k, value: state[k] })}>
            Kaydet
          </button>
        </div>
      ))}
      {msg && <p className="text-xs text-slate-400">{msg}</p>}
    </div>
  );
}

export function BlockRow({ id, value }: { id: number; value: string }) {
  const { run } = useAction();
  return (
    <li className="flex items-center justify-between rounded-lg border border-white/10 px-3 py-2 text-sm">
      <span>{value}</span>
      <button className={btn} onClick={() => run({ action: "unblock", id })}>
        Kaldır
      </button>
    </li>
  );
}

export function LogoutButton() {
  const router = useRouter();
  return (
    <button
      className={btn}
      onClick={async () => {
        await fetch("/api/admin/login", { method: "DELETE" });
        router.push("/admin/login");
        router.refresh();
      }}
    >
      Çıkış
    </button>
  );
}
