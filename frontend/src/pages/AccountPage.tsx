import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import * as api from "../api/client";
import { ApiError } from "../api/client";
import { Button } from "../components/ui/Button";
import { TextField } from "../components/ui/Field";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { profileSchema, type ProfileValues } from "../lib/schemas";
import { currentUserKey, useAuth } from "../providers/AuthProvider";
import { useTheme, type Theme } from "../providers/ThemeProvider";
import { cn } from "../lib/cn";

const THEMES: { value: Theme; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
];

export default function AccountPage() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  useDocumentTitle("Account");

  const updateProfile = useMutation({
    mutationFn: api.updateProfile,
    onSuccess: ({ user: next }) => {
      queryClient.setQueryData(currentUserKey, next);
      toast.success("Profile updated.");
    },
  });

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name ?? "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await updateProfile.mutateAsync(values);
    } catch (err) {
      setError("root", {
        message: err instanceof ApiError ? err.message : "That did not save.",
      });
    }
  });

  if (!user) return null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-ink">Account</h1>
        <p className="mt-1 text-ink-soft">Your details and preferences.</p>
      </header>

      <section className="rounded-panel border border-line bg-surface-raised p-6">
        <h2 className="font-semibold text-ink">Profile</h2>

        <form onSubmit={onSubmit} noValidate className="mt-4 space-y-1">
          <TextField
            label="Name"
            autoComplete="name"
            error={errors.name?.message}
            {...register("name")}
          />

          <TextField
            label="Email"
            value={user.email}
            readOnly
            disabled
            hint="Your email cannot be changed here."
          />

          {errors.root && (
            <p role="alert" className="text-sm text-red-600 dark:text-red-400">
              {errors.root.message}
            </p>
          )}

          <Button type="submit" loading={isSubmitting} disabled={!isDirty}>
            Save changes
          </Button>
        </form>
      </section>

      <section className="mt-6 rounded-panel border border-line bg-surface-raised p-6">
        <h2 className="font-semibold text-ink">Appearance</h2>
        <p className="mt-1 text-sm text-ink-soft">
          "System" follows whatever your device is set to.
        </p>

        <div
          className="mt-4 inline-flex rounded-xl bg-surface-inset p-1"
          role="radiogroup"
          aria-label="Theme"
        >
          {THEMES.map((option) => (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={theme === option.value}
              onClick={() => setTheme(option.value)}
              className={cn(
                "rounded-lg px-4 py-1.5 text-sm font-medium transition",
                theme === option.value
                  ? "bg-surface-raised text-ink shadow-sm"
                  : "text-ink-muted hover:text-ink"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-panel border border-line bg-surface-raised p-6">
        <h2 className="font-semibold text-ink">Session</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Signed in as {user.email}.
        </p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={async () => {
            await logout();
            navigate("/");
          }}
        >
          Sign out
        </Button>
      </section>
    </div>
  );
}
