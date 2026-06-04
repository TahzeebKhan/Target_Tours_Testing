"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { confirmPackageBooking } from "../services/packageBooking";
import styles from "./page.module.css";

const pickFirst = (...values) =>
  values.find((value) => value !== undefined && value !== null && value !== "");

const formatCurrency = (value) => {
  const amount =
    typeof value === "string"
      ? Number(value.replace(/[^\d.]/g, ""))
      : Number(value);
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

const readPaymentSnapshot = () => {
  if (typeof window === "undefined") return {};

  try {
    const savedValue = window.localStorage.getItem("tourPackagePaymentSnapshot");
    return savedValue ? JSON.parse(savedValue) : {};
  } catch {
    return {};
  }
};

function PackagePaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [bookingResponse, setBookingResponse] = useState(null);
  const [paymentSnapshot, setPaymentSnapshot] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const merchantOrderId = useMemo(() => {
    if (typeof window === "undefined") return "";

    return (
      getMerchantOrderIdFromParams(searchParams) ||
      window.localStorage.getItem("tourPackagePaymentMerchantId") ||
      readPaymentSnapshot()?.merchantId ||
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
        setPaymentSnapshot(readPaymentSnapshot());
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
    const snapshotPackage = paymentSnapshot?.packageDetails || {};
    const snapshotPrices = paymentSnapshot?.prices || {};
    const snapshotPayment =
      paymentSnapshot?.paymentResponse?.data ||
      paymentSnapshot?.paymentResponse ||
      {};

    return {
      message: pickFirst(
        bookingResponse?.message,
        bookingResponse?.data?.message,
        "Package booking confirmed successfully."
      ),
      bookingId: pickFirst(booking?.id, "N/A"),
      bookingRef: pickFirst(
        packageBooking?.booking_ref,
        packageBooking?.bookingRef,
        booking?.booking_ref,
        booking?.bookingRef,
        booking?.booking_id,
        packageBooking?.booking_id,
        "N/A"
      ),
      merchantOrderId: pickFirst(
        payment?.merchant_order_id,
        payment?.merchantOrderId,
        booking?.merchant_order_id,
        snapshotPayment?.merchant_order_id,
        snapshotPayment?.merchantOrderId,
        merchantOrderId,
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
      transactionId: pickFirst(
        payment?.transaction_id,
        payment?.transactionId,
        payment?.payment_id,
        payment?.paymentId,
        snapshotPayment?.transaction_id,
        snapshotPayment?.transactionId,
        "N/A"
      ),
      bookingStatus: pickFirst(
        booking?.booking_status,
        payment?.booking_status,
        "APPROVED"
      ),
      amount: pickFirst(
        booking?.amount_paid,
        packageBooking?.amount_paid,
        payment?.amount_paid,
        booking?.total_amount,
        payment?.amount,
        snapshotPrices?.total,
        snapshotPayment?.amount
      ),
      packageTitle: pickFirst(snapshotPackage?.title, booking?.package?.title, "Package booking"),
      packageImage: pickFirst(snapshotPackage?.image, booking?.package?.image, "/images/splendorsImg.png"),
      startDate: pickFirst(snapshotPackage?.startDate, booking?.start_date_time, "N/A"),
      endDate: pickFirst(snapshotPackage?.endDate, booking?.end_date_time, "N/A"),
      durationLabel: pickFirst(snapshotPackage?.durationLabel, "N/A"),
      fromCity: pickFirst(snapshotPackage?.fromCity, "N/A"),
      travelerCount: pickFirst(paymentSnapshot?.travelerCount, snapshotPrices?.travelerCount, 1),
      baseFare: pickFirst(snapshotPrices?.baseFare, snapshotPrices?.total, booking?.amount_paid),
      taxes: pickFirst(snapshotPackage?.price?.taxes, booking?.taxes, 0),
    };
  }, [bookingResponse, merchantOrderId, paymentSnapshot]);

  const handleDone = () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("tourPackagePaymentSnapshot");
    }
    router.push("/tour-list");
  };

  return (
    <main className={styles.page}>
      <div className={styles.backgroundPanel} />
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

            <div className={styles.summaryGrid}>
              <div className={styles.packageCard}>
                <img src={details.packageImage} alt="" />
                <div>
                  <h2>{details.packageTitle}</h2>
                  <p>
                    {details.startDate} - {details.endDate}
                    {details.fromCity !== "N/A" ? ` / From ${details.fromCity}` : ""}
                  </p>
                  <span>{details.durationLabel}</span>
                </div>
              </div>

              <div className={styles.priceCard}>
                <h2>Price Summary</h2>
                <div>
                  <span>{details.travelerCount}x Adult</span>
                  <strong>{formatCurrency(details.baseFare)}</strong>
                </div>
                <div>
                  <span>Taxes & Fees</span>
                  <strong>{formatCurrency(details.taxes)}</strong>
                </div>
                <div className={styles.totalLine}>
                  <span>Total Amount</span>
                  <strong>{formatCurrency(details.amount)}</strong>
                </div>
              </div>
            </div>

            <div className={styles.infoGrid}>
              <div>
                <span>Booking No.</span>
                <strong>{details.bookingRef}</strong>
              </div>
              <div>
                <span>Merchant Order ID</span>
                <strong>{details.merchantOrderId}</strong>
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
                <span>Transaction ID</span>
                <strong>{details.transactionId}</strong>
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
              <button type="button" onClick={handleDone}>
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
