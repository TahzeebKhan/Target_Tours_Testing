import React from "react";
import { motion } from "framer-motion";
import styles from "./HotelGridView.module.css";

const HotelGridView = ({
  tourData,
  likedTours,
  toggleLike,
  rating,
  handleBookNow
}) => {
  return (
    <motion.div
      className={styles.gridWrapper}
      key="grid"
      layout
      initial={{ opacity: 0, y:0 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 0 }}
      transition={{ duration: 0.55, ease: "easeInOut" }}
    >
      {tourData.map((item, index) => (
        <div
          key={item?.id || item?.api_hotel_id || item?.title || `hotel-mobile-grid-${index}`}
          className={styles.gridCard}
        >
          <div className={styles.gridCardImage}>
            <img className={styles.ListViewCardImage} src="/hotelList/hotelCardImg.png" alt="" />
            <div className={`${styles.cardItemHeader} ${styles.ListViewCardHeader} ${styles.CardViewCardHeader}`}>
              <div className={styles.headerLeft}>
                <div className={styles.new}>New</div>
                <div className={styles.private}>Flagship</div>
              </div>

              <img
                src={
                  likedTours.includes(item.id)
                    ? "/icons/heartIconFilled.svg"
                    : "/icons/heartIcon.svg"
                }
                alt="wishlist"
                className={`${styles.heartIcon} ${styles.ListViewHeartIcon}`}
                onClick={() => toggleLike(item.id)}
              />
            </div>
          </div>

          <div className={styles.gridCardText}>
            <div className={styles.cartListTop}>
              <div className={styles.ListViewCardTextTop}>
                <div className={styles.topTextHead}>
                  <div className={styles.rating}>
                    {[...Array(5)].map((_, index) => (
                      <img
                        key={index}
                        src={
                          index < rating
                            ? "/icons/conicstar.svg"
                            : "/icons/star-gray.svg"
                        }
                        alt="star"
                      />
                    ))}
                  </div>
                  <h2>{item.title}</h2>

                  <div className={styles.topTextHeadAddress}>
                    <img src="/icons/blackAddress.svg" alt="" />
                    <span>{item.route}</span>
                  </div>
                </div>

                <div className={styles.featuresCont}>
                  <div className={styles.featureItem}>
                    <img src="/icons/AirConditioning.svg" alt="" />
                    <p>Air conditioning</p>
                    <span>•</span>
                  </div>
                  <div className={styles.featureItem}>
                    <img src="/icons/Wifi.svg" alt="" />
                    <p>Wifi</p>
                    <span>•</span>
                  </div>
                  <div className={styles.featureItem}>
                    <img src="/icons/Kitchen.svg" alt="" />
                    <p>Kitchen</p>
                    <span>•</span>
                  </div>
                  <div className={styles.featureItem}>
                    <img src="/icons/Pool.svg" alt="" />
                    <p>Pool</p>
                    <span>•</span>
                  </div>
                  <div className={styles.featureItem}>
                    <img src="/icons/Mixer.svg" alt="mixer" />
                    <p>Mixer</p>
                  </div>
                </div>

                <ul className={styles.freeList}>
                  <li>
                    <div className={styles.tickCont}>
                      <img src="/icons/checkIcon.svg" alt="" />
                    </div>
                    Free Cancellation till 7 Jan 2022
                  </li>
                  <li>
                    <div className={styles.tickCont}>
                      <img src="/icons/checkIcon.svg" alt="" />
                    </div>
                    Free Breakfast
                  </li>
                </ul>
              </div>
            </div>

            <div className={styles.ListViewCardTextBottom}>
              <div className={styles.priceContainer}>
                <div className={styles.priceSec}>
                  {item.price}
                </div>
                <div className={styles.totalPrice}>
                  <span>1 night, 2 adults</span>
                </div>
              </div>

              <button className={styles.bookNowBtn} onClick={handleBookNow}>
                SEE AVAILABILITY
              </button>
            </div>
          </div>
        </div>
      ))}
    </motion.div>
  );
};

export default HotelGridView;
