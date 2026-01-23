"use client";
import { useRef, useState } from "react";
import Image from "next/image";

import styles from "./Navbar.module.css";
import ProfileModal from "@/app/home-page/components/homePage/modals/ProfileModal";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
const HELP_POPULAR_TOPICS = [
  "Cancel booking",
  "Refund status",
  "Change flight",
  "Update details",
];
const Navbar = () => {
  const [activeTopic, setActiveTopic] = useState("");
  const [showProfileModal, setShowProfileModal] = useState(false);
  const profileBtnRef = useRef(null);
  const {
    isLoggedIn,
    profile: userProfile,
    user,
    loading: authLoading,
  } = useAuth();
  const router = useRouter();
  return (
    <>
      {" "}
      <header className={styles.homeSection}>
        {/* HERO VIDEO */}
        <video
          className={styles.heroVideo}
          src="/videos/support.mp4"
          poster="/images/hero-poster.jpg"
          autoPlay
          muted
          loop
          playsInline
        />

        {/* DARK OVERLAY */}
        <div className={styles.overlay}></div>

        {/* GRADIENT OVERLAY */}
        <img className={styles.gradient} src="/images/gradient.png" alt="" />

        {/* NAVBAR */}
        <div className={styles.navContainer}>
          <div className={styles.navbar}>
            <img
              style={{ cursor: "pointer" }}
              onClick={() => router.push("/")}
              src="/Logo.svg"
              alt="Logo"
            />

            <div className={styles.navRight}>
              <button
                className={`${styles.glass_button} ${styles.downloadBtn}`}
              >
                Download the App
              </button>

              {!isLoggedIn ? (
                <button
                  className={`${styles.signInBtn} ${styles.downloadBtnMobile}`}
                  onClick={() => router.push("/?openLogin=true")}
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

              {/* <button className={styles.signInBtn}>Sign In</button> */}

              <button className={styles.hamBurger}>
                <img src="/icons/hamBurger.png" alt="menu" />
                menu
              </button>
            </div>
          </div>
        </div>

        {/* HERO CONTENT */}
        <div className={styles.homePageContainer}>
          <div className={styles.InspiredSection}>
            <h1>How Can We Help You?</h1>
            <p>
              Travel with confidence knowing we’ve got you covered—from medical
              emergencies to trip disruptions.
            </p>
            {/* SEARCH BAR */}
            <div className={styles.searchWrapper}>
              <div className={styles.searchBox}>
                <div className={styles.searchIcon}>
                  <Image
                    src="/icons/search-icon.svg"
                    alt="Search"
                    width={20}
                    height={20}
                  />
                </div>

                <input
                  type="text"
                  placeholder="Search for help topics, booking issues, payment questions..."
                  className={styles.searchInput}
                />
              </div>

              <button className={styles.searchBtn} aria-label="Search">
                <span className={styles.iconWrapper}>
                  <Image
                    src="/icons/search-icon.svg"
                    alt="Search"
                    width={24}
                    height={24}
                    className={styles.iconDefault}
                  />
                  <Image
                    src="/icons/search-icon-dark.svg"
                    alt=""
                    width={24}
                    height={24}
                    className={styles.iconHover}
                  />
                </span>
              </button>
            </div>
          </div>

          {/* POPULAR TOPICS */}
          <div className={styles.popularTopics}>
            <span className={styles.popularLabel}>POPULAR TOPICS:</span>

            <div className={styles.topicList}>
              {[
                "Cancel booking",
                "Refund status",
                "Change flight",
                "Update details",
              ].map((item) => (
                <button
                  key={item}
                  onClick={() => setActiveTopic(item)}
                  className={`${styles.topicItem} ${
                    activeTopic === item ? styles.active : ""
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>
      <div className={styles.mobile}>
        <section className={styles.helpSearchSection}>
          {/* Description */}
          <p className={styles.helpSearchDescription}>
            Travel with confidence knowing we’ve got you covered— from medical
            emergencies to trip disruptions.
          </p>

          {/* Search Bar */}
          <div className={styles.helpSearchInputWrapper}>
            <span className={styles.helpSearchIcon}>
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9.16667 15.8333C12.8486 15.8333 15.8333 12.8486 15.8333 9.16667C15.8333 5.48477 12.8486 2.5 9.16667 2.5C5.48477 2.5 2.5 5.48477 2.5 9.16667C2.5 12.8486 5.48477 15.8333 9.16667 15.8333Z"
                  stroke="#A8A8A8"
                  stroke-width="1.66667"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M17.5013 17.5L13.918 13.9166"
                  stroke="#A8A8A8"
                  stroke-width="1.66667"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </span>
            <input
              type="text"
              className={styles.helpSearchInput}
              placeholder="Search for help topics, booking issues, payment queries..."
            />
          </div>

          {/* Popular Topics */}
          <div className={styles.helpPopularTopicsSection}>
            <h4 className={styles.helpPopularTopicsTitle}>POPULAR TOPICS:</h4>

            <div className={styles.helpPopularTopicsList}>
              {HELP_POPULAR_TOPICS.map((topic) => (
                <button key={topic} className={styles.helpPopularTopicButton}>
                  {topic}
                </button>
              ))}
            </div>
          </div>
          <div className={styles.br} />
        </section>
      </div>
    </>
  );
};

export default Navbar;
