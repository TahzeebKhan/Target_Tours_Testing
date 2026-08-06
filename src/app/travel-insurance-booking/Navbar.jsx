"use client";
import Link from "next/link";
import styles from "./Navbar.module.css";
import BrandLogo from "@/shared/components/BrandLogo";
const Navbar = () => {
  return (
    <>
      {" "}
      <div className={`${styles.navContainer} fixed top-0 z-100`}>
        <div
          className={`${styles.navbar}  w-full flex  justify-between items-center`}
        >
          <Link href="/" aria-label="Go to home">
            <BrandLogo fallbackSrc="/Logo.svg" alt="Target Tours Logo" />
          </Link>
          <div className={`${styles.navRight} flex gap-3`}>
            <div className={styles.sessionExpires}>
              <img src="/icons/watchIcon.svg" alt="" />
              <p className={styles.sessionExpiresText}>Session expires in <span>14:32</span></p>
            </div>
            <button className={`${styles.glass_button} ${styles.downloadBtn}`}>
              Download the App
            </button>
            <button className={styles.signInBtn}>Sign In</button>
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
