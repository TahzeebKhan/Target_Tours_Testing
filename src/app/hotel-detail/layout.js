"use client";
import React, { useState } from "react";
import styles from "./HotelDetailLayout.module.css";
import Footer from "../home-page/components/footer/Footer";
import HeroSection from "./Components/heroSection/HeroSection";
import RoomSelectionCard from "./Components/roomSelectionCard/RoomSelectionCard";
import Tabs from "./Components/tabs/Tabs";
import Navbar from "./Navbar";

const Layout = ({ children }) => {
  const [activeTab, setActiveTab] = useState("Description");

  return (
    <div className={styles.layoutWrapper}>
      <div className={styles.navBar}>
        <Navbar />
      </div>
      <div className={styles.pageSection}>
        <HeroSection />
        {/* PAGE DECIDES WHAT GOES WHERE */}
        {children}
      </div>

      <Footer />
    </div>
  );
};

export default Layout;
