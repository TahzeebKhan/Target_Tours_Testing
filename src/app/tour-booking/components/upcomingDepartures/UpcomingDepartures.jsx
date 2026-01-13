"use client";
import React, { useEffect, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import styles from "./UpcomingDepartures.module.css";
import { Navigation } from "swiper/modules";

const UpcomingDepartures = () => {
    const months = [
        "FEB 2026",
        "MAR 2026",
        "APR 2026",
        "MAY 2026",
        "JUN 2026",
        "JUL 2026",
        "AUG 2026",
        "SEP 2026",
        "OCT 2026",
    ];

    const BookingData = [
        {
            id: 1,
            month: "FEB 2026",
            departureDate: "Thu, 03 Sept 2026",
            returnDate: "Tue, 15 Sept 2026",
            pricePerPerson: 66945,
            singleOccupantCharge: 6945,
            availability: "Available",
        },
        {
            id: 2,
            month: "FEB 2026",
            departureDate: "Thu, 10 Sept 2026",
            returnDate: "Tue, 22 Sept 2026",
            pricePerPerson: 66945,
            singleOccupantCharge: 6945,
            availability: "Available",
        },
        {
            id: 3,
            month: "FEB 2026",
            departureDate: "Thu, 12 Mar 2026",
            returnDate: "Tue, 24 Mar 2026",
            pricePerPerson: 58999,
            singleOccupantCharge: 5999,
            availability: "Available",
        },
        {
            id: 4,
            month: "MAR 2026",
            departureDate: "Thu, 10 Sept 2026",
            returnDate: "Tue, 22 Sept 2026",
            pricePerPerson: 66945,
            singleOccupantCharge: 6945,
            availability: "Available",
        },
        {
            id: 5,
            month: "APR 2026",
            departureDate: "Thu, 10 Sept 2026",
            returnDate: "Tue, 22 Sept 2026",
            pricePerPerson: 66945,
            singleOccupantCharge: 6945,
            availability: "Available",
        },
    ];

    const groupedData = months.map((month) => ({
        month,
        items: BookingData.filter((b) => b.month === month),
    }));
    const [swiperRef, setSwiperRef] = useState(null)
    const [activeIndex, setActiveIndex] = useState(0)
    const [activeTab, setActiveTab] = useState(months[0]);
    const tabsRef = useRef(null);
    const [offset, setOffset] = useState(0);
    const [slideWidth, setSlideWidth] = useState(0);


    // useEffect(() => {
    //     const calculateOffset = () => {
    //         const screenWidth = window.innerWidth;
    //         const maxContentWidth = 1400; // tumhara design width

    //         const calculated =
    //             screenWidth > maxContentWidth
    //                 ? (screenWidth - maxContentWidth) / 2
    //                 : 16; // mobile padding

    //         setOffset(calculated);
    //     };

    //     calculateOffset();
    //     window.addEventListener("resize", calculateOffset);

    //     return () => window.removeEventListener("resize", calculateOffset);
    // }, []);

    useEffect(() => {
        const calculate = () => {
            const screen = window.innerWidth;
            let content;
            if (screen >= 1920) content = 1400;
            else if (screen >= 1600) content = 1200;
            else if (screen >= 1440) content = 1080;
            else if (screen >= 1280) content = 960;
            else if (screen >= 1200) content = 840;
            else if (screen >= 1156) content = 800;
            else if (screen >= 991) content = 720;

            else content = screen - 32;

            const offsetVal = (screen - content) / 2;

            setSlideWidth(content);
            setOffset(offsetVal);
        };

        calculate();
        window.addEventListener("resize", calculate);
        return () => window.removeEventListener("resize", calculate);
    }, []);




    const handleSlideChange = (swiper) => {
        setActiveIndex(swiper.activeIndex)
    }

    // underline animation
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
    const handlePrev = () => {
        swiperRef?.slidePrev()
    }

    const handleNext = () => {
        swiperRef?.slideNext()
    }

    return (
        <section className={styles.section} style={{ "--slide-width": `${slideWidth}px` }} >
            <h3 className={styles.heading}>Upcoming Departures</h3>

            {/* MONTH TABS */}
            <nav className={styles.tabsWrap}>
                <ul className={styles.tabs} ref={tabsRef}>
                    {months.map((m, index) => (
                        <li
                            key={m}
                            className={`${styles.tab} ${activeTab === m ? styles.active : ""
                                }`}
                            onClick={() => {
                                swiperRef?.slideTo(index);
                            }}
                        >
                            <button className={styles.tabBtn}>{m}</button>
                        </li>
                    ))}
                </ul>
            </nav>

            {/* CAROUSEL */}
            <div className={styles.swiperWrapper}>
                {/* <Swiper
                    modules={[Navigation]}
                    onSwiper={setSwiperRef}
                    onSlideChange={handleSlideChange}
                    slidesPerView={'auto'}
                    spaceBetween={24}
                    className={styles.carousel}
                > */}
                <Swiper
                    modules={[Navigation]}
                    onSwiper={setSwiperRef}
                    onSlideChange={(s) => {
                        setActiveIndex(s.activeIndex);
                        setActiveTab(months[s.activeIndex]);
                    }}
                    slidesPerView="auto"
                    centeredSlides={false}
                    slidesOffsetBefore={offset}
                    slidesOffsetAfter={offset}
                    spaceBetween={24}
                    breakpoints={{
                        0: {
                            spaceBetween: 12,   // mobile
                        },
                        768: {
                            spaceBetween: 16,   // tablet & desktop
                        },
                    }}

                    className={styles.carousel}
                >
                    {groupedData.map((group) => (
                        <SwiperSlide key={group.month} className={styles.slide}>
                            <div className={styles.container}>
                                {group.items.length === 0 ? (
                                    <p className={styles.noData}></p>
                                ) : (
                                    group.items.map((item) => (
                                        <>
                                            <div key={item.id} className={styles.row}>
                                                {/* DATE */}

                                                <div className={styles.col}>
                                                    <p className={styles.departure_date}>
                                                        {item.departureDate}
                                                    </p>
                                                    <p className={styles.return_date}>
                                                        Return: {item.returnDate}
                                                    </p>
                                                </div>

                                                {/* PRICE */}
                                                <div className={styles.col}>
                                                    <p className={styles.price}>
                                                        From <span>₹ {item.pricePerPerson}</span>{" "}
                                                        <small>/ PERSON</small>
                                                    </p>
                                                    <p className={styles.extra}>
                                                        + ₹ {item.singleOccupantCharge} Single occupant
                                                    </p>
                                                </div>

                                                {/* STATUS */}
                                                <div className={styles.col}>
                                                    <span className={styles.available}>
                                                        {item.availability}
                                                    </span>
                                                </div>


                                                {/* CTA */}
                                                <div className={styles.col}>
                                                    <button className={styles.bookBtn}>BOOK NOW</button>
                                                </div>
                                            </div>
                                            <div key={item.id} className={styles.rowMobile}>
                                                {/* DATE */}

                                                <div className={styles.mobileColContainer}>
                                                    <div className={styles.col}>
                                                        <p className={styles.departure_date}>
                                                            {item.departureDate}
                                                        </p>
                                                        <p className={styles.return_date}>
                                                            Return: {item.returnDate}
                                                        </p>
                                                    </div>

                                                    {/* PRICE */}
                                                    <div className={styles.col}>
                                                        <p className={styles.price}>
                                                            From <span>₹ {item.pricePerPerson}</span>{" "}
                                                            <small>/ PERSON</small>
                                                        </p>
                                                        <p className={styles.extra}>
                                                            + ₹ {item.singleOccupantCharge} Single occupant
                                                        </p>
                                                    </div>

                                                    {/* STATUS */}
                                                    <div className={`${styles.colmobileLastChild} ${styles.col}`}>
                                                        <span className={styles.available}>
                                                            {item.availability}
                                                        </span>
                                                    </div>
                                                </div>


                                                {/* CTA */}
                                                <div className={styles.colmobile}>
                                                    <button className={styles.bookBtn}>BOOK NOW</button>
                                                </div>
                                            </div>
                                        </>


                                    ))
                                )}
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
        </section>
    );
};

export default UpcomingDepartures;

