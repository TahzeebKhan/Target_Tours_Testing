"use client";

import { useState } from "react";

import ProfileSection from "./ProfileSection";
import PaymentMethod from "./PaymentMethod";
import ChoosePaymentMethod from "./ChoosePaymentMethod";
import EmptyTrip from "./EmptyTrip";
import Reservations from "./Reservations";
import Wishlist from "./Wishlist";
import LoginPopup from "../profile/components/loginPopUp/LoginPopup";
import SignupPopup from "../profile/components/signUpPopUp/SignupPopup";

export default function ProfilePage() {
  const [activePage, setActivePage] = useState("login");

  return (
    <main>
      {activePage === "login" && <LoginPopup onNavigate={setActivePage} />}

      {activePage === "signup" && <SignupPopup onNavigate={setActivePage} />}

      {activePage === "profile" && <ProfileSection />}

      {activePage === "payment" && <PaymentMethod />}

      {activePage === "choosePayment" && <ChoosePaymentMethod />}

      {activePage === "emptyTrip" && <EmptyTrip onNavigate={setActivePage} />}

      {activePage === "reservations" && (
        <Reservations onNavigate={setActivePage} />
      )}

      {activePage === "wishlist" && <Wishlist />}
    </main>
  );
}
