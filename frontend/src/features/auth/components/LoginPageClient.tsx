// src/features/auth/components/LoginPageClient.tsx
"use client";

import { Badge } from "@shared/components/ui/badge";
import { Card, CardContent } from "@shared/components/ui/card";
import { ShieldCheck, Sparkles, Workflow } from "lucide-react";
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
    try {
      setIsLoading(true);
      setErrorMessage(undefined);

      const result = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
      });

      if (result?.error !== null && result?.error !== undefined) {
        setErrorMessage("Invalid email or password");
        return;
      }

      const session = await getSession();

      if (session === null) {
        setErrorMessage(
          "Sign in succeeded but session could not be loaded. Please try again.",
        );
        return;
      }

      const roleName = session.user?.role?.name;

      if (roleName === "Admin" || roleName === "Staff") {
        router.push("/admin/dashboard");
      } else {
        router.push("/unauthorized");
      }
    } catch {
      setErrorMessage("We couldn't sign you in right now. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="grid w-full items-center gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(420px,520px)] lg:gap-16">
      <section className="space-y-8 text-white">
        <Badge className="inline-flex rounded-full border border-white/10 bg-white/6 px-3 py-1 text-[11px] font-semibold tracking-[0.18em] text-zinc-100 uppercase shadow-none backdrop-blur-sm hover:bg-white/6">
          Admin Workspace
        </Badge>
        <div className="max-w-2xl space-y-5">
          <div className="space-y-3">
            <p className="text-sm font-medium tracking-[0.24em] text-zinc-400 uppercase">
              Aksharpith Catalog
            </p>
            <h1 className="max-w-xl text-4xl font-semibold tracking-[-0.03em] text-white sm:text-5xl">
              Sign in to manage products, variants, media, and access controls.
            </h1>
          </div>
          <p className="max-w-xl text-base leading-7 text-zinc-300 sm:text-lg">
            Keep the catalog operation moving with one focused workspace for
            product setup, lot matrix management, and admin workflows.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-3xl border border-white/8 bg-white/4 p-5 backdrop-blur-sm">
            <ShieldCheck className="size-5 text-zinc-100" />
            <p className="mt-4 text-sm font-semibold text-white">
              Secure access
            </p>
            <p className="mt-2 text-sm leading-6 text-zinc-300">
              Admin and staff sessions stay inside the protected backend-driven
              workspace.
            </p>
          </div>
          <div className="rounded-3xl border border-white/8 bg-white/4 p-5 backdrop-blur-sm">
            <Workflow className="size-5 text-zinc-100" />
            <p className="mt-4 text-sm font-semibold text-white">
              Unified workflow
            </p>
            <p className="mt-2 text-sm leading-6 text-zinc-300">
              Handle departments, groups, products, media, and lot matrix setup
              from one consistent admin surface.
            </p>
          </div>
          <div className="rounded-3xl border border-white/8 bg-white/4 p-5 backdrop-blur-sm">
            <Sparkles className="size-5 text-zinc-100" />
            <p className="mt-4 text-sm font-semibold text-white">
              Production ready
            </p>
            <p className="mt-2 text-sm leading-6 text-zinc-300">
              Clean contracts, stricter typing, and predictable module
              structure keep the frontend easier to operate.
            </p>
          </div>
        </div>
      </section>

      <section className="w-full">
        <Card className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/96 py-0 text-zinc-900 shadow-[0_24px_80px_rgba(0,0,0,0.42)] ring-1 ring-white/10 backdrop-blur">
          <CardContent className="px-0">
            <div className="border-b border-zinc-100 px-6 pb-6 pt-7 sm:px-8">
              <p className="text-xs font-semibold tracking-[0.22em] text-zinc-400 uppercase">
                Welcome back
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-zinc-950">
                Sign in
              </h2>
              <p className="mt-3 text-sm leading-6 text-zinc-500">
                Use your work credentials to access the Aksharpith admin
                workspace.
              </p>
            </div>
            <div className="px-6 py-6 sm:px-8 sm:py-7">
              <LoginForm
                onSubmit={handleLogin}
                isLoading={isLoading}
                errorMessage={errorMessage}
              />
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
