"use client";
import React, { useState } from "react";
import styles from "./FareComparisonModalRoundTrip.module.css";
import { useRouter } from "next/navigation";
import useLockBodyScroll from "@/app/hooks/useLockBodyScroll";

const FareComparisonModalRoundTrip = ({ isOpen, onClose, flightData }) => {
  if (!isOpen) return null;
  const router = useRouter();

  const handleBookNow = () => {
    router.push("/flight-booking-details");
  };

  const flightSegments = {
    onward: {
      label: "ONWARD FLIGHT (DEL-CGK)",
      flight: {
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
          airport: "CGK - JAKARTA",
          terminal: "Terminal T3",
          city: "Soekarno–Hatta International",
        },
        duration: { hours: 7, minutes: 50 },
        stops: "Non-Stop",
      },
      fares: [
        {
          id: "saver",
          name: "SAVER FARE",
          price: "₹ 76,000",
          pricePerAdult: "₹ 6,083",
          isPremium: false,
          baggage: { cabin: "7 Kg", checkin: "15 Kg" },
          changes: {
            charges: "Change up to ₹2,999",
            cancellation: "Cancel up to ₹4,999",
          },
          addons: { seats: "Chargeable Seats", meals: "Chargeable Meals" },
        },
        {
          id: "flexi",
          name: "FLEXI PLUS fare",
          price: "₹ 78,000",
          pricePerAdult: "₹ 6,200",
          isPremium: true,
          baggage: { cabin: "7 Kg", checkin: "15 Kg" },
          changes: {
            charges: "Change up to ₹3,499",
            cancellation: "Cancel up to ₹3,499",
          },
          addons: {
            seats: "Complimentary meal",
            meals: "Complimentary standard seat",
          },
        },
        {
          id: "Premium fare",
          name: "Premium fare",
          price: "₹ 78,000",
          pricePerAdult: "₹ 6,200",
          isPremium: false,
          baggage: { cabin: "7 Kg", checkin: "15 Kg" },
          changes: {
            charges: "Change up to ₹3,499",
            cancellation: "Cancel up to ₹3,499",
          },
          addons: {
            seats: "Chargeable Meals",
            meals: " Complimentary XL (Extra legroom) Seat",
          },
        },
      ],
    },

    return: {
      label: "RETURN FLIGHT (CGK-DEL)",
      flight: {
        departure: {
          date: "SAT, 27 DEC 2025",
          time: "22:10",
          airport: "CGK - JAKARTA",
          terminal: "Terminal T3",
          city: "Soekarno–Hatta International",
        },
        arrival: {
          date: "SUN, 28 DEC 2025",
          time: "05:30",
          airport: "DEL - DELHI",
          terminal: "Terminal T2",
          city: "Indira Gandhi International",
        },
        duration: { hours: 7, minutes: 20 },
        stops: "Non-Stop",
      },
      fares: [
        {
          id: "saver",
          name: "SAVER FARE",
          price: "₹ 72,000",
          pricePerAdult: "₹ 5,800",
          isPremium: false,
          baggage: { cabin: "7 Kg", checkin: "15 Kg" },
          changes: {
            charges: "Change up to ₹2,999",
            cancellation: "Cancel up to ₹4,999",
          },
          addons: { seats: "Chargeable Seats", meals: "Chargeable Meals" },
        },
        {
          id: "flexi",
          name: "FLEXI PLUS Fare",
          price: "₹ 78,000",
          pricePerAdult: "₹ 6,200",
          isPremium: true,
          baggage: { cabin: "7 Kg", checkin: "15 Kg" },
          changes: {
            charges: "Change up to ₹3,499",
            cancellation: "Cancel up to ₹3,499",
          },
          addons: {
            seats: "Complimentary meal",
            meals: "Complimentary standard seat",
          },
        },
        {
          id: "Premium fare",
          name: "Premium fare",
          price: "₹ 78,000",
          pricePerAdult: "₹ 6,200",
          isPremium: false,
          baggage: { cabin: "7 Kg", checkin: "15 Kg" },
          changes: {
            charges: "Change up to ₹3,499",
            cancellation: "Cancel up to ₹3,499",
          },
          addons: {
            seats: "Chargeable Meals",
            meals: " Complimentary XL (Extra legroom) Seat",
          },
        },
      ],
    },
  };

  const [selected, setSelected] = useState("onward");
  const activeSegment = flightSegments[selected];
  const { flight, fares } = activeSegment;
  useLockBodyScroll();
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>
            Compare fares and choose what fits your journey
          </h2>
          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>

        {/* Flight Info */}
        <div className={styles.flightInfo}>
          <div className={styles.toggleBtnsContainer}>
            {Object.entries(flightSegments).map(([key, seg]) => (
              <div
                key={key}
                onClick={() => setSelected(key)}
                className={`${styles.toggleBtn} ${
                  selected === key ? styles.active : ""
                }`}
              >
                {seg.label}
              </div>
            ))}
          </div>

          <div className={styles.flightDuration}>
            <div className={styles.flightInfoStatus}>
              <img
                className={styles.flightIconStatus}
                src="/images/Flight.png"
                alt=""
              />
              <div className={styles.flightInfoNameDatesContainer}>
                <span className={styles.flightInfoNameDates}>Air India</span>
                <div className={styles.smallestDot}></div>
                <span className={styles.flightInfoNameDates}>AI2380</span>
                <div className={styles.smallestDot}></div>
                <span className={styles.flightInfoNameDates}>
                  Boeing 787-9 Dreamliner
                </span>
                <div className={styles.smallestDot}></div>
                <span className={styles.flightInfoNameDates}>
                  Economy Class
                </span>
              </div>
            </div>
            <div className={styles.timelineContainer}>
              {/* LEFT */}
              <div className={styles.side}>
                <div className={styles.date}>{flight.departure.date}</div>
                <div className={styles.time}>{flight.departure.time}</div>
                <div className={styles.airport}>{flight.departure.airport}</div>
                <div className={styles.terminal}>
                  {flight.departure.terminal}
                </div>
                <div className={styles.city}>{flight.departure.city}</div>
              </div>

              {/* CENTER */}
              <div className={styles.center}>
                <div className={styles.flightAnimation}>
                  <div className={styles.flightDotedcontainer}>
                    <div className={styles.bigDot}></div>
                    <div className={styles.dashBorder} />
                    {/* <img src="/images/popupDash.svg" alt="" /> */}
                  </div>

                  <img
                    className={styles.flightSvg}
                    src="/icons/flightIconBlue.svg"
                    height={20}
                    width={20}
                    alt="flight"
                  />

                  <div className={styles.flightDotedcontainer}>
                    <div className={styles.dashBorder}></div>
                    <div className={styles.bigDot}></div>
                  </div>
                </div>

                <div className={styles.priceContainer}>
                  <span className={styles.duration}>
                    {flight.duration.hours}
                    <span className={styles.hours}> h </span>
                    {flight.duration.minutes}
                    <span className={styles.hours}> m </span>
                  </span>

                  <div className={styles.dot}></div>

                  <span className={styles.nonStop}>{flight.stops}</span>
                </div>
              </div>

              {/* RIGHT */}
              <div className={styles.sideRight}>
                <div className={styles.date}>{flight.arrival.date}</div>
                <div className={styles.time}>{flight.arrival.time}</div>
                <div className={styles.airport}>{flight.arrival.airport}</div>
                <div className={styles.terminal}>{flight.arrival.terminal}</div>
                <div className={styles.city}>{flight.arrival.city}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Fare Cards */}
        <div className={styles.fareCardsOverflowAuto}>
          <div className={styles.fareCards}>
            {fares.map((fare) => (
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
                    <h3
                      className={`${styles.fareName} ${
                        fare.isPremium ? styles.fareNamePremium : ""
                      }`}
                    >
                      {fare.name}
                    </h3>
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
                      <span>{fare.baggage.cabin} Cabin bag allowance</span>
                    </div>
                    <div className={styles.featureItem}>
                      <img src="/icons/bag.svg" alt="" />
                      <span>{fare.baggage.checkin} Check-in bag allowance</span>
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
                          fare.isPremium
                            ? "/icons/MEAL.svg"
                            : "/icons/change.svg"
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
                  <button className={styles.lockPriceBtn}>LOCK PRICE</button>
                  <button className={styles.bookNowBtn} onClick={handleBookNow}>
                    BOOK NOW
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FareComparisonModalRoundTrip;
