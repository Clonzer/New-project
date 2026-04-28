import { customFetch } from "@/lib/workspace-api-mock";

export async function ensureSupportThread() {
  return customFetch<{ threadId: number }>("/api/support/message-thread", {
    method: "POST",
    credentials: "include",
  });
}

export async function submitSupportContactForm(input: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  return customFetch<{ ok: true }>("/api/support/contact", {
    method: "POST",
    body: JSON.stringify(input),
    credentials: "include",
  });
}
