import React from 'react'
import styles from './FlightFare.module.css'

const FlightFare = () => {
    return (
        <div className={`${styles.tabContentFareDetails} ${styles.fadeIn}`}>
            <div className={styles.header}>
                Jakrata <img src="/icons/whitePlane.svg" alt="" /> Singapore, <span> 18 DEC 2025</span>
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
    )
}

export default FlightFare
