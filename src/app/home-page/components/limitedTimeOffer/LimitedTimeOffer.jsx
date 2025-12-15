"use client";

import React, { useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";

import styles from "./LimitedTimeOffer.module.css";

const LimitedTimeOffer = () => {
    const swiperRef = useRef(null);
    const [isBeginning, setIsBeginning] = useState(true);
    const [isEnd, setIsEnd] = useState(false);

    // JSON DATA
    const sliderData = [
        {
            img: "/images/exp3.png",
            title: "Shoja",
            subtitle: "Himachal Pradesh",
        },
        {
            img: "/images/exp2.png",
            title: "Manali",
            subtitle: "Himachal Pradesh",
        },
        {
            img: "/images/exp1.png",
            title: "Kasol",
            subtitle: "Himachal Pradesh",
        },
        {
            img: "/images/exp1.png",
            title: "Tirthan",
            subtitle: "Himachal Pradesh",
        },
    ];

    return (
        <section className="relative w-full h-[689px]">
            <header className={`${styles.homeSection} w-full`}>
                <video
                    className="absolute inset-0 w-full h-full object-cover"
                    src="/videos/Desert_Camels.mp4"
                    poster="/images/hero-poster.jpg"
                    autoPlay
                    muted
                    loop
                    playsInline
                />

                <div className={styles.section}>
                    <div className={styles.container}>
                        {/* LEFT */}
                        <div className={styles.leftContainer}>
                            <h2 className={styles.heading}>
                                Limited Time <br /> Offer
                            </h2>

                            <div className={styles.textContainer}>
                                <span className={styles.offer}>Offer Starting from</span>
                                <p className={styles.price}>
                                    INR 2,30,000/
                                    <span className={styles.adult}>Adult</span>
                                </p>

                                <button className={styles.exploreBtn}>
                                    Explore now
                                    <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path fillRule="evenodd" clipRule="evenodd" d="M7.27275 0.212166C7.59741 -0.0875191 8.10354 -0.067277 8.40322 0.257378L10.9878 3.05735C11.2707 3.36379 11.2707 3.83614 10.9878 4.14259L8.40323 6.94263C8.10355 7.26728 7.59742 7.28753 7.27276 6.98785C6.9481 6.68817 6.92785 6.18204 7.22754 5.85738L8.57282 4.39997L0.799999 4.39997C0.358172 4.39997 -6.11324e-07 4.0418 -6.29439e-07 3.59997C-6.47555e-07 3.15815 0.358172 2.79997 0.8 2.79997L8.5728 2.79997L7.22754 1.34263C6.92786 1.01798 6.9481 0.511851 7.27275 0.212166Z" fill="white" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* RIGHT */}
                        <div className={styles.rightContainer}>
                            {/* BUTTONS */}
                            <div className={styles.btnContainer}>
                                <div
                                    className={`${styles.btn} ${isBeginning ? styles.disabledBtn : ""
                                        }`}
                                    onClick={() => swiperRef.current?.slidePrev()}
                                >
                                    <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path fillRule="evenodd" clipRule="evenodd" d="M3.92744 0.212166C3.60279 -0.0875191 3.09666 -0.067277 2.79697 0.257378L0.212356 3.05735C-0.0705217 3.36379 -0.0705245 3.83614 0.212351 4.14259L2.79697 6.94263C3.09665 7.26728 3.60278 7.28753 3.92743 6.98785C4.25209 6.68817 4.27234 6.18204 3.97266 5.85738L2.62737 4.39997L10.4002 4.39997C10.842 4.39997 11.2002 4.0418 11.2002 3.59997C11.2002 3.15815 10.842 2.79997 10.4002 2.79997L2.6274 2.79997L3.97265 1.34263C4.27234 1.01798 4.25209 0.511851 3.92744 0.212166Z" fill="white" />
                                    </svg>

                                </div>

                                <div
                                    className={`${styles.btn} ${isEnd ? styles.disabledBtn : ""
                                        }`}
                                    onClick={() => swiperRef.current?.slideNext()}
                                >
                                    <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path fillRule="evenodd" clipRule="evenodd" d="M7.27275 0.212166C7.59741 -0.0875191 8.10354 -0.067277 8.40322 0.257378L10.9878 3.05735C11.2707 3.36379 11.2707 3.83614 10.9878 4.14259L8.40323 6.94263C8.10355 7.26728 7.59742 7.28753 7.27276 6.98785C6.9481 6.68817 6.92785 6.18204 7.22754 5.85738L8.57282 4.39997L0.799999 4.39997C0.358172 4.39997 -6.11324e-07 4.0418 -6.29439e-07 3.59997C-6.47555e-07 3.15815 0.358172 2.79997 0.8 2.79997L8.5728 2.79997L7.22754 1.34263C6.92786 1.01798 6.9481 0.511851 7.27275 0.212166Z" fill="white" />
                                    </svg>

                                </div>
                            </div>

                            {/* SWIPER */}
                            <div className={styles.swapper}>
                                <Swiper
                                    slidesPerView={3}
                                    spaceBetween={20}
                                    modules={[Navigation]}
                                    onSwiper={(swiper) => {
                                        swiperRef.current = swiper;
                                        setIsBeginning(swiper.isBeginning);
                                        setIsEnd(swiper.isEnd);
                                    }}
                                    onSlideChange={(swiper) => {
                                        setIsBeginning(swiper.isBeginning);
                                        setIsEnd(swiper.isEnd);
                                    }}
                                >
                                    {sliderData.map((item, index) => (
                                        <SwiperSlide key={index}>
                                            <div className={styles.items}>
                                                <img src={item.img} alt="" />

                                                <div className={styles.imgMainContainer}>
                                                    <div className={styles.imgBottom}>
                                                        <p className={styles.imgHead}>{item.title}</p>
                                                        <p className={styles.imgSubHead}>
                                                            {item.subtitle}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </SwiperSlide>
                                    ))}
                                </Swiper>
                            </div>
                        </div>
                    </div>
                </div>
            </header>
        </section>
    );
};

export default LimitedTimeOffer;
