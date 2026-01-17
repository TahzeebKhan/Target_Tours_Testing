"use client";
import { useRouter } from "next/navigation";
import styles from "./Navbar.module.css";
import LoginPopup from "../account/loginPopUp/LoginPopup";
import SignupPopup from "../account/signUpPopUp/SignupPopup";
import ProfileModal from "../home-page/components/homePage/modals/ProfileModal";
import { useAuth } from "../context/AuthContext";
import { useEffect, useRef, useState } from "react";
import Cookies from "js-cookie";
const Navbar = ({ scrollProgress = { scrollProgress } }) => {
  const hasToken = !!Cookies.get("auth_token");
  const [isLoggedIn, setIsLoggedIn] = useState(hasToken);
  const { profile: userProfile } = useAuth();
  const profileBtnRef = useRef(null);
  const [isMounted, setIsmounted] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [authView, setAuthView] = useState("login");
  const router = useRouter();
  const handleLogoClick = () => {
    router.push("/");
  };
  useEffect(() => {
    setIsmounted(true);
  }, []);
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
            <img src="./Logo.svg" alt="" />
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
                    onClick={() => setShowLogin(true)}
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
                      Hi, {userProfile?.display_name || "User"}
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
      </div>
    </>
  );
};

export default Navbar;
