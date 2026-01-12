"use client";

import ProfileSection from "./components/profileSection/ProfileSection";
import PaymentMethod from "./components/paymentMethod/PaymentMethod";
import Trip from "./components/trip/Trip";
import PersonalData from "./components/personalData/PersonalData";
import WishList from "./components/wishList/WishList";
import MyReview from "./components/myReview/MyReview";
import Support from "./components/Support/support";
import { useProfile } from "./context/ProfileContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const ProflePage = ({ searchParams }) => {
  const { activeMenu, setActiveMenu } = useProfile();

  // const searchParams = useSearchParams();
  const router = useRouter();
  useEffect(() => {
    const isMyTrips = searchParams?.["my-trips"] === "true";

    if (isMyTrips) {
      setActiveMenu("trip");
      if (router) {
        router.replace("/profile", { scroll: false });
      }
    }
  }, [searchParams, setActiveMenu]);

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
