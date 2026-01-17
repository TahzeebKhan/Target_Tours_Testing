"use client";
import React, { useState } from "react";
import styles from "./FlightBookingDetailsLayout.module.css";
import BookingStepper from "./components/BookingStepper";
import SidebarPriceSummaryCard from "./SidebarPriceSummaryCard";
import { FlightBookingProvider } from "./FlightBookingContext";
import TripSummaryHeader from "../profile_components/TripSummaryHeader";
import SelectPlan from "../profile_components/SelectPlan";
import Stepper from "./components/mobileStepper/Stepper";
import AddTravellerDetails from "../profile_components/AddTravellerDetails";
import TravellerDetails from "../profile_components/TravellerDetails";
import AddDetails from "../profile_components/AddDetails";
import Navbar from "../flight-booking-details/Navbar";

export default function FlightBookingDetailsLayout({ children }) {

  const [openAddDetails, setOpenAddDetails] = useState(false);
  const [currentStep, setCurrentStep] = useState(2);
  const STEPS = [
    "TRIP INFO",
    "CHOOSE PLAN",
    "PERSONAL DETAILS",
    "REVIEW & PAY",
  ];
  return (
    <FlightBookingProvider>
      <div className={styles.layoutWrapper}>
        <Navbar />
        <BookingStepper />

        <main className={styles.mainContent}>
          <div className={styles.container}>{children}</div>
          <aside className={styles.sidebar}>
            <div className={styles.sidebarSticky}>
              <SidebarPriceSummaryCard />
            </div>
          </aside>
        </main>
      </div>
      <div className={styles.mobileView}>
        <TripSummaryHeader onEditClick={() => setOpenAddDetails(true)} />
        <Stepper steps={STEPS} currentStep={currentStep} />
        {currentStep === 2 && <SelectPlan setCurrentStep={setCurrentStep} />}
        {currentStep === 3 && <AddTravellerDetails setCurrentStep={setCurrentStep} />}
        {currentStep === 4 && <TravellerDetails />}

      </div>

      {openAddDetails && (
        <AddDetails onClose={() => setOpenAddDetails(false)} />
      )}

    </FlightBookingProvider>
  );
}
