"use client"
import React, { useEffect, useRef, useState } from 'react'
import styles from './ArrivalToronto.module.css'
import DaySlider from './DaySlider';
import FlightTimingDetail from './flightTimingDetails/FlightTimingDetail';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import HotelRoom from '../hotelRoom/HotelRoom';


const ArrivalToronto = () => {
    const tabsRef = useRef(null);
    const [isExpanded, setIsExpanded] = useState(false);
    const [swiperRef, setSwiperRef] = useState(null)
    const [activeIndex, setActiveIndex] = useState(0)
    const [openAccordion, setOpenAccordion] = useState(null);




    const handleSlideChange = (swiper) => {
        setActiveIndex(swiper.activeIndex)
    }

    const handlePrev = () => {
        swiperRef?.slidePrev()
    }

    const handleNext = () => {
        swiperRef?.slideNext()
    }

    const toggleExpand = (key) => {
        setOpenAccordion((prev) => (prev === key ? null : key));
    };

    const items = ["DAY Itinerary", "Hotels", "Transport", "ACTIVITIES", "INCLUSION & EXCLUSION", "TOUR POLICY"];

    const activitiesData = [
        {
            "id": 1,
            "image": "/images/yourAtivityImage2.png",
            "category": "Rest & Relaxation",
            "title": "An evening of culture in the heart of Toronton",
            "actions": [
                {
                    "label": "view",
                    "type": "view"
                },
                {
                    "label": "add +",
                    "type": "add"
                }
            ]
        },
        {
            "id": 2,
            "image": "/images/yourAtivityImage3.png",
            "category": "Rest & Relaxation",
            "title": "An evening of culture in the heart of Toronton",
            "actions": [
                {
                    "label": "view",
                    "type": "view"
                },
                {
                    "label": "add +",
                    "type": "add"
                }
            ]
        },
        {
            "id": 3,
            "image": "/images/yourAtivityImage3.png",
            "category": "Rest & Relaxation",
            "title": "An evening of culture in the heart of Toronton",
            "actions": [
                {
                    "label": "view",
                    "type": "view"
                },
                {
                    "label": "add +",
                    "type": "add"
                }
            ]
        },
        {
            "id": 4,
            "image": "/images/yourAtivityImage3.png",
            "category": "Rest & Relaxation",
            "title": "An evening of culture in the heart of Toronton",
            "actions": [
                {
                    "label": "view",
                    "type": "view"
                },
                {
                    "label": "add +",
                    "type": "add"
                }
            ]
        }
    ]


    const flight = {
        departure: {
            time: "06:45",
            city: "Jakarta (CGK)",
        },
        arrival: {
            time: "08:00",
            city: "Singapore (SIN)",
        },
        duration: {
            hours: 1,
            minutes: 50,
        },
        stops: {
            type: "Non Stop",
        },
        fare: {
            totalFare: "₹ 3,22,000",
            pricePerAdult: "₹ 12,000",
            cabinClass: "ECONOMY",
        },
    };
    const [activeTab, setActiveTab] = useState(items[0]);

    const onTabClick = (item, index) => {
        setActiveTab(item);
        // optional: swiperRef?.slideTo(index)
    };
    useEffect(() => {
        if (!tabsRef.current) return;

        const activeEl = tabsRef.current.querySelector(`.${styles.active}`);
        if (!activeEl) return;

        tabsRef.current.style.setProperty(
            "--indicator-width",
            `${activeEl.offsetWidth}px`
        );
        tabsRef.current.style.setProperty(
            "--indicator-left",
            `${activeEl.offsetLeft}px`
        );
    }, [activeTab]);
    return (
        <section className={styles.section}>
            {/* MONTH TABS */}
            <nav className={styles.tabsWrap}>
                <ul className={styles.tabs} ref={tabsRef}>
                    {items.map((item, index) => (
                        <li
                            key={item}
                            className={`${styles.tab} ${activeTab === item ? styles.active : ""
                                }`}
                            onClick={() => onTabClick(item, index)}
                        >
                            <button className={styles.tabBtn}>
                                {item}
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>
            <div className={styles.container}>
                <div className={styles.leftContainer}>
                    <DaySlider />
                    <div className={styles.leftBottomCont}>
                        <div className={styles.ArrivalContainer}>
                            <div className={styles.ArrivalRight}>
                                <h2>Day 1 – Arrival in Toronto</h2>
                            </div>
                            <div className={styles.ArrivalLeft}>
                                1 flight, 1 hotel, 1 meal, 1 Transfer
                            </div>

                        </div>
                        <div className={styles.paraCoontainer}>
                            <p>Our journey begins with a scenic arrival in Toronto, where vibrant city energy meets the calm of waterfront views. After a smooth airport welcome, settle into your hotel and enjoy time to unwind from your flight. In the evening, explore the city at a relaxed pace or enjoy a curated din odern Canadian cuisine, setting the tone for the adventure ahead.</p>
                            <HotelRoom/>
                        </div>

                        <div className={styles.expandableMainContainer}>
                            <div className={styles.expandableTab} onClick={() => toggleExpand("flight")} >
                                <h2>International Flight</h2>
                                <img className={`${styles.arrow} ${openAccordion === "flight" ? styles.rotate : ""
                                    }`} src="/icons/DownArrows.svg" alt="" />
                            </div>
                            <div
                                className={`${styles.expandableContent} ${openAccordion === "flight" ? styles.open : ""
                                    }`}
                            >
                                <div className={styles.expandableTop}>
                                    <div className={styles.fromToContainer}>
                                        <span>New Delhi (DEL) </span>
                                        <img src="/icons/rightArrow1.svg" alt="" />
                                        <span>Toronto (NMI)</span>
                                    </div>
                                    <div>
                                        <button className={styles.viewDetails}>View Details</button>
                                    </div>
                                </div>
                                <div className={styles.flightDetailsCont}>
                                    <div className={styles.flightDetailsSubCont}>
                                        <div className={styles.flightDetails}>
                                            <img src="/images/Flight.png" alt="" />
                                            <div className={styles.flightNameContainer}>
                                                <h2>IndiGo</h2>
                                                <span>6E-541</span>
                                            </div>
                                        </div>
                                        <div className={styles.flightTimingContainer}>
                                            <FlightTimingDetail flight={flight} />

                                        </div>
                                    </div>
                                    <div className={styles.br}></div>
                                    <div className={styles.cabinCont}>
                                        <div className={styles.cabinRow}>
                                            <img src="/icons/cabinSvg.svg" alt="" />
                                            <span>Cabin: 7 Kgs (1 Piece Only)</span>
                                        </div>
                                        <div className={styles.cabinRow}>
                                            <img src="/icons/checkSvg.svg" alt="" />
                                            <span>Cabin: 7 Kgs (1 Piece Only)</span>
                                        </div>

                                    </div>
                                </div>

                            </div>
                        </div>


                        <div className={styles.expandableMainContainer}>
                            <div className={styles.expandableTab} onClick={() => toggleExpand("transfer")} >
                                <h2>Private Transfer</h2>
                                <img className={`${styles.arrow} ${openAccordion === "transfer" ? styles.rotate : ""
                                    }`} src="/icons/DownArrows.svg" alt="" />
                            </div>
                            <div
                                className={`${styles.expandableContent} ${openAccordion === "transfer" ? styles.open : ""
                                    }`}
                            >

                                <div className={styles.PremiumContainer}>
                                    <img src="/images/cardImg.png" alt="" />
                                    <div className={styles.PremiumTextContainer}>
                                        <h3>Premium Airport Transfer</h3>
                                        <p>Enjoy a seamless arrival with our luxury private transfer service. Your personal chauffeur will meet you at arrivals with a nameplate and escort you to your premium vehicle.</p>
                                        <div className={styles.ApproximatelyTime}>
                                            <img src="/icons/watchBlack.svg" alt="" />
                                            <span>Approximately 45 minutes</span>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>


                        <div className={styles.yourActivityContainer}>
                            <div className={styles.yourActivityContainerTop}>
                                <div className={styles.yourActivityContainerTopLeft}>
                                    <h2 className={styles.youHeading}>your hotel</h2>
                                </div>
                                <div className={styles.yourActivityContainerTopRight}>
                                    <h2 className={styles.youHeading} >your ACTIVITY</h2>
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
                            </div>
                            <div className={styles.yourActivityContainerBottom}>
                                <div className={styles.yourActivityContainerBottomLeft}>
                                    <div className={styles.card}>
                                        <img className={styles.cardImage} src="/images/yourAtivityImage1.png" alt="" />
                                        <div className={styles.cardTextContainer}>
                                            <span className={styles.cardTextAddress}>Toronto, canada</span>
                                            <h3 className={styles.cardTextTitle}>Serene Haven Inn</h3>
                                            <button className={styles.cardTextButton}>view hotel options</button>
                                        </div>
                                    </div>
                                </div>
                                <div className={styles.yourActivityContainerBottomRight}>
                                    <Swiper
                                        modules={[Navigation]}
                                        onSwiper={setSwiperRef}
                                        onSlideChange={handleSlideChange}
                                        slidesPerView={'auto'}
                                        spaceBetween={12}
                                        className={styles.carousel}
                                    >
                                        {activitiesData.map((item) => (
                                            <SwiperSlide key={item.id} className={styles.slide}>
                                                <div key={item.id} className={styles.cardCarousell}>
                                                    <img className={styles.cardImage} src={item.image} alt="" />

                                                    <div className={`${styles.cardTextContainer} ${styles.cardTextContainer2}`}>
                                                        <span className={styles.cardTextAddress}>{item.category}</span>
                                                        <h3 className={styles.TextTitle}>{item.title}</h3>

                                                        <div className={styles.btnsCon}>
                                                            {item.actions.map((btn, i) => (
                                                                <button key={i} className={styles.cardButton}>
                                                                    {btn.label}
                                                                </button>
                                                            ))}
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

                </div>
                <div className={styles.rightContainer}>
                    <img src="/images/day0.webp" alt="" />
                </div>

            </div>
        </section>
    )
}

export default ArrivalToronto