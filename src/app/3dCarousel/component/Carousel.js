'use client';

import React, { useState, useEffect, useRef } from 'react';
import styles from './Carousel.module.css';

// Sample data for slides
const slideData = [
  {
    id: 1,
    image: '/images/img6.png',
    title: 'TANZANIA & ZANZIBAR',
    description: 'SAFARI IN THE LAND OF THE MASAI HAKUNA MATATA ON...',
    price: 'STARTING FROM ₹20,000',
    hasNewTag: true,
    bottomTitle: 'Tanzania & Zanzibar',
    bottomDescription: 'Safari In The Land Of The Masai Hakuna Matata On...',
  },
  {
    id: 2,
    image: '/images/img7.png',
    title: 'SENEGAL',
    description: 'In The Heart Of East Senegal And The Shine Shaloum',
    price: 'STARTING FROM ₹15,000',
    hasNewTag: false,
    bottomTitle: 'Senegal',
    bottomDescription: 'In The Heart Of East Senegal And The Shine Shaloum',
  },
  {
    id: 3,
    image: '/images/img8.png',
    title: 'UZBEKISTAN',
    description: 'From Fergana To Khiva',
    price: 'STARTING FROM ₹18,000',
    hasNewTag: false,
    bottomTitle: 'Uzbekistan',
    bottomDescription: 'From Fergana To Khiva',
  },
  {
    id: 4,
    image: '/images/img9.png',
    title: 'MADAGASCAR',
    description: 'The North: National Parks And Paradise Like Beaches',
    price: 'STARTING FROM ₹22,000',
    hasNewTag: true,
    bottomTitle: 'Madagascar',
    bottomDescription: 'The North: National Parks And Paradise Like Beaches',
  },
  {
    id: 5,
    image: '/images/img10.png',
    title: 'JAPAN',
    description: 'Japan In The Winter',
    price: 'STARTING FROM ₹25,000',
    hasNewTag: false,
    bottomTitle: 'Japan',
    bottomDescription: 'Japan In The Winter',
  },
];

const Carousel = () => {
  const [currentSlide, setCurrentSlide] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef(null);

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
      transform = 'translateX(0%)';
      scale = 1;
      opacity = 1;
      zIndex = 10;
    } else if (diff === 1 || diff === -(totalSlides - 1)) {
      // Next slide - right side, scaled down
      transform = 'translateX(35%)';
      scale = 0.75;
      opacity = 0.9;
      zIndex = 5;
    } else if (diff === -1 || diff === totalSlides - 1) {
      // Previous slide - left side, scaled down
      transform = 'translateX(-35%)';
      scale = 0.75;
      opacity = 0.9;
      zIndex = 5;
    } else if (diff === 2 || diff === -(totalSlides - 2)) {
      // Slide after next - far right, very small
      transform = 'translateX(70%)';
      scale = 0.55;
      opacity = 0.6;
      zIndex = 1;
    } else if (diff === -2 || diff === totalSlides - 2) {
      // Slide before previous - far left, very small
      transform = 'translateX(-70%)';
      scale = 0.55;
      opacity = 0.6;
      zIndex = 1;
    } else {
      // Default - hidden
      transform = 'translateX(0%)';
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
        {slideData.map((slide) => {
          const slideNumber = slide.id;
          const isActive = currentSlide === slideNumber;
          const slideStyle = getSlideStyle(slideNumber);

          


          return (
            <div
              key={slideNumber}
              className={`${styles.slide} ${isActive ? styles.activeSlide : ''}`}
              style={slideStyle}
              onClick={() => handleSlideChange(slideNumber)}
            >
              <div className={styles.slideContent}>
                {/* Image Container */}
                <div className={styles.imageContainer}>
                  <img
                    src={slide.image}
                    alt={slide.title}
                    className={styles.slideImage}
                  />

                  {/* Overlay content for active slide */}
                  {isActive && (
                    <div className={styles.overlayContent}>
                      {slide.hasNewTag && (
                        <div className={styles.newTag}>Newly Added</div>
                      )}
                      <div className={styles.price}>{slide.price}</div>
                      <div className={styles.textContent}>
                        <div className={styles.title}>{slide.title}</div>
                        <div className={styles.description}>{slide.description}</div>
                      </div>
                    </div>
                  )}

                  {/* Newly Added tag for inactive slides */}
                  {!isActive && slide.hasNewTag && (
                    <div className={styles.inactiveNewTag}>Newly Added</div>
                  )}
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
                {!isActive && (
                  <div className={styles.bottomText}>
                    <div className={styles.bottomTitle}>{slide.bottomTitle}</div>
                    <div className={styles.bottomDescription}>{slide.bottomDescription}</div>
                  </div>
                )}

              </div>
            </div>
          );
        })}
      </section>

      {/* Navigation Arrows */}
      <div className={styles.navigation}>
        <button
          className={styles.navButton}
          onClick={handlePrev}
          aria-label="Previous slide"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button
          className={styles.navButton}
          onClick={handleNext}
          aria-label="Next slide"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

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
    </div>
  );
};

export default Carousel;
