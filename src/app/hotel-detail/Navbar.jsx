"use client";
import { useRouter } from "next/navigation";
import styles from "./Navbar.module.css";
import { useEffect, useRef, useState } from "react";
import BrandLogo from "@/shared/components/BrandLogo";
import ProfileModal from "../home-page/components/homePage/modals/ProfileModal";
import { getAuthDisplayName, useAuth } from "../context/AuthContext";
import LoginPopup from "../account/loginPopUp/LoginPopup";
import SignupPopup from "../account/signUpPopUp/SignupPopup";

const Navbar = ({ isLoggedIn, setIsLoggedIn }) => {
  const router = useRouter();
  const [isMounted, setisMounted] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authView, setAuthView] = useState("login");
  const profileBtnRef = useRef(null);
  const {
    isLoggedIn: authLoggedIn,
    profile: userProfile,
    user,
  } = useAuth();
  const isUserLoggedIn = isLoggedIn ?? authLoggedIn;
  const displayName = getAuthDisplayName(userProfile, user);

  useEffect(() => setisMounted(true), []);

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
      <div className={`${styles.navContainer} fixed top-0 z-100`}>
        <div
          className={`${styles.navbar}  w-full flex  justify-between items-center`}
        >
          <BrandLogo
            style={{ cursor: "pointer" }}
            onClick={() => router.push("/")}
            fallbackSrc="/Logo.svg"
            alt="Target Tours Logo"
          />
          <div className={`${styles.navRight} flex gap-3`}>
            {/* <div className={styles.sessionExpires}>
              <img src="/icons/watchIcon.svg" alt="" />
              <p className={styles.sessionExpiresText}>Session expires in <span>14:32</span></p>
            </div> */}
            {isMounted && (
              <>
                <button
                  className={`${styles.glass_button} ${styles.downloadBtn}`}
                >
                  Download the App
                </button>
                {!isUserLoggedIn ? (
                  <button
                    onClick={openAuthModal}
                    className={styles.signInBtn}
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
