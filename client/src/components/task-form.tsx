"use client";

import Link from "next/link";
import { useState } from "react";
import { DESCRICAO_MAX, TITULO_MAX, type TaskFormErrors, type TaskFormValues, validateTask } from "@/lib/task-rules";
import { toApiError } from "@/trpc/errors";
import { Notice } from "./notice";

type TaskFormProps = {
  initialValues?: TaskFormValues;
  submitLabel: string;
  pendingLabel: string;
  // The form knows nothing about tRPC: the page passes the mutation in, which keeps
  // this component testable with a plain async function.
  onSubmit: (values: TaskFormValues) => Promise<void>;
};

const inputClass =
  "w-full rounded-card border border-mist bg-paper px-4 py-3 text-base text-navy-ink outline-none transition-colors focus:border-magenta-deep aria-invalid:border-magenta-deep";

export const TaskForm = ({ initialValues, submitLabel, pendingLabel, onSubmit }: TaskFormProps) => {
  const [values, setValues] = useState<TaskFormValues>(initialValues ?? { titulo: "", descricao: "" });
  const [errors, setErrors] = useState<TaskFormErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const update = (field: keyof TaskFormValues) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setValues((current) => ({ ...current, [field]: event.target.value }));
    // Clear the field's error as soon as the user starts fixing it.
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const clientErrors = validateTask(values);
    setErrors(clientErrors);
    setServerError(null);
    if (Object.keys(clientErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      await onSubmit({ titulo: values.titulo.trim(), descricao: values.descricao.trim() });
    } catch (error) {
      const apiError = toApiError(error);
      setServerError(apiError.message);
      setErrors({ titulo: apiError.fieldErrors.titulo?.[0], descricao: apiError.fieldErrors.descricao?.[0] });
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
      {serverError && <Notice notice={{ tone: "error", text: serverError }} />}

      <div className="flex flex-col gap-2">
        <label htmlFor="titulo" className="text-sm font-medium">
          Título <span aria-hidden="true">*</span>
        </label>
        <input
          id="titulo"
          name="titulo"
          value={values.titulo}
          onChange={update("titulo")}
          maxLength={TITULO_MAX}
          aria-invalid={Boolean(errors.titulo)}
          aria-describedby={errors.titulo ? "titulo-error" : undefined}
          className={inputClass}
        />
        {errors.titulo && (
          <p id="titulo-error" className="text-sm text-magenta-deep">
            {errors.titulo}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="descricao" className="text-sm font-medium">
          Descrição <span className="font-normal text-navy-ink/60">(opcional)</span>
        </label>
        <textarea
          id="descricao"
          name="descricao"
          rows={5}
          value={values.descricao}
          onChange={update("descricao")}
          maxLength={DESCRICAO_MAX}
          aria-invalid={Boolean(errors.descricao)}
          aria-describedby={errors.descricao ? "descricao-error" : undefined}
          className={`${inputClass} resize-y`}
        />
        {errors.descricao && (
          <p id="descricao-error" className="text-sm text-magenta-deep">
            {errors.descricao}
          </p>
        )}
      </div>

      <div className="flex items-center gap-6">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-pill bg-magenta-deep px-6 py-2.5 text-sm font-medium text-paper transition-colors hover:bg-magenta-ink disabled:cursor-wait disabled:opacity-70"
        >
          {isSubmitting ? pendingLabel : submitLabel}
        </button>
        <Link href="/" className="text-sm font-medium underline underline-offset-4 hover:text-magenta-deep">
          Cancelar
        </Link>
      </div>
    </form>
  );
};
