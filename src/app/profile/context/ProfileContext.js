"use client";
import React, { createContext, useContext, useEffect, useState } from "react";

const ProfileContext = createContext();

export const ProfileProvider = ({ children }) => {
  const [activeMenu, setActiveMenu] = useState("Personal Information");
  const [mobileTitle, setMobileTitle] = useState("");
  const [profilePhoto, setProfilePhoto] = useState("/images/profile1.jpg");
  useEffect(() => {
    if (window && window.innerWidth < 895) {
      setActiveMenu(""); // mobile → no default active
    }
  }, []);

  useEffect(() => {
    console.log(activeMenu);
  }, [activeMenu]);

  return (
    <ProfileContext.Provider
      value={{
        activeMenu,
        setActiveMenu,
        profilePhoto,
        mobileTitle,
        setMobileTitle,
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
