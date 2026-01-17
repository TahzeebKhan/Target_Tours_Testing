"use client";
import { useRouter } from "next/navigation";
import styles from "./Navbar.module.css";
import { useAuth } from "../context/AuthContext";
import ProfileModal from "../home-page/components/homePage/modals/ProfileModal";
import { useRef, useState } from "react";
const Navbar = () => {
    const { isLoggedIn, profile: userProfile } = useAuth();
  const router = useRouter();
  const [showLogin, setShowLogin] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const profileBtnRef = useRef(null);

  return (
    <>
      {" "}
      <div className={`${styles.navContainer} fixed top-0 z-50`}>
        <div
          className={`${styles.navbar}  w-full flex  justify-between items-center`}
        >
          <img
            onClick={() => router.push("/")}
            style={{ cursor: "pointer" }}
            src="./Logo.svg"
            alt=""
          />
          <div className={`${styles.navRight} flex gap-3`}>
            <div className={styles.sessionExpires}>
              <img src="/icons/watchIcon.svg" alt="" />
              <p className={styles.sessionExpiresText}>
                Session expires in <span>14:32</span>
              </p>
            </div>
            <button className={`${styles.glass_button} ${styles.downloadBtn}`}>
              Download the App
            </button>
            {/* {!isLoggedIn && (
              <button
                onClick={() => router.push("/?openLogin=true")}
                className={styles.signInBtn}
              >
                Sign In
              </button>
            )} */}
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
