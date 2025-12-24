import React from 'react'
import styles from './FlightBookingDetailsLayout.module.css'
import Navbar from './Navbar'

export default function FlightBookingDetailsLayout({ children }) {
    return (
        <div className={styles.layoutWrapper}>
            <Navbar />
            <main className={styles.mainContent}>
                <div className={styles.container}>
                    {children}
                </div>
            </main>
        </div>
    )
}