import React from "react";
import styles from "./FlightBookingDetailsLayout.module.css";
import Navbar from "./Navbar";
import BookingStepper from "./components/BookingStepper";
import SidebarPriceSummaryCard from "./SidebarPriceSummaryCard";

export default function FlightBookingDetailsLayout({ children }) {
  return (
    <div className={styles.layoutWrapper}>
      <Navbar />
      <div className={styles.stepperWrapperInLayout}>
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
  );
}
