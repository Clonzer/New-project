const configuredApiBase = String(import.meta.env.VITE_API_URL || "/api").replace(/\/+$/, "");

export function getApiBaseUrl(): string {
  if (!configuredApiBase) {
    return "/api";
  }

  if (typeof window === "undefined") {
    return configuredApiBase;
  }

  try {
    const configuredHost = new URL(configuredApiBase, window.location.origin).host;
    if (
      window.location.host !== configuredHost &&
      (configuredApiBase.startsWith("http://localhost") ||
        configuredApiBase.startsWith("http://127.0.0.1") ||
        configuredApiBase.startsWith("https://localhost") ||
        configuredApiBase.startsWith("https://127.0.0.1"))
    ) {
      return window.location.origin.replace(/\/+$/, "");
    }
  } catch {
    // Relative values like /api are fine as-is.
  }

  return configuredApiBase;
}

export function buildApiUrl(path: string): string {
  const base = getApiBaseUrl();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  if (base.endsWith("/api") && normalizedPath.startsWith("/api")) {
    return `${base}${normalizedPath.slice(4)}`;
  }

  return `${base}${normalizedPath}`;
}

/** Cloudflare/static hosting has no Express /api — avoid fetching HTML error pages. */
export function isExpressApiEnabled(): boolean {
  const flag = String(import.meta.env.VITE_ENABLE_EXPRESS_API ?? "").trim().toLowerCase();
  if (flag === "true" || flag === "1") return true;
  if (flag === "false" || flag === "0") return false;

  const connectProvider = String(import.meta.env.VITE_STRIPE_CONNECT_PROVIDER ?? "supabase")
    .trim()
    .toLowerCase();
  return connectProvider === "express";
}
