"use client";
import React, { useState } from 'react'
import styles from './MobileHotelDetails.module.css'
import { Pencil } from 'lucide-react'
import MapSection from '../mapSection/MapSection'
import StickyHeader from './ResultsBottomSheet'
import ResultsStickyBar from './ResultsBottomSheet'
import ResultsBottomSheet from './ResultsBottomSheet'
import HotelGridView from './hotelGridView/HotelGridView'
import { useRouter } from 'next/navigation'

const MobileHotelDetails = () => {
    const router = useRouter();

  /* ✅ REQUIRED STATES */
  const [likedTours, setLikedTours] = useState([]);

      const toggleLike = (id) => {
    setLikedTours((prev) =>
      prev.includes(id)
        ? prev.filter((itemId) => itemId !== id)
        : [...prev, id]
    );
  };

  const handleBookNow = () => {
    router.push("/hotel-detail");
  };

     const tourData = [
    {
      id: 1,
      image: "/hotelList/hotelCardImg.png",
      route: "9211 Forest Avenue, California - 90734",
      title: "Splendors of the Canadian West",
      days: "17 DAYS & 16 NIGHTS",
      meals: "SELECTED MEALS",
      hotel: "4-STAR HOTEL",
      activities: "3 ACTIVITIES",
      price: "₹ 66,945",
    },
    {
      id: 2,
      image: "/tourList/cardItem2.jpg",
      route: "9211 Forest Avenue, California - 90734",
      title: "Splendors of the Rocky Mountains",
      days: "14 DAYS & 13 NIGHTS",
      meals: "SELECTED MEALS",
      hotel: "4-STAR HOTEL",
      activities: "3 ACTIVITIES",
      price: "₹ 72,990",
    },
    {
      id: 3,
      image: "/tourList/cardItem3.jpg",
      route: "TORONTO TO MONTREAL",
      title: "Charms of Eastern Canada",
      days: "17 DAYS & 16 NIGHTS",
      meals: "SELECTED MEALS",
      hotel: "4-STAR HOTEL",
      activities: "3 ACTIVITIES",
      price: "₹ 66,945",
    },
    {
      id: 4,
      image: "/tourList/cardItem4.jpg",
      route: "WHITEHORSE TO FAIRBANKS",
      title: "Northern Lights of Canada",
      days: "10 DAYS & 9 NIGHTS",
      meals: "SELECTED MEALS",
      hotel: "4-STAR HOTEL",
      activities: "4 ACTIVITIES",
      price: "₹ 89,900",
    },
    {
      id: 5,
      image: "/tourList/cardItem5.jpg",
      route: "MONTREAL TO QUEBEC CITY",
      title: "Colors of Quebec Fall",
      days: "17 DAYS & 16 NIGHTS",
      meals: "SELECTED MEALS",
      hotel: "4-STAR HOTEL",
      activities: "3 ACTIVITIES",
      price: "₹ 66,945",
    },
    {
      id: 6,
      image: "/tourList/cardItem6.jpg",
      route: "VANCOUVER TO WHISTLER",
      title: "Elegance of Canada's West Coast",
      days: "17 DAYS & 16 NIGHTS",
      meals: "SELECTED MEALS",
      hotel: "4-STAR HOTEL",
      activities: "3 ACTIVITIES",
      price: "₹ 66,945",
    },
  ];
    return (
        <div className={styles.hotelDetailsMobileContainer}>
            <div
                className={`${styles.tripDetailsHeader}`}
            >
                <div className={styles.mainCotainer}>
                    <img src="/icons/leftArrowTrip.svg" alt="" />
                    <div
                        className={`${styles.TripCardHeader} ${styles.TripCardHeaderNav}`}
                    >
                        <div className={styles.TripCardHeaderDetails}>
                            <p className={styles.TripCardHeaderDetailsItemText}>New Delhi</p>
                            {/* <span className={styles.TripCardHeaderDetailsItemCode}>
                (DEL)
              </span> */}

                            {/* <img src="/icons/right-arrow.svg" alt="" /> */}
                            <div className={styles.minDash}>-</div>
                            <p className={styles.TripCardHeaderDetailsItemText}>Goa</p>
                        </div>

                        <div className={styles.TripCardHeaderBookingDate}>
                            <p>Wed, 03 Dec</p>
                            <p>
                                <div className={styles.navDot}></div>1 Traveller
                            </p>
                            <p>
                                <div className={styles.navDot}></div>Economy
                            </p>
                        </div>
                    </div>
                </div>
                <Pencil className={styles.editIcon} color="#FFFFFF" size={16} />
            </div>

            <MapSection />
            <ResultsBottomSheet>
                    <HotelGridView
                        tourData={tourData}
                        likedTours={likedTours}
                        toggleLike={toggleLike}
                        handleBookNow={handleBookNow}
                    />
            </ResultsBottomSheet>
        </div>
    )
}

export default MobileHotelDetails