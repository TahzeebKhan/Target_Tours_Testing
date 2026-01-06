"use client";
import React, { useState } from "react";
import styles from "./HotelDetailLayout.module.css";
import DescriptionComponent from "./Components/descriptionComponent/DescriptionComponent";
import Amenities from "./Components/amenities/Amenities";
import AvailabilityComponent from "./Components/availabilityComponent/AvailabilityComponent";
import HotelPolicies from "./Components/hotelPolicies/HotelPolicies";
import RoomSelectionCard from "./Components/roomSelectionCard/RoomSelectionCard";
import CustomerReviews from "./Components/customerReviews/CustomerReviews";
import BarcelonaSection from "./Components/BarcelonaSection/BarcelonaSection";
import ExpCarousel from "../exploreCarousel/component/ExpCarousel";
import BookingSummary from "./Components/bookingSummary/BookingSummary";

const Page = () => {
  const [showSummary, setShowSummary] = useState(false);
  const onBookNow = () => {
    setShowSummary(true);
  }
  return (
    <>
      {/* SECTION 1: contentWrapper */}
      <main className={styles.contentWrapper}>
        <div className={styles.leftContent}>
          <DescriptionComponent />
          <Amenities />
          <AvailabilityComponent />
        </div>

        <div className={styles.rightSidebar}>
          <div
            className={`${styles.roomWrapper} ${showSummary ? styles.hide : ""
              }`}
          >
            <RoomSelectionCard onBookNow={() => setShowSummary(true)} />
          </div>

          {/* Booking Summary */}
          <div
            className={`${styles.summaryWrapper} ${showSummary ? styles.show : ""
              }`}
          >
            <BookingSummary />
          </div>
        </div>
      </main>

      {/* SECTION 2: OUTSIDE contentWrapper */}
      <section className={styles.policySection}>
        <HotelPolicies />
      </section>

      <CustomerReviews />
      <BarcelonaSection />

    </>
  );
};

export default Page;
