import React from 'react'
import styles from './HotelGallery.module.css'
import { useRouter } from 'next/navigation';

const FALLBACK_IMAGES = [
    "/images/hotelArt1.png",
    "/images/hotelArt2.png",
    "/images/hotelArt3.png",
    "/images/hotelArt2.png",
    "/images/hotelArt4.png",
];

const HotelGallery = ({ images = FALLBACK_IMAGES }) => {

     const router = useRouter();
     const galleryImages = images.length ? images : FALLBACK_IMAGES;
    
        const goToGallery = () => {
            router.push('/hotel-gallery');
        }
    return (
        <div className={styles.bottomContainerRef}>
            <div className={styles.rightImage}>
                <img src={galleryImages[0] || FALLBACK_IMAGES[0]} alt="" />
            </div>
            <div className={styles.rightGrid}>
                <div className={styles.imageBox}>
                    <img src={galleryImages[1] || FALLBACK_IMAGES[1]} alt="" />
                </div>

                <div className={styles.imageBox}>
                    <img src={galleryImages[2] || FALLBACK_IMAGES[2]} alt="" />
                </div>

                <div className={styles.imageBox}>
                    <img src={galleryImages[3] || FALLBACK_IMAGES[3]} alt="" />
                </div>

                <div className={styles.imageBox}>
                    <img src={galleryImages[4] || FALLBACK_IMAGES[4]} alt="" />
                    <button className={styles.viewGalleryBtn} onClick={goToGallery} >
                        <img className={styles.viewGalleryBtnIcon} src="/icons/dotBtn.svg" alt="" /> VIEW GALLERY
                    </button>
                </div>
            </div>
        </div>
    )
}

export default HotelGallery
