"use client";

import React, { useState } from "react";
import styles from "./BarcelonaSection.module.css";
import ExpCarousel from "../exploreCarousel/component/ExpCarousel";
import SaveToWishlistModal from "@/shared/components/wishlistModals/SaveToWishlistModal";
import CreateWishlistModal from "@/shared/components/wishlistModals/CreateWishlistModal";
import LoginPopup from "@/app/account/loginPopUp/LoginPopup";
import SignupPopup from "@/app/account/signUpPopUp/SignupPopup";

const BarcelonaSection = ({ city = "", currentHotelId = "" }) => {
  const [activeTab, setActiveTab] = useState("All");
  const headingCity = city || "this area";
  const wishlistIds = currentHotelId ? [currentHotelId] : [];

  // 🔥 wishlist state
  const [wishlists, setWishlists] = useState([]);
  const [isCreateWishlistOpen, setIsCreateWishlistOpen] = useState(false);
  const [isSaveWishlistOpen, setIsSaveWishlistOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authView, setAuthView] = useState("login");
  const [pendingFavoriteIndex, setPendingFavoriteIndex] = useState(null);
  const [savedFavoriteIndexes, setSavedFavoriteIndexes] = useState([]);

  const openAuthModal = () => {
    setAuthView("login");
    setShowAuthModal(true);
  };

  const closeAuthModal = () => {
    setShowAuthModal(false);
    setAuthView("login");
  };

  const handleWishlistClick = (favoriteIndex = null) => {
    setPendingFavoriteIndex(favoriteIndex);
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
            savedFavoriteIndexes={savedFavoriteIndexes}
          />
        </div>
      </div>

      {/* ✅ MODALS */}
      <CreateWishlistModal
        isOpen={isCreateWishlistOpen}
        onClose={() => setIsCreateWishlistOpen(false)}
        onCreate={(name) => {
          setWishlists((prev) => [...prev, { id: Date.now(), name }]);
          if (pendingFavoriteIndex !== null) {
            setSavedFavoriteIndexes((prev) =>
              prev.includes(pendingFavoriteIndex)
                ? prev
                : [...prev, pendingFavoriteIndex],
            );
          }
          setPendingFavoriteIndex(null);
          setIsCreateWishlistOpen(false);
          setIsSaveWishlistOpen(true);
        }}
        type="hotel"
        ids={wishlistIds}
        onAuthRequired={openAuthModal}
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
        onAuthRequired={openAuthModal}
      />

      {showAuthModal && authView === "login" && (
        <LoginPopup onClose={closeAuthModal} onNavigate={setAuthView} />
      )}

      {showAuthModal && authView === "signup" && (
        <SignupPopup onClose={closeAuthModal} onNavigate={setAuthView} />
      )}
    </>
  );
};

export default BarcelonaSection;
