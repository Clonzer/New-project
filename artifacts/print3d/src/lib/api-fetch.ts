/** Use cookies only for same-origin API calls; cross-origin + credentials breaks with ACAO: * */
export function shouldIncludeApiCredentials(requestUrl: string): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    const targetOrigin = new URL(requestUrl, window.location.origin).origin;
    return targetOrigin === window.location.origin;
  } catch {
    return false;
  }
}

export function withApiFetchOptions(requestUrl: string, init?: RequestInit): RequestInit {
  return {
    ...init,
    credentials: shouldIncludeApiCredentials(requestUrl)
      ? init?.credentials ?? "include"
      : "omit",
  };
}
