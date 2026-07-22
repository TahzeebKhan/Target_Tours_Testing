import React from "react";
import { useFlightSearchParams } from "../../../hooks/useFlightSearchParams";
import styles from "./FlightFare.module.css";

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  maximumFractionDigits: 0,
});

const parseNumber = (...values) => {
  for (const value of values) {
    if (value === undefined || value === null || value === "") continue;

    const normalizedText =
      typeof value === "string" ? value.replace(/[^\d.-]/g, "") : null;
    if (typeof value === "string" && !normalizedText) continue;

    const number =
      typeof value === "string" ? Number(normalizedText) : Number(value);
    if (Number.isFinite(number)) return number;
  }

  return null;
};

const formatCurrency = (value) => {
  const number = parseNumber(value);
  if (number === null) return "-";

  return `₹ ${currencyFormatter.format(number)}`;
};

const parseCityLabel = (value = "") => {
  const text = String(value || "").trim();
  const match = text.match(/^(.*)\(([^)]+)\)$/);

  return {
    city: (match ? match[1] : text).trim() || "-",
    code: (match ? match[2] : "").trim(),
  };
};

const formatDate = (value) => {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value).toUpperCase();

  return date
    .toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "2-digit",
    })
    .replace(",", "")
    .toUpperCase();
};

const getPassengerSummary = (searchParams) => {
  const adults = Math.max(Number(searchParams?.get("adults") || 1), 0);
  const children = Math.max(Number(searchParams?.get("children") || 0), 0);
  const infants = Math.max(Number(searchParams?.get("infants") || 0), 0);
  const parts = [
    adults > 0 ? `${adults} x Adult${adults > 1 ? "s" : ""}` : null,
    children > 0 ? `${children} x Child${children > 1 ? "ren" : ""}` : null,
    infants > 0 ? `${infants} x Infant${infants > 1 ? "s" : ""}` : null,
  ].filter(Boolean);

  return parts.join(", ") || "1 x Adult";
};

const getTripAmount = (flightData, tripIndex) => {
  const trip = flightData?.booking?.priceRequest?.Trips?.[tripIndex] || {};
  const totalFare = parseNumber(flightData?.fare?.totalFare);

  return parseNumber(
    trip?.Amount,
    trip?.amount,
    tripIndex === 0 ? flightData?.outbound?.booking?.amount : null,
    tripIndex === 1 ? flightData?.inbound?.booking?.amount : null,
    totalFare !== null ? Math.round(totalFare / 2) : null
  );
};

const getTaxAmount = (flightData, tripAmount) => {
  const totalTax = parseNumber(flightData?.fare?.tax);
  const totalFare = parseNumber(flightData?.fare?.totalFare);

  if (totalTax === null) return null;
  if (totalFare === null || !tripAmount) return Math.round(totalTax / 2);

  return Math.round(totalTax * (tripAmount / totalFare));
};

const FlightFare = ({ flightData = null, leg = null, tripIndex = 0 }) => {
  const searchParams = useFlightSearchParams();
  const departure = parseCityLabel(leg?.flight?.departure?.city);
  const arrival = parseCityLabel(leg?.flight?.arrival?.city);
  const tripAmount = getTripAmount(flightData, tripIndex);
  const taxAmount = getTaxAmount(flightData, tripAmount);
  const feeAndSurcharge = taxAmount === null ? tripAmount : tripAmount + taxAmount;

  return (
    <div className={`${styles.tabContentFareDetails} ${styles.fadeIn}`}>
      <div className={styles.header}>
        {departure.city} <img src="/icons/whitePlane.svg" alt="" /> {arrival.city},{" "}
        <span>{formatDate(leg?.date)}</span>
      </div>
      <div className={styles.body}>
        <div className={styles.row}>
          <span className={styles.label}>{getPassengerSummary(searchParams)}</span>
          <span className={styles.amount}>{formatCurrency(tripAmount)}</span>
        </div>

        <div className={styles.row}>
          <span className={styles.label}>Total (Base Fare)</span>
          <span className={styles.bold}>{formatCurrency(tripAmount)}</span>
        </div>

        <div className={styles.row}>
          <span className={styles.label}>Total Tax</span>
          <span className={styles.bold}>{formatCurrency(taxAmount)}</span>
        </div>

        <div className={styles.row}>
          <span className={styles.label}>Total (Fee &amp; Surcharge)</span>
          <span className={styles.bold}>{formatCurrency(feeAndSurcharge)}</span>
        </div>
      </div>
    </div>
  );
};

export default FlightFare;
