"use client";

import { createContext, useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";

const AuthContext = createContext(null);
const AUTH_SESSION_DURATION_MS = 24 * 60 * 60 * 1000;
const AUTH_EXPIRY_COOKIE = "auth_expires_at";

const clearAuthCookies = () => {
  Cookies.remove("auth_token");
  Cookies.remove("user");
  Cookies.remove("user_id");
  Cookies.remove("user_profile");
  Cookies.remove(AUTH_EXPIRY_COOKIE);
};

const INVALID_DISPLAY_NAMES = new Set([
  "user",
  "choose how your name appears across transpeed.",
]);

const getValidName = (...values) =>
  values.find((value) => {
    if (typeof value !== "string") return false;

    const name = value.trim();
    return (
      name &&
      !INVALID_DISPLAY_NAMES.has(name.toLowerCase())
    );
  })?.trim() || "";

export const getAuthDisplayName = (profileData, userData) =>
  getValidName(
    profileData?.display_name,
    profileData?.full_name,
    userData?.display_name,
    userData?.full_name,
    userData?.name,
    userData?.email?.split("@")[0],
  ) || "User";

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const getProfileFallback = (userData, profileData = null) => ({
    ...(profileData || {}),
    full_name: getValidName(
      profileData?.full_name,
      userData?.full_name,
      userData?.display_name,
      userData?.name,
      userData?.email?.split("@")[0],
    ),
    display_name: getValidName(
      profileData?.display_name,
      profileData?.full_name,
      userData?.display_name,
      userData?.full_name,
      userData?.name,
      userData?.email?.split("@")[0],
    ),
  });

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = Cookies.get("auth_token");
        const userCookie = Cookies.get("user");
        const profileCookie = Cookies.get("user_profile");
        const expiresAt = Number(Cookies.get(AUTH_EXPIRY_COOKIE));

        if (
          !token ||
          !userCookie ||
          !Number.isFinite(expiresAt) ||
          Date.now() >= expiresAt
        ) {
          clearAuthCookies();
          setLoading(false);
          return;
        }

        const parsedUser = JSON.parse(userCookie);
        const cachedProfile = profileCookie ? JSON.parse(profileCookie) : null;
        setUser(parsedUser);
        setIsLoggedIn(true);
        if (cachedProfile) {
          setProfile(getProfileFallback(parsedUser, cachedProfile));
        }
        if (!parsedUser.id) {
          console.log("no user id");
          return;
        }
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/frontend-user-profiles/by-user/${parsedUser.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (res.ok) {
          const profileData = await res.json();
          const nextProfile = getProfileFallback(parsedUser, profileData);
          setProfile(nextProfile);
          Cookies.set("user_profile", JSON.stringify(nextProfile), {
            expires: new Date(expiresAt),
          });
        }
      } catch (err) {
        console.error("Auth init failed", err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  useEffect(() => {
    if (!isLoggedIn) return undefined;

    const expiresAt = Number(Cookies.get(AUTH_EXPIRY_COOKIE));
    const remainingTime = expiresAt - Date.now();

    if (!Number.isFinite(expiresAt) || remainingTime <= 0) {
      clearAuthCookies();
      setUser(null);
      setProfile(null);
      setIsLoggedIn(false);
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      clearAuthCookies();
      setUser(null);
      setProfile(null);
      setIsLoggedIn(false);
    }, remainingTime);

    return () => window.clearTimeout(timeoutId);
  }, [isLoggedIn]);

  const login = async ({ token, user, profile: loginProfile = null }) => {
    const fallbackProfile = getProfileFallback(user, loginProfile);
    const expiresAt = Date.now() + AUTH_SESSION_DURATION_MS;
    const expires = new Date(expiresAt);

    Cookies.set("auth_token", token, { expires });
    Cookies.set("user", JSON.stringify(user), { expires });
    Cookies.set("user_id", user?.id, { expires });
    Cookies.set("user_profile", JSON.stringify(fallbackProfile), {
      expires,
    });
    Cookies.set(AUTH_EXPIRY_COOKIE, String(expiresAt), { expires });

    setUser(user);
    setIsLoggedIn(true);
    setProfile(fallbackProfile);
    setLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/frontend-user-profiles/by-user/${user.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (res.ok) {
        const profileData = await res.json();
        const nextProfile = getProfileFallback(user, profileData);

        setProfile(nextProfile); // 🔥 re-renders → "Hi, Full Name"

        Cookies.set("user_profile", JSON.stringify(nextProfile), {
          expires,
        });
      }
    } catch (err) {
      console.error("Profile fetch after login failed", err);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    clearAuthCookies();

    setUser(null);
    setProfile(null);
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        user,
        profile,
        setProfile,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
};
