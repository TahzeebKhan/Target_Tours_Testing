"use client";
import React, { useEffect } from "react";
import styles from "./LocationPermissionModal.module.css";

const LocationPermissionModal = ({ open, onAllow, onClose }) => {
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
                        <img src="/icons/Close.svg" alt="close" onClick={onClose} />
                    </button>

                </div>
                {/* Illustration */}
                <div className={styles.centerContainer}>
                    <img
                        src="/images/locationPopIng.png"
                        alt="location"
                        className={styles.illustration}
                    />

                    {/* Text */}
                    <div className={styles.popTextContainer}>
                        <h2 className={styles.title}>FIND AIRPORTS NEAR ME</h2>
                        <p className={styles.subTitle}>
                            See all airports around your area for quicker trip planning.
                        </p>
                    </div>
                </div>

                {/* Actions */}
                <div className={styles.buttonContainer}>
                    <button className={styles.allowBtn} onClick={onAllow}>
                        ALLOW LOCATION ACCESS
                    </button>

                    <button className={styles.notNowBtn} onClick={onClose}>
                        NOT NOW
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LocationPermissionModal;
