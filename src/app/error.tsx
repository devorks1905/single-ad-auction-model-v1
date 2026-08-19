"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-5 text-center">
      <div className="text-6xl">😵</div>
      <h1 className="mt-4 text-3xl font-black">Bir şeyler ters gitti</h1>
      <p className="mt-2 max-w-md text-slate-400">
        Beklenmeyen bir hata oluştu. Lütfen tekrar dene.
      </p>
      <button
        onClick={reset}
        className="mt-6 rounded-xl bg-lime-300 px-6 py-3 font-bold text-black transition hover:bg-lime-200"
      >
        Tekrar dene
      </button>
      {process.env.NODE_ENV === "development" && (
        <pre className="mt-4 max-w-full overflow-auto rounded-lg bg-red-500/10 p-4 text-left text-xs text-red-300">
          {error.message}
        </pre>
      )}
    </main>
  );
}
