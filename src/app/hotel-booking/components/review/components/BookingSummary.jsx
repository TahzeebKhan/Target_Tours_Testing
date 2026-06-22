"use client";
import React from "react";
import styles from "./BookingSummary.module.css";
import { Delete, Trash, Trash2, Trash2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRoom } from "@/app/context/RoomContext";

const BookingSummary = ({
  setSideBarOpen,
  sidebarOpen,
  roomList,
  onRemove,
}) => {
  const router = useRouter();
  const { bookingSession } = useRoom();
  const request = bookingSession?.request || {};

  const handleDelete = () => {
    router.push("/hotel-booking");
  };
  const basePrice = roomList.reduce(
    (sum, r) => sum + r.pricePerNight * r.quantity * r.nights,
    0
  );
  const nights = roomList[0]?.nights || request.nights || 1;

  return (
    <>
      <aside className={styles.wrapper}>
        {/* Header */}
        <div className={styles.header}>
          <h2>BOOKING SUMMARY</h2>
          <p>
            <span>{nights} night</span> starting from{" "}
            <span>{request.checkIn || "Check-in"}</span>
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
                    ₹{room.pricePerNight} × {room.quantity} Room × {room.nights}{" "}
                    Nights
                  </span>
                  <span className={styles.price}>₹ {roomTotal.toFixed(2)}</span>
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
            <span className={styles.basePrice}>₹ {basePrice.toFixed(2)}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.rowTitle}>Discount</span>
            <span className={styles.discount}>-₹0</span>
          </div>
          <div className={styles.row}>
            <span className={styles.rowTitle}>Coupon Discount</span>
            <span className={styles.discount}>-₹0</span>
          </div>
          <div className={styles.row}>
            <span className={styles.rowTitle}>Taxes & Fees</span>
            <span className={styles.taxes}>₹0</span>
          </div>
        </div>

        {/* Total */}
        <div className={styles.total}>
          <span>Total Amount</span>
          <strong>₹ {basePrice.toFixed(2)}</strong>
        </div>
        <div className={styles.incldeAllTaxes}>
          Includes taxes and service fees
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
    </>
  );
};

export default BookingSummary;
