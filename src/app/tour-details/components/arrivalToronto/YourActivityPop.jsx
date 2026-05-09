"use client";
import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import styles from "./YourActivityPop.module.css";

const YourActivityPop = ({
    isOpen,
    hotel,
    isSelected = false,
    onToggleActivity,
    onClose,
}) => {
    const timeText =
        hotel?.startTime && hotel?.endTime
            ? `${hotel.startTime} - ${hotel.endTime}`
            : hotel?.startTime || hotel?.endTime || "";
    const actionLabel = isSelected ? "Remove" : "Add +";

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
                            <h4>{hotel?.popupTitle ? hotel.popupTitle : hotel?.title ? hotel.title : hotel?.category ? hotel.category : 'Details'}</h4>
                            <button onClick={onClose} className={styles.closeBtn}>✕</button>
                        </div>

                        {/* CONTENT */}
                        <div className={styles.popupContent}>
                            <div className={styles.popupRight}>
                                <div className={styles.cardContent}>
                                    <div className={styles.cardTop}>
                                        <h4 className={styles.eveningActivity}>{hotel?.category || "ACTIVITY"}</h4>
                                        <h3 className={styles.hotelTitle}>{hotel?.popupTitle || hotel?.title}</h3>
                                        <div className={styles.schaduleTime}>
                                            <img src="/icons/watchBlack.svg" alt="" />
                                            <span>{timeText || "Schedule unavailable"}</span>

                                        </div>
                                    </div>
                                    <p className={styles.hotelDec}>{hotel?.description || "No details available."}</p>

                                </div>
                                <div className={styles.popupActions}>
                                    <button
                                        className={styles.confirmBtn}
                                        onClick={() => onToggleActivity?.(hotel)}
                                    >
                                        {actionLabel}
                                    </button>
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
