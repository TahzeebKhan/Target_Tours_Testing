"use client";
import React, { useState } from "react";
import styles from "./WishList.module.css";
import WishListsTabsItems from "./components/wishListsTabsItmes/WishListsTabsItems";

const WishList = () => {
  const [showTabs, setShowTabs] = useState(false);

  if (showTabs) {
    return <WishListsTabsItems />;
  }

  return (
    <>
      <section className={styles.container}>
        <div className={styles.contentWrapper}>
          <img
            className={styles.heartIcon}
            src="/images/wishlistheart.png"
            alt=""
          />
          <button className={styles.startBtn} onClick={() => setShowTabs(true)}>
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

          <button className={styles.startBtn} onClick={() => setShowTabs(true)}>
            start searching
          </button>
        </div>
      </section>
    </>
  );
};

export default WishList;
