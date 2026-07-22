"use client";
import React, { createContext, useContext, useEffect, useState } from "react";

const ProfileContext = createContext();

const DEFAULT_ACTIVE_MENU = "Personal Information";
const ACTIVE_MENU_STORAGE_KEY = "profileActiveMenu";
const PROFILE_MENUS = new Set([
  "",
  "Personal Information",
  "editProfile",
  "paymentAccount",
  "trip",
  "wishList",
  "myNextTrip",
  "support",
  "myReviews",
  "settings",
]);

const getDefaultActiveMenu = () => {
  if (typeof window !== "undefined" && window.innerWidth < 895) {
    return "";
  }

  return DEFAULT_ACTIVE_MENU;
};

const getStoredActiveMenu = () => {
  if (typeof window === "undefined") return DEFAULT_ACTIVE_MENU;

  const storedMenu = window.localStorage.getItem(ACTIVE_MENU_STORAGE_KEY);
  return PROFILE_MENUS.has(storedMenu) ? storedMenu : getDefaultActiveMenu();
};

export const ProfileProvider = ({ children }) => {
  const [activeMenu, setActiveMenu] = useState(DEFAULT_ACTIVE_MENU);
  const [hasRestoredActiveMenu, setHasRestoredActiveMenu] = useState(false);
  const [mobileTitle, setMobileTitle] = useState("");
  const [tripFilter, setTripFilter] = useState("All");
  const [profilePhoto, setProfilePhoto] = useState("/images/profilePlaceholder.avif");
  useEffect(() => {
    setActiveMenu(getStoredActiveMenu());
    setHasRestoredActiveMenu(true);
  }, []);

  useEffect(() => {
    if (!hasRestoredActiveMenu) return;
    if (!PROFILE_MENUS.has(activeMenu)) return;

    window.localStorage.setItem(ACTIVE_MENU_STORAGE_KEY, activeMenu);
  }, [activeMenu, hasRestoredActiveMenu]);

  return (
    <ProfileContext.Provider
      value={{
        activeMenu,
        setActiveMenu,
        hasRestoredActiveMenu,
        profilePhoto,
        mobileTitle,
        tripFilter,
        setMobileTitle,
        setTripFilter,
        setProfilePhoto,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  return useContext(ProfileContext) ?? {};
};
