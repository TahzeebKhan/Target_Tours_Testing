"use client";

import React, { useState } from "react";
import LoginPopup from "@/app/account/loginPopUp/LoginPopup";
import SignupPopup from "@/app/account/signUpPopUp/SignupPopup";
import { useAuth } from "@/app/context/AuthContext";
import styles from "./OfferBanner.module.css";
import Cookies from "js-cookie";

const OfferBanner = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [authView, setAuthView] = useState("login");
  const { isLoggedIn, loading } = useAuth();
  const hasAuthToken = Boolean(Cookies.get("auth_token"));

  const openLoginModal = () => {
    setAuthView("login");
    setShowLogin(true);
  };

  if (loading || isLoggedIn || hasAuthToken) {
    return null;
  }

  return (
    <>
      <div className={styles.banner}>
        <div className={styles.left}>
          <div className={styles.badge}>New</div>
          <p className={styles.text}>
            Get <span>12% Off</span> On Your First Flight
          </p>
        </div>

        <button className={styles.loginBtn} type="button" onClick={openLoginModal}>
          LOGIN / SIGNUP
        </button>
      </div>

      {showLogin && authView === "login" && (
        <LoginPopup
          onClose={() => setShowLogin(false)}
          onNavigate={setAuthView}
        />
      )}

      {showLogin && authView === "signup" && (
        <SignupPopup
          onClose={() => setShowLogin(false)}
          onNavigate={setAuthView}
        />
      )}
    </>
  );
};

export default OfferBanner;
