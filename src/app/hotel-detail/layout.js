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

const Layout = ({ children }) => {
  const [activeTab, setActiveTab] = useState("Description");

  return (
    <>
    <div className={styles.navBar}>
          <div className={styles.navBarContainer}>
            <Navbar />
          </div>
        </div>
      <div className={styles.layoutWrapper}>
        
        <div className={styles.pageSection}>
          <HeroSection />
          {/* PAGE DECIDES WHAT GOES WHERE */}
          {children}
        </div>
        <FeatureSection/>

        <Footer />
      </div>
      <div className={styles.mobileView}>
        <HotelDetaislMobileView/>
        
      </div>
    </>

  );
};

export default Layout;
