import { randomUUID } from "node:crypto";
import type { CreateTaskInput, Task, UpdateTaskInput } from "./task.ts";

export type TaskPage = { items: Task[]; nextCursor: string | null };

// The router depends on this interface, not on the Map below, so a database-backed
// implementation can replace the in-memory one without touching the API layer.
export type TaskRepository = {
  list(params: { limit: number; cursor?: string | null }): TaskPage;
  findById(id: string): Task | undefined;
  create(input: CreateTaskInput): Task;
  update(input: UpdateTaskInput): Task | undefined;
  delete(id: string): Task | undefined;
};

// Newest first; ties on the same millisecond fall back to the id so the order is total.
const compareNewestFirst = (a: Task, b: Task) =>
  b.dataCriacao.getTime() - a.dataCriacao.getTime() || b.id.localeCompare(a.id);

// The cursor encodes the sort key of the last item instead of an offset or an id lookup,
// so deleting tasks while someone scrolls never skips or repeats items.
const encodeCursor = (task: Task) => `${task.dataCriacao.getTime()}:${task.id}`;

const decodeCursor = (cursor: string): Task | undefined => {
  const [time, id] = cursor.split(":");
  const ms = Number(time);
  if (!id || !Number.isFinite(ms)) return undefined;
  return { id, titulo: "", dataCriacao: new Date(ms) };
};

export const createInMemoryTaskRepository = (now = () => new Date()): TaskRepository => {
  const tasks = new Map<string, Task>();

  return {
    list({ limit, cursor }) {
      const after = cursor ? decodeCursor(cursor) : undefined;
      const sorted = [...tasks.values()].sort(compareNewestFirst);
      const remaining = after ? sorted.filter((task) => compareNewestFirst(after, task) < 0) : sorted;
      const items = remaining.slice(0, limit);
      const last = items.at(-1);
      const hasMore = remaining.length > limit;
      return { items, nextCursor: hasMore && last ? encodeCursor(last) : null };
    },

    findById: (id) => tasks.get(id),

    create(input) {
      const task: Task = { id: randomUUID(), ...input, dataCriacao: now() };
      tasks.set(task.id, task);
      return task;
    },

    update({ id, titulo, descricao }) {
      const current = tasks.get(id);
      if (!current) return undefined;
      const updated: Task = { ...current, titulo, descricao };
      tasks.set(id, updated);
      return updated;
    },

    delete(id) {
      const task = tasks.get(id);
      tasks.delete(id);
      return task;
    },
  };
};
