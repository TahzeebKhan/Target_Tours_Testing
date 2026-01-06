import React from "react";
import styles from "./HotelDetailLayout.module.css";
import DescriptionComponent from "./Components/descriptionComponent/DescriptionComponent";
import Amenities from "./Components/amenities/Amenities";
import AvailabilityComponent from "./Components/availabilityComponent/AvailabilityComponent";
import HotelPolicies from "./Components/hotelPolicies/HotelPolicies";
import RoomSelectionCard from "./Components/roomSelectionCard/RoomSelectionCard";
import CustomerReviews from "./Components/customerReviews/CustomerReviews";
import BarcelonaSection from "./Components/BarcelonaSection/BarcelonaSection";
import ExpCarousel from "../exploreCarousel/component/ExpCarousel";

const Page = () => {
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
          <RoomSelectionCard />
        </div>
      </main>

      {/* SECTION 2: OUTSIDE contentWrapper */}
      <section className={styles.policySection}>
        <HotelPolicies />
      </section>
      
      <CustomerReviews/>
       <BarcelonaSection/>
     
    </>
  );
};

export default Page;
