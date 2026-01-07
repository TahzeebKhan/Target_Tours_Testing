"use client";
import React, { useState } from "react";
import ProfileSection from "./components/profileSection/ProfileSection";
import PaymentMethod from "./components/paymentMethod/PaymentMethod";
import EmptyTrip from "./components/emptyTrip/EmptyTrip";
import Reservations from "./components/reservations/Reservations";
import PersonalData from "./components/personalData/PersonalData";
import { useProfile } from "./context/ProfileContext";

const ProflePage = () => {
  const { activeMenu } = useProfile();
  const [showReservations, setShowReservations] = useState(false);

  return (
    <>
      {activeMenu === "Personal Information" && <ProfileSection />}

      {activeMenu === "paymentAccount" && <PaymentMethod />}

      {activeMenu === "trip" &&
        (!showReservations ? (
          <EmptyTrip onStartSearching={() => setShowReservations(true)} />
        ) : (
          <Reservations />
        ))}

      {activeMenu === "wishList" && <div>WishLists</div>}
      {activeMenu === "support" && <div>Support</div>}
      {activeMenu === "myReviews" && <div>My Reviews</div>}
      {activeMenu === "settings" && <PersonalData />}
    </>
  );
};

export default ProflePage;
