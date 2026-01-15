"use client";
import React, { useRef, useState } from "react";
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
import Tabs from "./Components/tabs/Tabs";

const Page = () => {
  const [activeTab, setActiveTab] = useState("Description");
  const [showSummary, setShowSummary] = useState(false);
  const onBookNow = () => {
    setShowSummary(true);
  }

  const sectionRefs = {
    Description: useRef(null),
    Amenities: useRef(null),
    Rooms: useRef(null),
    Reviews: useRef(null),
    "HOTEL POLICY": useRef(null),
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);

    sectionRefs[tab]?.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };
  return (
    <>
      {/* <Tabs
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
      /> */}
      <Tabs
        tabs={Object.keys(sectionRefs)}
        activeTab={activeTab}
        onChange={handleTabChange}
      />
      {/* SECTION 1: contentWrapper */}
      <main className={styles.contentWrapper}>
        <div className={styles.leftContent}>
          <section ref={sectionRefs.Description}>
            <DescriptionComponent />
          </section>
          <section ref={sectionRefs.Amenities}>
            <Amenities />
          </section>
          <section ref={sectionRefs.Rooms}>
            <AvailabilityComponent />
          </section>
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
      <section className={styles.policySection} ref={sectionRefs["HOTEL POLICY"]}>
        <HotelPolicies />
      </section>

      <section className={styles.Reviews} ref={sectionRefs.Reviews}>
        <CustomerReviews />
      </section>
      <BarcelonaSection />

    </>
  );
};

export default Page;
