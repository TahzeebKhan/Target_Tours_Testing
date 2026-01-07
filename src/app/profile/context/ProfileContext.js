"use client";
import React, { createContext, useContext, useState } from 'react';

const ProfileContext = createContext();

export const ProfileProvider = ({ children }) => {
    const [activeMenu, setActiveMenu] = useState("myReviews");

    return (
        <ProfileContext.Provider value={{ activeMenu, setActiveMenu }}>
            {children}
        </ProfileContext.Provider>
    );
};

export const useProfile = () => useContext(ProfileContext);
