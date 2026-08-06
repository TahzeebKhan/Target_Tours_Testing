"use client";

import { createPortal } from "react-dom";
import { useEffect, useMemo, useState } from "react";
import styles from "./PackageSuccessModal.module.css";

const pickFirst = (...values) => {
  for (const value of values) {
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return "";
};

const formatCurrency = (value) => {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "N/A";
  return `₹ ${amount.toLocaleString("en-IN")}`;
};

const formatDate = (value) => {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getBookingData = (booking) =>
  booking?.data?.package_booking ||
  booking?.package_booking ||
  booking?.data?.booking ||
  booking?.booking ||
  booking?.data ||
  booking ||
  {};

export default function PackageSuccessModal({
  isOpen,
  onClose,
  onDone,
  booking,
  packageDetails,
  prices,
  travelerDetails = [],
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const details = useMemo(() => {
    const bookingData = getBookingData(booking);
    const payment = booking?.data?.payment || booking?.payment || {};
    const message = pickFirst(
      booking?.message,
      booking?.data?.message,
      "Booking created successfully."
    );

    return {
      message,
      bookingId: pickFirst(bookingData?.id, bookingData?.booking_id, "N/A"),
      bookingRef: pickFirst(bookingData?.booking_ref, bookingData?.bookingRef, "N/A"),
      packageId: pickFirst(
        bookingData?.package?.id,
        bookingData?.package_id,
        packageDetails?.id,
        "N/A"
      ),
      status: pickFirst(
        bookingData?.booking_status,
        bookingData?.status,
        payment?.booking_status,
        "SUCCESS"
      ),
      paymentStatus: pickFirst(
        bookingData?.payment_status,
        payment?.payment_status,
        "SUCCESS"
      ),
      paymentMode: pickFirst(bookingData?.payment_mode, payment?.payment_mode, "N/A"),
      amount: pickFirst(bookingData?.amount_paid, payment?.amount_paid, prices?.total),
      unitPrice: pickFirst(bookingData?.unit_price, packageDetails?.price?.adult),
      startDate: pickFirst(bookingData?.start_date_time, packageDetails?.startDate),
      endDate: pickFirst(bookingData?.end_date_time, packageDetails?.endDate),
      selectedActivitiesCount: pickFirst(
        bookingData?.selected_activities_count,
        packageDetails?.selectedActivities?.length,
        0
      ),
      travelerCount: travelerDetails.length || prices?.travelerCount || 1,
    };
  }, [booking, packageDetails, prices, travelerDetails.length]);

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div className={styles.overlay}>
      <div className={styles.modal} role="dialog" aria-modal="true">
        <div className={styles.header}>
          <div>
            <p className={styles.status}>{details.status}</p>
            <h2 className={styles.title}>Package Booking Confirmed</h2>
            <p className={styles.subtitle}>{details.message}</p>
          </div>
          <button type="button" className={styles.closeButton} onClick={onClose}>
            x
          </button>
        </div>

        <div className={styles.tripCard}>
          <img
            className={styles.tripImage}
            src={packageDetails?.image || "/images/splendorsImg.png"}
            alt=""
          />
          <div className={styles.tripContent}>
            <h3>{packageDetails?.title || "Package booking"}</h3>
            <p>{packageDetails?.routeLabel || packageDetails?.durationLabel || "Tour package"}</p>
          </div>
        </div>

        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <span>Booking Ref</span>
            <strong>{details.bookingRef}</strong>
          </div>
          <div className={styles.infoItem}>
            <span>Booking ID</span>
            <strong>{details.bookingId}</strong>
          </div>
          <div className={styles.infoItem}>
            <span>Package ID</span>
            <strong>{details.packageId}</strong>
          </div>
          <div className={styles.infoItem}>
            <span>Payment</span>
            <strong>{details.paymentStatus}</strong>
          </div>
          <div className={styles.infoItem}>
            <span>Amount Paid</span>
            <strong>{formatCurrency(details.amount)}</strong>
          </div>
          <div className={styles.infoItem}>
            <span>Travelers</span>
            <strong>{details.travelerCount}</strong>
          </div>
        </div>

        <div className={styles.detailSection}>
          <h3>Travel Details</h3>
          <div className={styles.detailList}>
            <div>
              <span>Start</span>
              <strong>{formatDate(details.startDate)}</strong>
            </div>
            <div>
              <span>End</span>
              <strong>{formatDate(details.endDate)}</strong>
            </div>
            <div>
              <span>Selected Activities</span>
              <strong>{details.selectedActivitiesCount}</strong>
            </div>
            <div>
              <span>Unit Price</span>
              <strong>{formatCurrency(details.unitPrice)}</strong>
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <button type="button" onClick={onDone || onClose}>
            Done
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
