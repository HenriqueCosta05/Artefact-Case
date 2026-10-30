import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import { z } from "zod";
import type { TaskRepository } from "./tasks/task.repository.ts";

export type Context = { tasks: TaskRepository };

const t = initTRPC.context<Context>().create({
  // superjson keeps dataCriacao a real Date on the client instead of an ISO string.
  transformer: superjson,
  // Validation failures carry per-field messages, so the form can show them next to
  // the right input instead of one generic "Bad Request".
  errorFormatter: ({ shape, error }) => ({
    ...shape,
    data: {
      ...shape.data,
      fieldErrors: error.cause instanceof z.ZodError ? z.flattenError(error.cause).fieldErrors : null,
    },
  }),
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const createCallerFactory = t.createCallerFactory;
