"use client";

import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useTRPC } from "@/trpc/client";
import { TaskForm } from "./task-form";

// After a write, drop every cached task query and return to the list with a flash
// message in the URL, so the success feedback survives the navigation.
const useAfterSave = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const router = useRouter();
  return async (notice: "criada" | "atualizada") => {
    await queryClient.invalidateQueries({ queryKey: trpc.task.pathKey() });
    router.push(`/?ok=${notice}`);
  };
};

export const CreateTaskForm = () => {
  const trpc = useTRPC();
  const afterSave = useAfterSave();
  const create = useMutation(trpc.task.create.mutationOptions());

  return (
    <TaskForm
      submitLabel="Criar tarefa"
      pendingLabel="Criando…"
      onSubmit={async (values) => {
        await create.mutateAsync(values);
        await afterSave("criada");
      }}
    />
  );
};

export const EditTaskForm = ({ id }: { id: string }) => {
  const trpc = useTRPC();
  const afterSave = useAfterSave();
  // Already in the cache: the edit page prefetched it during SSR.
  const { data: task } = useSuspenseQuery(trpc.task.byId.queryOptions({ id }));
  const update = useMutation(trpc.task.update.mutationOptions());

  return (
    <TaskForm
      initialValues={{ titulo: task.titulo, descricao: task.descricao ?? "" }}
      submitLabel="Salvar alterações"
      pendingLabel="Salvando…"
      onSubmit={async (values) => {
        await update.mutateAsync({ id, ...values });
        await afterSave("atualizada");
      }}
    />
  );
};
