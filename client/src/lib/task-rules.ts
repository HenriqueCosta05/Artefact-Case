// Mirrors the limits in server/src/tasks/task.ts. The client only imports the server's
// types, never its code, so these few constants are duplicated on purpose; the server
// stays the source of truth and re-validates every request.
export const TITULO_MAX = 120;
export const DESCRICAO_MAX = 1000;

// Lives here, not in the "use client" list: the SSR prefetch must use the same value,
// and a server component importing it from a client module gets a reference, not 10.
export const PAGE_SIZE = 10;

export type TaskFormValues = { titulo: string; descricao: string };
export type TaskFormErrors = Partial<Record<keyof TaskFormValues, string>>;

export const validateTask = ({ titulo, descricao }: TaskFormValues): TaskFormErrors => {
  const errors: TaskFormErrors = {};
  const tituloLength = titulo.trim().length;
  if (tituloLength === 0) errors.titulo = "O título é obrigatório.";
  else if (tituloLength > TITULO_MAX) errors.titulo = `Use no máximo ${TITULO_MAX} caracteres.`;
  if (descricao.trim().length > DESCRICAO_MAX) errors.descricao = `Use no máximo ${DESCRICAO_MAX} caracteres.`;
  return errors;
};
