import { TRPCClientError } from "@trpc/client";

export type FieldErrors = Partial<Record<string, string[]>>;

export type ApiError = { message: string; fieldErrors: FieldErrors };

// Turns any failure (tRPC error, network error, unknown throw) into something the UI can show.
export const toApiError = (error: unknown): ApiError => {
  if (error instanceof TRPCClientError) {
    const fieldErrors = (error.data?.fieldErrors ?? {}) as FieldErrors;
    const isValidation = error.data?.code === "BAD_REQUEST" && Object.keys(fieldErrors).length > 0;
    return {
      message: isValidation ? "Revise os campos destacados." : error.message,
      fieldErrors,
    };
  }
  return { message: "Não foi possível falar com o servidor. Tente novamente.", fieldErrors: {} };
};

export const isNotFound = (error: unknown) =>
  error instanceof TRPCClientError && error.data?.code === "NOT_FOUND";
