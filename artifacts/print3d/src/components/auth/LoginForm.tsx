import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { NeonButton } from "@/components/ui/neon-button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/hooks/use-auth";
import { getApiErrorMessage } from "@/lib/api-error";
import { authRequestPasswordReset, authResetPassword } from "@/lib/auth-api";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import { Link } from "wouter";

const loginSchema = z.object({
  identifier: z.string().trim().min(1, "Enter your email or username"),
  password: z.string().min(1, "Password is required"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm({
  onSuccess,
  submitLabel = "Sign in",
}: {
  onSuccess?: () => void;
  submitLabel?: string;
}) {
  const { login } = useAuth();
  const prefilledEmail =
    typeof window === "undefined" ? "" : new URLSearchParams(window.location.search).get("email")?.trim() ?? "";
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryState, setRecoveryState] = useState({
    email: prefilledEmail,
    code: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [recoveryMessage, setRecoveryMessage] = useState<string | null>(null);
  const [recovering, setRecovering] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: prefilledEmail, password: "" },
  });
  const shouldSuggestSignup = !!error && /account|not found|incorrect/i.test(error);
  const { loginWithGoogle } = useAuth();

  const onSubmit = async (data: LoginFormValues) => {
    setError(null);
    setSubmitting(true);
    try {
      await login(data.identifier.trim(), data.password);
      onSuccess?.();
    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      setSubmitting(false);
    }
  };

  const sendRecoveryCode = async () => {
    setRecoveryMessage(null);
    setRecovering(true);
    try {
      await authRequestPasswordReset(recoveryState.email.trim());
      setRecoveryMessage("If that email exists, we sent a 6-digit reset code.");
    } catch (e) {
      setRecoveryMessage(getApiErrorMessage(e));
    } finally {
      setRecovering(false);
    }
  };

  const resetPassword = async () => {
    if (recoveryState.newPassword !== recoveryState.confirmPassword) {
      setRecoveryMessage("Your new passwords do not match.");
      return;
    }
    setRecovering(true);
    try {
      await authResetPassword(
        recoveryState.email.trim(),
        recoveryState.code.trim(),
        recoveryState.newPassword,
      );
      setRecoveryMessage("Password updated. You can sign in now.");
      setShowRecovery(false);
    } catch (e) {
      setRecoveryMessage(getApiErrorMessage(e));
    } finally {
      setRecovering(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive" className="border-red-500/40 bg-red-950/40">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Sign in failed</AlertTitle>
          <AlertDescription className="space-y-2">
            <p>{error}</p>
            {shouldSuggestSignup ? (
              <p>
                Need an account?{" "}
                <Link href="/register" className="underline hover:text-white">
                  Create one instead
                </Link>
              </p>
            ) : null}
          </AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="identifier"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-zinc-300">Email or username</FormLabel>
                <FormControl>
                  <Input
                    autoComplete="username"
                    placeholder="you@example.com or maker_name"
                    className="bg-black/30 border-white/10 text-white h-12 rounded-xl"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-zinc-300">Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      className="bg-black/30 border-white/10 text-white h-12 rounded-xl pr-12"
                      {...field}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((current) => !current)}
                      className="absolute inset-y-0 right-0 flex min-w-[4.5rem] items-center justify-center gap-1 px-3 text-xs font-medium uppercase tracking-[0.22em] text-zinc-500 transition hover:text-white"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      <span>{showPassword ? "Hide" : "Show"}</span>
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <NeonButton type="submit" glowColor="primary" className="w-full rounded-xl py-3" disabled={submitting}>
            {submitting ? "Signing in…" : submitLabel}
          </NeonButton>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-zinc-900 px-2 text-zinc-500">or continue with</span>
            </div>
          </div>
          
          <button
            type="button"
            onClick={async () => {
              setError(null);
              setSubmitting(true);
              try {
                const { error } = await loginWithGoogle();
                if (error) {
                  setError(error.message);
                }
              } catch (e) {
                setError(getApiErrorMessage(e));
              } finally {
                setSubmitting(false);
              }
            }}
            className="w-full flex items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/5 py-3 text-white hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={submitting}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {submitting ? "Connecting..." : "Google"}
          </button>
          
          <button
            type="button"
            onClick={() => {
              setShowRecovery((current) => !current);
              setRecoveryState((current) => ({ ...current, email: current.email || form.getValues("identifier") }));
            }}
            className="w-full text-sm text-zinc-400 hover:text-white transition-colors"
          >
            Forgot your password?
          </button>
        </form>
      </Form>

      {showRecovery ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-4">
          <div>
            <p className="text-sm font-medium text-white">Recover account by email</p>
            <p className="mt-1 text-xs text-zinc-400">
              We’ll email a 6-digit code so you can set a new password.
            </p>
          </div>
          <Input
            value={recoveryState.email}
            onChange={(event) => setRecoveryState((current) => ({ ...current, email: event.target.value }))}
            placeholder="Account email"
            className="bg-black/30 border-white/10 text-white h-11 rounded-xl"
          />
          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <Input
              value={recoveryState.code}
              onChange={(event) => setRecoveryState((current) => ({ ...current, code: event.target.value }))}
              placeholder="6-digit code"
              className="bg-black/30 border-white/10 text-white h-11 rounded-xl"
            />
            <NeonButton glowColor="white" className="rounded-xl px-5" onClick={() => void sendRecoveryCode()} disabled={recovering}>
              {recovering ? "Sending..." : "Send code"}
            </NeonButton>
          </div>
          <Input
            type="password"
            value={recoveryState.newPassword}
            onChange={(event) => setRecoveryState((current) => ({ ...current, newPassword: event.target.value }))}
            placeholder="New password"
            className="bg-black/30 border-white/10 text-white h-11 rounded-xl"
          />
          <Input
            type="password"
            value={recoveryState.confirmPassword}
            onChange={(event) => setRecoveryState((current) => ({ ...current, confirmPassword: event.target.value }))}
            placeholder="Confirm new password"
            className="bg-black/30 border-white/10 text-white h-11 rounded-xl"
          />
          {recoveryMessage ? <p className="text-sm text-zinc-300">{recoveryMessage}</p> : null}
          <NeonButton glowColor="primary" className="w-full rounded-xl py-3" onClick={() => void resetPassword()} disabled={recovering}>
            {recovering ? "Updating..." : "Reset password"}
          </NeonButton>
        </div>
      ) : null}
    </div>
  );
}
