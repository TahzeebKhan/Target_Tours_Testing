"use client";
import React, { useState, useEffect } from "react";
import styles from "./PriceBar.module.css";
import CustomItinerary from "./CustomItinerary";
import MobileItinerary from "./MobileItinerary";
import { useRouter } from "next/navigation";
import { saveTourBookingPackage } from "@/app/tour-bookings/utils/tourBookingSession";

const PriceBar = ({
  onCall,
  onPersonalize,
  onBookNow,
  hotel = null,
  data,
}) => {
  const [itineraryOpen, setItineraryOpen] = useState(false);
  const [mobileItineraryOpen, setMobileItineraryOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();

  // 🔹 API → UI mapping (safe)
  const daysText =
    data?.duration_days && data?.duration_nights
      ? `${data.duration_days} days, ${data.duration_nights} nights`
      : "";

  const price =
    data?.started_price
      ? `₹ ${Number(data.started_price).toLocaleString("en-IN")}`
      : "";

  // fallback hotel
  const sampleHotel = hotel || {
    title: "SERENE HAVEN INN, TORONTO",
    images: ["/images/hotel-placeholder.jpg"],
  };

  useEffect(() => {
    const checkScreen = () => setIsMobile(window.innerWidth <= 600);
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  const handlePersonalize = (e) => {
    onPersonalize?.(e);

    if (isMobile) {
      setItineraryOpen(false);
      setMobileItineraryOpen(true);
    } else {
      setMobileItineraryOpen(false);
      setItineraryOpen(true);
    }
  };

  const handleBookNow = () => {
    saveTourBookingPackage(data);
    router.push("/tour-bookings");
  };

  return (
    <div className={styles.priceBar}>
      {/* DESKTOP */}
      <div className={styles.container}>
        <div className={styles.priceLeft}>
          <span className={styles.tripInfo}>{daysText}</span>
          <span className={styles.separator}>|</span>
          <span className={styles.priceText}>
            From <strong>{price}</strong>
            <span className={styles.perPerson}> / PERSON</span>
          </span>
        </div>

        <div className={styles.priceRight}>
          <button className={styles.iconBtn} onClick={onCall}>
            <img src="/icons/blankPhone.svg" alt="Call" />
          </button>

          <button className={styles.bookNowBtn} onClick={handleBookNow}>
            BOOK NOW
          </button>
        </div>
      </div>

      {/* MOBILE */}
      <div className={styles.containerMobile}>
        <div className={styles.priceLeft}>
          <span className={styles.tripInfo}>{daysText}</span>
          <span className={styles.separator}>|</span>
          <span className={styles.priceText}>
            <strong>{price}</strong>
          </span>
        </div>

        <div className={styles.priceRight}>
          <button className={styles.iconBtn} onClick={onCall}>
            <img src="/icons/blankPhone.svg" alt="Call" />
          </button>

          <button className={styles.bookNowBtn} onClick={handleBookNow}>
            BOOK NOW
          </button>
        </div>
      </div>

      {/* ITINERARY MODALS */}
      <CustomItinerary
        isOpen={itineraryOpen}
        hotel={sampleHotel}
        onClose={() => setItineraryOpen(false)}
      />

      <MobileItinerary
        isOpen={mobileItineraryOpen}
        hotel={sampleHotel}
        onClose={() => setMobileItineraryOpen(false)}
      />
    </div>
  );
};

export default PriceBar;
