// import React from 'react'
// import styles from './TourListing.module.css'
// import SearchResults from '../searchResult/SearchResults'

// const TourListing = () => {
//   return (
//     <section className={styles.tourListSection}>
//       <SearchResults />
//       <div className={styles.cardContainer} >
//         <div className={styles.card}>
//         <img className={styles.itemImage} src="/tourList/cardItem1.jpg" alt="" />
//         <div className={styles.cardItems}>
//           <div className={styles.cardItemHeader}>
//             <div className={styles.headerLeft}>
//               <div className={styles.new}>New</div>
//               <div className={styles.private}>Private Tour</div>
//             </div>
//             <img src='/icons/heartIcon.svg' alt="" className={styles.heartIcon} />
//           </div>
//           <div className={styles.cardItemCenterText}>
//             <p className={styles.cardItemCenterTextPara}>TORONTO TO OTTAWA</p>
//             <h4 className={styles.cardItemCenterTextHeading}>Splendors of the Canadian West</h4>
//           </div>

//           <div className={styles.cardFooter}>
//             {/* Row 1 */}
//             <div className={styles.infoRow}>
//               <span>17 DAYS &amp; 16 NIGHTS</span>
//               <span>SELECTED MEALS</span>
//             </div>

//             {/* <div className={styles.divider}></div> */}

//             {/* Row 2 */}
//             <div className={styles.infoRow}>
//               <span>4-STAR HOTEL</span>
//               <span>3 ACTIVITIES</span>
//             </div>

//             {/* <div className={styles.divider}></div> */}

//             {/* Bottom Row */}
//             <div className={styles.bottomRow}>
//               <div className={styles.price}>
//                 FROM <strong>₹ 66,945</strong> <span>/ PERSON</span>
//               </div>

//               <button className={styles.viewDetails}>
//                 VIEW DETAILS <img src="/icons/smallDropArrow.svg" alt="" />
//               </button>
//             </div>
//           </div>

//         </div>
//       </div>
//       </div>
//     </section>
//   )
// }

// export default TourListing

"use client";
import React, { useState } from "react";
import styles from "./TourListing.module.css";
import SearchResults from "../searchResult/SearchResults";
// import { tourData } from "./tourData";

const TourListing = () => {

  const [likedTours, setLikedTours] = useState([]);


  // tourData.js
  const tourData = [
    {
      id: 1,
      image: "/tourList/cardItem1.jpg",
      route: "TORONTO TO OTTAWA",
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
      route: "VANCOUVER TO CALGARY",
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
      title: "Elegance of Canada’s West Coast",
      days: "17 DAYS & 16 NIGHTS",
      meals: "SELECTED MEALS",
      hotel: "4-STAR HOTEL",
      activities: "3 ACTIVITIES",
      price: "₹ 66,945",
    },
  ];

  const toggleLike = (id) => {
    setLikedTours((prev) =>
      prev.includes(id)
        ? prev.filter((itemId) => itemId !== id) // unlike
        : [...prev, id] // like
    );
  };

  return (
    <section className={styles.tourListSection}>
      <SearchResults />

      <div className={styles.cardContainer}>
        {tourData.map((item) => (
          <div className={styles.card} key={item.id}>
            <img
              className={styles.itemImage}
              src={item.image}
              alt={item.title}
            />

            <div className={styles.cardItems}>
              {/* Header */}
              <div className={styles.cardItemHeader}>
                <div className={styles.headerLeft}>
                  <div className={styles.new}>New</div>
                  <div className={styles.private}>Private Tour</div>
                </div>
                <img
                  src={
                    likedTours.includes(item.id)
                      ? "/icons/heartIconFilled.svg"
                      : "/icons/heartIcon.svg"
                  }
                  alt="wishlist"
                  className={styles.heartIcon}
                  onClick={() => toggleLike(item.id)}
                />
              </div>

              {/* Center text */}
              <div className={styles.cardItemCenterText}>
                <p className={styles.cardItemCenterTextPara}>
                  {item.route}
                </p>
                <h4 className={styles.cardItemCenterTextHeading}>
                  {item.title}
                </h4>
              </div>

              {/* Footer */}
              <div className={styles.cardFooter}>
                <div className={styles.infoRow}>
                  <span>{item.days}</span>
                  <span>{item.meals}</span>
                </div>

                <div className={styles.infoRow}>
                  <span>{item.hotel}</span>
                  <span>{item.activities}</span>
                </div>

                <div className={styles.bottomRow}>
                  <div className={styles.price}>
                    FROM <strong>{item.price}</strong> <span>/ PERSON</span>
                  </div>

                  <button className={styles.viewDetails}>
                    VIEW DETAILS
                    <img src="/icons/smallDropArrow.svg" alt="" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
        <div className={styles.ListViewCard}>
          <img src="/tourList/cardItem1.jpg" alt="" />
          <div className={styles.ListViewCardText}>
            <div className={styles.ListViewCardTextTop}>
              <div className={styles.topTextHead}>
                <h2>Splendors of the Canadian West</h2>
                <div className={styles.topTextHeadAddress}>
                  <img src="/icons/blackAddress.svg" alt="" />
                  <span>TORONTO TO OTTAWA</span>
                </div>
              </div>
              <div className={styles.tagsContainer}>
                <div className={styles.tag}>Round Trip Flights</div>
                <div className={styles.tag}>4 Star Hotels</div>
                <div className={styles.tag}>Airport Transfers</div>
                <div className={styles.tag}>Intercity Car Transfers</div>
              </div>
            </div>
            <div className={styles.ListViewCardTextBottom}>
              <div className={styles.bottomItem}>
                <img src="/icons/checkIcon.svg" alt="" />
                Banff Gondola Ride
              </div>

              <div className={styles.bottomItem}>
                <img src="/icons/checkIcon.svg" alt="" />
                Lake Louise Scenic Walk
              </div>

              <div className={styles.bottomItem}>
                <img src="/icons/checkIcon.svg" alt="" />
                Icefields Parkway Glacier Tour
              </div>
            </div>
          </div>
        </div>
      </div>


    </section>
  );
};

export default TourListing;
