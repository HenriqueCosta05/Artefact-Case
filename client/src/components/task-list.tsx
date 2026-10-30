"use client";

import type { AppRouter } from "@artefactai/server";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { inferRouterOutputs } from "@trpc/server";
import Link from "next/link";
import { useState } from "react";
import { useOnVisible } from "@/hooks/use-on-visible";
import { PAGE_SIZE } from "@/lib/task-rules";
import { toApiError } from "@/trpc/errors";
import { useTRPC } from "@/trpc/client";
import { Notice, type NoticeMessage } from "./notice";

type Task = inferRouterOutputs<AppRouter>["task"]["list"]["items"][number];

// Fixed time zone: SSR and the browser must format the same string, or React reports
// a hydration mismatch whenever the server's zone differs from the visitor's.
const dateFormat = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
  timeZone: "America/Sao_Paulo",
});

export const TaskList = ({ initialNotice }: { initialNotice: NoticeMessage | null }) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [notice, setNotice] = useState(initialNotice);

  // Same query key as the SSR prefetch in app/page.tsx, so the first page is hydrated.
  const tasks = useInfiniteQuery(
    trpc.task.list.infiniteQueryOptions({ limit: PAGE_SIZE }, { getNextPageParam: (page) => page.nextCursor }),
  );

  const remove = useMutation(
    trpc.task.delete.mutationOptions({
      onSuccess: async (task) => {
        setNotice({ tone: "success", text: `Tarefa “${task.titulo}” excluída.` });
        await queryClient.invalidateQueries({ queryKey: trpc.task.list.pathKey() });
      },
      onError: (error) => setNotice({ tone: "error", text: toApiError(error).message }),
    }),
  );

  const canLoadMore = tasks.hasNextPage && !tasks.isFetchingNextPage;
  const sentinel = useOnVisible<HTMLDivElement>(() => void tasks.fetchNextPage(), canLoadMore);
  const items = tasks.data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <div className="flex flex-col gap-6">
      {notice && <Notice notice={notice} onDismiss={() => setNotice(null)} />}

      {tasks.isError && <Notice notice={{ tone: "error", text: toApiError(tasks.error).message }} />}

      {tasks.isSuccess && items.length === 0 && (
        <p className="rounded-card border border-dashed border-mist px-6 py-10 text-center text-navy-ink/70">
          Nenhuma tarefa ainda.{" "}
          <Link href="/tasks/new" className="font-medium text-magenta-deep underline underline-offset-4">
            Crie a primeira
          </Link>
          .
        </p>
      )}

      <ul className="flex flex-col divide-y divide-mist border-y border-mist">
        {items.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            isDeleting={remove.isPending && remove.variables?.id === task.id}
            onDelete={() => remove.mutate({ id: task.id })}
          />
        ))}
      </ul>

      <div ref={sentinel} aria-hidden="true" />
      {tasks.isFetchingNextPage && <p className="text-center text-sm text-navy-ink/70">Carregando mais tarefas…</p>}
      {/* Fallback for keyboards and browsers where the observer never fires. */}
      {canLoadMore && (
        <button
          type="button"
          onClick={() => void tasks.fetchNextPage()}
          className="self-center text-sm font-medium underline underline-offset-4 hover:text-magenta-deep"
        >
          Carregar mais
        </button>
      )}
    </div>
  );
};

type TaskItemProps = { task: Task; isDeleting: boolean; onDelete: () => void };

const TaskItem = ({ task, isDeleting, onDelete }: TaskItemProps) => {
  // Two-step delete: the first click only asks, so one slip cannot destroy a task.
  const [confirming, setConfirming] = useState(false);

  return (
    <li className="flex flex-col gap-3 py-5 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
      <div className="flex min-w-0 flex-col gap-1">
        <h2 className="text-xl font-semibold leading-tight break-words">{task.titulo}</h2>
        {task.descricao && <p className="max-w-[70ch] whitespace-pre-line text-navy-ink/80">{task.descricao}</p>}
        <time dateTime={task.dataCriacao.toISOString()} className="font-mono text-xs text-navy-ink/60">
          Criada em {dateFormat.format(task.dataCriacao)}
        </time>
      </div>

      <div className="flex shrink-0 items-center gap-4 text-sm font-medium">
        {confirming ? (
          <>
            <button
              type="button"
              onClick={onDelete}
              disabled={isDeleting}
              className="rounded-pill border border-magenta-deep px-4 py-1.5 text-magenta-deep transition-colors hover:bg-magenta-deep hover:text-paper disabled:cursor-wait disabled:opacity-70"
            >
              {isDeleting ? "Excluindo…" : "Confirmar exclusão"}
            </button>
            <button type="button" onClick={() => setConfirming(false)} disabled={isDeleting} className="underline underline-offset-4">
              Cancelar
            </button>
          </>
        ) : (
          <>
            <Link href={`/tasks/${task.id}/edit`} className="underline underline-offset-4 hover:text-magenta-deep">
              Editar
            </Link>
            <button type="button" onClick={() => setConfirming(true)} className="underline underline-offset-4 hover:text-magenta-deep">
              Excluir
            </button>
          </>
        )}
      </div>
    </li>
  );
};
