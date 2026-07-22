"use client";

import { useMemo, useState } from "react";
import FlightTimingDetail from "./FlightTimingDetail";
import MultiTripExpendable from "./multiTripExpendable/MultiTripExpendable";
import styles from "./MultiCityFlightCard.module.css";

const fallbackCard = {
  id: "fallback-multi-single",
  depart: {
    airline: {
      name: "IndiGo",
      code: "6E",
      logo: "/images/dummyFlightlogo.png",
    },
    flight: {
      departure: {
        time: "06:45",
        city: "Jakarta (CGK)",
      },
      arrival: {
        time: "08:00",
        city: "Singapore (SIN)",
      },
      duration: {
        hours: 1,
        minutes: 50,
      },
      stops: {
        type: "Non Stop",
      },
    },
  },
  fare: {
    totalFare: "₹ 3,22,000",
    pricePerAdult: "₹ 12,000",
    cabinClass: "ECONOMY",
  },
};

const MultiCityFlightCard = ({
  cardData,
  isSelected = false,
  onSelect,
  actionLabel = "SELECT FLIGHT",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const item = useMemo(
    () => (cardData?.depart ? cardData : fallbackCard),
    [cardData],
  );
  const flightId = item.id || "multi-flight";
  const airline = item.depart?.airline || fallbackCard.depart.airline;
  const flight = item.depart?.flight || fallbackCard.depart.flight;
  const fare = item.fare || fallbackCard.fare;

  return (
    <div>
      <div
        className={`${styles.card} ${isSelected ? styles.cardSelected : ""} ${
          isOpen ? styles.cardOpen : ""
        }`}
      >
        <div className={styles.flightPanel}>
          <div className={styles.airline}>
            <img src={airline.logo || "/images/dummyFlightlogo.png"} alt="" />
            <div>
              <span className={styles.airlineName}>{airline.name || "IndiGo"}</span>
              <span className={styles.flightNo}>{airline.code || ""}</span>
            </div>
          </div>
          <FlightTimingDetail flight={flight} />
        </div>

        <div className={styles.farePanel}>
          <strong>{fare.totalFare}</strong>
          <button type="button" onClick={() => onSelect?.(item)}>
            {actionLabel}
          </button>
          <span>
            <div>
              {fare.pricePerAdult} <small>/ADULT</small>
            </div>
            <i />
            <em>{fare.cabinClass}</em>
          </span>
        </div>

        <button
          type="button"
          className={styles.detailsBtn}
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
        >
          See Details
          <svg
            className={isOpen ? styles.rotate : ""}
            width="8"
            height="5"
            viewBox="0 0 8 5"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M3.56 4.01 0.14 0.85A.49.49 0 0 1 .14.14.49.49 0 0 1 .84.14l2.72 2.72L6.28.14a.49.49 0 0 1 .7.7L3.98 3.84a.59.59 0 0 1-.42.17Z"
              fill="#000033"
            />
          </svg>
        </button>
      </div>

      <div className={`${styles.expandWrap} ${isOpen ? styles.open : ""}`}>
        <MultiTripExpendable flightId={flightId} />
      </div>
    </div>
  );
};

export default MultiCityFlightCard;
