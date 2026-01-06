"use client";

import { useState } from "react";
import styles from "./RoomPriceRow.module.css";

export default function RoomPriceRow({
    image,
    title,
    price,
    quantity,
    maxQuantity = 5,
    onIncrease,
    onDecrease,
}) {

    return (
        <div className={styles.card}>
            {/* Image */}
            <img src={image} alt={title} className={styles.image} />

            {/* Content */}
            <div className={styles.contentContainer}>
                <div className={styles.content}>
                    <p className={styles.title}>{title}</p>
                </div>

                {/* Price */}
                <div className={styles.priceContainer}>
                    <div className={styles.priceSection}>
                        <p className={styles.price}>₹ {price.toFixed(2)}</p>
                        <p className={styles.perNight}>per/night</p>
                    </div>

                    {/* Counter */}
                    <div className={styles.counter}>
                        <button
                            className={styles.btn}
                            onClick={onDecrease}
                            disabled={quantity <= 1}
                        >
                            −
                        </button>

                        <span className={styles.count}>{quantity}</span>

                        <button className={styles.btn} onClick={onIncrease}>
                            +
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
