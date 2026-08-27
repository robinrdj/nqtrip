import { zodResolver } from "@hookform/resolvers/zod";
import { MountainSnow } from "lucide-react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ApiError } from "../api/client";
import { Button } from "../components/ui/Button";
import { TextField } from "../components/ui/Field";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { loginSchema, type LoginValues } from "../lib/schemas";
import { useAuth } from "../providers/AuthProvider";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useDocumentTitle("Sign in");

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await login(values);
      // `next` carries where the visitor was headed before being asked to sign
      // in. Only relative paths are honoured — an absolute URL here would make
      // this an open redirect.
      const next = searchParams.get("next");
      navigate(next?.startsWith("/") ? next : "/", { replace: true });
    } catch (err) {
      setError("root", {
        message:
          err instanceof ApiError
            ? err.message
            : "We could not sign you in. Please try again.",
      });
    }
  });

  const fillDemo = () => {
    setValue("email", "demo@qtrip.dev");
    setValue("password", "Demo1234");
  };

  return (
    <div className="mx-auto flex max-w-md flex-col justify-center px-4 py-16 sm:px-6">
      <div className="text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-brand-600 text-white">
          <MountainSnow className="size-6" aria-hidden="true" />
        </span>
        <h1 className="mt-5 text-2xl font-semibold tracking-tight text-ink">
          Welcome back
        </h1>
        <p className="mt-1.5 text-ink-soft">Sign in to book and save adventures.</p>
      </div>

      <form onSubmit={onSubmit} noValidate className="mt-8 space-y-1">
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
          autoComplete="current-password"
          error={errors.password?.message}
          {...register("password")}
        />

        {errors.root && (
          <p
            role="alert"
            className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-400"
          >
            {errors.root.message}
          </p>
        )}

        <Button type="submit" size="lg" className="mt-3 w-full" loading={isSubmitting}>
          Sign in
        </Button>
      </form>

      {/*
        A recruiter should be able to see the signed-in app without inventing an
        account, so the demo credentials are one click away.
      */}
      <button
        type="button"
        onClick={fillDemo}
        className="mt-4 rounded-lg border border-dashed border-line-strong px-4 py-3 text-sm text-ink-soft transition hover:border-brand-500 hover:text-ink"
      >
        Just looking around?{" "}
        <span className="font-medium text-brand-600">Use the demo account</span>
      </button>

      <p className="mt-6 text-center text-sm text-ink-muted">
        Do not have an account?{" "}
        <Link to="/register" className="font-medium text-brand-600 hover:underline">
          Create one
        </Link>
      </p>
    </div>
  );
}
