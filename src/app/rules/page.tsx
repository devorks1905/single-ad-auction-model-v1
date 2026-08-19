export const metadata = { title: "Kurallar & SSS — TekReklam" };

const faq: [string, string][] = [
  [
    "Gerçekten günde tek reklam mı?",
    "Evet. Bir günde sadece bir marka yayınlanır. Rotasyon, banner, pop-up, retargeting yok.",
  ],
  [
    "Açık artırma nasıl işliyor?",
    "Her gün yarının slotu açıktır. Kapanış saatinde (varsayılan 21:00 UTC) en yüksek teklif kazanır. Tüm teklifler herkese açıktır.",
  ],
  [
    "Ödemeyi nasıl yapıyorum?",
    "Kapanıştan sonra kazanana ödeme linki e-postayla gönderilir. Sitede kart bilgisi saklanmaz. Ödeme onaylanınca reklam 00:00 UTC'de yayına girer.",
  ],
  [
    "Ödeme yapılmazsa ne olur?",
    "Slot otomatik olarak ikinci en yüksek teklife geçer. Ödemeyen e-posta adresi kalıcı olarak engellenir.",
  ],
  [
    "Hangi reklamlar reddedilir?",
    "Dolandırıcılık, nefret söylemi, yetişkin içeriği, kumar/bahis ve yanıltıcı sağlık iddiaları. Reddedilen teklif tahsil edilmez.",
  ],
  [
    "Reklamım nasıl görünür?",
    "Bir emoji, 70 karakter başlık, 140 karakter alt metin ve tıklanabilir link. Sayfanın en üstünde, tek başına.",
  ],
  [
    "Aynı açık artırmada birden fazla teklif verebilir miyim?",
    "Hayır, aynı e-posta adresiyle her açık artırmada yalnızca bir teklif verebilirsin. Farklı bir teklif vermek için yeni bir e-posta kullanman gerekir.",
  ],
  [
    "Belirli bir günü önceden alabilir miyim?",
    "Yılda en fazla 12 gün için 'Kurucu Günü' peşin satışı yapılır. Talep için e-posta gönder.",
  ],
  [
    "Abonelikten nasıl çıkabilirim?",
    "Her e-postanın altındaki bağlantıyı kullanarak veya /unsubscribe sayfasından abonelikten çıkabilirsin.",
  ],
];

export default function RulesPage() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-10">
      <h1 className="text-4xl font-black">Kurallar & SSS</h1>
      <div className="mt-8 divide-y divide-white/10 rounded-2xl border border-white/10">
        {faq.map(([q, a]) => (
          <details key={q} className="group p-5">
            <summary className="cursor-pointer list-none font-semibold marker:hidden">
              <span className="text-lime-300">›</span> {q}
            </summary>
            <p className="mt-2 text-sm text-slate-400">{a}</p>
          </details>
        ))}
      </div>
      <h2 className="mt-10 text-2xl font-black">Basın kiti</h2>
      <p className="mt-2 text-sm text-slate-400">
        Her kapanış bir haber. Rekor fiyatlar ve kazanan markalar{" "}
        <a href="/hall-of-fame" className="text-lime-300 underline">
          Rekorlar
        </a>{" "}
        sayfasında herkese açık şekilde listelenir. Alıntı yapmakta özgürsün.
      </p>
    </main>
  );
}
