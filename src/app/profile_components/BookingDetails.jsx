"use client";

import React from "react";
import Image from "next/image";
import styles from "./BookingDetails.module.css";
import HotTubIcon from "../../../public/icons/hot-tub.svg";

const BookingDetails = () => {
  const amenities = [
    { icon: "/icons/hot-tub.svg", label: "Hot tub" },
    { icon: "/icons/city-view.svg", label: "City view" },
    { icon: "/icons/ac.svg", label: "Air conditioning" },
    { icon: "/icons/tv-retro.svg", label: "Tv" },
    { icon: "/icons/fridge.svg", label: "Refrigerator" },
    { icon: "/icons/hair-dryer.svg", label: "Hair dryer" },
    { icon: "/icons/microwave.svg", label: "Microwave" },
    { icon: "/icons/wifi.svg", label: "Wifi" },
    { icon: "/icons/Plate.svg", label: "Plates" },
    { icon: "/icons/camera-circle.svg", label: "Security Cameras" },
    { icon: "/icons/coffee.svg", label: "Coffee machine" },
    { icon: "/icons/towels.svg", label: "Towels" },
    { icon: "/icons/sofa.svg", label: "Sofa" },
  ];

  const [activeAmenity, setActiveAmenity] = React.useState(null);

  return (
    <div className={styles.outerContainer}>
      <div className={styles.card}>
        {/* Header Section */}
        <header className={styles.header}>
          <div className={styles.hotelHeader}>
            <div className={styles.imageWrapper}>
              <Image
                src="/images/hotel-thumbnail.jpg"
                alt="Golden Tulip"
                fill
                className={styles.objectFit}
              />
            </div>
            <div className={styles.hotelTitleGroup}>
              <h1 className={styles.hotelName}>Golden Tulip Hotel Confirmed</h1>
              <span className={styles.confirmedBadge}>Confirmed</span>
            </div>
          </div>

          <div className={styles.addressSection}>
            <div className={styles.addressBlock}>
              <p>
                <span className={styles.label}>Address:</span>
              </p>
              <p className={styles.value}>
                Marina, 19-21, Ciutat Vella, 08005 Barcelona, Spain
              </p>
            </div>

            <div className={styles.addressBlock}>
              <p className={styles.labelSpacing}>
                <span className={styles.label}>Phone:</span>
              </p>
              <p className={styles.value}>+38 540 979 5428</p>
            </div>

            <div className={styles.addressBlock}>
              <p className={styles.labelSpacing}>
                <span className={styles.label}>GPS coordinates:</span>
              </p>
              <p className={styles.value}>N 040* 50.963, E 14* 15.348</p>
            </div>
          </div>

          <div className={styles.bookingMeta}>
            <div className={styles.metaBox}>
              <span className={styles.metaLabel}>Check-In</span>
              <div className={styles.dateBlock}>
                <span className={styles.dateNumber}>14</span>
                <span className={styles.month}>August</span>
              </div>
              <div className={styles.timeWrapper}>
                <Image
                  src="/icons/alarm-clock.svg"
                  alt="clock"
                  width={14}
                  height={14}
                />
                <span>14:00 - 21:00</span>
              </div>
            </div>
            <div className={styles.verticalDivider} />
            <div className={styles.metaBox}>
              <span className={styles.metaLabel}>Check-Out</span>
              <div className={styles.dateBlock}>
                <span className={styles.dateNumber}>19</span>
                <span className={styles.month}>August</span>
              </div>

              <div className={styles.timeWrapper}>
                <Image
                  src="/icons/alarm-clock.svg"
                  alt="clock"
                  width={14}
                  height={14}
                />
                <span>08:00 - 10:00</span>
              </div>
            </div>
          </div>

          <div className={styles.statsRow}>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Rooms</span>
              <span className={styles.statValue}>15</span>
            </div>
            <span className={styles.statSlash}>/</span>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Nights</span>
              <span className={styles.statValue}>5</span>
            </div>
          </div>
        </header>
      </div>
      {/* Content Section */}
      <main className={styles.content}>
        <section className={styles.aboutSection}>
          <h2 className={styles.sectionTitle}>About This Property</h2>
          <h3 className={styles.roomSpecs}>
            2 guests · Studio · 1 bed · 1.5 baths
          </h3>
          <p className={styles.description}>
            Welcome to my fully refurbished 17 m² studio, ideally located in
            Versailles, only a 10-minute walk to the Palace of Versailles and a
            5-minute walk to the Rive Gauche train station.
          </p>
          <div className={styles.mapContainer}>
            <Image
              src="/images/map-view.png"
              alt="Map"
              fill
              className={styles.objectFit}
            />
          </div>
        </section>

        <section className={styles.summarySection}>
          <h2 className={styles.sectionTitle}>Booking Summary</h2>
          <div className={styles.priceList}>
            {[
              { label: "₹2245.5 × 1 Room × 8 Nights", value: "₹ 64,126" },
              { label: "Base Price", value: "₹ 64,126" },
              { label: "Discount", value: "₹ 64,126" },
              { label: "Coupon Discount", value: "₹ 64,126" },
              { label: "Taxes & Fees", value: "₹ 64,126" },
            ].map((item, idx) => (
              <div key={idx} className={styles.priceRow}>
                <span className={styles.pLabel}>{item.label}</span>
                <div className={styles.valueRow}>
                  <span className={styles.dash}>---------</span>
                  <span className={styles.pValue}>{item.value}</span>
                </div>
              </div>
            ))}
            <div className={styles.totalRow}>
              <span className={styles.totalLabel}>Total Amount</span>

              <span className={styles.totalPrice}>₹ 66,945</span>
            </div>
          </div>
        </section>

        <section className={styles.guestSection}>
          <h2 className={styles.sectionTitle}>Guest name</h2>
          <p className={styles.guestDetail}>Anna George / for max. 2 people</p>
        </section>

        <section className={styles.mealSection}>
          <h2 className={styles.sectionTitle}>Meal Plan</h2>
          <p className={styles.guestDetail}>
            There is no meal included in the rate for this apartment.
          </p>
        </section>

        <div className={styles.amenitiesGrid}>
          {amenities.map((item, idx) => (
            <div
              key={idx}
              className={`${styles.amenityBadge} ${
                activeAmenity === idx ? styles.activeAmenity : ""
              }`}
              onClick={() => setActiveAmenity(idx)}
            >
              <Image
                src={item.icon}
                alt={item.label}
                width={16}
                height={16}
                className={styles.amenityIcon}
              />

              <span className={styles.itemLabel}>{item.label}</span>
            </div>
          ))}
        </div>

        <footer className={styles.actions}>
          <button className={styles.btnCancel}>Cancel Booking</button>
          <button className={styles.btnDownload}>Download Invoice</button>
        </footer>
      </main>
    </div>
  );
};

export default BookingDetails;
