"use client"
import React, { useEffect } from 'react'
import styles from './FareDetailsPop.module.css'
const FareDetailsPop = ({ onClose, fareDetails }) => {
    const details = fareDetails || {
        from: "Jakarta",
        to: "Singapore",
        date: "18 DEC 2025",
        passengerLabel: "3 x Adult",
        passengerAmount: "₹ 750,000",
        baseFare: "₹ 740,000",
        tax: "₹ 730,000",
        fee: "₹ 760,000",
    };
    useEffect(() => {
        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = "auto";
        };
    }, []);
    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.fareDetialsContainre} onClick={(e) => e.stopPropagation()}>
                <div className={styles.fareDetailsTop}>
                    <div className={styles.headerTop}>
                        <p className={styles.fareDetailsText}>FARE DETAILS</p>
                        <img className={styles.closeIcon} src="/icons/Close.svg" alt="" onClick={onClose} />
                    </div>
                </div>
                <div className={styles.tableContainer}>
                    <div className={`${styles.tabContentFareDetails} ${styles.fadeIn}`}>
                        <div className={styles.header}>
                            {details.from} <img src="/icons/whitePlane.svg" alt="" />  {details.to}, <span> {details.date}</span>
                        </div>
                        <div className={styles.body}>
                            <div className={styles.row}>
                                <span className={styles.label}>{details.passengerLabel}</span>
                                <span className={styles.amount}>{details.passengerAmount}</span>
                            </div>

                            <div className={styles.row}>
                                <span className={styles.label}>Total (Base Fare)</span>
                                <span className={styles.bold}>{details.baseFare}</span>
                            </div>

                            <div className={styles.row}>
                                <span className={styles.label}>Total Tax</span>
                                <span className={styles.bold}>{details.tax}</span>
                            </div>

                            <div className={styles.row}>
                                <span className={styles.label}>Total (Fee &amp; Surcharge)</span>
                                <span className={styles.bold}>{details.fee}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default FareDetailsPop
