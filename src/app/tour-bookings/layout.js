"use client";

import React from "react";
import { usePathname } from "next/navigation";
import styles from "./TourBookingLayout.module.css";

import BookingStepper from "./components/BookingStepper";
import SidebarPriceSummaryCard from "./SidebarPriceSummaryCard";
import { TourBookingProvider } from "./TourBookingContext";
import Navbar from "./Navbar";

export default function TourBookingLayout({ children }) {
  const pathname = usePathname();
  const isPaymentSuccess = pathname?.includes("/tour-bookings/payment-success");

  return (
    <TourBookingProvider>
      {isPaymentSuccess ? (
        children
      ) : (
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
      )}
    </TourBookingProvider>
  );
}
