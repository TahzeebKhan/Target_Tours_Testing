"use client";
import React from "react";
import styles from "./FlightBookingDetailsLayout.module.css";
import Navbar from "./Navbar";
import BookingStepper from "./components/BookingStepper";
import SidebarPriceSummaryCard from "./SidebarPriceSummaryCard";
import {
  FlightBookingProvider,
  useFlightBooking,
} from "./FlightBookingContext";
import PassengerDetailsMobile from "./mobileViewComponents/passengerDetailsMobileView/PassengerDetailsMobile";
import CorporateSidebarSummary from "./CorporateSidebarSummary";

export default function FlightBookingDetailsLayout({ children }) {
  const isCorporate = false;
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
              {isCorporate && <CorporateSidebarSummary />}
            </div>
          </aside>
        </main>
      </div>
      <div className={styles.mobileView}>
        <div className={styles.container}>{children}</div>
      </div>
    </FlightBookingProvider>
  );
}
