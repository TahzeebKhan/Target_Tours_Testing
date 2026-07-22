'use client';
import React, { useState, useRef, useEffect } from 'react';
import styles from './OnzeReizenCarousel.module.css';
import Image from 'next/image'; // optional, use <img> if not using Next.js

const slides = [
  {
    id: 1,
    img: '/images/tour1.jpg',
    badge: '17 Days & 16 Nights',
    title: 'Best of India',
    subtitle: 'From Delhi to Kerala',
    price: 'Starting from €1,899'
  },
  {
    id: 2,
    img: '/images/tour2.jpg',
    badge: '10 Days',
    title: 'Magical Morocco',
    subtitle: 'Sahara & Atlas Mountains',
    price: 'Starting from €1,499'
  },
  {
    id: 3,
    img: '/images/tour3.jpg',
    badge: '12 Days',
    title: 'Discover Japan',
    subtitle: 'Tokyo • Kyoto • Nara',
    price: 'Starting from €2,399'
  },
  // add more slides as needed
];

const OnzeReizenCarousel = ({ autoPlay = true, autoPlayInterval = 5000 }) => {
  const [index, setIndex] = useState(0);
  const containerRef = useRef(null);
  const autoplayRef = useRef();

  useEffect(() => {
    autoplayRef.current = next;
  });

  useEffect(() => {
    if (!autoPlay) return;
    const tick = () => autoplayRef.current();
    const id = setInterval(tick, autoPlayInterval);
    return () => clearInterval(id);
  }, [autoPlay, autoPlayInterval]);

  function prev() {
    setIndex((i) => (i - 1 + slides.length) % slides.length);
  }

  function next() {
    setIndex((i) => (i + 1) % slides.length);
  }

  // swipe support
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let startX = 0;
    let delta = 0;

    const onTouchStart = (e) => (startX = e.touches[0].clientX);
    const onTouchMove = (e) => (delta = e.touches[0].clientX - startX);
    const onTouchEnd = () => {
      if (delta > 50) prev();
      else if (delta < -50) next();
      delta = 0;
    };

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: true });
    el.addEventListener('touchend', onTouchEnd);

    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }, []);

  return (
    <div className={styles.carousel} ref={containerRef}>
      <div
        className={styles.slider}
        style={{ transform: `translateX(-${index * 100}%)` }}
        aria-live="polite"
      >
        {slides.map((s) => (
          <article key={s.id} className={styles.slide}>
            <div className={styles.imageWrap}>
              {/* If using Next.js Image, uncomment below and comment <img> */}
              {/* <Image src={s.img} alt={s.title} fill objectFit="cover" /> */}
              <img src={s.img} alt={s.title} className={styles.img} />
              <div className={styles.badge}>{s.badge}</div>
            </div>

            <div className={styles.info}>
              <h3 className={styles.title}>{s.title}</h3>
              <p className={styles.subtitle}>{s.subtitle}</p>
              <div className={styles.bottomRow}>
                <span className={styles.price}>{s.price}</span>
                <button className={styles.cta}>Bekijk reis</button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Controls */}
      <button className={styles.prev} onClick={prev} aria-label="Previous slide">‹</button>
      <button className={styles.next} onClick={next} aria-label="Next slide">›</button>

      {/* Dots */}
      <div className={styles.dots}>
        {slides.map((_, i) => (
          <button
            key={i}
            className={`${styles.dot} ${i === index ? styles.active : ''}`}
            onClick={() => setIndex(i)}
            aria-label={`Go to slide ${i + 1}`}
            aria-pressed={i === index}
          />
        ))}
      </div>
    </div>
  );
};

export default OnzeReizenCarousel;
