"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import styles from "./TourListing.module.css";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import SearchResults from "../searchResult/SearchResults";
import CreateWishlistModal from "@/shared/components/wishlistModals/CreateWishlistModal";
import SaveToWishlistModal from "@/shared/components/wishlistModals/SaveToWishlistModal";
import {
  HOTEL_SEARCH_RESULTS_EVENT,
  HOTEL_SEARCH_RESULTS_KEY,
} from "@/shared/services/hotelSearch";

const parseSocketValue = (value) => {
  if (typeof value !== "string") return value;

  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

export const getMessageData = (payload = {}) => {
  const parsedPayload = parseSocketValue(payload);
  const data = parseSocketValue(parsedPayload?.data);

  return data || parsedPayload;
};

export const getMessageContent = (payload = {}) => {
  const data = getMessageData(payload);
  const content = parseSocketValue(data?.content || data?.data?.content);

  return content || data;
};

export const getHotelsFromMessage = (payload = {}) => {
  const data = getMessageData(payload);
  const content = getMessageContent(payload);
  const nestedData = parseSocketValue(data?.data);
  const nestedDataContent = parseSocketValue(nestedData?.content);
  const nestedContent = parseSocketValue(content?.content || content?.data?.content);
  const mergedHotels =
    data?.mergedHotels ||
    content?.mergedHotels ||
    data?.hotels?.mergedHotels ||
    content?.hotels?.mergedHotels ||
    nestedData?.mergedHotels ||
    nestedDataContent?.mergedHotels ||
    nestedContent?.mergedHotels;
  const curatedHotels =
    content?.curatedHotels ||
    data?.curatedHotels ||
    data?.hotels?.curatedHotels ||
    content?.hotels?.curatedHotels ||
    nestedData?.curatedHotels ||
    nestedDataContent?.curatedHotels ||
    nestedContent?.curatedHotels;

  if (Array.isArray(mergedHotels) && mergedHotels.length) {
    return { source: "merged", hotels: mergedHotels };
  }

  if (Array.isArray(curatedHotels) && curatedHotels.length) {
    return { source: "curated", hotels: curatedHotels };
  }

  if (Array.isArray(data?.hotels) && data.hotels.length) {
    return { source: "hotels", hotels: data.hotels };
  }

  if (Array.isArray(content?.hotels) && content.hotels.length) {
    return { source: "hotels", hotels: content.hotels };
  }

  return { source: "", hotels: [] };
};

export const getHotelImage = (hotel = {}) => {
  const image =
    hotel.image ||
    hotel.imageUrl ||
    hotel.thumbnail ||
    hotel.heroImage ||
    hotel.mainImage ||
    hotel.images?.[0]?.url ||
    hotel.images?.[0]?.imageUrl ||
    hotel.images?.[0];

  return typeof image === "string" && image ? image : "/hotelList/hotelCardImg.png";
};

const findPriceValue = (value, depth = 0, visitedCount = { current: 0 }) => {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number" || typeof value === "string") return value;
  if (depth > 4 || typeof value !== "object" || visitedCount.current > 80) {
    return null;
  }

  visitedCount.current += 1;

  const priceKeys = [
    "total",
    "totalRate",
    "finalRate",
    "netRate",
    "amount",
    "price",
    "minRate",
    "baseRate",
    "publishedRate",
    "sellingRate",
    "roomRate",
    "rate",
  ];

  if (Array.isArray(value)) {
    for (const nestedValue of value.slice(0, 5)) {
      const price = findPriceValue(nestedValue, depth + 1, visitedCount);
      if (price !== null) return price;
    }

    return null;
  }

  for (const key of priceKeys) {
    const nestedValue = findPriceValue(value[key], depth + 1, visitedCount);
    if (nestedValue !== null) return nestedValue;
  }

  for (const nestedValue of Object.values(value).slice(0, 20)) {
    const price = findPriceValue(nestedValue, depth + 1, visitedCount);
    if (price !== null) return price;
  }

  return null;
};

export const formatHotelPrice = (hotel = {}) => {
  const price = [
    hotel.price,
    hotel.amount,
    hotel.minRate,
    hotel.totalRate,
    hotel.baseRate,
    hotel.rate,
    hotel.pricing,
    hotel.rates,
    hotel.rooms,
  ].reduce((foundPrice, candidate) => {
    if (foundPrice !== null) return foundPrice;
    return findPriceValue(candidate);
  }, null);

  if (price === null || price === undefined || price === "") return "₹ --";

  const numericPrice = Number(price);
  if (!Number.isNaN(numericPrice)) {
    return `₹ ${numericPrice.toLocaleString("en-IN")}`;
  }

  return String(price).startsWith("₹") ? String(price) : `₹ ${price}`;
};

export const getHotelRating = (hotel = {}) => {
  const rating = Number(hotel.starRating || hotel.rating || hotel.stars || 5);
  if (!Number.isFinite(rating)) return 5;
  return Math.max(0, Math.min(5, Math.round(rating)));
};

export const getHotelCoordinates = (hotel = {}) => {
  const coordinates =
    hotel.coordinates ||
    hotel.geoCode ||
    hotel.geo_code ||
    hotel.location?.coordinates ||
    hotel.location?.geoCode ||
    {};
  const lat =
    coordinates.lat ??
    coordinates.latitude ??
    hotel.lat ??
    hotel.latitude ??
    hotel.geoLat;
  const lng =
    coordinates.lng ??
    coordinates.long ??
    coordinates.longitude ??
    hotel.lng ??
    hotel.long ??
    hotel.longitude ??
    hotel.geoLong;
  const latitude = Number(lat);
  const longitude = Number(lng);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  return { latitude, longitude };
};

export const normalizeHotelCard = (hotel = {}, index = 0) => {
  const addressParts = [
    hotel.address,
    hotel.addressLine1,
    hotel.locality,
    hotel.city,
    hotel.locationName,
    hotel.country,
  ]
    .filter(Boolean)
    .map((part) => String(part).trim());

  const coordinates = getHotelCoordinates(hotel);

  return {
    id:
      hotel.id ||
      hotel.hotelId ||
      hotel.api_hotel_id ||
      hotel.hotelCode ||
      `${hotel.name || "hotel"}-${index}`,
    image: getHotelImage(hotel),
    route: addressParts.join(", ") || "Address not available",
    title: hotel.name || hotel.hotelName || hotel.title || "Hotel",
    price: formatHotelPrice(hotel),
    rating: getHotelRating(hotel),
    latitude: coordinates?.latitude,
    longitude: coordinates?.longitude,
    raw: hotel,
  };
};

const HOTEL_TERMINAL_MESSAGE_TYPES = new Set([
  "HOTEL_INIT_COMPLETE",
  "HOTEL_STREAM_FAILED",
  "HOTEL_INIT_ERROR",
  "HOTEL_MERGED_RESPONSE",
]);

export const isHotelTerminalPayload = (payload = {}) => {
  const data = getMessageData(payload);
  const type = payload?.type || data?.type;
  const status = data?.status || getMessageContent(payload)?.status;

  return (
    HOTEL_TERMINAL_MESSAGE_TYPES.has(type) ||
    status === "completed" ||
    status === "failed"
  );
};

const skeletonCards = Array.from({ length: 6 }, (_, index) => index);
const FIRST_HOTEL_RENDER_BATCH_SIZE = 40;
const HOTEL_RENDER_BATCH_SIZE = 300;

const TourListing = () => {
  const searchParams = useSearchParams();
  const hotelSearchChannel = searchParams.get("channel") || "";
  const [likedTours, setLikedTours] = useState([]);
  const [viewType, setViewType] = useState("grid");
  const [expandedId, setExpandedId] = useState(null);

  const [isCreateWishlistOpen, setIsCreateWishlistOpen] = useState(false);
  const [isSaveWishlistOpen, setIsSaveWishlistOpen] = useState(false);
  const [wishlists, setWishlists] = useState([]); // fetch later from backend
  const [selectedTourId, setSelectedTourId] = useState(null);
  const [hotelResults, setHotelResults] = useState([]);
  const [totalHotelResults, setTotalHotelResults] = useState(0);
  const [isHotelLoading, setIsHotelLoading] = useState(Boolean(hotelSearchChannel));
  const [hotelResultSource, setHotelResultSource] = useState("");
  const hotelResultSourceRef = useRef("");
  const normalizeRunRef = useRef(0);

  const handleHeartClick = (tourId) => {
    setSelectedTourId(tourId);

    if (!wishlists.length) {
      setIsCreateWishlistOpen(true);
    } else {
      setIsSaveWishlistOpen(true);
    }
  };

  const handleCreateWishlist = (name) => {
    const newWishlist = {
      id: Date.now(),
      name,
      count: 0,
    };

    setWishlists((prev) => [...prev, newWishlist]);

    setIsCreateWishlistOpen(false);
    setIsSaveWishlistOpen(true);
  };
  const router = useRouter();
  const handleBookNow = () => {
    router.push("/hotel-detail"); // 👈 your page route
  };
  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const rating = 5;

  useEffect(() => {
    normalizeRunRef.current += 1;
    setHotelResults([]);
    setTotalHotelResults(0);
    setIsHotelLoading(Boolean(hotelSearchChannel));
    setHotelResultSource("");
    hotelResultSourceRef.current = "";

    const normalizeHotelsInBatches = (hotels) => {
      const runId = normalizeRunRef.current + 1;
      normalizeRunRef.current = runId;
      setTotalHotelResults(hotels.length);

      const firstBatch = hotels
        .slice(0, FIRST_HOTEL_RENDER_BATCH_SIZE)
        .map((hotel, index) => normalizeHotelCard(hotel, index));

      setHotelResults(firstBatch);
      setIsHotelLoading(false);

      let nextIndex = FIRST_HOTEL_RENDER_BATCH_SIZE;

      const appendNextBatch = () => {
        if (normalizeRunRef.current !== runId || nextIndex >= hotels.length) {
          return;
        }

        const batchStart = nextIndex;
        const batch = hotels
          .slice(batchStart, batchStart + HOTEL_RENDER_BATCH_SIZE)
          .map((hotel, index) => normalizeHotelCard(hotel, batchStart + index));

        nextIndex += HOTEL_RENDER_BATCH_SIZE;
        setHotelResults((prev) => [...prev, ...batch]);

        if (nextIndex < hotels.length) {
          window.setTimeout(appendNextBatch, 0);
        }
      };

      window.setTimeout(appendNextBatch, 0);
    };

    const applyHotelResults = (payload) => {
      if (payload?.channel && payload.channel !== hotelSearchChannel) {
        return;
      }

      const nextResults = getHotelsFromMessage(payload);
      console.log("Hotel result source:", {
        source: nextResults.source,
        count: nextResults.hotels.length,
      });

      if (!nextResults.hotels.length) {
        if (isHotelTerminalPayload(payload)) {
          setIsHotelLoading(false);
        }
        return;
      }
      if (
        hotelResultSourceRef.current === "merged" &&
        nextResults.source !== "merged"
      ) {
        return;
      }

      normalizeHotelsInBatches(nextResults.hotels);
      hotelResultSourceRef.current = nextResults.source;
      setHotelResultSource(nextResults.source);
    };

    const handleHotelResults = (event) => {
      applyHotelResults(event.detail);
    };

    window.addEventListener(HOTEL_SEARCH_RESULTS_EVENT, handleHotelResults);

    const cachedResults = window.sessionStorage.getItem(HOTEL_SEARCH_RESULTS_KEY);
    if (cachedResults) {
      try {
        const cachedPayload = JSON.parse(cachedResults);
        if (!hotelSearchChannel || cachedPayload?.channel === hotelSearchChannel) {
          applyHotelResults(cachedPayload);
        }
      } catch {
        // Ignore stale malformed session data.
      }
    }

    return () => {
      normalizeRunRef.current += 1;
      window.removeEventListener(HOTEL_SEARCH_RESULTS_EVENT, handleHotelResults);
    };
  }, [hotelSearchChannel]);

  const displayHotels = useMemo(() => hotelResults, [hotelResults]);

  const toggleLike = (id) => {
    setLikedTours((prev) =>
      prev.includes(id)
        ? prev.filter((itemId) => itemId !== id)
        : [...prev, id],
    );
  };

  return (
    <>
      <section className={styles.tourListSection}>
        <SearchResults
          viewType={viewType}
          setViewType={setViewType}
          totalResults={totalHotelResults || displayHotels.length}
        />

        <AnimatePresence mode="popLayout">
          {viewType === "grid" && (
            <motion.div
              className={styles.gridWrapper}
              key="grid"
              layout
              initial={{ opacity: 0, y: 0 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 0 }}
              transition={{ duration: 0.55, ease: "easeInOut" }}
            >
              {!displayHotels.length &&
                isHotelLoading &&
                skeletonCards.map((item) => (
                  <div
                    key={`hotel-grid-skeleton-${item}`}
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
              {displayHotels.map((item, index) => (
                <div
                  key={item?.id || item?.api_hotel_id || item?.title || `hotel-grid-${index}`}
                  className={styles.gridCard}
                >
                  <div className={styles.gridCardImage}>
                    <img
                      className={styles.ListViewCardImage}
                      src={item.image}
                      alt={item.title}
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
                          likedTours.includes(item.id)
                            ? "/icons/heartIconFilled.svg"
                            : "/icons/heartIcon.svg"
                        }
                        alt="wishlist"
                        className={`${styles.heartIcon} ${styles.ListViewHeartIcon}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLike(item.id); // change icon
                          handleHeartClick(item.id); // open modal
                        }}
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
                                  index < (item.rating ?? rating)
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
                            <span></span>
                          </div>
                          <div className={styles.featureItem}>
                            <img src="/icons/Wifi.svg" alt="" />
                            <p>Wifi</p>
                            <span></span>
                          </div>
                          <div className={styles.featureItem}>
                            <img src="/icons/Kitchen.svg" alt="" />
                            <p>Kitchen</p>
                            <span></span>
                          </div>
                          <div className={styles.featureItem}>
                            <img src="/icons/Pool.svg" alt="" />
                            <p>Pool</p>
                            <span></span>
                          </div>
                          <div className={styles.featureItem}>
                            <img src="/icons/pool.svg" alt="mixer" />
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
                        <div className={styles.priceSec}>{item.price}</div>

                        <div className={styles.totalPrice}>
                          <span>1 night, 2 adults</span>
                        </div>
                      </div>

                      <button
                        className={styles.bookNowBtn}
                        onClick={handleBookNow}
                      >
                        SEE AVAILABILITY
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
            // </div>
          )}

          {viewType === "list" && (
            <motion.div
              className={styles.ListViewWrapper}
              key="list"
              layout
              initial={{ opacity: 0, y: 0 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 0 }}
              transition={{ duration: 0.55, ease: "easeInOut" }}
            >
              {!displayHotels.length &&
                isHotelLoading &&
                skeletonCards.map((item) => (
                  <div
                    key={`hotel-list-skeleton-${item}`}
                    className={`${styles.ListViewCardContainer} ${styles.skeletonCard}`}
                  >
                    <div className={styles.skeletonListImage}></div>
                    <div className={styles.skeletonListContent}>
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
              {displayHotels.map((item, index) => (
                <motion.div
                  className={styles.ListViewCardContainer}
                  key={item.id}
                  layoutId={index < 2 ? `card-${item.id}` : undefined}
                >
                  <div className={styles.ListViewCardImageContainer}>
                    <motion.img
                      layoutId={index < 2 ? `image-${item.id}` : undefined}
                      src={item.image}
                      alt={item.title}
                      className={styles.ListViewCardImage}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    />

                    <div
                      className={`${styles.cardItemHeader} ${styles.ListViewCardHeader}`}
                    >
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
                        className={styles.heartIcon}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLike(item.id); // change icon
                          handleHeartClick(item.id); // open modal
                        }}
                      />
                    </div>
                  </div>

                  <div className={styles.ListViewCardText}>
                    <div className={styles.cartListTop}>
                      <div className={styles.ListViewCardTextTop}>
                        <div className={styles.topTextHead}>
                          <div className={styles.rating}>
                            {[...Array(5)].map((_, index) => (
                              <img
                                key={index}
                                src={
                                  index < (item.rating ?? rating)
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
                        <div
                          className={`${styles.priceSec} ${styles.ListViewPriceSec}`}
                        >
                          {item.price}
                        </div>

                        <div
                          className={`${styles.totalPrice} ${styles.ListViewTotalPrice}`}
                        >
                          <span>1 night, 2 adults</span>
                        </div>
                      </div>

                      <button
                        className={`${styles.bookNowBtn} ${styles.ListViewBookNowBtn}`}
                        onClick={handleBookNow}
                      >
                        SEE AVAILABILITY
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </section>
      <section className={styles.tourListSectionMobileView}></section>

      <CreateWishlistModal
        isOpen={isCreateWishlistOpen}
        onClose={() => setIsCreateWishlistOpen(false)}
        onCreate={handleCreateWishlist}
        type="hotel"
        ids={[]}
      />

      <SaveToWishlistModal
        onCreateNew={() => setIsCreateWishlistOpen(true)}
        isOpen={isSaveWishlistOpen}
        wishlists={wishlists}
        onClose={() => setIsSaveWishlistOpen(false)}
      />
    </>
  );
};

export default TourListing;
