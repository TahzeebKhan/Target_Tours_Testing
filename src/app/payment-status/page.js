"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "../flight-booking-details/Navbar";
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

function PaymentStatusContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [snapshot, setSnapshot] = useState({});
  const [isSnapshotReady, setIsSnapshotReady] = useState(false);
  const [retrieveResponse, setRetrieveResponse] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const finishBookingFlow = () => {
    clearFlightBookingSession();
    clearBookingSession();
    window.localStorage.removeItem("flightPaymentSnapshot");
    router.push("/");
  };

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
        const domain = process.env.NEXT_PUBLIC_DOMAIN || "localhost:1337";

        if (!confirmBookingId || !searchKey) {
          throw new Error("Flight booking confirmation details are missing.");
        }

        await postFlightJson(
          "/api/flights/v2/confirm-booking",
          {
            booking_id: confirmBookingId,
            domain,
            search_key: searchKey,
          },
          "Unable to confirm flight booking."
        );

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
        window.localStorage.removeItem("flightPaymentSnapshot");
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
      route: formatRoute(
        pickFirst(
          data.route,
          data.sector,
          data.trip,
          snapshot.searchKey,
          "Flight booking"
        )
      ),
      provider: pickFirst(data.provider, root.provider, "N/A"),
      pnr: pickFirst(data.pnr, raw?.Trips?.[0]?.Journey?.[0]?.Segments?.[0]?.Flight?.APNR, "N/A"),
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
        base: formatAmount(raw?.Trips?.[0]?.Journey?.[0]?.Segments?.[0]?.Fares?.TotalBaseFare),
        tax: formatAmount(raw?.Trips?.[0]?.Journey?.[0]?.Segments?.[0]?.Fares?.TotalTax),
        net: formatAmount(pickFirst(pricing.net, raw.NetAmount)),
        gross: formatAmount(pickFirst(pricing.gross, raw.GrossAmount)),
        customerFare: formatAmount(pickFirst(pricing.customer_fare, raw.CustomerFare)),
        ssr: formatAmount(pickFirst(pricing.ssr_amount, raw.SSRAmount)),
      },
      journeys: toArray(data.journeys),
      passengers: toArray(data.passengers),
      baggage: toArray(data.baggage),
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
  const heading = isFailed
    ? "Flight Booking Failed"
    : isPending
      ? "Flight Booking Pending"
      : "Flight Booking Success";

  return (
    <>
      <Navbar />
      <main className={styles.page}>
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
