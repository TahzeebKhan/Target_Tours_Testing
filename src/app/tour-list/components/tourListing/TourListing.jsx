"use client";
import React, { useEffect, useState } from "react";
import styles from "./TourListing.module.css";
import SearchResults from "../searchResult/SearchResults";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { ChevronRight, Pencil, X } from "lucide-react";
import MobileFilterWrapper from "../mobileFilterWrapper/MobileFilterWrapper";
import SortBySheet from "../sortBySheet/SortBySheet";
import PreferencesSection from "../preferencesSection/PreferencesSection";
import SelectDestination from "@/features/profile/components/selectDestination";
import SelectTravellerProfile from "@/features/profile/components/selectTravellerProfile";
import SelectPreferences from "@/features/profile/components/selectPreferences";
import { useInfiniteTours } from "@/features/tours/hooks/useInfiniteTours";
import { useToursData } from "@/features/tours/hooks/useToursData";
import CreateWishlistModal from "@/shared/components/wishlistModals/CreateWishlistModal";
import SaveToWishlistModal from "@/shared/components/wishlistModals/SaveToWishlistModal";

const LoadingCards = ({ viewType = "grid", count = 4 }) =>
  Array.from({ length: count }).map((_, index) => (
    <div
      className={
        viewType === "grid"
          ? styles.skeletonCard
          : styles.skeletonListCard
      }
      key={`tour-loading-${viewType}-${index}`}
    >
      <div className={styles.skeletonImage} />
      <div className={styles.skeletonContent}>
        <span className={styles.skeletonLine} />
        <span className={`${styles.skeletonLine} ${styles.skeletonLineWide}`} />
        <span className={styles.skeletonLine} />
        <div className={styles.skeletonFooter}>
          <span className={styles.skeletonLine} />
          <span className={styles.skeletonButton} />
        </div>
      </div>
    </div>
  ));

const SELECTED_TOUR_OPTION_KEY = "selectedTourOption";

const TourListing = ({ filters, page, setPage, onDataLoaded }) => {
  const [likedTours, setLikedTours] = useState([]);
  const [viewType, setViewType] = useState("grid");
  const [expandedId, setExpandedId] = useState(null);
  const router = useRouter();
  const [activePreferenceView, setActivePreferenceView] = useState(null);
  const [openFilter, setOpenFilter] = useState(false);
  const [openSortByFilter, setOpenSortByFilter] = useState(false);
  const [openPreferencesFilter, setOpenPreferencesFilter] = useState(false);
  const [showStickyHeader, setShowStickyHeader] = useState(false);

  const [isCreateWishlistOpen, setIsCreateWishlistOpen] = useState(false);
  const [isSaveWishlistOpen, setIsSaveWishlistOpen] = useState(false);
  const [wishlists, setWishlists] = useState([]); // fetch later from backend
  const [selectedTourId, setSelectedTourId] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);

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

  const {
    data,
    isLoading,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    isError,
  } = useInfiniteTours({ filters });

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 184) {
        setShowStickyHeader(true); // 👈 scroll ke baad show
      } else {
        setShowStickyHeader(false); // 👈 top par hide
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const normalizePackageKey = (item) =>
    [item?.title, item?.route, item?.days]
      .filter(Boolean)
      .join("|")
      .toLowerCase();

  const getFlightsTotalPrice = (item) => {
    const storedTotal = Number(item?.flightsTotalPrice || 0);
    if (Number.isFinite(storedTotal) && storedTotal > 0) return storedTotal;

    const flights = item?.raw?.flights || item?.flights || [];

    if (!Array.isArray(flights)) return 0;

    return flights.reduce((total, flight) => {
      const amount = Number(flight?.price?.amount || 0);
      return Number.isFinite(amount) ? total + amount : total;
    }, 0);
  };

  const getExplicitOptionPrice = (item, withFlight) => {
    const price = withFlight
      ? item?.withFlightPrice || item?.raw?.with_flight_price
      : item?.withoutFlightPrice || item?.raw?.without_flight_price;
    const amount = Number(price || 0);

    return Number.isFinite(amount) ? amount : 0;
  };

  const getPackageOptions = (item) => {
    const selectedKey = normalizePackageKey(item);
    const matchedOptions = tourData.filter(
      (tour) => normalizePackageKey(tour) === selectedKey
    );
    const options = matchedOptions.length ? matchedOptions : [item];
    const withFlightOption =
      options.find((option) => option.with_flight && Number(option.startedPrice) > 0) ||
      options.find((option) => option.with_flight) ||
      options.find((option) => getFlightsTotalPrice(option) > 0);
    const flightPriceSource =
      options.find((option) => getFlightsTotalPrice(option) > 0) ||
      withFlightOption;
    const flightTotalPrice = getFlightsTotalPrice(flightPriceSource);
    const hasExplicitFlightPrices =
      getExplicitOptionPrice(withFlightOption, true) > 0 ||
      getExplicitOptionPrice(withFlightOption, false) > 0;

    if (withFlightOption && (flightTotalPrice > 0 || hasExplicitFlightPrices)) {
      const pricedFlightOption = {
        ...withFlightOption,
        id: item.id,
        raw: item.raw || withFlightOption.raw,
        flights: withFlightOption.flights?.length
          ? withFlightOption.flights
          : flightPriceSource?.flights || flightPriceSource?.raw?.flights || [],
        flightsTotalPrice: flightTotalPrice,
        withFlightPrice:
          withFlightOption.withFlightPrice || flightPriceSource?.withFlightPrice || 0,
        withoutFlightPrice:
          withFlightOption.withoutFlightPrice || flightPriceSource?.withoutFlightPrice || 0,
      };

      return [
        {
          ...pricedFlightOption,
          optionKey: `${item.id}-without-flight`,
          with_flight: false,
        },
        {
          ...pricedFlightOption,
          optionKey: `${item.id}-with-flight`,
          with_flight: true,
        },
      ];
    }

    return [...options].sort((a, b) => {
      if (a.with_flight === b.with_flight) return a.startedPrice - b.startedPrice;
      return a.with_flight ? 1 : -1;
    });
  };

  const openPackageOptions = (item) => {
    setSelectedPackage(item);
  };

  const closePackageOptions = () => {
    setSelectedPackage(null);
  };

  const handleBookNow = (id, withFlight, selectedPrice) => {
    const selectedWithFlight = Boolean(withFlight);
    const params = new URLSearchParams({
      id: String(id),
      with_flight: String(selectedWithFlight),
    });

    if (Number.isFinite(selectedPrice) && selectedPrice > 0) {
      params.set("selected_price", String(selectedPrice));
    }

    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(
        SELECTED_TOUR_OPTION_KEY,
        JSON.stringify({
          id,
          with_flight: selectedWithFlight,
          selected_price: selectedPrice,
        })
      );
    }

    closePackageOptions();
    router.push(`/tour-details?${params.toString()}`);
  };

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const toggleLike = (id) => {
    setLikedTours((prev) =>
      prev.includes(id)
        ? prev.filter((itemId) => itemId !== id)
        : [...prev, id],
    );
  };

  const { tourData, meta } = useToursData({ data });
  const showLoadingCards = isLoading || (isFetching && !isFetchingNextPage);
  const hasNoResults = !showLoadingCards && tourData.length === 0;
  const totalResults = Number(meta?.pagination?.total ?? tourData.length) || 0;
  const loadedCount = tourData.length;
  const startResult = loadedCount > 0 ? 1 : 0;
  const endResult = totalResults > 0 ? Math.min(loadedCount, totalResults) : 0;

  useEffect(() => {
    if (meta && onDataLoaded) {
      onDataLoaded(meta);
    }
  }, [meta, onDataLoaded]);

  useEffect(() => {
    if (!selectedPackage) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [selectedPackage]);

  useEffect(() => {
    const onScroll = () => {
      const scrollHeight =
        document.documentElement?.scrollHeight || document.body.offsetHeight;
      const hasReachedBottom =
        window.innerHeight + window.scrollY >= scrollHeight - 300;

      if (
        hasReachedBottom &&
        hasNextPage &&
        !isFetchingNextPage &&
        !isFetching
      ) {
        fetchNextPage();
      }
    };

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, isFetching]);

  const truncateText = (text = "", maxLength = 29) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
  };

  const formatPrice = (amount) => {
    if (!Number.isFinite(amount) || amount <= 0) return "N/A";
    return `₹ ${amount.toLocaleString("en-IN")}`;
  };

  const getPackageOptionAmount = (option) => {
    const explicitPrice = getExplicitOptionPrice(option, option.with_flight);
    if (explicitPrice > 0) return explicitPrice;

    const startedPrice = Number(option.startedPrice || 0);
    return option.with_flight
      ? startedPrice
      : startedPrice - getFlightsTotalPrice(option);
  };

  const getPackageOptionPrice = (option) => {
    return formatPrice(getPackageOptionAmount(option));
  };

  return (
    <>
      <section className={styles.tourListSection}>
        <SearchResults
          viewType={viewType}
          setViewType={setViewType}
          startResult={startResult}
          endResult={endResult}
          totalResults={totalResults}
        />

        <AnimatePresence mode="popLayout">
          {viewType === "grid" && (
            <motion.div
              className={styles.cardContainer}
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {showLoadingCards ? (
                <LoadingCards viewType="grid" count={4} />
              ) : hasNoResults ? (
                <div className={styles.emptyState}>No package found</div>
              ) : (
                tourData.map((item, index) => (
                <motion.div
                  className={styles.card}
                  onClick={() => openPackageOptions(item)}
                  key={item.id}
                  layoutId={index < 2 ? `card-${item.id}` : undefined}
                >
                  <motion.img
                    layoutId={index < 2 ? `image-${item.id}` : undefined}
                    className={styles.itemImage}
                    src={item.image}
                    alt={item.title}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  />

                  <div className={styles.cardItems}>
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
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLike(item.id); // change icon
                          handleHeartClick(item.id); // open modal
                        }}
                      />
                    </div>

                    <div className={styles.cardItemCenterTextContainer}>
                      <div className={styles.cardItemCenterText}>
                        <p className={styles.cardItemCenterTextPara}>
                          {item.route}
                        </p>
                        <h4 className={styles.cardItemCenterTextHeading}>
                          {truncateText(item.title, 31)}
                        </h4>
                      </div>

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
                            FROM <strong>{item.price}</strong>{" "}
                            <span>/ PERSON</span>
                          </div>

                          <button
                            className={styles.viewDetails}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleExpand(item.id);
                            }}
                          >
                            VIEW DETAILS
                            <img
                              src="/icons/smallDropArrow.svg"
                              alt=""
                              style={{
                                transform:
                                  expandedId === item.id
                                    ? "rotate(180deg)"
                                    : "rotate(0deg)",
                                transition: "0.3s",
                              }}
                            />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <AnimatePresence>
                    {expandedId === item.id && (
                      <motion.div
                        className={styles.expandableContainer}
                        initial={{ height: 0, opacity: 0, y: 0 }}
                        animate={{ height: "auto", opacity: 1, y: 0 }}
                        exit={{ height: 0, opacity: 0, y: 0 }}
                        transition={{ duration: 0.35, ease: "easeInOut" }}
                      >
                        <div className={styles.expandableContent}>
                          <div className={styles.expandableTopContainer}>
                            <div className={styles.expandableTop}>
                              <h3 className={styles.expandableTopHeading}>
                                Package Inclusions
                              </h3>
                              <ul className={styles.list}>
                                  {item?.package_inclusion_tags?.map((val, index) => (
                                    <div key={index} className={styles.tag}>
                                      {val}
                                    </div>
                                  ))}
                                {/* <li>Round Trip Flights</li>
                                <li>4 Star Hotels</li>
                                <li>Airport Transfers</li>
                                <li>Intercity Car Transfers</li> */}
                              </ul>
                            </div>
                            <div className={styles.expandableCenter}>
                              <div className={styles.expandableRow}>
                                {item?.package_inclusion?.map(
                                  (inclusion, index) => (
                                    <div className={styles.expandableItem}>
                                      <img src="/icons/checkIcon.svg" alt="" />
                                      <span>{inclusion.description}</span>
                                    </div>
                                  ),
                                )}
                              </div>
                              {/* <div className={styles.expandableRow}>
                                <div className={styles.expandableItem}>
                                  <img src="/icons/checkIcon.svg" alt="" />
                                  <span>Banff Gondola Ride</span>
                                </div>
                                <div className={styles.expandableItem}>
                                  <img src="/icons/checkIcon.svg" alt="" />
                                  <span>Lake Louise Scenic Walk</span>
                                </div>
                              </div> */}
                              {/* <div className={styles.expandableRow}>
                                <div className={styles.expandableItem}>
                                  <img src="/icons/checkIcon.svg" alt="" />
                                  <span>Lake Louise Scenic Walk</span>
                                </div>
                              </div> */}
                            </div>
                          </div>
                          <div className={styles.hr}></div>
                          <div className={styles.expandableFooter}>
                            <div className={styles.expandableFooterText}>
                              Total <span>{item.price}</span>
                            </div>
                            <button
                              className={styles.bookNow}
                              onClick={(e) => {
                                e.stopPropagation();
                                openPackageOptions(item);
                              }}
                            >
                              BOOK NOW
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
                ))
              )}
            </motion.div>
          )}

          {viewType === "list" && (
            <motion.div
              className={styles.ListViewWrapper}
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {showLoadingCards ? (
                <LoadingCards viewType="list" count={3} />
              ) : hasNoResults ? (
                <div className={styles.emptyState}>No package found</div>
              ) : (
                tourData.map((item, index) => (
                <motion.div
                  className={styles.ListViewCardContainer}
                  key={item.id}
                  onClick={() => openPackageOptions(item)}
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
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLike(item.id); // change icon
                          handleHeartClick(item.id); // open modal
                        }}
                      />
                    </div>
                  </div>

                  <motion.div
                    className={styles.ListViewCardText}
                    initial={
                      index === 0
                        ? { clipPath: "inset(0 100% 0 0)" }
                        : undefined
                    }
                    animate={
                      index === 0 ? { clipPath: "inset(0 0% 0 0)" } : undefined
                    }
                    exit={
                      index === 0
                        ? { clipPath: "inset(0 100% 0 0)" }
                        : undefined
                    }
                    transition={{
                      duration: 0.3,
                      ease: [0.25, 0.46, 0.45, 0.94],
                    }}
                  >
                    <div className={styles.cartListTop}>
                      <div className={styles.ListViewCardTextTop}>
                        <div className={styles.topTextHead}>
                          <h2>{item.title}</h2>

                          <div className={styles.topTextHeadAddress}>
                            <img src="/icons/blackAddress.svg" alt="" />
                            <span>{item.route}</span>
                          </div>
                        </div>

                        <div className={styles.tagsContainer}>
                            {item?.package_inclusion_tags?.map((val, index) => (
                              <div key={index} className={styles.tag}>
                                {val}
                              </div>
                            ))}
                     
                          {/* <div className={styles.tag}>4 Star Hotels</div> */}
                          {/* <div className={styles.tag}>Airport Transfers</div> */}
                          {/* <div className={styles.tag}>
                            Intercity Car Transfers
                          </div> */}
                        </div>

                        <div className={styles.ListViewCardTextTopBottom}>
                          {item?.package_inclusion?.map((inclusion, index) => (
                            <div className={styles.bottomItem}>
                              <img src="/icons/checkIcon.svg" alt="" />
                              {inclusion.description}
                            </div>
                          ))}
                          {/*
                          <div className={styles.bottomItem}>
                            <img src="/icons/checkIcon.svg" alt="" />
                            Icefields Parkway Glacier Tour
                          </div> */}
                        </div>
                      </div>

                      <div className={styles.infoGrid}>
                        <div className={styles.infoRowGrid}>
                          <div className={styles.infoItem}>{item.days}</div>
                          <div className={styles.infoItem}>{item.meals}</div>
                        </div>

                        <div className={styles.infoRowGrid}>
                          <div className={styles.infoItem}>{item.hotel}</div>
                          <div className={styles.infoItem}>
                            {item.activities}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className={styles.ListViewCardTextBottom}>
                      <div className={styles.priceContainer}>
                        <div className={styles.priceSec}>
                          {item.price}
                          <span>/PERSON</span>
                        </div>

                        <div className={styles.totalPrice}>
                          Total Price
                          <span>₹ 1,66,945</span>
                        </div>
                      </div>

                      <button
                        className={styles.bookNowBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          openPackageOptions(item);
                        }}
                      >
                        BOOK NOW
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </section>
      <section className={styles.tourListMobileSection}>
        <div
          className={`${styles.tripDetailsHeader} 
              ${showStickyHeader ? styles.stickyVisible : styles.stickyHidden}`}
        >
          <div className={styles.mainCotainer}>
            <img src="/icons/leftArrowTrip.svg" alt="" />
            <div
              className={`${styles.TripCardHeader} ${styles.TripCardHeaderNav}`}
            >
              <div className={styles.TripCardHeaderDetails}>
                <p className={styles.TripCardHeaderDetailsItemText}>
                  New Delhi
                </p>
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
                  <span className={styles.navDot}></span>1 Traveller
                </p>
                <p>
                  <span className={styles.navDot}></span>Economy
                </p>
              </div>
            </div>
          </div>
          <Pencil className={styles.editIcon} color="#FFFFFF" size={16} />
        </div>

        <div className={styles.tourListMobileWrapper}>
          <div className={styles.filterContainer}>
            <button
              className={styles.filterCard}
              onClick={() => setOpenSortByFilter(true)}
            >
              Sort by
            </button>
            {openSortByFilter && (
              <SortBySheet
                open={openSortByFilter}
                onClose={() => setOpenSortByFilter(false)}
              />
            )}
            <button
              className={styles.filterCard}
              onClick={() => setOpenFilter(true)}
            >
              FILTERS
              <img src="/icons/filterIcon.svg" alt="" />
            </button>
            {openFilter && (
              <MobileFilterWrapper open={openFilter} setOpen={setOpenFilter} />
            )}
            <button
              className={styles.filterCard}
              onClick={() => setOpenPreferencesFilter(true)}
            >
              PREFERENCES
            </button>
            {openPreferencesFilter && (
              <PreferencesSection
                onClose={() => setOpenPreferencesFilter(false)}
                onSelect={(view) => {
                  setOpenPreferencesFilter(false);
                  setActivePreferenceView(view);
                }}
              />
            )}
          </div>

          <div
            className={`${styles.ListViewWrapper} ${styles.ListViewWrapperMobile}`}
          >
            {showLoadingCards ? (
              <LoadingCards viewType="list" count={3} />
            ) : hasNoResults ? (
              <div className={styles.emptyState}>No package found</div>
            ) : (
              tourData.map((item, index) => (
              <div
                className={`${styles.ListViewCardContainer} ${styles.ListViewCardContainerMobile}`}
                key={item.id}
                onClick={() => openPackageOptions(item)}
              >
                <div
                  className={`${styles.ListViewCardImageContainer}  ${styles.ListViewCardImageContainerMobile}`}
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    className={styles.ListViewCardImage}
                  />

                  <div
                    className={`${styles.cardItemHeader} ${styles.ListViewCardHeader}`}
                  >
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
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLike(item.id); // change icon
                        handleHeartClick(item.id); // open modal
                      }}
                    />
                  </div>
                </div>

                <motion.div
                  className={`${styles.ListViewCardTextMobile}`}
                  initial={
                    index === 0 ? { clipPath: "inset(0 100% 0 0)" } : undefined
                  }
                  animate={
                    index === 0 ? { clipPath: "inset(0 0% 0 0)" } : undefined
                  }
                  exit={
                    index === 0 ? { clipPath: "inset(0 100% 0 0)" } : undefined
                  }
                  transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                >
                  <div className={styles.cartListTop}>
                    <div className={`${styles.ListViewCardTextTopMobile} `}>
                      <div className={styles.topTextHead}>
                        <h2>{item.title}</h2>

                        <div className={styles.topTextHeadAddress}>
                          <img src="/icons/blackAddress.svg" alt="" />
                          <span>{item.route}</span>
                        </div>
                      </div>

                      <div className={styles.tagsContainerMobile}>
                      {item?.package_inclusion_tags?.map((val, index) => (
  <div key={index} className={styles.tag}>
    {val}
  </div>
))}
     
                        {/* <div className={styles.tag}>Round Trip Flights</div>
                        <div className={styles.tag}>4 Star Hotels</div>
                        <div className={styles.tag}>Airport Transfers</div>
                        <div className={styles.tag}>
                          Intercity Car Transfers
                        </div> */}
                      </div>

                      <div className={styles.ListViewCardTextTopBottomMobile}>
                        {item?.package_inclusion?.map((inclusion, index) => (
                          <div className={styles.bottomItem}>
                            <img src="/icons/checkIcon.svg" alt="" />
                            {inclusion.description}
                          </div>
                        ))}
                        {/* <div className={styles.bottomItem}>
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
                        </div> */}
                      </div>
                    </div>

                    <div className={styles.infoGrid}>
                      <div className={styles.infoRowGrid}>
                        <div className={styles.infoItem}>{item.days}</div>
                        <div className={styles.infoItem}>{item.meals}</div>
                      </div>

                      <div className={styles.infoRowGrid}>
                        <div className={styles.infoItem}>{item.hotel}</div>
                        <div className={styles.infoItem}>{item.activities}</div>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`${styles.ListViewCardTextBottom} ${styles.ListViewCardTextBottomMobile}`}
                  >
                    <div className={styles.priceContainer}>
                      <div
                        className={`${styles.priceSec} ${styles.mobilePrice}`}
                      >
                        {item.price}
                        <span>/PERSON</span>
                      </div>

                      <div className={styles.totalPrice}>
                        Total Price
                        <span>₹1,66,945</span>
                      </div>
                    </div>

                    <button
                      className={styles.bookNowBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        openPackageOptions(item);
                      }}
                    >
                      BOOK NOW
                    </button>
                  </div>
                </motion.div>
              </div>
              ))
            )}
          </div>
        </div>

        {activePreferenceView === "DESTINATIONS" && (
          <SelectDestination onClose={() => setActivePreferenceView(null)} />
        )}

        {activePreferenceView === "TRAVELLER" && (
          <SelectTravellerProfile
            onClose={() => setActivePreferenceView(null)}
          />
        )}

        {activePreferenceView === "PREFERENCES" && (
          <SelectPreferences onClose={() => setActivePreferenceView(null)} />
        )}
      </section>

      <CreateWishlistModal
        isOpen={isCreateWishlistOpen}
        onClose={() => setIsCreateWishlistOpen(false)}
        onCreate={handleCreateWishlist}
        type="package"
        ids={selectedTourId ? [selectedTourId] : []}
      />

      <SaveToWishlistModal
        onCreateNew={() => setIsCreateWishlistOpen(true)}
        isOpen={isSaveWishlistOpen}
        wishlists={wishlists}
        onClose={() => setIsSaveWishlistOpen(false)}
      />

      <AnimatePresence>
        {selectedPackage && (
          <motion.div
            className={styles.optionOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closePackageOptions}
          >
            <motion.div
              className={styles.optionSheet}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className={styles.optionMedia}>
                <img src={selectedPackage.image} alt={selectedPackage.title} />
              </div>

              <div className={styles.optionHeader}>
                <h3>{selectedPackage.title}</h3>
                <button
                  type="button"
                  className={styles.optionClose}
                  onClick={closePackageOptions}
                  aria-label="Close package options"
                >
                  <X size={22} />
                </button>
              </div>

              <div className={styles.optionList}>
                {getPackageOptions(selectedPackage).map((option) => (
                  <button
                    type="button"
                    className={styles.optionCard}
                    key={option.optionKey || `${option.id}-${option.with_flight ? "with" : "without"}`}
                    onClick={() =>
                      handleBookNow(
                        option.id,
                        option.with_flight,
                        getPackageOptionAmount(option)
                      )
                    }
                  >
                    <div className={styles.optionText}>
                      <span>
                        Starting from
                        {option.fromCity ? ` - ${option.fromCity}` : ""}
                      </span>
                      <strong>
                        {option.with_flight ? "With Flight" : "Without Flight"}
                      </strong>
                    </div>

                    <div className={styles.optionPrice}>
                      <strong>{getPackageOptionPrice(option)}</strong>
                      <span>per person</span>
                    </div>

                    <ChevronRight className={styles.optionArrow} size={26} />
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default TourListing;
