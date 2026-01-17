"use client"
import React, { useEffect } from 'react'
import styles from './BaggageRules.module.css'
const BaggageRules = ({ onClose }) => {
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
                        <p className={styles.fareDetailsText}>Baggage Rules</p>
                        <img className={styles.closeIcon} src="/icons/CLose.svg" alt="" onClick={onClose} />
                    </div>
                </div>
                <div className={styles.tableContainer}>
                    <div className={styles.tableCard}>
                        {/* Header */}
                        <div className={styles.tableHeader}>
                            <span>AIRLINE</span>
                            <span>CHECK-IN BAGGAGE</span>
                            <span>CABIN BAGGAGE</span>
                        </div>

                        {/* Row */}
                        <div className={styles.tableRow}>
                            <div className={styles.airlineCell}>

                                <img className={styles.airlineIcon} src="/images/Flight.png" alt="" />

                                <div className={styles.airlineText}>
                                    <span className={styles.airlineName}>INDIGO</span>
                                    <span className={styles.flightNo}>6E - 541</span>
                                </div>
                            </div>

                            <div className={styles.baggage}>15 KGS</div>
                            <div className={styles.baggage}>7 KG</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default BaggageRules