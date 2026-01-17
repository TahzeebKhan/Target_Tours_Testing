"use client";
import React, { useState } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import styles from './BetweenMajesticPeaks.module.css'
import { useRouter } from 'next/navigation';

const BetweenMajesticPeaks = () => {
    const [swiperRef, setSwiperRef] = useState(null)
    const [activeIndex, setActiveIndex] = useState(0)
    const router = useRouter();

    const goToGallery = () => {
        router.push('/view-gallery'); 
    }

    // Sample images - replace with your actual images
    const carouselImages = [
        '/tourBooking/ImagesItem1.png',
        '/tourBooking/ImagesItem2.png',
        '/tourBooking/ImagesItem3.png',
        '/images/img1.jpg',
        '/images/img2.jpg',
        '/images/img3.jpg',
        '/tourBooking/ImagesItem1.png',
        '/tourBooking/ImagesItem2.png',
        '/tourBooking/ImagesItem3.png',
        '/tourBooking/ImagesItem1.png',
        '/tourBooking/ImagesItem2.png',
        '/tourBooking/ImagesItem3.png',
    ]

    const handleSlideChange = (swiper) => {
        setActiveIndex(swiper.activeIndex)
    }

    const getProgressPercentage = () => {
        if (!swiperRef) return 0;

        // Total slides
        const totalSlides = carouselImages.length;

        // Agar last slide visible hai to 100%
        if (activeIndex >= totalSlides - 1) {
            return 100;
        }

        // Otherwise calculate based on total progress
        return ((activeIndex + 3) / totalSlides) * 100;
    }

    const handlePrev = () => {
        swiperRef?.slidePrev()
    }

    const handleNext = () => {
        swiperRef?.slideNext()
    }

    const [isOpen, setIsOpen] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);

    const openPreview = (index) => {
        setCurrentIndex(index);
        setIsOpen(true);
    };

    const closePreview = () => setIsOpen(false);

    const prevImage = () => {
        setCurrentIndex((prev) =>
            prev === 0 ? carouselImages.length - 1 : prev - 1
        );
    };

    const nextImage = () => {
        setCurrentIndex((prev) =>
            prev === carouselImages.length - 1 ? 0 : prev + 1
        );
    };


    return (
        <section className={styles.Section}>
            <div className={styles.container}>
                <div className={styles.topContainer}>
                    <h2 className={styles.heading}>Between majestic peaks and turquoise lakes: 12 days of discovery in the heart of Western Canada</h2>
                    <div className={styles.paraContainer}>
                        <p>Set out on an unforgettable journey through one of Canada's most spectacular regions. This 12-day adventure in Western Canada takes you across the legendary landscapes of the Canadian Rockies—where snow-capped mountains, emerald forests, and crystal-clear lakes create a setting of rare beauty.</p>
                        <p>From iconic national parks to panoramic highways winding through alpine valleys, this journey reveals the very essence of the Canadian West. Along the way, you'll explore breathtaking natural wonders, experience the serenity of vast wilderness, and enjoy moments of connection with nature at every stop.</p>
                        <p>This itinerary is crafted as a true immersion—where every day invites discovery, awe, and a sense of freedom found only in wide-open spaces.</p>
                    </div>
                </div>
                {/* <div className={styles.bottomContainer}>
                    <div className={styles.carouselWrapper}>
                        <Swiper
                            modules={[Navigation]}
                            onSwiper={setSwiperRef}
                            onSlideChange={handleSlideChange}
                            slidesPerView={'auto'}
                            spaceBetween={24}
                            className={styles.carousel}
                        >
                            {carouselImages.map((image, index) => (
                                <SwiperSlide key={index} className={styles.slide}>
                                    <div className={styles.imageContainer}>
                                        <img src={image} alt={`Slide ${index + 1}`} className={styles.image} onClick={() => openPreview(index)} />
                                    </div>
                                </SwiperSlide>
                            ))}
                        </Swiper>

                        {isOpen && (
                            <div className={styles.previewOverlay} onClick={closePreview}>
                                <div
                                    className={styles.btn}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        prevImage();
                                    }}
                                >
                                    <img src="/icons/left.svg" alt="Previous" />
                                </div>
                                <div
                                    className={styles.previewBox}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <img
                                        src={carouselImages[currentIndex]}
                                        className={styles.previewImage}
                                        alt="preview"
                                    />



                                </div>
                                <div
                                    className={styles.btn}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        nextImage();
                                    }}
                                >
                                    <img src="/icons/right.svg" alt="Next" />
                                </div>
                            </div>
                        )}

                    </div>
                    <div className={styles.controlsContainer}>
                        <div className={styles.br}>
                            <div
                                className={styles.activeIndicator}
                                style={{ width: `${getProgressPercentage()}%` }}
                            ></div>
                        </div>
                        <div className={styles.btnContainer}>
                            <div
                                className={styles.btn}
                                onClick={handlePrev}
                            >
                                <img src="/icons/left.svg" alt="Previous" />
                            </div>
                            <div
                                className={styles.btn}
                                onClick={handleNext}
                            >
                                <img src="/icons/right.svg" alt="Next" />
                            </div>
                        </div>
                    </div>
                </div> */}

            </div>
            <div className={styles.bottomContainerRef}>
                <div className={styles.rightImage}>
                    <img src={"/tourBooking/ToursImage1.png"} alt="" />
                </div>
                <div className={styles.rightGrid}>
                    <div className={styles.imageBox}>
                        <img src="/tourBooking/ImagesItem1.png" alt="" />
                    </div>

                    <div className={styles.imageBox}>
                        <img src="/tourBooking/ImagesItem2.png" alt="" />
                    </div>

                    <div className={styles.imageBox}>
                        <img src="/tourBooking/ImagesItem3.png  " alt="" />
                    </div>

                    <div className={styles.imageBox}>
                        <img src="/tourBooking/ImagesItem1.png" alt="" />
                        <button className={styles.viewGalleryBtn} onClick={goToGallery}>
                            <img className={styles.viewGalleryBtnIcon} src="/icons/dotBtn.svg" alt="" /> VIEW GALLERY
                        </button>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default BetweenMajesticPeaks