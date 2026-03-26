import { ApiError } from "@workspace/api-client-react";

/** Prefer backend JSON `message` from ApiError (e.g. validation, conflict). */
export function getApiErrorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    const d = err.data as { message?: string; error?: string } | null | undefined;
    if (d && typeof d === "object") {
      if (typeof d.message === "string" && d.message.trim()) return d.message.trim();
      if (typeof d.error === "string" && d.error.trim()) return d.error.trim();
    }
    if (err.message) return err.message;
  }
  if (err instanceof Error) return err.message;
  return "Something went wrong. Please try again.";
}
