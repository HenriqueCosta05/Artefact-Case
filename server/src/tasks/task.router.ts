import { TRPCError } from "@trpc/server";
import { publicProcedure, router } from "../trpc.ts";
import { createTaskInput, listTasksInput, taskIdInput, updateTaskInput } from "./task.ts";

const notFound = (id: string) =>
  new TRPCError({ code: "NOT_FOUND", message: `Tarefa ${id} não encontrada.` });

export const taskRouter = router({
  list: publicProcedure.input(listTasksInput).query(({ ctx, input }) => ctx.tasks.list(input)),

  byId: publicProcedure.input(taskIdInput).query(({ ctx, input }) => {
    const task = ctx.tasks.findById(input.id);
    if (!task) throw notFound(input.id);
    return task;
  }),

  create: publicProcedure.input(createTaskInput).mutation(({ ctx, input }) => ctx.tasks.create(input)),

  update: publicProcedure.input(updateTaskInput).mutation(({ ctx, input }) => {
    const task = ctx.tasks.update(input);
    if (!task) throw notFound(input.id);
    return task;
  }),

  delete: publicProcedure.input(taskIdInput).mutation(({ ctx, input }) => {
    const task = ctx.tasks.delete(input.id);
    if (!task) throw notFound(input.id);
    return task;
  }),
});
