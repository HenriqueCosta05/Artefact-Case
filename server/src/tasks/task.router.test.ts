import { TRPCError } from "@trpc/server";
import { describe, expect, it } from "vitest";
import { appRouter } from "../router.ts";
import { createCallerFactory } from "../trpc.ts";
import { createInMemoryTaskRepository } from "./task.repository.ts";

// Integration level: real router, real validation, real in-memory repository; no mocks.
const createCaller = createCallerFactory(appRouter);
const newCaller = () => createCaller({ tasks: createInMemoryTaskRepository() });
const missingId = "00000000-0000-4000-8000-000000000000";

const errorOf = async (promise: Promise<unknown>) => {
  try {
    await promise;
  } catch (error) {
    if (error instanceof TRPCError) return error;
  }
  throw new Error("expected the call to fail with a TRPCError");
};

describe("task router", () => {
  it("runs the full CRUD cycle", async () => {
    const caller = newCaller();

    const created = await caller.task.create({ titulo: "  Revisar PR  ", descricao: "" });
    expect(created).toMatchObject({ titulo: "Revisar PR", descricao: undefined });

    const updated = await caller.task.update({ id: created.id, titulo: "Revisar PR #2", descricao: "urgente" });
    expect(await caller.task.byId({ id: created.id })).toEqual(updated);

    await caller.task.delete({ id: created.id });
    expect((await caller.task.list({})).items).toEqual([]);
  });

  it("rejects a task without a title", async () => {
    const error = await errorOf(newCaller().task.create({ titulo: "   " }));

    expect(error.code).toBe("BAD_REQUEST");
  });

  it.each([
    ["byId", (c: ReturnType<typeof newCaller>) => c.task.byId({ id: missingId })],
    ["update", (c: ReturnType<typeof newCaller>) => c.task.update({ id: missingId, titulo: "x" })],
    ["delete", (c: ReturnType<typeof newCaller>) => c.task.delete({ id: missingId })],
  ])("returns NOT_FOUND with a meaningful message on %s of a missing task", async (_, call) => {
    const error = await errorOf(call(newCaller()));

    expect(error.code).toBe("NOT_FOUND");
    expect(error.message).toBe(`Tarefa ${missingId} não encontrada.`);
  });
});
