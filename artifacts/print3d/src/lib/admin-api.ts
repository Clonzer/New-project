import { customFetch, type User } from "@/lib/workspace-api-mock";

export type AdminUser = Pick<User, "id" | "username" | "displayName" | "email" | "role" | "joinedAt"> & {
  accountStatus?: string | null;
  planTier?: string | null;
  isOwner?: boolean;
};

export function listAdminUsers() {
  return customFetch<{ users: AdminUser[] }>("/api/admin/users", {
    credentials: "include",
  });
}

export function updateAdminUserStatus(userId: number, accountStatus: string, planTier?: string) {
  return customFetch<{ user: AdminUser }>(`/api/admin/users/${userId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ accountStatus, planTier }),
    credentials: "include",
  });
}
