// src/features/auth/components/LoginForm.tsx
"use client";

import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { Label } from "@shared/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle, LockKeyhole, Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import {
  LoginFormSchema,
  type LoginFormValues,
} from "../validations/login.schema";

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
    <form onSubmit={form.handleSubmit(handleSubmit)} className="flex w-full flex-col gap-5" noValidate>
      {props.errorMessage !== undefined && props.errorMessage !== "" && (
        <div
          role="alert"
          className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
        >
          {props.errorMessage}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium text-zinc-800">
          Email
        </Label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@aksharpith.com"
            className="h-11 rounded-xl border-zinc-200 bg-white pl-10 shadow-[0_1px_0_rgba(255,255,255,0.8)_inset]"
            {...form.register("email")}
          />
        </div>
        {form.formState.errors.email !== undefined && (
          <p className="text-xs text-rose-600">
            {form.formState.errors.email.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-sm font-medium text-zinc-800">
          Password
        </Label>
        <div className="relative">
          <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="Enter your password"
            className="h-11 rounded-xl border-zinc-200 bg-white pl-10 shadow-[0_1px_0_rgba(255,255,255,0.8)_inset]"
            {...form.register("password")}
          />
        </div>
        {form.formState.errors.password !== undefined && (
          <p className="text-xs text-rose-600">
            {form.formState.errors.password.message}
          </p>
        )}
      </div>

      <div className="rounded-2xl border border-zinc-100 bg-zinc-50 px-4 py-3 text-sm leading-6 text-zinc-500">
        Use an admin or staff account to access the operational workspace.
      </div>

      <Button
        type="submit"
        disabled={props.isLoading === true}
        size="lg"
        className="h-11 w-full rounded-xl bg-zinc-950 text-sm font-semibold text-white hover:bg-zinc-800"
      >
        {props.isLoading === true ? (
          <>
            <LoaderCircle className="size-4 animate-spin" />
            Signing in...
          </>
        ) : (
          "Sign in"
        )}
      </Button>
    </form>
  );
}
