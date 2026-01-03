"use client"
import React, { useState } from 'react'
import styles from './TravelInspiration.module.css'
import { Section } from 'lucide-react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation } from 'swiper/modules'

const TravelInspiration = () => {
    const [swiperRef, setSwiperRef] = useState(null)
    const [activeIndex, setActiveIndex] = useState(0)
    const travelTipsData = [
        {
            "id": 1,
            "category": "TRAVEL TIPS",
            "title": "A Guide to the Best Season for Canadian Rockies",
            "description": "Discover the perfect time to visit the Canadian Rockies and what each season has to offer travelers seeking adventure and natural beauty.",
            "readTime": "5 min read",
            "image": "/images/TravelInspiration1.png"
        },
        {
            "id": 2,
            "category": "TRAVEL TIPS",
            "title": "Wildlife Encounters in Banff National Park",
            "description": "From grizzly bears to elk, learn about the incredible wildlife you might encounter during your Canadian Rockies adventure and how to observe safely.",
            "readTime": "5 min read",
            "image": "/images/TravelInspiration2.png"
        },
        {
            "id": 3,
            "category": "TRAVEL TIPS",
            "title": "The Ultimate Lake Louise Photography Guide",
            "description": "Capture the stunning turquoise waters and mountain vistas of Lake Louise with our expert photography tips and best viewpoint recommendations.",
            "readTime": "5 min read",
            "image": "/images/TravelInspiration3.png"
        },
        {
            "id": 4,
            "category": "TRAVEL TIPS",
            "title": "The Ultimate Lake Louise Photography Guide",
            "description": "Capture the stunning turquoise waters and mountain vistas of Lake Louise with our expert photography tips and best viewpoint recommendations.",
            "readTime": "5 min read",
            "image": "/images/TravelInspiration3.png"
        },
        {
            "id": 5,
            "category": "TRAVEL TIPS",
            "title": "The Ultimate Lake Louise Photography Guide",
            "description": "Capture the stunning turquoise waters and mountain vistas of Lake Louise with our expert photography tips and best viewpoint recommendations.",
            "readTime": "5 min read",
            "image": "/images/TravelInspiration3.png"
        },
        {
            "id": 6,
            "category": "TRAVEL TIPS",
            "title": "The Ultimate Lake Louise Photography Guide",
            "description": "Capture the stunning turquoise waters and mountain vistas of Lake Louise with our expert photography tips and best viewpoint recommendations.",
            "readTime": "5 min read",
            "image": "/images/TravelInspiration3.png"
        },
        {
            "id": 7,
            "category": "TRAVEL TIPS",
            "title": "The Ultimate Lake Louise Photography Guide",
            "description": "Capture the stunning turquoise waters and mountain vistas of Lake Louise with our expert photography tips and best viewpoint recommendations.",
            "readTime": "5 min read",
            "image": "/images/TravelInspiration3.png"
        }
    ]

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
                <h2 className={styles.heading}>Travel Inspiration</h2>
                <div className={styles.cardContainer}>

                    <Swiper
                        modules={[Navigation]}
                        onSwiper={setSwiperRef}
                        onSlideChange={handleSlideChange}
                        slidesPerView={'auto'}
                        // slidesPerView={3}        // kitni slide dikhegi
                        // slidesPerGroup={1}
                        spaceBetween={25}
                        className={styles.carousel}
                    >
                        {travelTipsData.map((item) => (
                            <SwiperSlide key={item.id} className={styles.slide}>
                                <div key={item.id} className={styles.card}>
                                    <img
                                        src={item.image}
                                        alt={item.title}
                                        className={styles.cardImg}
                                    />

                                    <div className={styles.cardTextConatiner}>
                                        <div className={styles.travleTrip}>
                                            <p className={styles.travelText}>{item.category}</p>
                                            <span className={styles.travelTime}>{item.readTime}</span>
                                        </div>

                                        <div className={styles.bottomTextCont}>
                                            <h4 className={styles.cardHeading}>{item.title}</h4>
                                            <p className={styles.cardSubHeading}>{item.description}</p>
                                        </div>
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
    )
}

export default TravelInspiration