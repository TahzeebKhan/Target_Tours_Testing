"use client";
import React, { useState } from "react";
import styles from "./HotelDetailLayout.module.css";
import Footer from "../home-page/components/footer/Footer";
import HeroSection from "./Components/heroSection/HeroSection";
import RoomSelectionCard from "./Components/roomSelectionCard/RoomSelectionCard";
import Tabs from "./Components/tabs/Tabs";
import Navbar from "./Navbar";
import HotelDetaislMobileView from "./Components/hotelDetailsMobileView/HotelDetaislMobileView";
import FeatureSection from "../home-page/components/featureSection/FeatureSection";
import CreateWishlistModal from "@/shared/components/wishlistModals/CreateWishlistModal";
import SaveToWishlistModal from "@/shared/components/wishlistModals/SaveToWishlistModal";
import Cookies from "js-cookie";

const Layout = ({ children }) => {
  const [activeTab, setActiveTab] = useState("Description");
  const [liked, setLiked] = useState(false);
  const hasToken = !!Cookies.get("auth_token");
  const [isLoggedIn, setIsLoggedIn] = useState(hasToken);

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
      <div className={styles.navBar}>
        <div className={styles.navBarContainer}>
          <Navbar isLoggedIn={isLoggedIn} />
        </div>
      </div>
      <div className={styles.layoutWrapper}>
        <div className={styles.pageSection}>
          <HeroSection
            liked={liked}
            onLike={() => {
              setLiked(!liked);
              handleWishlistClick();
            }}
          />
          {/* PAGE DECIDES WHAT GOES WHERE */}
          {children}
        </div>
        <FeatureSection />

        <Footer />
      </div>
      {/* 🔥 WISHLIST MODALS */}
      <CreateWishlistModal
        isOpen={isCreateWishlistOpen}
        onClose={() => setIsCreateWishlistOpen(false)}
        onCreate={(name) => {
          setWishlists((prev) => [...prev, { id: Date.now(), name }]);
          setIsCreateWishlistOpen(false);
          setIsSaveWishlistOpen(true);
        }}
        type="hotel"
        ids={[]}
      />

      <SaveToWishlistModal
        isOpen={isSaveWishlistOpen}
        wishlists={wishlists}
        onClose={() => setIsSaveWishlistOpen(false)}
        onCreateNew={() => {
          setIsSaveWishlistOpen(false);
          setIsCreateWishlistOpen(true);
        }}
      />
      <div className={styles.mobileView}>
        <HotelDetaislMobileView />
      </div>
    </>
  );
};

export default Layout;
