"use client";

import React from "react";
import { resolveAirlineLogo } from "@/features/flights/utils/airlineLogos";
import styles from "./RoundTrip.module.css";

const formatSegmentDuration = (duration = {}) => {
  const hours = Number(duration.hours || 0);
  const minutes = Number(duration.minutes || 0);
  return `${hours ? `${hours} h ` : ""}${minutes} m`.trim() || "0 m";
};

export const CompactRoundTripCard = ({
  segment,
  priceLabel,
  selected,
  onSelect,
  onDetail,
}) => {
  const airline = segment?.airlines?.[0] || {};
  const logo = resolveAirlineLogo({
    name: airline.name,
    code: airline.code,
    logo: airline.logo,
  });

  return (
    <div
      role="button"
      tabIndex={0}
      className={`${styles.mobileSegmentCard} ${selected ? styles.mobileSegmentCardSelected : ""}`}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect();
        }
      }}
    >
      <div className={styles.mobileSegmentTop}>
        <div className={styles.mobileAirline}>
          <img src={logo} alt="" />
          <div>
            <p>{airline.name || "Airline"}</p>
            <span>{airline.code || ""}</span>
          </div>
        </div>
        <strong>{priceLabel || "N/A"}</strong>
      </div>
      <div className={styles.mobileSegmentTimes}>
        <span>{segment?.departure?.time || "--:--"}</span>
        <div className={styles.mobileSegmentMeta}>
          <span>{formatSegmentDuration(segment?.duration)}</span>
          <i />
          <small>{segment?.stops?.type || "Non-Stop"}</small>
        </div>
        <span>{segment?.arrival?.time || "--:--"}</span>
      </div>
      <button
        type="button"
        className={styles.mobileSeeDetailBtn}
        onClick={(event) => {
          event.stopPropagation();
          onDetail();
        }}
      >
        SEE DETAIL
      </button>
    </div>
  );
};

const FlightColumn = ({
  direction,
  routeLabel,
  dateLabel,
  flights,
  selectedId,
  getFareLabel,
  onSelect,
  onDetail,
}) => (
  <div className={styles.desktopSplitColumn}>
    <div className={styles.desktopSplitHeader}>
      <strong>{routeLabel}</strong>
      <span>{dateLabel}</span>
    </div>
    <div className={styles.desktopSplitSortHeader}>
      <span>DEPARTURE</span>
      <span>DURATION</span>
      <span>ARRIVAL</span>
      <span>PRICE</span>
    </div>
    {flights.map((flight, index) => (
      <CompactRoundTripCard
        key={`${direction}-${flight.id || index}`}
        segment={direction === "outbound" ? flight.outbound : flight.inbound}
        priceLabel={getFareLabel(flight, direction)}
        selected={selectedId === flight.id}
        onSelect={() => onSelect(flight)}
        onDetail={() => onDetail(flight)}
      />
    ))}
  </div>
);

const SplitRoundTripView = ({
  flights,
  outboundRouteLabel,
  inboundRouteLabel,
  outboundDateLabel,
  inboundDateLabel,
  selectedDepartId,
  selectedReturnId,
  selectedFlight,
  onSelectDepart,
  onSelectReturn,
  onDepartDetail,
  onReturnDetail,
  onBook,
  getFareLabel,
}) => (
  <>
    <div className={styles.desktopSplitResults}>
      <FlightColumn
        direction="outbound"
        routeLabel={outboundRouteLabel}
        dateLabel={outboundDateLabel}
        flights={flights}
        selectedId={selectedDepartId}
        getFareLabel={getFareLabel}
        onSelect={onSelectDepart}
        onDetail={onDepartDetail}
      />
      <FlightColumn
        direction="inbound"
        routeLabel={inboundRouteLabel}
        dateLabel={inboundDateLabel}
        flights={flights}
        selectedId={selectedReturnId}
        getFareLabel={getFareLabel}
        onSelect={onSelectReturn}
        onDetail={onReturnDetail}
      />
    </div>

    {selectedFlight && (
      <div className={styles.desktopBookingBar}>
        <div className={styles.desktopBookingLeg}>
          <span>DEPARTURE · {selectedFlight.outbound?.airlines?.[0]?.name || "Airline"}</span>
          <strong>
            {selectedFlight.outbound?.departure?.time || "--:--"} →{" "}
            {selectedFlight.outbound?.arrival?.time || "--:--"}
          </strong>
        </div>
        <div className={styles.desktopBookingLeg}>
          <span>RETURN · {selectedFlight.inbound?.airlines?.[0]?.name || "Airline"}</span>
          <strong>
            {selectedFlight.inbound?.departure?.time || "--:--"} →{" "}
            {selectedFlight.inbound?.arrival?.time || "--:--"}
          </strong>
        </div>
        <div className={styles.desktopBookingTotal}>
          <span>TOTAL AMOUNT</span>
          <strong>{selectedFlight.fare?.totalFare || "N/A"}</strong>
        </div>
        <button type="button" onClick={onBook}>BOOK NOW</button>
      </div>
    )}
  </>
);

export default SplitRoundTripView;
