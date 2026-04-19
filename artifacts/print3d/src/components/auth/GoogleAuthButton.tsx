import { useEffect, useRef, useState } from "react";
import { setStoredAccessToken } from "@/lib/workspace-api-mock";
import { useAuth } from "@/hooks/use-auth";
import { authGoogle } from "@/lib/auth-api";
import { getApiErrorMessage } from "@/lib/api-error";

type GoogleAuthButtonProps = {
  role: "both";
  location?: string;
  onAuthed?: (user: Awaited<ReturnType<typeof authGoogle>>["user"]) => void | Promise<void>;
};

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim() || "";

function loadGoogleScript() {
  return new Promise<void>((resolve, reject) => {
    if ((window as any).google?.accounts?.id) {
      resolve();
      return;
    }

    const existing = document.querySelector<HTMLScriptElement>('script[data-google-gsi="true"]');
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Could not load Google sign-in.")), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.dataset.googleGsi = "true";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Could not load Google sign-in."));
    document.head.appendChild(script);
  });
}

export function GoogleAuthButton({ role, location, onAuthed }: GoogleAuthButtonProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const { refreshUser } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || !ref.current) return;

    let cancelled = false;
    loadGoogleScript()
      .then(() => {
        if (cancelled || !ref.current) return;
        const google = (window as any).google;
        google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: async ({ credential }: { credential: string }) => {
            try {
              setError(null);
              const { token, user } = await authGoogle(credential, role, location);
              setStoredAccessToken(token);
              await refreshUser();
              await onAuthed?.(user);
            } catch (err) {
              setError(getApiErrorMessage(err));
            }
          },
        });
        ref.current.innerHTML = "";
        google.accounts.id.renderButton(ref.current, {
          theme: "outline",
          size: "large",
          text: "continue_with",
          shape: "pill",
          width: 320,
        });
      })
      .catch((err) => setError(getApiErrorMessage(err)));

    return () => {
      cancelled = true;
    };
  }, [location, onAuthed, refreshUser, role]);

  if (!GOOGLE_CLIENT_ID) return null;

  return (
    <div className="space-y-2">
      <div ref={ref} className="flex justify-center sm:justify-start" />
      {error ? <p className="text-sm text-red-300">{error}</p> : null}
    </div>
  );
}
