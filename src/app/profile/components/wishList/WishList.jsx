"use client";
import React, { useState } from "react";
import styles from "./WishList.module.css";
import WishListsTabsItems from "./components/wishListsTabsItmes/WishListsTabsItems";
import { useProfile } from "../../context/ProfileContext";
// import MyNextTrip from "./components/myNextTrip/MyNextTrip";
import TourListing from "./components/tourListing/TourListing";
import { useRouter } from "next/navigation";
import MyNextTrip from "./components/myNextTrip/MyNextTrip";

import axios from "axios";
import Cookies from "js-cookie";

export const fetchWishlists = async (type = "all") => {
  const token = Cookies.get("auth_token");

  if (!token) throw new Error("Not authenticated");

  const res = await axios.get(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user-wishlist/${type}?limit=10&page=1`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return res.data?.data || {};
};

const WishList = () => {
  const router = useRouter("/");
  const [showTabs, setShowTabs] = useState(false);
  const isEmpty = false;

  const { activeMenu, setActiveMenu } = useProfile();

  if (activeMenu === "myNextTrip") return <MyNextTrip />;

  return (
    <>
      {!isEmpty ? (
        <WishListsTabsItems />
      ) : (
        <>
          {" "}
          <section className={styles.container}>
            <div className={styles.contentWrapper}>
              <img
                className={styles.heartIcon}
                src="/images/wishlistheart.png"
                alt=""
              />
              <button
                className={styles.startBtn}
                onClick={() => router.push("/")}
              >
                start searching
              </button>
              <div className={styles.textWrapper}>
                <h2>You haven’t added any items to your wish list yet.</h2>
                <p>Start exploring and add your favorite destinations here!</p>
              </div>
            </div>
          </section>
          <section className={`${styles.container} ${styles.containerMobile}`}>
            <div className={styles.contentWrapper}>
              <img
                className={styles.heartIcon}
                src="/images/wishlistheart.png"
                alt=""
              />

              <div className={styles.textWrapper}>
                <h2>You haven’t added any items to your wish list yet.</h2>
                <p>Start exploring and add your favorite destinations here!</p>
              </div>

              <button
                className={styles.startBtn}
                onClick={() => setShowTabs(true)}
              >
                start searching
              </button>
            </div>
          </section>
        </>
      )}
    </>
  );
};

export default WishList;
