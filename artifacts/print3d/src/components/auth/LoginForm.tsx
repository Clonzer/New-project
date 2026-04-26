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

  const onSubmit = async (data: { identifier: string; password: string }) => {
    setError(null);
    setSubmitting(true);
    try {
      const { error, data: loginData } = await login(data.identifier.trim(), data.password);
      if (error) {
        setError(error.message);
        return;
      }
      if (loginData?.user) {
        // Store flag to show tutorial on dashboard
        localStorage.setItem('showTutorial', 'true');
        onSuccess?.();
      }
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
