"use client";

import React from "react";
import Image from "next/image";
import styles from "./BookingDetails.module.css";
import FlightBookingDetails from "./FlightBookingDetails";
import Packages from "./Packages";
import PackageDetails from "./PackageDetails";
import InsuranceDetails from "./InsuranceDetails";

const BookingDetails = ({ activeTab, setActiveTab }) => {
  const amenities = [
    { icon: "/icons/hot-tub.svg", label: "Hot tub" },
    { icon: "/icons/city-view.svg", label: "City view" },
    { icon: "/icons/ac.svg", label: "Air conditioning" },
    { icon: "/icons/tv-retro.svg", label: "Tv" },
    { icon: "/icons/fridge.svg", label: "Refrigerator" },
    { icon: "/icons/hair-dryer.svg", label: "Hair dryer" },
    { icon: "/icons/microwave.svg", label: "Microwave" },
    { icon: "/icons/wifi copy.svg", label: "Wifi" },
    { icon: "/icons/Plate.svg", label: "Plates" },
    { icon: "/icons/camera-circle.svg", label: "Security Cameras" },
    { icon: "/icons/coffee.svg", label: "Coffee machine" },
    { icon: "/icons/towels.svg", label: "Towels" },
    { icon: "/icons/sofa.svg", label: "Sofa" },
  ];

  const [activeAmenity, setActiveAmenity] = React.useState(null);
  // if (activeTab === "ALL") return null;

  if (activeTab === "Flight Booking") {
    return (
      <div>
        <FlightBookingDetails />
      </div>
    );
  }

  if (activeTab === "Packages") {
    return <PackageDetails />;
  }

  if (activeTab === "Travel Insurance") {
    return <InsuranceDetails />;
  }

  if (activeTab !== "Hotel Booking") return null;
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
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 15 15"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M14.465 2.45684C14.3547 2.56934 14.2086 2.62557 14.0631 2.62557C13.9213 2.62557 13.7789 2.57232 13.6694 2.46507L12.1694 0.995104C11.9481 0.777604 11.9444 0.421328 12.1611 0.199328C12.3794 -0.0226721 12.7347 -0.0264118 12.9575 0.191088L14.4575 1.66106C14.678 1.87856 14.6817 2.23484 14.465 2.45684ZM2.46059 0.960589C2.68034 0.740839 2.68034 0.384563 2.46059 0.164813C2.24084 -0.0549375 1.88456 -0.0549375 1.66481 0.164813L0.164813 1.66481C-0.0549375 1.88456 -0.0549375 2.24084 0.164813 2.46059C0.274313 2.57009 0.418334 2.62557 0.562334 2.62557C0.706334 2.62557 0.850356 2.57084 0.959856 2.46059L2.46059 0.960589ZM11.1651 12.6149L12.2113 13.6663C12.4311 13.8868 12.4296 14.2431 12.2099 14.4621C12.1004 14.5716 11.9563 14.6256 11.8131 14.6256C11.6691 14.6256 11.5243 14.5701 11.4148 14.4599L10.1721 13.2111C9.30658 13.6326 8.33907 13.8756 7.31307 13.8756C6.28707 13.8756 5.32031 13.6326 4.45406 13.2111L3.21132 14.4599C3.10182 14.5701 2.95707 14.6256 2.81307 14.6256C2.66982 14.6256 2.52578 14.5708 2.41628 14.4621C2.19653 14.2431 2.19506 13.8868 2.41481 13.6663L3.46108 12.6149C1.82233 11.4209 0.750567 9.49182 0.750567 7.31307C0.750567 3.69432 3.69432 0.750567 7.31307 0.750567C10.9318 0.750567 13.8756 3.69432 13.8756 7.31307C13.8756 9.49182 12.8038 11.4209 11.1651 12.6149ZM7.31307 12.7506C10.3116 12.7506 12.7506 10.3116 12.7506 7.31307C12.7506 4.31457 10.3116 1.87557 7.31307 1.87557C4.31457 1.87557 1.87557 4.31457 1.87557 7.31307C1.87557 10.3116 4.31457 12.7506 7.31307 12.7506ZM7.87557 7.10982V4.3431C7.87557 4.0326 7.62357 3.7806 7.31307 3.7806C7.00257 3.7806 6.75057 4.0326 6.75057 4.3431V7.3431C6.75057 7.49235 6.8098 7.63562 6.91555 7.74062L8.41555 9.24062C8.52505 9.35012 8.66907 9.4056 8.81307 9.4056C8.95707 9.4056 9.10109 9.35087 9.21059 9.24062C9.43034 9.02087 9.43034 8.66459 9.21059 8.44484L7.87557 7.10982Z"
                    fill="#71717A"
                  />
                </svg>

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
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 15 15"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M14.465 2.45684C14.3547 2.56934 14.2086 2.62557 14.0631 2.62557C13.9213 2.62557 13.7789 2.57232 13.6694 2.46507L12.1694 0.995104C11.9481 0.777604 11.9444 0.421328 12.1611 0.199328C12.3794 -0.0226721 12.7347 -0.0264118 12.9575 0.191088L14.4575 1.66106C14.678 1.87856 14.6817 2.23484 14.465 2.45684ZM2.46059 0.960589C2.68034 0.740839 2.68034 0.384563 2.46059 0.164813C2.24084 -0.0549375 1.88456 -0.0549375 1.66481 0.164813L0.164813 1.66481C-0.0549375 1.88456 -0.0549375 2.24084 0.164813 2.46059C0.274313 2.57009 0.418334 2.62557 0.562334 2.62557C0.706334 2.62557 0.850356 2.57084 0.959856 2.46059L2.46059 0.960589ZM11.1651 12.6149L12.2113 13.6663C12.4311 13.8868 12.4296 14.2431 12.2099 14.4621C12.1004 14.5716 11.9563 14.6256 11.8131 14.6256C11.6691 14.6256 11.5243 14.5701 11.4148 14.4599L10.1721 13.2111C9.30658 13.6326 8.33907 13.8756 7.31307 13.8756C6.28707 13.8756 5.32031 13.6326 4.45406 13.2111L3.21132 14.4599C3.10182 14.5701 2.95707 14.6256 2.81307 14.6256C2.66982 14.6256 2.52578 14.5708 2.41628 14.4621C2.19653 14.2431 2.19506 13.8868 2.41481 13.6663L3.46108 12.6149C1.82233 11.4209 0.750567 9.49182 0.750567 7.31307C0.750567 3.69432 3.69432 0.750567 7.31307 0.750567C10.9318 0.750567 13.8756 3.69432 13.8756 7.31307C13.8756 9.49182 12.8038 11.4209 11.1651 12.6149ZM7.31307 12.7506C10.3116 12.7506 12.7506 10.3116 12.7506 7.31307C12.7506 4.31457 10.3116 1.87557 7.31307 1.87557C4.31457 1.87557 1.87557 4.31457 1.87557 7.31307C1.87557 10.3116 4.31457 12.7506 7.31307 12.7506ZM7.87557 7.10982V4.3431C7.87557 4.0326 7.62357 3.7806 7.31307 3.7806C7.00257 3.7806 6.75057 4.0326 6.75057 4.3431V7.3431C6.75057 7.49235 6.8098 7.63562 6.91555 7.74062L8.41555 9.24062C8.52505 9.35012 8.66907 9.4056 8.81307 9.4056C8.95707 9.4056 9.10109 9.35087 9.21059 9.24062C9.43034 9.02087 9.43034 8.66459 9.21059 8.44484L7.87557 7.10982Z"
                    fill="#71717A"
                  />
                </svg>

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
