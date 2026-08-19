export const metadata = { title: "Sermayesiz Başlangıç Planı — TekReklam" };

const phases = [
  {
    t: "Hafta 0 · Maliyet: $0",
    items: [
      "Site zaten hazır (bu proje). Vercel free + Neon free Postgres = $0 altyapı.",
      "Alan adı tek gider: ~$10/yıl. İstersen ilk ay ücretsiz subdomain ile başla.",
      "Ödeme: Stripe Payment Link veya IBAN + manuel fatura. Kurulum $0, komisyon satışta.",
    ],
  },
  {
    t: "Hafta 1 · Trafiği yarat (içerik motoru)",
    items: [
      "Günde 1 kısa, alıntılanabilir içerik yayınla. Tek fikir, 60 saniyede okunur.",
      "Aynı içeriği X, LinkedIn ve Reddit'te tekrar paylaş; her paylaşımda tek satır: 'bu sitede günde tek reklam var'.",
      "Hedef: günlük 500-2.000 ziyaretçi. Reklam fiyatını trafik değil, HİKÂYE belirleyecek.",
    ],
  },
  {
    t: "Hafta 2 · Açık artırmayı başlat (soğuk start çözümü)",
    items: [
      "Taban fiyat $1. İlk hafta bilerek çok ucuz sat — 'ben bu siteyi $3'a aldım' tweet'i bedava reklamdır.",
      "İlk 7 günü indie hacker/bootstrapper kitlesine sat: onlar hem alıcı hem yayıncıdır.",
      "Her kapanışı otomatik duyur: 'Dün gecenin fiyatı: $X. Bugün siteyi @kimse aldı.'",
    ],
  },
  {
    t: "Ay 1-3 · Fiyat merdiveni",
    items: [
      "Kazanan her marka yeni izleyici getirir → trafik artar → ertesi günün fiyatı artar. Volan bu.",
      "Rekor günleri manşetleştir: 'Tek slot $X'a gitti'. Basın bunu kendi yazar.",
      "Cuma/pazartesi gibi yüksek talep günlerini önceden duyur, rekabeti yoğunlaştır.",
    ],
  },
  {
    t: "Ölçek · Ek gelir kalemleri (kıtlığı bozmadan)",
    items: [
      "Yıllık 'Kurucu Günü' paketi: belirli bir tarihi peşin sat (12 gün/yıl sınırı).",
      "Kaybeden tekliflere e-posta listesi: yarın tekrar denemeleri için hatırlatma. Dönüşüm en yüksek kanal.",
      "Franchise: aynı motoru başka nişlerde çalıştır, %20 komisyonla lisansla.",
    ],
  },
];

const numbers = [
  ["Sabit aylık gider", "≈ $1 (alan adı) — barındırma free tier"],
  ["Başabaş noktası", "Ayda 1 satış (~$5)"],
  ["Muhafazakâr senaryo", "30 gün × $40 = $1.200/ay"],
  ["İyi senaryo", "30 gün × $250 = $7.500/ay"],
  ["Viral gün etkisi", "Tek $10.000'lık gün, sonraki 30 günün taban fiyatını 3-5x yükseltir"],
];

export default function PlanPage() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-10">
      <h1 className="text-4xl font-black">Sermayesiz başlangıç planı</h1>
      <p className="mt-3 text-slate-400">
        Ürün reklam alanının kendisi. Stok yok, üretim yok, envanter yok. Tek maliyet: her gün
        yayınlanacak bir fikir ve satışı duyurma disiplini.
      </p>

      <div className="mt-8 space-y-5">
        {phases.map((p) => (
          <section key={p.t} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <h2 className="font-bold text-lime-300">{p.t}</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-300">
              {p.items.map((i) => (
                <li key={i}>{i}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <h2 className="mt-10 text-2xl font-black">Rakamlar</h2>
      <div className="mt-4 divide-y divide-white/10 rounded-2xl border border-white/10">
        {numbers.map(([k, v]) => (
          <div key={k} className="flex flex-wrap justify-between gap-2 p-4 text-sm">
            <span className="text-slate-400">{k}</span>
            <span className="font-semibold">{v}</span>
          </div>
        ))}
      </div>

      <h2 className="mt-10 text-2xl font-black">Riskler ve panzehirleri</h2>
      <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-slate-300">
        <li>
          <strong>Boş günler:</strong> teklif gelmezse slotu bir hayır kurumuna hediye et ve bunu
          duyur. Boşluk bile içerik olur.
        </li>
        <li>
          <strong>Sahte teklifler:</strong> ödeme yapılmazsa ikinci en yüksek teklife geçilir;
          ödemeyen e-posta kalıcı olarak bloklanır.
        </li>
        <li>
          <strong>Trafik düşüşü:</strong> içerik motorunu asla durdurma. Reklam alanının değeri
          trafikten değil, sürekliliğin yarattığı ritüelden gelir.
        </li>
      </ul>
    </main>
  );
}
