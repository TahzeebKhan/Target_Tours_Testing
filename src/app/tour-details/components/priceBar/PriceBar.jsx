"use client";
import React, { useState, useEffect } from "react";
import styles from "./PriceBar.module.css";
import CustomItinerary from "./CustomItinerary";
import MobileItinerary from "./MobileItinerary";
import { useRouter } from "next/navigation";
import { saveTourBookingPackage } from "@/app/tour-bookings/utils/tourBookingSession";
import { useAuth } from "@/app/context/AuthContext";
import LoginPopup from "@/app/account/loginPopUp/LoginPopup";
import SignupPopup from "@/app/account/signUpPopUp/SignupPopup";
import { toast } from "react-toastify";

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
  const [showLogin, setShowLogin] = useState(false);
  const [authView, setAuthView] = useState("login");
  const [pendingBookNow, setPendingBookNow] = useState(false);
  const router = useRouter();
  const { isLoggedIn, loading: authLoading } = useAuth();

  // 🔹 API → UI mapping (safe)
  const daysText =
    data?.duration_days && data?.duration_nights
      ? `${data.duration_days} days, ${data.duration_nights} nights`
      : "";

  const price =
    data?.started_price
      ? `₹ ${Number(data.started_price).toLocaleString("en-IN")}`
      : "";
  const hasDepartures =
    Array.isArray(data?.package_departures) && data.package_departures.length > 0;

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

  const continueBooking = () => {
    saveTourBookingPackage(data);
    router.push("/tour-bookings");
  };

  const handleBookNow = () => {
    if (authLoading) return;

    if (!hasDepartures) {
      toast.error("No departures available.");
      return;
    }

    if (!isLoggedIn) {
      setPendingBookNow(true);
      setAuthView("login");
      setShowLogin(true);
      return;
    }

    continueBooking();
  };

  useEffect(() => {
    if (!isLoggedIn || !pendingBookNow) return;

    setShowLogin(false);
    setPendingBookNow(false);
    continueBooking();
  }, [isLoggedIn, pendingBookNow]);

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

      {showLogin && authView === "login" && (
        <LoginPopup
          onClose={() => {
            setShowLogin(false);
            setPendingBookNow(false);
          }}
          onNavigate={setAuthView}
        />
      )}

      {showLogin && authView === "signup" && (
        <SignupPopup
          onClose={() => {
            setShowLogin(false);
            setPendingBookNow(false);
          }}
          onNavigate={setAuthView}
        />
      )}
    </div>
  );
};

export default PriceBar;
