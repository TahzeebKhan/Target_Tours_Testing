import React from 'react'
import Navbar from '../flightBookingDetails/Navbar'
import styles from './HotelBooking.module.css'
import BookingSummary from '../hotel-detail/Components/bookingSummary/BookingSummary'

const layout = ({ children }) => {
    return (
        <section className={styles.contentWrapper}>
            <div className={styles.navbarWrapper}>
                <Navbar />
            </div>
            <div className={styles.childrenWrapper}>
                {children}
                <BookingSummary />
            </div>
        </section>
    )
}

export default layout