import React from 'react'
import styles from './FeatureSection.module.css'

const FeatureSection = () => {
    return (
        <section className={styles.featureSection}>
            <div className={styles.container}>
                <div className={styles.containerTop}>
                    <p>LIFE, WELL-TRAVELLED SINCE 1993</p>
                    <h2>Why choose Target Tours?</h2>
                </div>
            </div>
            <div className={styles.linearContainer}>
                <div className={styles.containerBottom}>
                    <div className={styles.textContainer}>
                        <h3 className={styles.headText}>Unbeatable Deals</h3>
                        <p className={styles.subHeadText}>Score the best prices on flights, hotels, and holiday packages — guaranteed.</p>
                    </div>
                    <div className={styles.textContainer}>
                        <h3 className={styles.headText}>Multiple Payment Methods</h3>
                        <p className={styles.subHeadText}>Flights, stays, cabs, visas — plan every part of your journey in one place.</p>
                    </div>
                    <div className={styles.textContainer}>
                        <h3 className={styles.headText}>Trusted by Millions</h3>
                        <p className={styles.subHeadText}>Join a growing community of happy travelers across the globe.</p>
                    </div>
                    <div className={styles.textContainer}>
                        <h3 className={styles.headText}>24/7 Support</h3>
                        <p className={styles.subHeadText}>Need help mid-trip? Our travel experts are always just a call away.</p>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default FeatureSection