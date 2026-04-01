"use client";

import React, { useState, useEffect, useRef } from "react";
import styles from "./Carousel.module.css";
import { redirect } from "next/dist/server/api-utils";
// import { ArrowLeft, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
// Sample data for slides

const Carousel = ({ slideData = [] }) => {
  const [currentSlide, setCurrentSlide] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef(null);
   const router = useRouter();

  useEffect(() => {
    setCurrentSlide(1);
  }, [slideData]);
  const totalSlides = slideData.length;

  // Auto-advance functionality
  useEffect(() => {
    if (!isPaused) {
      intervalRef.current = setInterval(() => {
        setCurrentSlide((prev) => {
          const next = prev >= totalSlides ? 1 : prev + 1;
          return next;
        });
      }, 5000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPaused, totalSlides]);

  const handleSlideChange = (slideNumber) => {
    setCurrentSlide(slideNumber);
    setIsPaused(true);
  };

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev <= 1 ? totalSlides : prev - 1));
    setIsPaused(true);
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev >= totalSlides ? 1 : prev + 1));
    setIsPaused(true);
  };

  // Calculate transform and scale for each slide based on its position relative to current slide
  const getSlideStyle = (slideNumber) => {
    let diff = slideNumber - currentSlide;

    // Handle wrapping
    if (diff > totalSlides / 2) {
      diff = diff - totalSlides;
    } else if (diff < -totalSlides / 2) {
      diff = diff + totalSlides;
    }

    let transform, scale, opacity, zIndex;

    if (diff === 0) {
      // Active slide - center, full size
      transform = "translateX(0%)";
      scale = 1;
      opacity = 1;
      zIndex = 10;
    } else if (diff === 1 || diff === -(totalSlides - 1)) {
      // Next slide - right side, scaled down
      transform = "translateX(42%) translateY(-30px)";
      scale = 0.68;
      zIndex = 5;
    } else if (diff === -1 || diff === totalSlides - 1) {
      // Previous slide - left side, scaled down
      transform = "translateX(-42%) translateY(-30px)";
      scale = 0.68;
      zIndex = 5;
    } else if (diff === 2 || diff === -(totalSlides - 2)) {
      // Slide after next - far right, very small
      transform = "translateX(70%) translateY(-30px)";
      scale = 0.538;
      zIndex = 1;
    } else if (diff === -2 || diff === totalSlides - 2) {
      // Slide before previous - far left, very small
      transform = "translateX(-70%) translateY(-30px)";
      scale = 0.538;
      zIndex = 1;
    } else {
      // Default - hidden
      transform = "translateX(0%)";
      scale = 0.3;
      opacity = 0;
      zIndex = 0;
    }

    return {
      transform: `${transform} scale(${scale})`,
      opacity,
      zIndex,
    };
  };
  const getFarSide = (slideNumber) => {
    let diff = slideNumber - currentSlide;

    if (diff > totalSlides / 2) diff -= totalSlides;
    if (diff < -totalSlides / 2) diff += totalSlides;

    if (diff === -2) return "left";
    if (diff === 2) return "right";
    return null;
  };

  const getSideAlignClass = (slideNumber) => {
    let diff = slideNumber - currentSlide;

    // handle circular wrapping
    if (diff > totalSlides / 2) diff -= totalSlides;
    if (diff < -totalSlides / 2) diff += totalSlides;

    if (diff < 0) return styles.leftAlign;
    if (diff > 0) return styles.rightAlign;
    return styles.centerAlign;
  };

  const handleMouseEnter = () => {
    setIsPaused(true);
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
  };

  return (
    <div className={styles.carouselWrapper}>
      <section
        className={styles.slider}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Slides */}
        {slideData.map((slide, index) => {
           console.log("slide6",slide)
          const slideNumber = slide.carouselId ?? index + 1;
          const isActive = currentSlide === slideNumber;
          const slideStyle = getSlideStyle(slideNumber);
          const packageId = slide.packageId ?? slide.id;

          return (
            <div
              key={slideNumber}
              className={`${styles.slide} ${
                isActive ? styles.activeSlide : ""
              }`}
              style={slideStyle}
              onClick={() => {
                handleSlideChange(slideNumber);
                if (packageId ) {
                  router.push(`/tour-details?id=${packageId}`);
                }
              }}
            >
              <div className={styles.slideContent}>
                {/* Image Container */}
                <div className={styles.imageContainer}
                >
                  <img
                    src={slide.image}
                    alt={slide.title}
                    className={styles.slideImage}
                  />

                  {/* Overlay content for active slide */}

                  <div className={`${styles.overlayContent} `}>
                    {/* {slide.hasNewTag && ( */}
                    <div className={styles.newTag}>Newly Added</div>
                    {/* )} */}
                    <div className={styles.price}>
                      <span>STARTING FROM </span> {slide.price}
                    </div>
                    <div
                      className={`${styles.textContent} ${
                        isActive ? styles.overlayShow : styles.overlayHide
                      }`}
                    >
                      <div className={styles.title}>{slide.title}</div>
                      <div className={styles.description}>
                        {slide.description}
                      </div>
                    </div>
                  </div>

                  {/* Newly Added tag for inactive slides */}
                  {/* {!isActive && slide.hasNewTag && (
                    <div className={styles.inactiveNewTag}>Newly Added</div>
                  )} */}
                </div>

                {/* Bottom text for all slides */}
                {/* <div className={styles.bottomText}>
                  <div className={styles.bottomTitle}>{slide.bottomTitle}</div>
                  <div className={styles.bottomDescription}>{slide.bottomDescription}</div>
                  {isActive && (
                    <div className={styles.bottomPrice}>{slide.price}</div>
                  )}
                </div> */}
                {/* Bottom text only for NON-ACTIVE slides */}

                <div
                  className={`
    ${styles.bottomText}
    ${getSideAlignClass(slideNumber)}
    ${!isActive ? styles.fadeIn : styles.fadeOut}
    ${getFarSide(slideNumber) === "left" ? styles.farLeftText : ""}
    ${getFarSide(slideNumber) === "right" ? styles.farRightText : ""}
    ${slide.smallContent ? styles.smallContent : ""}
    }
  `}
                  style={{
                    display: "flex",
                    visibility: "visible",
                  }}
                >
                  <div className={styles.bottomTitle}>{slide.bottomTitle}</div>
                  <div className={styles.bottomDescription}>
                    {slide.bottomDescription}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* Navigation Arrows */}

      {/* Radio buttons for slide control */}
      <div className={styles.radioContainer}>
        {slideData.map((_, index) => {
          const slideNumber = index + 1;
          return (
            <input
              key={slideNumber}
              type="radio"
              name="slider"
              id={`s${slideNumber}`}
              checked={currentSlide === slideNumber}
              onChange={() => handleSlideChange(slideNumber)}
              className={styles.radioInput}
            />
          );
        })}
      </div>
      <div className={styles.navigation}>
        <button
          className={styles.navButton}
          onClick={handlePrev}
          aria-label="Previous slide"
        >
          {/* <ArrowLeft size={14} className="text-[#000000] font-normal " /> */}
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M6.43434 2.31564C6.6052 2.48649 6.6052 2.76351 6.43434 2.93436L2.80622 6.5625H12.25C12.4916 6.5625 12.6875 6.75838 12.6875 7C12.6875 7.24161 12.4916 7.4375 12.25 7.4375H2.80622L6.43434 11.0657C6.6052 11.2365 6.6052 11.5135 6.43434 11.6843C6.26348 11.8552 5.98652 11.8552 5.81564 11.6843L1.44064 7.30934C1.26979 7.13848 1.26979 6.86152 1.44064 6.69066L5.81564 2.31564C5.98652 2.14479 6.26348 2.14479 6.43434 2.31564Z"
              fill="black"
            />
          </svg>
        </button>
        <button
          className={`${styles.navButton} ${styles.navButtonLeft}`}
          onClick={handleNext}
          aria-label="Next slide"
        >
          {/* <ArrowRight size={14} className="text-[#000000] font-normal" /> */}
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M7.56566 2.31564C7.3948 2.48649 7.3948 2.76351 7.56566 2.93436L11.1938 6.5625H1.75C1.50838 6.5625 1.3125 6.75838 1.3125 7C1.3125 7.24161 1.50838 7.4375 1.75 7.4375H11.1938L7.56566 11.0657C7.3948 11.2365 7.3948 11.5135 7.56566 11.6843C7.73652 11.8552 8.01348 11.8552 8.18436 11.6843L12.5594 7.30934C12.7302 7.13848 12.7302 6.86152 12.5594 6.69066L8.18436 2.31564C8.01348 2.14479 7.73652 2.14479 7.56566 2.31564Z"
              fill="black"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Carousel;
