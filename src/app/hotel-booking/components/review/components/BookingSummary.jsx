"use client";
import React from "react";
import styles from "./BookingSummary.module.css";
import { useRoom } from "@/app/context/RoomContext";

const getNumber = (value) => {
  const number = Number(String(value || "").replace(/[^\d.-]/g, ""));
  return Number.isFinite(number) ? number : 0;
};

const formatCurrency = (value) =>
  `₹ ${Math.round(Number(value || 0)).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  })}`;

const getRoomTotal = (room, fallbackNights = 1) => {
  const quantity = Number(room.quantity || 0);
  const nights = Number(fallbackNights || room.nights || 1);
  const offer = getNumber(room.pricePerNight || room.netAmount);
  const tax = getNumber(room.taxPerNight);
  const rateIncludesTax = Boolean(room.rateIncludesTax);

  return (offer + (rateIncludesTax ? 0 : tax)) * quantity * nights;
};

const toApiDate = (value) => {
  if (!value) return "";
  const text = String(value).trim();

  if (["check-in", "check-out"].includes(text.toLowerCase())) return "";

  const isoMatch = text.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;

  const [first, second, year] = text.split(/[/-]/);
  if (first && second && year) {
    const firstNumber = Number(first);
    const secondNumber = Number(second);
    const isMonthFirst = firstNumber <= 12 && secondNumber > 12;
    const day = isMonthFirst ? second : first;
    const month = isMonthFirst ? first : second;

    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  const date = new Date(value);
  if (!Number.isNaN(date.getTime())) return date.toISOString().slice(0, 10);

  return "";
};

const getNightCountFromDates = (checkInValue, checkOutValue) => {
  const checkInDate = toApiDate(checkInValue);
  const checkOutDate = toApiDate(checkOutValue);
  if (!checkInDate || !checkOutDate) return 0;

  const start = new Date(`${checkInDate}T00:00:00`);
  const end = new Date(`${checkOutDate}T00:00:00`);
  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime()) ||
    end <= start
  ) {
    return 0;
  }

  return Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)));
};

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
  const { bookingSession, bookingLoading, hotelBookingStatus } = useRoom();
  const request = bookingSession?.request || {};
  const checkInSource =
    request.checkInDate ||
    request.checkInRaw ||
    request.checkIn ||
    request.check_in ||
    request.searchContext?.checkIn ||
    request.searchContext?.initPayload?.checkIn;
  const checkOutSource =
    request.checkOutDate ||
    request.checkOutRaw ||
    request.checkOut ||
    request.check_out ||
    request.searchContext?.checkOut ||
    request.searchContext?.initPayload?.checkOut;
  const dateDerivedNights = getNightCountFromDates(checkInSource, checkOutSource);
  const fallbackNights = dateDerivedNights || request.nights || 1;

  const handleBookNow = () => {
    if (bookingLoading || hotelBookingStatus) return;
    if (typeof window === "undefined") return;
    window.dispatchEvent(new Event("hotel-start-booking"));
  };
  const selectedRooms = roomList.filter((room) => Number(room.quantity) > 0);
  const summary = selectedRooms.reduce(
    (totals, room) => {
      const quantity = Number(room.quantity || 0);
      const nights = Number(
        dateDerivedNights || request.nights || (bookingSession ? room.nights : "") || 1,
      );
      const offer = getNumber(room.pricePerNight || room.netAmount);
      const published = getNumber(room.publishedRate) || offer;
      const tax = getNumber(room.taxPerNight);
      const rateIncludesTax = Boolean(room.rateIncludesTax);

      totals.base += published * quantity * nights;
      totals.discount += Math.max(0, published - offer) * quantity * nights;
      totals.taxes += tax * quantity * nights;
      totals.total += (offer + (rateIncludesTax ? 0 : tax)) * quantity * nights;
      totals.nights = Math.max(totals.nights, nights);

      return totals;
    },
    {
      base: 0,
      discount: 0,
      couponDiscount: getNumber(request.couponDiscount),
      taxes: 0,
      total: 0,
      nights: fallbackNights,
    },
  );
  const nights = summary.nights || fallbackNights;
  const checkInDate = getDisplayDate(checkInSource);

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
            const roomTotal = getRoomTotal(room, nights);

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
              <span className={styles.discount}>-{formatCurrency(summary.discount)}</span>
            </div>
          )}
          {summary.couponDiscount > 0 && (
            <div className={styles.row}>
              <span className={styles.rowTitle}>Coupon Discount</span>
              <span className={styles.discount}>-{formatCurrency(summary.couponDiscount)}</span>
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
          disabled={bookingLoading || Boolean(hotelBookingStatus)}
        >
          {hotelBookingStatus
            ? "PAYMENT IN PROGRESS"
            : bookingLoading
              ? "LOADING..."
              : "BOOK NOW"}
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
