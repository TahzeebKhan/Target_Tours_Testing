"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import styles from "./IndividualProperty.module.css";
import BookingDetails from "@/features/profile/components/BookingDetails";
import { useProfile } from "../../context/ProfileContext";
import FlightBookingDetails from "./FlightBookingDetails";
import PackageDetails from "./PackageDetails";
import InsurenceDetails from "./InsurenceDetails";
import ModifyBookingModal from "./ModifyBookingModal";
import CancelBookingModal from "./CancelBookingModal";

const IndividualProperty = ({ activeTab, setActiveTab }) => {
  const [isActive, setIsActive] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const openCancelModal = () => setShowCancelModal(true);
  const closeCancelModal = () => setShowCancelModal(false);

  const [showModifyModal, setShowModifyModal] = useState(false);
  const amenities = [
    { icon: "/icons/hot-tub.svg", label: "Hot tub" },
    { icon: "/icons/city-view.svg", label: "City view" },
    { icon: "/icons/ac.svg", label: "Air conditioning" },
    { icon: "/icons/tv-retro.svg", label: "TV" },
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
  const { setMobileTitle } = useProfile();

  useEffect(() => {
    setMobileTitle?.("Booking Details");

    return () => {
      setMobileTitle?.("Active Reservations");
    };
  }, []);
  const isCorporate = false;

  const openModifyModal = () => setShowModifyModal(true);
  const closeModifyModal = () => setShowModifyModal(false);

  return (
    <>
      {activeTab === "HOTEL BOOKING" && (
        <div className={styles.container}>
          <div className={styles.innerContainer}>
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
                  <div className={styles.timeWrapper}>
                    <Image
                      src="/icons/alarm-clock.svg"
                      alt="Time"
                      width={18}
                      height={18}
                      className={styles.timeIcon}
                    />
                    <span className={styles.time}>14:00 - 21:00</span>
                  </div>
                </div>
                <div className={styles.divider} />
                <div className={styles.metaBox}>
                  <span className={styles.label}>Check-Out</span>
                  <span className={styles.dateNumber}>19</span>
                  <span className={styles.month}>August</span>
                  <div className={styles.timeWrapper}>
                    <Image
                      src="/icons/alarm-clock.svg"
                      alt="Time"
                      width={18}
                      height={18}
                      className={styles.timeIcon}
                    />
                    <span className={styles.time}>08:00 - 10:00</span>
                  </div>
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
          </div>
          <div className={styles.detailsWrapper}>
            {/* About Section */}
            <section className={styles.aboutSection}>
              <div className={styles.description}>
                <h2 className={styles.sectionTitle}>ABOUT THIS PROPERTY</h2>
                <h3 className={styles.subTitle}>
                  2 guests · Studio · 1 bed · 1.5 baths
                </h3>
                <p
                  className={`${styles.textSecondary} ${styles.textSecondary2}`}
                >
                  Welcome to my fully refurbished 17 m² studio, ideally located
                  in Versailles, only a 10-minute walk to the Palace of
                  Versailles and a 5-minute walk to the Rive Gauche train
                  station.
                </p>
              </div>
              <div className={styles.mapWrapper}>
                <Image
                  src="/images/map-view.png"
                  alt="Map Location"
                  fill
                  className={styles.objectFit}
                />

                {/* Map Pin Icon */}
                <Image
                  src="/icons/map-pin.svg"
                  alt="Location Pin"
                  width={24}
                  height={28}
                  className={styles.mapPin}
                />
              </div>
            </section>

            {/* Booking Summary */}
            <section className={styles.summarySection}>
              <h2 className={styles.sectionTitle}>BOOKING SUMMARY</h2>
              <div className={styles.priceTable}>
                {[
                  { label: "₹2245.5 x 1 Room x 8 Nights", value: "₹ 64,126" },
                  { label: "Base Price", value: "₹ 64,126" },
                  { label: "Discount", value: "₹ 64,126" },
                  { label: "Coupon Discount", value: "₹ 64,126" },
                  { label: "Taxes & Fees", value: "₹ 64,126" },
                ].map((item, idx) => (
                  <div key={idx} className={styles.priceRow}>
                    <span className={styles.priceLabel}>{item.label}</span>
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
            <div className={styles.infoAmenitiesWrapper}>
              {/* Guest & Meal Info */}
              <div className={styles.guestInfo}>
                <p className={styles.textPrimary}>
                  <span className={styles.infoTitle}>Guest name:</span>{" "}
                  <span className={styles.infoText}>
                    Anna George / for max. 2 people
                  </span>
                </p>

                <p className={styles.textPrimary}>
                  <span className={styles.infoTitle}>Meal Plan:</span>{" "}
                  <span className={styles.infoText}>
                    There is no meal included in the rate for this apartment.
                  </span>
                </p>
              </div>

              {/* Amenities Grid */}
              <div className={styles.amenitiesGrid}>
                {amenities.map((item, idx) => (
                  <div key={idx} className={styles.amenityCard}>
                    <div className={styles.iconWrapper}>
                      <Image
                        src={item.icon}
                        alt={item.label}
                        width={22}
                        height={22}
                      />
                    </div>
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer Actions */}
            <footer className={styles.footerActions}>
              <button onClick={openCancelModal} className={styles.btnSecondary}>CANCEL BOOKING</button>
              {isCorporate ? (
                <button onClick={openModifyModal} className={styles.btnPrimary}>
                  MODIFY BOOKING
                </button>
              ) : (
                <button className={styles.btnPrimary}>DOWNLOAD INVOICE</button>
              )}
            </footer>
          </div>
        </div>
      )}

      {activeTab === "FLIGHT BOOKING" && <FlightBookingDetails />}

      {activeTab === "PACKAGES" && <PackageDetails />}

      {activeTab === "TRAVEL INSURANCE" && <InsurenceDetails />}

      <div className={styles.mobileView}>
        <BookingDetails activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      {showModifyModal && (
        <ModifyBookingModal
          bookingId="BK001235"
          checkIn="20 Jan 2026"
          checkOut="22 Jan 2026"
          onClose={closeModifyModal}
        />
      )}
      {showCancelModal && (
        <CancelBookingModal
          hotelName={`Hotel Arts Barcelona`}
          // airline="Air India"
          // route="DEL to BOM"
          bookingId="BK001234"
          onClose={closeCancelModal}
        />
      )}
    </>
  );
};

export default IndividualProperty;
