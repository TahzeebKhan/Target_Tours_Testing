"use client";
import React, { useCallback, useState } from "react";
import styles from "./HotelDetailLayout.module.css";
import Footer from "../home-page/components/footer/Footer";
import HeroSection from "./Components/heroSection/HeroSection";
import Navbar from "./Navbar";
import HotelDetaislMobileView from "./Components/hotelDetailsMobileView/HotelDetaislMobileView";
import FeatureSection from "../home-page/components/featureSection/FeatureSection";
import CreateWishlistModal from "@/shared/components/wishlistModals/CreateWishlistModal";
import SaveToWishlistModal from "@/shared/components/wishlistModals/SaveToWishlistModal";
import { HotelDetailDataProvider } from "./HotelDetailDataContext";
import LoginPopup from "@/app/account/loginPopUp/LoginPopup";
import SignupPopup from "@/app/account/signUpPopUp/SignupPopup";

const Layout = ({ children }) => {
  const [liked, setLiked] = useState(false);

  const [wishlists, setWishlists] = useState([]);
  const [isCreateWishlistOpen, setIsCreateWishlistOpen] = useState(false);
  const [isSaveWishlistOpen, setIsSaveWishlistOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authView, setAuthView] = useState("login");

  const openLoginModal = useCallback(() => {
    setAuthView("login");
    setShowAuthModal(true);
  }, []);

  const closeAuthModal = () => {
    setShowAuthModal(false);
    setAuthView("login");
  };

  const handleWishlistClick = () => {
    if (!wishlists.length) {
      setIsCreateWishlistOpen(true);
    } else {
      setIsSaveWishlistOpen(true);
    }
  };
  return (
    <HotelDetailDataProvider onUnauthorized={openLoginModal}>
      <div className={styles.navBar}>
        <div className={styles.navBarContainer}>
          <Navbar />
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
      {showAuthModal && authView === "login" && (
        <LoginPopup onClose={closeAuthModal} onNavigate={setAuthView} />
      )}

      {showAuthModal && authView === "signup" && (
        <SignupPopup onClose={closeAuthModal} onNavigate={setAuthView} />
      )}
    </HotelDetailDataProvider>
  );
};

export default Layout;
