"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Cookies from "js-cookie";
import styles from "./FlightBookingDetails.module.css";
import CancelBookingModal from "./CancelBookingModal";

const first = (...values) =>
  values.find((value) => value !== undefined && value !== null && value !== "");

const asArray = (value) => (Array.isArray(value) ? value : value ? [value] : []);

const unwrap = (response) => {
  if (
    response?.data &&
    typeof response.data === "object" &&
    !Array.isArray(response.data) &&
    (response.data.booking_id || response.data.journeys || response.data.route)
  ) {
    return response.data;
  }
  let value = response;
  for (let index = 0; index < 4; index += 1) {
    if (!value || typeof value !== "object" || Array.isArray(value)) break;
    if (value.booking_id || value.journeys || value.passengers || value.pricing) break;
    value = value.data || value.result || value.booking || value;
  }
  return value && typeof value === "object" ? value : {};
};

const money = (value) => {
  const amount = Number(value);
  return Number.isFinite(amount)
    ? `₹ ${amount.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`
    : "—";
};

const parseDate = (value) => {
  const date = value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime()) ? date : null;
};

const dateLabel = (value) =>
  parseDate(value)?.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  }) || "—";

const datePart = (value, part) => {
  const date = parseDate(value);
  if (!date) return "—";
  return part === "day"
    ? String(date.getDate()).padStart(2, "0")
    : date.toLocaleDateString("en-IN", { month: "long" });
};

const timeLabel = (value) => {
  const date = parseDate(value);
  return date
    ? date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false })
    : "—";
};

const airportParts = (name, code) => {
  const parts = String(name || "").split("|").map((part) => part.trim()).filter(Boolean);
  return {
    city: first(parts.at(-1), code, "Airport"),
    airport: first(parts[0], code, "Airport"),
  };
};

const segmentFromJourney = (journey) =>
  asArray(first(journey?.segments, journey?.Segments, journey?.flights, journey?.Flights))[0] || journey || {};

const normalizeBooking = (response, fallbackId) => {
  const root = response && typeof response === "object" ? response : {};
  const data = unwrap(root);
  const booking = data.booking && typeof data.booking === "object" ? data.booking : {};
  const raw = first(data.raw, root.raw, {});
  const journeys = asArray(first(data.journeys, booking.journeys, root.journeys, raw?.journeys));
  const segments = journeys.map(segmentFromJourney).filter(Boolean);
  if (!segments.length) {
    segments.push(...asArray(first(data.segments, booking.segments, raw?.segments)));
  }
  const firstSegment = segments[0] || {};
  const lastSegment = segments.at(-1) || firstSegment;
  const pricing = first(data.pricing, booking.pricing, root.pricing, firstSegment.pricing, {});
  const statusObject = data.status && typeof data.status === "object" ? data.status : {};
  const statusMeta = root.status_meta && typeof root.status_meta === "object" ? root.status_meta : {};
  const passengers = asArray(first(data.passengers, booking.passengers, root.passengers, raw?.passengers));
  const baggage = asArray(first(data.baggage, booking.baggage, root.baggage));
  const meals = asArray(first(data.meals, data.meal, booking.meals, root.meals));
  const seats = asArray(first(data.seats, data.seat, booking.seats, root.seats));

  return {
    bookingId: first(data.booking_id, booking.booking_id, root.booking_id, fallbackId, "N/A"),
    pnr: first(data.pnr, booking.pnr, root.pnr, firstSegment.pnr, "N/A"),
    status: String(first(statusObject.booking_status, statusMeta.booking_status, data.booking_status, booking.booking_status, typeof data.status === "string" ? data.status : "", "CONFIRMED")).toUpperCase(),
    providerStatus: first(statusObject.provider_status_label, statusMeta.akbar_status_label, data.provider_status_label, ""),
    airline: first(firstSegment.airline, firstSegment.airline_name, firstSegment.AirlineName, "Airline"),
    flightNo: first(firstSegment.flightNo, firstSegment.flight_no, firstSegment.flight_number, firstSegment.FlightNumber, ""),
    origin: first(firstSegment.origin, firstSegment.from, data.route?.from, "—"),
    destination: first(lastSegment.destination, lastSegment.to, data.route?.to, "—"),
    departure: first(firstSegment.departure, firstSegment.departure_time, firstSegment.DepartureTime),
    arrival: first(lastSegment.arrival, lastSegment.arrival_time, lastSegment.ArrivalTime),
    duration: first(data.duration, journeys[0]?.duration, firstSegment.duration, "—"),
    fromName: first(firstSegment.FromName, firstSegment.from_name, firstSegment.origin_name),
    toName: first(lastSegment.ToName, lastSegment.to_name, lastSegment.destination_name),
    departureTerminal: first(firstSegment.terminal?.departure, firstSegment.departureTerminal, firstSegment.departure_terminal, ""),
    arrivalTerminal: first(lastSegment.terminal?.arrival, lastSegment.arrivalTerminal, lastSegment.arrival_terminal, ""),
    passengers,
    baggage,
    meals,
    seats,
    pricing: {
      base: first(pricing.base, pricing.base_fare, journeys[0]?.pricing?.base, pricing.net, raw?.BaseFare),
      discount: first(pricing.discount, pricing.discount_amount),
      coupon: first(pricing.coupon_discount, pricing.couponDiscount),
      tax: first(pricing.tax, pricing.taxes, pricing.taxes_and_fees, journeys[0]?.pricing?.tax, raw?.TotalTax),
      total: first(pricing.customer_fare, pricing.gross, pricing.total, pricing.net, data.total_amount, raw?.CustomerFare),
    },
  };
};

const passengerName = (passenger) =>
  [
    first(passenger.title, passenger.salutation),
    first(passenger.first_name, passenger.firstName, passenger.given_name),
    first(passenger.last_name, passenger.lastName, passenger.surname),
  ].filter(Boolean).join(" ") || first(passenger.name, passenger.full_name, "Passenger");

const getExtraLabel = (item, type) => {
  if (item === undefined || item === null || item === "") return "";
  if (typeof item !== "object") return String(item);
  if (type === "baggage") {
    return first(item.description, item.name, item.label, item.weight, item.code, "");
  }
  if (type === "meal") {
    return first(item.description, item.meal_name, item.mealName, item.name, item.label, item.code, "");
  }
  return first(item.seat_no, item.seatNo, item.seat_number, item.seatNumber, item.number, item.name, item.label, "");
};

const FlightBookingDetails = ({ onBack, booking }) => {
  const bookingId = first(booking?.detailId, booking?.id);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!bookingId) {
      setError("Flight booking id is missing.");
      setLoading(false);
      return undefined;
    }
    const controller = new AbortController();
    setLoading(true);
    setError("");
    const backendUrl = String(process.env.NEXT_PUBLIC_BACKEND_URL || "").replace(/\/$/, "");
    const token = Cookies.get("auth_token");

    if (!backendUrl) {
      setError("Flight booking service is not configured.");
      setLoading(false);
      return undefined;
    }

    fetch(`${backendUrl}/api/flights/v2/retrieve-booking`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        domain: process.env.NEXT_PUBLIC_DOMAIN || "localhost:1337",
        booking_id: bookingId,
      }),
      signal: controller.signal,
    })
      .then(async (result) => {
        const payload = await result.json().catch(() => ({}));
        if (!result.ok || payload?.success === false) {
          throw new Error(
            first(
              payload?.error?.message,
              payload?.error?.details?.message,
              payload?.message,
              payload?.data?.message,
              "Unable to retrieve flight booking.",
            ),
          );
        }
        setResponse(payload);
      })
      .catch((requestError) => {
        if (requestError.name !== "AbortError") setError(requestError.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [bookingId]);

  const details = useMemo(() => normalizeBooking(response, bookingId), [response, bookingId]);
  const from = airportParts(details.fromName, details.origin);
  const to = airportParts(details.toName, details.destination);
  const failed = details.status.includes("FAIL") || details.status.includes("CANCEL");
  const pending = details.status.includes("PENDING") || details.status.includes("PROCESS");
  const passengerStatus = failed ? "FAILED" : pending ? "PENDING" : "CONFIRMED";
  const getStatusClass = (status) => {
    const normalized = String(status || "").toUpperCase();
    if (normalized.includes("FAIL") || normalized.includes("CANCEL")) return styles.statusFailed;
    if (normalized.includes("PENDING") || normalized.includes("PROCESS")) return styles.statusPending;
    return styles.statusSuccess;
  };
  const priceRows = [
    ["Base Price", details.pricing.base],
    ["Discount", details.pricing.discount],
    ["Coupon Discount", details.pricing.coupon],
    ["Taxes & Fees", details.pricing.tax],
  ].filter(([, value]) => value !== undefined && value !== null && value !== "");
  const baggageLabels = details.baggage.map((item) => getExtraLabel(item, "baggage")).filter(Boolean);
  const mealLabels = [
    ...details.meals.map((item) => getExtraLabel(item, "meal")),
    ...details.passengers.map((passenger) => getExtraLabel(first(passenger.meal, passenger.meal_name, passenger.mealName), "meal")),
  ].filter(Boolean);
  const seatLabels = [
    ...details.seats.map((item) => getExtraLabel(item, "seat")),
    ...details.passengers.map((passenger) => getExtraLabel(first(passenger.seat_no, passenger.seatNo, passenger.seat_number, passenger.seatNumber, passenger.seat), "seat")),
  ].filter(Boolean);

  return (
    <div className={styles.container}>
      <div className={styles.innerContainer}>
        {onBack && <button type="button" className={styles.backButton} onClick={onBack}>← Back</button>}
        {loading && (
          <div className={styles.loadingCard} role="status" aria-live="polite">
            <span className={styles.loadingSpinner} aria-hidden="true" />
            <h2>Retrieving your booking</h2>
            <p>Please wait while we load the latest flight details.</p>
            <div className={styles.loadingProgress}><span /></div>
          </div>
        )}
        {!loading && error && <div className={`${styles.apiState} ${styles.apiError}`}>{error}</div>}
        {!loading && !error && response && (
          <>
            <header className={styles.header}>
              <div className={styles.hotelInfo}>
                <div className={styles.imageWrapper}><Image src="/images/flightsReservations.png" alt="Flight" fill className={styles.objectFit} /></div>
                <div className={styles.details}>
                  <h1 className={styles.hotelName}>{details.airline} {details.flightNo}<span>{details.origin} - {details.destination}</span></h1>
                  <p className={styles.textSecondary}><span className={styles.infoLabel}>Booking ID:</span><span className={styles.infoValue}>{details.bookingId}</span></p>
                  {!!details.providerStatus && <p className={styles.textSecondary}><span className={styles.infoLabel}>Status:</span><span className={styles.infoValue}>{details.providerStatus}</span></p>}
                </div>
              </div>
              <div className={styles.bookingMeta}>
                {[{ label: "Departure", value: details.departure }, { label: "Arrival", value: details.arrival }].map((item) => (
                  <div className={styles.metaBox} key={item.label}>
                    <span className={styles.label}>{item.label}</span><span className={styles.dateNumber}>{datePart(item.value, "day")}</span><span className={styles.month}>{datePart(item.value, "month")}</span>
                    <div className={styles.timeWrapper}><Image src="/icons/alarm-clock.svg" alt="Time" width={18} height={18} /><span className={styles.time}>{timeLabel(item.value)}</span></div>
                  </div>
                ))}
                <div className={styles.divider} />
                <div className={styles.statusSection}><span className={`${styles.statusBadge} ${getStatusClass(details.status)}`}>{details.status}</span><div className={styles.roomCount}><div className={styles.countGroup}><span className={styles.label}>PNR</span><span className={styles.value}>{details.pnr}</span></div></div></div>
              </div>
            </header>
            <div className={styles.detailsWrapper}>
              <section className={styles.flightSummarySection}>
                <h2 className={styles.flightSummaryTitle}>FLIGHT SUMMARY</h2>
                <div className={styles.flightSummaryCard}>
                  <div className={styles.flightPoint}><span className={styles.flightLabel}>Departure</span><h3 className={styles.flightCity}>{from.city} ({details.origin})</h3><p className={styles.flightDate}>{dateLabel(details.departure)}</p><p className={styles.flightTerminal}>{details.departureTerminal && `Terminal ${details.departureTerminal} · `}{from.airport}</p></div>
                  <div className={styles.flightTimeline}><div className={styles.flightPath}><span className={styles.pathDot} /><span className={styles.pathLine} /><span className={styles.flightIcon}><img src="/icons/flightIcon.svg" alt="flight" /></span><span className={styles.pathLine} /><span className={styles.pathDot} /></div><span className={styles.flightDuration}>{details.duration}</span></div>
                  <div className={`${styles.flightPoint} ${styles.flightPointRight}`}><span className={styles.flightLabel}>Arrival</span><h3 className={styles.flightCity}>{to.city} ({details.destination})</h3><p className={styles.flightDate}>{dateLabel(details.arrival)}</p><p className={styles.flightTerminal}>{details.arrivalTerminal && `Terminal ${details.arrivalTerminal} · `}{to.airport}</p></div>
                </div>
              </section>
              {!!priceRows.length && <section className={styles.summarySection}><h2 className={styles.sectionTitle}>BOOKING SUMMARY</h2><div className={styles.priceTable}>{priceRows.map(([label, value]) => <div key={label} className={styles.priceRow}><span className={styles.priceLabel}>{label}</span><span className={styles.textPrimary}>{money(value)}</span></div>)}<div className={styles.totalRow}><span className={styles.totalLabel}>Total Amount</span><span className={styles.totalValue}>{money(details.pricing.total)}</span></div></div></section>}
              <section className={styles.passengerDetailsSection}><div className={styles.passengerHeader}><h2 className={styles.passengerTitle}>PASSENGER DETAILS <span className={styles.passengerCount}>{details.passengers.length} Traveller{details.passengers.length === 1 ? "" : "s"}</span></h2></div><div className={styles.passengerList}>{details.passengers.map((passenger, index) => { const status = first(passenger.status, passenger.booking_status, passengerStatus); return <div key={first(passenger.id, passenger.passenger_id, index)} className={styles.passengerRow}><div className={styles.passengerInfo}><div className={styles.passengerAvatar}><span className={styles.avatarIcon}><img src="/images/passenger-avatar.png" alt="" /></span></div><span className={styles.passengerName}>{passengerName(passenger)}</span></div><span className={`${styles.passengerStatus} ${getStatusClass(status)}`}>{status}</span></div>; })}</div></section>
              {(baggageLabels.length > 0 || mealLabels.length > 0 || seatLabels.length > 0) && (
                <section className={styles.extrasSection}>
                  <h2 className={styles.sectionTitle}>TRAVEL DETAILS</h2>
                  {baggageLabels.length > 0 && <div className={styles.extraRow}><span>Baggage</span><strong>{[...new Set(baggageLabels)].join(", ")}</strong></div>}
                  {mealLabels.length > 0 && <div className={styles.extraRow}><span>Meal</span><strong>{[...new Set(mealLabels)].join(", ")}</strong></div>}
                  {seatLabels.length > 0 && <div className={styles.extraRow}><span>Seat No.</span><strong>{[...new Set(seatLabels)].join(", ")}</strong></div>}
                </section>
              )}
              <footer className={styles.footerActions}>{!failed && <button onClick={() => setShowCancelModal(true)} className={styles.btnSecondary}>CANCEL BOOKING</button>}</footer>
            </div>
          </>
        )}
      </div>
      {showCancelModal && <CancelBookingModal airline={details.airline} route={`${details.origin} to ${details.destination}`} bookingId={details.bookingId} onClose={() => setShowCancelModal(false)} />}
    </div>
  );
};

export default FlightBookingDetails;
