// import React from 'react'
// import styles from './PopularFlights.module.css'

// const PopularFlights = () => {

//     // --- Flight Card Data ---
//     const cardData = [
//         {
//             id: 1,
//             img: "/images/items1.jpg",
//             city: "Hyderabad",
//             date: "24 Mar 2026 - 14 Apr 2026",
//             price: "₹20,000"
//         },
//         {
//             id: 2,
//             img: "/images/items1.jpg",
//             city: "Hyderabad",
//             date: "24 Mar 2026 - 14 Apr 2026",
//             price: "₹20,000"
//         },
//         {
//             id: 3,
//             img: "/images/items1.jpg",
//             city: "Hyderabad",
//             date: "24 Mar 2026 - 14 Apr 2026",
//             price: "₹20,000"
//         },
//         {
//             id: 4,
//             img: "/images/items1.jpg",
//             city: "Hyderabad",
//             date: "24 Mar 2026 - 14 Apr 2026",
//             price: "₹20,000"
//         }
//     ];

//     return (
//         <section className={styles.section}>
//             <div className={styles.container}>

//                 {/* Heading Section */}
//                 <div className={styles.heading}>
//                     Popular Flights to Destination From
//                     <div className={styles.headingMult}>
//                         <span> Delhi</span>
//                         <img src="/icons/dropdown.svg" alt="" />
//                     </div>
//                 </div>

//                 {/* Tabs */}
//                 <nav className={styles.tabsWrap}>
//                     <ul className={styles.tabs}>
//                         {['Domestic', 'International'].map((t, i) => (
//                             <li key={t} className={`${styles.tab} ${i === 0 ? styles.active : ''}`}>
//                                 <button className={styles.tabBtn}>{t}</button>
//                             </li>
//                         ))}
//                     </ul>
//                 </nav>

//                 {/* Carousel Cards */}
//                 <div className={styles.carouselContainerMain}>
//                     <div className={styles.carouselContainer}>

//                         {cardData.map((item) => (
//                             <div key={item.id} className={styles.itemsCard}>
//                                 <img src={item.img} alt="" />

//                                 {/* For first card only - show text overlay */}
//                                 {item.city && (
//                                     <>
//                                         <div className={styles.overlay}></div>

//                                         <div className={styles.textContainer}>
//                                             <div className={styles.textTop}>
//                                                 <span>{item.city}</span>
//                                                 <p>{item.date}</p>
//                                             </div>

//                                             <div className={styles.textBottom}>
//                                                 <p className={styles.economy}>
//                                                     Economy From <span>{item.price}</span>
//                                                 </p>
//                                                 <p className={styles.discoverText}>DISCOVER FLIGHTS</p>
//                                             </div>
//                                         </div>
//                                     </>
//                                 )}
//                             </div>
//                         ))}

//                     </div>
//                 </div>

//                 {/* Buttons */}
//                 <div className={styles.btnContainer}>
//                     <div className={styles.btn}>
//                         <img src="/icons/left.svg" alt="" />
//                     </div>
//                     <div className={styles.btn}>
//                         <img src="/icons/right.svg" alt="" />
//                     </div>
//                 </div>

//             </div>
//         </section>
//     )
// }

// export default PopularFlights

"use client"
import React, { useState } from 'react'
import styles from './PopularFlights.module.css'
import { Virtual, Navigation, Pagination } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react' // Fixed import
import InnerCarousel from '@/app/exploreCarousel/component/InnerCarousel'

// Import Swiper styles
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

const PopularFlights = () => {
    const [swiperRef, setSwiperRef] = useState(null)
    // Create array with 10 slides
    const [slides] = useState(
        Array.from({ length: 4}).map((_, index) => `Slide ${index + 1}`)
    )

    const slideTo = (index) => {
        if (swiperRef) {
            swiperRef.slideTo(index - 1, 0)
        }
    }
    const cardData = [
        {
            id: 1,
            img: "/images/items1.jpg",
            city: "Hyderabad",
            date: "24 Mar 2026 - 14 Apr 2026",
            price: "₹20,000"
        },
        {
            id: 2,
            img: "/images/items1.jpg",
            city: "Hyderabad",
            date: "24 Mar 2026 - 14 Apr 2026",
            price: "₹20,000"
        },
        {
            id: 3,
            img: "/images/items1.jpg",
            city: "Hyderabad",
            date: "24 Mar 2026 - 14 Apr 2026",
            price: "₹20,000"
        },
        {
            id: 4,
            img: "/images/items1.jpg",
            city: "Hyderabad",
            date: "24 Mar 2026 - 14 Apr 2026",
            price: "₹20,000"
        }
    ];

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
                        {['Domestic', 'International'].map((t, i) => (
                            <li key={t} className={`${styles.tab} ${i === 0 ? styles.active : ''}`}>
                                <button className={styles.tabBtn}>{t}</button>
                            </li>
                        ))}
                    </ul>
                </nav>


                <div style={{ maxWidth: "1520px", margin: "0 auto" }} className='ExpCarouselWrapper'>
                    <Swiper
                        modules={[Virtual, Navigation]}
                        onSwiper={setSwiperRef}
                        slidesPerView={1}
                        centeredSlides={false}
                        spaceBetween={30}
                        pagination={{
                            type: 'fraction',
                        }}
                        navigation={true}
                        virtual
                    >
                        {slides.map((slideContent, index) => (
                            <SwiperSlide key={slideContent} virtualIndex={index}>
                                {/* <div style={{ margin: "100px auto" }}> */}
                                <div className={styles.carouselContainer}>

                                    {cardData.map((item) => (
                                        <div key={item.id} className={styles.itemsCard}>
                                            <img src={item.img} alt="" />

                                            {/* For first card only - show text overlay */}
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
                                    ))}

                                </div>
                                {/* </div> */}
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
                    <div className={styles.btn} onClick={() => swiperRef?.slidePrev()}>
                        <img src="/icons/left.svg" alt="" />
                    </div>

                    <div className={styles.btn} onClick={() => swiperRef?.slideNext()}>
                        <img src="/icons/right.svg" alt="" />
                    </div>
                </div>

            </div>
        </section>
    )
}

export default PopularFlights