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
import CorporateSidebarSummary from "./CorporateSidebarSummary";
import FlightPriceChangeModal from "./components/FlightPriceChangeModal";

export default function FlightBookingDetailsLayout({ children }) {
  return (
    <FlightBookingProvider>
      <FlightBookingDetailsContent>{children}</FlightBookingDetailsContent>
      <FlightPriceChangeModal />
    </FlightBookingProvider>
  );
}

function FlightBookingDetailsContent({ children }) {
  const isCorporate = false;
  const { bookingSession, bookingSessionReady } = useFlightBooking();
  const isBookingReady = bookingSessionReady && Boolean(bookingSession);

  return (
    <>
      <div className={styles.layoutWrapper}>
        <div className={styles.desktopChrome}>
          <Navbar />
          {isBookingReady && <BookingStepper />}
        </div>

        {isBookingReady ? (
          <main className={styles.mainContent}>
            <div className={styles.container}>{children}</div>
            <aside className={styles.sidebar}>
              <div className={styles.sidebarSticky}>
                <SidebarPriceSummaryCard />
                {isCorporate && <CorporateSidebarSummary />}
              </div>
            </aside>
          </main>
        ) : (
          <main className={styles.loadingState} role="status" aria-live="polite">
            <span className={styles.loadingSpinner} aria-hidden="true" />
            <h2>
              {bookingSessionReady
                ? "Redirecting to flight search"
                : "Loading your booking"}
            </h2>
            <p>
              {bookingSessionReady
                ? "Your booking session is unavailable. Please search for a flight again."
                : "Please wait while we restore your selected flight."}
            </p>
          </main>
        )}
      </div>
    </>
  );
}
