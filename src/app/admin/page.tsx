import { redirect } from "next/navigation";
import { db } from "@/db";
import { auctions, bids, blocklist, events, subscribers } from "@/db/schema";
import { desc, eq, sql } from "drizzle-orm";
import { isAdmin } from "@/lib/admin";
import { getHallOfFame, getLiveAuction, getTodaysAd, todayStr } from "@/lib/auction";
import { getSettings } from "@/lib/settings";
import {
  AuctionControls,
  BidRow,
  BlockRow,
  LogoutButton,
  SettingsForm,
  type AdminBid,
} from "@/components/AdminClient";

export const dynamic = "force-dynamic";

function toAdminBid(b: typeof bids.$inferSelect): AdminBid {
  return {
    id: b.id,
    bidder: b.bidder,
    email: b.email,
    amount: Number(b.amount),
    adHeadline: b.adHeadline,
    adBody: b.adBody,
    adUrl: b.adUrl,
    adEmoji: b.adEmoji,
    rejected: b.rejected,
    isWinner: b.isWinner,
    paymentStatus: b.paymentStatus,
    paymentLink: b.paymentLink,
    createdAt: b.createdAt.toISOString(),
  };
}

export default async function AdminPage() {
  if (!(await isAdmin())) redirect("/admin/login");

  const live = await getLiveAuction();
  const todaysAd = await getTodaysAd();
  const fame = await getHallOfFame(5);
  const s = await getSettings();

  const liveBids = await db
    .select()
    .from(bids)
    .where(eq(bids.auctionId, live.auction.id))
    .orderBy(desc(sql`${bids.amount}::numeric`));

  const todaysAuction = (
    await db.select().from(auctions).where(eq(auctions.slotDate, todayStr(0)))
  )[0];
  const todaysBids = todaysAuction
    ? await db
        .select()
        .from(bids)
        .where(eq(bids.auctionId, todaysAuction.id))
        .orderBy(desc(sql`${bids.amount}::numeric`))
    : [];

  const blocks = await db.select().from(blocklist).orderBy(desc(blocklist.createdAt)).limit(20);
  const subs = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(subscribers);
  const feed = await db.select().from(events).orderBy(desc(events.createdAt)).limit(15);
  const unpaid = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(bids)
    .where(sql`${bids.isWinner} = true and ${bids.paymentStatus} <> 'paid'`);

  return (
    <main className="mx-auto max-w-5xl px-5 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black">Yönetim paneli</h1>
        <LogoutButton />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card label="Toplam ciro" value={`$${fame.totalRevenue.toLocaleString("en-US")}`} />
        <Card label="Satılan gün" value={String(fame.soldDays)} />
        <Card label="Bekleyen tahsilat" value={String(unpaid[0]?.c ?? 0)} />
        <Card label="E-posta listesi" value={String(subs[0]?.c ?? 0)} />
      </div>

      <Section title={`Bugün yayında · ${todayStr(0)}`}>
        {todaysAd ? (
          <div className="space-y-3">
            {todaysBids.map((b) => (
              <BidRow key={b.id} b={toAdminBid(b)} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">Bugün için kazanan yok (slot boş).</p>
        )}
      </Section>

      <Section title={`Yarının canlı açık artırması · ${live.auction.slotDate}`}>
        <AuctionControls
          slotDate={live.auction.slotDate}
          minBid={Number(live.auction.minBid)}
        />
        <div className="mt-3 space-y-3">
          {liveBids.length === 0 && (
            <p className="text-sm text-slate-500">Henüz teklif yok.</p>
          )}
          {liveBids.map((b) => (
            <BidRow key={b.id} b={toAdminBid(b)} />
          ))}
        </div>
      </Section>

      <Section title="Ayarlar">
        <SettingsForm values={s} />
      </Section>

      <Section title="Engel listesi">
        <ul className="space-y-2">
          {blocks.length === 0 && <p className="text-sm text-slate-500">Boş.</p>}
          {blocks.map((b) => (
            <BlockRow key={b.id} id={b.id} value={b.value} />
          ))}
        </ul>
      </Section>

      <Section title="Son hareketler">
        <ul className="space-y-1 text-sm text-slate-400">
          {feed.map((e) => (
            <li key={e.id}>
              <span className="text-slate-600">
                {e.createdAt.toISOString().slice(0, 16).replace("T", " ")}
              </span>{" "}
              · <span className="text-lime-300/70">{e.kind}</span> · {e.message}
            </li>
          ))}
          {feed.length === 0 && <li className="text-slate-600">Henüz kayıt yok.</li>}
        </ul>
      </Section>
    </main>
  );
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <div className="text-xl font-black text-lime-300">{value}</div>
      <div className="text-[11px] uppercase tracking-widest text-slate-500">{label}</div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="mb-3 text-xs uppercase tracking-[0.2em] text-slate-500">{title}</h2>
      {children}
    </section>
  );
}
