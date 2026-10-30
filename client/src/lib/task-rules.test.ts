import { describe, expect, it } from "vitest";
import { DESCRICAO_MAX, TITULO_MAX, validateTask } from "./task-rules";

describe("validateTask", () => {
  it("accepts a title with an empty description", () => {
    expect(validateTask({ titulo: "Ok", descricao: "" })).toEqual({});
  });

  it.each(["", "   "])("requires a non-blank title (%j)", (titulo) => {
    expect(validateTask({ titulo, descricao: "" }).titulo).toBe("O título é obrigatório.");
  });

  it("enforces the server's length limits", () => {
    const errors = validateTask({ titulo: "x".repeat(TITULO_MAX + 1), descricao: "y".repeat(DESCRICAO_MAX + 1) });

    expect(errors.titulo).toContain(String(TITULO_MAX));
    expect(errors.descricao).toContain(String(DESCRICAO_MAX));
  });
});
