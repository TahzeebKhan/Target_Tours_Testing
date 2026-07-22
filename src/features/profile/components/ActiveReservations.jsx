"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import styles from "./ActiveReservations.module.css";
import { useProfile } from "@/app/profile/context/ProfileContext";
import FlightBooking from "./FlightBooking";
import Packages from "./Packages";
import TravelInsurence from "./TravelInsurence";

const TABS = [
  { label: "ALL", value: "ALL" },
  { label: "Hotel Booking", value: "HOTEL BOOKING" },
  { label: "Flight Booking", value: "FLIGHT BOOKING" },
  { label: "Packages", value: "PACKAGES" },
  { label: "Travel Insurance", value: "TRAVEL INSURANCE" },
];

export default function ActiveReservations({
  activeTab,
  setActiveTab,
  onCheckDetails,
  hotelReservations = [],
  flightReservations = [],
  packageReservations = [],
}) {
  const { setMobileTitle } = useProfile();
  useEffect(() => {
    setMobileTitle?.("Active Reservations");
    return () => setMobileTitle?.("");
  }, []);
  return (
    <div className={styles.container}>
      {/* Tabs */}
      <nav className={styles.tabNav}>
        {TABS.map((tab) => (
          <button
            key={tab.value}
            className={`${styles.tabItem} ${activeTab === tab.value ? styles.tabActive : ""}`}
            onClick={() => setActiveTab(tab.value)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Content Area */}
      <main className={styles.mainContent}>
        {activeTab === "HOTEL BOOKING" ? (
          <>
            <div className={styles.cardList}>
              {hotelReservations.map((res, index) => (
                <section key={index} className={styles.card}>
                  <div className={styles.cardHeader}>
                    <div className={styles.imageWrapper}>
                      <Image
                        src={res.image}
                        alt={res.hotelName || res.hotel}
                        fill
                        style={{ objectFit: "cover" }}
                      />
                    </div>
                    <div className={styles.hotelInfo}>
                      <h2 className={styles.hotelName}>{res.hotelName || res.hotel}</h2>
                      <span className={styles.statusBadge}>{res.status}</span>
                    </div>
                  </div>

                  <div className={styles.detailsGrid}>
                    <div className={styles.detailRow}>
                      <span className={styles.label}>ID</span>
                      <span className={styles.dash}>---------</span>

                      <span className={styles.value}>{res.id}</span>
                    </div>
                    <div className={styles.detailRow}>
                      <span className={styles.label}>Check In:</span>
                      <span className={styles.dash}>---------</span>

                      <span className={styles.value}>{res.checkIn}</span>
                    </div>
                    <div className={styles.detailRow}>
                      <span className={styles.label}>Check out:</span>
                      <span className={styles.dash}>---------</span>

                      <span className={styles.value}>{res.checkOut}</span>
                    </div>
                    <div className={styles.detailRow}>
                      <span className={styles.label}>Guests:</span>
                      <span className={styles.dash}>---------</span>

                      <span className={styles.value}>{res.guests}</span>
                    </div>
                    <button
                      onClick={() => {
                        setMobileTitle?.("Booking Details");
                        onCheckDetails(res);
                      }}
                      className={styles.detailsButton}
                    >
                      Check Details
                    </button>
                  </div>
                </section>
              ))}
            </div>
          </>
        ) : activeTab === "FLIGHT BOOKING" ? (
          <>
            <FlightBooking
              setMobileTitle={setMobileTitle}
              onCheckDetails={onCheckDetails}
              reservations={flightReservations}
            />{" "}
          </>
        ) : activeTab === "PACKAGES" ? (
          <>
            <Packages
              setMobileTitle={setMobileTitle}
              onCheckDetails={onCheckDetails}
              reservations={packageReservations}
            />
          </>
        ) : activeTab === "TRAVEL INSURANCE" ? (
          <>
            <TravelInsurence
              setMobileTitle={setMobileTitle}
              onCheckDetails={onCheckDetails}
            />
          </>
        ) : null}
      </main>
    </div>
  );
}
