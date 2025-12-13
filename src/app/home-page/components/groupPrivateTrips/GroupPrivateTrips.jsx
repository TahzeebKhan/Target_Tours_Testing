import React from 'react'
import styles from './GroupPrivateTrips.module.css'

const GroupPrivateTrips = () => {
    return (
        <section className={styles.section}>
            <div className={styles.container}>
                <div className={styles.items}>
                    <img src='/images/GROUPTRIPS.png' alt="" />

                    <div className={styles.imgMainContainer}>
                        <div className={styles.imgBottom}>
                            <p className={styles.imgHead}>Group Trips</p>
                            <p className={styles.imgSubHead}>Chill small group adventures led by experts, hanging out with fellow travelers who get you.</p>
                            <button className={styles.exploreBtn}>
                            GET QUOTE
                                <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path fill-rule="evenodd" clip-rule="evenodd" d="M7.27275 0.212166C7.59741 -0.0875191 8.10354 -0.067277 8.40322 0.257378L10.9878 3.05735C11.2707 3.36379 11.2707 3.83614 10.9878 4.14259L8.40323 6.94263C8.10355 7.26728 7.59742 7.28753 7.27276 6.98785C6.9481 6.68817 6.92785 6.18204 7.22754 5.85738L8.57282 4.39997L0.799999 4.39997C0.358172 4.39997 -6.11324e-07 4.0418 -6.29439e-07 3.59997C-6.47555e-07 3.15815 0.358172 2.79997 0.8 2.79997L8.5728 2.79997L7.22754 1.34263C6.92786 1.01798 6.9481 0.511851 7.27275 0.212166Z" fill="white" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
                <div className={styles.items}>
                    <img src='/images/privateTrips.png' alt="" />

                    <div className={styles.imgMainContainer}>
                        <div className={styles.imgBottom}>
                            <p className={styles.imgHead}>Private Trips</p>
                            <p className={styles.imgSubHead}>Custom luxury trips designed just for you, based on what you love and how you like to travel.</p>
                            <button className={styles.exploreBtn}>
                            GET QUOTE
                                <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path fill-rule="evenodd" clip-rule="evenodd" d="M7.27275 0.212166C7.59741 -0.0875191 8.10354 -0.067277 8.40322 0.257378L10.9878 3.05735C11.2707 3.36379 11.2707 3.83614 10.9878 4.14259L8.40323 6.94263C8.10355 7.26728 7.59742 7.28753 7.27276 6.98785C6.9481 6.68817 6.92785 6.18204 7.22754 5.85738L8.57282 4.39997L0.799999 4.39997C0.358172 4.39997 -6.11324e-07 4.0418 -6.29439e-07 3.59997C-6.47555e-07 3.15815 0.358172 2.79997 0.8 2.79997L8.5728 2.79997L7.22754 1.34263C6.92786 1.01798 6.9481 0.511851 7.27275 0.212166Z" fill="white" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default GroupPrivateTrips