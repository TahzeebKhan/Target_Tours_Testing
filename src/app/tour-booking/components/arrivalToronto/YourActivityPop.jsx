"use client";
import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import styles from "./YourActivityPop.module.css";

const YourActivityPop = ({ isOpen, hotel, onClose }) => {
    const [selected, setSelected] = useState([]);


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
                            <h4>{hotel?.title ? hotel.title : hotel?.category ? hotel.category : 'Details'}</h4>
                            <button onClick={onClose} className={styles.closeBtn}>✕</button>
                        </div>

                        {/* CONTENT */}
                        <div className={styles.popupContent}>
                            <div className={styles.popupRight}>
                                <div className={styles.cardContent}>
                                    <div className={styles.cardTop}>
                                        <h4 className={styles.eveningActivity}>EVENING ACTIVITY</h4>
                                        <h3 className={styles.hotelTitle}>{hotel?.title}</h3>
                                        <div className={styles.schaduleTime}>
                                            <img src="/icons/watchBlack.svg" alt="" />
                                            <span>6:00 PM - 7:30 PM</span>

                                        </div>
                                    </div>
                                    <p className={styles.hotelDec}>The Oberoi, New Delhi is situated in the heart of central Delhi overlooking the fairways of The Delhi Golf Course. The contemporary luxury hotel has 220 modern guest rooms and suites with teakwood floors, walk-in closets, luxury Italian marble bathrooms, and large picture windows that overlook either the greens or historic Humayun's Tomb.</p>

                                </div>
                                <div className={styles.popupRight}>
                                    <button className={styles.confirmBtn}>Add +</button>
                                </div>
                            </div>

                            {/* LEFT IMAGE */}
                            <div className={styles.popupLeft}>
                                <img src={hotel.images?.[0] ?? hotel.image} alt={hotel.title ?? hotel.category ?? ''} />
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default YourActivityPop;
