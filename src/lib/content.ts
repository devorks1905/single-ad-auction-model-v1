export type DailyPost = { title: string; body: string; tag: string };

const POSTS: DailyPost[] = [
  {
    tag: "Kullanışlı",
    title: "2 dakikalık kural",
    body: "Bir iş 2 dakikadan kısa sürüyorsa listeye yazma, hemen yap. Listeler, yapılmayan işlerin mezarlığıdır.",
  },
  {
    tag: "Komik ama doğru",
    title: "Toplantı fiyat etiketi",
    body: "Toplantıya girmeden önce katılanların saatlik ücretini topla. O rakamı davetiyeye yaz. Toplantıların yarısı buharlaşır.",
  },
  {
    tag: "Anlamlı",
    title: "Kıtlık en iyi pazarlamadır",
    body: "Herkese satabildiğin şeyin değeri düşer. Sadece bir kişiye satabildiğin şeyin fiyatını alıcılar belirler.",
  },
  {
    tag: "Kullanışlı",
    title: "Tek metrik günü",
    body: "Haftada bir gün tek bir metriğe bak. Diğer bütün grafikleri kapat. Odak, silmekle başlar.",
  },
  {
    tag: "Komik ama doğru",
    title: "E-postanın ilk cümlesi",
    body: "İlk cümlede ne istediğini yaz. 'Umarım iyisindir' cümlesi kimseyi iyi yapmadı.",
  },
  {
    tag: "Anlamlı",
    title: "Sermayesiz başlamak",
    body: "Parası olmayanın tek avantajı hızdır. Bugün yapamayacağın şeyi planlamak yerine, bugün yapabileceğin en küçük şeyi yayınla.",
  },
  {
    tag: "Kullanışlı",
    title: "Fiyatı sen söyleme",
    body: "Fiyatı piyasa söylesin. Açık artırma, 'ne kadar isteyeyim?' sorusunu tamamen ortadan kaldırır.",
  },
];

export function postOfTheDay(dateStr: string): DailyPost {
  const days = Math.floor(new Date(`${dateStr}T00:00:00Z`).getTime() / 86400000);
  return POSTS[((days % POSTS.length) + POSTS.length) % POSTS.length];
}

export const archive = POSTS;
