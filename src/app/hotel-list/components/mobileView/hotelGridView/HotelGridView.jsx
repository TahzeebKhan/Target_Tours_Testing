import React, { useMemo } from "react";
import { motion } from "framer-motion";
import styles from "./HotelGridView.module.css";
import { HotelBenefits } from "../../tourListing/TourListing";

const HotelGridView = ({
  tourData,
  likedTours,
  toggleLike,
  rating,
  handleBookNow,
  isLoading = false,
  staySummary = "1 night, 1 guest",
  loadingHotelDetailsId = "",
}) => {
  const skeletonCards = useMemo(() => Array.from({ length: 6 }, (_, index) => index), []);

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
      {!tourData.length &&
        isLoading &&
        skeletonCards.map((item) => (
          <div
            key={`hotel-mobile-skeleton-${item}`}
            className={`${styles.gridCard} ${styles.skeletonCard}`}
          >
            <div className={styles.skeletonImage}></div>
            <div className={styles.skeletonContent}>
              <div className={`${styles.skeletonLine} ${styles.skeletonStars}`}></div>
              <div className={`${styles.skeletonLine} ${styles.skeletonTitle}`}></div>
              <div className={`${styles.skeletonLine} ${styles.skeletonAddress}`}></div>
              <div className={styles.skeletonFeatures}>
                <span></span>
                <span></span>
                <span></span>
              </div>
              <div className={`${styles.skeletonLine} ${styles.skeletonBenefit}`}></div>
              <div className={styles.skeletonFooter}>
                <div className={`${styles.skeletonLine} ${styles.skeletonPrice}`}></div>
                <div className={`${styles.skeletonLine} ${styles.skeletonButton}`}></div>
              </div>
            </div>
          </div>
        ))}
      {tourData.map((item, index) => (
        <div
          key={item?.id || item?.api_hotel_id || item?.title || `hotel-mobile-grid-${index}`}
          className={styles.gridCard}
        >
          <div className={styles.gridCardImage}>
            <img
              className={styles.ListViewCardImage}
              src={item.image || "/hotelList/hotelCardImg.png"}
              alt={item.title || "Hotel"}
            />
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
                          index < (item.rating ?? rating ?? 5)
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
                    <img src="/icons/pool.svg" alt="mixer" />
                    <p>Mixer</p>
                  </div>
                </div>

                <HotelBenefits benefits={item.benefits} classes={styles} />
              </div>
            </div>

            <div className={styles.ListViewCardTextBottom}>
              <div className={styles.priceContainer}>
                <div className={styles.priceSec}>
                  {item.price}
                </div>
                <div className={styles.totalPrice}>
                  <span>{staySummary}</span>
                </div>
              </div>

              <button
                className={styles.bookNowBtn}
                disabled={loadingHotelDetailsId === item.id}
                onClick={() => handleBookNow(item)}
              >
                {loadingHotelDetailsId === item.id
                  ? "LOADING"
                  : "SEE AVAILABILITY"}
              </button>
            </div>
          </div>
        </div>
      ))}
    </motion.div>
  );
};

export default HotelGridView;
