"use client";

import React, { useEffect, useRef } from "react";
import {
  StackedCarousel,
  ResponsiveContainer,
} from "react-stacked-center-carousel";
import styles from "./Slide.module.css";
import { Slide } from "./Slide";

const data = [
  {  image: "/images/img1.jpg", text: "hello" },
//   {  image: "/images/img2.jpg", text: "lel" },
  { image: "/images/img3.jpg", text: "kak" },
  { image: "/images/img4.jpg", text: "kk" },
  { image: "/images/img5.jpg", text: "away" },
];

const CardExample = () => {
  const ref = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      ref.current?.goNext();
    }, 100000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.card}>
      <div style={{ width: "100%", position: "relative" }}>
        <ResponsiveContainer
          carouselRef={ref}
          render={(width, carouselRef) => (
            <StackedCarousel
              ref={carouselRef}
              slideComponent={Slide}
              slideWidth={966}
              carouselWidth={width}
              data={data}
              maxVisibleSlide={5}
              disableSwipe
              customScales={[1, 0.85, 0.7, 0.55]}
              transitionTime={450}
            />
          )}
        />

        {/* LEFT */}
        <button
          className={`${styles.arrowButton} ${styles.left}`}
          onClick={() => ref.current?.goBack()}
        >
          ‹
        </button>

        {/* RIGHT */}
        <button
          className={`${styles.arrowButton} ${styles.right}`}
          onClick={() => ref.current?.goNext()}
        >
          ›
        </button>
      </div>
    </div>
  );
};

export default CardExample;
