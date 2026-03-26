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
import { AlertCircle } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
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

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setError(null);
    setSubmitting(true);
    try {
      await login(data.email.trim().toLowerCase(), data.password);
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
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-zinc-300">Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
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
                  <Input
                    type="password"
                    autoComplete="current-password"
                    className="bg-black/30 border-white/10 text-white h-12 rounded-xl"
                    {...field}
                  />
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
