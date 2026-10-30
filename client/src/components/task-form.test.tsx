import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { TRPCClientError } from "@trpc/client";
import { describe, expect, it, vi } from "vitest";
import { TaskForm } from "./task-form";

vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => <a href={href}>{children}</a>,
}));

const renderForm = (onSubmit = vi.fn().mockResolvedValue(undefined)) => {
  render(<TaskForm submitLabel="Criar tarefa" pendingLabel="Criando…" onSubmit={onSubmit} />);
  return onSubmit;
};

const type = (label: RegExp, value: string) =>
  fireEvent.change(screen.getByLabelText(label), { target: { value } });

describe("TaskForm", () => {
  it("blocks submission and explains why when the title is blank", () => {
    const onSubmit = renderForm();

    type(/título/i, "   ");
    fireEvent.click(screen.getByRole("button", { name: "Criar tarefa" }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText("O título é obrigatório.")).toBeDefined();
    expect(screen.getByLabelText(/título/i).getAttribute("aria-invalid")).toBe("true");
  });

  it("submits trimmed values and shows the pending label while saving", async () => {
    let finish: () => void = () => {};
    const onSubmit = renderForm(vi.fn(() => new Promise<void>((resolve) => (finish = resolve))));

    type(/título/i, "  Estudar tRPC  ");
    type(/descrição/i, " ler a doc ");
    fireEvent.click(screen.getByRole("button", { name: "Criar tarefa" }));

    expect(onSubmit).toHaveBeenCalledWith({ titulo: "Estudar tRPC", descricao: "ler a doc" });
    expect(screen.getByRole("button", { name: "Criando…" }).hasAttribute("disabled")).toBe(true);
    finish();
  });

  it("shows the backend error and re-enables the form when saving fails", async () => {
    const error = new TRPCClientError("Tarefa 123 não encontrada.", {
      result: { error: { message: "Tarefa 123 não encontrada.", code: -32004, data: { code: "NOT_FOUND" } } },
    });
    renderForm(vi.fn().mockRejectedValue(error));

    type(/título/i, "Qualquer coisa");
    fireEvent.click(screen.getByRole("button", { name: "Criar tarefa" }));

    expect((await screen.findByRole("alert")).textContent).toContain("Tarefa 123 não encontrada.");
    await waitFor(() => expect(screen.getByRole("button", { name: "Criar tarefa" }).hasAttribute("disabled")).toBe(false));
  });

  it("falls back to a generic message for network failures", async () => {
    renderForm(vi.fn().mockRejectedValue(new TypeError("fetch failed")));

    type(/título/i, "Qualquer coisa");
    fireEvent.click(screen.getByRole("button", { name: "Criar tarefa" }));

    expect((await screen.findByRole("alert")).textContent).toContain("Não foi possível falar com o servidor");
  });
});
