import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import styles from "./HotelGridView.module.css";
import { HotelBenefits, HotelFacilities } from "../../TourListing";

const getHotelLoadingKey = (hotel = {}) =>
  hotel.id || hotel.hotelId || hotel.api_hotel_id || hotel.hotelCode || "";

const MOBILE_GRID_BREAKPOINT = 530;
const MOBILE_GRID_OVERSCAN_ROWS = 4;
const DEFAULT_GRID_ROW_HEIGHT = 520;
const DEFAULT_LIST_ROW_HEIGHT = 560;

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
  const gridRef = useRef(null);
  const measuredColumnsRef = useRef(0);
  const [viewport, setViewport] = useState({
    scrollY: 0,
    height: 0,
    width: 0,
  });
  const [rowHeight, setRowHeight] = useState(DEFAULT_GRID_ROW_HEIGHT);
  const skeletonCards = useMemo(
    () => Array.from({ length: 6 }, (_, index) => index),
    [],
  );
  const shouldShowEmptyState = showEmptyState && !isLoading && !tourData.length;
  const columns = viewport.width <= MOBILE_GRID_BREAKPOINT ? 1 : 2;

  useEffect(() => {
    let animationFrame = 0;

    const updateViewport = () => {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = window.requestAnimationFrame(() => {
        setViewport({
          scrollY: window.scrollY,
          height: window.innerHeight,
          width: window.innerWidth,
        });
      });
    };

    updateViewport();
    window.addEventListener("scroll", updateViewport, { passive: true });
    window.addEventListener("resize", updateViewport);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("scroll", updateViewport);
      window.removeEventListener("resize", updateViewport);
    };
  }, []);

  useEffect(() => {
    measuredColumnsRef.current = 0;
    setRowHeight(
      columns === 1 ? DEFAULT_LIST_ROW_HEIGHT : DEFAULT_GRID_ROW_HEIGHT,
    );
  }, [columns]);

  const virtualWindow = useMemo(() => {
    if (!tourData.length || !viewport.height || !gridRef.current) {
      return {
        startIndex: 0,
        endIndex: Math.min(tourData.length, 12),
        paddingTop: 0,
        paddingBottom: 0,
      };
    }

    const gridTop =
      gridRef.current.getBoundingClientRect().top + viewport.scrollY;
    const relativeScrollTop = Math.max(0, viewport.scrollY - gridTop);
    const totalRows = Math.ceil(tourData.length / columns);
    const startRow = Math.max(
      0,
      Math.floor(relativeScrollTop / rowHeight) - MOBILE_GRID_OVERSCAN_ROWS,
    );
    const visibleRowCount =
      Math.ceil(viewport.height / rowHeight) + MOBILE_GRID_OVERSCAN_ROWS * 2;
    const endRow = Math.min(totalRows, startRow + visibleRowCount);

    return {
      startIndex: startRow * columns,
      endIndex: Math.min(tourData.length, endRow * columns),
      paddingTop: startRow * rowHeight,
      paddingBottom: Math.max(0, (totalRows - endRow) * rowHeight),
    };
  }, [columns, rowHeight, tourData.length, viewport]);

  const visibleHotels = useMemo(
    () => tourData.slice(virtualWindow.startIndex, virtualWindow.endIndex),
    [tourData, virtualWindow.endIndex, virtualWindow.startIndex],
  );

  useLayoutEffect(() => {
    const grid = gridRef.current;
    if (
      !grid ||
      !visibleHotels.length ||
      measuredColumnsRef.current === columns
    ) {
      return;
    }

    const cards = Array.from(
      grid.querySelectorAll(`.${styles.gridCard}`),
    ).filter((card) => !card.classList.contains(styles.skeletonCard));
    if (!cards.length) return;

    const gap = Number.parseFloat(window.getComputedStyle(grid).rowGap) || 0;
    const measuredHeight =
      Math.max(...cards.slice(0, columns).map((card) => card.offsetHeight)) + gap;

    if (
      Number.isFinite(measuredHeight) &&
      measuredHeight > 0 &&
      Math.abs(measuredHeight - rowHeight) > 4
    ) {
      setRowHeight(measuredHeight);
    }
    measuredColumnsRef.current = columns;
  }, [columns, rowHeight, visibleHotels]);

  return (
    <motion.div
      ref={gridRef}
      className={styles.gridWrapper}
      key="grid"
      initial={{ opacity: 0, y: 0 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 0 }}
      transition={{ duration: 0.55, ease: "easeInOut" }}
      style={
        tourData.length
          ? {
              paddingTop: virtualWindow.paddingTop,
              paddingBottom: virtualWindow.paddingBottom,
            }
          : undefined
      }
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
      {visibleHotels.map((item, index) => {
        const itemIndex = virtualWindow.startIndex + index;
        const itemLoadingKey = getHotelLoadingKey(item);
        const isItemLoading = loadingHotelDetailsId === itemLoadingKey;

        return (
          <div
            key={
              item?.id ||
              item?.api_hotel_id ||
              item?.title ||
              `hotel-mobile-grid-${itemIndex}`
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
                {/* <div className={styles.headerLeft}>
                  <div className={styles.new}>New</div>
                  <div className={styles.private}>Flagship</div>
                </div> */}

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
