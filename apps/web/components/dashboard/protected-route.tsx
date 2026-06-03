"use client";

import { Loader2 } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { refreshSession } from "@/features/auth/api";
import { useAuthStore } from "@/features/auth/auth-store";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const setSession = useAuthStore((state) => state.setSession);
  const clearSession = useAuthStore((state) => state.clearSession);
  const [isCheckingSession, setIsCheckingSession] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      return;
    }

    let isMounted = true;

    const verifySession = async () => {
      setIsCheckingSession(true);

      try {
        const session = await refreshSession();

        if (!isMounted) return;

        setSession(session);
        setIsCheckingSession(false);
      } catch {
        if (!isMounted) return;

        clearSession();
        const next = encodeURIComponent(pathname || "/dashboard");
        router.replace(`/login?next=${next}`);
      }
    };

    verifySession();

    return () => {
      isMounted = false;
    };
  }, [clearSession, isAuthenticated, pathname, router, setSession]);

  if (!isAuthenticated || isCheckingSession) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-muted/30">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </main>
    );
  }

  return children;
}
