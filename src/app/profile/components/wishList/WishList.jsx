"use client";
import React, { useState } from "react";
import styles from "./WishList.module.css";
import WishListsTabsItems from "./components/wishListsTabsItmes/WishListsTabsItems";
import { useProfile } from "../../context/ProfileContext";
// import MyNextTrip from "./components/myNextTrip/MyNextTrip";
import TourListing from "./components/tourListing/TourListing";

const WishList = () => {
  const [showTabs, setShowTabs] = useState(false);

  const { activeMenu, setActiveMenu } = useProfile();
  if (showTabs && activeMenu === "wishList") {
    return <WishListsTabsItems />;
  }

  return (
    <>
      {activeMenu === "myNextTrip" ? (
        <TourListing />
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
                onClick={() => setShowTabs(true)}
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
