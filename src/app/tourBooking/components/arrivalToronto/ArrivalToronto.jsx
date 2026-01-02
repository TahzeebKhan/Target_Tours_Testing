"use client"
import React, { useEffect, useRef, useState } from 'react'
import styles from './ArrivalToronto.module.css'
import DaySlider from './DaySlider';
import FlightTimingDetail from './flightTimingDetails/FlightTimingDetail';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import HotelRoom from './hotelRoom/HotelRoom';
import { motion, AnimatePresence } from "framer-motion";
import HotelPopup from './hotelRoom/HotelPopup';



const ArrivalToronto = () => {
    const tabsRef = useRef(null);
    const [isExpanded, setIsExpanded] = useState(false);
    const [swiperRef, setSwiperRef] = useState(null)
    const [activeIndex, setActiveIndex] = useState(0)
    const [openAccordion, setOpenAccordion] = useState(null);
    const [isHotelPopupOpen, setIsHotelPopupOpen] = useState(false);
    const [selectedHotel, setSelectedHotel] = useState(null);
    const [activeDayIndex, setActiveDayIndex] = useState(0);

   



    const openHotelPopup = (hotel) => {
        setSelectedHotel(hotel);
        setIsHotelPopupOpen(true);
    };

    const closeHotelPopup = () => {
        setIsHotelPopupOpen(false);
        setSelectedHotel(null);
    };




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

    const tabVariants = {
        initial: {
            opacity: 0,
        },
        animate: {
            opacity: 1,
            transition: {
                duration: 0.4,   // aane me thoda time
                ease: "easeOut",
            },
        },
        exit: {
            opacity: 0,
            transition: {
                duration: 0.35,  // jaane me soft fade
                ease: "easeIn",
            },
        },
    };



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

    const hotelData = {
        title: "Fairmont Royal York",
        location: "Downtown Toronto • 0.5 km from CN Tower",
        desc: "Historic luxury hotel in the heart of downtown Toronto, offering timeless elegance and world-class amenities.",
        images: ["/images/hotel1.png"]
    };


    const dayImgeFilter = [
        {
            image: "/images/day0.webp",
            day: "Day 1",
            desc: "Toronto demain",
        },
        {
            image: "/images/day1.png",
            day: "Day 2",
            desc: "Toronto demain",
        },
        {
            image: "/images/day2.png",
            day: "Day 3",
            desc: "Toronto demain",
        }

    ]

     const nextDayIndex = (activeDayIndex - 1 + dayImgeFilter.length) % dayImgeFilter.length;




    const handleNextDayImage = () => {
        setActiveDayIndex((prev) =>
            prev === dayImgeFilter.length - 1 ? 0 : prev + 1
        );
    };



    const [activeTab, setActiveTab] = useState('DAY Itinerary');

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
                    {activeTab !== "INCLUSION & EXCLUSION" && activeTab !== "TOUR POLICY" && (
                        <DaySlider />
                    )}

                    <AnimatePresence mode="wait">
                        {activeTab === "DAY Itinerary" && (

                            <div className={styles.leftBottomCont}>
                                <div className={styles.ArrivalContainer}>
                                    <div className={styles.ArrivalRight}>
                                        <h2>Day 1 – Arrival in Toronto</h2>
                                    </div>
                                    <div className={styles.ArrivalLeft}>
                                        1 flight, 1 hotel, 1 meal, 1 Transfer
                                    </div>

                                </div>
                                <motion.div
                                    key="day"
                                    variants={tabVariants}
                                    initial="initial"
                                    animate="animate"
                                    exit="exit"
                                    className={styles.leftBottomCont}
                                >
                                    <div className={styles.paraCoontainer}>
                                        <p>Our journey begins with a scenic arrival in Toronto, where vibrant city energy meets the calm of waterfront views. After a smooth airport welcome, settle into your hotel and enjoy time to unwind from your flight. In the evening, explore the city at a relaxed pace or enjoy a curated din odern Canadian cuisine, setting the tone for the adventure</p>
                                        {/* <HotelRoom/> */}
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
                                </motion.div>

                            </div>
                        )}


                        {activeTab === "Hotels" && (

                            <div className={styles.leftBottomCont}>
                                <div className={styles.ArrivalContainer}>
                                    <div className={styles.ArrivalRight}>
                                        <h2>Day 1 – Arrival in Toronto</h2>
                                    </div>
                                    <div className={styles.ArrivalLeft}>
                                        1 flight, 1 hotel, 1 meal, 1 Transfer
                                    </div>

                                </div>
                                <motion.div
                                    key="hotels"
                                    variants={tabVariants}
                                    initial="initial"
                                    animate="animate"
                                    exit="exit"
                                    className={styles.leftBottomCont}
                                >
                                    <div className={styles.paraCoontainer}>
                                        <HotelRoom onViewHotel={() => openHotelPopup(hotelData)} />

                                        <HotelPopup
                                            isOpen={isHotelPopupOpen}
                                            hotel={selectedHotel}
                                            onClose={closeHotelPopup}
                                        />
                                    </div>
                                </motion.div>
                            </div>

                        )}

                        {activeTab === "Transport" && (
                            <div className={styles.leftBottomCont}>
                                <div className={styles.ArrivalContainer}>
                                    <div className={styles.ArrivalRight}>
                                        <h2>Day 1 – Arrival in Toronto</h2>
                                    </div>
                                    <div className={styles.ArrivalLeft}>
                                        1 flight, 1 hotel, 1 meal, 1 Transfer
                                    </div>

                                </div>
                                <motion.div
                                    key="day"
                                    variants={tabVariants}
                                    initial="initial"
                                    animate="animate"
                                    exit="exit"
                                    className={styles.leftBottomCont}
                                >





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
                                </motion.div>

                            </div>
                        )}

                        {activeTab === "ACTIVITIES" && (
                            <div className={styles.leftBottomCont}>
                                <div className={styles.ArrivalContainer}>
                                    <div className={styles.ArrivalRight}>
                                        <h2>Day 1 – Arrival in Toronto</h2>
                                    </div>
                                    <div className={styles.ArrivalLeft}>
                                        1 flight, 1 hotel, 1 meal, 1 Transfer
                                    </div>

                                </div>
                                <motion.div
                                    key="day"
                                    variants={tabVariants}
                                    initial="initial"
                                    animate="animate"
                                    exit="exit"
                                    className={styles.leftBottomCont}
                                >
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
                                </motion.div>

                            </div>
                        )}
                        {activeTab === "INCLUSION & EXCLUSION" && (
                            <InclusionExclusion />
                        )}
                        {activeTab === "TOUR POLICY" && (
                            <TourPolicy />
                        )}
                    </AnimatePresence>


                </div>
                <div className={styles.rightContainer}>
                    <div className={styles.dayImageContainer}>
                        <AnimatePresence>
                            <motion.img
                                key={`bg-${activeDayIndex}`}
                                src={dayImgeFilter[nextDayIndex].image}
                                alt=""
                                className={styles.bgImage}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.5, ease: "easeInOut" }}
                            />
                        </AnimatePresence>
                    </div>

                    <div className={styles.dayImageCarousel}>
                        <AnimatePresence>
                            <motion.img
                                key={`carousel-${activeDayIndex}`}
                                src={dayImgeFilter[activeDayIndex].image}
                                alt=""
                                className={styles.carouselImage}
                                initial={{ opacity: 0.5 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0.5 }}
                                transition={{ duration: 0., ease: "easeInOut" }}
                            />
                        </AnimatePresence>

                        <div className={styles.DayImageTextCont}>
                            <div className={styles.textCont}>
                                <h4>{dayImgeFilter[activeDayIndex].day}</h4>
                                <h4>{dayImgeFilter[activeDayIndex].desc}</h4>
                            </div>

                            <div
                                className={styles.leftRightBtn}
                                onClick={handleNextDayImage}
                            >
                                <img src="/icons/right.svg" alt="" />
                            </div>
                        </div>
                    </div>
                </div>



            </div>
        </section >
    )
}

export default ArrivalToronto


const InclusionExclusion = () => {
    const inclusions = [
        "Comfortable stay for 4 nights in your preferred category Hotels",
        "Professional English speaking guide to help you explore the cities",
        "Breakfast is included as mentioned in Itinerary.",
        "Per Person rate on twin sharing basis",
        "Entrance Tickets to Genting Indoor Theme Park",
        "All Tours & Transfers on Seat In Coach Basis",
        "Visit Bali Safari & Marine Park with Jungle Hopper Pass",
    ];

    const exclusions = [
        "Comfortable stay for 4 nights in your preferred category Hotels",
        "Professional English speaking guide to help you explore the cities",
        "Breakfast is included as mentioned in Itinerary.",
        "Per Person rate on twin sharing basis",
        "Entrance Tickets to Genting Indoor Theme Park",
        "All Tours & Transfers on Seat In Coach Basis",
        "Visit Bali Safari & Marine Park with Jungle Hopper Pass",
    ];

    return (
        <section className={styles.inclusionWrapper}>
            <h2 className={styles.inclusionHeading}>INCLUSIONS & EXCLUSIONS</h2>
            {/* <div className={styles.divider} /> */}

            {/* INCLUSION */}
            <div className={styles.block}>
                <h3 className={styles.inclusionSubHeading}>INCLUSION</h3>
                <ul className={styles.inclusionList}>
                    {inclusions.map((item, index) => (
                        <li key={index} className={styles.inclusionItem}>
                            <div className={`${styles.icon} ${styles.check}`}> <img src="/icons/greenTick.svg" alt="" /></div>
                            <span className={styles.inclusionText}>{item}</span>
                        </li>
                    ))}
                </ul>
            </div>

            {/* EXCLUSION */}
            <div className={styles.block}>
                <h3 className={styles.inclusionSubHeading}>EXCLUSION</h3>
                <ul className={styles.inclusionList}>
                    {exclusions.map((item, index) => (
                        <li key={index} className={styles.inclusionItem}>
                            <div className={`${styles.icon} ${styles.cross}`}>
                                <img src="/icons/redCross.svg" alt="" />
                            </div>
                            <span className={styles.inclusionText}>{item}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
};


const TourPolicy = () => {
    const tourPolicyList = [

    ]

    return (
        <section className={styles.tourPolicyWrapper}>
            <h2 className={styles.inclusionHeading}>TOUR POLICY</h2>
            {/* <div className={styles.divider} /> */}

            {/* INCLUSION */}
            <div className={styles.tourBlock}>
                <h3 className={styles.inclusionSubHeading}>Confirmation Policy:</h3>
                <div className={styles.tourPolicyPara}>
                    <p>
                        The customer receives a confirmation voucher via email within 24 hours of successful booking.
                        In case the preferred slots are unavailable, an alternate schedule of the customer’s preference will be arranged and a new confirmation voucher will be sent via email.
                    </p>
                    <p>Alternatively, the customer may choose to cancel their booking before confirmation and a full refund will be processed.</p>
                </div>
            </div>

            {/* EXCLUSION */}
            <div className={styles.tourBlock}>
                <h3 className={styles.inclusionSubHeading}>Cancellation Policy:</h3>
                <div className={styles.tourPolicyList}>
                    <ul className={styles.list}>
                        <li>
                            <strong>10 days:</strong> 100%
                        </li>
                        <li>
                            <strong>10 to 15 days:</strong> 75% + Non Refundable Component
                        </li>
                        <li>
                            <strong>15 to 30 days:</strong> 30% + Non Refundable Component
                        </li>
                        <li>
                            <strong>Hotel / Air:</strong> 100% in case of non-refundable ticket /
                            Hotel Room
                        </li>
                        <li>
                            <strong>Cruise / Visa:</strong> On Actuals
                        </li>
                    </ul>
                    <p>All Prices are in Indian Rupees and subject to change without prior notice.</p>
                    <p>In the case FIT flight inclusive package, the full amount of the flight will be payable at the time of booking.</p>
                </div>
            </div>
            <div className={styles.tourBlock}>
                <h3 className={styles.inclusionSubHeading}>Refund Policy:</h3>
                <div className={styles.tourPolicyList}>
                    <ul className={styles.list}>
                        <li>
                            The applicable refund amount will be processed within 10 business days.
                        </li>
                        <li>
                            All applicable refunds will be done in the traveler's Thrillophilia wallet as Thrillcash.
                        </li>
                    </ul>
                </div>
            </div>
        </section>
    );
};

