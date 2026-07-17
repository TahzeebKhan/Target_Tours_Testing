"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "../flight-booking-details/Navbar";
import styles from "./page.module.css";

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
  const amount =
    typeof value === "string" ? Number(value.replace(/[^\d.]/g, "")) : Number(value);
  if (!Number.isFinite(amount) || amount <= 0) return "N/A";
  return `INR ${amount.toLocaleString("en-IN")}`;
};

const formatStatus = (value) =>
  String(value || "SUCCESS")
    .replace(/[_-]+/g, " ")
    .toUpperCase();

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
  payload?.success === false || payload?.data?.success === false;

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

  if (!response.ok) {
    throw new Error(
      data?.message ||
        data?.data?.message ||
        data?.error?.message ||
        fallbackMessage
    );
  }

  return data;
};

function PaymentStatusContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [snapshot, setSnapshot] = useState({});
  const [retrieveResponse, setRetrieveResponse] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setSnapshot(readFlightPaymentSnapshot());
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
      if (!bookingId) {
        setErrorMessage("Flight booking id is missing from the payment response.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setErrorMessage("");

      try {
        const domain = process.env.NEXT_PUBLIC_DOMAIN || "localhost:1337";

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
        if (isSuccessFalse(data)) {
          setRetrieveResponse(null);
          return;
        }

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
  }, [bookingId, confirmBookingId, searchKey, snapshot.createdAt]);

  const details = useMemo(() => {
    const data = getResponseData(retrieveResponse);
    const paymentData = getResponseData(snapshot.paymentResponse);
    const status = pickFirst(
      data.payment_status,
      data.paymentStatus,
      data.booking_status,
      data.bookingStatus,
      data.status,
      paymentData.state,
      paymentData.status,
      "SUCCESS"
    );

    return {
      status,
      bookingId: pickFirst(
        data.booking_id,
        data.bookingId,
        data.id,
        bookingId,
        snapshot.bookingId,
        "N/A"
      ),
      merchantOrderId: pickFirst(
        data.merchant_order_id,
        data.merchantOrderId,
        snapshot.merchantOrderId,
        paymentData.merchant_order_id,
        "N/A"
      ),
      transactionId: pickFirst(
        data.TransactionID,
        data.transactionId,
        snapshot.transactionId,
        "N/A"
      ),
      amount: formatAmount(
        pickFirst(
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
      message: pickFirst(
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
                <span className={`${styles.statusIcon} ${isFailed ? styles.errorIcon : ""}`}>
                  {isFailed ? "!" : "OK"}
                </span>
                <div>
                  <p className={isFailed ? styles.errorLabel : styles.successLabel}>
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

              <div className={styles.actions}>
                <button type="button" onClick={() => router.push("/profile")}>
                  View bookings
                </button>
                <button type="button" onClick={() => router.push("/")}>
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
