"use client";
import React from "react";
import ProfileSection from "./components/profileSection/ProfileSection";


import { useProfile } from "./context/ProfileContext";

const ProflePage = () => {
  const { activeMenu } = useProfile();
  return (
    <>
      {activeMenu === "Personal Information" && <ProfileSection />}
      {activeMenu === "paymentAccount" && <div>Payment Account</div>}
      {activeMenu === "trip" && <div>Trips</div>}
      {activeMenu === "wishList" && <div>WishLists</div>}
      {activeMenu === "support" && <div>Support</div>}
      {activeMenu === "myReviews" && <div>My Reviews</div>}
      {activeMenu === "settings" && <div>Settings</div>}
    </>
  );
};

export default ProflePage;
