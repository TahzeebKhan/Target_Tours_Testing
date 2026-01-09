"use client";

import ProfileSection from "./components/profileSection/ProfileSection";
import PaymentMethod from "./components/paymentMethod/PaymentMethod";
import Trip from "./components/trip/Trip";
import PersonalData from "./components/personalData/PersonalData";
import WishList from "./components/wishList/WishList";
import MyReview from "./components/myReview/MyReview";
import Support from "./components/Support/support";
import { useProfile } from "./context/ProfileContext";

const ProflePage = () => {
  const { activeMenu } = useProfile();

  return (
    <>
      {activeMenu === "Personal Information" && <ProfileSection />}
      {activeMenu === "paymentAccount" && <PaymentMethod />}
      {activeMenu === "trip" && <Trip />}
      {activeMenu === "wishList" && <WishList />}
      {activeMenu === "support" && <Support />}
      {activeMenu === "myReviews" && <MyReview />}
      {activeMenu === "settings" && <PersonalData />}
    </>
  );
};

export default ProflePage;
