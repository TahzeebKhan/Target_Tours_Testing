"use client";

import { createPortal } from "react-dom";
import { useEffect, useMemo, useState } from "react";
import styles from "./BookingSuccessModal.module.css";

const pickFirst = (...values) => {
  for (const value of values) {
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return "";
};

const formatSummaryDuration = (duration = {}) =>
  `${duration.hours || "00"}h ${duration.minutes || "00"}m`;

const formatTime = (value) => {
  if (!value) return "N/A";
  const date = new Date(value);
  if (!Number.isNaN(date.getTime())) {
    return date.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  }
  return String(value || "N/A");
};

const formatDate = (value) => {
  if (!value) return "N/A";
  const date = new Date(value);
  if (!Number.isNaN(date.getTime())) {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      day: "2-digit",
      month: "short",
    });
  }
  return String(value || "N/A");
};

const formatAirportLabel = (code, city) => {
  const normalizedCode = String(code || "N/A").trim().toUpperCase();
  const normalizedCity = String(city || "N/A").trim();
  return `${normalizedCity} (${normalizedCode})`;
};

export default function BookingSuccessModal({
  isOpen,
  onClose,
  bookingView,
  paymentSuccessData,
  prices,
  travelerDetails,
  bookingContactDetails,
  baggage,
  meals,
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const details = useMemo(() => {
    const createData = paymentSuccessData?.createItinerary || {};
    const startData = paymentSuccessData?.startPayment || {};
    const retrieveData = paymentSuccessData?.retrieveBooking || {};
    const routeFrom = pickFirst(
      retrieveData?.from,
      retrieveData?.origin,
      bookingView?.header?.fromCode
    );
    const routeTo = pickFirst(
      retrieveData?.to,
      retrieveData?.destination,
      bookingView?.header?.toCode
    );
    const routeFromName = pickFirst(
      retrieveData?.from_name,
      retrieveData?.fromName,
      bookingView?.header?.fromName
    );
    const routeToName = pickFirst(
      retrieveData?.to_name,
      retrieveData?.toName,
      bookingView?.header?.toName
    );

    return {
      title: pickFirst(
        retrieveData?.message,
        startData?.message,
        createData?.message,
        "Payment session started successfully"
      ),
      status: pickFirst(
        retrieveData?.status,
        retrieveData?.payment_status,
        startData?.message,
        startData?.status,
        "SUCCESS"
      ),
      transactionId: pickFirst(
        startData?.TransactionID,
        createData?.TransactionID,
        startData?.transactionId,
        createData?.transactionId
      ),
      bookingId: pickFirst(
        createData?.BookingID,
        createData?.bookingId,
        startData?.BookingID,
        startData?.bookingId
      ),
      paymentUrl: pickFirst(
        startData?.PaymentURL,
        startData?.paymentUrl,
        startData?.redirect_url,
        startData?.redirectUrl,
        startData?.url
      ),
      passengers: Array.isArray(retrieveData?.passengers) ? retrieveData.passengers : [],
      baggage: pickFirst(retrieveData?.baggage, ""),
      meals: pickFirst(retrieveData?.meals, ""),
      route: {
        from: formatAirportLabel(routeFrom, routeFromName),
        to: formatAirportLabel(routeTo, routeToName),
      },
      meta: {
        date: pickFirst(
          formatDate(retrieveData?.departure),
          bookingView?.header?.date,
          "N/A"
        ),
        airline: pickFirst(
          retrieveData?.airline,
          bookingView?.departureFlight?.airline?.name,
          "N/A"
        ),
        time: `${formatTime(
          pickFirst(retrieveData?.departure, bookingView?.departureFlight?.departure?.time)
        )}-${formatTime(
          pickFirst(retrieveData?.arrival, bookingView?.departureFlight?.arrival?.time)
        )}`,
        cabin: pickFirst(
          retrieveData?.cabin,
          bookingView?.header?.cabinClass,
          "N/A"
        ),
        stops: pickFirst(
          retrieveData?.stops,
          bookingView?.header?.stops,
          "N/A"
        ),
        duration: pickFirst(
          retrieveData?.duration,
          formatSummaryDuration(bookingView?.departureFlight?.duration),
          "N/A"
        ),
      },
    };
  }, [paymentSuccessData, bookingView]);

  if (!mounted || !isOpen) return null;

  const summaryFlight = bookingView?.departureFlight || null;
  const travelerFallbacks = Array.isArray(travelerDetails) ? travelerDetails : [];
  const passengerList =
    details.passengers.length > 0
      ? details.passengers.map((passenger, index) => {
          const traveler = travelerFallbacks[index] || {};
          return {
            id: `${passenger?.name || "passenger"}-${index}`,
            name:
              passenger?.name ||
              `${traveler?.Title || ""} ${traveler?.FName || ""} ${traveler?.LName || ""}`
                .replace(/\s+/g, " ")
                .trim() ||
              "N/A",
            type: passenger?.type || traveler?.PTC || "N/A",
            gender:
              passenger?.gender ||
              (traveler?.Gender === "M"
                ? "MALE"
                : traveler?.Gender === "F"
                  ? "FEMALE"
                  : traveler?.Gender) ||
              "N/A",
            email:
              passenger?.email ||
              traveler?.Email ||
              bookingContactDetails?.Email ||
              "N/A",
            contact:
              passenger?.mobile ||
              passenger?.contact ||
              traveler?.MobileNumber ||
              bookingContactDetails?.MobileNumber ||
              "N/A",
          };
        })
      : (Array.isArray(travelerDetails) ? travelerDetails : []).map((traveler, index) => ({
          id: `${traveler?.FName || "traveler"}-${index}`,
          name: `${traveler?.Title || ""} ${traveler?.FName || ""} ${traveler?.LName || ""}`.replace(/\s+/g, " ").trim() || "N/A",
          type: traveler?.PTC || "N/A",
          gender:
            traveler?.Gender === "M"
              ? "MALE"
              : traveler?.Gender === "F"
                ? "FEMALE"
                : traveler?.Gender || "N/A",
          email: traveler?.Email || bookingContactDetails?.Email || "N/A",
          contact: traveler?.MobileNumber || bookingContactDetails?.MobileNumber || "N/A",
        }));
  const baggageText =
    details.baggage ||
    (Array.isArray(baggage) && baggage.length > 0
      ? baggage.map((item) => item?.weight || item?.name).filter(Boolean).join(", ")
      : "Included");
  const mealsText =
    details.meals ||
    (Array.isArray(meals) && meals.length > 0
      ? meals.map((item) => item?.name || item?.mealName).filter(Boolean).join(", ")
      : "Included");

  return createPortal(
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(event) => event.stopPropagation()}>
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>Booking Success</h2>
            <p className={styles.subtitle}>{details.title}</p>
            <p className={styles.status}>{details.status}</p>
          </div>
          <button className={styles.closeButton} onClick={onClose} type="button">
            ×
          </button>
        </div>

        <div className={styles.card}>
          <div className={styles.logoWrap}>
            <img
              src={summaryFlight?.airline?.logo || "/images/Flight.png"}
              alt=""
              className={styles.logo}
            />
          </div>

          <div className={styles.content}>
            <div className={styles.route}>
              {details.route.from} → {details.route.to}
            </div>
            <div className={styles.meta}>
              <span>{details.meta.date}</span>
              <span className={styles.dot}>•</span>
              <span>{details.meta.airline}</span>
              <span className={styles.dot}>•</span>
              <span>{details.meta.time}</span>
              <span className={styles.dot}>•</span>
              <span>{details.meta.cabin}</span>
              <span className={styles.dot}>•</span>
              <span>{details.meta.stops}</span>
              <span className={styles.dot}>•</span>
              <span>{details.meta.duration}</span>
            </div>
          </div>
        </div>

        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Total Amount</span>
            <span className={styles.infoValue}>₹ {Number(prices?.total || 0).toLocaleString()}</span>
          </div>
          {details.transactionId ? (
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Transaction ID</span>
              <span className={styles.infoValue}>{details.transactionId}</span>
            </div>
          ) : null}
          {details.bookingId ? (
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Booking ID</span>
              <span className={styles.infoValue}>{details.bookingId}</span>
            </div>
          ) : null}
        </div>

        <div className={styles.detailSection}>
          <h3 className={styles.sectionTitle}>Passengers</h3>
          <div className={styles.table}>
            <div className={`${styles.tableRow} ${styles.tableHeader}`}>
              <span>NAME</span>
              <span>GENDER</span>
              <span>EMAIL</span>
              <span>CONTACT NUMBER</span>
            </div>

            {passengerList.map((passenger) => (
              <div key={passenger.id} className={styles.tableRow}>
                <span>{`${passenger.name} (${passenger.type})`.trim()}</span>
                <span>{passenger.gender}</span>
                <span>{passenger.email}</span>
                <span>{passenger.contact}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.detailSection}>
          <h3 className={styles.sectionTitle}>Baggage</h3>
          <div className={styles.detailList}>
            <div className={styles.detailRow}>
              <span className={styles.detailPrimary}>{baggageText}</span>
            </div>
          </div>
        </div>

        <div className={styles.detailSection}>
          <h3 className={styles.sectionTitle}>Meals</h3>
          <div className={styles.detailList}>
            <div className={styles.detailRow}>
              <span className={styles.detailPrimary}>{mealsText}</span>
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          {details.paymentUrl ? (
            <a className={styles.primaryButton} href={details.paymentUrl} target="_blank" rel="noreferrer">
              Continue to Payment
            </a>
          ) : (
            <button className={styles.primaryButton} type="button" onClick={onClose}>
              Done
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
