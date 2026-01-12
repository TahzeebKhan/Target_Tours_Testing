"use client";
import React from "react";
import styles from "./BookingSummary.module.css";
import { Delete, Trash, Trash2, Trash2Icon } from "lucide-react";
import { useRouter } from "next/navigation";

const BookingSummary = () => {
    const router = useRouter();

    const handleDelete = () => {
        router.push("/hotel-booking");
    }
    return (
        <aside className={styles.wrapper}>
            {/* Header */}
            <div className={styles.header}>
                <h2>BOOKING SUMMARY</h2>
                <p><span>2 night</span> starting from <span>Tue 30 Dec, 2025</span></p>
            </div>

            <div className={styles.br}></div>
            {/* Rooms */}
            <div className={styles.roomSection}>
                <div className={styles.roomItem}>
                    <div className={styles.roomLeft}>
                        <h4>Deluxe Private AC Room with Ensuite Bathroom</h4>
                        <img src="/icons/trash.svg" alt="delete" />

                    </div>
                    <div className={styles.roomRight}>
                        <span>₹2245.5 × 1 Room × 8 Nights</span>
                        <span className={styles.price}>₹ 64,126</span>

                    </div>
                </div>
                <div className={styles.br}></div>

                <div className={styles.roomItem}>
                    <div className={styles.roomLeft}>
                        <h4>Premium Private AC Room with Ensuite Bathroom</h4>
                        <img src="/icons/trash.svg" alt="delete" />
                    </div>
                    <div className={styles.roomRight}>
                        <span>₹2245.5 × 1 Room × 8 Nights</span>
                        <span className={styles.price}>₹ 64,126</span>
                    </div>
                </div>
            </div>

            <div className={styles.br}></div>
            {/* Price Breakup */}
            <div className={styles.priceBreakup}>
                <div className={styles.row}>
                    <span className={styles.rowTitle}>Base Price</span>
                    <span className={styles.basePrice}>₹ 64,126</span>
                </div>
                <div className={styles.row}>
                    <span className={styles.rowTitle}>Discount</span>
                    <span className={styles.discount}>-₹5538.56</span>
                </div>
                <div className={styles.row}>
                    <span className={styles.rowTitle}>Coupon Discount</span>
                    <span className={styles.discount}>-₹5538.56</span>
                </div>
                <div className={styles.row}>
                    <span className={styles.rowTitle}>Taxes & Fees</span>
                    <span className={styles.taxes}>₹2,819</span>
                </div>
            </div>

            {/* Total */}
            <div className={styles.total}>
                <span>Total Amount</span>
                <strong>₹ 66,945</strong>
            </div>

            {/* CTA */}
            <button className={styles.bookBtn} onClick={handleDelete}>BOOK NOW</button>


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
