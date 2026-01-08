"use client"
import React, { useState } from 'react'
import styles from './MyReview.module.css'
import MyReviewDetails from './myReviewDetails/MyReviewDetails';


const MyReview = () => {
    const [showTabs, setShowTabs] = useState(false);

    if (showTabs) {
        return <MyReviewDetails />
    }

    return (
        <section className={styles.container}>
            <div className={styles.contentWrapper}>
                <img className={styles.heartIcon} src="/images/myreview.png" alt="" />
                <button className={styles.startBtn} onClick={() => setShowTabs(true)}>review now</button>
                <div className={styles.textWrapper}>
                    <h2>You haven’t reviewed anything yet.</h2>
                    <p>After you complete a stay, you’ll be invited to leave a review here.</p>
                </div>
            </div>
        </section>
    )
}

export default MyReview