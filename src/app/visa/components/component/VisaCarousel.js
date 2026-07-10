"use client";

import React, { useMemo, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";

import styles from "./VisaCarousel.module.css";

const FILTERS = ["All", "SE Asia", "Americas", "Europe", "Africa"];

const DESTINATIONS = [
  {
    title: "Japan",
    price: "₹ 12,000",
    region: "SE Asia",
    image: "/images/TravelInspiration1.png",
  },
  {
    title: "China",
    price: "₹ 12,000",
    region: "SE Asia",
    image: "/images/TravelInspiration2.png",
  },
  {
    title: "Qatar",
    price: "₹ 45,000",
    region: "SE Asia",
    image: "/images/travel-hero.webp",
  },
  {
    title: "Australia",
    price: "₹ 12,000",
    region: "SE Asia",
    image: "/images/TravelInspiration3.png",
  },
  {
    title: "United States",
    price: "₹ 85,000",
    region: "Americas",
    image: "/images/northAmerica.png",
  },
  {
    title: "France",
    price: "₹ 62,000",
    region: "Europe",
    image: "/images/europe.png",
  },
  {
    title: "South Africa",
    price: "₹ 58,000",
    region: "Africa",
    image: "/images/africa.png",
  },
];

export default function VisaCarousel() {
  const swiperRef = useRef(null);
  const [activeFilter, setActiveFilter] = useState("All");

  const slides = useMemo(() => {
    if (activeFilter === "All") return DESTINATIONS;
    return DESTINATIONS.filter((item) => item.region === activeFilter);
  }, [activeFilter]);

  const handleFilterClick = (filter) => {
    setActiveFilter(filter);
    swiperRef.current?.slideTo(0);
  };

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.heading}>Most Visted Destination</h2>
          <div className={styles.filters} aria-label="Visited destination filters">
            {FILTERS.map((filter) => (
              <button
                key={filter}
                type="button"
                className={`${styles.filterButton} ${
                  activeFilter === filter ? styles.filterButtonActive : ""
                }`}
                onClick={() => handleFilterClick(filter)}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        <Swiper
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
          }}
          className={styles.swiper}
          spaceBetween={12}
          slidesPerView={1.1}
          breakpoints={{
            560: {
              slidesPerView: 2,
              spaceBetween: 14,
            },
            900: {
              slidesPerView: 3,
              spaceBetween: 16,
            },
            1200: {
              slidesPerView: 4,
              spaceBetween: 16,
            },
          }}
        >
          {slides.map((item) => (
            <SwiperSlide key={`${activeFilter}-${item.title}`}>
              <article className={styles.card}>
                <img className={styles.image} src={item.image} alt={item.title} />
                <div className={styles.gradient} />
                <div className={styles.cardContent}>
                  <h3 className={styles.cardTitle}>{item.title}</h3>
                  <div className={styles.priceBlock}>
                    <span className={styles.priceLabel}>Starts From</span>
                    <span className={styles.price}>{item.price}</span>
                  </div>
                </div>
              </article>
            </SwiperSlide>
          ))}
        </Swiper>

        <div className={styles.navButtons}>
          <button
            type="button"
            className={styles.navButton}
            aria-label="Previous destination"
            onClick={() => swiperRef.current?.slidePrev()}
          >
            <img src="/icons/left.svg" alt="" />
          </button>
          <button
            type="button"
            className={styles.navButton}
            aria-label="Next destination"
            onClick={() => swiperRef.current?.slideNext()}
          >
            <img src="/icons/right.svg" alt="" />
          </button>
        </div>
      </div>
    </section>
  );
}
