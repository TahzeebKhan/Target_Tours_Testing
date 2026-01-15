"use client"
// Top pe yeh imports add karo
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import React, { useRef, useState } from 'react'
import styles from './AvailabilityComponent.module.css'
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import { useRouter } from 'next/navigation';

const roomsData = [
    {
        id: 1,
        image: [
            { img: "/images/hotelImage1.png" },
            { img: "/images/hotelImage2.png" },
            { img: "/images/hotelImage3.png" },

        ],
        title: "Deluxe Private AC Room with Ensuite Bathroom",
        beds: "2 Single bed",
        persons: "2 Persons",

        featuresLeft: [
            { icon: "/icons/arrows-expand.svg", text: "30 m2" },
            { icon: "/icons/no-smoking.svg", text: "No Smoking" },
            { icon: "/icons/greenTick.svg", text: "Breakfast" },
            { icon: "/icons/greenTick.svg", text: "Laundry Service" },
            { icon: "/icons/greenTick.svg", text: "Air Conditioner" },
             { icon: "/icons/greenTick.svg", text: "1 King Bed" },
            { icon: "/icons/greenTick.svg", text: "Valley View" },
            { icon: "/icons/greenTick.svg", text: "Iron/Ironing Board" },
            { icon: "/icons/greenTick.svg", text: "Laundry Service" },
            { icon: "/icons/greenTick.svg", text: "Free Wifi" }
        ],

        // featuresRight: [
        //     { icon: "/icons/greenTick.svg", text: "1 King Bed" },
        //     { icon: "/icons/greenTick.svg", text: "Valley View" },
        //     { icon: "/icons/greenTick.svg", text: "Iron/Ironing Board" },
        //     { icon: "/icons/greenTick.svg", text: "Laundry Service" },
        //     { icon: "/icons/greenTick.svg", text: "Free Wifi" }
        // ],

        benefits: [
            "Free stay for the kid",
            "1 Extra bed/mattress will be provided at no extra cost",
            "15% off on Food & Beverage services",
            "Complimentary Welcome Drink on arrival"
        ],

        cancellation: "Free Cancellation before 19 Jan 02:59 PM",

        rating: {
            label: "Excellent",
            reviews: "1,260 reviews",
            score: "5.0"
        },

        price: {
            actual: "₹66,945",
            offer: "₹ 66,945",
            nights: "x 5 night",
            taxes: "+ ₹ 226 Taxes & fees",
            bookWith: "₹ 0"
        }
    },

    {
        id: 2,
        image: [
            { img: "/images/hotelImage2.png" },
            { img: "/images/hotelImage1.png" },
            { img: "/images/hotelImage3.png" },

        ],
        title: "Deluxe Private AC Room with Ensuite Bathroom",
        beds: "2 Single bed",
        persons: "2 Persons",

        featuresLeft: [
            { icon: "/icons/arrows-expand.svg", text: "30 m2" },
            { icon: "/icons/no-smoking.svg", text: "No Smoking" },
            { icon: "/icons/greenTick.svg", text: "Breakfast" },
            { icon: "/icons/greenTick.svg", text: "Laundry Service" },
            { icon: "/icons/greenTick.svg", text: "Air Conditioner" },
            { icon: "/icons/greenTick.svg", text: "1 King Bed" },
            { icon: "/icons/greenTick.svg", text: "Valley View" },
            { icon: "/icons/greenTick.svg", text: "Iron/Ironing Board" },
            { icon: "/icons/greenTick.svg", text: "Laundry Service" },
            { icon: "/icons/greenTick.svg", text: "Free Wifi" }
        ],

        // featuresRight: [
        //     { icon: "/icons/greenTick.svg", text: "1 King Bed" },
        //     { icon: "/icons/greenTick.svg", text: "Valley View" },
        //     { icon: "/icons/greenTick.svg", text: "Iron/Ironing Board" },
        //     { icon: "/icons/greenTick.svg", text: "Laundry Service" },
        //     { icon: "/icons/greenTick.svg", text: "Free Wifi" }
        // ],

        benefits: [
            "Free stay for the kid",
            "1 Extra bed/mattress will be provided at no extra cost",
            "15% off on Food & Beverage services",
            "Complimentary Welcome Drink on arrival"
        ],

        cancellation: "Free Cancellation before 19 Jan 02:59 PM",

        rating: {
            label: "Excellent",
            reviews: "1,260 reviews",
            score: "5.0"
        },

        price: {
            actual: "₹66,945",
            offer: "₹ 66,945",
            nights: "x 5 night",
            taxes: "+ ₹ 226 Taxes & fees",
            bookWith: "₹ 0"
        }
    },

    {
        id: 3,
        image: [
            { img: "/images/hotelImage3.png" },
            { img: "/images/hotelImage2.png" },
            { img: "/images/hotelImage1.png" },

        ],
        title: "Deluxe Private AC Room with Ensuite Bathroom",
        beds: "2 Single bed",
        persons: "2 Persons",

        featuresLeft: [
            { icon: "/icons/arrows-expand.svg", text: "30 m2" },
            { icon: "/icons/no-smoking.svg", text: "No Smoking" },
            { icon: "/icons/greenTick.svg", text: "Breakfast" },
            { icon: "/icons/greenTick.svg", text: "Laundry Service" },
            { icon: "/icons/greenTick.svg", text: "Air Conditioner" },
            { icon: "/icons/greenTick.svg", text: "1 King Bed" },
            { icon: "/icons/greenTick.svg", text: "Valley View" },
            { icon: "/icons/greenTick.svg", text: "Iron/Ironing Board" },
            { icon: "/icons/greenTick.svg", text: "Laundry Service" },
            { icon: "/icons/greenTick.svg", text: "Free Wifi" }
        ],

        // featuresRight: [
        //     { icon: "/icons/greenTick.svg", text: "1 King Bed" },
        //     { icon: "/icons/greenTick.svg", text: "Valley View" },
        //     { icon: "/icons/greenTick.svg", text: "Iron/Ironing Board" },
        //     { icon: "/icons/greenTick.svg", text: "Laundry Service" },
        //     { icon: "/icons/greenTick.svg", text: "Free Wifi" }
        // ],

        benefits: [
            "Free stay for the kid",
            "1 Extra bed/mattress will be provided at no extra cost",
            "15% off on Food & Beverage services",
            "Complimentary Welcome Drink on arrival"
        ],

        cancellation: "Free Cancellation before 19 Jan 02:59 PM",

        rating: {
            label: "Excellent",
            reviews: "1,260 reviews",
            score: "5.0"
        },

        price: {
            actual: "₹66,945",
            offer: "₹ 66,945",
            nights: "x 5 night",
            taxes: "+ ₹ 226 Taxes & fees",
            bookWith: "₹ 0"
        }
    }
];


const AvailabilityComponent = () => {
    const router = useRouter();
    const swiperRefs = useRef({})
    const [swiperRef, setSwiperRef] = useState(null)
    const [activeIndex, setActiveIndex] = useState(0)
    const handleSlideChange = (swiper) => {
        setActiveIndex(swiper.activeIndex)
    }

    const handlePrev = () => {
        swiperRef?.slidePrev()
    }

    const handleNext = () => {
        swiperRef?.slideNext()
    }
    const handleAddRoom = () => {
        router.push("/hotel-booking");
    }
    return (
        <div className={styles.availabilitySection}>
            <h3 className={styles.heading}>Availability</h3>

            {roomsData.map((room) => (
                <div key={room.id} className={styles.CardSection}>
                    <div className={styles.imagesNestedCarousel}>
                        <Swiper
                            modules={[Navigation]}
                            onSwiper={(swiper) => {
                                swiperRefs.current[room.id] = swiper
                            }}
                            pagination={{ clickable: true }}
                            slidesPerView={1}
                        >
                            {room.image.map((item, index) => (
                                <SwiperSlide key={item.id} className={styles.slide}>
                                    <img key={index} src={item.img} alt="" />
                                </SwiperSlide>
                            ))}
                        </Swiper>
                        <div className={styles.btns}>
                            <button
                                className={styles.leftBtn}
                                onClick={() => swiperRefs.current[room.id]?.slidePrev()}
                            >
                                <img src="/icons/left.svg" alt="" />
                            </button>

                            <button
                                className={styles.rightBtn}
                                onClick={() => swiperRefs.current[room.id]?.slideNext()}
                            >
                                <img src="/icons/right.svg" alt="" />
                            </button>
                        </div>
                    </div>

                    <div className={styles.cardDetails}>
                        {/* LEFT */}
                        <div className={styles.cardDetailLeft}>
                            <div className={styles.hotelHeadCont}>
                                <h3 className={styles.hotelTitle}>{room.title}</h3>

                                <div className={styles.bedMainCont}>
                                    <div className={styles.bedCount}>
                                        <img src="/icons/bedIcon.svg" alt="" />
                                        <span>{room.beds}</span>
                                        <span>X</span>
                                    </div>
                                    <span className={styles.persons}>{room.persons}</span>
                                </div>
                            </div>

                            {/* FEATURES */}
                            <div className={styles.featureSec}>
                                <ul className={styles.featureList}>
                                    {room.featuresLeft.map((item, idx) => (
                                        <li key={idx}>
                                            <div className={styles.iconCont}>
                                                <img src={item.icon} alt="" />
                                            </div>
                                            {item.text}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* BENEFITS */}
                            <div className={styles.benefitsSec}>
                                <ul className={styles.benefitsList}>
                                    {room.benefits.map((benefit, idx) => (
                                        <li key={idx}>{benefit}</li>
                                    ))}
                                </ul>
                            </div>

                            {/* ACTIONS */}
                            <div className={styles.btnContainer}>
                                <div className={styles.CalcellCont}>
                                    <div className={styles.iconCont}>
                                        <img src="/icons/blueTick.svg" alt="" />
                                    </div>
                                    <span>{room.cancellation}</span>
                                </div>

                                <div className={styles.btnCont}>
                                    <button className={styles.moreDetailsBtn}>
                                    More Details
                                </button>
                                </div>
                            </div>
                        </div>

                        <div className={styles.br}></div>

                        {/* RIGHT */}
                        <div className={styles.cardDetailRight}>
                            <div className={styles.cardRightTop}>
                                <div className={styles.ExcellentCont}>
                                    <div className={styles.ExcellentText}>
                                        <span className={styles.Excellent}>{room.rating.label}</span>
                                        <span className={styles.reviews}>{room.rating.reviews}</span>
                                    </div>
                                    <div className={styles.ratting}>{room.rating.score}</div>
                                </div>

                                <div className={styles.priceContainer}>
                                    <div className={styles.price}>
                                        <span className={styles.actualPrice}>{room.price.actual}</span>
                                        <span className={styles.offerPrice}>{room.price.offer}</span>
                                    </div>
                                    <span className={styles.perNight}>{room.price.nights}</span>
                                    <span className={styles.taxesPrice}>{room.price.taxes}</span>
                                </div>
                            </div>

                            <div className={styles.bookroomContainer}>
                                <div className={styles.BookAmoutn}>
                                    Book with <span>{room.price.bookWith}</span>
                                </div>
                                <button className={styles.addRoomBtn} onClick={handleAddRoom}>ADD ROOM</button>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

export default AvailabilityComponent
