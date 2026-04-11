import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useWatch } from "react-hook-form";
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
import { useAuth } from "@/contexts/supabase-auth-context";
import { supabase } from "@/lib/supabase";
import type { User } from "@/lib/supabase";
import { getApiErrorMessage } from "@/lib/api-error";
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton";
import { AlertCircle, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { Link } from "wouter";

const registrationSchema = z
  .object({
    username: z
      .string()
      .trim()
      .min(3, "Username must be at least 3 characters")
      .regex(/^[a-zA-Z0-9_-]+$/, "Use letters, numbers, underscores, or hyphens only"),
    displayName: z.string().trim().min(2, "Display name must be at least 2 characters"),
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

function getPasswordStrength(password: string) {
  const checks = [
    password.length >= 8,
    /[a-z]/.test(password) && /[A-Z]/.test(password),
    /\d/.test(password),
    /[^A-Za-z0-9]/.test(password),
    password.length >= 12,
  ];
  const score = checks.filter(Boolean).length;

  if (score <= 1) {
    return { label: "Weak", color: "bg-red-500", textColor: "text-red-300", width: "20%" };
  }
  if (score <= 3) {
    return { label: "Fair", color: "bg-yellow-500", textColor: "text-yellow-300", width: "60%" };
  }
  if (score === 4) {
    return { label: "Good", color: "bg-sky-500", textColor: "text-sky-300", width: "80%" };
  }
  return { label: "Strong", color: "bg-emerald-500", textColor: "text-emerald-300", width: "100%" };
}

export function RegistrationForm({
  onRegistered,
  defaultRole = "buyer",
}: {
  onRegistered: (user: User) => void | Promise<void>;
  defaultRole?: "buyer" | "seller" | "both";
}) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const { login, register: supabaseRegister } = useAuth();

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
  const passwordValue = useWatch({ control: form.control, name: "password" }) || "";
  const passwordStrength = useMemo(() => getPasswordStrength(passwordValue), [passwordValue]);
  const enteredEmail = form.watch("email")?.trim().toLowerCase() ?? "";
  const loginHref = enteredEmail ? `/login?email=${encodeURIComponent(enteredEmail)}` : "/login";
  const shouldSuggestLogin =
    !!error &&
    (/email already exists/i.test(error) ||
      /already have an account/i.test(error) ||
      /account was created/i.test(error) ||
      /sign in with your email/i.test(error));

  const onSubmit = async (data: RegistrationFormValues) => {
    setError(null);
    setSuccess(null);
    setSubmitting(true);
    try {
      const isSellerish = data.role === "seller" || data.role === "both";
      const emailNorm = data.email.trim().toLowerCase();
      
      // Register with Supabase Auth
      const { error: signUpError } = await supabaseRegister(
        emailNorm,
        data.password,
        {
          username: data.username.trim(),
          display_name: data.displayName.trim(),
          role: data.role,
          location: data.location?.trim() || null,
          shop_name: isSellerish ? "" : null,
          shop_mode: isSellerish ? "both" : null,
        }
      );
      
      if (signUpError) {
        throw signUpError;
      }
      
      // Auto login after registration
      const { error: loginError } = await login(emailNorm, data.password);
      
      if (loginError) {
        setError(
          "Account was created, but automatic sign-in failed. Please sign in with your email and password.",
        );
        return;
      }
      
      // Get the user from the current session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setError("Could not retrieve user session.");
        return;
      }
      
      // Build user object
      const user: User = {
        id: session.user.id,
        email: session.user.email || emailNorm,
        role: data.role,
        username: data.username.trim(),
        displayName: data.displayName.trim(),
        location: data.location?.trim() || null,
        isVerified: false,
        stripeConnectEnabled: false,
      };
      
      setSuccess("Account created. You're signed in.");
      await onRegistered(user);
    } catch (e: any) {
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
          <AlertDescription className="space-y-2">
            <p>{error}</p>
            {shouldSuggestLogin ? (
              <p>
                Already have an account?{" "}
                <Link href={loginHref} className="underline hover:text-white">
                  Sign in instead
                </Link>
              </p>
            ) : null}
          </AlertDescription>
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
          <GoogleAuthButton
            role={form.watch("role")}
            location={form.watch("location") || undefined}
            onAuthed={async (user) => {
              setSuccess("Signed in with Google.");
              await onRegistered(user);
            }}
          />
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-[11px] uppercase tracking-[0.24em] text-zinc-500">
              <span className="bg-background px-3">or continue with email</span>
            </div>
          </div>
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
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
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
                  <div className="mt-2">
                    <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${passwordStrength.color}`}
                        style={{ width: passwordValue ? passwordStrength.width : "0%" }}
                      />
                    </div>
                    <p className={`mt-2 text-xs ${passwordStrength.textColor}`}>
                      Password strength: {passwordValue ? passwordStrength.label : "Enter a password"}
                    </p>
                  </div>
                  <FormDescription className="text-zinc-500 text-xs">
                    Use 8+ characters with a mix of upper/lowercase, numbers, and symbols.
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
                  <div className="relative">
                    <Input
                      type={showPasswordConfirm ? "text" : "password"}
                      autoComplete="new-password"
                      className="bg-black/30 border-white/10 text-white h-12 rounded-xl pr-12"
                      {...field}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswordConfirm((current) => !current)}
                      className="absolute inset-y-0 right-0 flex min-w-[4.5rem] items-center justify-center gap-1 px-3 text-xs font-medium uppercase tracking-[0.22em] text-zinc-500 transition hover:text-white"
                      aria-label={showPasswordConfirm ? "Hide password confirmation" : "Show password confirmation"}
                    >
                      {showPasswordConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      <span>{showPasswordConfirm ? "Hide" : "Show"}</span>
                    </button>
                  </div>
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
