import React from 'react'
import styles from './TripHighlights.module.css'

const TripHighlights = () => {
    return (
        <div className={styles.ForMobile}>
            <div className={`${styles.containerMobile}`}>
                    <div className={styles.overlayCard}>
                        <h2 className={styles.heading}>Trip Highlights</h2>
                        <ul className={styles.list}>
                            <li>Scenic exploration by private vehicle through Canada’s iconic landscapes</li>
                            <li>Selected departure dates with an English-speaking local guide</li>
                            <li>Lake cruise experience on a pristine alpine lake</li>
                            <li>Guaranteed departure with 4 participants, maximum 12 travelers</li>
                            <li>Optional panoramic helicopter flight over the Canadian Rockies</li>
                            <li>Accommodation in comfortable lodges and hotels immersed in nature</li>
                            <li>Air-conditioned private transport between cities and national parks</li>
                            <li>Small-group experience with a maximum of 12 participants per departure</li>
                        </ul>
                    </div>
                </div>
            <section className={styles.section}>
                <div className={styles.container}>
                    <div className={styles.overlayCard}>
                        <h2 className={styles.heading}>Trip Highlights</h2>
                        <ul className={styles.list}>
                            <li>Scenic exploration by private vehicle through Canada’s iconic landscapes</li>
                            <li>Selected departure dates with an English-speaking local guide</li>
                            <li>Lake cruise experience on a pristine alpine lake</li>
                            <li>Guaranteed departure with 4 participants, maximum 12 travelers</li>
                            <li>Optional panoramic helicopter flight over the Canadian Rockies</li>
                            <li>Accommodation in comfortable lodges and hotels immersed in nature</li>
                            <li>Air-conditioned private transport between cities and national parks</li>
                            <li>Small-group experience with a maximum of 12 participants per departure</li>
                        </ul>
                    </div>
                </div>
            </section>
        </div>

    )
}

export default TripHighlights