"use client";

import React, { useState } from "react";
import Image from "next/image";
import styles from "./help.module.css";

export default function HelpBooking() {
  const [bookingId, setBookingId] = useState("");

  const handleBack = () => {
    // Logic for back navigation
    console.log("Navigating back...");
  };

  const handleContinue = () => {
    // Logic for search
    console.log("Searching for:", bookingId);
  };

  return (
    <section className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Help Us Find Your Booking</h1>
        <p className={styles.subtitle}>
          SHARING YOUR BOOKING DETAILS HELPS US RESOLVE YOUR ISSUE FASTER.
        </p>
      </header>

      <main className={styles.card}>
        <div className={styles.inputGroup}>
          <label htmlFor="bookingId" className={styles.label}>
            BOOKING ID / PNR
          </label>
          <input
            id="bookingId"
            type="text"
            placeholder="Enter First Name"
            className={`${styles.inputField} ${
              bookingId ? styles.activeInput : ""
            }`}
            value={bookingId}
            onChange={(e) => setBookingId(e.target.value)}
          />
          <p className={styles.hint}>
            You can find this in your booking confirmation email or SMS
          </p>
        </div>

        <footer className={styles.footer}>
          <button
            className={styles.backButton}
            onClick={handleBack}
            type="button"
          >
            <Image
              src="/icons/arrow-left.svg"
              alt="Back"
              width={16}
              height={16}
            />
            <span>BACK</span>
          </button>

          <button
            className={styles.continueButton}
            disabled={!bookingId}
            onClick={handleContinue}
            type="button"
          >
            CONTINUE
          </button>
        </footer>
      </main>
    </section>
  );
}
