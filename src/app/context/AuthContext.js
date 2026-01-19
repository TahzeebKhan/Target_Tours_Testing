"use client";

import { createContext, useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    console.log("chnaged profile", profile);
  }, [setProfile, profile]);
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = Cookies.get("auth_token");
        const userCookie = Cookies.get("user");

        if (!token || !userCookie) {
          setLoading(false);
          return;
        }

        const parsedUser = JSON.parse(userCookie);
        setUser(parsedUser);
        setIsLoggedIn(true);
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
          setProfile(profileData);
        }
      } catch (err) {
        console.error("Auth init failed", err);
        setUser(null);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async ({ token, user }) => {
    Cookies.set("auth_token", token, { expires: 7 });
    Cookies.set("user", JSON.stringify(user), { expires: 7 });
    Cookies.set("user_id", user?.id, { expires: 7 });

    setUser(user);
    setIsLoggedIn(true);
    setProfile(null); // show "Hi, User" initially
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

        setProfile(profileData); // 🔥 re-renders → "Hi, Full Name"

        Cookies.set("user_profile", JSON.stringify(profileData), {
          expires: 7,
        });
      }
    } catch (err) {
      console.error("Profile fetch after login failed", err);
      setProfile(null);
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
