"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectCoverflow } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-coverflow";

import styles from "./TravelCarousel.module.css";

const slides = [
    {
        id: 1,
        image: "/images/img1.jpg",
        title: "TANZANIA & ZANZIBAR",
        description: "SAFARI IN THE LAND OF THE MASAI HAKUNA MATATA ON...",
        price: "₹20,000",
        hasNewTag: true,
        bottomTitle: "Tanzania & Zanzibar",
        bottomDescription: "Safari In The Land Of The Masai Hakuna Matata On...",
    },
    {
        id: 2,
        image: "/images/img2.jpg",
        title: "SENEGAL",
        description: "In The Heart Of East Senegal And The Shine Shaloum",
        price: "₹15,000",
        hasNewTag: true,
        bottomTitle: "Senegal",
        bottomDescription: "In The Heart Of East Senegal And The Shine Shaloum",
    },
    {
        id: 3,
        image: "/images/img4.jpg",
        title: "UZBEKISTAN",
        description: "From Fergana To Khiva",
        price: "₹18,000",
        hasNewTag: false,
        bottomTitle: "Uzbekistan",
        bottomDescription: "From Fergana To Khiva",
    },
    {
        id: 4,
        image: "/images/img3.jpg",
        title: "MADAGASCAR",
        description: "The North: National Parks And Paradise Like Beaches",
        price: "₹22,000",
        hasNewTag: true,
        bottomTitle: "Madagascar",
        bottomDescription: "The North: National Parks And Paradise Like Beaches",
    },
    {
        id: 5,
        image: "/images/img5.jpg",
        title: "JAPAN",
        description: "Japan In The Winter",
        price: "₹25,000",
        hasNewTag: false,
        bottomTitle: "Japan",
        bottomDescription: "Japan In The Winter",
    },
    {
        id: 6,
        image: "/images/img5.jpg",
        title: "JAPAN",
        description: "Japan In The Winter",
        price: "₹25,000",
        hasNewTag: false,
        bottomTitle: "Japan",
        bottomDescription: "Japan In The Winter",
    },
    {
        id: 7,
        image: "/images/img5.jpg",
        title: "JAPAN",
        description: "Japan In The Winter",
        price: "₹25,000",
        hasNewTag: false,
        bottomTitle: "Japan",
        bottomDescription: "Japan In The Winter",
    },
];

export default function TravelCarousel() {
    return (
        <div className={styles.wrapper}>
            <Swiper
                modules={[Autoplay, EffectCoverflow]}
                effect="coverflow"
                grabCursor={true}
                centeredSlides={true}
                slidesPerView={'auto'}
                initialSlide={3}
                loop={true}
                loopedSlides={5}
                coverflowEffect={{
                    rotate: 0,
                    stretch: 0,
                    depth: 400,
                    modifier: 1,
                    slideShadows: false,
                }}
                // autoplay={{
                //     delay: 3000,
                //     disableOnInteraction: false,
                // }}
                speed={1200}
                className={styles.swiper}
            >
                {slides.map((item, index) => (
                    <SwiperSlide key={`${item.id}-${index}`} className={styles.slide}>
                        <div className={styles.card}

                        >
                            <div className={styles.imgeContainer} style={{ backgroundImage: `url(${item.image})` }} >
                                <div className={styles.content}>
                                    <div className={styles.newTag}>Newly Added</div>
                                    <span className={styles.country}>{item.bottomTitle}</span>
                                    <h2 className={styles.title}>{item.bottomDescription}</h2>

                                    <div className={styles.priceContainer}>
                                        <span className={styles.priceText}>Starting From </span>
                                        <span className={styles.price}>{item.price}</span>
                                    </div>
                                </div>
                            </div>
                            <div className={styles.bottomTextContainer}>
                                <p className={styles.Bottomtitle}>{item.title}</p>
                                <p className={styles.Bottomcountry}>{item.description}</p>


                            </div>
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
}


