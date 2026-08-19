import { getHallOfFame } from "@/lib/auction";

export const dynamic = "force-dynamic";

export default async function HallOfFame() {
  const { rows, totalRevenue, soldDays } = await getHallOfFame();
  return (
    <main className="mx-auto max-w-4xl px-5 py-10">
      <h1 className="text-4xl font-black">Rekorlar</h1>
      <p className="mt-2 text-slate-400">
        Toplam ${totalRevenue.toLocaleString("en-US")} · {soldDays} gün satıldı. Her satır bir
        haber değeri.
      </p>
      <div className="mt-8 divide-y divide-white/10 rounded-2xl border border-white/10">
        {rows.length === 0 && (
          <p className="p-6 text-slate-500">Henüz kapanmış bir açık artırma yok.</p>
        )}
        {rows.map((r, i) => (
          <a
            key={r.slotDate}
            href={r.url}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="flex items-center justify-between gap-4 p-4 hover:bg-white/[0.03]"
          >
            <div className="flex min-w-0 items-center gap-3">
              <span className="w-6 text-slate-600">#{i + 1}</span>
              <span className="text-xl">{r.emoji}</span>
              <div className="min-w-0">
                <div className="truncate font-semibold">{r.headline}</div>
                <div className="text-xs text-slate-500">
                  {r.bidder} · {r.slotDate}
                </div>
              </div>
            </div>
            <div className="font-mono text-lg font-bold text-lime-300">
              ${Number(r.amount).toLocaleString("en-US")}
            </div>
          </a>
        ))}
      </div>
    </main>
  );
}
