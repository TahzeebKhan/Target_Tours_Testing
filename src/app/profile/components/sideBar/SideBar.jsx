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
  return (
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
  );
};

export default SideBar;
