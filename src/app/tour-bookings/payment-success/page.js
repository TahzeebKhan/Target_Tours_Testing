"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { confirmPackageBooking } from "../services/packageBooking";
import styles from "./page.module.css";

const pickFirst = (...values) =>
  values.find((value) => value !== undefined && value !== null && value !== "");

const formatCurrency = (value) => {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "N/A";
  return `₹ ${amount.toLocaleString("en-IN")}`;
};

const getMerchantOrderIdFromParams = (searchParams) =>
  pickFirst(
    searchParams.get("merchant_order_id"),
    searchParams.get("merchantOrderId"),
    searchParams.get("merchantId"),
    searchParams.get("merchant_id"),
    searchParams.get("orderId"),
    searchParams.get("order_id"),
    searchParams.get("transactionId"),
    searchParams.get("transaction_id")
  );

const readBookingContactInfo = () => {
  if (typeof window === "undefined") return {};

  try {
    const savedValue = window.localStorage.getItem("tourPackageBookingContactInfo");
    return savedValue ? JSON.parse(savedValue) : {};
  } catch {
    return {};
  }
};

function PackagePaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [bookingResponse, setBookingResponse] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const merchantOrderId = useMemo(() => {
    if (typeof window === "undefined") return "";

    return (
      getMerchantOrderIdFromParams(searchParams) ||
      window.localStorage.getItem("tourPackagePaymentMerchantId") ||
      ""
    );
  }, [searchParams]);

  useEffect(() => {
    let isActive = true;

    const createBooking = async () => {
      if (!merchantOrderId) {
        setError("Merchant order ID is missing from the payment response.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");
      try {
        const bookingContactInfo = readBookingContactInfo();
        const response = await confirmPackageBooking({
          merchant_order_id: merchantOrderId,
          booking_contact_info: {
            country_code: bookingContactInfo?.country_code || "+91",
            mobile_number: bookingContactInfo?.mobile_number || "",
            email: bookingContactInfo?.email || "",
          },
        });
        if (!isActive) return;

        setBookingResponse(response);
        window.localStorage.removeItem("tourPackagePaymentMerchantId");
        window.localStorage.removeItem("tourPackageBookingContactInfo");
      } catch (err) {
        if (!isActive) return;

        setError(
          err?.response?.data?.message ||
            err?.response?.data?.error?.message ||
            err?.message ||
            "Unable to confirm package booking."
        );
      } finally {
        if (isActive) setLoading(false);
      }
    };

    createBooking();

    return () => {
      isActive = false;
    };
  }, [merchantOrderId]);

  const details = useMemo(() => {
    const booking = bookingResponse?.data?.booking || bookingResponse?.booking || {};
    const packageBooking =
      bookingResponse?.data?.package_booking ||
      bookingResponse?.package_booking ||
      {};
    const payment = bookingResponse?.data?.payment || bookingResponse?.payment || {};

    return {
      message: pickFirst(
        bookingResponse?.message,
        bookingResponse?.data?.message,
        "Package booking confirmed successfully."
      ),
      bookingId: pickFirst(booking?.id, "N/A"),
      bookingRef: pickFirst(
        booking?.booking_id,
        packageBooking?.booking_id,
        booking?.booking_ref,
        booking?.bookingRef,
        "N/A"
      ),
      packageBookingId: pickFirst(packageBooking?.id, "N/A"),
      packageId: pickFirst(
        packageBooking?.package_id,
        booking?.package?.id,
        booking?.package_id,
        "N/A"
      ),
      paymentStatus: pickFirst(
        booking?.payment_status,
        payment?.payment_status,
        "SUCCESS"
      ),
      bookingStatus: pickFirst(
        booking?.booking_status,
        payment?.booking_status,
        "APPROVED"
      ),
      amount: pickFirst(
        booking?.amount_paid,
        packageBooking?.amount_paid,
        payment?.amount_paid
      ),
    };
  }, [bookingResponse]);

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        {loading ? (
          <>
            <p className={styles.status}>Processing</p>
            <h1 className={styles.title}>Confirming your booking</h1>
            <p className={styles.subtitle}>
              Please wait while we verify the payment and create your package booking.
            </p>
          </>
        ) : error ? (
          <>
            <p className={styles.errorStatus}>Action Needed</p>
            <h1 className={styles.title}>Booking confirmation failed</h1>
            <p className={styles.subtitle}>{error}</p>
            <div className={styles.actions}>
              <button type="button" onClick={() => router.push("/tour-bookings")}>
                Back to Booking
              </button>
            </div>
          </>
        ) : (
          <>
            <p className={styles.status}>Approved</p>
            <h1 className={styles.title}>Package Booking Confirmed</h1>
            <p className={styles.subtitle}>{details.message}</p>

            <div className={styles.infoGrid}>
              <div>
                <span>Merchant Order ID</span>
                <strong>{merchantOrderId}</strong>
              </div>
              <div>
                <span>Booking Ref</span>
                <strong>{details.bookingRef}</strong>
              </div>
              <div>
                <span>Booking ID</span>
                <strong>{details.bookingId}</strong>
              </div>
              <div>
                <span>Package Booking ID</span>
                <strong>{details.packageBookingId}</strong>
              </div>
              <div>
                <span>Package ID</span>
                <strong>{details.packageId}</strong>
              </div>
              <div>
                <span>Payment</span>
                <strong>{details.paymentStatus}</strong>
              </div>
              <div>
                <span>Booking Status</span>
                <strong>{details.bookingStatus}</strong>
              </div>
              <div>
                <span>Amount Paid</span>
                <strong>{formatCurrency(details.amount)}</strong>
              </div>
            </div>

            <div className={styles.actions}>
              <button type="button" onClick={() => router.push("/tour-list")}>
                Done
              </button>
            </div>
          </>
        )}
      </section>
    </main>
  );
}

export default function PackagePaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <main className={styles.page}>
          <section className={styles.card}>
            <p className={styles.status}>Processing</p>
            <h1 className={styles.title}>Confirming your booking</h1>
            <p className={styles.subtitle}>
              Please wait while we verify the payment and create your package booking.
            </p>
          </section>
        </main>
      }
    >
      <PackagePaymentSuccessContent />
    </Suspense>
  );
}
