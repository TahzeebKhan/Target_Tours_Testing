"use client";
import React, { useActionState, useEffect, useState } from "react";
import styles from "./SideBar.module.css";
import { ChevronDown, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { useProfile } from "../../context/ProfileContext";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Cookies from "js-cookie";
import { formatRoleUnderscoreToSpaceSeparated } from "@/app/utils/formatters";
import { getParsedCookie } from "@/app/utils/getParsedCookie";
import LogoutConfirmModal from "./LogoutConfirmModal";

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
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const { logout, profile } = useAuth();
  // console.log("profile", profile);
  const [isMounted, setIsMounted] = useState(false);

  const user = getParsedCookie("user");
  const profileName =
    profile?.full_name ||
    profile?.display_name ||
    profile?.name ||
    user?.full_name ||
    user?.display_name ||
    user?.name ||
    user?.email?.split("@")[0] ||
    "";

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

  const handleLogoutClick = () => {
    if (!isMobileOrTablet) {
      logout();
      router.replace("/");
    } else {
      setShowLogoutModal(true);
    }
  };

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
                    e.currentTarget.src = "/images/profilePlaceholder.avif";
                  }}
                />
              </div>

              <div className={styles.sideBarProfileDetailsText}>
                <h3>{profileName}</h3>
                <p>
                  {formatRoleUnderscoreToSpaceSeparated(user && user?.role)}
                </p>
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
                <span>Orders And Bookings</span>
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
                  activeMenu === "wishList" || activeMenu === "myNextTrip"
                    ? styles.active
                    : ""
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
              onClick={handleLogoutClick}
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
                    e.currentTarget.src = "/images/profilePlaceholder.avif";
                  }}
                />
              </div>

              <div className={styles.sideBarProfileDetailsText}>
                <h3>{profileName}</h3>
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
                <span>Orders And Bookings</span>
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
              <li onClick={handleLogoutClick} className={` ${styles.item}`}>
                <div className={`${styles.logout}`}>
                  <LogOut size={18} />
                  Log out
                </div>
              </li>
            </ul>
          </div>
          {/* <div className={styles.sideBarBottom}>
            
          </div> */}
        </div>
      )}
      {showLogoutModal && (
        <LogoutConfirmModal
          onClose={() => setShowLogoutModal(false)}
          onConfirm={() => {
            logout();
            router.replace("/");
          }}
        />
      )}
    </>
  );
};

export default SideBar;
