import { z } from "zod";

// Field names follow the spec (titulo, descricao, dataCriacao) so the API contract
// reads the same as the requirements document.
export type Task = {
  id: string;
  titulo: string;
  descricao?: string;
  dataCriacao: Date;
};

export const TITULO_MAX = 120;
export const DESCRICAO_MAX = 1000;

const titulo = z
  .string({ error: "O título é obrigatório." })
  .trim()
  .min(1, "O título é obrigatório.")
  .max(TITULO_MAX, `O título deve ter no máximo ${TITULO_MAX} caracteres.`);

// An empty or whitespace-only description is stored as "no description".
const descricao = z
  .string()
  .trim()
  .max(DESCRICAO_MAX, `A descrição deve ter no máximo ${DESCRICAO_MAX} caracteres.`)
  .optional()
  .transform((value) => value || undefined);

const id = z.uuid("Identificador de tarefa inválido.");

export const createTaskInput = z.object({ titulo, descricao });

// Update replaces the editable fields as a whole (PUT semantics): the form always
// sends the full task, and omitting descricao clears it.
export const updateTaskInput = z.object({ id, titulo, descricao });

export const taskIdInput = z.object({ id });

export const listTasksInput = z.object({
  limit: z.number().int().min(1).max(50).default(10),
  cursor: z.string().nullish(),
});

// Declared by hand rather than inferred: the schema's transform makes descricao a
// required `string | undefined` key, while the domain contract keeps it optional.
export type CreateTaskInput = Pick<Task, "titulo" | "descricao">;
export type UpdateTaskInput = Pick<Task, "id" | "titulo" | "descricao">;
