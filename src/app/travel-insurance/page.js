"use client";
import React, { useRef, useState } from "react";
import Comprehensive from "./components/Comprehensive/Comprehensive";
import Claim from "./components/Claim/Claim";
import Questions from "./components/Questions/questions";
import FeatureSection from "../home-page/components/featureSection/FeatureSection";
import Footer from "../home-page/components/footer/Footer";
import TravelInsurance from "./components/Navbar/TravelInsurance";
import styles from "./TravelInsurancePage.module.css";
import { useAuth } from "../context/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ProfileModal from "../home-page/components/homePage/modals/ProfileModal";
import BrandLogo from "@/shared/components/BrandLogo";
const page = () => {
  const { isLoggedIn, profile: userProfile } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const profileBtnRef = useRef(null);
  const router = useRouter();
  return (
    <div className={styles.container}>
      <div
        className={`${styles.menuSection} ${
          menuOpen ? styles.menuOpen : styles.menuClose
        }`}
      >
        <div className={`${styles.navContainer} top-0 z-20`}>
          <div
            className={`${styles.navbar}  w-full flex  justify-between items-center`}
          >
            <Link href="/" aria-label="Go to home">
              <BrandLogo fallbackSrc="/Logo.svg" alt="Target Tours Logo" />
            </Link>
            <div className={`${styles.navRight} flex gap-3`}>
              <button
                className={`${styles.glass_button} ${styles.downloadBtn}`}
              >
                Download the App
              </button>
              {!isLoggedIn ? (
                <button
                  className={`${styles.signInBtn} ${styles.downloadBtnMobile}`}
                  onClick={() => setShowLogin(true)}
                >
                  Sign In
                </button>
              ) : (
                <>
                  <button
                    ref={profileBtnRef}
                    onClick={() => setShowProfileModal(true)}
                    className={`${styles.glass_button} ${styles.logggedInBtn} ${styles.downloadBtnMobile} ${styles.logggedInBtnSidebar}`}
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
              <button
                className={styles.hamBurger}
                onClick={() => setMenuOpen(false)}
              >
                <img src="/icons/XIcon.svg" alt="" />
              </button>
            </div>
          </div>
        </div>
        <div className={styles.menuContainer}>
          <div className={styles.menuItems}>
            <ul>
              <li>
                <Link href="/">Home</Link>
              </li>
              <li>
                <Link href="#">Destinations</Link>
              </li>
              <li>
                <Link href="#">Tailor-Made Journeys</Link>
              </li>
              <li>
                <Link href="#">About Us</Link>
              </li>
              <li>
                <Link href="#">Flight Booking</Link>
              </li>
              <li>
                <Link href="#">Blogs</Link>
              </li>
            </ul>
          </div>

          <div className={styles.menuBottom}>
            {!isLoggedIn && (
              <button
                onClick={() => router.push("./?openLogin=true")}
                className={styles.accountBtn}
              >
                ACCOUNT LOGIN
              </button>
            )}
          </div>
        </div>
      </div>
      <TravelInsurance setMenuOpen={setMenuOpen} />
      <Comprehensive />
      <Claim />
      <Questions />
      <FeatureSection />
      <Footer />
    </div>
  );
};

export default page;
