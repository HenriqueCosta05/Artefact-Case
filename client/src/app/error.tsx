"use client";

// Catches failures during rendering, e.g. the tRPC server being down while SSR prefetches.
export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col items-start gap-6 px-5 py-16">
      <h1 className="text-4xl leading-none sm:text-5xl">Algo deu errado</h1>
      <p className="text-navy-ink/80">
        Não foi possível carregar as tarefas. Verifique se o servidor tRPC está rodando e tente novamente.
      </p>
      <button
        type="button"
        onClick={reset}
        className="rounded-pill bg-magenta-deep px-6 py-2.5 text-sm font-medium text-paper transition-colors hover:bg-magenta-ink"
      >
        Tentar novamente
      </button>
    </main>
  );
}
