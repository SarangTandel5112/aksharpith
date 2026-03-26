// src/features/auth/components/LoginPageClient.tsx
"use client";

import { useRouter } from "next/navigation";
import { getSession, signIn } from "next-auth/react";
import { useState } from "react";
import type { LoginFormValues } from "../validations/login.schema";
import { LoginForm } from "./LoginForm";

export function LoginPageClient(): React.JSX.Element {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(
    undefined,
  );

  async function handleLogin(values: LoginFormValues): Promise<void> {
    setIsLoading(true);
    setErrorMessage(undefined);

    const result = await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false,
    });

    setIsLoading(false);

    if (result?.error !== null && result?.error !== undefined) {
      setErrorMessage("Invalid email or password");
      return;
    }

    const session = await getSession();

    if (session === null) {
      setErrorMessage(
        "Sign in succeeded but session could not be loaded. Please try again.",
      );
      setIsLoading(false);
      return;
    }

    const roleName = session.user?.role?.name;

    if (roleName === "Admin" || roleName === "Staff") {
      router.push("/admin/dashboard");
    } else {
      router.push("/unauthorized");
    }
  }

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-sm px-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-[var(--text-heading)]">
          Aksharpith Catalog
        </h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Sign in to your account
        </p>
      </div>

      <LoginForm
        onSubmit={handleLogin}
        isLoading={isLoading}
        errorMessage={errorMessage}
      />
    </div>
  );
}
