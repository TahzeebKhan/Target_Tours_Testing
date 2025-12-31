"use client";
import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import styles from "./HotelRoom.module.css"

const HotelPopup = ({ isOpen, hotel, onClose }) => {
    const [selected, setSelected] = useState(null);
    const hotels = [
        "SERENE HAVEN INN, TORONTO",
        "CALM WATERS LODGE, TORONTO",
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
                        initial={{ scale: 0.92, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.92, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                    >
                        {/* HEADER */}
                        <div className={styles.popupHeader}>
                            <h4>
                                Your Hotel Options Toronto, Canada
                            </h4>
                            <button onClick={onClose} className={styles.closeBtn}>
                                ✕
                            </button>
                        </div>

                        {/* CONTENT */}
                        <div className={styles.popupContent}>


                            <div className={styles.popupRight}>
                                {hotels.map((hotel, index) => (
                                    <div
                                        key={index}
                                        className={styles.item}
                                        onClick={() => setSelected(index)}
                                    >
                                        <h3 className={styles.title}>{hotel}</h3>

                                        <div
                                            className={`${styles.radio} ${selected === index ? styles.active : ""
                                                }`}
                                        />
                                    </div>
                                ))}
                            </div>

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
