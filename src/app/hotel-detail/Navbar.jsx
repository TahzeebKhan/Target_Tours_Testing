"use client";
import { useRouter } from "next/navigation";
import styles from "./Navbar.module.css";
import { useEffect, useRef, useState } from "react";
import BrandLogo from "@/shared/components/BrandLogo";
import ProfileModal from "../home-page/components/homePage/modals/ProfileModal";
import { useAuth } from "../context/AuthContext";

const Navbar = ({ isLoggedIn, setIsLoggedIn }) => {
  const router = useRouter();
  const [isMounted, setisMounted] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const profileBtnRef = useRef(null);
  const { isLoggedIn: authLoggedIn, profile: userProfile } = useAuth();
  const isUserLoggedIn = isLoggedIn ?? authLoggedIn;

  useEffect(() => setisMounted(true), []);

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
                    onClick={() => router.push("/?openLogin=true")}
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
      </div>
    </>
  );
};

export default Navbar;
