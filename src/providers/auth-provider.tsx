'use client';

import { useEffect } from "react";
import { useAuthStore } from "@/store/use-auth-store";
import { bootstrapCurrentUser } from "@/lib/auth-client";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const setUser = useAuthStore((state) => state.setUser);
  const setHydrated = useAuthStore((state) => state.setHydrated);

  useEffect(() => {
    let isMounted = true;

    bootstrapCurrentUser()
      .then((user) => {
        if (!isMounted) {
          return;
        }

        setUser(user);
      })
      .finally(() => {
        if (isMounted) {
          setHydrated(true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [setHydrated, setUser]);

  return <>{children}</>;
}
