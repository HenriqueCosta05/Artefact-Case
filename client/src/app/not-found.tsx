import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col items-start gap-6 px-5 py-16">
      <h1 className="text-4xl leading-none sm:text-5xl">Tarefa não encontrada</h1>
      <p className="text-navy-ink/80">Ela pode ter sido excluída, ou o endereço está incorreto.</p>
      <Link href="/" className="font-medium text-magenta-deep underline underline-offset-4">
        Voltar para a lista
      </Link>
    </main>
  );
}
