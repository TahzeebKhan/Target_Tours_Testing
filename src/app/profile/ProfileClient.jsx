"use client";

import ProfileSection from "./components/profileSection/ProfileSection";
import PaymentMethod from "./components/paymentMethod/PaymentMethod";
import Trip from "./components/trip/Trip";
import PersonalData from "./components/personalData/PersonalData";
import WishList from "./components/wishList/WishList";
import MyReview from "./components/myReview/MyReview";
import Support from "./components/Support/support";
import { useProfile } from "./context/ProfileContext";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

const ProfileClient = () => {
  const { activeMenu, setActiveMenu } = useProfile();
  const router = useRouter();
  const searchParams = useSearchParams(); // ✅ correct

  useEffect(() => {
    const isMyTrips = searchParams.get("my-trips") === "true";
    const isSettings = searchParams.get("settings") === "true";
    const hasBookingDetails = Boolean(
      searchParams.get("bookingId") && searchParams.get("bookingType")
    );

    if (isMyTrips || hasBookingDetails) {
      setActiveMenu("trip");
      if (isMyTrips) {
        router.replace("/profile", { scroll: false });
      }
    } else if (isSettings) {
      setActiveMenu("settings");
      router.replace("/profile", { scroll: false });
    }
  }, [searchParams, setActiveMenu, router]);

  return (
    <>
      {(activeMenu === "Personal Information" ||
        activeMenu === "editProfile") && <ProfileSection />}
      {activeMenu === "paymentAccount" && <PaymentMethod />}
      {activeMenu === "trip" && <Trip />}
      {(activeMenu === "wishList" || activeMenu === "myNextTrip") && (
        <WishList />
      )}
      {activeMenu === "support" && <Support />}
      {activeMenu === "myReviews" && <MyReview />}
      {activeMenu === "settings" && <PersonalData />}
    </>
  );
};

export default ProfileClient;
