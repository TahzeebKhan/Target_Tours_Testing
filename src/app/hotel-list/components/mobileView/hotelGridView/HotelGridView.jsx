import React, { useMemo } from "react";
import { motion } from "framer-motion";
import styles from "./HotelGridView.module.css";
import { HotelBenefits, HotelFacilities } from "../../tourListing/TourListing";

const getHotelLoadingKey = (hotel = {}) =>
  hotel.id || hotel.hotelId || hotel.api_hotel_id || hotel.hotelCode || "";

const HotelGridView = ({
  tourData,
  likedTours,
  onWishlistClick,
  isAddingToWishlist = false,
  rating,
  handleBookNow,
  isLoading = false,
  staySummary = "1 night, 1 guest",
  loadingHotelDetailsId = "",
  locationLabel = "this location",
  showEmptyState = false,
}) => {
  const skeletonCards = useMemo(
    () => Array.from({ length: 6 }, (_, index) => index),
    [],
  );
  const shouldShowEmptyState = showEmptyState && !isLoading && !tourData.length;

  return (
    <motion.div
      className={styles.gridWrapper}
      key="grid"
      layout
      initial={{ opacity: 0, y: 0 }}
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
              <div
                className={`${styles.skeletonLine} ${styles.skeletonStars}`}
              ></div>
              <div
                className={`${styles.skeletonLine} ${styles.skeletonTitle}`}
              ></div>
              <div
                className={`${styles.skeletonLine} ${styles.skeletonAddress}`}
              ></div>
              <div className={styles.skeletonFeatures}>
                <span></span>
                <span></span>
                <span></span>
              </div>
              <div
                className={`${styles.skeletonLine} ${styles.skeletonBenefit}`}
              ></div>
              <div className={styles.skeletonFooter}>
                <div
                  className={`${styles.skeletonLine} ${styles.skeletonPrice}`}
                ></div>
                <div
                  className={`${styles.skeletonLine} ${styles.skeletonButton}`}
                ></div>
              </div>
            </div>
          </div>
        ))}
      {shouldShowEmptyState && (
        <div className={styles.emptyState}>
          <img
            className={styles.emptyStateImage}
            src="/images/CouldntFind.svg"
            alt="No hotels found"
          />
          <div className={styles.emptyStateText}>
            <h3>No hotels found for {locationLabel}</h3>
            <p>
              Try a nearby area, adjust your travel dates, or change the guest
              count to see more stays.
            </p>
          </div>
        </div>
      )}
      {tourData.map((item, index) => {
        const itemLoadingKey = getHotelLoadingKey(item);
        const isItemLoading = loadingHotelDetailsId === itemLoadingKey;

        return (
          <div
            key={
              item?.id ||
              item?.api_hotel_id ||
              item?.title ||
              `hotel-mobile-grid-${index}`
            }
            className={styles.gridCard}
          >
            <div className={styles.gridCardImage}>
              <img
                className={styles.ListViewCardImage}
                src={item.image || "/hotelList/hotelImg.jpg"}
                alt={item.title || "Hotel"}
              />
              <div
                className={`${styles.cardItemHeader} ${styles.ListViewCardHeader} ${styles.CardViewCardHeader}`}
              >
                <div className={styles.headerLeft}>
                  <div className={styles.new}>New</div>
                  <div className={styles.private}>Flagship</div>
                </div>

                <img
                  src={
                    likedTours.includes(String(item.id))
                      ? "/icons/heartIconFilled.svg"
                      : "/icons/heartIcon.svg"
                  }
                  alt="wishlist"
                  className={`${styles.heartIcon} ${styles.ListViewHeartIcon}`}
                  aria-disabled={isAddingToWishlist}
                  onClick={() => onWishlistClick(item.id)}
                />
              </div>
            </div>

            <div className={styles.gridCardText}>
              <div className={styles.cartListTop}>
                <div className={styles.ListViewCardTextTop}>
                  <div className={styles.topTextHead}>
                    <div className={styles.ratingRow}>
                      <div className={styles.rating}>
                        {[...Array(5)].map((_, starIndex) => (
                          <img
                            key={starIndex}
                            src={
                              starIndex < (item.rating ?? rating ?? 5)
                                ? "/icons/conicstar.svg"
                                : "/icons/star-gray.svg"
                            }
                            alt="star"
                          />
                        ))}
                      </div>
                      {item.reviewScoreText && (
                        <div className={styles.reviewSummary}>
                          <span>{item.reviewScoreText}</span>
                          {item.reviewText ? ` (${item.reviewText})` : ""}
                        </div>
                      )}
                    </div>
                    <h2>{item.title}</h2>

                    <div className={styles.topTextHeadAddress}>
                      <img src="/icons/blackAddress.svg" alt="" />
                      <span>{item.route}</span>
                    </div>
                  </div>

                  <HotelFacilities facilities={item.facilities} />

                  <HotelBenefits benefits={item.benefits} classes={styles} />
                </div>
              </div>

              <div className={styles.ListViewCardTextBottom}>
                <div className={styles.priceContainer}>
                  {item.hasPrice ? (
                    <>
                      <div className={styles.priceSec}>{item.price}</div>
                      <div className={styles.totalPrice}>
                        <span>{staySummary}</span>
                      </div>
                    </>
                  ) : (
                    <div className={styles.priceLoading}>
                      <span className={styles.priceLoadingAmount} />
                      <span className={styles.priceLoadingMeta} />
                    </div>
                  )}
                </div>

                <button
                  className={styles.bookNowBtn}
                  disabled={isItemLoading}
                  onClick={() => handleBookNow(item)}
                >
                  {isItemLoading ? "LOADING..." : "SEE AVAILABILITY"}
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </motion.div>
  );
};

export default HotelGridView;
