"use client";

import { useState } from "react";
import Image from "next/image";
import styles from "./Reservations.module.css";

const reservationData = [
  {
    id: "173826",
    hotel: "Golden Tulip Hotel",
    checkIn: "12 Mar 2021",
    checkOut: "24 Mar 2025",
    guests: "4 Adults",
    status: "CONFIRMED",
    image: "/images/hotel-thumbnail.jpg",
  },
  {
    id: "173826",
    hotel: "Golden Tulip Hotel",
    checkIn: "12 Mar 2021",
    checkOut: "24 Mar 2025",
    guests: "4 Adults",
    status: "PENDING",
    image: "/images/hotel-thumbnail.jpg",
  },
];

const tabs = ["ALL", "HOTEL BOOKING", "PACKAGES", "TRAVEL INSURANCE"];

export default function Reservations({ onCheckDetails }) {
  const [activeTab, setActiveTab] = useState("HOTEL BOOKING");

  return (
    <section className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Active Reservations</h1>
        <p className={styles.subtitle}>
          View and manage your current bookings here.
        </p>
      </header>

      <nav className={styles.tabsContainer}>
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`${styles.tabButton} ${
              activeTab === tab ? styles.active : ""
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </nav>

      <div className={styles.list}>
        {reservationData.map((item, index) => (
          <article key={index} className={styles.card}>
            <div className={styles.cardMain}>
              <div className={styles.imageWrapper}>
                <Image
                  src={item.image}
                  alt={item.hotel}
                  fill
                  style={{ objectFit: "cover" }}
                />
              </div>

              <div className={styles.content}>
                <div className={styles.cardHeader}>
                  <h2 className={styles.hotelName}>{item.hotel}</h2>
                </div>

                <div className={styles.detailsGrid}>
                  <div className={styles.detailItem}>
                    <span className={styles.label}>Check In:</span>
                    <span className={styles.value}>{item.checkIn}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.label}>Check out:</span>
                    <span className={styles.value}>{item.checkOut}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.label}>Guests:</span>
                    <span className={styles.value}>{item.guests}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.actionsWrapper}>
              <div className={styles.statusGroup}>
                <span
                  className={`${styles.statusBadge} ${
                    styles[item.status.toLowerCase()]
                  }`}
                >
                  {item.status}
                </span>
                <span className={styles.idLabel}>ID {item.id}</span>
              </div>

              <button className={styles.checkDetails} onClick={onCheckDetails}>
                Check Details
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
