import React from 'react'
import styles from './MyNextTrip.module.css'
import ExpCarousel from '../exploreCarousel/component/ExpCarousel'
const MyNextTrip = () => {
    return (
        <div className={styles.container}>
            <div className={styles.backToWishLists}>
                <img src="/icons/angle-left.svg" alt="" />
                <p>Back to Wish lists</p>
            </div>
            <h3 className={styles.myNextTripHeading}>My next trip</h3>
            <div className={styles.br}></div>
            <div className={styles.carousel}>
                <ExpCarousel activeTab={"All"} />
            </div>
        </div>
    )
}

export default MyNextTrip