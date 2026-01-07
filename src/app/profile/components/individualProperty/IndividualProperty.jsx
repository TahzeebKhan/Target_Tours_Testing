"use client";

import React, { useState } from "react";
import Image from "next/image";
import styles from "./IndividualProperty.module.css";

const IndividualProperty = () => {
  // State for the "Confirmed" status or any interactive element
  const [isActive, setIsActive] = useState(true);

  const amenities = [
    { icon: "hot-tub", label: "Hot tub" },
    { icon: "city-view", label: "City view" },
    { icon: "ac", label: "Air conditioning" },
    { icon: "tv", label: "Tv" },
    { icon: "fridge", label: "Refrigerator" },
    { icon: "hair-dryer", label: "Hair dryer" },
    { icon: "microwave", label: "Microwave" },
    { icon: "wifi", label: "Wifi" },
    { icon: "plates", label: "Plates" },
    { icon: "security", label: "Security Cameras" },
    { icon: "coffee", label: "Coffee machine" },
    { icon: "towels", label: "Towels" },
    { icon: "sofa", label: "Sofa" },
  ];

  return (
    <div className={styles.container}>
      {/* Header Section */}
      <header className={styles.header}>
        <div className={styles.hotelInfo}>
          <div className={styles.imageWrapper}>
            <Image
              src="/images/hotel-thumbnail.jpg"
              alt="Hotel Arts Barcelona"
              fill
              className={styles.objectFit}
            />
          </div>
          <div className={styles.details}>
            <h1 className={styles.hotelName}>Hotel Arts Barcelona</h1>
            <p className={styles.textSecondary}>
              <span className={styles.infoLabel}>Address:</span>
              <span className={styles.infoValue}>
                Marina, 19-21, Ciutat Vella, 08005 Barcelona, Spain
              </span>
            </p>

            <p className={styles.textSecondary}>
              <span className={styles.infoLabel}>Phone:</span>
              <span className={styles.infoValue}>+38 540 979 5428</span>
            </p>

            <p className={styles.textSecondary}>
              <span className={styles.infoLabel}>GPS coordinates:</span>
              <span className={styles.infoValue}>
                N 040* 50.963, E 14* 15.348
              </span>
            </p>
          </div>
        </div>

        <div className={styles.bookingMeta}>
          <div className={styles.metaBox}>
            <span className={styles.label}>Check-In</span>
            <span className={styles.dateNumber}>14</span>
            <span className={styles.month}>August</span>
            <span className={styles.time}>14:00 - 21:00</span>
          </div>
          <div className={styles.divider} />
          <div className={styles.metaBox}>
            <span className={styles.label}>Check-Out</span>
            <span className={styles.dateNumber}>19</span>
            <span className={styles.month}>August</span>
            <span className={styles.time}>08:00 - 10:00</span>
          </div>
          <div className={styles.divider} />
          <div className={styles.statusSection}>
            <button
              onClick={() => setIsActive(!isActive)}
              className={`${styles.statusBadge} ${
                isActive ? styles.active : ""
              }`}
            >
              CONFIRMED
            </button>
            <div className={styles.roomCount}>
              <div className={styles.countGroup}>
                <span className={styles.label}>Rooms</span>
                <span className={styles.value}>15</span>
              </div>
              <span className={styles.slash}>/</span>
              <div className={styles.countGroup}>
                <span className={styles.label}>Nights</span>
                <span className={styles.value}>5</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className={styles.detailsWrapper}>
        {/* About Section */}
        <section className={styles.aboutSection}>
          <div className={styles.description}>
            <h2 className={styles.sectionTitle}>ABOUT THIS PROPERTY</h2>
            <h3 className={styles.subTitle}>
              2 guests · Studio · 1 bed · 1.5 baths
            </h3>
            <p className={styles.textSecondary}>
              Welcome to my fully refurbished 17 m² studio, ideally located in
              Versailles, only a 10-minute walk to the Palace of Versailles and
              a 5-minute walk to the Rive Gauche train station.
            </p>
          </div>
          <div className={styles.mapWrapper}>
            <Image
              src="/images/map-view.png"
              alt="Map Location"
              fill
              className={styles.objectFit}
            />
          </div>
        </section>

        {/* Booking Summary */}
        <section className={styles.summarySection}>
          <h2 className={styles.sectionTitle}>BOOKING SUMMARY</h2>
          <div className={styles.priceTable}>
            {[
              { label: "₹2245.5 × 1 Room × 8 Nights", value: "₹ 64,126" },
              { label: "Base Price", value: "₹ 64,126" },
              { label: "Discount", value: "₹ 64,126" },
              { label: "Coupon Discount", value: "₹ 64,126" },
              { label: "Taxes & Fees", value: "₹ 64,126" },
            ].map((item, idx) => (
              <div key={idx} className={styles.priceRow}>
                <span className={styles.textSecondary}>{item.label}</span>
                <span className={styles.textPrimary}>{item.value}</span>
              </div>
            ))}
            <div className={styles.totalRow}>
              <span className={styles.totalLabel}>Total Amount</span>
              <span className={styles.totalValue}>₹ 66,945</span>
            </div>
          </div>
        </section>

        {/* Guest & Meal Info */}
        <div className={styles.guestInfo}>
          <p className={styles.textPrimary}>
            <strong>Guest name:</strong> Anna George / for max. 2 people
          </p>
          <p className={styles.textPrimary}>
            <strong>Meal Plan:</strong> There is no meal included in the rate
            for this apartment.
          </p>
        </div>

        {/* Amenities Grid */}
        <div className={styles.amenitiesGrid}>
          {amenities.map((item, idx) => (
            <div key={idx} className={styles.amenityCard}>
              <div className={styles.iconPlaceholder} />
              <span>{item.label}</span>
            </div>
          ))}
        </div>

        {/* Footer Actions */}
        <footer className={styles.footerActions}>
          <button className={styles.btnSecondary}>CANCEL BOOKING</button>
          <button className={styles.btnPrimary}>DOWNLOAD INVOICE</button>
        </footer>
      </div>
    </div>
  );
};

export default IndividualProperty;
