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
