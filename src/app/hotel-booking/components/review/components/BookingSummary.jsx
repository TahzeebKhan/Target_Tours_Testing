"use client";
import React from "react";
import styles from "./BookingSummary.module.css";
import { useRoom } from "@/app/context/RoomContext";

const getNumber = (value) => {
  const number = Number(String(value || "").replace(/[^\d.-]/g, ""));
  return Number.isFinite(number) ? number : 0;
};

const formatCurrency = (value) =>
  `₹ ${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;

const getDisplayDate = (value, fallback = "Check-in") => {
  if (!value || ["check-in", "check-out"].includes(String(value).toLowerCase())) {
    return fallback;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const BookingSummary = ({
  setSideBarOpen,
  sidebarOpen,
  roomList,
  onRemove,
}) => {
  const { bookingSession, bookingLoading } = useRoom();
  const request = bookingSession?.request || {};

  const handleBookNow = () => {
    if (bookingLoading) return;
    if (typeof window === "undefined") return;
    window.dispatchEvent(new Event("hotel-start-booking"));
  };
  const selectedRooms = roomList.filter((room) => Number(room.quantity) > 0);
  const summary = selectedRooms.reduce(
    (totals, room) => {
      const quantity = Number(room.quantity || 0);
      const nights = Number(room.nights || request.nights || 1);
      const offer = getNumber(room.pricePerNight || room.netAmount);
      const published = getNumber(room.publishedRate) || offer;
      const tax = getNumber(room.taxPerNight);

      totals.base += published * quantity * nights;
      totals.discount += Math.max(published - offer, 0) * quantity * nights;
      totals.taxes += tax * quantity * nights;
      totals.total += offer * quantity * nights + tax * quantity * nights;
      totals.nights = Math.max(totals.nights, nights);

      return totals;
    },
    {
      base: 0,
      discount: 0,
      couponDiscount: getNumber(request.couponDiscount),
      taxes: 0,
      total: 0,
      nights: 1,
    },
  );
  const nights = summary.nights || request.nights || 1;
  const checkInDate = getDisplayDate(
    request.checkInDate || request.checkInRaw || request.checkIn || request.check_in,
  );

  return (
    <>
      <aside className={styles.wrapper}>
        {/* Header */}
        <div className={styles.header}>
          <h2>BOOKING SUMMARY</h2>
          <p>
            <span>{nights} night{Number(nights) === 1 ? "" : "s"}</span> starting from{" "}
            <span>{checkInDate}</span>
          </p>
          <div
            onClick={() => setSideBarOpen(false)}
            className={styles.closeIcon}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M15 5L5 15"
                stroke="black"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M5 5L15 15"
                stroke="black"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        <div className={styles.br}></div>
        {/* Rooms */}
        <div className={styles.roomSection}>
          {selectedRooms.map((room) => {
            const quantity = Number(room.quantity || 0);
            const roomNights = Number(room.nights || nights || 1);
            const roomPrice = getNumber(room.pricePerNight || room.netAmount);
            const roomTax = getNumber(room.taxPerNight);
            const roomTotal = (roomPrice + roomTax) * quantity * roomNights;

            return (
              <div key={room.id} className={styles.roomItem}>
                <div className={styles.roomLeft}>
                  <h4>{room.title}</h4>
                  <img
                    src="/icons/trash.svg"
                    alt="delete"
                    onClick={() => onRemove(room.id)}
                    style={{ cursor: "pointer" }}
                  />
                </div>

                <div className={styles.roomRight}>
                  <span>
                    {formatCurrency(roomPrice)} × {quantity} Room × {roomNights}{" "}
                    Night{roomNights === 1 ? "" : "s"}
                  </span>
                  <span className={styles.price}>{formatCurrency(roomTotal)}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className={styles.br}></div>
        {/* Price Breakup */}
        <div className={styles.priceBreakup}>
          <div className={styles.row}>
            <span className={styles.rowTitle}>Base Price</span>
            <span className={styles.basePrice}>{formatCurrency(summary.base)}</span>
          </div>
          {summary.discount > 0 && (
            <div className={styles.row}>
              <span className={styles.rowTitle}>Discount</span>
              <span className={styles.discount}>{formatCurrency(summary.discount)}</span>
            </div>
          )}
          {summary.couponDiscount > 0 && (
            <div className={styles.row}>
              <span className={styles.rowTitle}>Coupon Discount</span>
              <span className={styles.discount}>{formatCurrency(summary.couponDiscount)}</span>
            </div>
          )}
          {summary.taxes > 0 && (
            <div className={styles.row}>
              <span className={styles.rowTitle}>Taxes & Fees</span>
              <span className={styles.taxes}>{formatCurrency(summary.taxes)}</span>
            </div>
          )}
        </div>

        {/* Total */}
        <div className={styles.total}>
          <span>Total Amount</span>
          <strong>{formatCurrency(summary.total - summary.couponDiscount)}</strong>
        </div>
        <div className={styles.incldeAllTaxes}>
          Includes taxes and service fees
        </div>

        {/* CTA */}
        <button
          className={styles.bookBtn}
          onClick={handleBookNow}
          disabled={bookingLoading}
        >
          {bookingLoading ? "LOADING..." : "BOOK NOW"}
        </button>

        <div className={styles.help}>
          <div className={styles.br}></div>
          <h4>Need Help?</h4>
          <p>Call: 1800-123-4567</p>
          <p>Email: support@airline.com</p>
          <p className={styles.chat}>Live Chat Available</p>
        </div>
      </aside>
    </>
  );
};

export default BookingSummary;
