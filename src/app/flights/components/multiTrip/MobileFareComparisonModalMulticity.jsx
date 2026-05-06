"use client";
import React, { useState } from "react";
import styles from "./MobileFareComparisonModalMulticity.module.css";
import TripDetailsHeader from "@/shared/components/tripDetailsHeader/TripDetailsHeader";
import FlightTimeline from "@/app/flight-booking-details/mobileViewComponents/components/flightTimeline/FlightTimeline";
import { useRouter } from "next/navigation";

const MobileFareComparisonModalMulticity = ({
  isOpen,
  onClose,
  flightData,
}) => {
  if (!isOpen) return null;
  const router = useRouter();

  const handleBookNow = () => {
    router.push("/flight-booking-details");
  };
  const [activeTab, setActibeTab] = useState("onward");
  const fareOptions = [
    {
      id: "saver",
      name: "SAVER FARE",
      price: "₹ 760,000",
      pricePerAdult: "₹ 6,083",
      isPremium: false,
      baggage: {
        cabin: "7 Kg Cabin Bag Allowance",
        checkin: "15 Kg Check-in Bag Allowance",
      },
      changes: {
        charges: "Change Charges Upto INR 2999",
        cancellation: "Cancellation Charges Upto INR 4999",
      },
      addons: {
        seats: "Chargeable Seats",
        meals: "Chargeable Meals",
      },
    },
    {
      id: "flexi",
      name: "FLEXI PLUS FARE",
      price: "₹ 760,000",
      pricePerAdult: "₹ 6,083",
      isPremium: true,
      baggage: {
        cabin: "7 Kg Cabin Bag Allowance",
        checkin: "15 Kg Check-in Bag Allowance",
      },
      changes: {
        charges: "Change Charges Upto INR 3499",
        cancellation: "Cancellation Charges Upto INR 3499",
      },
      addons: {
        seats: "Complimentary XL Bomb Legroom Seat",
        meals: "Complimentary Standard Seat",
      },
    },
    {
      id: "premium",
      name: "PREMIUM FARE",
      price: "₹ 760,000",
      pricePerAdult: "₹ 6,083",
      isPremium: false,
      baggage: {
        cabin: "7 Kg Cabin Bag Allowance",
        checkin: "15 Kg Check-in Bag Allowance",
      },
      changes: {
        charges: "Change Charges Upto INR 2999",
        cancellation: "Cancellation Charges Upto INR 4999",
      },
      addons: {
        seats: "Complimentary XL Bomb Legroom Seat",
        meals: "Chargeable Meals",
      },
    },
  ];

  const flight = {
    departure: {
      date: "THU, 18 DEC 2025",
      time: "06:45",
      airport: "DEL - DELHI",
      terminal: "Terminal T2",
      city: "Indira Gandhi International",
    },
    arrival: {
      date: "THU, 18 DEC 2025",
      time: "08:00",
      airport: "HKT - PHUKET CITY",
      terminal: "Terminal T3",
      city: "Phuket International",
    },
    duration: {
      hours: 1,
      minutes: 50,
    },
    stops: "Non-Stop",
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.tripDetailsContainer}>
          <div className={styles.tripDetailsHeader}>
            <img
              src="/icons/leftArrowTrip.svg"
              alt="back"
              onClick={onClose} // or router.back() if needed
              style={{ cursor: "pointer" }}
            />
            <p className={styles.tripDetails}>
              Compare fares and choose what fits your journey
            </p>
          </div>
        </div>

        <div className={styles.TripCard}>
          {/* Header Section: Dark blue background with Route and Date */}
          <div className={styles.TripCardHeader}>
            <div className={styles.TripCardHeaderDetails}>
              <p className={styles.TripCardHeaderDetailsItemText}>NEW DELHI</p>
              <span className={styles.TripCardHeaderDetailsItemCode}>
                (DEL)
              </span>

              <img src="/icons/right-arrow.svg" alt="arrow" />

              <p className={styles.TripCardHeaderDetailsItemText}>
                PHUKET CITY
              </p>
              <span className={styles.TripCardHeaderDetailsItemCode}>
                (CGK)
              </span>
            </div>
            <div className={styles.TripCardHeaderDate}>Wed-11 Feb 2026</div>
          </div>

          {/* Content Section: White background with Airline, Timeline, and Links */}
          <div className={styles.TripFlightDetailsCard}>
            <div className={styles.TripFlightDetailsCardCont}>
              <div className={styles.TripFlightDetailsCardImage}>
                <img src="/images/Flight.png" alt="" />
              </div>
              <div className={styles.AirLineDetails}>
                <div className={styles.AirLineDetailsItem}>
                  <span className={styles.AirLineDetailsItemText}>
                    Air India
                  </span>
                  <div className={styles.dot}></div>
                  <span className={styles.AirLineCode}>AI2380</span>
                </div>
                <div className={styles.AirLineDetailsItem}>
                  <span className={styles.AirLineBoeing}>
                    Boeing 787-9 Dreamliner
                  </span>
                  <div className={styles.dot}></div>
                  <span className={styles.AirLineDetailsItemCode}>
                    Economy Class
                  </span>
                </div>
              </div>
            </div>
            <FlightTimeline flight={flight} />
            <div className={styles.Airportname}>
              <span>Indira Gandhi Internation</span>
              <span>Phuket International</span>
            </div>
          </div>
        </div>
        {/* Header */}

        <div className={styles.header}>
          <h2 className={styles.title}>Select Service</h2>
        </div>

        {/* Fare Cards */}
        <div className={styles.toggleTabContainer}>
          <div
            onClick={() => setActibeTab("onward")}
            className={`${styles.toggleTab} ${
              activeTab === "onward" ? styles.activeTab : ""
            }`}
          >
            DEL-CGK
          </div>
          <div
            onClick={() => setActibeTab("return")}
            className={`${styles.toggleTab} ${
              activeTab === "return" ? styles.activeTab : ""
            }`}
          >
            cgk-del
          </div>
        </div>
        <div className={styles.fareCards}>
          {fareOptions.map((fare) => (
            <div
              key={fare.id}
              className={`${styles.fareCardContainer} ${
                fare.isPremium ? styles.premiumContainer : ""
              }`}
            >
              {fare.isPremium && (
                <div className={styles.premiumBadge}>PREMIUM</div>
              )}

              <div className={styles.fareCard}>
                <div className={styles.fareHeader}>
                  <h3 className={styles.fareName}>{fare.name}</h3>
                  <div className={styles.farePrice}>
                    <span className={styles.price}>{fare.price}</span>
                    <img src="/icons/Group.svg" alt="" />
                  </div>
                  <span className={styles.pricePerAdult}>
                    {fare.pricePerAdult}{" "}
                    <span className={styles.adult}>/ ADULT</span>
                  </span>
                </div>
                <div className={styles.hr}></div>

                {/* Baggage */}
                <div className={styles.featureSection}>
                  <div className={styles.featureTitle}>BAGGAGE</div>
                  <div className={styles.featureItem}>
                    <img src="/icons/bigBag.svg" alt="" />
                    <span>{fare.baggage.cabin}</span>
                  </div>
                  <div className={styles.featureItem}>
                    <img src="/icons/bag.svg" alt="" />
                    <span>{fare.baggage.checkin}</span>
                  </div>
                </div>

                <div className={styles.hr}></div>

                {/* Change/Cancellation */}
                <div className={styles.featureSection}>
                  <div className={styles.featureTitle}>
                    CHANGE / CANCELLATION
                  </div>
                  <div className={styles.featureItem}>
                    <img src="/icons/change.svg" alt="" />
                    <span>{fare.changes.charges}</span>
                  </div>
                  <div className={styles.featureItem}>
                    <img src="/icons/cancellation.svg" alt="" />
                    <span>{fare.changes.cancellation}</span>
                  </div>
                </div>

                <div className={styles.hr}></div>

                {/* Add-ons */}
                <div className={styles.featureSection}>
                  <div className={styles.featureTitle}>
                    ADD-ONS AND SERVICES
                  </div>
                  <div className={styles.featureItem}>
                    <img
                      src={
                        fare.isPremium ? "/icons/MEAL.svg" : "/icons/change.svg"
                      }
                      alt=""
                    />
                    <span>{fare.addons.seats}</span>
                  </div>
                  <div className={styles.featureItem}>
                    <img
                      src={
                        fare.isPremium
                          ? "/icons/couch.svg"
                          : "/icons/cancellation.svg"
                      }
                      alt=""
                    />
                    <span>{fare.addons.meals}</span>
                  </div>
                </div>
              </div>
              {/* Action Buttons */}
              <div className={styles.fareActions}>
                {/* <button className={styles.lockPriceBtn}>LOCK PRICE</button> */}
                <button onClick={handleBookNow} className={styles.bookNowBtn}>
                  BOOK NOW
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MobileFareComparisonModalMulticity;
