"use client";
import React, { useState } from "react";
import styles from "./HotelDetailLayout.module.css";
import Navbar from "../flightBookingDetails/Navbar";
import Footer from "../home-page/components/footer/Footer";
import HeroSection from "./Components/heroSection/HeroSection";
import RoomSelectionCard from "./Components/roomSelectionCard/RoomSelectionCard";
import Tabs from "./Components/tabs/Tabs";

const Layout = ({ children }) => {
  const [activeTab, setActiveTab] = useState("Description");

  return (
    <div className={styles.layoutWrapper}>
      <div className={styles.navBar}>
        <Navbar />
      </div>
      <HeroSection />

      <Tabs
        tabs={[
          "Description",
          "Amenities",
          "Rooms",
          "Location",
          "Reviews",
          "HOTEL POLICY",
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* PAGE DECIDES WHAT GOES WHERE */}
      {children}

      <Footer />
    </div>
  );
};

export default Layout;
