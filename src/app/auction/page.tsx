import AuctionPanel from "@/components/AuctionPanel";

export const dynamic = "force-dynamic";

export default function AuctionPage() {
  return (
    <main className="mx-auto max-w-5xl px-5 py-10">
      <h1 className="text-4xl font-black">Canlı açık artırma</h1>
      <p className="mt-2 max-w-2xl text-slate-400">
        Her gece kapanışta en yüksek teklif kazanır. Kazanana e-posta gider, ödeme alınır ve
        reklam ertesi sabah 00:00 UTC&apos;de yayına girer. Tek slot, tek kazanan.
      </p>
      <div className="mt-8">
        <AuctionPanel />
      </div>
      <div className="mt-10 grid gap-4 sm:grid-cols-3 text-sm text-slate-400">
        <Rule n="1" t="Tek slot">
          Bir günde sadece bir reklam yayınlanır. Rotasyon yok, paylaşım yok.
        </Rule>
        <Rule n="2" t="Şeffaf fiyat">
          Tüm teklifler ve kapanış fiyatı herkese açık. Rate card yok.
        </Rule>
        <Rule n="3" t="Editoryal filtre">
          Dolandırıcılık, nefret ve yetişkin içeriği reddedilir; teklif iade edilir.
        </Rule>
      </div>
    </main>
  );
}

function Rule({ n, t, children }: { n: string; t: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <div className="text-lime-300">{n}</div>
      <div className="font-semibold text-slate-100">{t}</div>
      <p className="mt-1">{children}</p>
    </div>
  );
}
