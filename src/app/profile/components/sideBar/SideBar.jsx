"use client";
import React, { useActionState, useEffect, useState } from "react";
import styles from "./SideBar.module.css";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { useProfile } from "../../context/ProfileContext";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Cookies from "js-cookie";
import { formatRoleUnderscoreToSpaceSeparated } from "@/app/utils/formatters";
import { getParsedCookie } from "@/app/utils/getParsedCookie";

const ChevronIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M7.5 15L12.5 10L7.5 5"
      stroke="#000033"
      stroke-width="1.66667"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
);

const SideBar = () => {
  const { activeMenu, setActiveMenu, profilePhoto } = useProfile();
  const { logout, profile } = useAuth();
  // console.log("profile", profile);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);
  const user = getParsedCookie("user");

  // console.log(user);

  const router = useRouter();
  const [openTrips, setOpenTrips] = useState(false);
  const [activeTrip, setActiveTrip] = useState("All");
  useEffect(() => {
    if (activeMenu !== "trip" && openTrips) setOpenTrips(false);
  }, [setActiveMenu, activeMenu]);
  const isMobileOrTablet =
    typeof window !== "undefined" && window.innerWidth <= 895;

  return (
    <>
      {" "}
      {!isMobileOrTablet ? (
        <div className={styles.sideBarContianer}>
          <div className={styles.sideBarTop}>
            <div className={styles.sideBarProfileDetails}>
              <div className={styles.avatar}>
                <Image
                  src={profilePhoto}
                  alt="User Avatar"
                  width={56}
                  height={56}
                  onError={(e) => {
                    e.currentTarget.src = "/images/profile1.jpg";
                  }}
                />
              </div>

              <div className={styles.sideBarProfileDetailsText}>
                <h3>{profile?.full_name || ""}</h3>
                <p>{formatRoleUnderscoreToSpaceSeparated(user?.role)}</p>
              </div>
            </div>
            <div className={styles.br}></div>
            <ul className={styles.menu}>
              <li
                className={`${styles.item} ${
                  activeMenu === "Personal Information" ? styles.active : ""
                }`}
                onClick={() => setActiveMenu("Personal Information")}
              >
                Personal Information
              </li>

              <li
                className={`${styles.item} ${
                  activeMenu === "paymentAccount" ? styles.active : ""
                }`}
                onClick={() => setActiveMenu("paymentAccount")}
              >
                Payment Account
              </li>

              <li
                className={`${styles.item} ${
                  activeMenu === "trip" ? styles.active : ""
                } ${styles.trip}`}
                onClick={() => {
                  setOpenTrips(!openTrips);
                  setActiveMenu("trip");
                }}
              >
                <span>Trips</span>
                <ChevronDown size={16} />
              </li>
              <AnimatePresence>
                {openTrips && (
                  <motion.ul
                    initial={{ height: 0, opacity: 0, overflow: "hidden" }}
                    animate={{
                      height: "auto",
                      opacity: 1,
                      transitionEnd: { overflow: "visible" },
                    }}
                    exit={{ height: 0, opacity: 0, overflow: "auto" }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className={styles.subMenu}
                  >
                    {["All", "Active", "Completed", "Canceled"].map((item) => (
                      <li
                        key={item}
                        className={`${styles.subItem} ${
                          activeTrip === item ? styles.subActive : ""
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveTrip(item);
                          setActiveMenu("trip");
                        }}
                      >
                        {activeTrip === item && (
                          <motion.div
                            layoutId="activeTripIndicator"
                            className={styles.activeIndicator}
                            transition={{
                              type: "spring",
                              stiffness: 300,
                              damping: 30,
                            }}
                          />
                        )}
                        {item}
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>

              <li
                className={`${styles.item} ${
                  activeMenu === "wishList" ? styles.active : ""
                }`}
                onClick={() => setActiveMenu("wishList")}
              >
                WishLists
              </li>
              <li
                className={`${styles.item} ${
                  activeMenu === "support" ? styles.active : ""
                }`}
                onClick={() => setActiveMenu("support")}
              >
                Support
              </li>
              <li
                className={`${styles.item} ${
                  activeMenu === "myReviews" ? styles.active : ""
                }`}
                onClick={() => setActiveMenu("myReviews")}
              >
                My Reviews
              </li>
            </ul>
            <div className={styles.br}></div>
            <div
              className={`${styles.item} ${
                activeMenu === "settings" ? styles.active : ""
              }`}
              onClick={() => setActiveMenu("settings")}
            >
              Settings
            </div>
          </div>
          <div className={styles.sideBarBottom}>
            <div
              onClick={() => {
                logout();
                router.replace("/");
              }}
              className={`${styles.logout} ${styles.item}`}
            >
              Logout
            </div>
          </div>
        </div>
      ) : (
        <div className={styles.sideBarContianer}>
          <div className={styles.sideBarTop}>
            <div className={styles.sideBarProfileDetails}>
              <div className={styles.avatar}>
                <Image
                  src={profilePhoto}
                  alt="User Avatar"
                  width={60}
                  height={60}
                  onError={(e) => {
                    e.currentTarget.src = "/images/profile1.jpg";
                  }}
                />
              </div>
              <div className={styles.cameraIconContaier}>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M8.16622 2.33337C8.37668 2.33337 8.58323 2.3903 8.76397 2.49813C8.94471 2.60596 9.09292 2.76067 9.19289 2.94587L9.47639 3.47087C9.57636 3.65608 9.72456 3.81079 9.9053 3.91862C10.086 4.02645 10.2926 4.08338 10.5031 4.08337H11.668C11.9774 4.08337 12.2741 4.20629 12.4929 4.42508C12.7117 4.64388 12.8346 4.94062 12.8346 5.25004V10.5C12.8346 10.8095 12.7117 11.1062 12.4929 11.325C12.2741 11.5438 11.9774 11.6667 11.668 11.6667H2.33464C2.02522 11.6667 1.72847 11.5438 1.50968 11.325C1.29089 11.1062 1.16797 10.8095 1.16797 10.5V5.25004C1.16797 4.94062 1.29089 4.64388 1.50968 4.42508C1.72847 4.20629 2.02522 4.08337 2.33464 4.08337H3.49955C3.7098 4.08339 3.91614 4.02658 4.09676 3.91897C4.27738 3.81136 4.42556 3.65694 4.52564 3.47204L4.81089 2.94471C4.91096 2.75981 5.05914 2.60539 5.23976 2.49778C5.42038 2.39017 5.62672 2.33336 5.83697 2.33337H8.16622Z"
                    stroke="#000033"
                    stroke-width="1.16667"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M7 9.33337C7.9665 9.33337 8.75 8.54987 8.75 7.58337C8.75 6.61688 7.9665 5.83337 7 5.83337C6.0335 5.83337 5.25 6.61688 5.25 7.58337C5.25 8.54987 6.0335 9.33337 7 9.33337Z"
                    stroke="#000033"
                    stroke-width="1.16667"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </div>

              <div className={styles.sideBarProfileDetailsText}>
                <h3>{profile?.full_name || ""}</h3>
                <p>{formatRoleUnderscoreToSpaceSeparated(user?.role)}</p>
              </div>
            </div>
            <ul className={styles.menu}>
              <li
                className={`${styles.item} ${
                  activeMenu === "Personal Information" ? styles.active : ""
                }`}
                onClick={() => setActiveMenu("Personal Information")}
              >
                Personal Information <ChevronIcon />
              </li>

              <div className={styles.br}></div>
              <li
                className={`${styles.item} ${
                  activeMenu === "paymentAccount" ? styles.active : ""
                }`}
                onClick={() => setActiveMenu("paymentAccount")}
              >
                Payment Account <ChevronIcon />
              </li>

              <div className={styles.br}></div>
              <li
                className={`${styles.item} ${
                  activeMenu === "trip" ? styles.active : ""
                } ${styles.trip}`}
                onClick={() => {
                  setOpenTrips(!openTrips);
                  setActiveMenu("trip");
                }}
              >
                <span>My Trips</span>
                <ChevronIcon />
              </li>
              <AnimatePresence>
                {openTrips && (
                  <motion.ul
                    initial={{ height: 0, opacity: 0, overflow: "hidden" }}
                    animate={{
                      height: "auto",
                      opacity: 1,
                      transitionEnd: { overflow: "visible" },
                    }}
                    exit={{ height: 0, opacity: 0, overflow: "auto" }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className={styles.subMenu}
                  >
                    {["All", "Active", "Completed", "Canceled"].map((item) => (
                      <li
                        key={item}
                        className={`${styles.subItem} ${
                          activeTrip === item ? styles.subActive : ""
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveTrip(item);
                          setActiveMenu("trip");
                        }}
                      >
                        {activeTrip === item && (
                          <motion.div
                            layoutId="activeTripIndicator"
                            className={styles.activeIndicator}
                            transition={{
                              type: "spring",
                              stiffness: 300,
                              damping: 30,
                            }}
                          />
                        )}
                        {item}
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>

              <div className={styles.br}></div>
              <li
                className={`${styles.item} ${
                  activeMenu === "wishList" ? styles.active : ""
                }`}
                onClick={() => setActiveMenu("wishList")}
              >
                WishLists <ChevronIcon />
              </li>

              <div className={styles.br}></div>
              <li
                className={`${styles.item} ${
                  activeMenu === "support" ? styles.active : ""
                }`}
                onClick={() => setActiveMenu("support")}
              >
                Support <ChevronIcon />
              </li>

              <div className={styles.br}></div>
              <li
                className={`${styles.item} ${
                  activeMenu === "myReviews" ? styles.active : ""
                }`}
                onClick={() => setActiveMenu("myReviews")}
              >
                My Reviews<ChevronIcon />
              </li>
              <div className={styles.br}></div>
              <li
                className={`${styles.item} ${
                  activeMenu === "settings" ? styles.active : ""
                }`}
                onClick={() => setActiveMenu("settings")}
              >
                Settings<ChevronIcon />
              </li>
              <div className={styles.br}></div>
              <li
                onClick={() => {
                  logout();
                  router.replace("/");
                }}
                className={`${styles.logout} ${styles.item}`}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 12.75L15.75 9L12 5.25"
                    stroke="#EF4444"
                    stroke-width="1.35"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M15.75 9H6.75"
                    stroke="#EF4444"
                    stroke-width="1.35"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M6.75 15.75H3.75C3.35218 15.75 2.97064 15.592 2.68934 15.3107C2.40804 15.0294 2.25 14.6478 2.25 14.25V3.75C2.25 3.35218 2.40804 2.97064 2.68934 2.68934C2.97064 2.40804 3.35218 2.25 3.75 2.25H6.75"
                    stroke="#EF4444"
                    stroke-width="1.35"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
                Logout
              </li>
            </ul>
          </div>
          {/* <div className={styles.sideBarBottom}>
            
          </div> */}
        </div>
      )}
    </>
  );
};

export default SideBar;
