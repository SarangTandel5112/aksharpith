// src/features/auth/components/LoginForm.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { LoginFormSchema, type LoginFormValues } from "../schemas/login.schema";

type LoginFormProps = {
  onSubmit: (values: LoginFormValues) => void | Promise<void>;
  isLoading?: boolean;
  errorMessage?: string | undefined;
};

export function LoginForm(props: LoginFormProps): React.JSX.Element {
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(LoginFormSchema),
    defaultValues: { email: "", password: "" },
  });

  function handleSubmit(values: LoginFormValues): void | Promise<void> {
    return props.onSubmit(values);
  }

  return (
    <form
      onSubmit={form.handleSubmit(handleSubmit)}
      className="flex flex-col gap-4 w-full max-w-sm"
      noValidate
    >
      {props.errorMessage !== undefined && props.errorMessage !== "" && (
        <div
          role="alert"
          className="rounded-lg border border-[var(--color-danger)] bg-[var(--color-danger)]/10 p-3 text-sm text-[var(--color-danger)]"
        >
          {props.errorMessage}
        </div>
      )}

      <div className="flex flex-col gap-1">
        <label
          htmlFor="email"
          className="text-sm font-medium text-[var(--text-heading)]"
        >
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          className="rounded-md border border-[var(--surface-border)] bg-[var(--surface-page)] px-3 py-2 text-sm outline-none focus:border-[var(--primary-500)] focus:ring-2 focus:ring-[var(--primary-alpha-2)]"
          {...form.register("email")}
        />
        {form.formState.errors.email !== undefined && (
          <p className="text-xs text-[var(--color-danger)]">
            {form.formState.errors.email.message}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label
          htmlFor="password"
          className="text-sm font-medium text-[var(--text-heading)]"
        >
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          className="rounded-md border border-[var(--surface-border)] bg-[var(--surface-page)] px-3 py-2 text-sm outline-none focus:border-[var(--primary-500)] focus:ring-2 focus:ring-[var(--primary-alpha-2)]"
          {...form.register("password")}
        />
        {form.formState.errors.password !== undefined && (
          <p className="text-xs text-[var(--color-danger)]">
            {form.formState.errors.password.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={props.isLoading === true}
        className="rounded-md bg-[var(--primary-500)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--primary-600)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {props.isLoading === true ? "Signing in\u2026" : "Sign in"}
      </button>
    </form>
  );
}
