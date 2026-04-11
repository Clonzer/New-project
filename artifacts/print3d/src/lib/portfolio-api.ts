import { customFetch } from "@/lib/workspace-api-mock";

export type PortfolioItem = {
  id: number;
  userId: number;
  title: string;
  description?: string | null;
  imageUrl: string;
  tags: string[];
  createdAt: string;
};

export function listPortfolio(userId: number) {
  return customFetch<{ portfolio: PortfolioItem[] }>(`/api/users/${userId}/portfolio`, {
    credentials: "include",
  });
}

export function createPortfolioItem(
  userId: number,
  input: { title: string; description?: string | null; imageUrl: string; tags?: string[] },
) {
  return customFetch<{ item: PortfolioItem }>(`/api/users/${userId}/portfolio`, {
    method: "POST",
    body: JSON.stringify(input),
    credentials: "include",
  });
}

export function deletePortfolioItem(userId: number, portfolioId: number) {
  return customFetch<{ ok: boolean }>(`/api/users/${userId}/portfolio/${portfolioId}`, {
    method: "DELETE",
    credentials: "include",
  });
}
