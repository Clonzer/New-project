/** localStorage key for JWT (also sent as Authorization: Bearer for API calls). */
export const ACCESS_TOKEN_STORAGE_KEY = "synthix_access_token";

export const AUTH_TOKEN_CHANGE_EVENT = "synthix:auth-token";

export function getStoredAccessToken(): string | null {
  try {
    return localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setStoredAccessToken(token: string | null) {
  try {
    if (token) localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, token);
    else localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
  } catch {
    // ignore
  }
  window.dispatchEvent(new Event(AUTH_TOKEN_CHANGE_EVENT));
}
