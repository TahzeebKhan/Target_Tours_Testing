"use client";

import { useEffect } from "react";
import Cookies from "js-cookie";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";

const RequireAuth = ({
  children,
  redirectTo = "/",
  fallback = null,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const { isLoggedIn, loading } = useAuth();
  const token = Cookies.get("auth_token");
  const isAuthenticated = Boolean(isLoggedIn || token);

  useEffect(() => {
    if (loading || isAuthenticated) return;

    const next =
      redirectTo !== "/" && pathname
        ? `?next=${encodeURIComponent(pathname)}`
        : "";
    router.replace(`${redirectTo}${next}`);
  }, [isAuthenticated, loading, pathname, redirectTo, router]);

  if (loading) return fallback;
  if (!isAuthenticated) return fallback;

  return children;
};

export default RequireAuth;
