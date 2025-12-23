// "use client";

// import { Swiper, SwiperSlide } from "swiper/react";
// import { Autoplay } from "swiper/modules";
// import "swiper/css";

// import styles from "./TravelCarousel.module.css";

// const slides = [
//     {
//         id: 1,
//         image: "/images/img1.jpg",
//         title: "TANZANIA & ZANZIBAR",
//         description: "SAFARI IN THE LAND OF THE MASAI HAKUNA MATATA ON...",
//         price: "₹20,000",
//         hasNewTag: true,
//         bottomTitle: "Tanzania & Zanzibar",
//         bottomDescription: "Safari In The Land Of The Masai Hakuna Matata On...",
//     },
//     {
//         id: 2,
//         image: "/images/img2.jpg",
//         title: "SENEGAL",
//         description: "In The Heart Of East Senegal And The Shine Shaloum",
//         price: "₹15,000",
//         hasNewTag: true,
//         bottomTitle: "Senegal",
//         bottomDescription: "In The Heart Of East Senegal And The Shine Shaloum",
//     },
//     {
//         id: 3,
//         image: "/images/img4.jpg",
//         title: "UZBEKISTAN",
//         description: "From Fergana To Khiva",
//         price: "₹18,000",
//         hasNewTag: false,
//         bottomTitle: "Uzbekistan",
//         bottomDescription: "From Fergana To Khiva",
//     },
//     {
//         id: 4,
//         image: "/images/img3.jpg",
//         title: "MADAGASCAR",
//         description: "The North: National Parks And Paradise Like Beaches",
//         price: "₹22,000",
//         hasNewTag: true,
//         bottomTitle: "Madagascar",
//         bottomDescription: "The North: National Parks And Paradise Like Beaches",
//     },
//     {
//         id: 5,
//         image: "/images/img5.jpg",
//         title: "JAPAN",
//         description: "Japan In The Winter",
//         price: "₹25,000",
//         hasNewTag: false,
//         bottomTitle: "Japan",
//         bottomDescription: "Japan In The Winter",
//     },
//     {
//         id: 6,
//         image: "/images/img5.jpg",
//         title: "JAPAN",
//         description: "Japan In The Winter",
//         price: "₹25,000",
//         hasNewTag: false,
//         bottomTitle: "Japan",
//         bottomDescription: "Japan In The Winter",
//     },
//     {
//         id: 7,
//         image: "/images/img5.jpg",
//         title: "JAPAN",
//         description: "Japan In The Winter",
//         price: "₹25,000",
//         hasNewTag: false,
//         bottomTitle: "Japan",
//         bottomDescription: "Japan In The Winter",
//     },
// ];

// export default function TravelCarousel() {
//     return (
//         <div className={styles.wrapper}>
//             <Swiper
//                 // modules={[Autoplay]}
//                 centeredSlides
//                 loop
//                 // slidesPerView="auto"
//                 speed={900}
//                 autoplay={{ delay: 3500, disableOnInteraction: false }}
//                 className={styles.swiper}
//                 // onSlideChangeTransitionEnd={(swiper) => {

//                 //     // 1️⃣ Remove old class
//                 //     swiper.slides.forEach((slide) => {
//                 //         slide.classList.remove("prevPrev");
//                 //     });

//                 //     // 2️⃣ Safe index (loop proof)
//                 //     let prevPrevIndex = swiper.activeIndex - 2;

//                 //     if (prevPrevIndex < 0) {
//                 //         prevPrevIndex = swiper.slides.length + prevPrevIndex;
//                 //     }

//                 //     // 3️⃣ Apply class
//                 //     swiper.slides[prevPrevIndex]?.classList.add("prevPrev");
//                 // }}
//             >
//                 {slides.map((item) => (
//                     <SwiperSlide key={item.id} className={styles.slide}>
//                         <div
//                             className={styles.card}
//                             style={{ backgroundImage: `url(${item.image})` }}
//                         >
//                             {item.hasNewTag && (
//                                 <span className={styles.badge}>CIRCUIT PRIVATIF</span>
//                             )}

//                             <div className={styles.content}>
//                                 <span className={styles.country}>{item.bottomTitle}</span>
//                                 <h2 className={styles.title}>{item.title}</h2>
//                             </div>
//                         </div>
//                     </SwiperSlide>
//                 ))}
//             </Swiper>
//         </div>
//     );
// }

"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectCoverflow } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-coverflow";

import styles from "./TravelCarousel.module.css";

const slides = [
    { id: 1, image: "/images/img1.jpg", title: "TANZANIA", country: "TANZANIA & ZANZIBAR", description: "SAFARI IN THE LAND OF THE MASAI HAKUNA MATATA ON..." },
    { id: 2, image: "/images/img2.jpg", title: "SENEGAL", country: "SENEGAL", description: "In The Heart Of East Senegal And The Shine Shaloum" },
    { id: 3, image: "/images/img3.jpg", title: "UZBEKISTAN", country: "UZBEKISTAN", description: "From Fergana To Khiva" },
    { id: 4, image: "/images/img4.jpg", title: "MADAGASCAR", country: "MADAGASCAR", description: "The North: National Parks And Paradise Like Beaches" },
    { id: 5, image: "/images/img5.jpg", title: "JAPAN", country: "JAPAN", description: "Japan In The Winter" },
    { id: 6, image: "/images/img1.jpg", title: "TANZANIA", country: "TANZANIA & ZANZIBAR", description: "SAFARI IN THE LAND OF THE MASAI HAKUNA MATATA ON..." },
    { id: 7, image: "/images/img2.jpg", title: "SENEGAL", country: "SENEGAL", description: "In The Heart Of East Senegal And The Shine Shaloum" },
];

export default function TravelCarousel() {
    return (
        <div className={styles.wrapper}>
            <Swiper
                modules={[Autoplay, EffectCoverflow]}
                effect="coverflow"
                grabCursor={true}
                centeredSlides={true}
                slidesPerView={'auto'}
                loop={true}
                loopedSlides={5}
                coverflowEffect={{
                    rotate: 0,
                    stretch: 0,
                    depth: 400,
                    modifier: 1,
                    slideShadows: false,
                }}
                autoplay={{
                    delay: 3000,
                    disableOnInteraction: false,
                }}
                speed={800}
                className={styles.swiper}
            >
                {slides.map((item, index) => (
                    <SwiperSlide key={`${item.id}-${index}`} className={styles.slide}>
                        <div
                            className={styles.card}
                            style={{ backgroundImage: `url(${item.image})` }}
                        >
                            <div className={styles.content}>
                                <span className={styles.country}>{item.country}</span>
                                <h2 className={styles.title}>{item.description}</h2>
                            </div>
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
}


