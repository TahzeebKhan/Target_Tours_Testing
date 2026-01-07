import React from 'react'
import styles from './HotelGallery.module.css'
import { useRouter } from 'next/navigation';

const HotelGallery = () => {

     const router = useRouter();
    
        const goToGallery = () => {
            router.push('/hotel-gallery');
        }
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
                    <button className={styles.viewGalleryBtn} onClick={goToGallery} >
                        <img className={styles.viewGalleryBtnIcon} src="/icons/dotBtn.svg" alt="" /> VIEW GALLERY
                    </button>
                </div>
            </div>
        </div>
    )
}

export default HotelGallery
