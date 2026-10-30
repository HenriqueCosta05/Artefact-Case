import { TRPCClientError } from "@trpc/client";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EditTaskForm } from "@/components/task-editors";
import { getQueryClient, HydrateClient, trpc } from "@/trpc/server";

export const metadata: Metadata = { title: "Editar tarefa · ArtefactAI" };

export const dynamic = "force-dynamic";

export default async function EditTaskPage({ params }: PageProps<"/tasks/[id]/edit">) {
  const { id } = await params;

  // fetchQuery (not prefetchQuery) so a missing or malformed id surfaces here and
  // becomes a real 404, instead of an error the form would hit after hydration.
  try {
    await getQueryClient().fetchQuery(trpc.task.byId.queryOptions({ id }));
  } catch (error) {
    const code = error instanceof TRPCClientError ? error.data?.code : undefined;
    if (code === "NOT_FOUND" || code === "BAD_REQUEST") notFound();
    throw error;
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-10 px-5 py-12 sm:py-16">
      <h1 className="text-4xl leading-none sm:text-5xl">Editar tarefa</h1>
      <HydrateClient>
        <EditTaskForm id={id} />
      </HydrateClient>
    </main>
  );
}
