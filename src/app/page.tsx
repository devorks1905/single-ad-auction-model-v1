import Link from "next/link";
import AuctionPanel from "@/components/AuctionPanel";
import Subscribe from "@/components/Subscribe";
import { getHallOfFame, getTodaysAd, todayStr } from "@/lib/auction";
import { getSettings } from "@/lib/settings";
import { archive, postOfTheDay } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function Home() {
  const today = todayStr();
  const [todaysAd, fame, s] = await Promise.all([
    getTodaysAd(),
    getHallOfFame(),
    getSettings(),
  ]);
  const post = postOfTheDay(today);

  return (
    <main className="mx-auto max-w-5xl px-5 py-10">
      {/* THE one ad slot */}
      <section className="mb-10">
        <div className="mb-2 flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-slate-500">
          <span>Bugünün tek reklamı · {today}</span>
          <span>1 / 1 slot</span>
        </div>
        {todaysAd ? (
          <a
            href={todaysAd.ad.adUrl}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="block rounded-2xl border border-lime-300/40 bg-gradient-to-br from-lime-300/15 to-transparent p-8 transition hover:border-lime-300"
          >
            <div className="text-4xl">{todaysAd.ad.adEmoji}</div>
            <h2 className="mt-3 text-3xl font-black">{todaysAd.ad.adHeadline}</h2>
            {todaysAd.ad.adBody && (
              <p className="mt-2 max-w-2xl text-slate-300">{todaysAd.ad.adBody}</p>
            )}
            <p className="mt-4 text-xs text-slate-400">
              {todaysAd.ad.bidder} bu slotu dün gece{" "}
              <strong className="text-lime-300">
                ${todaysAd.price.toLocaleString("en-US")}
              </strong>{" "}
              ödeyerek kazandı.
            </p>
          </a>
        ) : (
          <div className="rounded-2xl border border-dashed border-white/20 p-8 text-center">
            <p className="text-xl font-bold">Bugünün slotu boş kaldı.</p>
            <p className="mt-1 text-sm text-slate-400">
              Yarınki tek slot şu anda canlı açık artırmada.
            </p>
            <Link
              href="/auction"
              className="mt-4 inline-block rounded-xl bg-lime-300 px-5 py-2.5 font-bold text-black"
            >
              Teklif ver →
            </Link>
          </div>
        )}
      </section>

      <section className="mb-12">
        <h1 className="text-5xl font-black leading-tight sm:text-6xl">
          {s.site_tagline.replace("tek", "tek")}
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-slate-300">
          Banner yok, pop-up yok, takip kodu yok. Günde bir reklam. O tek slot her gece canlı
          açık artırmayla satılır. Kazanan, ertesi gün bu sitedeki tek sese sahip olur.
        </p>
        <div className="mt-6 grid grid-cols-3 gap-4 text-center">
          <Stat label="Toplam ciro" value={`$${fame.totalRevenue.toLocaleString("en-US")}`} />
          <Stat label="Satılan gün" value={String(fame.soldDays)} />
          <Stat
            label="Rekor gün"
            value={
              fame.rows[0] ? `$${Number(fame.rows[0].amount).toLocaleString("en-US")}` : "—"
            }
          />
        </div>
      </section>

      <section className="mb-14">
        <h2 className="mb-3 text-xs uppercase tracking-[0.2em] text-slate-500">
          Günün tek fikri · {post.tag}
        </h2>
        <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-8">
          <h3 className="text-3xl font-bold">{post.title}</h3>
          <p className="mt-3 text-lg text-slate-300">{post.body}</p>
        </article>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {archive
            .filter((p) => p.title !== post.title)
            .slice(0, 4)
            .map((p) => (
              <div key={p.title} className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                <div className="text-[11px] uppercase tracking-widest text-lime-300/70">
                  {p.tag}
                </div>
                <div className="mt-1 font-semibold">{p.title}</div>
                <p className="mt-1 text-sm text-slate-400">{p.body}</p>
              </div>
            ))}
        </div>
      </section>

      <section id="auction">
        <h2 className="mb-4 text-2xl font-black">Yarının slotu için canlı açık artırma 🔨</h2>
        <p className="mb-4 max-w-2xl text-sm text-slate-400">{s.payment_note}</p>
        <AuctionPanel />
      </section>

      <section className="mt-14 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <h2 className="text-xl font-black">Her sabah kapanış fiyatını al</h2>
        <p className="mb-4 mt-1 text-sm text-slate-400">
          Dün gecenin fiyatı, kazanan marka ve bugünün taban fiyatı. Tek satır, spam yok.
        </p>
        <Subscribe />
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] py-4">
      <div className="text-2xl font-black text-lime-300">{value}</div>
      <div className="text-[11px] uppercase tracking-widest text-slate-500">{label}</div>
    </div>
  );
}
