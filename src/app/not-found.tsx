import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-5 text-center">
      <div className="text-6xl">🔍</div>
      <h1 className="mt-4 text-3xl font-black">Sayfa bulunamadı</h1>
      <p className="mt-2 max-w-md text-slate-400">
        Aradığın sayfa mevcut değil veya taşınmış olabilir.
      </p>
      <div className="mt-6 flex gap-3">
        <Link
          href="/"
          className="rounded-xl bg-lime-300 px-6 py-3 font-bold text-black transition hover:bg-lime-200"
        >
          Ana sayfa
        </Link>
        <Link
          href="/auction"
          className="rounded-xl border border-white/15 px-6 py-3 font-bold transition hover:border-lime-300 hover:text-lime-300"
        >
          Canlı açık artırma
        </Link>
      </div>
    </main>
  );
}
