"use client";

import React, { useState } from "react";
import styles from "./BarcelonaSection.module.css";
import ExpCarousel from "../exploreCarousel/component/ExpCarousel";
import SaveToWishlistModal from "@/shared/components/wishlistModals/SaveToWishlistModal";
import CreateWishlistModal from "@/shared/components/wishlistModals/CreateWishlistModal";

const BarcelonaSection = ({ city = "", currentHotelId = "" }) => {
  const [activeTab, setActiveTab] = useState("All");
  const headingCity = city || "this area";
  const wishlistIds = currentHotelId ? [currentHotelId] : [];

  // 🔥 wishlist state
  const [wishlists, setWishlists] = useState([]);
  const [isCreateWishlistOpen, setIsCreateWishlistOpen] = useState(false);
  const [isSaveWishlistOpen, setIsSaveWishlistOpen] = useState(false);

  const handleWishlistClick = () => {
    if (!wishlists.length) {
      setIsCreateWishlistOpen(true);
    } else {
      setIsSaveWishlistOpen(true);
    }
  };

  return (
    <>
      <div className={styles.container}>
        <h2 className={styles.heading}>Similar Hotels in {headingCity}</h2>

        <div className={styles.expCarousel}>
          <ExpCarousel
            activeTab={activeTab}
            onWishlistClick={handleWishlistClick}
          />
        </div>
      </div>

      {/* ✅ MODALS */}
      <CreateWishlistModal
        isOpen={isCreateWishlistOpen}
        onClose={() => setIsCreateWishlistOpen(false)}
        onCreate={(name) => {
          setWishlists((prev) => [...prev, { id: Date.now(), name }]);
          setIsCreateWishlistOpen(false);
          setIsSaveWishlistOpen(true);
        }}
        type="hotel"
        ids={wishlistIds}
      />

      <SaveToWishlistModal
        isOpen={isSaveWishlistOpen}
        wishlists={wishlists}
        onClose={() => setIsSaveWishlistOpen(false)}
        onCreateNew={() => {
          setIsSaveWishlistOpen(false);
          setIsCreateWishlistOpen(true);
        }}
        type="hotel"
        ids={wishlistIds}
      />
    </>
  );
};

export default BarcelonaSection;
