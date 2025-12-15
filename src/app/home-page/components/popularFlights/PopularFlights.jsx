

"use client"
import React, { useState } from 'react'
import styles from './PopularFlights.module.css'
import { Navigation } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'

// Import Swiper styles
import 'swiper/css'
import 'swiper/css/navigation'

const PopularFlights = () => {
    const [swiperRef, setSwiperRef] = useState(null)
    const [activeTab, setActiveTab] = useState('Domestic')
    
    const domesticData = [
        {
            id: 1,
            img: "/images/hyderabad.png",
            city: "Hyderabad",
            date: "24 Mar 2026 - 14 Apr 2026",
            price: "₹20,000"
        },
        {
            id: 2,
            img: "/images/chennai2.png",
            city: "Chennai",
            date: "24 Mar 2026 - 14 Apr 2026",
            price: "₹20,000"
        },
        {
            id: 3,
            img: "/images/pune2.png",
            city: "Pune",
            date: "24 Mar 2026 - 14 Apr 2026",
            price: "₹20,000"
        },
        {
            id: 4,
            img: "/images/ahamdabad2.png",
            city: "Ahmedabad",
            date: "24 Mar 2026 - 14 Apr 2026",
            price: "₹20,000"
        },
        {
            id: 5,
            img: "/images/items1.jpg",
            city: "Mumbai",
            date: "24 Mar 2026 - 14 Apr 2026",
            price: "₹20,000"
        },
        {
            id: 6,
            img: "/images/pune2.png",
            city: "Bangalore",
            date: "24 Mar 2026 - 14 Apr 2026",
            price: "₹20,000"
        },
        {
            id: 7,
            img: "/images/items1.jpg",
            city: "Kolkata",
            date: "24 Mar 2026 - 14 Apr 2026",
            price: "₹20,000"
        },
        {
            id: 8,
            img: "/images/items1.jpg",
            city: "Delhi",
            date: "24 Mar 2026 - 14 Apr 2026",
            price: "₹20,000"
        }
    ];

    const internationalData = [
        {
            id: 1,
            img:"/images/ahamdabad2.png",
            city: "Dubai",
            date: "24 Mar 2026 - 14 Apr 2026",
            price: "₹45,000"
        },
        {
            id: 2,
            img:"/images/hyderabad.png",
            city: "Singapore",
            date: "24 Mar 2026 - 14 Apr 2026",
            price: "₹35,000"
        },
        {
            id: 3,
            img: "/images/chennai2.png",
            city: "Bangkok",
            date: "24 Mar 2026 - 14 Apr 2026",
            price: "₹28,000"
        },
        {
            id: 4,
            img: "/images/items1.jpg",
            city: "London",
            date: "24 Mar 2026 - 14 Apr 2026",
            price: "₹85,000"
        },
        {
            id: 5,
            img: "/images/items1.jpg",
            city: "New York",
            date: "24 Mar 2026 - 14 Apr 2026",
            price: "₹95,000"
        },
        {
            id: 6,
            img: "/images/items1.jpg",
            city: "Paris",
            date: "24 Mar 2026 - 14 Apr 2026",
            price: "₹80,000"
        },
        {
            id: 7,
            img: "/images/items1.jpg",
            city: "Tokyo",
            date: "24 Mar 2026 - 14 Apr 2026",
            price: "₹75,000"
        },
        {
            id: 8,
            img: "/images/items1.jpg",
            city: "Sydney",
            date: "24 Mar 2026 - 14 Apr 2026",
            price: "₹90,000"
        }
    ];

    const cardData = activeTab === 'Domestic' ? domesticData : internationalData;

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        // Reset swiper to first slide when tab changes
        if (swiperRef) {
            swiperRef.slideTo(0, 0);
        }
    };

    return (
        <section className={styles.section}>
            <div className={styles.container}>
                <div className={styles.heading}>
                    Popular Flights to Destination From
                    <div className={styles.headingMult}>
                        <span> Delhi</span>
                        <img src="/icons/dropdown.svg" alt="" />
                    </div>
                </div>

                <nav className={styles.tabsWrap}>
                    <ul className={styles.tabs}>
                        {['Domestic', 'International'].map((t) => (
                            <li 
                                key={t} 
                                className={`${styles.tab} ${activeTab === t ? styles.active : ''}`}
                            >
                                <button 
                                    className={styles.tabBtn}
                                    onClick={() => handleTabChange(t)}
                                >
                                    {t}
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>


                <div style={{ margin: "0 auto" }} className='popularFlightsCarouselWrapper'>
                    <Swiper
                        key={activeTab}
                        modules={[Navigation]}
                        onSwiper={setSwiperRef}
                        slidesPerView={4}
                        slidesPerGroup={1}
                        spaceBetween={30}
                        navigation={true}
                        loop={true}
                        loopAdditionalSlides={2}
                    >
                        {cardData.map((item, index) => (
                            <SwiperSlide key={item.id}>
                                <div className={styles.carouselContainer}>
                                    <div className={styles.itemsCard}>
                                        <img src={item.img} alt="" />

                                        {/* Show text overlay on all cards */}
                                        {item.city && (
                                            <>
                                                <div className={styles.overlay}></div>

                                                <div className={styles.textContainer}>
                                                    <div className={styles.textTop}>
                                                        <span>{item.city}</span>
                                                        <p>{item.date}</p>
                                                    </div>

                                                    <div className={styles.textBottom}>
                                                        <p className={styles.economy}>
                                                            Economy From <span>{item.price}</span>
                                                        </p>
                                                        <p className={styles.discoverText}>DISCOVER FLIGHTS</p>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>
                {/* Buttons */}
                {/* <div className={styles.btnContainer}>
                    <div className={styles.btn}>
                        <img src="/icons/left.svg" alt="" />
                    </div>
                    <div className={styles.btn}>
                        <img src="/icons/right.svg" alt="" />
                    </div>
                </div> */}
                <div className={styles.btnContainer}>
                    <div 
                        className={styles.btn} 
                        onClick={() => {
                            if (swiperRef) {
                                swiperRef.slidePrev();
                            }
                        }}
                    >
                        <img src="/icons/left.svg" alt="" />
                    </div>

                    <div 
                        className={styles.btn} 
                        onClick={() => {
                            if (swiperRef) {
                                swiperRef.slideNext();
                            }
                        }}
                    >
                        <img src="/icons/right.svg" alt="" />
                    </div>
                </div>

            </div>
        </section>
    )
}

export default PopularFlights