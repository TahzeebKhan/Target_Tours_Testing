"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "../flight-booking-details/Navbar";
import { resolveAirlineLogo } from "@/features/flights/utils/airlineLogos";
import styles from "./page.module.css";
import { clearFlightBookingSession } from "@/features/flights/utils/flightBookingSession";
import { clearBookingSession } from "@/shared/utils/sessionStorage";

const pickFirst = (...values) =>
  values.find((value) => value !== undefined && value !== null && value !== "");

const readFlightPaymentSnapshot = () => {
  if (typeof window === "undefined") return {};

  try {
    const raw = window.localStorage.getItem("flightPaymentSnapshot");
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const FLIGHT_RETRIEVE_SNAPSHOT_KEY = "flightRetrieveResponse";

const readFlightRetrieveSnapshot = () => {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(FLIGHT_RETRIEVE_SNAPSHOT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const getParamValue = (searchParams, keys = []) => {
  for (const key of keys) {
    const value = searchParams.get(key);
    if (value) return value;
  }
  return "";
};

const getResponseData = (payload = {}) =>
  payload?.data?.data && typeof payload.data.data === "object"
    ? payload.data.data
    : payload?.data && typeof payload.data === "object"
      ? payload.data
      : payload && typeof payload === "object"
        ? payload
        : {};

const formatAmount = (value) => {
  if (value === null || value === undefined || value === "") return "N/A";
  const amount =
    typeof value === "string" ? Number(value.replace(/[^\d.]/g, "")) : Number(value);
  if (!Number.isFinite(amount) || amount < 0) return "N/A";
  return `INR ${amount.toLocaleString("en-IN")}`;
};

const formatDateTime = (value) => {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const formatStatus = (value) =>
  String(
    typeof value === "object"
      ? pickFirst(
          value?.booking_status,
          value?.payment_status,
          value?.provider_status_label,
          value?.provider_status
        )
      : value || "SUCCESS"
  )
    .replace(/[_-]+/g, " ")
    .toUpperCase();

const getStatusPillClass = (value) => {
  const status = formatStatus(value);
  if (status.includes("FAIL") || status.includes("CANCEL")) {
    return "statusPillFailed";
  }
  if (
    status.includes("PENDING") ||
    status.includes("PROCESS") ||
    status.includes("HOLD")
  ) {
    return "statusPillPending";
  }
  if (
    status.includes("SUCCESS") ||
    status.includes("COMPLETE") ||
    status.includes("CONFIRM") ||
    status.includes("TICKET")
  ) {
    return "statusPillSuccess";
  }
  return "statusPillNeutral";
};

const formatRoute = (value) => {
  if (!value) return "Flight booking";
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }
  if (typeof value !== "object") return "Flight booking";

  const from = pickFirst(value.from_name, value.fromName, value.from, value.origin, "");
  const to = pickFirst(value.to_name, value.toName, value.to, value.destination, "");

  if (from && to) return `${from} → ${to}`;
  if (from || to) return String(from || to);
  return "Flight booking";
};

const isSuccessFalse = (payload = {}) =>
  payload?.success === false ||
  payload?.data?.success === false ||
  payload?.data?.data?.success === false;

const getApiMessage = (payload = {}, fallbackMessage) =>
  pickFirst(
    payload?.message,
    payload?.data?.message,
    payload?.data?.data?.message,
    payload?.error?.message,
    fallbackMessage
  );

const toArray = (value) => (Array.isArray(value) ? value : []);
const toBaggageItems = (value) =>
  Array.isArray(value) ? value : value !== undefined && value !== null ? [value] : [];

const postFlightJson = async (url, payload, fallbackMessage) => {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok || isSuccessFalse(data)) {
    throw new Error(getApiMessage(data, fallbackMessage));
  }

  return data;
};

const formatTicketDate = (value) => {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatTicketTime = (value) => {
  if (!value) return "--:--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
};

const getPassengerName = (passenger = {}) =>
  pickFirst(
    passenger.name,
    [passenger.Title || passenger.title, passenger.FName || passenger.firstName, passenger.LName || passenger.lastName]
      .filter(Boolean)
      .join(" "),
    "Passenger",
  );

const formatPassengerType = (passenger = {}) => {
  const type = String(
    pickFirst(
      passenger.passenger_type,
      passenger.passengerType,
      passenger.type,
      passenger.PTC,
      passenger.ptc,
      "",
    ),
  )
    .trim()
    .toUpperCase();

  if (["ADT", "ADULT"].includes(type)) return "Adult";
  if (["CHD", "CHILD"].includes(type)) return "Child";
  if (["INF", "INFANT"].includes(type)) return "Infant";
  return "N/A";
};

const formatBaggageAllowance = (value) => {
  const entries = [];
  const collectEntries = (item, key = "") => {
    if (item === null || item === undefined || item === "") return;
    if (Array.isArray(item)) {
      item.forEach((child) => collectEntries(child, key));
      return;
    }
    if (typeof item === "object") {
      const type = pickFirst(
        item.type,
        item.baggage_type,
        item.baggageType,
        item.category,
        item.kind,
        key,
      );
      const allowance = pickFirst(
        item.allowance,
        item.weight,
        item.value,
        item.description,
        item.name,
        item.code,
      );
      if (allowance) {
        entries.push({ type: String(type || ""), allowance: String(allowance) });
        return;
      }
      Object.entries(item).forEach(([childKey, child]) =>
        collectEntries(child, childKey),
      );
      return;
    }
    entries.push({ type: String(key || ""), allowance: String(item) });
  };

  collectEntries(value);
  const cabin = [];
  const checkIn = [];
  const other = [];

  entries.forEach(({ type, allowance }) => {
    const classification = `${type} ${allowance}`.toLowerCase();
    const normalizedAllowance = allowance.replace(/\s*kgs?\b/gi, " kg").trim();
    if (/cabin|hand|carry[ -]?on/.test(classification)) {
      cabin.push(normalizedAllowance.replace(/\b(cabin|hand|carry[ -]?on).*$/i, "").trim());
    } else if (/check[ -]?in|checked|registered/.test(classification)) {
      checkIn.push(normalizedAllowance.replace(/\b(check[ -]?in|checked|registered).*$/i, "").trim());
    } else {
      other.push(normalizedAllowance);
    }
  });

  const unique = (items) => [...new Set(items.filter(Boolean))];
  const parts = [];
  const cabinValues = unique(cabin);
  const checkInValues = unique(checkIn);
  if (cabinValues.length) parts.push(`${cabinValues.join(" / ")} Cabin`);
  if (checkInValues.length) parts.push(`${checkInValues.join(" / ")} Check-in`);
  if (!parts.length) parts.push(...unique(other));

  return parts.join(" + ") || "As per airline policy";
};

const getCityLabel = (name, code, fallback) => {
  const parts = String(name || "").split("|").map((part) => part.trim()).filter(Boolean);
  const city = parts.length > 1 ? parts[parts.length - 1] : parts[0];
  return city || code || fallback;
};

const getAirportLabel = (name, code, fallback) => {
  const city = getCityLabel(name, code, fallback);
  return code && !city.toUpperCase().includes(String(code).toUpperCase())
    ? `${code} - ${city}`
    : city;
};

const getSegmentAirport = (segment = {}, side, route = {}) => {
  const isDeparture = side === "departure";
  const location = isDeparture
    ? segment.origin || segment.departure_airport || segment.departureAirport
    : segment.destination || segment.arrival_airport || segment.arrivalAirport;
  const code = pickFirst(
    isDeparture ? segment.from : segment.to,
    location?.code,
    location?.airport_code,
    location?.iata_code,
  );
  const name = pickFirst(
    isDeparture ? segment.dep_airport_name : segment.arr_airport_name,
    isDeparture ? segment.departure_airport_name : segment.arrival_airport_name,
    isDeparture ? route.from_name : route.to_name,
    location?.airport_name,
    location?.AirportName,
    location?.name,
    typeof location === "string" ? location : "",
    isDeparture ? segment.from_name : segment.to_name,
  );
  const airportName = String(name || "")
    .split("|")
    .map((part) => part.trim())
    .filter(Boolean)[0];
  const fallback = isDeparture ? "Origin airport" : "Destination airport";

  if (!airportName) return code || fallback;
  return code && !airportName.toUpperCase().includes(String(code).toUpperCase())
    ? `${code} - ${airportName}`
    : airportName;
};

const getSegmentTerminal = (segment = {}, side) => {
  const isDeparture = side === "departure";
  const location = isDeparture
    ? segment.origin || segment.departure_airport || segment.departureAirport
    : segment.destination || segment.arrival_airport || segment.arrivalAirport;
  const terminal = pickFirst(
    isDeparture ? segment.departure_terminal : segment.arrival_terminal,
    isDeparture ? segment.from_terminal : segment.to_terminal,
    isDeparture ? segment.departureTerminal : segment.arrivalTerminal,
    isDeparture ? segment.terminal?.departure : segment.terminal?.arrival,
    location?.terminal,
    location?.Terminal,
  );

  if (!terminal) return "Terminal information unavailable";
  return String(terminal).toLowerCase().startsWith("terminal")
    ? String(terminal)
    : `Terminal ${terminal}`;
};

function SuccessfulFlightBooking({ details, isFailed = false, isPending = false }) {
  const journeys = details.journeys.length ? details.journeys : [{ segments: [] }];
  const passengers = details.passengers.length ? details.passengers : [{ name: "Passenger" }];
  const includedBaggage = formatBaggageAllowance(details.baggage);
  return (
    <div className={styles.successShell}>
      <section className={styles.successHero}>
        <div
          className={`${styles.successCheck} ${
            isFailed ? styles.failedCheck : isPending ? styles.pendingCheck : ""
          }`}
        >
          {isFailed || isPending ? (isFailed ? "!" : "…") : <img src="/images/successCircle.png" alt="" />}
        </div>
        <h1>{isFailed ? "Booking Failed!" : isPending ? "Booking Pending" : "Booking Confirmed!"}</h1>
        <p>
          {isFailed
            ? details.providerStatus || details.message || "Your flight booking could not be completed."
            : isPending
              ? details.message || "Your flight booking is being processed."
              : "Your flight has been booked successfully. A confirmation has been sent to your email."}
        </p>
        <div className={styles.pnrBox}>
          <span>BOOKING PNR</span>
          <strong>{details.pnr}</strong>
        </div>
      </section>

      <section className={styles.ticketCard}>
        {journeys.map((journey, journeyIndex) => {
          const segments = toArray(journey.segments);
          const firstSegment = segments[0] || {};
          const lastSegment = segments[segments.length - 1] || firstSegment;
          return (
            <div className={styles.ticketJourney} key={`ticket-journey-${journeyIndex}`}>
              <div className={styles.ticketJourneyHeader}>
                <strong>{journeyIndex === 0 ? "Departing Flight" : "Return Flight"}</strong>
                <span>{getCityLabel(firstSegment.from_name, firstSegment.from, "Origin")}</span>
                <b><img src='/icons/flightIcon.svg'/></b>
                <span>{getCityLabel(lastSegment.to_name, lastSegment.to, "Destination")}</span>
                <time>{formatTicketDate(firstSegment.departure)}</time>
              </div>

              {segments.length ? segments.map((segment, segmentIndex) => (
                <div className={styles.ticketSegment} key={`${segment.flight_no || "flight"}-${segmentIndex}`}>
                  <div className={styles.airlineBlock}>
                    <span className={styles.airlineLogo}>
                      <img
                        src={resolveAirlineLogo({
                          name: segment.airline || segment.provider || journey.provider,
                          code: segment.airline_code || segment.provider,
                          logo: segment.airline_logo || segment.logo,
                        })}
                        alt=""
                      />
                    </span>
                    <div>
                      <strong>{segment.airline || segment.provider || journey.provider || "Airline"}</strong>
                      <small>{segment.aircraft || segment.aircraft_name || segment.flight_no || ""}</small>
                    </div>
                  </div>
                  {(segment.fare_type || journey.fare_type) && (
                    <strong className={styles.fareType}>{segment.fare_type || journey.fare_type}</strong>
                  )}
                  <span className={styles.cabinBadge}>{segment.cabin_class || segment.cabinClass || "Economy"}</span>
                  <div className={styles.flightTimeline}>
                    <div className={styles.departureAirport}>
                      <small>{formatTicketDate(segment.departure)}</small>
                      <strong>{formatTicketTime(segment.departure)}</strong>
                      <em>{getSegmentTerminal(segment, "departure")}</em>
                        <span className={styles.airportName}>{getSegmentAirport(segment, "departure", details.routeData)}</span>

                    </div>
                    <div className={styles.flightPath}>
                      <span>●---------------- <img src='/icons/flightIcon.svg'/> ----------------●</span>
                      <small>{segment.duration || journey.duration || ""}</small>
                    </div>
                    <div className={styles.arrivalPoint}>
                      <small>{formatTicketDate(segment.arrival)}</small>
                      <strong>{formatTicketTime(segment.arrival)}</strong>
                      <em>{getSegmentTerminal(segment, "arrival")}</em>
                      <span className={styles.airportName}>{getSegmentAirport(segment, "arrival", details.routeData)}</span>

                    </div>
                  </div>
                  {segmentIndex < segments.length - 1 && (
                    <div className={styles.layover}>Change of aircraft / layover</div>
                  )}
                </div>
              )) : (
                <div className={styles.ticketFallbackRoute}>{details.route}</div>
              )}
            </div>
          );
        })}

        <div className={styles.ticketSection}>
          <h2>Passenger Information</h2>
          {passengers.map((passenger, index) => (
            <div className={styles.ticketPassenger} key={`${getPassengerName(passenger)}-${index}`}>
              <strong><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7B8799" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-user-icon lucide-user"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> {getPassengerName(passenger)}</strong>
              <span className={styles.passengerType}>
                {formatPassengerType(passenger)}
              </span>
              <div>
                <span>SEAT ALLOCATED<strong>{passenger.seat || passenger.seat_no || "Not selected"}</strong></span>
                <span>
                  BAGGAGE ALLOWANCE
                  <strong>
                    {passenger.baggage
                      ? formatBaggageAllowance(passenger.baggage)
                      : includedBaggage}
                  </strong>
                </span>
              </div>
            </div>
          ))}
        </div>

        {!isFailed && (
          <div className={styles.ticketSection}>
            <h2>Payment Summary</h2>
            <div className={styles.paymentRow}><span>BASE FARE</span><strong>{details.pricing.base}</strong></div>
            <div className={styles.paymentRow}><span>TAXES &amp; FEES</span><strong>{details.pricing.tax}</strong></div>
            <div className={`${styles.paymentRow} ${styles.totalPaid}`}><span>TOTAL PAID</span><strong>{details.amount}</strong></div>
          </div>
        )}

        {isFailed ? (
          <div className={styles.refundNotice} role="status">
            <strong>Payment deducted?</strong>
            <span>
              Don&apos;t worry. If your account was charged, the amount will be
              refunded automatically to your original payment method within
              24–72 hours.
            </span>
          </div>
        ) : (
          <button type="button" className={styles.downloadTicket} onClick={() => window.print()}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-download-icon lucide-download"><path d="M12 15V3"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/></svg> Download Ticket
          </button>
        )}
      </section>

    </div>
  );
}

function PaymentStatusContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [snapshot, setSnapshot] = useState({});
  const [isSnapshotReady, setIsSnapshotReady] = useState(false);
  const [retrieveResponse, setRetrieveResponse] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, []);

  const finishBookingFlow = () => {
    clearFlightBookingSession();
    clearBookingSession();
    window.localStorage.removeItem("flightPaymentSnapshot");
    window.localStorage.removeItem(FLIGHT_RETRIEVE_SNAPSHOT_KEY);
    router.push("/");
  };

  useEffect(() => {
    const navigationEntry = window.performance
      .getEntriesByType("navigation")
      .at(0);

    if (navigationEntry?.type === "reload") {
      clearFlightBookingSession();
      clearBookingSession();
      window.localStorage.removeItem("flightPaymentSnapshot");
      window.localStorage.removeItem(FLIGHT_RETRIEVE_SNAPSHOT_KEY);
      router.replace("/");
    }
  }, [router]);

  useEffect(() => {
    setSnapshot(readFlightPaymentSnapshot());
    setIsSnapshotReady(true);
  }, []);

  const bookingId = useMemo(
    () =>
      pickFirst(
        getParamValue(searchParams, [
          "booking_id",
          "bookingId",
          "merchant_order_id",
          "merchantOrderId",
          "order_id",
          "orderId",
          "transactionId",
          "transaction_id",
        ]),
        snapshot.bookingId,
        snapshot.merchantOrderId,
        snapshot.orderId
      ),
    [searchParams, snapshot]
  );
  const confirmBookingId = useMemo(
    () =>
      pickFirst(
        snapshot.bookingId,
        getParamValue(searchParams, ["booking_id", "bookingId"])
      ),
    [searchParams, snapshot.bookingId]
  );
  const searchKey = useMemo(
    () =>
      pickFirst(
        snapshot.searchKey,
        getParamValue(searchParams, ["search_key", "searchKey"])
      ),
    [searchParams, snapshot.searchKey]
  );

  useEffect(() => {
    let isActive = true;

    const retrieveBooking = async () => {
      if (!isSnapshotReady) return;

      if (!bookingId) {
        setErrorMessage("Flight booking id is missing from the payment response.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setErrorMessage("");

      try {
        const cachedRetrieve = readFlightRetrieveSnapshot();
        if (
          cachedRetrieve?.response &&
          String(cachedRetrieve.bookingId || "") === String(bookingId || "")
        ) {
          if (!isActive) return;
          setRetrieveResponse(cachedRetrieve.response);
          setIsLoading(false);
          return;
        }

        const domain = process.env.NEXT_PUBLIC_DOMAIN || "localhost:1337";

        // On the initial payment return we have the confirmation snapshot and
        // confirm first. On refresh, order_id is sufficient to retrieve the
        // already-confirmed booking, so missing temporary tokens must not block UI.
        if (confirmBookingId && searchKey) {
          await postFlightJson(
            "/api/flights/v2/confirm-booking",
            {
              booking_id: confirmBookingId,
              domain,
              search_key: searchKey,
            },
            "Unable to confirm flight booking."
          );
        }

        const data = await postFlightJson(
          "/api/flights/v2/retrieve-booking",
          {
            domain: process.env.NEXT_PUBLIC_DOMAIN || "localhost:1337",
            booking_id: bookingId,
          },
          "Unable to retrieve flight booking."
        );

        if (!isActive) return;

        setRetrieveResponse(data);
        window.localStorage.setItem(
          FLIGHT_RETRIEVE_SNAPSHOT_KEY,
          JSON.stringify({ bookingId, response: data }),
        );
        // Temporarily keep flightPaymentSnapshot for refresh/UI testing.
        // window.localStorage.removeItem("flightPaymentSnapshot");
      } catch (error) {
        if (!isActive) return;
        setErrorMessage(error?.message || "Unable to retrieve flight booking.");
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    retrieveBooking();

    return () => {
      isActive = false;
    };
  }, [bookingId, confirmBookingId, isSnapshotReady, searchKey, snapshot.createdAt]);

  const details = useMemo(() => {
    const root = retrieveResponse || {};
    const data = getResponseData(retrieveResponse);
    const raw = root.raw || data.raw || {};
    const statusData =
      data.status && typeof data.status === "object" ? data.status : {};
    const statusMeta =
      root.status_meta && typeof root.status_meta === "object"
        ? root.status_meta
        : {};
    const pricing =
      data.pricing && typeof data.pricing === "object" ? data.pricing : {};
    const paymentData = getResponseData(snapshot.paymentResponse);
    const status = pickFirst(
      statusData.booking_status,
      statusData.payment_status,
      statusMeta.booking_status,
      statusMeta.payment_status,
      statusMeta.akbar_status_label,
      data.payment_status,
      data.paymentStatus,
      data.booking_status,
      data.bookingStatus,
      data.status,
      paymentData.state,
      paymentData.status,
      "SUCCESS"
    );
    const normalizedResponseStatus = formatStatus(status);
    const isResponseFailed =
      normalizedResponseStatus.includes("FAIL") ||
      normalizedResponseStatus.includes("CANCEL");
    const providerFailureMessage = pickFirst(
      statusData.provider_status_label,
      statusMeta.akbar_status_label,
      data.provider_status_label,
      raw.PGDescription,
      "Flight booking failed."
    );
    const routeData = pickFirst(
      data.route,
      data.sector,
      data.trip,
      snapshot.searchKey,
      {},
    );

    return {
      status,
      bookingId: pickFirst(
        root.booking_id,
        data.booking_id,
        data.bookingId,
        data.id,
        bookingId,
        snapshot.bookingId,
        "N/A"
      ),
      merchantOrderId: pickFirst(
        root.provider_reference,
        root.reference_number,
        data.provider_reference,
        data.reference_number,
        data.merchant_order_id,
        data.merchantOrderId,
        snapshot.merchantOrderId,
        paymentData.merchant_order_id,
        "N/A"
      ),
      transactionId: pickFirst(
        raw.TransactionID,
        root.provider_reference,
        root.reference_number,
        data.TransactionID,
        data.transactionId,
        snapshot.transactionId,
        "N/A"
      ),
      amount: formatAmount(
        pickFirst(
          pricing.customer_fare,
          pricing.gross,
          pricing.net,
          raw.CustomerFare,
          raw.GrossAmount,
          raw.NetAmount,
          data.amount,
          data.NetAmount,
          data.total_amount,
          data.totalAmount,
          snapshot.amount,
          paymentData.amount
        )
      ),
      route: formatRoute(routeData),
      routeData: routeData && typeof routeData === "object" ? routeData : {},
      provider: pickFirst(data.provider, root.provider, "N/A"),
      pnr: pickFirst(
        root.pnr,
        data.pnr,
        data.booking?.pnr,
        data.booking_details?.pnr,
        data.journeys?.[0]?.segments?.[0]?.pnr,
        raw?.Trips?.[0]?.Journey?.[0]?.Segments?.[0]?.Flight?.APNR,
        "N/A"
      ),
      bookingDate: formatDateTime(pickFirst(data.booking_date, raw.BookingDate)),
      paymentStatus: formatStatus(
        pickFirst(statusData.payment_status, statusMeta.payment_status, raw.PaymentStatus, "N/A")
      ),
      bookingStatus: formatStatus(
        pickFirst(statusData.booking_status, statusMeta.booking_status, raw.Status, "N/A")
      ),
      providerStatus: pickFirst(
        statusData.provider_status_label,
        statusMeta.akbar_status_label,
        raw.PGDescription,
        "N/A"
      ),
      pricing: {
        base: formatAmount(
          pickFirst(
            pricing.base,
            pricing.base_fare,
            data.journeys?.[0]?.pricing?.base,
            data.journeys?.[0]?.segments?.[0]?.pricing?.base,
            raw?.Trips?.[0]?.Journey?.[0]?.Segments?.[0]?.Fares?.TotalBaseFare
          )
        ),
        tax: formatAmount(
          pickFirst(
            pricing.tax,
            pricing.taxes,
            data.journeys?.[0]?.pricing?.tax,
            data.journeys?.[0]?.segments?.[0]?.pricing?.tax,
            raw?.Trips?.[0]?.Journey?.[0]?.Segments?.[0]?.Fares?.TotalTax
          )
        ),
        net: formatAmount(pickFirst(pricing.net, raw.NetAmount)),
        gross: formatAmount(pickFirst(pricing.gross, raw.GrossAmount)),
        customerFare: formatAmount(pickFirst(pricing.customer_fare, raw.CustomerFare)),
        ssr: formatAmount(pickFirst(pricing.ssr_amount, raw.SSRAmount)),
      },
      journeys: toArray(pickFirst(data.journeys, root.journeys, data.booking?.journeys, [])),
      passengers: toArray(pickFirst(data.passengers, root.passengers, data.booking?.passengers, [])),
      baggage: toBaggageItems(
        pickFirst(data.baggage, root.baggage, data.booking?.baggage, []),
      ),
      message: pickFirst(
        isResponseFailed ? providerFailureMessage : "",
        isSuccessFalse(retrieveResponse) ? "" : retrieveResponse?.message,
        isSuccessFalse(retrieveResponse) ? "" : retrieveResponse?.data?.message,
        isSuccessFalse(retrieveResponse) ? "" : data.message,
        paymentData.state === "PENDING" ? "Payment is pending. Complete the PhonePe payment to confirm your booking." : "",
        "Flight booking payment completed."
      ),
    };
  }, [bookingId, retrieveResponse, snapshot]);

  const normalizedStatus = formatStatus(details.status);
  const isFailed = normalizedStatus.includes("FAIL") || normalizedStatus.includes("CANCEL");
  const isPending = normalizedStatus.includes("PENDING");
  const showConfirmationUi = Boolean(retrieveResponse);
  const heading = isFailed
    ? "Flight Booking Failed"
    : isPending
      ? "Flight Booking Pending"
      : "Flight Booking Success";

  return (
    <>
      <Navbar transparent={!isLoading} onLogoClick={finishBookingFlow} />
      <main className={`${styles.page} ${!isLoading && !errorMessage && showConfirmationUi ? styles.successPage : ""}`}>
        <section className={styles.card}>
          {isLoading ? (
            <div className={styles.centerState}>
              <span className={styles.spinner} />
              <h1>Verifying payment</h1>
              <p>Please wait while we retrieve your flight booking.</p>
            </div>
          ) : errorMessage ? (
            <div className={styles.centerState}>
              <span className={`${styles.statusIcon} ${styles.errorIcon}`}>!</span>
              <p className={styles.errorLabel}>Payment status unavailable</p>
              <h1>Unable to retrieve booking</h1>
              <p>{errorMessage}</p>
              <div className={styles.actions}>
                <button type="button" onClick={() => router.push("/flights")}>
                  Search flights
                </button>
                <button type="button" onClick={() => router.push("/")}>
                  Go home
                </button>
              </div>
            </div>
          ) : showConfirmationUi ? (
            <SuccessfulFlightBooking details={details} isFailed={isFailed} isPending={isPending} />
          ) : (
            <>
              <div className={styles.header}>
                <span
                  className={`${styles.statusIcon} ${
                    isFailed
                      ? styles.errorIcon
                      : isPending
                        ? styles.pendingIcon
                        : ""
                  }`}
                >
                  {isFailed ? "!" : isPending ? "…" : "OK"}
                </span>
                <div>
                  <p
                    className={
                      isFailed
                        ? styles.errorLabel
                        : isPending
                          ? styles.pendingLabel
                          : styles.successLabel
                    }
                  >
                    {normalizedStatus}
                  </p>
                  <h1>{heading}</h1>
                  <p>{details.message}</p>
                </div>
              </div>

              <div className={styles.summaryGrid}>
                <div className={styles.summaryItem}>
                  <span>Booking ID</span>
                  <strong>{details.bookingId}</strong>
                </div>
                <div className={styles.summaryItem}>
                  <span>Merchant order ID</span>
                  <strong>{details.merchantOrderId}</strong>
                </div>
                <div className={styles.summaryItem}>
                  <span>Transaction ID</span>
                  <strong>{details.transactionId}</strong>
                </div>
                <div className={styles.summaryItem}>
                  <span>Amount</span>
                  <strong>{details.amount}</strong>
                </div>
              </div>

              <div className={styles.routeBox}>
                <span>Flight</span>
                <strong>{details.route}</strong>
              </div>

              <div className={styles.detailSections}>
                <section className={styles.detailSection}>
                  <h2>Booking Details</h2>
                  <div className={styles.detailGrid}>
                    <div>
                      <span>Provider</span>
                      <strong>{details.provider}</strong>
                    </div>
                    <div>
                      <span>Reference Number</span>
                      <strong>{details.merchantOrderId}</strong>
                    </div>
                    <div>
                      <span>PNR</span>
                      <strong>{details.pnr}</strong>
                    </div>
                    <div>
                      <span>Booking Date</span>
                      <strong>{details.bookingDate}</strong>
                    </div>
                    <div>
                      <span>Payment Status</span>
                      <strong
                        className={`${styles.statusPill} ${styles[getStatusPillClass(details.paymentStatus)]}`}
                      >
                        {details.paymentStatus}
                      </strong>
                    </div>
                    <div>
                      <span>Booking Status</span>
                      <strong
                        className={`${styles.statusPill} ${styles[getStatusPillClass(details.bookingStatus)]}`}
                      >
                        {details.bookingStatus}
                      </strong>
                    </div>
                    <div className={styles.fullWidth}>
                      <span>Provider Status</span>
                      <strong>{details.providerStatus}</strong>
                    </div>
                  </div>
                </section>

                <section className={styles.detailSection}>
                  <h2>Price Details</h2>
                  <div className={styles.detailGrid}>
                    <div>
                      <span>Base Fare</span>
                      <strong>{details.pricing.base}</strong>
                    </div>
                    <div>
                      <span>Taxes</span>
                      <strong>{details.pricing.tax}</strong>
                    </div>
                    <div>
                      <span>Net Amount</span>
                      <strong>{details.pricing.net}</strong>
                    </div>
                    <div>
                      <span>Gross Amount</span>
                      <strong>{details.pricing.gross}</strong>
                    </div>
                    <div>
                      <span>Customer Fare</span>
                      <strong>{details.pricing.customerFare}</strong>
                    </div>
                    <div>
                      <span>SSR Amount</span>
                      <strong>{details.pricing.ssr}</strong>
                    </div>
                  </div>
                </section>

                {!!details.journeys.length && (
                  <section className={styles.detailSection}>
                    <h2>Journey Details</h2>
                    {details.journeys.map((journey, journeyIndex) => (
                      <div
                        className={styles.journeyCard}
                        key={`${journey.provider || "journey"}-${journeyIndex}`}
                      >
                        <div className={styles.journeyHeader}>
                          <strong>
                            {journey.provider || "Flight"} • {journey.duration || "N/A"}
                          </strong>
                          <span>
                            {Number(journey.stops || 0)}{" "}
                            {Number(journey.stops || 0) === 1 ? "stop" : "stops"}
                          </span>
                        </div>
                        {toArray(journey.segments).map((segment, segmentIndex) => (
                          <div
                            className={styles.segmentRow}
                            key={`${segment.flight_no || "segment"}-${segmentIndex}`}
                          >
                            <div>
                              <span>Flight</span>
                              <strong>
                                {segment.airline || segment.provider || "N/A"}{" "}
                                {segment.flight_no || ""}
                              </strong>
                            </div>
                            <div>
                              <span>Route</span>
                              <strong>
                                {segment.from_name || segment.from || "N/A"} →{" "}
                                {segment.to_name || segment.to || "N/A"}
                              </strong>
                            </div>
                            <div>
                              <span>Departure</span>
                              <strong>{formatDateTime(segment.departure)}</strong>
                            </div>
                            <div>
                              <span>Arrival</span>
                              <strong>{formatDateTime(segment.arrival)}</strong>
                            </div>
                            <div>
                              <span>Duration</span>
                              <strong>{segment.duration || "N/A"}</strong>
                            </div>
                            <div>
                              <span>Status</span>
                              <strong>{formatStatus(segment.status)}</strong>
                            </div>
                            <div>
                              <span>PNR</span>
                              <strong>{segment.pnr || "N/A"}</strong>
                            </div>
                            <div>
                              <span>Ticket No.</span>
                              <strong>{segment.ticket_no || "N/A"}</strong>
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </section>
                )}

                {!!details.passengers.length && (
                  <section className={styles.detailSection}>
                    <h2>Passengers</h2>
                    <div className={styles.listRows}>
                      {details.passengers.map((passenger, index) => (
                        <div className={styles.listRow} key={`${passenger.name || "pax"}-${index}`}>
                          <strong>{passenger.name || "Passenger"}</strong>
                          <span>
                            {passenger.type || "N/A"} • {passenger.gender || "N/A"} • DOB{" "}
                            {passenger.date_of_birth || "N/A"} • Ticket{" "}
                            {passenger.ticket_no || "N/A"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {!!details.baggage.length && (
                  <section className={styles.detailSection}>
                    <h2>Baggage</h2>
                    <div className={styles.listRows}>
                      {details.baggage.map((bag, index) => (
                        <div className={styles.listRow} key={`${bag.code || "bag"}-${index}`}>
                          <strong>{bag.description || bag.code || "Baggage"}</strong>
                          <span>Amount: {formatAmount(bag.amount)}</span>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>

              <div className={styles.actions}>
                <button type="button" onClick={finishBookingFlow}>
                  View bookings
                </button>
                <button type="button" onClick={finishBookingFlow}>
                  Go home
                </button>
              </div>
            </>
          )}
        </section>
      </main>
    </>
  );
}

export default function PaymentStatusPage() {
  return (
    <Suspense fallback={null}>
      <PaymentStatusContent />
    </Suspense>
  );
}
