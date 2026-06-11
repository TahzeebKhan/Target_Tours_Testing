"use client";

import { createContext, useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const getProfileFallback = (userData, profileData = null) => ({
    ...(profileData || {}),
    full_name:
      profileData?.full_name ||
      profileData?.display_name ||
      userData?.full_name ||
      userData?.display_name ||
      userData?.name ||
      userData?.email?.split("@")[0] ||
      "",
    display_name:
      profileData?.display_name ||
      profileData?.full_name ||
      userData?.display_name ||
      userData?.full_name ||
      userData?.name ||
      userData?.email?.split("@")[0] ||
      "",
  });

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = Cookies.get("auth_token");
        const userCookie = Cookies.get("user");
        const profileCookie = Cookies.get("user_profile");

        if (!token || !userCookie) {
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
            expires: 7,
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

  const login = async ({ token, user, profile: loginProfile = null }) => {
    const fallbackProfile = getProfileFallback(user, loginProfile);

    Cookies.set("auth_token", token, { expires: 7 });
    Cookies.set("user", JSON.stringify(user), { expires: 7 });
    Cookies.set("user_id", user?.id, { expires: 7 });
    Cookies.set("user_profile", JSON.stringify(fallbackProfile), {
      expires: 7,
    });

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
          expires: 7,
        });
      }
    } catch (err) {
      console.error("Profile fetch after login failed", err);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    Cookies.remove("auth_token");
    Cookies.remove("user");
    Cookies.remove("user_profile");

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
