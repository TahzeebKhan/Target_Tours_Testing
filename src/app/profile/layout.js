"use client";
import React, { useState } from "react";
import Navbar from "../hotel-detail/Navbar";
import SideBar from "./components/sideBar/SideBar";
import styles from "./Profile.module.css";
import { ProfileProvider } from "./context/ProfileContext";
import Cookies from "js-cookie";
import { useMediaQuery } from "../hooks/useMediaQuery";

const ProfileLayout = ({ children }) => {
  // const [sidebarOpen, setSidebarOpen] = useState(false);
  const hasToken = !!Cookies.get("auth_token");
  const [isLoggedIn, setIsLoggedIn] = useState(hasToken);

  const isTabletOrMobile = useMediaQuery("(max-width: 895px)");

  return (
    <>
      <ProfileProvider>
        {!isTabletOrMobile && (
          <div className={styles.profileLayout}>
            <Navbar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />

            <div className={styles.profileContainer}>
              <SideBar />
              <div className={styles.profileContent}>{children}</div>
            </div>
          </div>
        )}

        {isTabletOrMobile && (
          <>
            {" "}
            <div className={styles.mobileView}>
              <div className={styles.navDetailsMobile}>
                <span className={styles.backArrow}>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M18.6513 9.12663H3.10696L8.10144 4.13215C8.41172 3.82187 8.41172 3.32034 8.10144 3.01006C7.79096 2.69977 7.28944 2.69977 6.97915 3.01006L0.630009 9.35844C0.556866 9.43215 0.498961 9.52034 0.45858 9.61711C0.37839 9.81082 0.37839 10.0299 0.45858 10.2236C0.498961 10.3203 0.556866 10.4083 0.630009 10.4822L6.97915 16.8306C7.13382 16.9855 7.33706 17.0632 7.5403 17.0632C7.74334 17.0632 7.94658 16.9855 8.10144 16.8306C8.41172 16.5203 8.41172 16.0188 8.10144 15.7083L3.10696 10.7141H18.6513C19.0894 10.7141 19.4451 10.3584 19.4451 9.92034C19.4451 9.48225 19.0894 9.12663 18.6513 9.12663Z"
                      fill="#1E293B"
                    />
                  </svg>
                </span>

                <span>My Account</span>
              </div>

              <div className={styles.mobileContainer}>
                <SideBar />
                <div className={styles.profileContent}>{children}</div>
              </div>
              <footer className={styles.mobileFooter}>
                <div className={styles.footerContent}>
                  <div className={styles.footerTitleDiv}>
                    <p className={styles.footerTagline}>
                      LIFE, WELL-TRAVELLED SINCE 1993
                    </p>

                    <h2 className={styles.footerTitle}>
                      Why choose Target Tours?
                    </h2>
                  </div>

                  <ul className={styles.footerList}>
                    <li>
                      <h6>Unbeatable Deals</h6>
                      <p>
                        Score the best prices on flights, hotels, and holiday
                        packages — guaranteed.
                      </p>
                    </li>

                    <li>
                      <h6>Multiple Payment Methods</h6>
                      <p>
                        Flights, stays, cabs, visas — plan every part of your
                        journey in one place.
                      </p>
                    </li>

                    <li>
                      <h6>Trusted by Millions</h6>
                      <p>
                        Join a growing community of happy travelers across the
                        globe.
                      </p>
                    </li>

                    <li>
                      <h6>24 / 7 Support</h6>
                      <p>
                        Need help mid-trip? Our travel experts are always just a
                        call away.
                      </p>
                    </li>
                  </ul>
                </div>
              </footer>
            </div>
          </>
        )}
      </ProfileProvider>
    </>
  );
};

export default ProfileLayout;
