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

const parseAmount = (value) => {
  const normalized = String(value ?? "").replace(/[^\d.]/g, "");
  if (!normalized) return null;

  const amount = Number(normalized);
  return Number.isFinite(amount) ? amount : null;
};

const getLegAmount = (item, type) => {
  const isDepart = type === "depart";
  const tripIndex = isDepart ? 0 : 1;
  const leg = isDepart ? item?.depart : item?.return;

  return (
    parseAmount(leg?.flight?.fare?.displayAmount) ??
    parseAmount(item?.booking?.priceRequest?.Trips?.[tripIndex]?.Amount) ??
    (!isDepart
      ? parseAmount(item?.booking?.priceRequest?.Trips?.[0]?.Amount)
      : null) ??
    parseAmount(leg?.flight?.fare?.totalFare) ??
    parseAmount(item?.fare?.pricePerAdult) ??
    Number.MAX_SAFE_INTEGER
  );
};

const formatCurrency = (amount) =>
  `₹ ${new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(amount)}`;

const getUniqueLegItems = (items, type) => {
  const seen = new Set();

  return items.filter((item) => {
    const identity = getLegIdentity(
      type === "depart" ? item?.depart : item?.return,
    );
    if (seen.has(identity)) return false;
    seen.add(identity);
    return true;
  });
};

const buildRankedPairs = (items = []) => {
  const departItems = getUniqueLegItems(items, "depart").sort(
    (left, right) =>
      getLegAmount(left, "depart") - getLegAmount(right, "depart"),
  );
  const returnItems = getUniqueLegItems(items, "return").sort(
    (left, right) =>
      getLegAmount(left, "return") - getLegAmount(right, "return"),
  );
  const pairCount = Math.min(departItems.length, returnItems.length);

  return Array.from({ length: pairCount }, (_, index) => {
    const departItem = departItems[index];
    const returnItem = returnItems[index];
    const departAmount = getLegAmount(departItem, "depart");
    const returnAmount = getLegAmount(returnItem, "return");
    const hasSegmentAmounts =
      departAmount !== Number.MAX_SAFE_INTEGER &&
      returnAmount !== Number.MAX_SAFE_INTEGER;
    const totalAmount = hasSegmentAmounts
      ? departAmount + returnAmount
      : parseAmount(departItem?.fare?.totalFare);
    const departTrip = departItem?.booking?.priceRequest?.Trips?.[0];
    const returnTrip =
      returnItem?.booking?.priceRequest?.Trips?.[1] ||
      returnItem?.booking?.priceRequest?.Trips?.[0];
    const departPriceRequest = departItem?.booking?.priceRequest || {};
    const returnPriceRequest = returnItem?.booking?.priceRequest || {};
    const cabinClass =
      departItem?.fare?.cabinClass ||
      returnItem?.fare?.cabinClass ||
      "E";
    const searchKeys = [
      {
        search_key:
          departPriceRequest?.search_key ||
          departItem?.booking?.searchKey,
        flight_no:
          departTrip?.flight_no ||
          departTrip?.FlightNumber ||
          departItem?.depart?.airline?.flightNo ||
          departItem?.depart?.airline?.code,
        cabin_class: cabinClass,
      },
      {
        search_key:
          returnPriceRequest?.search_key ||
          returnItem?.booking?.searchKey,
        flight_no:
          returnTrip?.flight_no ||
          returnTrip?.FlightNumber ||
          returnItem?.return?.airline?.flightNo ||
          returnItem?.return?.airline?.code,
        cabin_class: cabinClass,
      },
    ].filter((entry) => entry.search_key && entry.flight_no);

    return {
      ...departItem,
      id: `ranked-${departItem?.id || index}-${returnItem?.id || index}`,
      rankedPairSourceIds: {
        depart: departItem?.id,
        return: returnItem?.id,
      },
      return: returnItem?.return,
      fare: {
        ...(departItem?.fare || {}),
        ...(Number.isFinite(totalAmount)
          ? {
              totalFare: formatCurrency(totalAmount),
              pricePerAdult: formatCurrency(totalAmount),
            }
          : {}),
      },
      booking: {
        ...(departItem?.booking || {}),
        priceRequest: {
          ...departPriceRequest,
          Trips: [departTrip, returnTrip].filter(Boolean),
          search_keys: searchKeys,
        },
      },
    };
  });
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
  const rankedPairs = React.useMemo(
    () => buildRankedPairs(tripCardsData),
    [tripCardsData],
  );

  return (
    <div className={styles.cardPairent}>
      {rankedPairs.map((item, pairIndex) => (
        <React.Fragment key={item.id}>
          <article className={`${styles.card} ${styles.groupedFlightCard}`}>
            <div className={styles.groupedOnward}>
              <FlightLeg label="Depart" leg={item.depart} />
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
              <div className={styles.groupedReturnRow}>
                <div className={styles.groupedReturnChoice}>
                  <FlightLeg label="Return" leg={item.return} />
                  <input
                    type="radio"
                    className={styles.groupedReturnRadio}
                    checked
                    readOnly
                    tabIndex={-1}
                    aria-label="Return flight paired by price"
                  />
                </div>
                <FareAction item={item} onViewFares={onViewFares} />
              </div>
            </div>
          </article>

          {pairIndex === 2 && rankedPairs.length > 3 && <OfferBanner />}
        </React.Fragment>
      ))}
    </div>
  );
};

export default CombinedRoundTripCards;
