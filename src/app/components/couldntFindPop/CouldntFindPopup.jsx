"use client";
import React, { useEffect } from "react";
import styles from './CouldntFindPopup.module.css'
import { Check } from "lucide-react";

const CouldntFindPopup = ({ open, onAllow, onClose }) => {
    useEffect(() => {
        if (open) document.body.style.overflow = "hidden";
        return () => (document.body.style.overflow = "auto");
    }, [open]);

    if (!open) return null;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div
                className={styles.modal}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close */}
                <div className={styles.closeIcon}>
                    <button className={styles.closeBtn} onClick={onClose}>
                        <img src="/icons/CLose.svg" alt="close" onClick={onClose} />
                    </button>

                </div>
                {/* Illustration */}
                <div className={styles.centerContainer}>
                    <img
                        src="/images/CouldntFind.svg"
                        alt="location"
                        className={styles.illustration}
                    />

                    {/* Text */}
                    <div className={styles.popTextContainer}>
                        <h2 className={styles.title}>Searching for the best flights...</h2>
                        <p className={styles.subTitle}>
                            Sit tight — we’re comparing airlines, routes, and prices to get you the best deal.
                        </p>
                    </div>
                    <div className={styles.checkContainerMain}>
                        <span className={styles.checkContainer}>
                            <Check size={16} strokeWidth={3} />
                            A different date
                        </span>

                        <span className={styles.checkContainer}>
                            <Check size={16} strokeWidth={3} />
                            Another route
                        </span>

                        <span className={styles.checkContainer}>
                            <Check size={16} strokeWidth={3} />
                            Another type of transport
                        </span>
                    </div>
                </div>

                {/* Actions */}
                <div className={styles.buttonContainer}>
                    <button className={styles.allowBtn} onClick={onAllow}>
                        TRY AGAIN
                    </button>

                    {/* <button className={styles.notNowBtn} onClick={onClose}>
                        CHANGE  SEARCH
                    </button> */}
                </div>
            </div>
        </div>
    );
};

export default CouldntFindPopup;
