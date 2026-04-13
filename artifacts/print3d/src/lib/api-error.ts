import { ApiError } from "@/lib/workspace-api-mock";

function stripHtml(text: string): string {
  return text.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function normalizeMessage(text: string): string {
  const normalized = stripHtml(text).replace(/^HTTP \d+\s+\S+:\s*/i, "").trim();
  return normalized || text.trim();
}

/** Prefer backend JSON `message` from ApiError (e.g. validation, conflict). */
export function getApiErrorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    const d = err.data as { message?: string; error?: string } | null | undefined;
    if (d && typeof d === "object") {
      if (typeof d.message === "string" && d.message.trim()) return normalizeMessage(d.message);
      if (typeof d.error === "string" && d.error.trim()) return normalizeMessage(d.error);
    }
    if (err.status === 401) return "Email, username, or password is incorrect.";
    if (err.status === 403) return "You do not have permission to do that.";
    if (err.status === 404) return "That page or API route could not be found.";
    if (err.status === 409) return "That account already exists. Try signing in instead.";
    if (err.status >= 500) return "The server hit a problem processing that request. Please try again.";
    if (err.message) return normalizeMessage(err.message);
  }
  if (err instanceof TypeError) return "The request could not reach the server. Check your connection and try again.";
  if (err instanceof Error) return err.message;
  return "Something went wrong. Please try again.";
}

/** Get error message with support contact info for important operations */
export function getApiErrorMessageWithSupport(err: unknown, operation: string = "this operation"): string {
  const baseMessage = getApiErrorMessage(err);
  return `${baseMessage} If the problem persists, please contact support at evanhuelin8@gmail.com for assistance with ${operation}.`;
}
