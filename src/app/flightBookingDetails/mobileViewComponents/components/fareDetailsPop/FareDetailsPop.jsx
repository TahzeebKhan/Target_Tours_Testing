"use client"
import React, { useEffect } from 'react'
import styles from './FareDetailsPop.module.css'
const FareDetailsPop = ({ onClose }) => {
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
                        <img className={styles.closeIcon} src="/icons/CLose.svg" alt="" onClick={onClose}/>
                    </div>
                </div>
                <div className={styles.tableContainer}>
                    <div className={`${styles.tabContentFareDetails} ${styles.fadeIn}`}>
                        <div className={styles.header}>
                            Jakarta <img src="/icons/whitePlane.svg" alt="" />  Singapore, <span> 18 DEC 2025</span>
                        </div>
                        <div className={styles.body}>
                            <div className={styles.row}>
                                <span className={styles.label}>3 x Adult</span>
                                <span className={styles.amount}>₹ 750,000</span>
                            </div>

                            <div className={styles.row}>
                                <span className={styles.label}>Total (Base Fare)</span>
                                <span className={styles.bold}>₹ 740,000</span>
                            </div>

                            <div className={styles.row}>
                                <span className={styles.label}>Total Tax</span>
                                <span className={styles.bold}>₹ 730,000</span>
                            </div>

                            <div className={styles.row}>
                                <span className={styles.label}>Total (Fee &amp; Surcharge)</span>
                                <span className={styles.bold}>₹ 760,000</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default FareDetailsPop