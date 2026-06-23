"use client";
import React from "react";
import styles from "./BookingSummary.module.css";
import { useRouter } from "next/navigation";

const formatCurrency = (value) =>
  `₹ ${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;

const BookingSummary = ({ roomList, onRemove, onBookNow }) => {
  const router = useRouter();

  const handleDelete = () => {
    onBookNow?.();
    router.push("/hotel-booking");
  };
  const summary = roomList.reduce(
    (totals, room) => {
      const quantity = Number(room.quantity || 0);
      const nights = Number(room.nights || 1);
      const offer = Number(room.pricePerNight || room.netAmount || 0);
      const published = Number(room.publishedRate || 0) || offer;
      const tax = Number(room.taxPerNight || 0);

      totals.base += published * quantity * nights;
      totals.discount += Math.max(0, published - offer) * quantity * nights;
      totals.taxes += tax * quantity * nights;
      totals.total += offer * quantity * nights + tax * quantity * nights;
      totals.nights = Math.max(totals.nights, nights);

      return totals;
    },
    { base: 0, discount: 0, taxes: 0, total: 0, nights: 1 },
  );

  return (
    <aside className={styles.wrapper}>
      {/* Header */}
      <div className={styles.header}>
        <h2>BOOKING SUMMARY</h2>
        <p>
          <span>2 night</span> starting from <span>Tue 30 Dec, 2025</span>
        </p>
      </div>

      <div className={styles.br}></div>
      {/* Rooms */}
      <div className={styles.roomSection}>
        {roomList.map((room) => {
          const roomTotal = room.pricePerNight * room.quantity * room.nights;

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
                  {formatCurrency(room.pricePerNight)} × {room.quantity} Room × {room.nights}{" "}
                  Nights
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
        <strong>{formatCurrency(summary.total)}</strong>
      </div>

      {/* CTA */}
      <button className={styles.bookBtn} onClick={handleDelete}>
        BOOK NOW
      </button>

      <div className={styles.help}>
        <div className={styles.br}></div>
        <h4>Need Help?</h4>
        <p>Call: 1800-123-4567</p>
        <p>Email: support@airline.com</p>
        <p className={styles.chat}>Live Chat Available</p>
      </div>
    </aside>
  );
};

export default BookingSummary;
