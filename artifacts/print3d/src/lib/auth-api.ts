import { customFetch, type User } from "@workspace/api-client-react";

export async function authLogin(identifier: string, password: string) {
  return customFetch<{ token: string; user: User }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ identifier, password }),
    skipAuth: true,
    credentials: "include",
  });
}

export async function authLogout() {
  return customFetch<{ ok: boolean }>("/api/auth/logout", {
    method: "POST",
    skipAuth: true,
    credentials: "include",
  });
}

export async function authMe() {
  return customFetch<{ user: User }>("/api/auth/me", {
    credentials: "include",
  });
}

export async function authChangePassword(currentPassword: string, newPassword: string) {
  return customFetch<{ ok: boolean }>("/api/auth/password", {
    method: "POST",
    body: JSON.stringify({ currentPassword, newPassword }),
    credentials: "include",
  });
}

export async function authRequestPasswordReset(email: string) {
  return customFetch<{ ok: boolean }>("/api/auth/password/request-reset", {
    method: "POST",
    body: JSON.stringify({ email }),
    skipAuth: true,
    credentials: "include",
  });
}

export async function authResetPassword(email: string, code: string, newPassword: string) {
  return customFetch<{ ok: boolean }>("/api/auth/password/reset", {
    method: "POST",
    body: JSON.stringify({ email, code, newPassword }),
    skipAuth: true,
    credentials: "include",
  });
}

export async function authRequestEmailVerification() {
  return customFetch<{ ok: boolean; alreadyVerified?: boolean; email?: string; expiresAt?: string }>(
    "/api/auth/verify-email/request",
    {
      method: "POST",
      body: JSON.stringify({}),
      credentials: "include",
    },
  );
}

export async function authConfirmEmailVerification(code: string) {
  return customFetch<{ ok: boolean; user: User }>("/api/auth/verify-email/confirm", {
    method: "POST",
    body: JSON.stringify({ code }),
    credentials: "include",
  });
}

export async function authGoogle(credential: string, role: "buyer" | "seller" | "both", location?: string) {
  return customFetch<{ token: string; user: User }>("/api/auth/google", {
    method: "POST",
    body: JSON.stringify({ credential, role, location }),
    skipAuth: true,
    credentials: "include",
  });
}
