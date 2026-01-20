"use client";
import React, { useState } from "react";
import styles from "./WishListsTabsItems.module.css";
import ExpandableTabs from "../../../expandableTabs/ExpandableTabs";
import TripsGallery from "../tripsGallery/TripsGallery";
import CreateWishlistModal from "./CreateWishlistModal";

const WishListsTabsItems = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const tabs = [
    { key: "all", label: "ALL" },
    { key: "hotel", label: "Hotel" },
    { key: "packages", label: "Packages" },
    { key: "travelinsurance", label: "travel insurance" },
  ];
  return (
    <>
      <div className={styles.container}>
        <div className={styles.contentWrapper}>
          <div className={styles.wishlistHead}>
            <div className={styles.wishlistHeadLeft}>
              <h3>Wish Lists</h3>
              <p>Explore and save your favorite destinations here.</p>
            </div>
            <div className={styles.wishlistHeadRight}>+Create a list</div>
          </div>
          <div className={styles.br}></div>
          <ExpandableTabs
            tabs={tabs}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            styles={styles}
          />

          {activeTab === "hotel" && (
            <div className={styles.flightInfoContainer}>
              <TripsGallery />
            </div>
          )}
        </div>
      </div>
      <div className={`${styles.container} ${styles.containerMobile}`}>
        <div className={styles.contentWrapper}>
          <div className={styles.wishlistHead}>
            <div className={styles.wishlistHeadLeft}>
              <h3>Wish Lists</h3>
              <p>Explore and save your favorite destinations here.</p>
            </div>
            <div className={styles.wishlistHeadRight}>
              <span className={styles.destopCreateBtn}>+ Create a list</span>
              <span
                onClick={() => setIsCreateModalOpen(true)}
                className={styles.mobileCreateBtn}
              >
                + Create New
              </span>
            </div>
          </div>
          <div className={styles.br}></div>
          <div className={styles.stickyWrapper}>
            <ExpandableTabs
              tabs={tabs}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              styles={styles}
            />
          </div>
          {activeTab === "hotel" && (
            <div className={styles.flightInfoContainer}>
              <TripsGallery />
            </div>
          )}{" "}
          {isCreateModalOpen && (
            <CreateWishlistModal onClose={() => setIsCreateModalOpen(false)} />
          )}
        </div>
      </div>
    </>
  );
};

export default WishListsTabsItems;
