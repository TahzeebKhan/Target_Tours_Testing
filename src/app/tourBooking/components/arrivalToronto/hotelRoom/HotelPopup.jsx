"use client";
import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import styles from "./HotelRoom.module.css";

const HotelPopup = ({ isOpen, hotel, onClose }) => {
    const [selected, setSelected] = useState([]);

    const hotels = [
        {
            title: "SERENE HAVEN INN, TORONTO",
            description:
                "The Oberoi, New Delhi is situated in the heart of central Delhi overlooking the fairways of The Delhi Golf Course. The contemporary luxury hotel has 220 modern guest rooms and suites with teakwood floors, walk-in closets, luxury Italian marble bathrooms, and large picture windows that overlook either the greens or historic Humayun's Tomb. Butler service is available 24 hours a day. Restaurants include an all-day international eatery, a contemporary Indian restaurant and a Chinese restaurant perched on the rooftop. Other amenities include a spa, po",
        },
        {
            title: "CALM WATERS LODGE, TORONTO",
            description:
                "The Oberoi, New Delhi is situated in the heart of central Delhi overlooking the fairways of The Delhi Golf Course. The contemporary luxury hotel has 220 modern guest rooms and suites with teakwood floors, walk-in closets, luxury Italian marble bathrooms, and large picture windows that overlook either the greens or historic Humayun's Tomb. Butler service is available 24 hours a day. Restaurants include an all-day international eatery, a contemporary Indian restaurant and a Chinese restaurant perched on the rooftop. Other amenities include a spa, po",
        },
        
    ];

    return (
        <AnimatePresence>
            {isOpen && hotel && (
                <motion.div
                    className={styles.popupOverlay}
                    onClick={onClose}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        className={styles.popupCard}
                        onClick={(e) => e.stopPropagation()}
                        initial={{ opacity: 0, y: -40, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: "auto" }}
                        exit={{ opacity: 0, y: -40, height: 0 }}
                        transition={{ duration: 0.45, ease: [0.25, 1, 0.5, 1] }}
                    >
                        {/* HEADER */}
                        <div className={styles.popupHeader}>
                            {/* <h4>Your Hotel Options{hotel?.title ? ` — ${hotel.title}` : ' Toronto, Canada'}</h4> */}
                            <h4>Your Hotel Options
Toronto, Canada</h4>
                            <button onClick={onClose} className={styles.closeBtn}>✕</button>
                        </div>

                        {/* CONTENT */}
                        <div className={styles.popupContent}>
                            {/* RIGHT SIDE */}
                            <div className={styles.popupRight}>
                                {hotels.map((item, index) => (
                                    <div key={index} className={styles.itemWrapper}>
                                        {/* CLICKABLE ROW */}
                                        <div
                                            className={`${styles.item} ${selected.includes(index) ? styles.activeItem : ""
                                                }`}
                                            onClick={() =>
                                                setSelected((prev) =>
                                                    prev.includes(index)
                                                        ? prev.filter((i) => i !== index) // close
                                                        : [...prev, index]                // open
                                                )
                                            }
                                        >
                                            <h3 className={styles.title}>{item.title}</h3>
                                            <div
                                                className={`${styles.radio} ${selected.includes(index) ? styles.active : ""
                                                    }`}
                                            />
                                        </div>

                                        {/* DESCRIPTION (accordion) */}
                                        <AnimatePresence>
                                            {selected.includes(index) && (
                                                <motion.p
                                                    className={`${styles.itemDescription} ${selected.includes(index) ? styles.activeItemDex : ""}`}
                                                    initial={{ height: 0 }}
                                                    animate={{ height: "auto" }}
                                                    exit={{ height: 0 }}
                                                    transition={{ duration: 0.1, ease: "easeOut" }}
                                                >
                                                    {item.description}
                                                </motion.p>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                ))}

                                <button className={styles.confirmBtn}>confirm</button>
                            </div>

                            {/* LEFT IMAGE */}
                            <div className={styles.popupLeft}>
                                <img src={hotel.images?.[0]} alt={hotel.title} />
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default HotelPopup;
