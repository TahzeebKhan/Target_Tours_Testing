"use client"
import React, { useState } from "react";
import styles from "./Testimonial.module.css";
import { Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

const Testimonial = () => {
  const [swiperRef, setSwiperRef] = useState(null)
  const [activeIndex, setActiveIndex] = useState(0)


  const testimonialData = [
    {
      id: 1,
      name: "Michael Chen",
      location: "London, UK",
      rating: 5,
      review:
        "From the moment we arrived in Toronto to our final day in Vancouver, everything was flawless. The itinerary was well-paced, allowing us to truly appreciate each destination. The Lake Louise sunrise was unforgettable. Highly recommend!",
      date: "October 2024",
      avatar: null,
    },
    {
      id: 2,
      name: "Michael Chen",
      location: "Singapore",
      rating: 5,
      review:
        "From the moment we arrived in Toronto to our final day in Vancouver, everything was flawless. The itinerary was well-paced, allowing us to truly appreciate each destination. The Lake Louise sunrise was unforgettable. Highly recommend!",
      date: "October 2024",
      avatar: null,
    },
    {
      id: 3,
      name: "Michael Chen",
      location: "Madrid, Spain",
      rating: 5,
      review:
        "From the moment we arrived in Toronto to our final day in Vancouver, everything was flawless. The itinerary was well-paced, allowing us to truly appreciate each destination. The Lake Louise sunrise was unforgettable. Highly recommend!",
      date: "October 2024",
      avatar: null,
    },
    {
      id: 4,
      name: "Michael Chen",
      location: "Madrid, Spain",
      rating: 5,
      review:
        "From the moment we arrived in Toronto to our final day in Vancouver, everything was flawless. The itinerary was well-paced, allowing us to truly appreciate each destination. The Lake Louise sunrise was unforgettable. Highly recommend!",
      date: "October 2024",
      avatar: null,
    },
    {
      id: 5,
      name: "Michael Chen",
      location: "Madrid, Spain",
      rating: 5,
      review:
        "From the moment we arrived in Toronto to our final day in Vancouver, everything was flawless. The itinerary was well-paced, allowing us to truly appreciate each destination. The Lake Louise sunrise was unforgettable. Highly recommend!",
      date: "October 2024",
      avatar: null,
    },
    {
      id: 6,
      name: "Michael Chen",
      location: "Madrid, Spain",
      rating: 5,
      review:
        "From the moment we arrived in Toronto to our final day in Vancouver, everything was flawless. The itinerary was well-paced, allowing us to truly appreciate each destination. The Lake Louise sunrise was unforgettable. Highly recommend!",
      date: "October 2024",
      avatar: null,
    },
    {
      id: 7,
      name: "Michael Chen",
      location: "Madrid, Spain",
      rating: 5,
      review:
        "From the moment we arrived in Toronto to our final day in Vancouver, everything was flawless. The itinerary was well-paced, allowing us to truly appreciate each destination. The Lake Louise sunrise was unforgettable. Highly recommend!",
      date: "October 2024",
      avatar: null,
    },
  ];

  const handleSlideChange = (swiper) => {
    setActiveIndex(swiper.activeIndex)
  }

   const handlePrev = () => {
        swiperRef?.slidePrev()
    }

    const handleNext = () => {
        swiperRef?.slideNext()
    }
  return (
    <section className={styles.section}>
      <div className={styles.container}> 
        <h2 className={styles.heading}>What Our Travelers Say</h2>

        <div className={styles.testimonialContainer}>
          <Swiper
            modules={[Navigation]}
            onSwiper={setSwiperRef}
            onSlideChange={handleSlideChange}
            slidesPerView={'auto'}
            spaceBetween={24}
            className={styles.carousel}
          >
            {testimonialData.map((item) => (
              <SwiperSlide key={item.id} className={styles.slide}>
                <div className={styles.testimonialCard}>
                  {/* Header */}
                  <div className={styles.profileCont}>
                    <div className={styles.profile}>
                      <div className={styles.profileIcon}></div>

                      <div className={styles.profileAddressCont}>
                        <span className={styles.profileName}>{item.name}</span>
                        <span className={styles.profileAddress}>
                          {item.location}
                        </span>
                      </div>
                    </div>

                    <img src="/icons/testimonialIcon.svg" alt="quote" className={styles.TestimonialIcon} />
                  </div>

                  {/* Rating */}
                  <div className={styles.ratingStart}>
                    {[...Array(item.rating)].map((_, i) => (
                      <img
                        key={i}
                        src="/icons/tetimonialStart.svg"
                        alt="star"
                      />
                    ))}
                  </div>

                  {/* Review */}
                  <div className={styles.testimonialPara}>
                    <p>"{item.review}"</p>
                  </div>

                  {/* Date */}
                  <div className={styles.testimonialDate}>
                    <span>{item.date}</span>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
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
    </section>
  );
};

export default Testimonial;
