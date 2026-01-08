"use client";

import { useState } from "react";
import LoginPopup from "../profile/components/loginPopUp/LoginPopup";
import SignupPopup from "../profile/components/signUpPopUp/SignupPopup";

export default function AuthPopupManager() {
  const [activePopup, setActivePopup] = useState("login"); // 'login' | 'signup'

  return (
    <>
      {activePopup === "login" && (
        <LoginPopup onSwitchToSignup={() => setActivePopup("signup")} />
      )}

      {activePopup === "signup" && (
        <SignupPopup onSwitchToLogin={() => setActivePopup("login")} />
      )}
    </>
  );
}
