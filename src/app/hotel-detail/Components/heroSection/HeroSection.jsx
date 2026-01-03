"use client"
import React, { useState } from 'react'
import styles from './HeroSection.module.css'
import HotelGallery from '../hotelGallery/HotelGallery';

const HeroSection = () => {
    const [liked, setLiked] = useState(false);
    return (
        <div className={styles.HeroSection}>
            <div className={styles.container}>
                <div className={styles.textSection}>
                    <h2 className={styles.hotelName}>Hotel Arts Barcelona</h2>
                    <div className={styles.locationAndRating}>
                        <img src="/icons/blackAddress.svg" alt="" />
                        <span className={styles.hotelAddress}>Barcelona, Spain</span>
                        <div className={styles.ratingSection}>
                            <div className={styles.stars}>
                                <img src="/icons/tetimonialStart.svg" alt="" />
                                <img src="/icons/tetimonialStart.svg" alt="" />
                                <img src="/icons/tetimonialStart.svg" alt="" />
                                <img src="/icons/tetimonialStart.svg" alt="" />
                            </div>
                            <div className={styles.reviewCount}>4.5 (371 reviews)</div>
                        </div>
                    </div>
                </div>
                <div className={styles.shareContainer}>
                    <div className={styles.iconsHeart} onClick={() => setLiked(!liked)}>
                        <img
                            src={liked ? "/icons/heartIconFilled.svg" : "/icons/mdi_heart.svg"}
                            alt="heart"
                        />
                    </div>

                    <div className={styles.iconsHeart}>
                        <img src="/icons/share.svg" alt="" />
                    </div>


                </div>
            </div>
            <HotelGallery/>
        </div>
    )
}

export default HeroSection
