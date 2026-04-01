"use client";

import React, { useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { useRouter } from "next/navigation";
import "swiper/css";
import "swiper/css/navigation";

import styles from "./LimitedTimeOffer.module.css";
import { useHomePageOffer } from "@/app/hooks/useHomePageOffer";


const FALLBACK_DATA = {
  startPrice: 230000,
  backgroundVideo: "/videos/Desert_Camels.mp4",
  sliderData: [
    {
      id: 1,
      image: "/images/exp3.png",
      title: "Shoja",
      subtitle: "Himachal Pradesh",
    },
    {
      id: 2,
      image: "/images/exp2.png",
      title: "Jaisalmer",
      subtitle: "Rajasthan",
    },
    {
      id: 3,
      image: "/images/exp1.png",
      title: "Coorg",
      subtitle: "Karnataka",
    },
    {
      id: 4,
      image: "/images/exp3.png",
      title: "Coorg",
      subtitle: "Karnataka",
    },
    {
      id: 5,
      image: "/images/exp2.png",
      title: "Coorg",
      subtitle: "Karnataka",
    },
  ],
};

const LimitedTimeOffer = () => {
  const swiperRef = useRef(null);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);
  const { data, isLoading, isError } = useHomePageOffer();
  const [isVideoReady, setIsVideoReady] = useState(false);
   const router = useRouter();


  const finalData = !isError && data ? data : FALLBACK_DATA;
  const videoSrc = isVideoReady
    ? finalData.backgroundVideo
    : FALLBACK_DATA.backgroundVideo;

  console.log(videoSrc);

  return (
    <section className="relative w-full h-[689px]">
      <header className={`${styles.homeSection} w-full`}>

        {/* ---------------- HIDDEN MAIN VIDEO (PRELOAD ONLY) ---------------- */}
        {data?.backgroundVideo && (
          <video
            src={data.backgroundVideo}
            preload="auto"
            muted
            playsInline
            onCanPlay={() => setIsVideoReady(true)}
            style={{ display: "none" }}
          />
        )}
        <video
          key={videoSrc}
          className="absolute inset-0 w-full h-full object-cover"
          src={videoSrc}
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
                  INR {finalData.startPrice.toLocaleString()}/
                  <span className={styles.adult}>Adult</span>
                </p>

                <button className={styles.exploreBtn}>
                  Explore now
                  <svg
                    className={styles.arrow}
                    width="12"
                    height="8"
                    viewBox="0 0 12 8"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M7.27275 0.212166C7.59741 -0.0875191 8.10354 -0.067277 8.40322 0.257378L10.9878 3.05735C11.2707 3.36379 11.2707 3.83614 10.9878 4.14259L8.40323 6.94263C8.10355 7.26728 7.59742 7.28753 7.27276 6.98785C6.9481 6.68817 6.92785 6.18204 7.22754 5.85738L8.57282 4.39997L0.799999 4.39997C0.358172 4.39997 -6.11324e-07 4.0418 -6.29439e-07 3.59997C-6.47555e-07 3.15815 0.358172 2.79997 0.8 2.79997L8.5728 2.79997L7.22754 1.34263C6.92786 1.01798 6.9481 0.511851 7.27275 0.212166Z"
                      fill="white"
                    />
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
                  <svg
                    width="12"
                    height="8"
                    viewBox="0 0 12 8"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M3.92744 0.212166C3.60279 -0.0875191 3.09666 -0.067277 2.79697 0.257378L0.212356 3.05735C-0.0705217 3.36379 -0.0705245 3.83614 0.212351 4.14259L2.79697 6.94263C3.09665 7.26728 3.60278 7.28753 3.92743 6.98785C4.25209 6.68817 4.27234 6.18204 3.97266 5.85738L2.62737 4.39997L10.4002 4.39997C10.842 4.39997 11.2002 4.0418 11.2002 3.59997C11.2002 3.15815 10.842 2.79997 10.4002 2.79997L2.6274 2.79997L3.97265 1.34263C4.27234 1.01798 4.25209 0.511851 3.92744 0.212166Z"
                      fill="white"
                    />
                  </svg>
                </div>

                <div
                  className={`${styles.btn} ${isEnd ? styles.disabledBtn : ""}`}
                  onClick={() => swiperRef.current?.slideNext()}
                >
                  <svg
                    width="12"
                    height="8"
                    viewBox="0 0 12 8"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M7.27275 0.212166C7.59741 -0.0875191 8.10354 -0.067277 8.40322 0.257378L10.9878 3.05735C11.2707 3.36379 11.2707 3.83614 10.9878 4.14259L8.40323 6.94263C8.10355 7.26728 7.59742 7.28753 7.27276 6.98785C6.9481 6.68817 6.92785 6.18204 7.22754 5.85738L8.57282 4.39997L0.799999 4.39997C0.358172 4.39997 -6.11324e-07 4.0418 -6.29439e-07 3.59997C-6.47555e-07 3.15815 0.358172 2.79997 0.8 2.79997L8.5728 2.79997L7.22754 1.34263C6.92786 1.01798 6.9481 0.511851 7.27275 0.212166Z"
                      fill="white"
                    />
                  </svg>
                </div>
              </div>

              {/* SWIPER */}
              <div className={`${styles.swapper}`}>
                <Swiper
                  modules={[Navigation]}
                  slidesPerView={'auto'}
                  breakpoints={{
                    0: {
                      spaceBetween: 12, // mobile
                    },
                    640: {
                      spaceBetween: 16, // optional: small tablets
                    },
                    1024: {
                      spaceBetween: 32, // desktop
                    },
                  }}
                  className={styles.carousel}

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
                  {finalData.sliderData.map((item, index) => (
                    <SwiperSlide key={index} className={styles.swapperslider}>
                      <div className={styles.items}
                      onClick={()=> router.push(`/tour-details?id=${item.id}`)}
                      >
                        <img src={item.image} alt={item.title} />

                        <div className={styles.imgMainContainer}>
                          <div className={styles.imgBottom}>
                            <p className={styles.imgHead}>{item.title}</p>
                            <p className={styles.imgSubHead}>{item.subtitle}</p>
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
