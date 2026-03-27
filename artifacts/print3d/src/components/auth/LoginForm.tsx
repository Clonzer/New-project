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
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const prefilledEmail =
    typeof window === "undefined" ? "" : new URLSearchParams(window.location.search).get("email")?.trim() ?? "";

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: prefilledEmail, password: "" },
  });
  const shouldSuggestSignup = !!error && /account|not found|incorrect/i.test(error);

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
        </form>
      </Form>
    </div>
  );
}
