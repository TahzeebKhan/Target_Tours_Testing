import React from "react";
import styles from "./FlightBookingDetailsLayout.module.css";

import BookingStepper from "./components/BookingStepper";
import SidebarPriceSummaryCard from "./SidebarPriceSummaryCard";
import { FlightBookingProvider } from "./FlightBookingContext";
import Navbar from "../flight-booking-details/Navbar";

export default function FlightBookingDetailsLayout({ children }) {
  return (
    <FlightBookingProvider>
      <div className={styles.layoutWrapper}>
        <div className={styles.navbar}>
          <Navbar />
        </div>
        <div className={styles.bookingStepper}>
          <BookingStepper />
        </div>

        <main className={styles.mainContent}>
          <div className={styles.container}>{children}</div>
          <aside className={styles.sidebar}>
            <div className={styles.sidebarSticky}>
              <SidebarPriceSummaryCard />
            </div>
          </aside>
        </main>
      </div>
    </FlightBookingProvider>
  );
}
