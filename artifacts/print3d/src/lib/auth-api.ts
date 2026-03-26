import { customFetch, type User } from "@workspace/api-client-react";

export async function authLogin(email: string, password: string) {
  return customFetch<{ token: string; user: User }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
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
