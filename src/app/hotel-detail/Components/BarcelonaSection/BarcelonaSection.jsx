"use client";

import React, { useState } from "react";
import styles from "./BarcelonaSection.module.css";
import ExpCarousel from "../exploreCarousel/component/ExpCarousel";


const BarcelonaSection = () => {
  const [activeTab, setActiveTab] = useState("All");

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Similar Hotels in Barcelona</h2>

      <div className={styles.expCarousel}>
        <ExpCarousel activeTab={activeTab} />
      </div>
    </div>
  );
};

export default BarcelonaSection;
