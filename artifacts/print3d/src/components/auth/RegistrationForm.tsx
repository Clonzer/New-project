import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { NeonButton } from "@/components/ui/neon-button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { createUser, type User, type CreateUserRequestRole } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { getApiErrorMessage } from "@/lib/api-error";
import { AlertCircle, CheckCircle2 } from "lucide-react";

const registrationSchema = z
  .object({
    username: z.string().min(3, "Username must be at least 3 characters"),
    displayName: z.string().min(2, "Display name must be at least 2 characters"),
    email: z.string().email("Enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    passwordConfirm: z.string().min(1, "Confirm your password"),
    role: z.enum(["buyer", "seller", "both"]),
    location: z.string().optional(),
  })
  .refine((d) => d.password === d.passwordConfirm, {
    message: "Passwords do not match",
    path: ["passwordConfirm"],
  });

export type RegistrationFormValues = z.infer<typeof registrationSchema>;

export function RegistrationForm({
  onRegistered,
  defaultRole = "buyer",
}: {
  onRegistered: (user: User) => void | Promise<void>;
  defaultRole?: CreateUserRequestRole;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { login } = useAuth();

  const form = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      username: "",
      displayName: "",
      email: "",
      password: "",
      passwordConfirm: "",
      role: defaultRole,
      location: "",
    },
  });

  const onSubmit = async (data: RegistrationFormValues) => {
    setError(null);
    setSuccess(null);
    setSubmitting(true);
    try {
      const isSellerish = data.role === "seller" || data.role === "both";
      const emailNorm = data.email.trim().toLowerCase();
      const payload = {
        username: data.username.trim(),
        displayName: data.displayName.trim(),
        email: emailNorm,
        password: data.password,
        role: data.role,
        location: data.location?.trim() || null,
        shopName: isSellerish ? "" : null,
        shopMode: isSellerish ? ("both" as const) : null,
      };
      await createUser(payload);
      let sessionUser: User;
      try {
        sessionUser = await login(emailNorm, data.password);
      } catch {
        setError(
          "Account was created, but automatic sign-in failed. Please sign in with your email and password.",
        );
        return;
      }
      setSuccess("Account created. You're signed in.");
      await onRegistered(sessionUser);
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
          <AlertTitle>Registration failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && !error && (
        <Alert className="border-emerald-500/30 bg-emerald-950/30">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <AlertTitle className="text-emerald-200">Success</AlertTitle>
          <AlertDescription className="text-zinc-300">{success}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-zinc-300">Account type</FormLabel>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {(
                    [
                      { value: "buyer" as const, label: "Buyer", desc: "Order from sellers" },
                      { value: "seller" as const, label: "Seller", desc: "Run a shop" },
                      { value: "both" as const, label: "Both", desc: "Buy and sell" },
                    ] as const
                  ).map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => field.onChange(opt.value)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        field.value === opt.value
                          ? "border-primary bg-primary/15 text-white"
                          : "border-white/10 text-zinc-400 hover:border-white/20 hover:text-white"
                      }`}
                    >
                      <p className="text-sm font-semibold">{opt.label}</p>
                      <p className="text-[11px] opacity-70 mt-0.5">{opt.desc}</p>
                    </button>
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FormField
              control={form.control}
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-300">Display name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Jane Doe"
                      autoComplete="name"
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
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-300">Username</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="jane_maker"
                      autoComplete="username"
                      className="bg-black/30 border-white/10 text-white h-12 rounded-xl"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-zinc-300">Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    className="bg-black/30 border-white/10 text-white h-12 rounded-xl"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-300">Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      autoComplete="new-password"
                      className="bg-black/30 border-white/10 text-white h-12 rounded-xl"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-zinc-500 text-xs">
                    At least 8 characters.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="passwordConfirm"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-300">Confirm password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      autoComplete="new-password"
                      className="bg-black/30 border-white/10 text-white h-12 rounded-xl"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-zinc-300">
                  Location <span className="text-zinc-600">(optional)</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="City, Country"
                    autoComplete="address-level2"
                    className="bg-black/30 border-white/10 text-white h-12 rounded-xl"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <NeonButton type="submit" glowColor="primary" className="w-full rounded-xl py-3" disabled={submitting}>
            {submitting ? "Creating account…" : "Create account"}
          </NeonButton>
        </form>
      </Form>
    </div>
  );
}
