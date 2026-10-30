import Link from "next/link";
import type { NoticeMessage } from "@/components/notice";
import { TaskList } from "@/components/task-list";
import { PAGE_SIZE } from "@/lib/task-rules";
import { getQueryClient, HydrateClient, trpc } from "@/trpc/server";

// Tasks change all the time: render on every request instead of once at build time.
export const dynamic = "force-dynamic";

const flash: Record<string, NoticeMessage> = {
  criada: { tone: "success", text: "Tarefa criada." },
  atualizada: { tone: "success", text: "Tarefa atualizada." },
};

export default async function TasksPage({ searchParams }: PageProps<"/">) {
  const { ok } = await searchParams;

  // SSR: the first page is fetched here and hydrated into TaskList's infinite query,
  // so the HTML already contains the tasks and the browser makes no initial request.
  await getQueryClient().prefetchInfiniteQuery(
    trpc.task.list.infiniteQueryOptions({ limit: PAGE_SIZE }, { getNextPageParam: (page) => page.nextCursor }),
  );

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-10 px-5 py-12 sm:py-16">
      <header className="flex flex-wrap items-end justify-between gap-6">
        <h1 className="text-4xl leading-none sm:text-5xl">Tarefas</h1>
        <Link
          href="/tasks/new"
          className="rounded-pill bg-magenta-deep px-6 py-2.5 text-sm font-medium text-paper transition-colors hover:bg-magenta-ink"
        >
          Nova tarefa
        </Link>
      </header>

      <HydrateClient>
        <TaskList initialNotice={typeof ok === "string" ? (flash[ok] ?? null) : null} />
      </HydrateClient>
    </main>
  );
}
