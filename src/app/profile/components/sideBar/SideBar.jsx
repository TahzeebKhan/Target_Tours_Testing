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

  const user = getParsedCookie("user");

  // console.log(user);

  const router = useRouter();
  const [openTrips, setOpenTrips] = useState(false);
  const [activeTrip, setActiveTrip] = useState("All");
  useEffect(() => {
    if (activeMenu !== "trip" && openTrips) setOpenTrips(false);
  }, [setActiveMenu, activeMenu]);
  const [isMobileOrTablet, setIsMobileOrTablet] = useState(false);

  useEffect(() => {
    const check = () => {
      setIsMobileOrTablet(window.innerWidth <= 895);
    };

    check(); // initial
    window.addEventListener("resize", check);

    return () => window.removeEventListener("resize", check);
  }, []);
  useEffect(() => {
    if (isMobileOrTablet) {
      setActiveMenu(""); // no default active on mobile
    }
  }, [isMobileOrTablet]);

  useEffect(() => {
    setIsMounted(true);

    if (isMobileOrTablet) setActiveMenu("");
  }, []);
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
                <p>{formatRoleUnderscoreToSpaceSeparated(user && user?.role)}</p>
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

              <div className={styles.sideBarProfileDetailsText}>
                <h3>{profile?.full_name || ""}</h3>
                <p>{user && user?.email}</p>
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
                <span
                  className={`${styles.ChevronDownIcon} ${openTrips ? styles.activeChevron : ""}`}
                >
                  <ChevronIcon />
                </span>
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
                My Reviews
                <ChevronIcon />
              </li>
              <div className={styles.br}></div>
              <li
                className={`${styles.item} ${
                  activeMenu === "settings" ? styles.active : ""
                }`}
                onClick={() => setActiveMenu("settings")}
              >
                Settings
                <ChevronIcon />
              </li>
              <div className={styles.br}></div>
              <li
                onClick={() => {
                  logout();
                  router.replace("/");
                }}
                className={` ${styles.item}`}
              >
                <div className={`${styles.logout}`}>
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
                </div>
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
