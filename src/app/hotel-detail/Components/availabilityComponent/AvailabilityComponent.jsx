"use client";
// Top pe yeh imports add karo
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import React, { useRef, useState } from "react";
import styles from "./AvailabilityComponent.module.css";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import { useRouter } from "next/navigation";

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
      { icon: "/icons/greenTick.svg", text: "Free Wifi" },
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
      "Complimentary Welcome Drink on arrival",
    ],

    cancellation: "Free Cancellation before 19 Jan 02:59 PM",

    rating: {
      label: "Excellent",
      reviews: "1,260 reviews",
      score: "5.0",
    },

    price: {
      actual: "₹66,945",
      offer: "₹ 66,945",
      nights: "x 5 night",
      taxes: "+ ₹ 226 Taxes & fees",
      bookWith: "₹ 0",
    },
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
      { icon: "/icons/greenTick.svg", text: "Free Wifi" },
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
      "Complimentary Welcome Drink on arrival",
    ],

    cancellation: "Free Cancellation before 19 Jan 02:59 PM",

    rating: {
      label: "Excellent",
      reviews: "1,260 reviews",
      score: "5.0",
    },

    price: {
      actual: "₹66,945",
      offer: "₹ 66,945",
      nights: "x 5 night",
      taxes: "+ ₹ 226 Taxes & fees",
      bookWith: "₹ 0",
    },
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
      { icon: "/icons/greenTick.svg", text: "Free Wifi" },
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
      "Complimentary Welcome Drink on arrival",
    ],

    cancellation: "Free Cancellation before 19 Jan 02:59 PM",

    rating: {
      label: "Excellent",
      reviews: "1,260 reviews",
      score: "5.0",
    },

    price: {
      actual: "₹66,945",
      offer: "₹ 66,945",
      nights: "x 5 night",
      taxes: "+ ₹ 226 Taxes & fees",
      bookWith: "₹ 0",
    },
  },
];

const AvailabilityComponent = () => {
  const router = useRouter();
  const swiperRefs = useRef({});
  const [swiperRef, setSwiperRef] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const [roomQty, setRoomQty] = useState({});
  const increase = (id) => {
    setRoomQty((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1,
    }));
  };

  const decrease = (id) => {
    setRoomQty((prev) => {
      const nextQty = (prev[id] || 0) - 1;

      if (nextQty <= 0) {
        const copy = { ...prev };
        delete copy[id]; // 🔥 remove → back to ADD ROOM
        return copy;
      }

      return { ...prev, [id]: nextQty };
    });
  };
  const handleSlideChange = (swiper) => {
    setActiveIndex(swiper.activeIndex);
  };

  const handlePrev = () => {
    swiperRef?.slidePrev();
  };

  const handleNext = () => {
    swiperRef?.slideNext();
  };
  const handleAddRoom = (id) => {
    increase(id);
  };
  return (
    <div className={styles.availabilitySection}>
      <h3 className={styles.heading}>Availability</h3>

      {roomsData.map((room) => {
        const qty = roomQty[room.id] || 0;

        return (
          <div key={room.id} className={styles.CardSection}>
            <div className={styles.imagesNestedCarousel}>
              <Swiper
                modules={[Navigation]}
                onSwiper={(swiper) => {
                  swiperRefs.current[room.id] = swiper;
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
                    <div className={styles.blueTickCont}>
                      <img src="/icons/bluetick.svg" alt="" />
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
                      <span className={styles.Excellent}>
                        {room.rating.label}
                      </span>
                      <span className={styles.reviews}>
                        {room.rating.reviews}
                      </span>
                    </div>
                    <div className={styles.ratting}>{room.rating.score}</div>
                  </div>

                  <div className={styles.priceContainer}>
                    <div className={styles.price}>
                      <span className={styles.actualPrice}>
                        {room.price.actual}
                      </span>
                      <span className={styles.offerPrice}>
                        {room.price.offer}
                      </span>
                    </div>
                    <span className={styles.perNight}>{room.price.nights}</span>
                    <span className={styles.taxesPrice}>
                      {room.price.taxes}
                    </span>
                  </div>
                </div>

                <div className={styles.bookroomContainer}>
                  <div className={styles.BookAmoutn}>
                    Book with <span>{room.price.bookWith}</span>
                  </div>

                  <button
                    className={`${styles.addRoomBtn} ${
                      qty > 0 ? styles.fadeOut : styles.fadeIn
                    }`}
                    onClick={() => handleAddRoom(room.id)}
                  >
                    ADD ROOM
                  </button>

                  <div
                    className={`${styles.counter} ${
                      qty > 0 ? styles.fadeIn : styles.fadeOut
                    }`}
                  >
                    <button
                      className={styles.btn}
                      onClick={(e) => {
                        e.stopPropagation();
                        decrease(room.id);
                      }}
                    >
                      <svg
                        width="11"
                        height="2"
                        viewBox="0 0 11 2"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M0.75 1.49995C0.5375 1.49995 0.359375 1.42805 0.215625 1.28425C0.071875 1.14043 0 0.962233 0 0.74965C0 0.53705 0.071875 0.358958 0.215625 0.215375C0.359375 0.0717914 0.5375 0 0.75 0H10.25C10.4625 0 10.6406 0.0718998 10.7843 0.2157C10.9281 0.359516 11 0.537717 11 0.7503C11 0.9629 10.9281 1.14099 10.7843 1.28457C10.6406 1.42816 10.4625 1.49995 10.25 1.49995H0.75Z"
                          fill="#000033"
                        />
                      </svg>
                    </button>
                    <span className={styles.count}>{qty}</span>
                    <button
                      className={styles.btn}
                      onClick={(e) => {
                        e.stopPropagation();
                        increase(room.id);
                      }}
                    >
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 13 13"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M5.75 7.24995H0.75C0.5375 7.24995 0.359375 7.17805 0.215625 7.03425C0.071875 6.89043 0 6.71223 0 6.49965C0 6.28705 0.071875 6.10896 0.215625 5.96538C0.359375 5.82179 0.5375 5.75 0.75 5.75H5.75V0.75C5.75 0.5375 5.8219 0.359375 5.9657 0.215625C6.10952 0.071875 6.28772 0 6.5003 0C6.7129 0 6.89099 0.071875 7.03457 0.215625C7.17816 0.359375 7.24995 0.5375 7.24995 0.75V5.75H12.25C12.4625 5.75 12.6406 5.8219 12.7843 5.9657C12.9281 6.10952 13 6.28772 13 6.5003C13 6.7129 12.9281 6.89099 12.7843 7.03458C12.6406 7.17816 12.4625 7.24995 12.25 7.24995H7.24995V12.25C7.24995 12.4625 7.17805 12.6406 7.03425 12.7843C6.89043 12.9281 6.71223 13 6.49965 13C6.28705 13 6.10896 12.9281 5.96537 12.7843C5.82179 12.6406 5.75 12.4625 5.75 12.25V7.24995Z"
                          fill="#000033"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AvailabilityComponent;
