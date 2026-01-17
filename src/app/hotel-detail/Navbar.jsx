"use client";
import { useRouter } from "next/navigation";
import styles from "./Navbar.module.css";
import { useEffect, useState } from "react";
const Navbar = ({ isLoggedIn, setIsLoggedIn }) => {
  const router = useRouter();
  const [isMounted, setisMounted] = useState(false);
  useEffect(() => setisMounted(true), []);
  // const { isLoggedIn } = useAuth();
  return (
    <>
      {" "}
      <div className={`${styles.navContainer} fixed top-0 z-100`}>
        <div
          className={`${styles.navbar}  w-full flex  justify-between items-center`}
        >
          <img
            style={{ cursor: "pointer" }}
            onClick={() => router.push("/")}
            src="./Logo.svg"
            alt=""
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
                {!isLoggedIn && (
                  <button
                    onClick={() => router.push("/?openLogin=true")}
                    className={styles.signInBtn}
                  >
                    Sign In
                  </button>
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
