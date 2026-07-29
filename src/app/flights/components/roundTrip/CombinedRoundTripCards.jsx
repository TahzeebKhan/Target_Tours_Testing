"use client";

import React from "react";
import FlightTimingDetail from "../flightTimingDetails/FlightTimingDetail";
import OfferBanner from "../offerComponent/OfferBanner";
import { resolveAirlineLogo } from "@/features/flights/utils/airlineLogos";
import styles from "./tripCard/TripCard.module.css";

const FlightLeg = ({ label, leg }) => (
  <div className={label === "Depart" ? styles.departContainer : styles.returnContainer}>
    <div className={styles.HeadingCont}>
      <img
        src={resolveAirlineLogo(leg?.airline || {})}
        alt={leg?.airline?.name || "Airline"}
      />
      <h3 className={styles.ariLineName}>
        {leg?.airline?.name || "Airline"}
        {leg?.airline?.code && (
          <span className={styles.ariLineNumber}> ({leg.airline.code})</span>
        )}
      </h3>
    </div>
    <div className={styles.departureDetails}>
      <div className={styles.departTextHeading}>
        <h3>{label}</h3>
        <span>{leg?.date || ""}</span>
      </div>
      <div className={styles.departTimeContainer}>
        <FlightTimingDetail flight={leg?.flight || {}} />
      </div>
    </div>
  </div>
);

const CombinedRoundTripCards = ({ tripCardsData = [], onViewFares }) => (
  <div className={styles.cardPairent}>
    {tripCardsData.map((item, index) => (
      <React.Fragment key={item.id || index}>
        <article className={styles.card}>
          <div className={styles.cardLeftMainCont}>
            <div className={styles.cardLeft}>
              <FlightLeg label="Depart" leg={item.depart} />
              <FlightLeg label="Return" leg={item.return} />
            </div>
            <button type="button" className={styles.seeDetailsBtn}>
              See Details
              <svg width="8" height="5" viewBox="0 0 8 5" aria-hidden="true">
                <path
                  d="M.142.847 3.56 4.014 6.978.145"
                  fill="none"
                  stroke="#000033"
                />
              </svg>
            </button>
          </div>

          <div className={styles.cardRight}>
            <div className={styles.fareDetails}>
              <div className={styles.totalFare}>
                <span className={styles.fareText}>
                  {item?.fare?.totalFare || "N/A"}
                </span>
                <button
                  type="button"
                  className={styles.viewBtn}
                  onClick={() => onViewFares?.(item)}
                >
                  VIEW FARES
                </button>
              </div>
              <div className={styles.fareAmount}>
                <span className={styles.fare}>
                  {item?.fare?.pricePerAdult || "N/A"}
                  <span className={styles.adult}> /ADULT</span>
                </span>
                <div className={styles.dot} />
                <span className={styles.economy}>
                  {item?.fare?.cabinClass || "ECONOMY"}
                </span>
              </div>
            </div>
          </div>
        </article>

        {index === 2 && tripCardsData.length > 3 && <OfferBanner />}
      </React.Fragment>
    ))}
  </div>
);

export default CombinedRoundTripCards;
