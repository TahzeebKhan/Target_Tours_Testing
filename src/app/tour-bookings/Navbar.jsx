"use client";
import { useRouter } from "next/navigation";
import styles from "./Navbar.module.css";
import { getAuthDisplayName, useAuth } from "../context/AuthContext";
import ProfileModal from "../home-page/components/homePage/modals/ProfileModal";
import { useEffect, useRef, useState } from "react";
import Cookies from "js-cookie";
import BrandLogo from "@/shared/components/BrandLogo";
import LoginPopup from "../account/loginPopUp/LoginPopup";
import SignupPopup from "../account/signUpPopUp/SignupPopup";
const Navbar = () => {
  const { isLoggedIn, profile: userProfile, user } = useAuth();
  const displayName = getAuthDisplayName(userProfile, user);

  const hasToken = !!Cookies.get("auth_token");
  const [isLoggedInCookie, setIsLoggedInCookie] = useState(hasToken);
  const router = useRouter();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authView, setAuthView] = useState("login");
  const [showProfileModal, setShowProfileModal] = useState(false);
  const profileBtnRef = useRef(null);
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);
  const openAuthModal = () => {
    setAuthView("login");
    setShowAuthModal(true);
  };
  const closeAuthModal = () => {
    setShowAuthModal(false);
    setAuthView("login");
  };
  return (
    <>
      {" "}
      <div className={`${styles.navContainer} fixed top-0 z-50`}>
        <div
          className={`${styles.navbar}  w-full flex  justify-between items-center`}
        >
          <BrandLogo
            onClick={() => router.push("/")}
            style={{ cursor: "pointer" }}
            fallbackSrc="/Logo.svg"
            alt="Target Tours Logo"
          />
          <div className={`${styles.navRight} flex gap-3`}>
            {isMounted && (
              <>
                <div className={styles.sessionExpires}>
                  <img src="/icons/watchIcon.svg" alt="" />
                  <p className={styles.sessionExpiresText}>
                    Session expires in <span>14:32</span>
                  </p>
                </div>
                <button
                  className={`${styles.glass_button} ${styles.downloadBtn}`}
                >
                  Download the App
                </button>

                {!isLoggedInCookie ? (
                  <button
                    className={styles.signInBtn}
                    onClick={openAuthModal}
                  >
                    Sign In
                  </button>
                ) : (
                  <>
                    <button
                      ref={profileBtnRef}
                      onClick={() => setShowProfileModal(true)}
                      className={`${styles.glass_button} ${styles.logggedInBtn}`}
                      type="button"
                    >
                      Hi, {displayName}
                    </button>

                    {showProfileModal && (
                      <ProfileModal
                        anchorRef={profileBtnRef}
                        onClose={() => setShowProfileModal(false)}
                      />
                    )}
                  </>
                )}
              </>
            )}

            <button className={styles.hamBurger}>
              <img src="/icons/hamBurger.png" alt="" />
              menu
            </button>
          </div>
        </div>
      </div>
      {showAuthModal && authView === "login" && (
        <LoginPopup onClose={closeAuthModal} onNavigate={setAuthView} />
      )}
      {showAuthModal && authView === "signup" && (
        <SignupPopup onClose={closeAuthModal} onNavigate={setAuthView} />
      )}
    </>
  );
};

export default Navbar;
