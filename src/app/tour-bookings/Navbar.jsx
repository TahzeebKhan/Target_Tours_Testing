"use client";
import { useRouter } from "next/navigation";
import styles from "./Navbar.module.css";
import { useAuth } from "../context/AuthContext";
import ProfileModal from "../home-page/components/homePage/modals/ProfileModal";
import { useEffect, useRef, useState } from "react";
import Cookies from "js-cookie";
import BrandLogo from "@/shared/components/BrandLogo";
const Navbar = () => {
  const { isLoggedIn, profile: userProfile } = useAuth();

  const hasToken = !!Cookies.get("auth_token");
  const [isLoggedInCookie, setIsLoggedInCookie] = useState(hasToken);
  const router = useRouter();
  const [showLogin, setShowLogin] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const profileBtnRef = useRef(null);
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);
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
                    onClick={() => router.push("/?openLogin=true")}
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

            {/* {!isLoggedIn && (
              <button
                onClick={() => router.push("/?openLogin=true")}
                className={styles.signInBtn}
              >
                Sign In
              </button>
            )} */}

            <button className={styles.hamBurger}>
              <img src="/icons/hamBurger.png" alt="" />
              menu
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
