import React from 'react'
import styles from './HotelGallery.module.css'

const HotelGallery = () => {
    return (
        <div className={styles.bottomContainerRef}>
            <div className={styles.rightImage}>
                <img src={"/images/hotelArt1.png"} alt="" />
            </div>
            <div className={styles.rightGrid}>
                <div className={styles.imageBox}>
                    <img src="/images/hotelArt2.png" alt="" />
                </div>

                <div className={styles.imageBox}>
                    <img src="/images/hotelArt3.png" alt="" />
                </div>

                <div className={styles.imageBox}>
                    <img src="/images/hotelArt2.png" alt="" />
                </div>

                <div className={styles.imageBox}>
                    <img src="/images/hotelArt4.png" alt="" />
                    <button className={styles.viewGalleryBtn} >
                        ⠿ VIEW GALLERY
                    </button>
                </div>
            </div>
        </div>
    )
}

export default HotelGallery
