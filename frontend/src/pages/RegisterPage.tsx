import { zodResolver } from "@hookform/resolvers/zod";
import { Check, MountainSnow, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { ApiError } from "../api/client";
import { Button } from "../components/ui/Button";
import { TextField } from "../components/ui/Field";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { registerSchema, type RegisterValues } from "../lib/schemas";
import { useAuth } from "../providers/AuthProvider";
import { cn } from "../lib/cn";

/** The password rules, shown live so nobody has to guess what is missing. */
const RULES = [
  { label: "At least 8 characters", test: (v: string) => v.length >= 8 },
  { label: "A lowercase letter", test: (v: string) => /[a-z]/.test(v) },
  { label: "An uppercase letter", test: (v: string) => /[A-Z]/.test(v) },
  { label: "A number", test: (v: string) => /[0-9]/.test(v) },
];

export default function RegisterPage() {
  const { register: createAccount } = useAuth();
  const navigate = useNavigate();

  useDocumentTitle("Create an account");

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    // Validating as the visitor types is right for a signup form: the rules are
    // checkable client-side, so making them wait for submit to learn the
    // password is too short would be needless.
    mode: "onChange",
    defaultValues: { name: "", email: "", password: "" },
  });

  const password = watch("password") ?? "";

  const onSubmit = handleSubmit(async (values) => {
    try {
      await createAccount(values);
      navigate("/", { replace: true });
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setError("email", { message: err.message });
        return;
      }
      setError("root", {
        message:
          err instanceof ApiError
            ? err.message
            : "We could not create your account. Please try again.",
      });
    }
  });

  return (
    <div className="mx-auto flex max-w-md flex-col justify-center px-4 py-16 sm:px-6">
      <div className="text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-brand-600 text-white">
          <MountainSnow className="size-6" aria-hidden="true" />
        </span>
        <h1 className="mt-5 text-2xl font-semibold tracking-tight text-ink">
          Create your account
        </h1>
        <p className="mt-1.5 text-ink-soft">
          Book adventures and keep track of your trips.
        </p>
      </div>

      <form onSubmit={onSubmit} noValidate className="mt-8 space-y-1">
        <TextField
          label="Name"
          autoComplete="name"
          placeholder="Your name"
          error={errors.name?.message}
          {...register("name")}
        />

        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register("email")}
        />

        <TextField
          label="Password"
          type="password"
          autoComplete="new-password"
          {...register("password")}
        />

        <ul className="space-y-1 pb-2">
          {RULES.map((rule) => {
            const met = rule.test(password);
            return (
              <li
                key={rule.label}
                className={cn(
                  "flex items-center gap-2 text-sm transition-colors",
                  met ? "text-emerald-600 dark:text-emerald-400" : "text-ink-muted"
                )}
              >
                {met ? (
                  <Check className="size-3.5 shrink-0" strokeWidth={3} />
                ) : (
                  <X className="size-3.5 shrink-0" />
                )}
                {rule.label}
              </li>
            );
          })}
        </ul>

        {errors.root && (
          <p
            role="alert"
            className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-400"
          >
            {errors.root.message}
          </p>
        )}

        <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-muted">
        Already have an account?{" "}
        <Link to="/login" className="font-medium text-brand-600 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
