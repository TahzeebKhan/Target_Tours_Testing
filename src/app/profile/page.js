"use client";
import React, { useState } from "react";
import ProfileSection from "./components/profileSection/ProfileSection";
import PaymentMethod from "./components/paymentMethod/PaymentMethod";
import EmptyTrip from "./components/emptyTrip/EmptyTrip";
import Reservations from "./components/reservations/Reservations";
import PersonalData from "./components/personalData/PersonalData";
import IndividualProperty from "./components/individualProperty/IndividualProperty";

import { useProfile } from "./context/ProfileContext";
import WishList from "./components/wishList/WishList";
import MyNextTrip from "./components/wishList/components/myNextTrip/MyNextTrip";
import MyReview from "./components/myReview/MyReview";

const ProflePage = () => {
  const { activeMenu } = useProfile();
  const [showReservations, setShowReservations] = useState(false);
  const [showIndividualProperty, setShowIndividualProperty] = useState(false);

  return (
    <>
      {activeMenu === "Personal Information" && <ProfileSection />}

      {activeMenu === "paymentAccount" && <PaymentMethod />}

      {activeMenu === "trip" &&
        (!showReservations ? (
          <EmptyTrip onStartSearching={() => setShowReservations(true)} />
        ) : !showIndividualProperty ? (
          <Reservations
            onCheckDetails={() => setShowIndividualProperty(true)}
          />
        ) : (
          <IndividualProperty />
        ))}

      {activeMenu === "wishList" && <div>WishLists</div>}
      {activeMenu === "support" && <div>Support</div>}
      {activeMenu === "myReviews" && <div>My Reviews</div>}
      {activeMenu === "settings" && <div>Settings</div>}
    </>
  );
};

export default ProflePage;
