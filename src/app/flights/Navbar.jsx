"use client";
import { useRouter } from "next/navigation";
import styles from "./Navbar.module.css";
import LoginPopup from "../account/loginPopUp/LoginPopup";
import SignupPopup from "../account/signUpPopUp/SignupPopup";
import ProfileModal from "../home-page/components/homePage/modals/ProfileModal";
import { useAuth } from "../context/AuthContext";
import { useEffect, useRef, useState } from "react";
import BrandLogo from "@/shared/components/BrandLogo";
const Navbar = ({ scrollProgress = { scrollProgress } }) => {
  const { isLoggedIn, profile: userProfile, user } = useAuth();
  const profileBtnRef = useRef(null);
  const [isMounted, setIsmounted] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [authView, setAuthView] = useState("login");
  const router = useRouter();
  const handleLogoClick = () => {
    router.push("/");
  };
  const openLoginModal = () => {
    setAuthView("login");
    setShowLogin(true);
  };
  const closeAuthModal = () => {
    setShowLogin(false);
    setAuthView("login");
  };
  const navigateAuthModal = (view) => {
    setAuthView(view);
    setShowLogin(true);
  };
  useEffect(() => {
    setIsmounted(true);
  }, []);

  const displayName =
    userProfile?.display_name ||
    userProfile?.full_name ||
    user?.name ||
    user?.email?.split("@")[0] ||
    "User";

  return (
    <>
      {" "}
      <div
        style={
          {
            // transform: `translateY(${-72 * scrollProgress}px)`,
            // opacity: 1 - scrollProgress,
          }
        }
        className={`${styles.navContainer} top-0 z-1`}
      >
        <div
          className={`${styles.navbar}  w-full flex  justify-between items-center`}
        >
          <div onClick={handleLogoClick} className="cursor-pointer">
            <BrandLogo fallbackSrc="/Logo.svg" alt="Target Tours Logo" />
          </div>
          <div className={`${styles.navRight} flex gap-3`}>
            <button className={`${styles.glass_button} ${styles.downloadBtn}`}>
              Download the App
            </button>
            {/* <button className={styles.signInBtn}>Sign In</button> */}
            {isMounted && (
              <>
                {!isLoggedIn ? (
                  <button
                    className={styles.signInBtn}
                    type="button"
                    onClick={openLoginModal}
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
        {showLogin && authView === "login" && (
          <LoginPopup
            key="login"
            onClose={closeAuthModal}
            onNavigate={navigateAuthModal}
          />
        )}

        {showLogin && authView === "signup" && (
          <SignupPopup
            key="signup"
            onClose={closeAuthModal}
            onNavigate={navigateAuthModal}
          />
        )}
      </div>
    </>
  );
};

export default Navbar;
