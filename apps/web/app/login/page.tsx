"use client";

import { AxiosError } from "axios";
import { Eye, EyeOff, Loader2, LogIn, ShieldCheck } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { login, refreshSession } from "@/features/auth/api";
import { useAuthStore } from "@/features/auth/auth-store";

type LoginFormState = {
  email: string;
  password: string;
};

const defaultFormState: LoginFormState = {
  email: "",
  password: "",
};

const getAuthErrorMessage = (error: unknown) => {
  if (error instanceof AxiosError) {
    const message = error.response?.data?.message;

    if (Array.isArray(message)) {
      return message[0] ?? "Please check your credentials and try again.";
    }

    if (typeof message === "string") {
      return message;
    }
  }

  return "Unable to sign in. Please try again.";
};

function LoginLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <Loader2 className="size-5 animate-spin text-muted-foreground" />
    </main>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setSession = useAuthStore((state) => state.setSession);
  const clearSession = useAuthStore((state) => state.clearSession);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [form, setForm] = useState(defaultFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const nextPath = useMemo(() => {
    const next = searchParams.get("next");
    return next?.startsWith("/") ? next : "/dashboard";
  }, [searchParams]);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace(nextPath);
      return;
    }

    let isMounted = true;

    const restoreSession = async () => {
      try {
        const session = await refreshSession();

        if (!isMounted) return;

        setSession(session);
        router.replace(nextPath);
      } catch {
        if (!isMounted) return;

        clearSession();
        setIsCheckingSession(false);
      }
    };

    restoreSession();

    return () => {
      isMounted = false;
    };
  }, [clearSession, isAuthenticated, nextPath, router, setSession]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const session = await login({
        email: form.email.trim(),
        password: form.password,
      });

      setSession(session);
      router.replace(nextPath);
    } catch (error) {
      clearSession();
      setErrorMessage(getAuthErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isCheckingSession) {
    return <LoginLoading />;
  }

  return (
    <main className="min-h-screen bg-muted/30">
      <div className="mx-auto grid min-h-screen w-full max-w-6xl lg:grid-cols-[1fr_420px]">
        <section className="hidden flex-col justify-between border-r bg-background p-10 lg:flex">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <p className="text-lg font-semibold">FinSight AI</p>
              <p className="text-sm text-muted-foreground">
                Secure operations console
              </p>
            </div>
          </div>

          <div className="max-w-xl space-y-5">
            <p className="text-4xl font-semibold leading-tight">
              Client intelligence, KYC, and support workflows in one place.
            </p>
            <p className="text-base leading-7 text-muted-foreground">
              Sign in to manage client accounts, review verification status,
              and keep operational activity moving with clear context.
            </p>
          </div>

          <p className="text-sm text-muted-foreground">
            Protected by HTTP-only refresh cookies and short-lived access
            tokens.
          </p>
        </section>

        <section className="flex items-center justify-center px-4 py-10 sm:px-6">
          <Card className="w-full max-w-md rounded-lg">
            <CardHeader>
              <CardTitle className="text-2xl">Sign in</CardTitle>
              <CardDescription>
                Use your FinSight AI account to continue.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="email">
                    Email
                  </label>
                  <Input
                    autoComplete="email"
                    autoFocus
                    id="email"
                    inputMode="email"
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        email: event.target.value,
                      }))
                    }
                    placeholder="name@company.com"
                    required
                    type="email"
                    value={form.email}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="password">
                    Password
                  </label>
                  <div className="relative">
                    <Input
                      autoComplete="current-password"
                      className="pr-9"
                      id="password"
                      minLength={8}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          password: event.target.value,
                        }))
                      }
                      placeholder="Enter your password"
                      required
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                    />
                    <Button
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      className="absolute right-1 top-1/2 -translate-y-1/2"
                      onClick={() => setShowPassword((value) => !value)}
                      size="icon-xs"
                      type="button"
                      variant="ghost"
                    >
                      {showPassword ? (
                        <EyeOff className="size-3.5" />
                      ) : (
                        <Eye className="size-3.5" />
                      )}
                    </Button>
                  </div>
                </div>

                {errorMessage ? (
                  <div
                    className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                    role="alert"
                  >
                    {errorMessage}
                  </div>
                ) : null}

                <Button
                  className="w-full"
                  disabled={isSubmitting}
                  size="lg"
                  type="submit"
                >
                  {isSubmitting ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <LogIn className="size-4" />
                  )}
                  Sign in
                </Button>
              </form>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginLoading />}>
      <LoginForm />
    </Suspense>
  );
}
