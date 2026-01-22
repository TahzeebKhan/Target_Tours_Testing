"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import styles from "./ActiveReservations.module.css";
import { useProfile } from "../profile/context/ProfileContext";
import FlightBooking from "./FlightBooking";
import Packages from "./Packages";
import TravelInsurence from "./TravelInsurence";

const TABS = [
  "ALL",
  "Hotel Booking",
  "Flight Booking",
  "Packages",
  "Travel Insurance",
];

const RESERVATIONS = [
  {
    id: "173826",
    hotelName: "Golden Tulip Hotel",
    status: "Confirmed",
    checkIn: "12 Mar 2021",
    checkOut: "24 Mar 2025",
    guests: "4 Adults",
    image: "/images/hotel-thumbnail.jpg",
  },
  {
    id: "173826",
    hotelName: "Golden Tulip Hotel",
    status: "Confirmed",
    checkIn: "12 Mar 2021",
    checkOut: "24 Mar 2025",
    guests: "4 Adults",
    image: "/images/hotel-thumbnail.jpg",
  },
];

export default function ActiveReservations({
  activeTab,
  setActiveTab,
  onCheckDetails,
}) {
  const { setMobileTitle } = useProfile();
  useEffect(() => {
    setMobileTitle?.("Active Reservations");
  }, []);
  return (
    <div className={styles.container}>
      {/* Tabs */}
      <nav className={styles.tabNav}>
        {TABS.map((tab) => (
          <button
            key={tab}
            className={`${styles.tabItem} ${activeTab === tab ? styles.tabActive : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </nav>

      {/* Content Area */}
      <main className={styles.mainContent}>
        {activeTab === "Hotel Booking" ? (
          <>
            <div className={styles.cardList}>
              {RESERVATIONS.map((res, index) => (
                <section key={index} className={styles.card}>
                  <div className={styles.cardHeader}>
                    <div className={styles.imageWrapper}>
                      <Image
                        src={res.image}
                        alt={res.hotelName}
                        fill
                        style={{ objectFit: "cover" }}
                      />
                    </div>
                    <div className={styles.hotelInfo}>
                      <h2 className={styles.hotelName}>{res.hotelName}</h2>
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
                        onCheckDetails();
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
        ) : activeTab === "Flight Booking" ? (
          <>
            <FlightBooking
              setMobileTitle={setMobileTitle}
              onCheckDetails={onCheckDetails}
            />{" "}
          </>
        ) : activeTab === "Packages" ? (
          <>
            <Packages
              setMobileTitle={setMobileTitle}
              onCheckDetails={onCheckDetails}
            />
          </>
        ) : activeTab === "Travel Insurance" ? (
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
