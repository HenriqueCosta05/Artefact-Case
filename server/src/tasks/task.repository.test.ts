import { describe, expect, it } from "vitest";
import { createInMemoryTaskRepository } from "./task.repository.ts";

// A clock that advances one second per call keeps dataCriacao distinct and predictable.
const tickingClock = () => {
  let ms = Date.UTC(2026, 0, 1);
  return () => new Date((ms += 1000));
};

const repoWith = (count: number) => {
  const repo = createInMemoryTaskRepository(tickingClock());
  for (let i = 1; i <= count; i++) repo.create({ titulo: `Tarefa ${i}` });
  return repo;
};

describe("createInMemoryTaskRepository", () => {
  it("creates a task with a generated id and creation date", () => {
    const task = createInMemoryTaskRepository().create({ titulo: "Comprar café" });

    expect(task.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(task.dataCriacao).toBeInstanceOf(Date);
    expect(task.titulo).toBe("Comprar café");
  });

  it("lists newest first and pages with a cursor until it runs out", () => {
    const repo = repoWith(5);

    const first = repo.list({ limit: 2 });
    const second = repo.list({ limit: 2, cursor: first.nextCursor });
    const third = repo.list({ limit: 2, cursor: second.nextCursor });

    expect(first.items.map((t) => t.titulo)).toEqual(["Tarefa 5", "Tarefa 4"]);
    expect(second.items.map((t) => t.titulo)).toEqual(["Tarefa 3", "Tarefa 2"]);
    expect(third.items.map((t) => t.titulo)).toEqual(["Tarefa 1"]);
    expect(third.nextCursor).toBeNull();
  });

  it("keeps paging correctly when the cursor's task was deleted", () => {
    const repo = repoWith(4);
    const first = repo.list({ limit: 2 });
    const lastSeen = first.items.at(-1);
    if (!lastSeen) throw new Error("expected a first page");

    repo.delete(lastSeen.id);

    expect(repo.list({ limit: 2, cursor: first.nextCursor }).items.map((t) => t.titulo)).toEqual([
      "Tarefa 2",
      "Tarefa 1",
    ]);
  });

  it("returns undefined when updating or deleting a missing task", () => {
    const repo = createInMemoryTaskRepository();
    const missing = "00000000-0000-4000-8000-000000000000";

    expect(repo.update({ id: missing, titulo: "x" })).toBeUndefined();
    expect(repo.delete(missing)).toBeUndefined();
  });

  it("replaces editable fields on update and keeps the creation date", () => {
    const repo = createInMemoryTaskRepository();
    const task = repo.create({ titulo: "Antigo", descricao: "detalhe" });

    const updated = repo.update({ id: task.id, titulo: "Novo" });

    expect(updated).toEqual({ ...task, titulo: "Novo", descricao: undefined });
  });
});
