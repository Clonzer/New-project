import { customFetch, type User } from "@workspace/api-client-react";

export type AdminUser = Pick<User, "id" | "username" | "displayName" | "email" | "role" | "joinedAt"> & {
  accountStatus?: string | null;
  isOwner?: boolean;
};

export function listAdminUsers() {
  return customFetch<{ users: AdminUser[] }>("/api/admin/users", {
    credentials: "include",
  });
}

export function updateAdminUserStatus(userId: number, accountStatus: string) {
  return customFetch<{ user: AdminUser }>(`/api/admin/users/${userId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ accountStatus }),
    credentials: "include",
  });
}
