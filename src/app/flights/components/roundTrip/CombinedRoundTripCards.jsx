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

const getLegIdentity = (leg = {}) => {
  const flight = leg?.flight || {};
  return [
    leg?.airline?.carrierCode,
    leg?.airline?.flightNo,
    leg?.airline?.code,
    flight?.departure?.airportCode,
    flight?.departure?.date,
    flight?.departure?.time,
    flight?.arrival?.airportCode,
    flight?.arrival?.date,
    flight?.arrival?.time,
  ]
    .map((value) => String(value ?? "").trim().toLowerCase())
    .join("|");
};

const groupByOnwardFlight = (items = []) => {
  const groups = new Map();

  items.forEach((item) => {
    const onwardId = getLegIdentity(item?.depart);
    const returnId = getLegIdentity(item?.return);
    const group = groups.get(onwardId) || {
      depart: item?.depart,
      returns: [],
      seenReturns: new Set(),
    };

    if (!group.seenReturns.has(returnId)) {
      group.seenReturns.add(returnId);
      group.returns.push(item);
    }
    groups.set(onwardId, group);
  });

  return [...groups.values()];
};

const FareAction = ({ item, onViewFares }) => (
  <div className={styles.groupedFare}>
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
);

const CombinedRoundTripCards = ({ tripCardsData = [], onViewFares }) => {
  const groupedFlights = groupByOnwardFlight(tripCardsData);
  const [selectedReturns, setSelectedReturns] = React.useState({});

  return (
    <div className={styles.cardPairent}>
      {groupedFlights.map((group, groupIndex) => {
        const onwardId =
          getLegIdentity(group.depart) || `onward-${groupIndex}`;
        const firstReturnId = getLegIdentity(group.returns[0]?.return);
        const selectedReturnId =
          selectedReturns[onwardId] || firstReturnId;

        return (
          <React.Fragment key={onwardId}>
          <article className={`${styles.card} ${styles.groupedFlightCard}`}>
            <div className={styles.groupedOnward}>
              <FlightLeg label="Depart" leg={group.depart} />
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

            <div className={styles.groupedReturnList}>
              {group.returns.map((item, returnIndex) => (
                <div
                  className={styles.groupedReturnRow}
                  key={item?.id || `${groupIndex}-${returnIndex}`}
                >
                  <label className={styles.groupedReturnChoice}>
                    <FlightLeg label="Return" leg={item.return} />
                    <input
                      type="radio"
                      className={styles.groupedReturnRadio}
                      name={`return-${onwardId}`}
                      value={getLegIdentity(item.return)}
                      checked={
                        selectedReturnId === getLegIdentity(item.return)
                      }
                      onChange={() =>
                        setSelectedReturns((current) => ({
                          ...current,
                          [onwardId]: getLegIdentity(item.return),
                        }))
                      }
                      aria-label={`Select return flight ${
                        item?.return?.airline?.code || returnIndex + 1
                      }`}
                    />
                  </label>
                  <FareAction item={item} onViewFares={onViewFares} />
                </div>
              ))}
            </div>
          </article>

          {groupIndex === 2 && groupedFlights.length > 3 && <OfferBanner />}
        </React.Fragment>
        );
      })}
    </div>
  );
};

export default CombinedRoundTripCards;
