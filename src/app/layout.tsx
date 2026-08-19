import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import "./globals.css";

const base = process.env.NEXT_PUBLIC_SITE_URL || "https://tekreklam.example";

export const metadata: Metadata = {
  metadataBase: new URL(base),
  title: {
    default: "TekReklam — Günde tek reklam. Her gece açık artırma.",
    template: "%s · TekReklam",
  },
  description:
    "Bu sitede sadece bir reklam alanı var. Her gece canlı açık artırmayla satılır. Kazanan, ertesi gün tüm siteye tek başına sahip olur.",
  openGraph: {
    title: "TekReklam — Günde tek reklam",
    description:
      "Tek slot. Her gece canlı açık artırma. Kazanan, ertesi gün sitedeki tek reklam olur.",
    type: "website",
    url: base,
  },
  twitter: { card: "summary_large_image" },
};

const nav = [
  ["/auction", "Canlı Açık Artırma"],
  ["/hall-of-fame", "Rekorlar"],
  ["/rules", "Kurallar"],
  ["/plan", "Plan"],
];

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="tr">
      <body className="min-h-screen bg-[#0b0b0f] text-slate-100 antialiased selection:bg-lime-300 selection:text-black">
        <header className="sticky top-0 z-20 border-b border-white/10 bg-[#0b0b0f]/85 backdrop-blur">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 px-5 py-4">
            <Link href="/" className="text-lg font-black tracking-tight">
              TEK<span className="text-lime-300">REKLAM</span>
            </Link>
            <nav className="flex flex-wrap gap-4 text-sm text-slate-400">
              {nav.map(([href, label]) => (
                <Link key={href} href={href} className="hover:text-lime-300">
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        </header>
        {children}
        <footer className="mt-20 border-t border-white/10 py-8 text-center text-xs text-slate-500">
          <p>Günde tek reklam. Başka hiçbir şey satılmaz.</p>
          <p className="mt-2">
            <Link href="/rules" className="hover:text-lime-300">
              Kurallar
            </Link>{" "}
            ·{" "}
            <Link href="/unsubscribe" className="hover:text-lime-300">
              Abonelikten çık
            </Link>{" "}
            ·{" "}
            <Link href="/admin" className="hover:text-lime-300">
              Yönetim
            </Link>
          </p>
        </footer>
      </body>
    </html>
  );
}
