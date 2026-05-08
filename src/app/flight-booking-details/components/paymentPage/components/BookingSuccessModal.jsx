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

const buildFlightMeta = (flight, header, fallback = {}) => ({
  date: pickFirst(header?.date, fallback?.date, "N/A"),
  airline: pickFirst(flight?.airline?.name, fallback?.airline, "N/A"),
  time: `${pickFirst(flight?.departure?.time, fallback?.departureTime, "N/A")}-${pickFirst(
    flight?.arrival?.time,
    fallback?.arrivalTime,
    "N/A"
  )}`,
  cabin: pickFirst(header?.cabinClass, flight?.travelClass, fallback?.cabin, "N/A"),
  stops: pickFirst(header?.stops, flight?.stops, fallback?.stops, "N/A"),
  duration: pickFirst(
    flight?.duration
      ? formatSummaryDuration(flight?.duration)
      : undefined,
    fallback?.duration,
    "N/A"
  ),
});

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
    const preferBookingViewRoute = Boolean(bookingView?.isRoundTrip);
    const retrieveBookingData =
      retrieveData?.data && typeof retrieveData.data === "object"
        ? retrieveData.data
        : retrieveData;
    const retrieveBookingRaw =
      retrieveData?.raw && typeof retrieveData.raw === "object"
        ? retrieveData.raw
        : {};
    const statusMeta =
      retrieveData?.status_meta ||
      retrieveData?.statusMeta ||
      retrieveBookingData?.status_meta ||
      retrieveBookingData?.statusMeta ||
      {};
    const paymentStatus = pickFirst(
      statusMeta?.payment_status,
      statusMeta?.paymentStatus,
      retrieveBookingData?.payment_status,
      retrieveData?.payment_status,
      ""
    );
    const bookingStatus = pickFirst(
      statusMeta?.booking_status,
      statusMeta?.bookingStatus,
      retrieveBookingData?.booking_status,
      retrieveData?.booking_status,
      ""
    );
    const hasFailedStatus = [paymentStatus, bookingStatus]
      .some((value) => String(value || "").toUpperCase() === "FAILED");
    const retrieveSsr = Array.isArray(retrieveBookingData?.SSR)
      ? retrieveBookingData.SSR
      : Array.isArray(retrieveBookingRaw?.SSR)
        ? retrieveBookingRaw.SSR
      : [];
    const baggageSsr = retrieveSsr.filter(
      (item) =>
        String(item?.Type || "").trim() === "2" &&
        String(item?.Code || "").trim().toUpperCase() !== "BAG"
    );
    const mealSsr = retrieveSsr.filter(
      (item) => String(item?.Type || "").trim() === "1"
    );
    const routeFrom = pickFirst(
      preferBookingViewRoute ? bookingView?.header?.fromCode : undefined,
      retrieveBookingData?.from,
      retrieveBookingData?.origin,
      retrieveData?.from,
      retrieveData?.origin,
      bookingView?.departureFlight?.departure?.airport
    );
    const routeTo = pickFirst(
      preferBookingViewRoute ? bookingView?.header?.toCode : undefined,
      retrieveBookingData?.to,
      retrieveBookingData?.destination,
      retrieveData?.to,
      retrieveData?.destination,
      bookingView?.departureFlight?.arrival?.airport
    );
    const routeFromName = pickFirst(
      preferBookingViewRoute ? bookingView?.header?.fromName : undefined,
      retrieveBookingData?.from_name,
      retrieveBookingData?.fromName,
      retrieveData?.from_name,
      retrieveData?.fromName,
      bookingView?.departureFlight?.departure?.city
    );
    const routeToName = pickFirst(
      preferBookingViewRoute ? bookingView?.header?.toName : undefined,
      retrieveBookingData?.to_name,
      retrieveBookingData?.toName,
      retrieveData?.to_name,
      retrieveData?.toName,
      bookingView?.departureFlight?.arrival?.city
    );

    return {
      heading: hasFailedStatus ? "Booking Failed" : "Booking Success",
      title: pickFirst(
        retrieveData?.message,
        startData?.message,
        createData?.message,
        "Payment session started successfully"
      ),
      status: pickFirst(
        bookingStatus,
        paymentStatus,
        retrieveBookingData?.status,
        retrieveBookingData?.payment_status,
        retrieveData?.status,
        retrieveData?.payment_status,
        startData?.message,
        startData?.status,
        "SUCCESS"
      ),
      hasFailedStatus,
      statusMeta: {
        paymentStatus,
        bookingStatus,
        akbarStatusCode: pickFirst(
          statusMeta?.akbar_status_code,
          statusMeta?.akbarStatusCode,
          ""
        ),
        akbarStatusLabel: pickFirst(
          statusMeta?.akbar_status_label,
          statusMeta?.akbarStatusLabel,
          ""
        ),
        akbarStatusCodes: Array.isArray(statusMeta?.akbar_status_codes)
          ? statusMeta.akbar_status_codes
          : Array.isArray(statusMeta?.akbarStatusCodes)
            ? statusMeta.akbarStatusCodes
            : [],
      },
      // transactionId: pickFirst(
      //   startData?.TransactionID,
      //   createData?.TransactionID,
      //   startData?.transactionId,
      //   createData?.transactionId
      // ),
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
      passengers: Array.isArray(retrieveBookingData?.passengers)
        ? retrieveBookingData.passengers
        : Array.isArray(retrieveData?.passengers)
          ? retrieveData.passengers
          : [],
      ssrItems: retrieveSsr,
      baggageItems: baggageSsr,
      mealItems: mealSsr,
      baggage: pickFirst(
        retrieveBookingData?.baggage,
        retrieveData?.baggage,
        ""
      ),
      meals: pickFirst(
        retrieveBookingData?.meals,
        retrieveData?.meals,
        ""
      ),
      route: {
        from: formatAirportLabel(routeFrom, routeFromName),
        to: formatAirportLabel(routeTo, routeToName),
      },
      returnRoute: bookingView?.returnFlight
        ? {
            from: formatAirportLabel(
              parseInt(String(bookingView?.returnFlight?.departure?.airport || "").split("-")[0], 10)
                ? undefined
                : String(bookingView?.returnFlight?.departure?.airport || "")
                    .split("-")[0]
                    ?.trim(),
              bookingView?.returnFlight?.departure?.city
            ),
            to: formatAirportLabel(
              parseInt(String(bookingView?.returnFlight?.arrival?.airport || "").split("-")[0], 10)
                ? undefined
                : String(bookingView?.returnFlight?.arrival?.airport || "")
                    .split("-")[0]
                    ?.trim(),
              bookingView?.returnFlight?.arrival?.city
            ),
          }
        : null,
      meta: {
        date: pickFirst(
          preferBookingViewRoute ? bookingView?.header?.date : undefined,
          formatDate(retrieveBookingData?.departure),
          formatDate(retrieveData?.departure),
          "N/A"
        ),
        airline: pickFirst(
          preferBookingViewRoute
            ? bookingView?.departureFlight?.airline?.name
            : undefined,
          retrieveBookingData?.airline,
          retrieveData?.airline,
          "N/A"
        ),
        time: `${formatTime(
          pickFirst(
            preferBookingViewRoute
              ? bookingView?.departureFlight?.departure?.time
              : undefined,
            retrieveBookingData?.departure,
            retrieveData?.departure,
          )
        )}-${formatTime(
          pickFirst(
            preferBookingViewRoute
              ? bookingView?.departureFlight?.arrival?.time
              : undefined,
            retrieveBookingData?.arrival,
            retrieveData?.arrival,
          )
        )}`,
        cabin: pickFirst(
          preferBookingViewRoute ? bookingView?.header?.cabinClass : undefined,
          retrieveBookingData?.cabin,
          retrieveData?.cabin,
          "N/A"
        ),
        stops: pickFirst(
          preferBookingViewRoute ? bookingView?.header?.stops : undefined,
          retrieveBookingData?.stops,
          retrieveData?.stops,
          "N/A"
        ),
        duration: pickFirst(
          preferBookingViewRoute
            ? formatSummaryDuration(bookingView?.departureFlight?.duration)
            : undefined,
          retrieveBookingData?.duration,
          retrieveData?.duration,
          "N/A"
        ),
      },
      returnMeta: bookingView?.returnFlight
        ? buildFlightMeta(bookingView?.returnFlight, {
            date: bookingView?.returnFlight?.departure?.date,
            cabinClass: bookingView?.returnFlight?.travelClass,
            stops: bookingView?.returnFlight?.stops,
          })
        : null,
    };
  }, [paymentSuccessData, bookingView]);

  if (!mounted || !isOpen) return null;

  const summaryFlight = bookingView?.departureFlight || null;
  const returnFlight = bookingView?.returnFlight || null;
  const showReturnCard = Boolean(bookingView?.isRoundTrip && returnFlight);
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
    (Array.isArray(details.baggageItems) && details.baggageItems.length > 0
      ? details.baggageItems
          .map((item) => item?.Description || item?.description || item?.Code)
          .filter(Boolean)
          .join(", ")
      : "") ||
    details.baggage ||
    (Array.isArray(baggage) && baggage.length > 0
      ? baggage.map((item) => item?.weight || item?.name).filter(Boolean).join(", ")
      : "Included");
  const mealsText =
    (Array.isArray(details.mealItems) && details.mealItems.length > 0
      ? details.mealItems
          .map((item) => item?.Description || item?.description || item?.Code)
          .filter(Boolean)
          .join(", ")
      : "") ||
    details.meals ||
    (Array.isArray(meals) && meals.length > 0
      ? meals.map((item) => item?.name || item?.mealName).filter(Boolean).join(", ")
      : "Included");
  const ssrItems = Array.isArray(details.ssrItems) ? details.ssrItems : [];

  return createPortal(
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(event) => event.stopPropagation()}>
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>{details.heading}</h2>
            <p className={styles.subtitle}>{details.title}</p>
            <p
              className={`${styles.status} ${
                details.hasFailedStatus ? styles.statusFailed : ""
              }`}
            >
              {details.status}
            </p>
          </div>
          <button className={styles.closeButton} onClick={onClose} type="button">
            ×
          </button>
        </div>

        {details.statusMeta?.paymentStatus ||
        details.statusMeta?.bookingStatus ||
        details.statusMeta?.akbarStatusCode ||
        details.statusMeta?.akbarStatusLabel ||
        details.statusMeta?.akbarStatusCodes?.length ? (
          <div className={styles.statusPanel}>
            <div className={styles.statusGrid}>
              {details.statusMeta.paymentStatus ? (
                <div className={styles.statusItem}>
                  <span className={styles.statusLabel}>Payment Status</span>
                  <span className={styles.statusValue}>
                    {details.statusMeta.paymentStatus}
                  </span>
                </div>
              ) : null}
              {details.statusMeta.bookingStatus ? (
                <div className={styles.statusItem}>
                  <span className={styles.statusLabel}>Booking Status</span>
                  <span className={styles.statusValue}>
                    {details.statusMeta.bookingStatus}
                  </span>
                </div>
              ) : null}
              {details.statusMeta.akbarStatusCode ? (
                <div className={styles.statusItem}>
                  <span className={styles.statusLabel}>Akbar Status Code</span>
                  <span className={styles.statusValue}>
                    {details.statusMeta.akbarStatusCode}
                  </span>
                </div>
              ) : null}
            </div>
            {details.statusMeta.akbarStatusLabel ? (
              <p className={styles.statusMessage}>
                {details.statusMeta.akbarStatusLabel}
              </p>
            ) : null}
            {details.statusMeta.akbarStatusCodes?.length ? (
              <p className={styles.statusCodes}>
                Codes: {details.statusMeta.akbarStatusCodes.join(", ")}
              </p>
            ) : null}
          </div>
        ) : null}

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

        {showReturnCard ? (
          <div className={styles.card}>
            <div className={styles.logoWrap}>
              <img
                src={returnFlight?.airline?.logo || "/images/Flight.png"}
                alt=""
                className={styles.logo}
              />
            </div>

            <div className={styles.content}>
              <div className={styles.route}>
                {formatAirportLabel(
                  String(returnFlight?.departure?.airport || "").split("-")[0]?.trim(),
                  returnFlight?.departure?.city
                )}{" "}
                →{" "}
                {formatAirportLabel(
                  String(returnFlight?.arrival?.airport || "").split("-")[0]?.trim(),
                  returnFlight?.arrival?.city
                )}
              </div>
              <div className={styles.meta}>
                <span>{details.returnMeta?.date || "N/A"}</span>
                <span className={styles.dot}>•</span>
                <span>{details.returnMeta?.airline || "N/A"}</span>
                <span className={styles.dot}>•</span>
                <span>{details.returnMeta?.time || "N/A"}</span>
                <span className={styles.dot}>•</span>
                <span>{details.returnMeta?.cabin || "N/A"}</span>
                <span className={styles.dot}>•</span>
                <span>{details.returnMeta?.stops || "N/A"}</span>
                <span className={styles.dot}>•</span>
                <span>{details.returnMeta?.duration || "N/A"}</span>
              </div>
            </div>
          </div>
        ) : null}

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

        <div className={styles.detailSection}>
          <h3 className={styles.sectionTitle}>SSR Details</h3>
          <div className={styles.detailList}>
            {ssrItems.length > 0 ? (
              ssrItems.map((item, index) => (
                <div key={`${item?.FUID || "na"}-${item?.PaxId || "na"}-${item?.Code || "na"}-${index}`} className={styles.detailRow}>
                  <span className={styles.detailPrimary}>
                    {item?.Description || item?.Code || "N/A"}
                  </span>
                  <span className={styles.detailSecondary}>
                    Code: {item?.Code || "N/A"} | Type: {item?.Type || "N/A"} | Passenger ID: {item?.PaxId || "N/A"} | Charge: ₹{Number(item?.Charge || 0).toLocaleString()}
                  </span>
                </div>
              ))
            ) : (
              <div className={styles.detailRow}>
                <span className={styles.detailPrimary}>No SSR details</span>
              </div>
            )}
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
