// // import React, { useRef, useState } from 'react';
// // // Import Swiper React components
// // import { Swiper, SwiperSlide } from 'swiper/react';

// // // Import Swiper styles
// // import 'swiper/css';
// // import 'swiper/css/pagination';
// // import 'swiper/css/navigation';
// // import styles from './innerCarousel.module.css';


// // // import required modules
// // import { Pagination, } from 'swiper/modules';

// // export default function InnerCarousel() {
// //   const swiperRef = useRef(null);
// //   const [isBeginning, setIsBeginning] = useState(true);
// //   const [isEnd, setIsEnd] = useState(false);
// //   const [isFavorite, setIsFavorite] = useState(false);

// //   const handleSlideChange = (swiper) => {
// //     setIsBeginning(swiper.isBeginning);
// //     setIsEnd(swiper.isEnd);
// //   };

// //   const goNext = (e) => {
// //     e.stopPropagation();
// //     if (swiperRef.current) {
// //       swiperRef.current.slideNext();
// //     }
// //   };

// //   const goPrev = (e) => {
// //     e.stopPropagation();
// //     if (swiperRef.current) {
// //       swiperRef.current.slidePrev();
// //     }
// //   };

// //   const toggleFavorite = (e) => {
// //     e.stopPropagation();
// //     setIsFavorite(!isFavorite);
// //   };

// //   return (
// //     <>
// //       <div className='innerCarouselWrapper'>
// //         <Swiper
// //           style={{
// //             '--swiper-navigation-color': '#fff',
// //             '--swiper-pagination-color': '#fff',
// //           }}
// //           onSwiper={(swiper) => {
// //             swiperRef.current = swiper;
// //             handleSlideChange(swiper);
// //           }}
// //           onSlideChange={handleSlideChange}
// //           lazy={true}
// //           pagination={{
// //             clickable: true,
// //           }}
// //           navigation={false}
// //           modules={[Pagination]}
// //           className="mySwiper relative"
// //         >
// //           <div className={styles.heartIcon} onClick={toggleFavorite}>
// //             {isFavorite ? (
// //               <img src='/icons/heartIconFilled.svg' alt="Favorite" />
// //             ) : (
// //               <img src='/icons/heartIcon.svg' alt="Not Favorite" />
// //             )}
// //           </div>
// //           <div className={styles.iconsCont}>
// //             {!isBeginning && (
// //               <div className={styles.leftBtn} onClick={goPrev}>
// //                 <img src='/icons/left.svg' alt='' />
// //               </div>
// //             )}
// //             {!isEnd && (
// //               <div className={styles.leftRightBtn} onClick={goNext}>
// //                 <img src='/icons/right.svg' alt='' />
// //               </div>
// //             )}
// //           </div>
// //           <SwiperSlide className={styles.swapper}>
// //             <img
// //               src="/images/exp1.png"
// //             />
// //             <div className={styles.overlay}></div>
// //             <div className="swiper-lazy-preloader swiper-lazy-preloader-white"></div>
// //           </SwiperSlide>
// //           <SwiperSlide className={styles.swapper}>
// //             <img
// //               src="/images/exp2.png"
// //               loading="lazy"
// //             />
// //             <div className="swiper-lazy-preloader swiper-lazy-preloader-white"></div>
// //           </SwiperSlide>
// //           <SwiperSlide className={styles.swapper}>
// //             <img
// //               src="/images/exp3.png"
// //               loading="lazy"
// //             />
// //             <div className="swiper-lazy-preloader swiper-lazy-preloader-white"></div>
// //           </SwiperSlide>
// //           <SwiperSlide className={styles.swapper}>
// //             <img src="/images/exp4.png"
// //               loading="lazy"
// //             />
// //             <div className="swiper-lazy-preloader swiper-lazy-preloader-white"></div>
// //           </SwiperSlide>
// //           <SwiperSlide className={styles.swapper}>
// //             <img
// //               src="/images/exp1.png"
// //               loading="lazy"
// //             />
// //             <div className="swiper-lazy-preloader swiper-lazy-preloader-white"></div>
// //           </SwiperSlide>
// //           <SwiperSlide className={styles.swapper}>
// //             <img
// //               src="/images/exp2.png"
// //               loading="lazy"
// //             />
// //             <div className="swiper-lazy-preloader swiper-lazy-preloader-white">

// //             </div>
// //             {/* <div className={styles.innerCarouselContent}>
// //             <p className={styles.innerCarouselContentTitle}>Munnar, Kerala</p>
// //             <div className={styles.innerCarouselContentSubtitle}>Tranquil Retreat Lodge</div>
// //             <div className={styles.innerCarouselContentPrice}>
// //                 <div className={styles.innerCarouselContentPriceValue}>
// //                   FROM <span className={styles.innerCarouselContentPriceValuePrice}>₹449/night</span>
// //                   </div>
// //                 <div className={styles.innerCarouselContentPriceRating}>3.4</div>
// //             </div>
// //           </div> */}
// //           </SwiperSlide>
// //         </Swiper>
// //       </div>
// //     </>
// //   );
// // }
// import React, { useRef, useState } from 'react';
// import { Swiper, SwiperSlide } from 'swiper/react';

// // Import Swiper styles
// import 'swiper/css';
// import 'swiper/css/pagination';
// import 'swiper/css/navigation';
// import styles from './innerCarousel.module.css';

// // import required modules
// import { Pagination } from 'swiper/modules';

// export default function InnerCarousel({ images = [] }) {
//   const swiperRef = useRef(null);
//   const [isBeginning, setIsBeginning] = useState(true);
//   const [isEnd, setIsEnd] = useState(false);
//   const [isFavorite, setIsFavorite] = useState(false);

//   const handleSlideChange = (swiper) => {
//     setIsBeginning(swiper.isBeginning);
//     setIsEnd(swiper.isEnd);
//   };

//   const goNext = (e) => {
//     e.stopPropagation();
//     if (swiperRef.current) swiperRef.current.slideNext();
//   };

//   const goPrev = (e) => {
//     e.stopPropagation();
//     if (swiperRef.current) swiperRef.current.slidePrev();
//   };

//   const toggleFavorite = (e) => {
//     e.stopPropagation();
//     setIsFavorite(!isFavorite);
//   };

//   return (
//     <>
//       <div className='innerCarouselWrapper'>
//         <Swiper
//           style={{
//             '--swiper-navigation-color': '#fff',
//             '--swiper-pagination-color': '#fff',
//           }}
//           onSwiper={(swiper) => {
//             swiperRef.current = swiper;
//             handleSlideChange(swiper);
//           }}
//           onSlideChange={handleSlideChange}
//           lazy={true}
//           pagination={{ clickable: true }}
//           navigation={false}
//           modules={[Pagination]}
//           className="mySwiper relative"
//         >

//           <div className={styles.heartIcon} onClick={toggleFavorite}>
//             {isFavorite ? (
//               <img src='/icons/heartIconFilled.svg' alt="Favorite" />
//             ) : (
//               <img src='/icons/heartIcon.svg' alt="Not Favorite" />
//             )}
//           </div>

//           <div className={styles.iconsCont}>
//             {!isBeginning && (
//               <div className={styles.leftBtn} onClick={goPrev}>
//                 <img src='/icons/left.svg' alt='' />
//               </div>
//             )}
//             {!isEnd && (
//               <div className={styles.leftRightBtn} onClick={goNext}>
//                 <img src='/icons/right.svg' alt='' />
//               </div>
//             )}
//           </div>

//           {/* 🔥 Dynamic Slides */}
//           {images.map((img, i) => (
//             <SwiperSlide key={i} className={styles.swapper}>
//               <img src={img} loading="lazy" />
//               <div className={styles.overlay}></div>
//             </SwiperSlide>
//           ))}

//         </Swiper>
//       </div>
//     </>
//   );
// }
import React, { useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import styles from "./innerCarousel.module.css";

import { Pagination } from "swiper/modules";

export default function InnerCarousel({ images = [], favorite, onFavorite }) {
  const swiperRef = useRef(null);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

  const handleSlideChange = (swiper) => {
    setIsBeginning(swiper.isBeginning);
    setIsEnd(swiper.isEnd);
  };

  return (
    <>
      <div className="innerCarouselWrapper">
        <Swiper
          style={{
            "--swiper-navigation-color": "#fff",
            "--swiper-pagination-color": "#fff",
          }}
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
            handleSlideChange(swiper);
          }}
          onSlideChange={handleSlideChange}
          lazy={true}
          pagination={{ clickable: true }}
          navigation={false}
          modules={[Pagination]}
          className="mySwiper relative"
        >
          {/* ⭐ Independent Heart Icon */}
          <div className={styles.heartIcon} onClick={onFavorite}>
            <img
              src={
                favorite
                  ? "/icons/heartIconFilled.svg"
                  : "/icons/heartIcon.svg"
              }
              alt=""
            />
          </div>

          <div className={styles.iconsCont}>
            {!isBeginning && (
              <div
                className={styles.leftBtn}
                onClick={() => swiperRef.current.slidePrev()}
              >
                <img src="/icons/left.svg" alt="" />
              </div>
            )}

            {!isEnd && (
              <div
                className={styles.leftRightBtn}
                onClick={() => swiperRef.current.slideNext()}
              >
                <img src="/icons/right.svg" alt="" />
              </div>
            )}
          </div>

          {/* Dynamic Images */}
          {images.map((img, i) => (
            <SwiperSlide key={i} className={styles.swapper}>
              <img src={img} loading="lazy" />
              <div className={styles.overlay}></div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </>
  );
}
